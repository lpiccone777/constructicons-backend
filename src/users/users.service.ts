// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario } from '@prisma/client';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  UserNotFoundException,
  UserByEmailNotFoundException,
  UserEmailConflictException,
  UserDependenciesException,
  UserPermissionException,
} from './exceptions';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { email },
        include: { roles: { include: { permisos: true } } },
      });

      return usuario;
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'usuario', 'consultar-por-email', {
        email,
      });
    }
  }

  async create(
    data: CreateUserDto,
    usuarioCreadorId?: number,
  ): Promise<Usuario> {
    try {
      // Verificar si ya existe un usuario con el mismo email
      const usuarioExistente = await this.prisma.usuario.findUnique({
        where: { email: data.email },
      });

      if (usuarioExistente) {
        throw new UserEmailConflictException(data.email);
      }

      // Verificar si el email es el superusuario designado
      const esSuperUsuario =
        data.email === 'asesorpicconel@gmail.com' || data.esSuperUsuario;

      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Preparar roles
      const rolesData = await Promise.all(
        (data.roles || ['user']).map(async (roleName) => {
          let role: any = await this.prisma.rol.findFirst({
            where: { nombre: roleName },
          });
          if (!role) {
            role = await this.prisma.rol.create({
              data: { nombre: roleName },
            });
          }
          return { id: role.id };
        }),
      );

      // Crear usuario
      const nuevoUsuario = await this.prisma.usuario.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          password: hashedPassword,
          estado: data.estado || 'activo',
          esSuperUsuario,
          roles: { connect: rolesData },
        },
        include: { roles: true },
      });

      // Registrar auditoría
      if (usuarioCreadorId) {
        await this.auditoriaService.registrarAccion(
          usuarioCreadorId,
          'inserción',
          'Usuario',
          nuevoUsuario.id.toString(),
          { email: nuevoUsuario.email, roles: data.roles },
        );
      }

      return nuevoUsuario;
    } catch (error) {
      if (!(error instanceof UserEmailConflictException)) {
        throw PrismaErrorMapper.map(error, 'usuario', 'crear', {
          email: data.email,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdateUserDto,
    usuarioModificadorId: number,
  ): Promise<Usuario> {
    try {
      // Verificar existencia del usuario
      const usuarioExistente = await this.getUserOrFail(id, ['roles']);

      // Verificar si se está actualizando el email y si ya existe
      if (data.email && data.email !== usuarioExistente.email) {
        const emailExistente = await this.prisma.usuario.findUnique({
          where: { email: data.email },
        });

        if (emailExistente) {
          throw new UserEmailConflictException(data.email);
        }
      }

      // Preparar datos de actualización
      const updateData: any = {};
      if (data.nombre) updateData.nombre = data.nombre;
      if (data.email) updateData.email = data.email;
      if (data.password)
        updateData.password = await bcrypt.hash(data.password, 10);
      if (data.estado) updateData.estado = data.estado;

      // Actualizar roles si se proporcionan
      let rolesToConnect: { id: number }[] = [];
      if (data.roles && data.roles.length > 0) {
        rolesToConnect = await Promise.all(
          data.roles.map(async (roleName) => {
            let role: any = await this.prisma.rol.findFirst({
              where: { nombre: roleName },
            });
            if (!role) {
              role = await this.prisma.rol.create({
                data: { nombre: roleName },
              });
            }
            return { id: role.id };
          }),
        );
      }

      // Realizar actualización en una transacción
      const usuarioActualizado = await this.prisma.$transaction(
        async (prisma) => {
          // Si hay nuevos roles, primero desconectamos los anteriores
          if (rolesToConnect.length > 0) {
            await prisma.usuario.update({
              where: { id },
              data: {
                roles: {
                  disconnect: usuarioExistente.roles.map((role: any) => ({
                    id: role.id,
                  })),
                },
              },
            });
          }

          // Ahora actualizamos con los nuevos datos
          return prisma.usuario.update({
            where: { id },
            data: {
              ...updateData,
              ...(rolesToConnect.length > 0
                ? { roles: { connect: rolesToConnect } }
                : {}),
              ultimaActividad: new Date(),
            },
            include: { roles: true },
          });
        },
      );

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioModificadorId,
        'actualización',
        'Usuario',
        id.toString(),
        { cambios: data },
      );

      return usuarioActualizado;
    } catch (error) {
      if (
        !(error instanceof UserNotFoundException) &&
        !(error instanceof UserEmailConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'usuario', 'actualizar', {
          id,
          dto: data,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioEliminadorId: number): Promise<void> {
    try {
      // Verificar existencia del usuario
      const usuario = await this.getUserOrFail(id);

      // No permitir eliminar al superusuario
      if (usuario.esSuperUsuario) {
        throw new UserPermissionException(id, 'eliminar-superusuario');
      }

      // Verificar si tiene acciones de auditoría asociadas
      const accionesAuditoria = await this.prisma.auditoria.count({
        where: { usuarioId: id },
      });

      if (accionesAuditoria > 0) {
        throw new UserDependenciesException(id, ['acciones de auditoría']);
      }

      // Eliminar usuario
      await this.prisma.usuario.delete({ where: { id } });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioEliminadorId,
        'borrado',
        'Usuario',
        id.toString(),
        { email: usuario.email },
      );
    } catch (error) {
      if (
        !(error instanceof UserNotFoundException) &&
        !(error instanceof UserPermissionException) &&
        !(error instanceof UserDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'usuario', 'eliminar', { id });
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.usuario.findMany({
        include: { roles: true },
        where: { estado: 'activo' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'usuario', 'consultar-todos', {});
    }
  }

  async findById(id: number): Promise<any> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        include: { roles: { include: { permisos: true } } },
      });

      if (!usuario) {
        throw new UserNotFoundException(id);
      }

      return usuario;
    } catch (error) {
      if (!(error instanceof UserNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'usuario', 'consultar', { id });
      }
      throw error;
    }
  }

  async actualizarUltimaActividad(id: number): Promise<void> {
    try {
      await this.prisma.usuario.update({
        where: { id },
        data: { ultimaActividad: new Date() },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'usuario', 'actualizar-actividad', {
        id,
      });
    }
  }

  /**
   * Método auxiliar para verificar que un usuario existe y obtenerlo
   * @param id ID del usuario
   * @param includes Relaciones a incluir en la consulta
   * @returns El usuario encontrado
   * @throws UserNotFoundException si el usuario no existe
   */
  private async getUserOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!usuario) {
        throw new UserNotFoundException(id);
      }

      return usuario;
    } catch (error) {
      if (!(error instanceof UserNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'usuario', 'consultar', { id });
      }
      throw error;
    }
  }
}

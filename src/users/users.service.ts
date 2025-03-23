// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario } from '@prisma/client';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { roles: { include: { permisos: true } } },
    });
  }

  async create(
    data: CreateUserDto,
    usuarioCreadorId?: number,
  ): Promise<Usuario> {
    // Verificar si el email es el superusuario designado
    const esSuperUsuario =
      data.email === 'asesorpicconel@gmail.com' || data.esSuperUsuario;

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Preparar roles
    const rolesData = await Promise.all(
      (data.roles || ['user']).map(async (roleName) => {
        let role = await this.prisma.rol.findFirst({
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
  }

  async update(
    id: number,
    data: UpdateUserDto,
    usuarioModificadorId: number,
  ): Promise<Usuario> {
    // Verificar existencia del usuario
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: true },
    });

    if (!usuarioExistente) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
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
          let role = await this.prisma.rol.findFirst({
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
                disconnect: usuarioExistente.roles.map((role) => ({
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
  }

  async delete(id: number, usuarioEliminadorId: number): Promise<void> {
    // Verificar existencia del usuario
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // No permitir eliminar al superusuario
    if (usuario.esSuperUsuario) {
      throw new ForbiddenException('No se puede eliminar al superusuario');
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
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      include: { roles: true },
      where: { estado: 'activo' },
    });
  }

  async findById(id: number): Promise<any> {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { roles: { include: { permisos: true } } },
    });
  }

  async actualizarUltimaActividad(id: number): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { ultimaActividad: new Date() },
    });
  }
}

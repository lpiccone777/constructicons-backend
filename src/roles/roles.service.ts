// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  RolNotFoundException,
  RolConflictException,
  RolDependenciesException,
} from './exceptions';
import { PermisoNotFoundException } from '../permisos/exceptions';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    try {
      return await this.prisma.rol.findMany({
        include: { permisos: true },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'rol', 'consultar-todos', {});
    }
  }

  async findByNombre(nombre: string) {
    try {
      return await this.prisma.rol.findFirst({
        where: { nombre },
        include: { permisos: true },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'rol', 'consultar-por-nombre', { nombre });
    }
  }

  async create(data: CreateRolDto, usuarioCreadorId: number) {
    try {
      // Verificar si ya existe un rol con el mismo nombre
      const existingRol = await this.prisma.rol.findFirst({
        where: { nombre: data.nombre },
      });
      
      if (existingRol) {
        throw new RolConflictException(data.nombre);
      }
      
      // Preparar permisos si se proporcionan
      let permisosToConnect: { id: number }[] = [];
      if (data.permisos && data.permisos.length > 0) {
        permisosToConnect = await Promise.all(
          data.permisos.map(async (permisoNombre) => {
            const permiso = await this.prisma.permiso.findFirst({
              where: { nombre: permisoNombre },
            });
            if (!permiso) {
              throw new PermisoNotFoundException(0); // ID no disponible, se usa 0 como marcador
            }
            return { id: permiso.id };
          }),
        );
      }

      // Crear rol
      const nuevoRol = await this.prisma.rol.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          ...(permisosToConnect.length > 0
            ? { permisos: { connect: permisosToConnect } }
            : {}),
        },
        include: { permisos: true },
      });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioCreadorId,
        'inserción',
        'Rol',
        nuevoRol.id.toString(),
        { nombre: nuevoRol.nombre, permisos: data.permisos },
      );

      return nuevoRol;
    } catch (error) {
      if (
        !(error instanceof RolConflictException) &&
        !(error instanceof PermisoNotFoundException)
      ) {
        throw PrismaErrorMapper.map(error, 'rol', 'crear', {
          dto: data,
        });
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateRolDto, usuarioModificadorId: number) {
    try {
      // Verificar existencia del rol
      const rolExistente = await this.getRolOrFail(id, ['permisos']);

      // Verificar si se está actualizando el nombre y si ya existe
      if (data.nombre && data.nombre !== rolExistente.nombre) {
        const existingRol = await this.prisma.rol.findFirst({
          where: { nombre: data.nombre },
        });
        
        if (existingRol) {
          throw new RolConflictException(data.nombre);
        }
      }

      // Preparar datos de actualización
      const updateData: any = {};
      if (data.nombre) updateData.nombre = data.nombre;
      if (data.descripcion) updateData.descripcion = data.descripcion;

      // Preparar permisos si se proporcionan
      let permisosToConnect: { id: number }[] = [];
      if (data.permisos && data.permisos.length > 0) {
        permisosToConnect = await Promise.all(
          data.permisos.map(async (permisoNombre) => {
            const permiso = await this.prisma.permiso.findFirst({
              where: { nombre: permisoNombre },
            });
            if (!permiso) {
              throw new PermisoNotFoundException(0); // ID no disponible, se usa 0 como marcador
            }
            return { id: permiso.id };
          }),
        );
      }

      // Realizar actualización en una transacción
      const rolActualizado = await this.prisma.$transaction(async (prisma) => {
        // Si hay nuevos permisos, primero desconectamos los anteriores
        if (permisosToConnect.length > 0) {
          await prisma.rol.update({
            where: { id },
            data: {
              permisos: {
                disconnect: rolExistente.permisos.map((permiso: any) => ({
                  id: permiso.id,
                })),
              },
            },
          });
        }

        // Ahora actualizamos con los nuevos datos
        return prisma.rol.update({
          where: { id },
          data: {
            ...updateData,
            ...(permisosToConnect.length > 0
              ? { permisos: { connect: permisosToConnect } }
              : {}),
          },
          include: { permisos: true },
        });
      });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioModificadorId,
        'actualización',
        'Rol',
        id.toString(),
        { cambios: data },
      );

      return rolActualizado;
    } catch (error) {
      if (
        !(error instanceof RolNotFoundException) &&
        !(error instanceof RolConflictException) &&
        !(error instanceof PermisoNotFoundException)
      ) {
        throw PrismaErrorMapper.map(error, 'rol', 'actualizar', {
          id,
          dto: data,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioEliminadorId: number) {
    try {
      // Verificar existencia del rol
      const rol = await this.getRolOrFail(id, ['usuarios']);

      // Verificar si el rol tiene usuarios asignados
      if (rol.usuarios.length > 0) {
        throw new RolDependenciesException(id, ['usuarios']);
      }

      // Eliminar rol
      await this.prisma.rol.delete({ where: { id } });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioEliminadorId,
        'borrado',
        'Rol',
        id.toString(),
        { nombre: rol.nombre },
      );
    } catch (error) {
      if (
        !(error instanceof RolNotFoundException) &&
        !(error instanceof RolDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'rol', 'eliminar', { id });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que un rol existe y obtenerlo
   * @param id ID del rol
   * @param includes Relaciones a incluir en la consulta
   * @returns El rol encontrado
   * @throws RolNotFoundException si el rol no existe
   */
  private async getRolOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const rol = await this.prisma.rol.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!rol) {
        throw new RolNotFoundException(id);
      }

      return rol;
    } catch (error) {
      if (!(error instanceof RolNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'rol', 'consultar', { id });
      }
      throw error;
    }
  }
}

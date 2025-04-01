// src/permisos/permisos.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  PermisoNotFoundException,
  PermisoConflictException,
  PermisoDependenciesException,
} from './exceptions';
import { UserNotFoundException } from '../users/exceptions';

@Injectable()
export class PermisosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    try {
      return await this.prisma.permiso.findMany();
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'permiso', 'consultar-todos', {});
    }
  }

  async findByModulo(modulo: string) {
    try {
      return await this.prisma.permiso.findMany({
        where: { modulo },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'permiso', 'consultar-por-modulo', {
        modulo,
      });
    }
  }

  async create(data: CreatePermisoDto, usuarioCreadorId: number) {
    try {
      // Verificar si ya existe un permiso con la misma combinación módulo/acción
      const existingPermiso = await this.prisma.permiso.findFirst({
        where: {
          modulo: data.modulo,
          accion: data.accion,
        },
      });

      if (existingPermiso) {
        throw new PermisoConflictException(data.modulo, data.accion);
      }

      // Crear permiso
      const nuevoPermiso = await this.prisma.permiso.create({
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          modulo: data.modulo,
          accion: data.accion,
        },
      });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioCreadorId,
        'inserción',
        'Permiso',
        nuevoPermiso.id.toString(),
        { nombre: nuevoPermiso.nombre, modulo: nuevoPermiso.modulo },
      );

      return nuevoPermiso;
    } catch (error) {
      if (!(error instanceof PermisoConflictException)) {
        throw PrismaErrorMapper.map(error, 'permiso', 'crear', {
          dto: data,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdatePermisoDto,
    usuarioModificadorId: number,
  ) {
    try {
      // Verificar existencia del permiso
      const permisoExistente = await this.getPermisoOrFail(id);

      // Verificar si se está actualizando el módulo o acción y si ya existe
      if (
        (data.modulo && data.modulo !== permisoExistente.modulo) ||
        (data.accion && data.accion !== permisoExistente.accion)
      ) {
        const moduloToCheck = data.modulo || permisoExistente.modulo;
        const accionToCheck = data.accion || permisoExistente.accion;

        const existingPermiso = await this.prisma.permiso.findFirst({
          where: {
            modulo: moduloToCheck,
            accion: accionToCheck,
            id: { not: id }, // Excluir el permiso actual
          },
        });

        if (existingPermiso) {
          throw new PermisoConflictException(moduloToCheck, accionToCheck);
        }
      }

      // Actualizar permiso
      const permisoActualizado = await this.prisma.permiso.update({
        where: { id },
        data,
      });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioModificadorId,
        'actualización',
        'Permiso',
        id.toString(),
        { cambios: data },
      );

      return permisoActualizado;
    } catch (error) {
      if (
        !(error instanceof PermisoNotFoundException) &&
        !(error instanceof PermisoConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'permiso', 'actualizar', {
          id,
          dto: data,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioEliminadorId: number) {
    try {
      // Verificar existencia del permiso
      const permiso = await this.getPermisoOrFail(id, ['roles']);

      // Verificar si el permiso está asignado a roles
      if (permiso.roles.length > 0) {
        throw new PermisoDependenciesException(id, ['roles']);
      }

      // Eliminar permiso
      await this.prisma.permiso.delete({ where: { id } });

      // Registrar auditoría
      await this.auditoriaService.registrarAccion(
        usuarioEliminadorId,
        'borrado',
        'Permiso',
        id.toString(),
        { nombre: permiso.nombre },
      );
    } catch (error) {
      if (
        !(error instanceof PermisoNotFoundException) &&
        !(error instanceof PermisoDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'permiso', 'eliminar', { id });
      }
      throw error;
    }
  }

  async verificarPermiso(
    usuarioId: number,
    modulo: string,
    accion: string,
  ): Promise<boolean> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: {
          roles: {
            include: {
              permisos: true,
            },
          },
        },
      });

      // Verificar si el usuario existe
      if (!usuario) {
        return false;
      }

      // Super usuario siempre tiene acceso
      if (usuario.esSuperUsuario) return true;

      // Verificar si alguno de los roles del usuario tiene el permiso requerido
      for (const rol of usuario.roles) {
        const tienePermiso = rol.permisos.some(
          (p: any) => p.modulo === modulo && p.accion === accion,
        );
        if (tienePermiso) return true;
      }

      return false;
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'permiso', 'verificar-permiso', {
        usuarioId,
        modulo,
        accion,
      });
    }
  }

  /**
   * Método auxiliar para verificar que un permiso existe y obtenerlo
   * @param id ID del permiso
   * @param includes Relaciones a incluir en la consulta
   * @returns El permiso encontrado
   * @throws PermisoNotFoundException si el permiso no existe
   */
  private async getPermisoOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const permiso = await this.prisma.permiso.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!permiso) {
        throw new PermisoNotFoundException(id);
      }

      return permiso;
    } catch (error) {
      if (!(error instanceof PermisoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'permiso', 'consultar', { id });
      }
      throw error;
    }
  }
}

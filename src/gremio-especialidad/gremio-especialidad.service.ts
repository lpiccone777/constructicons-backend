// src/gremio-especialidad/gremio-especialidad.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGremioEspecialidadDto } from './dto/create-gremio-especialidad.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  GremioEspecialidadNotFoundException,
  GremioEspecialidadConflictException,
  GremioEspecialidadDependenciesException,
} from './exceptions';

@Injectable()
export class GremioEspecialidadService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateGremioEspecialidadDto, usuarioId: number) {
    try {
      // Verificar si ya existe la relación
      const existente = await this.prisma.gremioEspecialidad.findUnique({
        where: {
          gremioId_especialidadId: {
            gremioId: createDto.gremioId,
            especialidadId: createDto.especialidadId,
          },
        },
      });

      if (existente) {
        throw new GremioEspecialidadConflictException(
          createDto.gremioId,
          createDto.especialidadId,
        );
      }

      // Crear la relación
      const relacion = await this.prisma.gremioEspecialidad.create({
        data: createDto,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'GremioEspecialidad',
        relacion.id.toString(),
        {
          gremioId: relacion.gremioId,
          especialidadId: relacion.especialidadId,
        },
      );

      return relacion;
    } catch (error) {
      if (!(error instanceof GremioEspecialidadConflictException)) {
        throw PrismaErrorMapper.map(error, 'gremio-especialidad', 'crear', {
          dto: createDto,
        });
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.gremioEspecialidad.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(
        error,
        'gremio-especialidad',
        'consultar-todos',
        {},
      );
    }
  }

  async findOne(id: number) {
    try {
      const relacion = await this.prisma.gremioEspecialidad.findUnique({
        where: { id },
      });

      if (!relacion) {
        throw new GremioEspecialidadNotFoundException(id);
      }

      return relacion;
    } catch (error) {
      if (!(error instanceof GremioEspecialidadNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'gremio-especialidad', 'consultar', {
          id,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la relación existe
      const relacion = await this.getRelacionOrFail(id);

      // Verificar si hay dependencias
      // En este caso podríamos verificar empleados que tengan esta especialidad asociada al gremio

      // Eliminar la relación
      const deleted = await this.prisma.gremioEspecialidad.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'GremioEspecialidad',
        id.toString(),
        {
          gremioId: relacion.gremioId,
          especialidadId: relacion.especialidadId,
        },
      );

      return deleted;
    } catch (error) {
      if (!(error instanceof GremioEspecialidadNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'gremio-especialidad', 'eliminar', {
          id,
        });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que una relación existe y obtenerla
   * @param id ID de la relación
   * @returns La relación encontrada
   * @throws GremioEspecialidadNotFoundException si la relación no existe
   */
  private async getRelacionOrFail(id: number): Promise<any> {
    try {
      const relacion = await this.prisma.gremioEspecialidad.findUnique({
        where: { id },
      });

      if (!relacion) {
        throw new GremioEspecialidadNotFoundException(id);
      }

      return relacion;
    } catch (error) {
      if (!(error instanceof GremioEspecialidadNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'gremio-especialidad', 'consultar', {
          id,
        });
      }
      throw error;
    }
  }
}

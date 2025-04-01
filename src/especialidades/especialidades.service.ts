// src/especialidades/especialidades.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  EspecialidadNotFoundException,
  EspecialidadConflictException,
  EspecialidadDependenciesException,
} from './exceptions';

@Injectable()
export class EspecialidadesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    try {
      return await this.prisma.especialidad.findMany({
        orderBy: { nombre: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'especialidad', 'consultar', {});
    }
  }

  async findById(id: number) {
    try {
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        include: {
          empleados: {
            include: {
              empleado: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  apellido: true,
                },
              },
            },
            where: {
              fechaHasta: null, // Solo asignaciones vigentes
            },
          },
        },
      });

      if (!especialidad) {
        throw new EspecialidadNotFoundException(id);
      }

      return especialidad;
    } catch (error) {
      if (!(error instanceof EspecialidadNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'especialidad', 'consultar', { id });
      }
      throw error;
    }
  }

  async create(
    createEspecialidadDto: CreateEspecialidadDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si ya existe una especialidad con el mismo código
      const existingEspecialidad = await this.prisma.especialidad.findUnique({
        where: { codigo: createEspecialidadDto.codigo },
      });

      if (existingEspecialidad) {
        throw new EspecialidadConflictException(createEspecialidadDto.codigo);
      }

      // Convertir datos de string a tipos apropiados
      const especialidadData = {
        ...createEspecialidadDto,
        valorHoraBase: new Decimal(createEspecialidadDto.valorHoraBase),
      };

      // Crear la especialidad
      const nuevaEspecialidad = await this.prisma.especialidad.create({
        data: especialidadData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'Especialidad',
        nuevaEspecialidad.id.toString(),
        {
          codigo: nuevaEspecialidad.codigo,
          nombre: nuevaEspecialidad.nombre,
        },
      );

      return nuevaEspecialidad;
    } catch (error) {
      if (!(error instanceof EspecialidadConflictException)) {
        throw PrismaErrorMapper.map(error, 'especialidad', 'crear', {
          dto: createEspecialidadDto,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateEspecialidadDto: UpdateEspecialidadDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si la especialidad existe
      const especialidad = await this.getEspecialidadOrFail(id);

      // Verificar si se está actualizando el código y si ya existe
      if (
        updateEspecialidadDto.codigo &&
        updateEspecialidadDto.codigo !== especialidad.codigo
      ) {
        const existingEspecialidad = await this.prisma.especialidad.findUnique({
          where: { codigo: updateEspecialidadDto.codigo },
        });

        if (existingEspecialidad) {
          throw new EspecialidadConflictException(updateEspecialidadDto.codigo);
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateEspecialidadDto };

      if (updateEspecialidadDto.valorHoraBase) {
        updateData.valorHoraBase = new Decimal(
          updateEspecialidadDto.valorHoraBase,
        );
      }

      // Actualizar la especialidad
      const especialidadActualizada = await this.prisma.especialidad.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'Especialidad',
        id.toString(),
        { cambios: updateEspecialidadDto },
      );

      return especialidadActualizada;
    } catch (error) {
      if (
        !(error instanceof EspecialidadNotFoundException) &&
        !(error instanceof EspecialidadConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'especialidad', 'actualizar', {
          id,
          dto: updateEspecialidadDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la especialidad existe y obtener sus dependencias
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        include: {
          empleados: {
            where: {
              fechaHasta: null, // Solo asignaciones vigentes
            },
          },
        },
      });

      if (!especialidad) {
        throw new EspecialidadNotFoundException(id);
      }

      // Verificar si la especialidad tiene empleados asignados vigentes
      if (especialidad.empleados.length > 0) {
        throw new EspecialidadDependenciesException(id, [
          'empleados',
          especialidad.empleados.length,
        ]);
      }

      // Eliminar la especialidad
      await this.prisma.especialidad.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'Especialidad',
        id.toString(),
        {
          codigo: especialidad.codigo,
          nombre: especialidad.nombre,
        },
      );
    } catch (error) {
      if (
        !(error instanceof EspecialidadNotFoundException) &&
        !(error instanceof EspecialidadDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'especialidad', 'eliminar', { id });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que una especialidad existe y obtenerla
   * @param id ID de la especialidad
   * @param includes Relaciones a incluir en la consulta
   * @returns La especialidad encontrada
   * @throws EspecialidadNotFoundException si la especialidad no existe
   */
  private async getEspecialidadOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!especialidad) {
        throw new EspecialidadNotFoundException(id);
      }

      return especialidad;
    } catch (error) {
      if (!(error instanceof EspecialidadNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'especialidad', 'consultar', { id });
      }
      throw error;
    }
  }
}

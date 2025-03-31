// src/proyectos/tareas/tareas.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import {
  TareaNotFoundException,
  TareaConflictException,
  EtapaNotFoundException,
  ProyectoClosedException,
} from '../exceptions';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';

@Injectable()
export class TareasService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(etapaId?: number) {
    try {
      const where: Record<string, any> = {};

      if (etapaId) {
        where.etapaId = etapaId;

        // Verificar que la etapa existe
        const etapa = await this.prisma.etapaProyecto.findUnique({
          where: { id: etapaId },
        });

        if (!etapa) {
          throw new EtapaNotFoundException(etapaId);
        }
      }

      return this.prisma.tareaProyecto.findMany({
        where,
        include: {
          etapa: {
            select: {
              id: true,
              nombre: true,
              proyecto: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                },
              },
            },
          },
          asignado: {
            where: { activo: true },
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ etapaId: 'asc' }, { orden: 'asc' }],
      });
    } catch (error) {
      if (!(error instanceof EtapaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'tarea', 'consultar', {
          etapaId,
        });
      }
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id },
        include: {
          etapa: {
            select: {
              id: true,
              nombre: true,
              proyecto: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  estado: true,
                },
              },
            },
          },
          asignado: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!tarea) {
        throw new TareaNotFoundException(id);
      }

      return tarea;
    } catch (error) {
      if (!(error instanceof TareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'tarea', 'consultar', { id });
      }
      throw error;
    }
  }
  async create(createTareaDto: CreateTareaDto, usuarioId: number) {
    try {
      // Verificar si la etapa existe
      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id: createTareaDto.etapaId },
        include: {
          proyecto: true,
        },
      });

      if (!etapa) {
        throw new EtapaNotFoundException(createTareaDto.etapaId);
      }

      // Verificar si el proyecto está en un estado que permite crear tareas
      if (['finalizado', 'cancelado'].includes(etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          etapa.proyecto.id,
          etapa.proyecto.estado,
        );
      }

      // Verificar si ya existe una tarea con el mismo orden en esta etapa
      const existingTarea = await this.prisma.tareaProyecto.findFirst({
        where: {
          etapaId: createTareaDto.etapaId,
          orden: createTareaDto.orden,
        },
      });

      if (existingTarea) {
        throw new TareaConflictException(
          existingTarea.id,
          'orden',
          createTareaDto.orden,
        );
      }

      // Convertir fechas si existen
      const tareaData = {
        ...createTareaDto,
        fechaInicio: createTareaDto.fechaInicio
          ? new Date(createTareaDto.fechaInicio)
          : null,
        fechaFinEstimada: createTareaDto.fechaFinEstimada
          ? new Date(createTareaDto.fechaFinEstimada)
          : null,
      };

      // Crear la tarea
      const nuevaTarea = await this.prisma.tareaProyecto.create({
        data: tareaData,
      });

      // Si la etapa estaba en estado 'pendiente', actualizarla a 'en_progreso'
      if (etapa.estado === 'pendiente') {
        await this.prisma.etapaProyecto.update({
          where: { id: etapa.id },
          data: { estado: 'en_progreso' },
        });

        // Si el proyecto estaba en planificación, actualizarlo a ejecución
        if (etapa.proyecto.estado === 'planificacion') {
          await this.prisma.proyecto.update({
            where: { id: etapa.proyecto.id },
            data: { estado: 'ejecucion' },
          });
        }
      }

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'TareaProyecto',
        nuevaTarea.id.toString(),
        {
          nombre: nuevaTarea.nombre,
          etapaId: nuevaTarea.etapaId,
          orden: nuevaTarea.orden,
        },
      );

      return nuevaTarea;
    } catch (error) {
      if (
        !(error instanceof EtapaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof TareaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'tarea', 'crear', {
          dto: createTareaDto,
        });
      }
      throw error;
    }
  }
  async update(id: number, updateTareaDto: UpdateTareaDto, usuarioId: number) {
    try {
      // Verificar si la tarea existe
      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id },
        include: {
          etapa: {
            include: {
              proyecto: true,
            },
          },
        },
      });

      if (!tarea) {
        throw new TareaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite actualizar tareas
      if (['finalizado', 'cancelado'].includes(tarea.etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          tarea.etapa.proyecto.id,
          tarea.etapa.proyecto.estado,
        );
      }

      // Verificar si se está actualizando el orden y si ya existe
      if (updateTareaDto.orden && updateTareaDto.orden !== tarea.orden) {
        const existingTarea = await this.prisma.tareaProyecto.findFirst({
          where: {
            etapaId: tarea.etapaId,
            orden: updateTareaDto.orden,
            id: { not: id }, // Excluir la tarea actual
          },
        });

        if (existingTarea) {
          throw new TareaConflictException(
            existingTarea.id,
            'orden',
            updateTareaDto.orden,
          );
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateTareaDto };

      if (updateTareaDto.fechaInicio) {
        updateData.fechaInicio = new Date(updateTareaDto.fechaInicio);
      }

      if (updateTareaDto.fechaFinEstimada) {
        updateData.fechaFinEstimada = new Date(updateTareaDto.fechaFinEstimada);
      }

      if (updateTareaDto.fechaFinReal) {
        updateData.fechaFinReal = new Date(updateTareaDto.fechaFinReal);
      }

      // Actualizar la tarea
      const tareaActualizada = await this.prisma.tareaProyecto.update({
        where: { id },
        data: updateData,
      });

      // Si se cambia el estado a 'completada', verificar si todas las tareas de la etapa están completadas
      if (
        updateTareaDto.estado === 'completada' &&
        tarea.estado !== 'completada'
      ) {
        const tareasDeEtapa = await this.prisma.tareaProyecto.findMany({
          where: {
            etapaId: tarea.etapaId,
            id: { not: id }, // Excluir la tarea actual
          },
        });

        const allCompleted = tareasDeEtapa.every(
          (t) => t.estado === 'completada',
        );

        if (allCompleted || tareasDeEtapa.length === 0) {
          // Actualizar la etapa a 'completada'
          await this.prisma.etapaProyecto.update({
            where: { id: tarea.etapaId },
            data: {
              estado: 'completada',
              avance: 100,
              fechaFinReal: new Date(),
            },
          });

          // Verificar si todas las etapas del proyecto están completadas
          const etapasDeProyecto = await this.prisma.etapaProyecto.findMany({
            where: {
              proyectoId: tarea.etapa.proyecto.id,
              id: { not: tarea.etapaId }, // Excluir la etapa actual
            },
          });

          const allEtapasCompleted = etapasDeProyecto.every(
            (e) => e.estado === 'completada',
          );

          if (allEtapasCompleted || etapasDeProyecto.length === 0) {
            // Actualizar el proyecto a 'finalizado'
            await this.prisma.proyecto.update({
              where: { id: tarea.etapa.proyecto.id },
              data: {
                estado: 'finalizado',
                fechaFinReal: new Date(),
              },
            });
          }
        } else {
          // Actualizar avance de la etapa
          await this.actualizarAvanceEtapa(tarea.etapaId, id);
        }
      }

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'TareaProyecto',
        id.toString(),
        { cambios: updateTareaDto },
      );

      return tareaActualizada;
    } catch (error) {
      if (
        !(error instanceof TareaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof TareaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'tarea', 'actualizar', {
          id,
          dto: updateTareaDto,
        });
      }
      throw error;
    }
  }
  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la tarea existe
      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id },
        include: {
          asignado: true,
          etapa: {
            include: {
              proyecto: true,
            },
          },
        },
      });

      if (!tarea) {
        throw new TareaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite eliminar tareas
      if (['finalizado', 'cancelado'].includes(tarea.etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          tarea.etapa.proyecto.id,
          tarea.etapa.proyecto.estado,
        );
      }

      // Usar una transacción para eliminar la tarea y sus asignaciones
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar asignaciones de la tarea
        if (tarea.asignado.length > 0) {
          await prisma.asignacionTarea.deleteMany({
            where: { tareaId: id },
          });
        }

        // Eliminar la tarea
        await prisma.tareaProyecto.delete({
          where: { id },
        });
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'TareaProyecto',
        id.toString(),
        {
          nombre: tarea.nombre,
          etapaId: tarea.etapaId,
          orden: tarea.orden,
        },
      );

      // Actualizar avance de la etapa
      await this.actualizarAvanceEtapa(tarea.etapaId);
    } catch (error) {
      if (
        !(error instanceof TareaNotFoundException) &&
        !(error instanceof ProyectoClosedException)
      ) {
        throw PrismaErrorMapper.map(error, 'tarea', 'eliminar', { id });
      }
      throw error;
    }
  }

  async reordenarTareas(
    etapaId: number,
    nuevosOrdenes: { id: number; orden: number }[],
    usuarioId: number,
  ) {
    try {
      // Verificar si la etapa existe
      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id: etapaId },
        include: {
          tareas: true,
          proyecto: true,
        },
      });

      if (!etapa) {
        throw new EtapaNotFoundException(etapaId);
      }

      // Verificar si el proyecto está en estado que permite modificaciones
      if (['finalizado', 'cancelado'].includes(etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          etapa.proyecto.id,
          etapa.proyecto.estado,
        );
      }

      // Verificar que todas las tareas pertenezcan a esta etapa
      const tareaIds = etapa.tareas.map((t) => t.id);
      const idsInvalidos = nuevosOrdenes.filter(
        (no) => !tareaIds.includes(no.id),
      );

      if (idsInvalidos.length > 0) {
        throw new TareaConflictException(idsInvalidos[0].id, 'etapa', etapaId);
      }

      // Usar una transacción para actualizar todos los órdenes
      await this.prisma.$transaction(
        nuevosOrdenes.map((no) =>
          this.prisma.tareaProyecto.update({
            where: { id: no.id },
            data: { orden: no.orden },
          }),
        ),
      );

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'TareaProyecto',
        'multiple',
        { accion: 'reordenamiento', etapaId, tareas: nuevosOrdenes },
      );

      return await this.findAll(etapaId);
    } catch (error) {
      if (
        !(error instanceof EtapaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof TareaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'tarea', 'reordenar', {
          etapaId,
          ordenes: nuevosOrdenes,
        });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que una tarea existe y obtenerla
   * @param id ID de la tarea
   * @param includes Relaciones a incluir en la consulta
   * @returns La tarea encontrada
   * @throws TareaNotFoundException si la tarea no existe
   */
  private async getTareaOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!tarea) {
        throw new TareaNotFoundException(id);
      }

      return tarea;
    } catch (error) {
      if (!(error instanceof TareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'tarea', 'consultar', { id });
      }
      throw error;
    }
  }

  /**
   * Actualiza el avance de la etapa basado en el estado de sus tareas
   * @param etapaId ID de la etapa
   * @param excludeTareaId ID de la tarea a excluir del cálculo (opcional)
   */
  private async actualizarAvanceEtapa(
    etapaId: number,
    excludeTareaId?: number,
  ): Promise<void> {
    try {
      const where: Record<string, any> = { etapaId };

      if (excludeTareaId) {
        where.id = { not: excludeTareaId };
      }

      const tareas = await this.prisma.tareaProyecto.findMany({ where });
      const totalTareas = tareas.length + (excludeTareaId ? 1 : 0); // Si excluimos una tarea, la sumamos al total

      if (totalTareas > 0) {
        const tareasCompletadas = tareas.filter(
          (t) => t.estado === 'completada',
        ).length;

        // Si estamos excluyendo una tarea que se acaba de completar, la sumamos
        const completadasAjustadas = excludeTareaId
          ? tareasCompletadas + 1
          : tareasCompletadas;

        const nuevoAvance = Math.floor(
          (completadasAjustadas / totalTareas) * 100,
        );

        await this.prisma.etapaProyecto.update({
          where: { id: etapaId },
          data: { avance: nuevoAvance },
        });
      }
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'etapa', 'actualizar-avance', {
        etapaId,
      });
    }
  }
}

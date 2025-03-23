import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

@Injectable()
export class TareasService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(etapaId?: number) {
    const where: Record<string, any> = {};

    if (etapaId) {
      where.etapaId = etapaId;
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
  }

  async findById(id: number) {
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
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return tarea;
  }

  async create(createTareaDto: CreateTareaDto, usuarioId: number) {
    // Verificar si la etapa existe
    const etapa = await this.prisma.etapaProyecto.findUnique({
      where: { id: createTareaDto.etapaId },
      include: {
        proyecto: true,
      },
    });

    if (!etapa) {
      throw new NotFoundException(
        `Etapa con ID ${createTareaDto.etapaId} no encontrada`,
      );
    }

    // Verificar si el proyecto está en un estado que permite crear tareas
    if (
      etapa.proyecto.estado === 'finalizado' ||
      etapa.proyecto.estado === 'cancelado'
    ) {
      throw new ConflictException(
        `No se pueden crear tareas en un proyecto ${etapa.proyecto.estado}`,
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
      throw new ConflictException(
        `Ya existe una tarea con el orden ${createTareaDto.orden} en esta etapa`,
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
  }

  async update(id: number, updateTareaDto: UpdateTareaDto, usuarioId: number) {
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
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    // Verificar si el proyecto está en un estado que permite actualizar tareas
    if (
      tarea.etapa.proyecto.estado === 'finalizado' ||
      tarea.etapa.proyecto.estado === 'cancelado'
    ) {
      throw new ConflictException(
        `No se pueden actualizar tareas en un proyecto ${tarea.etapa.proyecto.estado}`,
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
        throw new ConflictException(
          `Ya existe una tarea con el orden ${updateTareaDto.orden} en esta etapa`,
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
        const totalTareas = tareasDeEtapa.length + 1; // Incluyendo la tarea actual
        const tareasCompletadas =
          tareasDeEtapa.filter((t) => t.estado === 'completada').length + 1; // +1 por la tarea actual
        const nuevoAvance = Math.floor((tareasCompletadas / totalTareas) * 100);

        await this.prisma.etapaProyecto.update({
          where: { id: tarea.etapaId },
          data: { avance: nuevoAvance },
        });
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
  }

  async delete(id: number, usuarioId: number) {
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
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    // Verificar si el proyecto está en un estado que permite eliminar tareas
    if (
      tarea.etapa.proyecto.estado === 'finalizado' ||
      tarea.etapa.proyecto.estado === 'cancelado'
    ) {
      throw new ConflictException(
        `No se pueden eliminar tareas en un proyecto ${tarea.etapa.proyecto.estado}`,
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
    const tareasDeEtapa = await this.prisma.tareaProyecto.findMany({
      where: { etapaId: tarea.etapaId },
    });

    if (tareasDeEtapa.length > 0) {
      const tareasCompletadas = tareasDeEtapa.filter(
        (t) => t.estado === 'completada',
      ).length;
      const nuevoAvance = Math.floor(
        (tareasCompletadas / tareasDeEtapa.length) * 100,
      );

      await this.prisma.etapaProyecto.update({
        where: { id: tarea.etapaId },
        data: { avance: nuevoAvance },
      });
    }
  }

  async reordenarTareas(
    etapaId: number,
    nuevosOrdenes: { id: number; orden: number }[],
    usuarioId: number,
  ) {
    // Verificar si la etapa existe
    const etapa = await this.prisma.etapaProyecto.findUnique({
      where: { id: etapaId },
      include: {
        tareas: true,
      },
    });

    if (!etapa) {
      throw new NotFoundException(`Etapa con ID ${etapaId} no encontrada`);
    }

    // Verificar que todas las tareas pertenezcan a esta etapa
    const tareaIds = etapa.tareas.map((t) => t.id);
    const idsInvalidos = nuevosOrdenes.filter(
      (no) => !tareaIds.includes(no.id),
    );

    if (idsInvalidos.length > 0) {
      throw new ConflictException(
        `Las siguientes tareas no pertenecen a esta etapa: ${idsInvalidos.map((i) => i.id).join(', ')}`,
      );
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
  }
}

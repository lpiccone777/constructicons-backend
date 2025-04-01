import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateEtapaDto } from './dto/create-etapa.dto';
import { UpdateEtapaDto } from './dto/update-etapa.dto';
import { Decimal } from '@prisma/client/runtime/library';
import {
  EtapaNotFoundException,
  EtapaConflictException,
  EtapaDependenciesException,
} from '../exceptions';
import {
  ProyectoNotFoundException,
  ProyectoClosedException,
} from '../exceptions';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';

@Injectable()
export class EtapasService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(proyectoId?: number) {
    try {
      const where: Record<string, any> = {};

      if (proyectoId) {
        where.proyectoId = proyectoId;

        // Verificar que el proyecto existe
        const proyecto = await this.prisma.proyecto.findUnique({
          where: { id: proyectoId },
        });

        if (!proyecto) {
          throw new ProyectoNotFoundException(proyectoId);
        }
      }

      return this.prisma.etapaProyecto.findMany({
        where,
        include: {
          proyecto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
          _count: {
            select: { tareas: true },
          },
        },
        orderBy: [{ proyectoId: 'asc' }, { orden: 'asc' }],
      });
    } catch (error) {
      if (!(error instanceof ProyectoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'etapa', 'consultar', {
          proyectoId,
        });
      }
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id },
        include: {
          proyecto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              estado: true,
            },
          },
          tareas: {
            include: {
              asignacionesEmpleados: {
                include: {
                  empleado: {
                    select: {
                      id: true,
                      nombre: true,
                      email: true,
                    },
                  },
                },
                where: { activo: true },
              },
            },
            orderBy: { orden: 'asc' },
          },
        },
      });

      if (!etapa) {
        throw new EtapaNotFoundException(id);
      }

      return etapa;
    } catch (error) {
      if (!(error instanceof EtapaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'etapa', 'consultar', { id });
      }
      throw error;
    }
  }

  async create(createEtapaDto: CreateEtapaDto, usuarioId: number) {
    try {
      // Verificar si el proyecto existe
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: createEtapaDto.proyectoId },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(createEtapaDto.proyectoId);
      }

      // Verificar si el proyecto está en un estado que permite crear etapas
      if (['finalizado', 'cancelado'].includes(proyecto.estado)) {
        throw new ProyectoClosedException(
          createEtapaDto.proyectoId,
          proyecto.estado,
        );
      }

      // Verificar si ya existe una etapa con el mismo orden en este proyecto
      const existingEtapa = await this.prisma.etapaProyecto.findFirst({
        where: {
          proyectoId: createEtapaDto.proyectoId,
          orden: createEtapaDto.orden,
        },
      });

      if (existingEtapa) {
        throw new EtapaConflictException(
          existingEtapa.id,
          'orden',
          createEtapaDto.orden,
        );
      }

      // Convertir datos de string a tipos apropiados
      const etapaData = {
        ...createEtapaDto,
        presupuesto: new Decimal(createEtapaDto.presupuesto),
        fechaInicio: createEtapaDto.fechaInicio
          ? new Date(createEtapaDto.fechaInicio)
          : null,
        fechaFinEstimada: createEtapaDto.fechaFinEstimada
          ? new Date(createEtapaDto.fechaFinEstimada)
          : null,
      };

      // Crear la etapa
      const nuevaEtapa = await this.prisma.etapaProyecto.create({
        data: etapaData,
      });

      // Si el proyecto estaba en planificación, actualizarlo a ejecución
      if (proyecto.estado === 'planificacion') {
        await this.prisma.proyecto.update({
          where: { id: proyecto.id },
          data: { estado: 'ejecucion' },
        });
      }

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'EtapaProyecto',
        nuevaEtapa.id.toString(),
        {
          nombre: nuevaEtapa.nombre,
          proyectoId: nuevaEtapa.proyectoId,
          orden: nuevaEtapa.orden,
          presupuesto: nuevaEtapa.presupuesto.toString(),
        },
      );

      return nuevaEtapa;
    } catch (error) {
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof EtapaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'etapa', 'crear', {
          dto: createEtapaDto,
        });
      }
      throw error;
    }
  }

  async update(id: number, updateEtapaDto: UpdateEtapaDto, usuarioId: number) {
    try {
      // Verificar si la etapa existe
      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id },
        include: {
          proyecto: true,
        },
      });

      if (!etapa) {
        throw new EtapaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite actualizar etapas
      if (['finalizado', 'cancelado'].includes(etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          etapa.proyectoId,
          etapa.proyecto.estado,
        );
      }

      // Verificar si se está actualizando el orden y si ya existe
      if (updateEtapaDto.orden && updateEtapaDto.orden !== etapa.orden) {
        const existingEtapa = await this.prisma.etapaProyecto.findFirst({
          where: {
            proyectoId: etapa.proyectoId,
            orden: updateEtapaDto.orden,
            id: { not: id }, // Excluir la etapa actual
          },
        });

        if (existingEtapa) {
          throw new EtapaConflictException(
            existingEtapa.id,
            'orden',
            updateEtapaDto.orden,
          );
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateEtapaDto };

      if (updateEtapaDto.presupuesto) {
        updateData.presupuesto = new Decimal(updateEtapaDto.presupuesto);
      }

      if (updateEtapaDto.fechaInicio) {
        updateData.fechaInicio = new Date(updateEtapaDto.fechaInicio);
      }

      if (updateEtapaDto.fechaFinEstimada) {
        updateData.fechaFinEstimada = new Date(updateEtapaDto.fechaFinEstimada);
      }

      if (updateEtapaDto.fechaFinReal) {
        updateData.fechaFinReal = new Date(updateEtapaDto.fechaFinReal);
      }

      // Actualizar la etapa
      const etapaActualizada = await this.prisma.etapaProyecto.update({
        where: { id },
        data: updateData,
      });

      // Si se cambia el estado a 'completada', verificar si todas las etapas del proyecto están completadas
      if (
        updateEtapaDto.estado === 'completada' &&
        etapa.estado !== 'completada'
      ) {
        const etapasDeProyecto = await this.prisma.etapaProyecto.findMany({
          where: {
            proyectoId: etapa.proyectoId,
            id: { not: id }, // Excluir la etapa actual
          },
        });

        const allCompleted = etapasDeProyecto.every(
          (e) => e.estado === 'completada',
        );

        if (allCompleted || etapasDeProyecto.length === 0) {
          // Actualizar el proyecto a 'finalizado'
          await this.prisma.proyecto.update({
            where: { id: etapa.proyectoId },
            data: {
              estado: 'finalizado',
              fechaFinReal: new Date(),
            },
          });
        }
      }

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'EtapaProyecto',
        id.toString(),
        { cambios: updateEtapaDto },
      );

      return etapaActualizada;
    } catch (error) {
      if (
        !(error instanceof EtapaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof EtapaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'etapa', 'actualizar', {
          id,
          dto: updateEtapaDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la etapa existe
      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id },
        include: {
          tareas: true,
          proyecto: true,
        },
      });

      if (!etapa) {
        throw new EtapaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite eliminar etapas
      if (['finalizado', 'cancelado'].includes(etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          etapa.proyectoId,
          etapa.proyecto.estado,
        );
      }

      // Verificar si la etapa tiene tareas asociadas
      if (etapa.tareas.length > 0) {
        throw new EtapaDependenciesException(id, ['tareas']);
      }

      // Eliminar la etapa
      await this.prisma.etapaProyecto.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'EtapaProyecto',
        id.toString(),
        {
          nombre: etapa.nombre,
          proyectoId: etapa.proyectoId,
          orden: etapa.orden,
        },
      );
    } catch (error) {
      if (
        !(error instanceof EtapaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof EtapaDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'etapa', 'eliminar', { id });
      }
      throw error;
    }
  }

  async reordenarEtapas(
    proyectoId: number,
    nuevosOrdenes: { id: number; orden: number }[],
    usuarioId: number,
  ) {
    try {
      // Verificar si el proyecto existe
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: proyectoId },
        include: {
          etapas: true,
        },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(proyectoId);
      }

      // Verificar si el proyecto está en un estado que permite modificar etapas
      if (['finalizado', 'cancelado'].includes(proyecto.estado)) {
        throw new ProyectoClosedException(proyectoId, proyecto.estado);
      }

      // Verificar que todas las etapas pertenezcan a este proyecto
      const etapaIds = proyecto.etapas.map((e) => e.id);
      const idsInvalidos = nuevosOrdenes.filter(
        (no) => !etapaIds.includes(no.id),
      );

      if (idsInvalidos.length > 0) {
        throw new EtapaConflictException(
          idsInvalidos[0].id,
          'proyecto',
          proyectoId,
        );
      }

      // Usar una transacción para actualizar todos los órdenes
      await this.prisma.$transaction(
        nuevosOrdenes.map((no) =>
          this.prisma.etapaProyecto.update({
            where: { id: no.id },
            data: { orden: no.orden },
          }),
        ),
      );

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'EtapaProyecto',
        'multiple',
        { accion: 'reordenamiento', proyectoId, etapas: nuevosOrdenes },
      );

      return await this.findAll(proyectoId);
    } catch (error) {
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof EtapaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'etapa', 'reordenar', {
          proyectoId,
          ordenes: nuevosOrdenes,
        });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que una etapa existe y obtenerla
   * @param id ID de la etapa
   * @param includes Relaciones a incluir en la consulta
   * @returns La etapa encontrada
   * @throws EtapaNotFoundException si la etapa no existe
   */
  private async getEtapaOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const etapa = await this.prisma.etapaProyecto.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!etapa) {
        throw new EtapaNotFoundException(id);
      }

      return etapa;
    } catch (error) {
      if (!(error instanceof EtapaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'etapa', 'consultar', { id });
      }
      throw error;
    }
  }

  /**
   * Verifica que la etapa pertenezca al proyecto indicado
   * @param etapaId ID de la etapa
   * @param proyectoId ID del proyecto
   * @throws EtapaNotFoundException si la etapa no existe
   * @throws EtapaConflictException si la etapa no pertenece al proyecto
   */
  private async verificarEtapaEnProyecto(
    etapaId: number,
    proyectoId: number,
  ): Promise<void> {
    const etapa = await this.getEtapaOrFail(etapaId);

    if (etapa.proyectoId !== proyectoId) {
      throw new EtapaConflictException(etapaId, 'proyecto', proyectoId);
    }
  }

  /**
   * Actualiza el avance de la etapa basado en el estado de sus tareas
   * @param etapaId ID de la etapa
   */
  private async actualizarAvanceEtapa(etapaId: number): Promise<void> {
    try {
      const etapa = await this.getEtapaOrFail(etapaId);
      const tareas = await this.prisma.tareaProyecto.findMany({
        where: { etapaId },
      });

      if (tareas.length > 0) {
        const tareasCompletadas = tareas.filter(
          (t) => t.estado === 'completada',
        ).length;
        const nuevoAvance = Math.floor(
          (tareasCompletadas / tareas.length) * 100,
        );

        await this.prisma.etapaProyecto.update({
          where: { id: etapaId },
          data: { avance: nuevoAvance },
        });
      }
    } catch (error) {
      if (!(error instanceof EtapaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'etapa', 'actualizar-avance', {
          etapaId,
        });
      }
      throw error;
    }
  }
}

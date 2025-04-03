// src/proyectos/proyectos.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ProyectoNotFoundException,
  ProyectoConflictException,
  ProyectoDependenciesException,
  ProyectoClosedException,
  ProyectoInvalidStateException,
} from './exceptions';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';

@Injectable()
export class ProyectosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(query: { estado?: string } = {}) {
    try {
      const where: Record<string, any> = {};

      if (query.estado) {
        where.estado = query.estado;
      }

      return this.prisma.proyecto.findMany({
        where,
        include: {
          etapas: {
            include: {
              _count: {
                select: { tareas: true },
              },
            },
          },
          _count: {
            select: {
              asignacionesEmpleados: true,
              documentos: true,
            },
          },
        },
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'proyecto', 'consultar', {
        filtros: query,
      });
    }
  }

  async findById(id: number) {
    try {
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id },
        include: {
          etapas: {
            include: {
              tareas: true,
            },
            orderBy: { orden: 'asc' },
          },
          asignacionesEmpleados: {
            where: { activo: true },
            include: {
              empleado: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                },
              },
            },
          },
          documentos: {
            include: {
              usuarioCarga: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
            orderBy: { fechaCarga: 'desc' },
          },
          notas: {
            orderBy: { fechaCreacion: 'desc' },
            include: {
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(id);
      }

      return proyecto;
    } catch (error) {
      if (!(error instanceof ProyectoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'proyecto', 'consultar', { id });
      }
      throw error;
    }
  }

  async create(createProyectoDto: CreateProyectoDto, usuarioId: number) {
    try {
      // Verificar si ya existe un proyecto con el mismo código
      const existingProyecto = await this.prisma.proyecto.findUnique({
        where: { codigo: createProyectoDto.codigo },
      });

      if (existingProyecto) {
        throw new ProyectoConflictException(createProyectoDto.codigo);
      }

      // Convertir datos de string a tipos apropiados
      const proyectoData = {
        ...createProyectoDto,
        presupuestoTotal: new Decimal(createProyectoDto.presupuestoTotal),
        fechaInicio: createProyectoDto.fechaInicio
          ? new Date(createProyectoDto.fechaInicio)
          : null,
        fechaFinEstimada: createProyectoDto.fechaFinEstimada
          ? new Date(createProyectoDto.fechaFinEstimada)
          : null,
      };

      // Crear el proyecto
      const nuevoProyecto = await this.prisma.proyecto.create({
        data: proyectoData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'Proyecto',
        nuevoProyecto.id.toString(),
        {
          codigo: nuevoProyecto.codigo,
          nombre: nuevoProyecto.nombre,
          presupuestoTotal: nuevoProyecto.presupuestoTotal.toString(),
        },
      );

      return nuevoProyecto;
    } catch (error) {
      // Si no es una de nuestras excepciones personalizadas, la mapeamos
      if (!(error instanceof ProyectoConflictException)) {
        throw PrismaErrorMapper.map(error, 'proyecto', 'crear', {
          dto: createProyectoDto,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateProyectoDto: UpdateProyectoDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el proyecto existe
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(id);
      }

      // Verificar si el proyecto está finalizado o cancelado
      if (['finalizado', 'cancelado'].includes(proyecto.estado)) {
        throw new ProyectoClosedException(id, proyecto.estado);
      }

      // Verificar si se está actualizando el código y si ya existe
      if (
        updateProyectoDto.codigo &&
        updateProyectoDto.codigo !== proyecto.codigo
      ) {
        const existingProyecto = await this.prisma.proyecto.findUnique({
          where: { codigo: updateProyectoDto.codigo },
        });

        if (existingProyecto) {
          throw new ProyectoConflictException(updateProyectoDto.codigo);
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateProyectoDto };

      if (updateProyectoDto.presupuestoTotal) {
        updateData.presupuestoTotal = new Decimal(
          updateProyectoDto.presupuestoTotal,
        );
      }

      if (updateProyectoDto.fechaInicio) {
        updateData.fechaInicio = new Date(updateProyectoDto.fechaInicio);
      }

      if (updateProyectoDto.fechaFinEstimada) {
        updateData.fechaFinEstimada = new Date(
          updateProyectoDto.fechaFinEstimada,
        );
      }

      if (updateProyectoDto.fechaFinReal) {
        updateData.fechaFinReal = new Date(updateProyectoDto.fechaFinReal);
      }

      // Actualizar el proyecto
      const proyectoActualizado = await this.prisma.proyecto.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'Proyecto',
        id.toString(),
        { cambios: updateProyectoDto },
      );

      return proyectoActualizado;
    } catch (error) {
      // Si no es una de nuestras excepciones personalizadas, la mapeamos
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof ProyectoConflictException) &&
        !(error instanceof ProyectoClosedException)
      ) {
        throw PrismaErrorMapper.map(error, 'proyecto', 'actualizar', {
          id,
          dto: updateProyectoDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si el proyecto existe
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id },
        include: {
          etapas: true,
          asignacionesEmpleados: true,
          documentos: true,
          notas: true,
        },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(id);
      }

      // Verificar si el proyecto tiene elementos dependientes
      if (proyecto.etapas.length > 0) {
        throw new ProyectoDependenciesException(id, ['etapas']);
      }

      // Usar una transacción para eliminar todas las entidades relacionadas
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar asignaciones
        if (proyecto.asignacionesEmpleados.length > 0) {
          await prisma.asignacionEmpleadoProyecto.deleteMany({
            where: { proyectoId: id },
          });
        }

        // Eliminar documentos
        if (proyecto.documentos.length > 0) {
          await prisma.documentoProyecto.deleteMany({
            where: { proyectoId: id },
          });
        }

        // Eliminar notas
        if (proyecto.notas.length > 0) {
          await prisma.notaProyecto.deleteMany({
            where: { proyectoId: id },
          });
        }

        // Finalmente eliminar el proyecto
        await prisma.proyecto.delete({
          where: { id },
        });
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'Proyecto',
        id.toString(),
        {
          codigo: proyecto.codigo,
          nombre: proyecto.nombre,
        },
      );
    } catch (error) {
      // Si no es una de nuestras excepciones personalizadas, la mapeamos
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof ProyectoDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'proyecto', 'eliminar', { id });
      }
      throw error;
    }
  }

  async getStats() {
    try {
      const totalProyectos = await this.prisma.proyecto.count();

      const proyectosPorEstado = await this.prisma.proyecto.groupBy({
        by: ['estado'],
        _count: true,
      });

      const presupuestoTotal = await this.prisma.proyecto.aggregate({
        _sum: {
          presupuestoTotal: true,
        },
      });

      return {
        totalProyectos,
        proyectosPorEstado,
        presupuestoTotal: presupuestoTotal._sum.presupuestoTotal,
      };
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'proyecto', 'estadísticas', {});
    }
  }

  /**
   * Método auxiliar para verificar que un proyecto existe y obtenerlo
   * @param id ID del proyecto
   * @param includes Relaciones a incluir en la consulta
   * @returns El proyecto encontrado
   * @throws ProyectoNotFoundException si el proyecto no existe
   */
  private async getProyectoOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(id);
      }

      return proyecto;
    } catch (error) {
      if (!(error instanceof ProyectoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'proyecto', 'consultar', { id });
      }
      throw error;
    }
  }

  /**
   * Verifica si un proyecto está en uno de los estados permitidos
   * @param id ID del proyecto
   * @param allowedStates Estados permitidos
   * @throws ProyectoInvalidStateException si el estado no es permitido
   */
  private async verifyProyectoState(
    id: number,
    allowedStates: string[],
  ): Promise<void> {
    const proyecto = await this.getProyectoOrFail(id);

    if (!allowedStates.includes(proyecto.estado)) {
      throw new ProyectoInvalidStateException(
        id,
        proyecto.estado,
        allowedStates,
      );
    }
  }

  /**
   * Verifica si un proyecto puede ser modificado (no está finalizado ni cancelado)
   * @param id ID del proyecto
   * @throws ProyectoClosedException si el proyecto está finalizado o cancelado
   */
  private async verifyProyectoEditable(id: number): Promise<void> {
    const proyecto = await this.getProyectoOrFail(id);

    if (['finalizado', 'cancelado'].includes(proyecto.estado)) {
      throw new ProyectoClosedException(id, proyecto.estado);
    }
  }
}

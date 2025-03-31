// src/proyectos/asignaciones/asignaciones.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateAsignacionProyectoDto } from './dto/create-asignacion-proyecto.dto';
import { UpdateAsignacionProyectoDto } from './dto/update-asignacion-proyecto.dto';
import { CreateAsignacionTareaDto } from './dto/create-asignacion-tarea.dto';
import { UpdateAsignacionTareaDto } from './dto/update-asignacion-tarea.dto';
import {
  ProyectoNotFoundException,
  ProyectoClosedException,
  TareaNotFoundException,
  AsignacionProyectoNotFoundException,
  AsignacionProyectoConflictException,
  AsignacionTareaNotFoundException,
  AsignacionTareaConflictException,
} from '../exceptions';
import { UsuarioNotFoundException } from '../../usuarios/exceptions';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';

@Injectable()
export class AsignacionesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  // Asignaciones de Proyecto

  async findAllProyectoAsignaciones(
    proyectoId?: number,
    usuarioId?: number,
    activo?: boolean,
  ) {
    try {
      const where: any = {};

      if (proyectoId !== undefined) {
        where.proyectoId = proyectoId;

        // Verificar que el proyecto existe si se especifica proyectoId
        const proyecto = await this.prisma.proyecto.findUnique({
          where: { id: proyectoId },
        });

        if (!proyecto) {
          throw new ProyectoNotFoundException(proyectoId);
        }
      }

      if (usuarioId !== undefined) {
        where.usuarioId = usuarioId;

        // Verificar que el usuario existe si se especifica usuarioId
        const usuario = await this.prisma.usuario.findUnique({
          where: { id: usuarioId },
        });

        if (!usuario) {
          throw new UsuarioNotFoundException(usuarioId);
        }
      }

      if (activo !== undefined) {
        where.activo = activo;
      }

      return this.prisma.asignacionProyecto.findMany({
        where,
        include: {
          proyecto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              estado: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
        orderBy: [{ proyectoId: 'asc' }, { fechaAsignacion: 'desc' }],
      });
    } catch (error) {
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof UsuarioNotFoundException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionProyecto', 'consultar', {
          proyectoId,
          usuarioId,
          activo,
        });
      }
      throw error;
    }
  }

  async findProyectoAsignacionById(id: number) {
    try {
      const asignacion = await this.prisma.asignacionProyecto.findUnique({
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
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      if (!asignacion) {
        throw new AsignacionProyectoNotFoundException(id);
      }

      return asignacion;
    } catch (error) {
      if (!(error instanceof AsignacionProyectoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacionProyecto', 'consultar', {
          id,
        });
      }
      throw error;
    }
  }
  async createProyectoAsignacion(
    createDto: CreateAsignacionProyectoDto,
    usuarioCreadorId: number,
  ) {
    try {
      // Verificar si el proyecto existe
      const proyecto = await this.prisma.proyecto.findUnique({
        where: { id: createDto.proyectoId },
      });

      if (!proyecto) {
        throw new ProyectoNotFoundException(createDto.proyectoId);
      }

      // Verificar si el proyecto está en un estado que permite asignar
      if (['finalizado', 'cancelado'].includes(proyecto.estado)) {
        throw new ProyectoClosedException(
          createDto.proyectoId,
          proyecto.estado,
        );
      }

      // Verificar si el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createDto.usuarioId },
      });

      if (!usuario) {
        throw new UsuarioNotFoundException(createDto.usuarioId);
      }

      // Verificar si ya existe una asignación activa para este usuario, proyecto y rol
      const existingAsignacion = await this.prisma.asignacionProyecto.findFirst(
        {
          where: {
            proyectoId: createDto.proyectoId,
            usuarioId: createDto.usuarioId,
            rol: createDto.rol,
            activo: true,
          },
        },
      );

      if (existingAsignacion) {
        throw new AsignacionProyectoConflictException(
          existingAsignacion.id,
          'rol',
          createDto.rol,
        );
      }

      // Crear la asignación
      const nuevaAsignacion = await this.prisma.asignacionProyecto.create({
        data: createDto,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioCreadorId,
        'inserción',
        'AsignacionProyecto',
        nuevaAsignacion.id.toString(),
        {
          proyectoId: nuevaAsignacion.proyectoId,
          usuarioId: nuevaAsignacion.usuarioId,
          rol: nuevaAsignacion.rol,
        },
      );

      return nuevaAsignacion;
    } catch (error) {
      if (
        !(error instanceof ProyectoNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof UsuarioNotFoundException) &&
        !(error instanceof AsignacionProyectoConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionProyecto', 'crear', {
          dto: createDto,
        });
      }
      throw error;
    }
  }

  async updateProyectoAsignacion(
    id: number,
    updateDto: UpdateAsignacionProyectoDto,
    usuarioModificadorId: number,
  ) {
    try {
      // Verificar si la asignación existe
      const asignacion = await this.prisma.asignacionProyecto.findUnique({
        where: { id },
        include: {
          proyecto: true,
        },
      });

      if (!asignacion) {
        throw new AsignacionProyectoNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite modificar
      if (['finalizado', 'cancelado'].includes(asignacion.proyecto.estado)) {
        throw new ProyectoClosedException(
          asignacion.proyectoId,
          asignacion.proyecto.estado,
        );
      }

      // Verificar si se está cambiando el rol y si ya existe una asignación para ese rol
      if (updateDto.rol && updateDto.rol !== asignacion.rol) {
        const existingAsignacion =
          await this.prisma.asignacionProyecto.findFirst({
            where: {
              proyectoId: asignacion.proyectoId,
              usuarioId: asignacion.usuarioId,
              rol: updateDto.rol,
              activo: true,
              id: { not: id }, // Excluir la asignación actual
            },
          });

        if (existingAsignacion) {
          throw new AsignacionProyectoConflictException(
            existingAsignacion.id,
            'rol',
            updateDto.rol,
          );
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateDto };

      if (updateDto.fechaDesasignacion) {
        updateData.fechaDesasignacion = new Date(updateDto.fechaDesasignacion);

        // Si se establece fecha de desasignación, automáticamente actualizar activo a false
        if (!updateDto.hasOwnProperty('activo')) {
          updateData.activo = false;
        }
      }

      // Actualizar la asignación
      const asignacionActualizada = await this.prisma.asignacionProyecto.update(
        {
          where: { id },
          data: updateData,
        },
      );

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioModificadorId,
        'actualización',
        'AsignacionProyecto',
        id.toString(),
        { cambios: updateDto },
      );

      return asignacionActualizada;
    } catch (error) {
      if (
        !(error instanceof AsignacionProyectoNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof AsignacionProyectoConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionProyecto', 'actualizar', {
          id,
          dto: updateDto,
        });
      }
      throw error;
    }
  }
  async deleteProyectoAsignacion(id: number, usuarioEliminadorId: number) {
    try {
      // Verificar si la asignación existe
      const asignacion = await this.prisma.asignacionProyecto.findUnique({
        where: { id },
        include: {
          proyecto: true,
        },
      });

      if (!asignacion) {
        throw new AsignacionProyectoNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite eliminar
      if (['finalizado', 'cancelado'].includes(asignacion.proyecto.estado)) {
        throw new ProyectoClosedException(
          asignacion.proyectoId,
          asignacion.proyecto.estado,
        );
      }

      // Eliminar la asignación
      await this.prisma.asignacionProyecto.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioEliminadorId,
        'borrado',
        'AsignacionProyecto',
        id.toString(),
        {
          proyectoId: asignacion.proyectoId,
          usuarioId: asignacion.usuarioId,
          rol: asignacion.rol,
        },
      );
    } catch (error) {
      if (
        !(error instanceof AsignacionProyectoNotFoundException) &&
        !(error instanceof ProyectoClosedException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionProyecto', 'eliminar', {
          id,
        });
      }
      throw error;
    }
  }

  // Asignaciones de Tarea

  async findAllTareaAsignaciones(
    tareaId?: number,
    usuarioId?: number,
    activo?: boolean,
  ) {
    try {
      const where: any = {};

      if (tareaId !== undefined) {
        where.tareaId = tareaId;

        // Verificar que la tarea existe si se especifica tareaId
        const tarea = await this.prisma.tareaProyecto.findUnique({
          where: { id: tareaId },
        });

        if (!tarea) {
          throw new TareaNotFoundException(tareaId);
        }
      }

      if (usuarioId !== undefined) {
        where.usuarioId = usuarioId;

        // Verificar que el usuario existe si se especifica usuarioId
        const usuario = await this.prisma.usuario.findUnique({
          where: { id: usuarioId },
        });

        if (!usuario) {
          throw new UsuarioNotFoundException(usuarioId);
        }
      }

      if (activo !== undefined) {
        where.activo = activo;
      }

      return this.prisma.asignacionTarea.findMany({
        where,
        include: {
          tarea: {
            select: {
              id: true,
              nombre: true,
              estado: true,
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
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
        orderBy: [{ tareaId: 'asc' }, { fechaAsignacion: 'desc' }],
      });
    } catch (error) {
      if (
        !(error instanceof TareaNotFoundException) &&
        !(error instanceof UsuarioNotFoundException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionTarea', 'consultar', {
          tareaId,
          usuarioId,
          activo,
        });
      }
      throw error;
    }
  }

  async findTareaAsignacionById(id: number) {
    try {
      const asignacion = await this.prisma.asignacionTarea.findUnique({
        where: { id },
        include: {
          tarea: {
            select: {
              id: true,
              nombre: true,
              estado: true,
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
            },
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      if (!asignacion) {
        throw new AsignacionTareaNotFoundException(id);
      }

      return asignacion;
    } catch (error) {
      if (!(error instanceof AsignacionTareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacionTarea', 'consultar', {
          id,
        });
      }
      throw error;
    }
  }
  async createTareaAsignacion(
    createDto: CreateAsignacionTareaDto,
    usuarioCreadorId: number,
  ) {
    try {
      // Verificar si la tarea existe
      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id: createDto.tareaId },
        include: {
          etapa: {
            include: {
              proyecto: true,
            },
          },
        },
      });

      if (!tarea) {
        throw new TareaNotFoundException(createDto.tareaId);
      }

      // Verificar si el proyecto está en un estado que permite asignar tareas
      if (['finalizado', 'cancelado'].includes(tarea.etapa.proyecto.estado)) {
        throw new ProyectoClosedException(
          tarea.etapa.proyecto.id,
          tarea.etapa.proyecto.estado,
        );
      }

      // Verificar si el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createDto.usuarioId },
      });

      if (!usuario) {
        throw new UsuarioNotFoundException(createDto.usuarioId);
      }

      // Verificar si ya existe una asignación activa para este usuario y tarea
      const existingAsignacion = await this.prisma.asignacionTarea.findFirst({
        where: {
          tareaId: createDto.tareaId,
          usuarioId: createDto.usuarioId,
          activo: true,
        },
      });

      if (existingAsignacion) {
        throw new AsignacionTareaConflictException(
          existingAsignacion.id,
          'usuario',
          createDto.usuarioId,
        );
      }

      // Crear la asignación
      const nuevaAsignacion = await this.prisma.asignacionTarea.create({
        data: createDto,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioCreadorId,
        'inserción',
        'AsignacionTarea',
        nuevaAsignacion.id.toString(),
        {
          tareaId: nuevaAsignacion.tareaId,
          usuarioId: nuevaAsignacion.usuarioId,
        },
      );

      return nuevaAsignacion;
    } catch (error) {
      if (
        !(error instanceof TareaNotFoundException) &&
        !(error instanceof ProyectoClosedException) &&
        !(error instanceof UsuarioNotFoundException) &&
        !(error instanceof AsignacionTareaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionTarea', 'crear', {
          dto: createDto,
        });
      }
      throw error;
    }
  }

  async updateTareaAsignacion(
    id: number,
    updateDto: UpdateAsignacionTareaDto,
    usuarioModificadorId: number,
  ) {
    try {
      // Verificar si la asignación existe
      const asignacion = await this.prisma.asignacionTarea.findUnique({
        where: { id },
        include: {
          tarea: {
            include: {
              etapa: {
                include: {
                  proyecto: true,
                },
              },
            },
          },
        },
      });

      if (!asignacion) {
        throw new AsignacionTareaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite modificar asignaciones
      if (
        ['finalizado', 'cancelado'].includes(
          asignacion.tarea.etapa.proyecto.estado,
        )
      ) {
        throw new ProyectoClosedException(
          asignacion.tarea.etapa.proyecto.id,
          asignacion.tarea.etapa.proyecto.estado,
        );
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateDto };

      if (updateDto.fechaDesasignacion) {
        updateData.fechaDesasignacion = new Date(updateDto.fechaDesasignacion);

        // Si se establece fecha de desasignación, automáticamente actualizar activo a false
        if (!updateDto.hasOwnProperty('activo')) {
          updateData.activo = false;
        }
      }

      // Actualizar la asignación
      const asignacionActualizada = await this.prisma.asignacionTarea.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioModificadorId,
        'actualización',
        'AsignacionTarea',
        id.toString(),
        { cambios: updateDto },
      );

      return asignacionActualizada;
    } catch (error) {
      if (
        !(error instanceof AsignacionTareaNotFoundException) &&
        !(error instanceof ProyectoClosedException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionTarea', 'actualizar', {
          id,
          dto: updateDto,
        });
      }
      throw error;
    }
  }

  async deleteTareaAsignacion(id: number, usuarioEliminadorId: number) {
    try {
      // Verificar si la asignación existe
      const asignacion = await this.prisma.asignacionTarea.findUnique({
        where: { id },
        include: {
          tarea: {
            include: {
              etapa: {
                include: {
                  proyecto: true,
                },
              },
            },
          },
        },
      });

      if (!asignacion) {
        throw new AsignacionTareaNotFoundException(id);
      }

      // Verificar si el proyecto está en un estado que permite eliminar asignaciones
      if (
        ['finalizado', 'cancelado'].includes(
          asignacion.tarea.etapa.proyecto.estado,
        )
      ) {
        throw new ProyectoClosedException(
          asignacion.tarea.etapa.proyecto.id,
          asignacion.tarea.etapa.proyecto.estado,
        );
      }

      // Eliminar la asignación
      await this.prisma.asignacionTarea.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioEliminadorId,
        'borrado',
        'AsignacionTarea',
        id.toString(),
        {
          tareaId: asignacion.tareaId,
          usuarioId: asignacion.usuarioId,
        },
      );
    } catch (error) {
      if (
        !(error instanceof AsignacionTareaNotFoundException) &&
        !(error instanceof ProyectoClosedException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacionTarea', 'eliminar', {
          id,
        });
      }
      throw error;
    }
  }
}

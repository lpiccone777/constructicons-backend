import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateAsignacionProyectoDto } from './dto/create-asignacion-proyecto.dto';
import { UpdateAsignacionProyectoDto } from './dto/update-asignacion-proyecto.dto';
import { CreateAsignacionTareaDto } from './dto/create-asignacion-tarea.dto';
import { UpdateAsignacionTareaDto } from './dto/update-asignacion-tarea.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  // Asignaciones de Proyecto

  async findAllProyectoAsignaciones(proyectoId?: number, usuarioId?: number, activo?: boolean) {
    const where: any = {};
    
    if (proyectoId !== undefined) {
      where.proyectoId = proyectoId;
    }
    
    if (usuarioId !== undefined) {
      where.usuarioId = usuarioId;
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
            estado: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: [
        { proyectoId: 'asc' },
        { fechaAsignacion: 'desc' }
      ]
    });
  }

  async findProyectoAsignacionById(id: number) {
    const asignacion = await this.prisma.asignacionProyecto.findUnique({
      where: { id },
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            estado: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de proyecto con ID ${id} no encontrada`);
    }

    return asignacion;
  }

  async createProyectoAsignacion(createDto: CreateAsignacionProyectoDto, usuarioCreadorId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: createDto.proyectoId }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${createDto.proyectoId} no encontrado`);
    }

    // Verificar si el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: createDto.usuarioId }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createDto.usuarioId} no encontrado`);
    }

    // Verificar si ya existe una asignación activa para este usuario, proyecto y rol
    const existingAsignacion = await this.prisma.asignacionProyecto.findFirst({
      where: {
        proyectoId: createDto.proyectoId,
        usuarioId: createDto.usuarioId,
        rol: createDto.rol,
        activo: true
      }
    });

    if (existingAsignacion) {
      throw new ConflictException(`Ya existe una asignación activa para este usuario con el rol ${createDto.rol} en este proyecto`);
    }

    // Crear la asignación
    const nuevaAsignacion = await this.prisma.asignacionProyecto.create({
      data: createDto
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
        rol: nuevaAsignacion.rol
      }
    );

    return nuevaAsignacion;
  }

  async updateProyectoAsignacion(id: number, updateDto: UpdateAsignacionProyectoDto, usuarioModificadorId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionProyecto.findUnique({
      where: { id }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de proyecto con ID ${id} no encontrada`);
    }

    // Verificar si se está cambiando el rol y si ya existe una asignación para ese rol
    if (updateDto.rol && updateDto.rol !== asignacion.rol) {
      const existingAsignacion = await this.prisma.asignacionProyecto.findFirst({
        where: {
          proyectoId: asignacion.proyectoId,
          usuarioId: asignacion.usuarioId,
          rol: updateDto.rol,
          activo: true,
          id: { not: id }  // Excluir la asignación actual
        }
      });

      if (existingAsignacion) {
        throw new ConflictException(`Ya existe una asignación activa para este usuario con el rol ${updateDto.rol} en este proyecto`);
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
    const asignacionActualizada = await this.prisma.asignacionProyecto.update({
      where: { id },
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioModificadorId,
      'actualización',
      'AsignacionProyecto',
      id.toString(),
      { cambios: updateDto }
    );

    return asignacionActualizada;
  }

  async deleteProyectoAsignacion(id: number, usuarioEliminadorId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionProyecto.findUnique({
      where: { id }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de proyecto con ID ${id} no encontrada`);
    }

    // Eliminar la asignación
    await this.prisma.asignacionProyecto.delete({
      where: { id }
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
        rol: asignacion.rol
      }
    );
  }

  // Asignaciones de Tarea

  async findAllTareaAsignaciones(tareaId?: number, usuarioId?: number, activo?: boolean) {
    const where: any = {};
    
    if (tareaId !== undefined) {
      where.tareaId = tareaId;
    }
    
    if (usuarioId !== undefined) {
      where.usuarioId = usuarioId;
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
                    nombre: true
                  }
                }
              }
            }
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: [
        { tareaId: 'asc' },
        { fechaAsignacion: 'desc' }
      ]
    });
  }

  async findTareaAsignacionById(id: number) {
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
                    nombre: true
                  }
                }
              }
            }
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de tarea con ID ${id} no encontrada`);
    }

    return asignacion;
  }

  async createTareaAsignacion(createDto: CreateAsignacionTareaDto, usuarioCreadorId: number) {
    // Verificar si la tarea existe
    const tarea = await this.prisma.tareaProyecto.findUnique({
      where: { id: createDto.tareaId },
      include: {
        etapa: {
          include: {
            proyecto: true
          }
        }
      }
    });

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${createDto.tareaId} no encontrada`);
    }

    // Verificar si el proyecto está en un estado que permite asignar tareas
    if (tarea.etapa.proyecto.estado === 'finalizado' || tarea.etapa.proyecto.estado === 'cancelado') {
      throw new ConflictException(`No se pueden asignar tareas en un proyecto ${tarea.etapa.proyecto.estado}`);
    }

    // Verificar si el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: createDto.usuarioId }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${createDto.usuarioId} no encontrado`);
    }

    // Verificar si ya existe una asignación activa para este usuario y tarea
    const existingAsignacion = await this.prisma.asignacionTarea.findFirst({
      where: {
        tareaId: createDto.tareaId,
        usuarioId: createDto.usuarioId,
        activo: true
      }
    });

    if (existingAsignacion) {
      throw new ConflictException(`Ya existe una asignación activa para este usuario en esta tarea`);
    }

    // Crear la asignación
    const nuevaAsignacion = await this.prisma.asignacionTarea.create({
      data: createDto
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioCreadorId,
      'inserción',
      'AsignacionTarea',
      nuevaAsignacion.id.toString(),
      {
        tareaId: nuevaAsignacion.tareaId,
        usuarioId: nuevaAsignacion.usuarioId
      }
    );

    return nuevaAsignacion;
  }

  async updateTareaAsignacion(id: number, updateDto: UpdateAsignacionTareaDto, usuarioModificadorId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionTarea.findUnique({
      where: { id },
      include: {
        tarea: {
          include: {
            etapa: {
              include: {
                proyecto: true
              }
            }
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de tarea con ID ${id} no encontrada`);
    }

    // Verificar si el proyecto está en un estado que permite modificar asignaciones
    if (asignacion.tarea.etapa.proyecto.estado === 'finalizado' || asignacion.tarea.etapa.proyecto.estado === 'cancelado') {
      throw new ConflictException(`No se pueden modificar asignaciones en un proyecto ${asignacion.tarea.etapa.proyecto.estado}`);
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
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioModificadorId,
      'actualización',
      'AsignacionTarea',
      id.toString(),
      { cambios: updateDto }
    );

    return asignacionActualizada;
  }

  async deleteTareaAsignacion(id: number, usuarioEliminadorId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionTarea.findUnique({
      where: { id }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de tarea con ID ${id} no encontrada`);
    }

    // Eliminar la asignación
    await this.prisma.asignacionTarea.delete({
      where: { id }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioEliminadorId,
      'borrado',
      'AsignacionTarea',
      id.toString(),
      {
        tareaId: asignacion.tareaId,
        usuarioId: asignacion.usuarioId
      }
    );
  }
}
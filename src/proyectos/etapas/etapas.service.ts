import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateEtapaDto } from './dto/create-etapa.dto';
import { UpdateEtapaDto } from './dto/update-etapa.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EtapasService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(proyectoId?: number) {
    const where = {};
    
    if (proyectoId) {
      where['proyectoId'] = proyectoId;
    }
    
    return this.prisma.etapaProyecto.findMany({
      where,
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        _count: {
          select: { tareas: true }
        }
      },
      orderBy: [
        { proyectoId: 'asc' },
        { orden: 'asc' }
      ]
    });
  }

  async findById(id: number) {
    const etapa = await this.prisma.etapaProyecto.findUnique({
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
        tareas: {
          include: {
            asignado: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    email: true
                  }
                }
              },
              where: { activo: true }
            }
          },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!etapa) {
      throw new NotFoundException(`Etapa con ID ${id} no encontrada`);
    }

    return etapa;
  }

  async create(createEtapaDto: CreateEtapaDto, usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: createEtapaDto.proyectoId }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${createEtapaDto.proyectoId} no encontrado`);
    }

    // Verificar si ya existe una etapa con el mismo orden en este proyecto
    const existingEtapa = await this.prisma.etapaProyecto.findFirst({
      where: {
        proyectoId: createEtapaDto.proyectoId,
        orden: createEtapaDto.orden
      }
    });

    if (existingEtapa) {
      throw new ConflictException(`Ya existe una etapa con el orden ${createEtapaDto.orden} en este proyecto`);
    }

    // Convertir datos de string a tipos apropiados
    const etapaData = {
      ...createEtapaDto,
      presupuesto: new Decimal(createEtapaDto.presupuesto),
      fechaInicio: createEtapaDto.fechaInicio ? new Date(createEtapaDto.fechaInicio) : null,
      fechaFinEstimada: createEtapaDto.fechaFinEstimada ? new Date(createEtapaDto.fechaFinEstimada) : null,
    };

    // Crear la etapa
    const nuevaEtapa = await this.prisma.etapaProyecto.create({
      data: etapaData
    });

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
        presupuesto: nuevaEtapa.presupuesto.toString()
      }
    );

    return nuevaEtapa;
  }

  async update(id: number, updateEtapaDto: UpdateEtapaDto, usuarioId: number) {
    // Verificar si la etapa existe
    const etapa = await this.prisma.etapaProyecto.findUnique({
      where: { id }
    });

    if (!etapa) {
      throw new NotFoundException(`Etapa con ID ${id} no encontrada`);
    }

    // Verificar si se está actualizando el orden y si ya existe
    if (updateEtapaDto.orden && updateEtapaDto.orden !== etapa.orden) {
      const existingEtapa = await this.prisma.etapaProyecto.findFirst({
        where: {
          proyectoId: etapa.proyectoId,
          orden: updateEtapaDto.orden,
          id: { not: id }  // Excluir la etapa actual
        }
      });

      if (existingEtapa) {
        throw new ConflictException(`Ya existe una etapa con el orden ${updateEtapaDto.orden} en este proyecto`);
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

    // Actualizar el estado del proyecto si la etapa cambia a completada
    if (updateEtapaDto.estado === 'completada' && etapa.estado !== 'completada') {
      // Verificar si todas las etapas del proyecto estarán completadas
      const allEtapas = await this.prisma.etapaProyecto.findMany({
        where: { 
          proyectoId: etapa.proyectoId,
          id: { not: id }  // Excluir la etapa actual
        }
      });
      
      const allCompleted = allEtapas.every(e => e.estado === 'completada');
      
      if (allCompleted && allEtapas.length > 0) {
        // Actualizar el proyecto a "finalizado" si todas las etapas están completadas
        await this.prisma.proyecto.update({
          where: { id: etapa.proyectoId },
          data: { estado: 'finalizado' }
        });
      }
    }

    // Actualizar la etapa
    const etapaActualizada = await this.prisma.etapaProyecto.update({
      where: { id },
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'EtapaProyecto',
      id.toString(),
      { cambios: updateEtapaDto }
    );

    return etapaActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la etapa existe
    const etapa = await this.prisma.etapaProyecto.findUnique({
      where: { id },
      include: {
        tareas: true
      }
    });

    if (!etapa) {
      throw new NotFoundException(`Etapa con ID ${id} no encontrada`);
    }

    // Verificar si la etapa tiene tareas asociadas
    if (etapa.tareas.length > 0) {
      throw new ConflictException('No se puede eliminar la etapa porque tiene tareas asociadas');
    }

    // Eliminar la etapa
    await this.prisma.etapaProyecto.delete({
      where: { id }
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
        orden: etapa.orden
      }
    );
  }

  async reordenarEtapas(proyectoId: number, nuevosOrdenes: { id: number, orden: number }[], usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        etapas: true
      }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${proyectoId} no encontrado`);
    }

    // Verificar que todas las etapas pertenezcan a este proyecto
    const etapaIds = proyecto.etapas.map(e => e.id);
    const idsInvalidos = nuevosOrdenes.filter(no => !etapaIds.includes(no.id));

    if (idsInvalidos.length > 0) {
      throw new ConflictException(`Las siguientes etapas no pertenecen a este proyecto: ${idsInvalidos.map(i => i.id).join(', ')}`);
    }

    // Usar una transacción para actualizar todos los órdenes
    await this.prisma.$transaction(
      nuevosOrdenes.map(no => 
        this.prisma.etapaProyecto.update({
          where: { id: no.id },
          data: { orden: no.orden }
        })
      )
    );

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'EtapaProyecto',
      'multiple',
      { accion: 'reordenamiento', proyectoId, etapas: nuevosOrdenes }
    );

    return await this.findAll(proyectoId);
  }
}
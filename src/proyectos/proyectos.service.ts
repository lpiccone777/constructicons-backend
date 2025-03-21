import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProyectosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(query: { estado?: string } = {}) {
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
              select: { tareas: true }
            }
          }
        },
        _count: {
          select: { 
            asignaciones: true,
            documentos: true 
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
  }

  async findById(id: number) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        etapas: {
          include: {
            tareas: true
          },
          orderBy: { orden: 'asc' }
        },
        asignaciones: {
          where: { activo: true },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        documentos: {
          include: {
            usuarioCarga: {
              select: {
                id: true,
                nombre: true
              }
            }
          },
          orderBy: { fechaCarga: 'desc' }
        },
        notas: {
          orderBy: { fechaCreacion: 'desc' },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return proyecto;
  }

  async create(createProyectoDto: CreateProyectoDto, usuarioId: number) {
    // Verificar si ya existe un proyecto con el mismo código
    const existingProyecto = await this.prisma.proyecto.findUnique({
      where: { codigo: createProyectoDto.codigo }
    });

    if (existingProyecto) {
      throw new ConflictException(`Ya existe un proyecto con el código ${createProyectoDto.codigo}`);
    }

    // Convertir datos de string a tipos apropiados
    const proyectoData = {
      ...createProyectoDto,
      presupuestoTotal: new Decimal(createProyectoDto.presupuestoTotal),
      fechaInicio: createProyectoDto.fechaInicio ? new Date(createProyectoDto.fechaInicio) : null,
      fechaFinEstimada: createProyectoDto.fechaFinEstimada ? new Date(createProyectoDto.fechaFinEstimada) : null,
    };

    // Crear el proyecto
    const nuevoProyecto = await this.prisma.proyecto.create({
      data: proyectoData
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
        presupuestoTotal: nuevoProyecto.presupuestoTotal.toString()
      }
    );

    return nuevoProyecto;
  }

  async update(id: number, updateProyectoDto: UpdateProyectoDto, usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    // Verificar si se está actualizando el código y si ya existe
    if (updateProyectoDto.codigo && updateProyectoDto.codigo !== proyecto.codigo) {
      const existingProyecto = await this.prisma.proyecto.findUnique({
        where: { codigo: updateProyectoDto.codigo }
      });

      if (existingProyecto) {
        throw new ConflictException(`Ya existe un proyecto con el código ${updateProyectoDto.codigo}`);
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateProyectoDto };
    
    if (updateProyectoDto.presupuestoTotal) {
      updateData.presupuestoTotal = new Decimal(updateProyectoDto.presupuestoTotal);
    }
    
    if (updateProyectoDto.fechaInicio) {
      updateData.fechaInicio = new Date(updateProyectoDto.fechaInicio);
    }
    
    if (updateProyectoDto.fechaFinEstimada) {
      updateData.fechaFinEstimada = new Date(updateProyectoDto.fechaFinEstimada);
    }
    
    if (updateProyectoDto.fechaFinReal) {
      updateData.fechaFinReal = new Date(updateProyectoDto.fechaFinReal);
    }

    // Actualizar el proyecto
    const proyectoActualizado = await this.prisma.proyecto.update({
      where: { id },
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Proyecto',
      id.toString(),
      { cambios: updateProyectoDto }
    );

    return proyectoActualizado;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: {
        etapas: true,
        asignaciones: true,
        documentos: true,
        notas: true
      }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    // Verificar si el proyecto tiene elementos dependientes
    if (proyecto.etapas.length > 0) {
      throw new ConflictException('No se puede eliminar el proyecto porque tiene etapas asociadas');
    }

    // Usar una transacción para eliminar todas las entidades relacionadas
    await this.prisma.$transaction(async (prisma) => {
      // Eliminar asignaciones
      if (proyecto.asignaciones.length > 0) {
        await prisma.asignacionProyecto.deleteMany({
          where: { proyectoId: id }
        });
      }
      
      // Eliminar documentos
      if (proyecto.documentos.length > 0) {
        await prisma.documentoProyecto.deleteMany({
          where: { proyectoId: id }
        });
      }
      
      // Eliminar notas
      if (proyecto.notas.length > 0) {
        await prisma.notaProyecto.deleteMany({
          where: { proyectoId: id }
        });
      }
      
      // Finalmente eliminar el proyecto
      await prisma.proyecto.delete({
        where: { id }
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
        nombre: proyecto.nombre
      }
    );
  }
  
  async getStats() {
    const totalProyectos = await this.prisma.proyecto.count();
    
    const proyectosPorEstado = await this.prisma.proyecto.groupBy({
      by: ['estado'],
      _count: true
    });
    
    const presupuestoTotal = await this.prisma.proyecto.aggregate({
      _sum: {
        presupuestoTotal: true
      }
    });
    
    return {
      totalProyectos,
      proyectosPorEstado,
      presupuestoTotal: presupuestoTotal._sum.presupuestoTotal
    };
  }
}
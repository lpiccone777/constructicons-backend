import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

@Injectable()
export class NotasService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(proyectoId?: number, usuarioId?: number) {
    const where: any = {};
    
    if (proyectoId !== undefined) {
      where.proyectoId = proyectoId;
    }
    
    if (usuarioId !== undefined) {
      where.usuarioId = usuarioId;
    }
    
    return this.prisma.notaProyecto.findMany({
      where,
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true
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
        { fechaCreacion: 'desc' }
      ]
    });
  }

  async findById(id: number) {
    const nota = await this.prisma.notaProyecto.findUnique({
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

    if (!nota) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    return nota;
  }

  async create(createDto: CreateNotaDto, usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: createDto.proyectoId }
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${createDto.proyectoId} no encontrado`);
    }

    // Crear la nota
    const nuevaNota = await this.prisma.notaProyecto.create({
      data: {
        ...createDto,
        usuarioId
      }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'NotaProyecto',
      nuevaNota.id.toString(),
      {
        proyectoId: nuevaNota.proyectoId,
        esPrivada: nuevaNota.esPrivada
      }
    );

    return nuevaNota;
  }

  async update(id: number, updateDto: UpdateNotaDto, usuarioId: number) {
    // Verificar si la nota existe
    const nota = await this.prisma.notaProyecto.findUnique({
      where: { id }
    });

    if (!nota) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    // Verificar si el usuario es el creador de la nota
    if (nota.usuarioId !== usuarioId) {
      throw new NotFoundException(`Solo el creador de la nota puede modificarla`);
    }

    // Actualizar la nota
    const notaActualizada = await this.prisma.notaProyecto.update({
      where: { id },
      data: updateDto
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'NotaProyecto',
      id.toString(),
      { cambios: updateDto }
    );

    return notaActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la nota existe
    const nota = await this.prisma.notaProyecto.findUnique({
      where: { id }
    });

    if (!nota) {
      throw new NotFoundException(`Nota con ID ${id} no encontrada`);
    }

    // Verificar si el usuario es el creador de la nota
    if (nota.usuarioId !== usuarioId) {
      throw new NotFoundException(`Solo el creador de la nota puede eliminarla`);
    }

    // Eliminar la nota
    await this.prisma.notaProyecto.delete({
      where: { id }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'NotaProyecto',
      id.toString(),
      {
        proyectoId: nota.proyectoId
      }
    );
  }
}
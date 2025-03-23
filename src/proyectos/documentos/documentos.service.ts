import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(proyectoId?: number, tipo?: string) {
    const where: any = {};

    if (proyectoId !== undefined) {
      where.proyectoId = proyectoId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    return this.prisma.documentoProyecto.findMany({
      where,
      include: {
        proyecto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        usuarioCarga: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: [{ proyectoId: 'asc' }, { fechaCarga: 'desc' }],
    });
  }

  async findById(id: number) {
    const documento = await this.prisma.documentoProyecto.findUnique({
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
        usuarioCarga: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return documento;
  }

  async create(createDto: CreateDocumentoDto, usuarioId: number) {
    // Verificar si el proyecto existe
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: createDto.proyectoId },
    });

    if (!proyecto) {
      throw new NotFoundException(
        `Proyecto con ID ${createDto.proyectoId} no encontrado`,
      );
    }

    // Crear el documento
    const nuevoDocumento = await this.prisma.documentoProyecto.create({
      data: {
        ...createDto,
        usuarioCargaId: usuarioId,
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'DocumentoProyecto',
      nuevoDocumento.id.toString(),
      {
        proyectoId: nuevoDocumento.proyectoId,
        nombre: nuevoDocumento.nombre,
        tipo: nuevoDocumento.tipo,
      },
    );

    return nuevoDocumento;
  }

  async update(id: number, updateDto: UpdateDocumentoDto, usuarioId: number) {
    // Verificar si el documento existe
    const documento = await this.prisma.documentoProyecto.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Actualizar el documento
    const documentoActualizado = await this.prisma.documentoProyecto.update({
      where: { id },
      data: updateDto,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'DocumentoProyecto',
      id.toString(),
      { cambios: updateDto },
    );

    return documentoActualizado;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si el documento existe
    const documento = await this.prisma.documentoProyecto.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    // Eliminar el documento
    await this.prisma.documentoProyecto.delete({
      where: { id },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'DocumentoProyecto',
      id.toString(),
      {
        proyectoId: documento.proyectoId,
        nombre: documento.nombre,
        tipo: documento.tipo,
      },
    );
  }
}

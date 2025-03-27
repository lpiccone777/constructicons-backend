import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGremioEspecialidadDto } from './dto/create-gremio-especialidad.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class GremioEspecialidadService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateGremioEspecialidadDto, usuarioId: number) {
    // Verificar que no exista ya la asociación
    const existente = await this.prisma.gremioEspecialidad.findUnique({
      where: {
        gremioId_especialidadId: {
          gremioId: createDto.gremioId,
          especialidadId: createDto.especialidadId,
        },
      },
    });
    if (existente) {
      throw new ConflictException(
        `La especialidad con ID ${createDto.especialidadId} ya está asociada al gremio con ID ${createDto.gremioId}`
      );
    }
    const relacion = await this.prisma.gremioEspecialidad.create({
      data: createDto,
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'GremioEspecialidad',
      relacion.id.toString(),
      { gremioId: relacion.gremioId, especialidadId: relacion.especialidadId }
    );
    return relacion;
  }

  async findAll() {
    return this.prisma.gremioEspecialidad.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const relacion = await this.prisma.gremioEspecialidad.findUnique({
      where: { id },
    });
    if (!relacion) {
      throw new NotFoundException(`No se encontró la asociación con ID ${id}`);
    }
    return relacion;
  }

  async delete(id: number, usuarioId: number) {
    await this.findOne(id);
    const deleted = await this.prisma.gremioEspecialidad.delete({
      where: { id },
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'GremioEspecialidad',
      id.toString(),
      {}
    );
    return deleted;
  }
}

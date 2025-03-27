import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGremioDto } from './dto/create-gremio.dto';
import { UpdateGremioDto } from './dto/update-gremio.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class GremiosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateGremioDto, usuarioId: number) {
    const existente = await this.prisma.gremio.findUnique({
      where: { codigo: createDto.codigo },
    });
    if (existente) {
      throw new ConflictException(`Ya existe un gremio con el código ${createDto.codigo}`);
    }
    const gremio = await this.prisma.gremio.create({
      data: createDto,
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'Gremio',
      gremio.id.toString(),
      { codigo: gremio.codigo, nombre: gremio.nombre }
    );
    return gremio;
  }

  async findAll() {
    return this.prisma.gremio.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const gremio = await this.prisma.gremio.findUnique({
      where: { id },
    });
    if (!gremio) {
      throw new NotFoundException(`Gremio con ID ${id} no encontrado`);
    }
    return gremio;
  }

  async update(id: number, updateDto: UpdateGremioDto, usuarioId: number) {
    await this.findOne(id);
    const updated = await this.prisma.gremio.update({
      where: { id },
      data: updateDto,
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Gremio',
      id.toString(),
      { cambios: updateDto }
    );
    return updated;
  }

  async delete(id: number, usuarioId: number) {
    const gremio = await this.findOne(id);
    const deleted = await this.prisma.gremio.delete({
      where: { id },
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'Gremio',
      id.toString(),
      { codigo: gremio.codigo, nombre: gremio.nombre }
    );
    return deleted;
  }
}

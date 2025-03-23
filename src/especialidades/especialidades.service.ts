// src/especialidades/especialidades.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EspecialidadesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    return this.prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findById(id: number) {
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id },
      include: {
        empleados: {
          include: {
            empleado: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                apellido: true,
              },
            },
          },
          where: {
            fechaHasta: null, // Solo asignaciones vigentes
          },
        },
      },
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }

    return especialidad;
  }

  async create(
    createEspecialidadDto: CreateEspecialidadDto,
    usuarioId: number,
  ) {
    // Verificar si ya existe una especialidad con el mismo código
    const existingEspecialidad = await this.prisma.especialidad.findUnique({
      where: { codigo: createEspecialidadDto.codigo },
    });

    if (existingEspecialidad) {
      throw new ConflictException(
        `Ya existe una especialidad con el código ${createEspecialidadDto.codigo}`,
      );
    }

    // Convertir datos de string a tipos apropiados
    const especialidadData = {
      ...createEspecialidadDto,
      valorHoraBase: new Decimal(createEspecialidadDto.valorHoraBase),
    };

    // Crear la especialidad
    const nuevaEspecialidad = await this.prisma.especialidad.create({
      data: especialidadData,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'Especialidad',
      nuevaEspecialidad.id.toString(),
      {
        codigo: nuevaEspecialidad.codigo,
        nombre: nuevaEspecialidad.nombre,
      },
    );

    return nuevaEspecialidad;
  }

  async update(
    id: number,
    updateEspecialidadDto: UpdateEspecialidadDto,
    usuarioId: number,
  ) {
    // Verificar si la especialidad existe
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id },
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }

    // Verificar si se está actualizando el código y si ya existe
    if (
      updateEspecialidadDto.codigo &&
      updateEspecialidadDto.codigo !== especialidad.codigo
    ) {
      const existingEspecialidad = await this.prisma.especialidad.findUnique({
        where: { codigo: updateEspecialidadDto.codigo },
      });

      if (existingEspecialidad) {
        throw new ConflictException(
          `Ya existe una especialidad con el código ${updateEspecialidadDto.codigo}`,
        );
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateEspecialidadDto };

    if (updateEspecialidadDto.valorHoraBase) {
      updateData.valorHoraBase = new Decimal(
        updateEspecialidadDto.valorHoraBase,
      );
    }

    // Actualizar la especialidad
    const especialidadActualizada = await this.prisma.especialidad.update({
      where: { id },
      data: updateData,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Especialidad',
      id.toString(),
      { cambios: updateEspecialidadDto },
    );

    return especialidadActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la especialidad existe
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id },
      include: {
        empleados: {
          where: {
            fechaHasta: null, // Solo asignaciones vigentes
          },
        },
      },
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }

    // Verificar si la especialidad tiene empleados asignados vigentes
    if (especialidad.empleados.length > 0) {
      throw new ConflictException(
        `No se puede eliminar la especialidad porque tiene ${especialidad.empleados.length} empleados asignados actualmente`,
      );
    }

    // Eliminar la especialidad
    await this.prisma.especialidad.delete({
      where: { id },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'Especialidad',
      id.toString(),
      {
        codigo: especialidad.codigo,
        nombre: especialidad.nombre,
      },
    );
  }
}

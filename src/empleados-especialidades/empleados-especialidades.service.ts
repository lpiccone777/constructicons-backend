// src/empleados-especialidades/empleados-especialidades.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEmpleadoEspecialidadDto } from './dto/create-empleado-especialidad.dto';
import { UpdateEmpleadoEspecialidadDto } from './dto/update-empleado-especialidad.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EmpleadosEspecialidadesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(
    filters: { empleadoId?: number; especialidadId?: number } = {},
  ) {
    const where: any = {};

    if (filters.empleadoId) {
      where.empleadoId = filters.empleadoId;
    }

    if (filters.especialidadId) {
      where.especialidadId = filters.especialidadId;
    }

    // Por defecto, solo traer asignaciones vigentes
    where.fechaHasta = null;

    return this.prisma.empleadoEspecialidad.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            apellido: true,
          },
        },
        especialidad: true,
      },
      orderBy: { fechaDesde: 'desc' },
    });
  }

  async findById(id: number) {
    const asignacion = await this.prisma.empleadoEspecialidad.findUnique({
      where: { id },
      include: {
        empleado: true,
        especialidad: true,
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de especialidad con ID ${id} no encontrada`,
      );
    }

    return asignacion;
  }

  async create(createDto: CreateEmpleadoEspecialidadDto, usuarioId: number) {
    // Verificar si el empleado existe
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: createDto.empleadoId },
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con ID ${createDto.empleadoId} no encontrado`,
      );
    }

    // Verificar si la especialidad existe
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id: createDto.especialidadId },
    });

    if (!especialidad) {
      throw new NotFoundException(
        `Especialidad con ID ${createDto.especialidadId} no encontrada`,
      );
    }

    // Verificar si ya existe una asignación vigente para esta especialidad y empleado
    const existingAsignacion = await this.prisma.empleadoEspecialidad.findFirst(
      {
        where: {
          empleadoId: createDto.empleadoId,
          especialidadId: createDto.especialidadId,
          fechaHasta: null, // Solo vigentes
        },
      },
    );

    if (existingAsignacion) {
      throw new ConflictException(
        `Este empleado ya tiene asignada esta especialidad`,
      );
    }

    // Si es especialidad principal, actualizar las demás como no principales
    if (createDto.esPrincipal) {
      await this.prisma.empleadoEspecialidad.updateMany({
        where: {
          empleadoId: createDto.empleadoId,
          esPrincipal: true,
          fechaHasta: null,
        },
        data: {
          esPrincipal: false,
        },
      });
    }

    // Crear la asignación
    const nuevaAsignacion = await this.prisma.empleadoEspecialidad.create({
      data: {
        empleadoId: createDto.empleadoId,
        especialidadId: createDto.especialidadId,
        valorHora: new Decimal(createDto.valorHora),
        certificaciones: createDto.certificaciones || [],
        nivelExperiencia: createDto.nivelExperiencia || 'medio',
        esPrincipal: createDto.esPrincipal || false,
        observaciones: createDto.observaciones,
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'EmpleadoEspecialidad',
      nuevaAsignacion.id.toString(),
      {
        empleadoId: nuevaAsignacion.empleadoId,
        especialidadId: nuevaAsignacion.especialidadId,
        valorHora: nuevaAsignacion.valorHora.toString(),
      },
    );

    return nuevaAsignacion;
  }

  async update(
    id: number,
    updateDto: UpdateEmpleadoEspecialidadDto,
    usuarioId: number,
  ) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.empleadoEspecialidad.findUnique({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de especialidad con ID ${id} no encontrada`,
      );
    }

    // Si se está marcando como principal, actualizar las demás
    if (updateDto.esPrincipal) {
      await this.prisma.empleadoEspecialidad.updateMany({
        where: {
          empleadoId: asignacion.empleadoId,
          id: { not: id },
          esPrincipal: true,
          fechaHasta: null,
        },
        data: {
          esPrincipal: false,
        },
      });
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateDto };

    if (updateDto.valorHora) {
      updateData.valorHora = new Decimal(updateDto.valorHora);
    }

    if (updateDto.fechaHasta) {
      updateData.fechaHasta = new Date(updateDto.fechaHasta);
    }

    // Actualizar la asignación
    const asignacionActualizada = await this.prisma.empleadoEspecialidad.update(
      {
        where: { id },
        data: updateData,
      },
    );

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'EmpleadoEspecialidad',
      id.toString(),
      { cambios: updateDto },
    );

    return asignacionActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.empleadoEspecialidad.findUnique({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de especialidad con ID ${id} no encontrada`,
      );
    }

    // Eliminar la asignación (soft delete por fechaHasta)
    const asignacionActualizada = await this.prisma.empleadoEspecialidad.update(
      {
        where: { id },
        data: {
          fechaHasta: new Date(),
        },
      },
    );

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'eliminación',
      'EmpleadoEspecialidad',
      id.toString(),
      {
        empleadoId: asignacion.empleadoId,
        especialidadId: asignacion.especialidadId,
      },
    );

    return asignacionActualizada;
  }
}

// src/empleados/empleados.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(filters: { estado?: string; gremioId?: number } = {}) {
    const where: any = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.gremioId) {
      where.gremioId = filters.gremioId;
    }

    return this.prisma.empleado.findMany({
      where,
      include: {
        gremio: {
          select: {
            id: true,
            nombre: true,
          },
        },
        especialidades: {
          include: {
            especialidad: true,
          },
          where: {
            fechaHasta: null, // Solo especialidades vigentes
          },
        },
      },
      orderBy: { apellido: 'asc' },
    });
  }

  async findById(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        gremio: true,
        especialidades: {
          include: {
            especialidad: true,
          },
        },
        disponibilidad: {
          orderBy: { fechaInicio: 'desc' },
          take: 5,
        },
        asignacionesProyecto: {
          where: { activo: true },
          include: {
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
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async create(createEmpleadoDto: CreateEmpleadoDto, usuarioId: number) {
    // Verificar si ya existe un empleado con el mismo código
    const existingEmpleado = await this.prisma.empleado.findUnique({
      where: { codigo: createEmpleadoDto.codigo },
    });

    if (existingEmpleado) {
      throw new ConflictException(
        `Ya existe un empleado con el código ${createEmpleadoDto.codigo}`,
      );
    }

    // Preparar los datos para la creación
    const empleadoData = {
      ...createEmpleadoDto,
      fechaNacimiento: createEmpleadoDto.fechaNacimiento
        ? new Date(createEmpleadoDto.fechaNacimiento)
        : null,
      fechaIngreso: createEmpleadoDto.fechaIngreso
        ? new Date(createEmpleadoDto.fechaIngreso)
        : new Date(),
      gremioId: createEmpleadoDto.gremioId
        ? parseInt(createEmpleadoDto.gremioId.toString())
        : null,
    };

    // Crear el empleado
    const nuevoEmpleado = await this.prisma.empleado.create({
      data: empleadoData,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'Empleado',
      nuevoEmpleado.id.toString(),
      {
        codigo: nuevoEmpleado.codigo,
        nombre: `${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}`,
      },
    );

    return nuevoEmpleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
    usuarioId: number,
  ) {
    // Verificar si el empleado existe
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Verificar si se está actualizando el código y si ya existe
    if (
      updateEmpleadoDto.codigo &&
      updateEmpleadoDto.codigo !== empleado.codigo
    ) {
      const existingEmpleado = await this.prisma.empleado.findUnique({
        where: { codigo: updateEmpleadoDto.codigo },
      });

      if (existingEmpleado) {
        throw new ConflictException(
          `Ya existe un empleado con el código ${updateEmpleadoDto.codigo}`,
        );
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateEmpleadoDto };

    if (updateEmpleadoDto.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(updateEmpleadoDto.fechaNacimiento);
    }

    if (updateEmpleadoDto.fechaIngreso) {
      updateData.fechaIngreso = new Date(updateEmpleadoDto.fechaIngreso);
    }

    if (updateEmpleadoDto.fechaEgreso) {
      updateData.fechaEgreso = new Date(updateEmpleadoDto.fechaEgreso);

      // Si se establece fecha de egreso, actualizar estado a inactivo
      if (!updateEmpleadoDto.hasOwnProperty('estado')) {
        updateData.estado = 'inactivo';
      }
    }

    if (updateEmpleadoDto.gremioId) {
      updateData.gremioId = parseInt(updateEmpleadoDto.gremioId.toString());
    }

    // Actualizar el empleado
    const empleadoActualizado = await this.prisma.empleado.update({
      where: { id },
      data: updateData,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Empleado',
      id.toString(),
      { cambios: updateEmpleadoDto },
    );

    return empleadoActualizado;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si el empleado existe
    const empleado = await this.prisma.empleado.findUnique({
      where: { id },
      include: {
        asignacionesProyecto: {
          where: { activo: true },
        },
        asignacionesTarea: {
          where: { activo: true },
        },
      },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Verificar si el empleado tiene asignaciones activas
    if (
      empleado.asignacionesProyecto.length > 0 ||
      empleado.asignacionesTarea.length > 0
    ) {
      throw new ConflictException(
        `No se puede eliminar el empleado porque tiene asignaciones activas`,
      );
    }

    // Eliminar el empleado
    await this.prisma.empleado.delete({
      where: { id },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'Empleado',
      id.toString(),
      {
        codigo: empleado.codigo,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
      },
    );
  }
}

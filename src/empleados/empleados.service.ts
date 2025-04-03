// src/empleados/empleados.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  EmpleadoNotFoundException,
  EmpleadoConflictException,
  EmpleadoDependenciesException,
} from './exceptions';

@Injectable()
export class EmpleadosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(filters: { estado?: string; gremioId?: number } = {}) {
    try {
      const where: any = {};

      if (filters.estado) {
        where.estado = filters.estado;
      }

      if (filters.gremioId) {
        where.gremioId = filters.gremioId;
      }

      return await this.prisma.empleado.findMany({
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
    } catch (error) {
      throw PrismaErrorMapper.map(
        error,
        'empleado',
        'consultar-todos',
        filters,
      );
    }
  }

  async findById(id: number) {
    try {
      const empleado = await this.prisma.empleado.findUnique({
        where: { id },
        include: {
          gremio: true,
          especialidades: {
            include: {
              especialidad: true,
            },
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
        throw new EmpleadoNotFoundException(id);
      }

      return empleado;
    } catch (error) {
      if (!(error instanceof EmpleadoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'empleado', 'consultar', { id });
      }
      throw error;
    }
  }

  async create(createEmpleadoDto: CreateEmpleadoDto, usuarioId: number) {
    try {
      // Verificar si ya existe un empleado con el mismo código
      const existingEmpleado = await this.prisma.empleado.findUnique({
        where: { codigo: createEmpleadoDto.codigo },
      });

      if (existingEmpleado) {
        throw new EmpleadoConflictException('código', createEmpleadoDto.codigo);
      }

      // Verificar si ya existe un empleado con el mismo email (si se proporciona)
      if (createEmpleadoDto.email) {
        const emailExistente = await this.prisma.empleado.findFirst({
          where: { email: createEmpleadoDto.email },
        });

        if (emailExistente) {
          throw new EmpleadoConflictException('email', createEmpleadoDto.email);
        }
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
    } catch (error) {
      if (!(error instanceof EmpleadoConflictException)) {
        throw PrismaErrorMapper.map(error, 'empleado', 'crear', {
          dto: createEmpleadoDto,
        });
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el empleado existe
      const empleado = await this.getEmpleadoOrFail(id);

      // Verificar si se está actualizando el código y si ya existe
      if (
        updateEmpleadoDto.codigo &&
        updateEmpleadoDto.codigo !== empleado.codigo
      ) {
        const existingEmpleado = await this.prisma.empleado.findUnique({
          where: { codigo: updateEmpleadoDto.codigo },
        });

        if (existingEmpleado) {
          throw new EmpleadoConflictException(
            'código',
            updateEmpleadoDto.codigo,
          );
        }
      }

      // Verificar si se está actualizando el email y si ya existe
      if (
        updateEmpleadoDto.email &&
        updateEmpleadoDto.email !== empleado.email
      ) {
        const emailExistente = await this.prisma.empleado.findFirst({
          where: {
            email: updateEmpleadoDto.email,
            id: { not: id }, // Excluir el empleado actual
          },
        });

        if (emailExistente) {
          throw new EmpleadoConflictException('email', updateEmpleadoDto.email);
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateEmpleadoDto };

      if (updateEmpleadoDto.fechaNacimiento) {
        updateData.fechaNacimiento = new Date(
          updateEmpleadoDto.fechaNacimiento,
        );
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
    } catch (error) {
      if (
        !(error instanceof EmpleadoNotFoundException) &&
        !(error instanceof EmpleadoConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'empleado', 'actualizar', {
          id,
          dto: updateEmpleadoDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si el empleado existe
      const empleado = await this.getEmpleadoOrFail(id, [
        'asignacionesProyecto',
        'asignacionesTarea',
      ]);

      // Verificar si el empleado tiene asignaciones activas
      const asignacionesProyecto = empleado.asignacionesProyecto.filter(
        (a: any) => a.activo === true,
      );

      const asignacionesTarea = empleado.asignacionesTarea.filter(
        (a: any) => a.activo === true,
      );

      if (asignacionesProyecto.length > 0 || asignacionesTarea.length > 0) {
        const dependencies = [];

        if (asignacionesProyecto.length > 0)
          dependencies.push('asignaciones a proyectos');
        if (asignacionesTarea.length > 0)
          dependencies.push('asignaciones a tareas');

        throw new EmpleadoDependenciesException(id, dependencies);
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
    } catch (error) {
      if (
        !(error instanceof EmpleadoNotFoundException) &&
        !(error instanceof EmpleadoDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'empleado', 'eliminar', { id });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que un empleado existe y obtenerlo
   * @param id ID del empleado
   * @param includes Relaciones a incluir en la consulta
   * @returns El empleado encontrado
   * @throws EmpleadoNotFoundException si el empleado no existe
   */
  private async getEmpleadoOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const empleado = await this.prisma.empleado.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!empleado) {
        throw new EmpleadoNotFoundException(id);
      }

      return empleado;
    } catch (error) {
      if (!(error instanceof EmpleadoNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'empleado', 'consultar', { id });
      }
      throw error;
    }
  }
}

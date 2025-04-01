// src/proyectos/asignacion-empleado-tarea/asignacion-empleado-tarea.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEmpleadoTareaDto } from './dto/create-asignacion-empleado-tarea.dto';
import { UpdateAsignacionEmpleadoTareaDto } from './dto/update-asignacion-empleado-tarea.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import {
  AsignacionEmpleadoTareaNotFoundException,
  AsignacionEmpleadoTareaConflictException,
  AsignacionEmpleadoTareaOperationException,
} from './exceptions';
import { EmpleadoNotFoundException } from '../../empleados/exceptions';
import { TareaNotFoundException } from '../exceptions';

@Injectable()
export class AsignacionEmpleadoTareaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEmpleadoTareaDto, usuarioId: number) {
    try {
      // Verificar si existe el empleado
      const empleado = await this.prisma.empleado.findUnique({
        where: { id: createDto.empleadoId },
      });
      
      if (!empleado) {
        throw new EmpleadoNotFoundException(createDto.empleadoId);
      }
      
      // Verificar si existe la tarea
      const tarea = await this.prisma.tareaProyecto.findUnique({
        where: { id: createDto.tareaId },
      });
      
      if (!tarea) {
        throw new TareaNotFoundException(createDto.tareaId);
      }
      
      // Verificar si ya existe una asignación activa para este empleado y tarea
      const existingAsignacion = await this.prisma.asignacionEmpleadoTarea.findFirst({
        where: {
          empleadoId: createDto.empleadoId,
          tareaId: createDto.tareaId,
          activo: true,
        },
      });
      
      if (existingAsignacion) {
        throw new AsignacionEmpleadoTareaConflictException(
          createDto.empleadoId,
          createDto.tareaId
        );
      }
      
      // Crear la asignación
      const data = { 
        ...createDto 
        // El campo horasRegistradas se asigna por defecto a 0 y fechaAsignacion se establece en la creación.
      };
      
      const asignacion = await this.prisma.asignacionEmpleadoTarea.create({
        data,
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'AsignacionEmpleadoTarea',
        asignacion.id.toString(),
        { empleadoId: asignacion.empleadoId, tareaId: asignacion.tareaId }
      );
      
      return asignacion;
    } catch (error) {
      if (
        !(error instanceof EmpleadoNotFoundException) &&
        !(error instanceof TareaNotFoundException) &&
        !(error instanceof AsignacionEmpleadoTareaConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'crear', {
          dto: createDto,
        });
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.asignacionEmpleadoTarea.findMany({
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'consultar-todos', {});
    }
  }

  async findOne(id: number) {
    try {
      const asignacion = await this.prisma.asignacionEmpleadoTarea.findUnique({
        where: { id },
      });
      
      if (!asignacion) {
        throw new AsignacionEmpleadoTareaNotFoundException(id);
      }
      
      return asignacion;
    } catch (error) {
      if (!(error instanceof AsignacionEmpleadoTareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'consultar', { id });
      }
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateAsignacionEmpleadoTareaDto, usuarioId: number) {
    try {
      // Verificar si la asignación existe
      await this.getAsignacionOrFail(id);
      
      // Actualizar la asignación
      const updated = await this.prisma.asignacionEmpleadoTarea.update({
        where: { id },
        data: updateDto,
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'AsignacionEmpleadoTarea',
        id.toString(),
        { cambios: updateDto }
      );
      
      return updated;
    } catch (error) {
      if (!(error instanceof AsignacionEmpleadoTareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'actualizar', {
          id,
          dto: updateDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la asignación existe
      await this.getAsignacionOrFail(id);
      
      // Eliminar la asignación
      const deleted = await this.prisma.asignacionEmpleadoTarea.delete({
        where: { id },
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'AsignacionEmpleadoTarea',
        id.toString(),
        { id }
      );
      
      return deleted;
    } catch (error) {
      if (!(error instanceof AsignacionEmpleadoTareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'eliminar', { id });
      }
      throw error;
    }
  }

  /**
   * Método auxiliar para verificar que una asignación existe y obtenerla
   * @param id ID de la asignación
   * @returns La asignación encontrada
   * @throws AsignacionEmpleadoTareaNotFoundException si la asignación no existe
   */
  private async getAsignacionOrFail(id: number): Promise<any> {
    try {
      const asignacion = await this.prisma.asignacionEmpleadoTarea.findUnique({
        where: { id },
      });

      if (!asignacion) {
        throw new AsignacionEmpleadoTareaNotFoundException(id);
      }

      return asignacion;
    } catch (error) {
      if (!(error instanceof AsignacionEmpleadoTareaNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'asignacion-empleado-tarea', 'consultar', { id });
      }
      throw error;
    }
  }
}

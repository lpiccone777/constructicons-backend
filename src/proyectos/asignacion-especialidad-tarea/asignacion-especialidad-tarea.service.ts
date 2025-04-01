import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEspecialidadTareaDto } from './dto/create-asignacion-especialidad-tarea.dto';
import { UpdateAsignacionEspecialidadTareaDto } from './dto/update-asignacion-especialidad-tarea.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import { 
  AsignacionEspecialidadTareaNotFoundException 
} from './exceptions/asignacion-especialidad-tarea.exception';
import { EspecialidadNotFoundException } from '../../especialidades/exceptions/especialidad.exceptions';
import { TareaNotFoundException } from '../tareas/exceptions/tarea.exceptions';

@Injectable()
export class AsignacionEspecialidadTareaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEspecialidadTareaDto, usuarioId: number) {
    try {
      // Verificar que exista la especialidad
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id: createDto.especialidadId },
      });
      
      if (!especialidad) {
        throw new EspecialidadNotFoundException(createDto.especialidadId);
      }

      // Verificar que exista la tarea
      const tarea = await this.prisma.tarea.findUnique({
        where: { id: createDto.tareaId },
      });
      
      if (!tarea) {
        throw new TareaNotFoundException(createDto.tareaId);
      }

      // Calcular costo total si no se proporciona
      const costoTotalCalc = createDto.costoTotal !== undefined
        ? createDto.costoTotal
        : createDto.cantidad * createDto.horasEstimadas * createDto.valorHora;
      
      // Construir el objeto de datos
      const data = {
        tareaId: createDto.tareaId,
        especialidadId: createDto.especialidadId,
        // Mapear "cantidad" al campo "cantidadRecursos" del modelo
        cantidadRecursos: createDto.cantidad,
        horasEstimadas: createDto.horasEstimadas,
        valorHora: createDto.valorHora,
        costoTotal: costoTotalCalc,
        observaciones: createDto.observaciones,
      };

      const asignacion = await this.prisma.asignacionEspecialidadTarea.create({
        data,
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'AsignacionEspecialidadTarea',
        asignacion.id.toString(),
        { tareaId: asignacion.tareaId, especialidadId: asignacion.especialidadId }
      );
      
      return asignacion;
    } catch (error) {
      if (
        error instanceof EspecialidadNotFoundException || 
        error instanceof TareaNotFoundException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea',
        'crear',
        { createDto }
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.asignacionEspecialidadTarea.findMany({
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea',
        'listar',
        {}
      );
    }
  }

  async findOne(id: number) {
    try {
      const asignacion = await this.getAsignacionOrFail(id);
      return asignacion;
    } catch (error) {
      if (error instanceof AsignacionEspecialidadTareaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea', 
        'consultar', 
        { id }
      );
    }
  }

  async update(id: number, updateDto: UpdateAsignacionEspecialidadTareaDto, usuarioId: number) {
    try {
      // Verificar que exista la asignación
      await this.getAsignacionOrFail(id);
      
      // Si se modifica la especialidad, verificar que exista
      if (updateDto.especialidadId) {
        const especialidad = await this.prisma.especialidad.findUnique({
          where: { id: updateDto.especialidadId },
        });
        
        if (!especialidad) {
          throw new EspecialidadNotFoundException(updateDto.especialidadId);
        }
      }
      
      // Si se modifica la tarea, verificar que exista
      if (updateDto.tareaId) {
        const tarea = await this.prisma.tarea.findUnique({
          where: { id: updateDto.tareaId },
        });
        
        if (!tarea) {
          throw new TareaNotFoundException(updateDto.tareaId);
        }
      }

      // Obtener asignación actual para cálculos
      const asignacion = await this.getAsignacionOrFail(id);
      
      // Si se actualizan campos que afectan costoTotal, recalcularlo
      if (
        updateDto.cantidad !== undefined ||
        updateDto.horasEstimadas !== undefined ||
        updateDto.valorHora !== undefined
      ) {
        const cantidadRecursos = updateDto.cantidad !== undefined 
          ? updateDto.cantidad 
          : asignacion.cantidadRecursos;
        const horasEstimadas = updateDto.horasEstimadas !== undefined 
          ? updateDto.horasEstimadas 
          : asignacion.horasEstimadas;
        const valorHora = updateDto.valorHora !== undefined 
          ? updateDto.valorHora 
          : asignacion.valorHora;
        
        updateDto.costoTotal = Number(cantidadRecursos) * Number(horasEstimadas) * Number(valorHora);
      }
      
      // Construir la data y mapear "cantidad" a "cantidadRecursos" si se envía
      const data: any = { ...updateDto };
      if (updateDto.cantidad !== undefined) {
        data.cantidadRecursos = updateDto.cantidad;
        delete data.cantidad;
      }
      
      const updated = await this.prisma.asignacionEspecialidadTarea.update({
        where: { id },
        data,
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'AsignacionEspecialidadTarea',
        id.toString(),
        { cambios: updateDto }
      );
      
      return updated;
    } catch (error) {
      if (
        error instanceof AsignacionEspecialidadTareaNotFoundException ||
        error instanceof EspecialidadNotFoundException ||
        error instanceof TareaNotFoundException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea', 
        'actualizar', 
        { id, updateDto }
      );
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar que exista la asignación
      await this.getAsignacionOrFail(id);
      
      const deleted = await this.prisma.asignacionEspecialidadTarea.delete({
        where: { id },
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId, 
        'borrado', 
        'AsignacionEspecialidadTarea', 
        id.toString(), 
        {}
      );
      
      return deleted;
    } catch (error) {
      if (error instanceof AsignacionEspecialidadTareaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea', 
        'eliminar', 
        { id }
      );
    }
  }

  /**
   * Método auxiliar para obtener una asignación o lanzar excepción si no existe
   */
  private async getAsignacionOrFail(id: number) {
    try {
      const asignacion = await this.prisma.asignacionEspecialidadTarea.findUnique({
        where: { id },
      });
      
      if (!asignacion) {
        throw new AsignacionEspecialidadTareaNotFoundException(id);
      }
      
      return asignacion;
    } catch (error) {
      if (error instanceof AsignacionEspecialidadTareaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-tarea', 
        'consultar', 
        { id }
      );
    }
  }
}
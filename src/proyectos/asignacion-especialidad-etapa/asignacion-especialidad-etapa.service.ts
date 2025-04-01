import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEspecialidadEtapaDto } from './dto/create-asignacion-especialidad-etapa.dto';
import { UpdateAsignacionEspecialidadEtapaDto } from './dto/update-asignacion-especialidad-etapa.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import { 
  AsignacionEspecialidadEtapaNotFoundException 
} from './exceptions/asignacion-especialidad-etapa.exception';
import { EspecialidadNotFoundException } from '../../especialidades/exceptions/especialidad.exceptions';
import { EtapaNotFoundException } from '../etapas/exceptions/etapa.exceptions';

@Injectable()
export class AsignacionEspecialidadEtapaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEspecialidadEtapaDto, usuarioId: number) {
    try {
      // Verificar que exista la especialidad
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id: createDto.especialidadId },
      });
      
      if (!especialidad) {
        throw new EspecialidadNotFoundException(createDto.especialidadId);
      }

      // Verificar que exista la etapa
      const etapa = await this.prisma.etapa.findUnique({
        where: { id: createDto.etapaId },
      });
      
      if (!etapa) {
        throw new EtapaNotFoundException(createDto.etapaId);
      }

      // Si costoTotal no se envía, calcularlo
      const costoTotalCalc = createDto.costoTotal !== undefined 
        ? createDto.costoTotal 
        : createDto.cantidadRecursos * createDto.horasEstimadas * createDto.valorHora;

      // Construir el objeto de datos garantizando que costoTotal tenga un valor numérico
      const data = {
        ...createDto,
        costoTotal: costoTotalCalc,
      };

      const asignacion = await this.prisma.asignacionEspecialidadEtapa.create({
        data,
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'AsignacionEspecialidadEtapa',
        asignacion.id.toString(),
        { etapaId: asignacion.etapaId, especialidadId: asignacion.especialidadId }
      );
      
      return asignacion;
    } catch (error) {
      if (
        error instanceof EspecialidadNotFoundException || 
        error instanceof EtapaNotFoundException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa',
        'crear',
        { createDto }
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.asignacionEspecialidadEtapa.findMany({
        orderBy: { fechaCreacion: 'desc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa',
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
      if (error instanceof AsignacionEspecialidadEtapaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa', 
        'consultar', 
        { id }
      );
    }
  }

  async update(id: number, updateDto: UpdateAsignacionEspecialidadEtapaDto, usuarioId: number) {
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
      
      // Si se modifica la etapa, verificar que exista
      if (updateDto.etapaId) {
        const etapa = await this.prisma.etapa.findUnique({
          where: { id: updateDto.etapaId },
        });
        
        if (!etapa) {
          throw new EtapaNotFoundException(updateDto.etapaId);
        }
      }

      // Obtener asignación actual para cálculos
      const asignacion = await this.getAsignacionOrFail(id);
      
      // Si se actualizan campos que afectan costoTotal, recalcularlo
      if (
        updateDto.cantidadRecursos !== undefined ||
        updateDto.horasEstimadas !== undefined ||
        updateDto.valorHora !== undefined
      ) {
        // Utilizamos fallback a los valores actuales
        const cantidadRecursos = updateDto.cantidadRecursos !== undefined 
          ? updateDto.cantidadRecursos 
          : asignacion.cantidadRecursos;
        const horasEstimadas = updateDto.horasEstimadas !== undefined 
          ? updateDto.horasEstimadas 
          : asignacion.horasEstimadas;
        const valorHora = updateDto.valorHora !== undefined 
          ? updateDto.valorHora 
          : asignacion.valorHora;
        
        // Aseguramos que sean números, en caso de venir como string, usando Number()
        updateDto.costoTotal = Number(cantidadRecursos) * Number(horasEstimadas) * Number(valorHora);
      }
      
      const updated = await this.prisma.asignacionEspecialidadEtapa.update({
        where: { id },
        data: updateDto,
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'AsignacionEspecialidadEtapa',
        id.toString(),
        { cambios: updateDto }
      );
      
      return updated;
    } catch (error) {
      if (
        error instanceof AsignacionEspecialidadEtapaNotFoundException ||
        error instanceof EspecialidadNotFoundException ||
        error instanceof EtapaNotFoundException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa', 
        'actualizar', 
        { id, updateDto }
      );
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar que exista la asignación
      await this.getAsignacionOrFail(id);
      
      const deleted = await this.prisma.asignacionEspecialidadEtapa.delete({
        where: { id },
      });
      
      await this.auditoriaService.registrarAccion(
        usuarioId, 
        'borrado', 
        'AsignacionEspecialidadEtapa', 
        id.toString(), 
        {}
      );
      
      return deleted;
    } catch (error) {
      if (error instanceof AsignacionEspecialidadEtapaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa', 
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
      const asignacion = await this.prisma.asignacionEspecialidadEtapa.findUnique({
        where: { id },
      });
      
      if (!asignacion) {
        throw new AsignacionEspecialidadEtapaNotFoundException(id);
      }
      
      return asignacion;
    } catch (error) {
      if (error instanceof AsignacionEspecialidadEtapaNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'asignacion-especialidad-etapa', 
        'consultar', 
        { id }
      );
    }
  }
}
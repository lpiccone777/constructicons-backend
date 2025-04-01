// src/gremios/gremios.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGremioDto } from './dto/create-gremio.dto';
import { UpdateGremioDto } from './dto/update-gremio.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaErrorMapper } from '../common/exceptions/prisma-error.mapper';
import {
  GremioNotFoundException,
  GremioConflictException,
  GremioDependenciesException,
} from './exceptions';

@Injectable()
export class GremiosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateGremioDto, usuarioId: number) {
    try {
      // Verificar si ya existe un gremio con el mismo código
      const existente = await this.prisma.gremio.findUnique({
        where: { codigo: createDto.codigo },
      });
      
      if (existente) {
        throw new GremioConflictException(createDto.codigo);
      }
      
      // Crear el gremio
      const gremio = await this.prisma.gremio.create({
        data: {
          codigo: createDto.codigo,
          nombre: createDto.nombre,
          descripcion: createDto.descripcion,
          contactoNombre: createDto.contactoNombre,
          contactoTelefono: createDto.contactoTelefono,
          contactoEmail: createDto.contactoEmail,
          convenioVigente: createDto.convenioVigente,
          // Se transforma el string de fecha a un objeto Date, o se asigna null si no se envía
          fechaConvenio: createDto.fechaConvenio ? new Date(createDto.fechaConvenio) : null,
          observaciones: createDto.observaciones,
        },
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'Gremio',
        gremio.id.toString(),
        { codigo: gremio.codigo, nombre: gremio.nombre }
      );
      
      return gremio;
    } catch (error) {
      if (!(error instanceof GremioConflictException)) {
        throw PrismaErrorMapper.map(error, 'gremio', 'crear', {
          dto: createDto,
        });
      }
      throw error;
    }
  }
  
  async findAll() {
    try {
      return await this.prisma.gremio.findMany({
        orderBy: { nombre: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'gremio', 'consultar', {});
    }
  }

  async findOne(id: number) {
    try {
      const gremio = await this.prisma.gremio.findUnique({
        where: { id },
      });
      
      if (!gremio) {
        throw new GremioNotFoundException(id);
      }
      
      return gremio;
    } catch (error) {
      if (!(error instanceof GremioNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'gremio', 'consultar', { id });
      }
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateGremioDto, usuarioId: number) {
    try {
      // Verificar si el gremio existe
      await this.getGremioOrFail(id);
      
      // Si se está actualizando el código, verificar que no exista otro con ese código
      if (updateDto.codigo) {
        const existente = await this.prisma.gremio.findUnique({
          where: { codigo: updateDto.codigo },
        });
        
        if (existente && existente.id !== id) {
          throw new GremioConflictException(updateDto.codigo);
        }
      }
      
      // Preparar datos para actualización con fechas
      const updateData: any = { ...updateDto };
      if (updateDto.fechaConvenio) {
        updateData.fechaConvenio = new Date(updateDto.fechaConvenio);
      }
      
      // Actualizar el gremio
      const updated = await this.prisma.gremio.update({
        where: { id },
        data: updateData,
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'Gremio',
        id.toString(),
        { cambios: updateDto }
      );
      
      return updated;
    } catch (error) {
      if (
        !(error instanceof GremioNotFoundException) &&
        !(error instanceof GremioConflictException)
      ) {
        throw PrismaErrorMapper.map(error, 'gremio', 'actualizar', {
          id,
          dto: updateDto,
        });
      }
      throw error;
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si el gremio existe y obtener sus datos para la auditoría
      const gremio = await this.getGremioOrFail(id);
      
      // Verificar si tiene especialidades asociadas
      const asociaciones = await this.prisma.gremioEspecialidad.count({
        where: { gremioId: id },
      });
      
      if (asociaciones > 0) {
        throw new GremioDependenciesException(id, ['especialidades']);
      }
      
      // Eliminar el gremio
      await this.prisma.gremio.delete({
        where: { id },
      });
      
      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'Gremio',
        id.toString(),
        { codigo: gremio.codigo, nombre: gremio.nombre }
      );
      
      return { id, deleted: true };
    } catch (error) {
      if (
        !(error instanceof GremioNotFoundException) &&
        !(error instanceof GremioDependenciesException)
      ) {
        throw PrismaErrorMapper.map(error, 'gremio', 'eliminar', { id });
      }
      throw error;
    }
  }
  
  /**
   * Método auxiliar para verificar que un gremio existe y obtenerlo
   * @param id ID del gremio
   * @param includes Relaciones a incluir en la consulta
   * @returns El gremio encontrado
   * @throws GremioNotFoundException si el gremio no existe
   */
  private async getGremioOrFail(
    id: number,
    includes: string[] = [],
  ): Promise<any> {
    try {
      const include: Record<string, any> = {};

      // Configurar inclusiones solicitadas
      includes.forEach((item) => {
        include[item] = true;
      });

      const gremio = await this.prisma.gremio.findUnique({
        where: { id },
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      if (!gremio) {
        throw new GremioNotFoundException(id);
      }

      return gremio;
    } catch (error) {
      if (!(error instanceof GremioNotFoundException)) {
        throw PrismaErrorMapper.map(error, 'gremio', 'consultar', { id });
      }
      throw error;
    }
  }
}

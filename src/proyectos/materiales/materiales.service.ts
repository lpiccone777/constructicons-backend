import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import { 
  MaterialNotFoundException, 
  MaterialCodigoConflictException,
  MaterialDependenciesException
} from './exceptions/material.exceptions';

@Injectable()
export class MaterialesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(categoria?: string) {
    try {
      const where: Record<string, any> = {};

      if (categoria) {
        where.categoria = categoria;
      }

      return await this.prisma.material.findMany({
        where,
        orderBy: { nombre: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(
        error, 
        'material',
        'listar',
        { categoria }
      );
    }
  }

  async findById(id: number) {
    try {
      const material = await this.getMaterialOrFail(id);
      return material;
    } catch (error) {
      if (error instanceof MaterialNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'material', 
        'consultar', 
        { id }
      );
    }
  }

  async create(createMaterialDto: CreateMaterialDto, usuarioId: number) {
    try {
      // Verificar si ya existe un material con el mismo código
      const existingMaterial = await this.prisma.material.findUnique({
        where: { codigo: createMaterialDto.codigo },
      });

      if (existingMaterial) {
        throw new MaterialCodigoConflictException(createMaterialDto.codigo);
      }

      // Convertir datos de string a tipos apropiados
      const materialData = {
        ...createMaterialDto,
        precioReferencia: new Decimal(createMaterialDto.precioReferencia),
        stockMinimo: createMaterialDto.stockMinimo
          ? new Decimal(createMaterialDto.stockMinimo)
          : null,
      };

      // Crear el material
      const nuevoMaterial = await this.prisma.material.create({
        data: materialData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'Material',
        nuevoMaterial.id.toString(),
        {
          codigo: nuevoMaterial.codigo,
          nombre: nuevoMaterial.nombre,
          categoria: nuevoMaterial.categoria,
        },
      );

      return nuevoMaterial;
    } catch (error) {
      if (error instanceof MaterialCodigoConflictException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'material',
        'crear',
        { createMaterialDto }
      );
    }
  }

  async update(
    id: number,
    updateMaterialDto: UpdateMaterialDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si el material existe
      await this.getMaterialOrFail(id);

      // Verificar si se está actualizando el código y si ya existe
      if (
        updateMaterialDto.codigo &&
        updateMaterialDto.codigo !== (await this.getMaterialOrFail(id)).codigo
      ) {
        const existingMaterial = await this.prisma.material.findUnique({
          where: { codigo: updateMaterialDto.codigo },
        });

        if (existingMaterial) {
          throw new MaterialCodigoConflictException(updateMaterialDto.codigo);
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateMaterialDto };

      if (updateMaterialDto.precioReferencia) {
        updateData.precioReferencia = new Decimal(
          updateMaterialDto.precioReferencia,
        );
      }

      if (updateMaterialDto.stockMinimo) {
        updateData.stockMinimo = new Decimal(updateMaterialDto.stockMinimo);
      }

      // Actualizar el material
      const materialActualizado = await this.prisma.material.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'Material',
        id.toString(),
        { cambios: updateMaterialDto },
      );

      return materialActualizado;
    } catch (error) {
      if (
        error instanceof MaterialNotFoundException ||
        error instanceof MaterialCodigoConflictException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'material', 
        'actualizar', 
        { id, updateMaterialDto }
      );
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si el material existe
      const material = await this.getMaterialOrFail(id);

      // Verificar si tiene dependencias (asignaciones, etc.)
      const materialesProveedores = await this.prisma.materialProveedor.count({
        where: { materialId: id },
      });

      if (materialesProveedores > 0) {
        throw new MaterialDependenciesException(id);
      }

      const asignacionesMateriales = await this.prisma.asignacionMaterial.count({
        where: { materialId: id },
      });

      if (asignacionesMateriales > 0) {
        throw new MaterialDependenciesException(id);
      }

      // Eliminar el material
      await this.prisma.material.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'Material',
        id.toString(),
        {
          codigo: material.codigo,
          nombre: material.nombre,
        },
      );

      return { id };
    } catch (error) {
      if (
        error instanceof MaterialNotFoundException ||
        error instanceof MaterialDependenciesException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'material', 
        'eliminar', 
        { id }
      );
    }
  }

  async findByCategorias() {
    try {
      // Obtener materiales agrupados por categoría
      const categorias = await this.prisma.material.groupBy({
        by: ['categoria'],
        _count: true,
      });

      return categorias;
    } catch (error) {
      throw PrismaErrorMapper.map(
        error, 
        'material',
        'listar-categorias',
        {}
      );
    }
  }

  /**
   * Método auxiliar para obtener un material o lanzar excepción si no existe
   */
  private async getMaterialOrFail(id: number) {
    try {
      const material = await this.prisma.material.findUnique({
        where: { id },
      });
      
      if (!material) {
        throw new MaterialNotFoundException(id);
      }
      
      return material;
    } catch (error) {
      if (error instanceof MaterialNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(
        error, 
        'material', 
        'consultar', 
        { id }
      );
    }
  }
}
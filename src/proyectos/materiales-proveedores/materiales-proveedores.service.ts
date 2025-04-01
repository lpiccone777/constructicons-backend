// src/proyectos/materiales-proveedores/materiales-proveedores.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateMaterialProveedorDto } from './dto/create-material-proveedor.dto';
import { UpdateMaterialProveedorDto } from './dto/update-material-proveedor.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaErrorMapper } from '../../common/exceptions/prisma-error.mapper';
import {
  MaterialProveedorNotFoundException,
  MaterialProveedorConflictException,
} from './exceptions/material-proveedor.exceptions';
import { MaterialNotFoundException } from '../materiales/exceptions/material.exceptions';
import { ProveedorNotFoundException } from '../proveedores/exceptions/proveedor.exceptions';

@Injectable()
export class MaterialesProveedoresService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(materialId?: number, proveedorId?: number) {
    try {
      const where: Record<string, any> = {};

      if (materialId !== undefined) {
        where.materialId = materialId;
      }

      if (proveedorId !== undefined) {
        where.proveedorId = proveedorId;
      }

      return await this.prisma.materialProveedor.findMany({
        where,
        include: {
          material: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
              unidadMedida: true,
              precioReferencia: true,
            },
          },
          proveedor: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              nombreComercial: true,
              telefono: true,
              email: true,
            },
          },
        },
        orderBy: { precio: 'asc' },
      });
    } catch (error) {
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'listar', {
        materialId,
        proveedorId,
      });
    }
  }

  async findById(id: number) {
    try {
      const relacion = await this.getRelacionOrFail(id);
      return relacion;
    } catch (error) {
      if (error instanceof MaterialProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'consultar', {
        id,
      });
    }
  }

  async create(createDto: CreateMaterialProveedorDto, usuarioId: number) {
    try {
      // Verificar si el material existe
      const material = await this.prisma.material.findUnique({
        where: { id: createDto.materialId },
      });

      if (!material) {
        throw new MaterialNotFoundException(createDto.materialId);
      }

      // Verificar si el proveedor existe
      const proveedor = await this.prisma.proveedor.findUnique({
        where: { id: createDto.proveedorId },
      });

      if (!proveedor) {
        throw new ProveedorNotFoundException(createDto.proveedorId);
      }

      // Verificar si ya existe esta relación
      const existingRelacion = await this.prisma.materialProveedor.findFirst({
        where: {
          materialId: createDto.materialId,
          proveedorId: createDto.proveedorId,
        },
      });

      if (existingRelacion) {
        throw new MaterialProveedorConflictException(
          createDto.materialId,
          createDto.proveedorId,
        );
      }

      // Si se está marcando como proveedor principal, actualizar otros proveedores
      if (createDto.esProveedorPrincipal) {
        await this.prisma.materialProveedor.updateMany({
          where: {
            materialId: createDto.materialId,
            esProveedorPrincipal: true,
          },
          data: { esProveedorPrincipal: false },
        });
      }

      // Crear la relación
      const nuevaRelacion = await this.prisma.materialProveedor.create({
        data: {
          materialId: createDto.materialId,
          proveedorId: createDto.proveedorId,
          precio: new Decimal(createDto.precio),
          unidadMedida: createDto.unidadMedida || material.unidadMedida,
          tiempoEntrega: createDto.tiempoEntrega,
          cantidadMinima: createDto.cantidadMinima
            ? new Decimal(createDto.cantidadMinima)
            : null,
          observaciones: createDto.observaciones,
          esProveedorPrincipal: createDto.esProveedorPrincipal || false,
        },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'inserción',
        'MaterialProveedor',
        nuevaRelacion.id.toString(),
        {
          materialId: nuevaRelacion.materialId,
          proveedorId: nuevaRelacion.proveedorId,
          precio: nuevaRelacion.precio.toString(),
        },
      );

      return nuevaRelacion;
    } catch (error) {
      if (
        error instanceof MaterialNotFoundException ||
        error instanceof ProveedorNotFoundException ||
        error instanceof MaterialProveedorConflictException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'crear', {
        createDto,
      });
    }
  }

  async update(
    id: number,
    updateDto: UpdateMaterialProveedorDto,
    usuarioId: number,
  ) {
    try {
      // Verificar si la relación existe
      const relacion = await this.getRelacionOrFail(id);

      // Si se cambia el material, verificar que exista
      if (updateDto.materialId) {
        const material = await this.prisma.material.findUnique({
          where: { id: updateDto.materialId },
        });

        if (!material) {
          throw new MaterialNotFoundException(updateDto.materialId);
        }
      }

      // Si se cambia el proveedor, verificar que exista
      if (updateDto.proveedorId) {
        const proveedor = await this.prisma.proveedor.findUnique({
          where: { id: updateDto.proveedorId },
        });

        if (!proveedor) {
          throw new ProveedorNotFoundException(updateDto.proveedorId);
        }

        // Verificar que no exista ya esa combinación de material-proveedor
        if (updateDto.materialId || relacion.materialId) {
          const materialId = updateDto.materialId || relacion.materialId;
          const existingRelacion =
            await this.prisma.materialProveedor.findFirst({
              where: {
                materialId,
                proveedorId: updateDto.proveedorId,
                id: { not: id },
              },
            });

          if (existingRelacion) {
            throw new MaterialProveedorConflictException(
              materialId,
              updateDto.proveedorId,
            );
          }
        }
      }

      // Preparar datos para actualización
      const updateData: any = { ...updateDto };

      if (updateDto.precio) {
        updateData.precio = new Decimal(updateDto.precio);
      }

      if (updateDto.cantidadMinima) {
        updateData.cantidadMinima = new Decimal(updateDto.cantidadMinima);
      }

      // Si se está marcando como proveedor principal, actualizar otros proveedores
      if (updateDto.esProveedorPrincipal) {
        await this.prisma.materialProveedor.updateMany({
          where: {
            materialId: relacion.materialId,
            id: { not: id },
            esProveedorPrincipal: true,
          },
          data: { esProveedorPrincipal: false },
        });
      }

      // Actualizar la relación
      const relacionActualizada = await this.prisma.materialProveedor.update({
        where: { id },
        data: updateData,
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'actualización',
        'MaterialProveedor',
        id.toString(),
        { cambios: updateDto },
      );

      return relacionActualizada;
    } catch (error) {
      if (
        error instanceof MaterialProveedorNotFoundException ||
        error instanceof MaterialNotFoundException ||
        error instanceof ProveedorNotFoundException ||
        error instanceof MaterialProveedorConflictException
      ) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'actualizar', {
        id,
        updateDto,
      });
    }
  }

  async delete(id: number, usuarioId: number) {
    try {
      // Verificar si la relación existe
      const relacion = await this.getRelacionOrFail(id);

      // Verificar dependencias (por ejemplo, si hay asignaciones que utilizan esta relación)
      // TODO: Implementar verificación de dependencias cuando sea necesario

      // Eliminar la relación
      await this.prisma.materialProveedor.delete({
        where: { id },
      });

      // Registrar en auditoría
      await this.auditoriaService.registrarAccion(
        usuarioId,
        'borrado',
        'MaterialProveedor',
        id.toString(),
        {
          materialId: relacion.materialId,
          proveedorId: relacion.proveedorId,
        },
      );

      return { id };
    } catch (error) {
      if (error instanceof MaterialProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'eliminar', {
        id,
      });
    }
  }

  async comparativaProveedores(materialId: number) {
    try {
      // Verificar si el material existe
      const material = await this.prisma.material.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        throw new MaterialNotFoundException(materialId);
      }

      // Obtener todas las relaciones para este material
      const relaciones = await this.prisma.materialProveedor.findMany({
        where: { materialId },
        include: {
          proveedor: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              nombreComercial: true,
              telefono: true,
              email: true,
              condicionesPago: true,
              descuento: true,
            },
          },
        },
        orderBy: { precio: 'asc' },
      });

      // Preparar datos de comparativa
      const comparativa = {
        material: {
          id: material.id,
          codigo: material.codigo,
          nombre: material.nombre,
          categoria: material.categoria,
          unidadMedida: material.unidadMedida,
          precioReferencia: material.precioReferencia,
        },
        proveedores: relaciones.map((rel) => ({
          id: rel.id,
          proveedor: rel.proveedor,
          precio: rel.precio,
          unidadMedida: rel.unidadMedida,
          tiempoEntrega: rel.tiempoEntrega,
          cantidadMinima: rel.cantidadMinima,
          observaciones: rel.observaciones,
          esProveedorPrincipal: rel.esProveedorPrincipal,
          diferenciaPrecioRef:
            Number(rel.precio) - Number(material.precioReferencia),
          porcentajeDiferencia:
            ((Number(rel.precio) - Number(material.precioReferencia)) /
              Number(material.precioReferencia)) *
            100,
        })),
      };

      return comparativa;
    } catch (error) {
      if (error instanceof MaterialNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'comparativa', {
        materialId,
      });
    }
  }

  /**
   * Método auxiliar para obtener una relación material-proveedor o lanzar excepción si no existe
   */
  private async getRelacionOrFail(id: number) {
    try {
      const relacion = await this.prisma.materialProveedor.findUnique({
        where: { id },
        include: {
          material: true,
          proveedor: true,
        },
      });

      if (!relacion) {
        throw new MaterialProveedorNotFoundException(id);
      }

      return relacion;
    } catch (error) {
      if (error instanceof MaterialProveedorNotFoundException) {
        throw error;
      }
      throw PrismaErrorMapper.map(error, 'material-proveedor', 'consultar', {
        id,
      });
    }
  }
}

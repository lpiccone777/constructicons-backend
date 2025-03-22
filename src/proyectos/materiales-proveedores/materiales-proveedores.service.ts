// src/proyectos/materiales-proveedores/materiales-proveedores.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateMaterialProveedorDto } from './dto/create-material-proveedor.dto';
import { UpdateMaterialProveedorDto } from './dto/update-material-proveedor.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MaterialesProveedoresService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(materialId?: number, proveedorId?: number) {
    const where: Record<string, any> = {};
    
    if (materialId !== undefined) {
      where.materialId = materialId;
    }
    
    if (proveedorId !== undefined) {
      where.proveedorId = proveedorId;
    }
    
    return this.prisma.materialProveedor.findMany({
      where,
      include: {
        material: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            categoria: true,
            unidadMedida: true,
            precioReferencia: true
          }
        },
        proveedor: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            nombreComercial: true,
            telefono: true,
            email: true
          }
        }
      },
      orderBy: { precio: 'asc' }
    });
  }

  async findById(id: number) {
    const relacion = await this.prisma.materialProveedor.findUnique({
      where: { id },
      include: {
        material: true,
        proveedor: true
      }
    });

    if (!relacion) {
      throw new NotFoundException(`Relación material-proveedor con ID ${id} no encontrada`);
    }

    return relacion;
  }

  async create(createDto: CreateMaterialProveedorDto, usuarioId: number) {
    // Verificar si el material existe
    const material = await this.prisma.material.findUnique({
      where: { id: createDto.materialId }
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${createDto.materialId} no encontrado`);
    }

    // Verificar si el proveedor existe
    const proveedor = await this.prisma.proveedor.findUnique({
      where: { id: createDto.proveedorId }
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${createDto.proveedorId} no encontrado`);
    }

    // Verificar si ya existe esta relación
    const existingRelacion = await this.prisma.materialProveedor.findFirst({
      where: {
        materialId: createDto.materialId,
        proveedorId: createDto.proveedorId
      }
    });

    if (existingRelacion) {
      throw new ConflictException(`Ya existe una relación para este material y proveedor`);
    }

    // Si se está marcando como proveedor principal, actualizar otros proveedores
    if (createDto.esProveedorPrincipal) {
      await this.prisma.materialProveedor.updateMany({
        where: { 
          materialId: createDto.materialId,
          esProveedorPrincipal: true
        },
        data: { esProveedorPrincipal: false }
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
        cantidadMinima: createDto.cantidadMinima ? new Decimal(createDto.cantidadMinima) : null,
        observaciones: createDto.observaciones,
        esProveedorPrincipal: createDto.esProveedorPrincipal || false
      }
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
        precio: nuevaRelacion.precio.toString()
      }
    );

    return nuevaRelacion;
  }

  async update(id: number, updateDto: UpdateMaterialProveedorDto, usuarioId: number) {
    // Verificar si la relación existe
    const relacion = await this.prisma.materialProveedor.findUnique({
      where: { id }
    });

    if (!relacion) {
      throw new NotFoundException(`Relación material-proveedor con ID ${id} no encontrada`);
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
          esProveedorPrincipal: true
        },
        data: { esProveedorPrincipal: false }
      });
    }

    // Actualizar la relación
    const relacionActualizada = await this.prisma.materialProveedor.update({
      where: { id },
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'MaterialProveedor',
      id.toString(),
      { cambios: updateDto }
    );

    return relacionActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la relación existe
    const relacion = await this.prisma.materialProveedor.findUnique({
      where: { id }
    });

    if (!relacion) {
      throw new NotFoundException(`Relación material-proveedor con ID ${id} no encontrada`);
    }

    // Eliminar la relación
    await this.prisma.materialProveedor.delete({
      where: { id }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'MaterialProveedor',
      id.toString(),
      {
        materialId: relacion.materialId,
        proveedorId: relacion.proveedorId
      }
    );
  }

  async comparativaProveedores(materialId: number) {
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
            descuento: true
          }
        }
      },
      orderBy: { precio: 'asc' }
    });

    // Obtener el material para referencia
    const material = await this.prisma.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${materialId} no encontrado`);
    }

    // Preparar datos de comparativa
    const comparativa = {
      material: {
        id: material.id,
        codigo: material.codigo,
        nombre: material.nombre,
        categoria: material.categoria,
        unidadMedida: material.unidadMedida,
        precioReferencia: material.precioReferencia
      },
      proveedores: relaciones.map(rel => ({
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
          ((Number(rel.precio) - Number(material.precioReferencia)) / Number(material.precioReferencia)) * 100
      }))
    };

    return comparativa;
  }
}
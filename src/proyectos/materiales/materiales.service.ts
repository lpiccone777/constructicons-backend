import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MaterialesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(categoria?: string) {
    const where: Record<string, any> = {};
    
    if (categoria) {
      where.categoria = categoria;
    }
    
    return this.prisma.material.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });
  }

  async findById(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    return material;
  }

  async create(createMaterialDto: CreateMaterialDto, usuarioId: number) {
    // Verificar si ya existe un material con el mismo código
    const existingMaterial = await this.prisma.material.findUnique({
      where: { codigo: createMaterialDto.codigo }
    });

    if (existingMaterial) {
      throw new ConflictException(`Ya existe un material con el código ${createMaterialDto.codigo}`);
    }

    // Convertir datos de string a tipos apropiados
    const materialData = {
      ...createMaterialDto,
      precioReferencia: new Decimal(createMaterialDto.precioReferencia),
      stockMinimo: createMaterialDto.stockMinimo ? new Decimal(createMaterialDto.stockMinimo) : null,
    };

    // Crear el material
    const nuevoMaterial = await this.prisma.material.create({
      data: materialData
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
        categoria: nuevoMaterial.categoria
      }
    );

    return nuevoMaterial;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto, usuarioId: number) {
    // Verificar si el material existe
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    // Verificar si se está actualizando el código y si ya existe
    if (updateMaterialDto.codigo && updateMaterialDto.codigo !== material.codigo) {
      const existingMaterial = await this.prisma.material.findUnique({
        where: { codigo: updateMaterialDto.codigo }
      });

      if (existingMaterial) {
        throw new ConflictException(`Ya existe un material con el código ${updateMaterialDto.codigo}`);
      }
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateMaterialDto };
    
    if (updateMaterialDto.precioReferencia) {
      updateData.precioReferencia = new Decimal(updateMaterialDto.precioReferencia);
    }
    
    if (updateMaterialDto.stockMinimo) {
      updateData.stockMinimo = new Decimal(updateMaterialDto.stockMinimo);
    }

    // Actualizar el material
    const materialActualizado = await this.prisma.material.update({
      where: { id },
      data: updateData
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'Material',
      id.toString(),
      { cambios: updateMaterialDto }
    );

    return materialActualizado;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si el material existe
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException(`Material con ID ${id} no encontrado`);
    }

    // Eliminar el material
    await this.prisma.material.delete({
      where: { id }
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'Material',
      id.toString(),
      {
        codigo: material.codigo,
        nombre: material.nombre
      }
    );
  }

  async findByCategorias() {
    // Obtener materiales agrupados por categoría
    const categorias = await this.prisma.material.groupBy({
      by: ['categoria'],
      _count: true
    });
    
    return categorias;
  }
}
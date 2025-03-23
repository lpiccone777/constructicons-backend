// src/proyectos/asignaciones-materiales/asignaciones-materiales.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../../auditoria/auditoria.service';
import { CreateAsignacionMaterialDto } from './dto/create-asignacion-material.dto';
import { UpdateAsignacionMaterialDto } from './dto/update-asignacion-material.dto';
import { Decimal } from '@prisma/client/runtime/library';

export interface ResumenMaterialItem {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  cantidadTotal: number;
  precioReferencia: Decimal;
  costoEstimado: Decimal;
  cantidadPorEstado: {
    pendiente: number;
    solicitado: number;
    comprado: number;
    entregado: number;
  };
}

type EstadoAsignacion = 'pendiente' | 'solicitado' | 'comprado' | 'entregado';

@Injectable()
export class AsignacionesMaterialesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll(tareaId?: number, materialId?: number, estado?: string) {
    const where: Record<string, any> = {};

    if (tareaId !== undefined) {
      where.tareaId = tareaId;
    }

    if (materialId !== undefined) {
      where.materialId = materialId;
    }

    if (estado) {
      where.estado = estado;
    }

    return this.prisma.asignacionMaterial.findMany({
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
        tarea: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            etapa: {
              select: {
                id: true,
                nombre: true,
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
        },
      },
      orderBy: { fechaAsignacion: 'desc' },
    });
  }

  async findById(id: number) {
    const asignacion = await this.prisma.asignacionMaterial.findUnique({
      where: { id },
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
        tarea: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            etapa: {
              select: {
                id: true,
                nombre: true,
                proyecto: {
                  select: {
                    id: true,
                    codigo: true,
                    nombre: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de material con ID ${id} no encontrada`,
      );
    }

    return asignacion;
  }

  async create(createDto: CreateAsignacionMaterialDto, usuarioId: number) {
    // Verificar si la tarea existe
    const tarea = await this.prisma.tareaProyecto.findUnique({
      where: { id: createDto.tareaId },
      include: {
        etapa: {
          include: {
            proyecto: true,
          },
        },
      },
    });

    if (!tarea) {
      throw new NotFoundException(
        `Tarea con ID ${createDto.tareaId} no encontrada`,
      );
    }

    // Verificar si el proyecto está en un estado que permite asignar materiales
    if (
      tarea.etapa.proyecto.estado === 'finalizado' ||
      tarea.etapa.proyecto.estado === 'cancelado'
    ) {
      throw new ConflictException(
        `No se pueden asignar materiales en un proyecto ${tarea.etapa.proyecto.estado}`,
      );
    }

    // Verificar si el material existe
    const material = await this.prisma.material.findUnique({
      where: { id: createDto.materialId },
    });

    if (!material) {
      throw new NotFoundException(
        `Material con ID ${createDto.materialId} no encontrado`,
      );
    }

    // Verificar si ya existe una asignación para este material y tarea
    const existingAsignacion = await this.prisma.asignacionMaterial.findFirst({
      where: {
        materialId: createDto.materialId,
        tareaId: createDto.tareaId,
      },
    });

    if (existingAsignacion) {
      throw new ConflictException(
        `Ya existe una asignación para este material en esta tarea`,
      );
    }

    // Crear la asignación
    const nuevaAsignacion = await this.prisma.asignacionMaterial.create({
      data: {
        materialId: createDto.materialId,
        tareaId: createDto.tareaId,
        cantidad: new Decimal(createDto.cantidad),
        unidadMedida: createDto.unidadMedida || material.unidadMedida,
        estado: createDto.estado || 'pendiente',
        observaciones: createDto.observaciones,
      },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'AsignacionMaterial',
      nuevaAsignacion.id.toString(),
      {
        materialId: nuevaAsignacion.materialId,
        tareaId: nuevaAsignacion.tareaId,
        cantidad: nuevaAsignacion.cantidad.toString(),
      },
    );

    return nuevaAsignacion;
  }

  async update(
    id: number,
    updateDto: UpdateAsignacionMaterialDto,
    usuarioId: number,
  ) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionMaterial.findUnique({
      where: { id },
      include: {
        tarea: {
          include: {
            etapa: {
              include: {
                proyecto: true,
              },
            },
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de material con ID ${id} no encontrada`,
      );
    }

    // Verificar si el proyecto está en un estado que permite actualizar asignaciones
    if (
      asignacion.tarea.etapa.proyecto.estado === 'finalizado' ||
      asignacion.tarea.etapa.proyecto.estado === 'cancelado'
    ) {
      throw new ConflictException(
        `No se pueden actualizar asignaciones en un proyecto ${asignacion.tarea.etapa.proyecto.estado}`,
      );
    }

    // Preparar datos para actualización
    const updateData: any = { ...updateDto };

    if (updateDto.cantidad) {
      updateData.cantidad = new Decimal(updateDto.cantidad);
    }

    // Actualizar la asignación
    const asignacionActualizada = await this.prisma.asignacionMaterial.update({
      where: { id },
      data: updateData,
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'AsignacionMaterial',
      id.toString(),
      { cambios: updateDto },
    );

    return asignacionActualizada;
  }

  async delete(id: number, usuarioId: number) {
    // Verificar si la asignación existe
    const asignacion = await this.prisma.asignacionMaterial.findUnique({
      where: { id },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación de material con ID ${id} no encontrada`,
      );
    }

    // Eliminar la asignación
    await this.prisma.asignacionMaterial.delete({
      where: { id },
    });

    // Registrar en auditoría
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'AsignacionMaterial',
      id.toString(),
      {
        materialId: asignacion.materialId,
        tareaId: asignacion.tareaId,
      },
    );
  }

  async getResumenMaterialesPorProyecto(
    proyectoId: number,
  ): Promise<ResumenMaterialItem[]> {
    // Obtener todas las asignaciones de materiales para tareas del proyecto
    const asignaciones = await this.prisma.asignacionMaterial.findMany({
      where: {
        tarea: {
          etapa: {
            proyectoId,
          },
        },
      },
      include: {
        material: true,
        tarea: {
          include: {
            etapa: true,
          },
        },
      },
    });

    // Agrupar y sumar cantidades por material
    const resumenMateriales: ResumenMaterialItem[] = [];
    const materialMap: Record<number, ResumenMaterialItem> = {};

    for (const asignacion of asignaciones) {
      const materialId = asignacion.materialId;
      const estado = asignacion.estado as EstadoAsignacion;

      if (!materialMap[materialId]) {
        materialMap[materialId] = {
          id: asignacion.material.id,
          codigo: asignacion.material.codigo,
          nombre: asignacion.material.nombre,
          categoria: asignacion.material.categoria,
          unidadMedida: asignacion.material.unidadMedida,
          cantidadTotal: 0,
          precioReferencia: asignacion.material.precioReferencia,
          costoEstimado: new Decimal(0),
          cantidadPorEstado: {
            pendiente: 0,
            solicitado: 0,
            comprado: 0,
            entregado: 0,
          },
        };
        resumenMateriales.push(materialMap[materialId]);
      }

      // Sumar cantidades (convertir a la misma unidad si es necesario)
      materialMap[materialId].cantidadTotal += Number(asignacion.cantidad);

      // Sumar por estado (now type-safe)
      materialMap[materialId].cantidadPorEstado[estado] += Number(
        asignacion.cantidad,
      );

      // Calcular costo estimado
      materialMap[materialId].costoEstimado = materialMap[
        materialId
      ].costoEstimado.plus(
        asignacion.cantidad.mul(asignacion.material.precioReferencia),
      );
    }

    return resumenMateriales;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEspecialidadTareaDto } from './dto/create-asignacion-especialidad-tarea.dto';
import { UpdateAsignacionEspecialidadTareaDto } from './dto/update-asignacion-especialidad-tarea.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';

@Injectable()
export class AsignacionEspecialidadTareaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEspecialidadTareaDto, usuarioId: number) {
    const costoTotalCalc = createDto.costoTotal !== undefined
      ? createDto.costoTotal
      : createDto.cantidad * createDto.horasEstimadas * createDto.valorHora;
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
  }

  async findAll() {
    return this.prisma.asignacionEspecialidadTarea.findMany({
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const asignacion = await this.prisma.asignacionEspecialidadTarea.findUnique({
      where: { id },
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async update(id: number, updateDto: UpdateAsignacionEspecialidadTareaDto, usuarioId: number) {
    const asignacion = await this.findOne(id);
    if (
      updateDto.cantidad !== undefined ||
      updateDto.horasEstimadas !== undefined ||
      updateDto.valorHora !== undefined
    ) {
      const cantidadRecursos = updateDto.cantidad !== undefined ? updateDto.cantidad : asignacion.cantidadRecursos;
      const horasEstimadas = updateDto.horasEstimadas !== undefined ? updateDto.horasEstimadas : asignacion.horasEstimadas;
      const valorHora = updateDto.valorHora !== undefined ? updateDto.valorHora : asignacion.valorHora;
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
  }

  async delete(id: number, usuarioId: number) {
    await this.findOne(id);
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
  }
}

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
      ...createDto,
      costoTotal: costoTotalCalc,
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
    await this.findOne(id);
    if (
      updateDto.cantidad !== undefined ||
      updateDto.horasEstimadas !== undefined ||
      updateDto.valorHora !== undefined
    ) {
      const asignacion = await this.findOne(id);
      const cantidad = updateDto.cantidad !== undefined ? updateDto.cantidad : asignacion.cantidad;
      const horasEstimadas = updateDto.horasEstimadas !== undefined ? updateDto.horasEstimadas : asignacion.horasEstimadas;
      const valorHora = updateDto.valorHora !== undefined ? updateDto.valorHora : asignacion.valorHora;
      updateDto.costoTotal = Number(cantidad) * Number(horasEstimadas) * Number(valorHora);
    }
    const updated = await this.prisma.asignacionEspecialidadTarea.update({
      where: { id },
      data: updateDto,
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

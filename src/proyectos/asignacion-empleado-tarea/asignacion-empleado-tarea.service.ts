import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEmpleadoTareaDto } from './dto/create-asignacion-empleado-tarea.dto';
import { UpdateAsignacionEmpleadoTareaDto } from './dto/update-asignacion-empleado-tarea.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';

@Injectable()
export class AsignacionEmpleadoTareaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEmpleadoTareaDto, usuarioId: number) {
    const data = { 
      ...createDto 
      // El campo horasRegistradas se asigna por defecto a 0 y fechaAsignacion se establece en la creación.
    };
    const asignacion = await this.prisma.asignacionEmpleadoTarea.create({
      data,
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'inserción',
      'AsignacionEmpleadoTarea',
      asignacion.id.toString(),
      { empleadoId: asignacion.empleadoId, tareaId: asignacion.tareaId }
    );
    return asignacion;
  }

  async findAll() {
    return this.prisma.asignacionEmpleadoTarea.findMany({
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const asignacion = await this.prisma.asignacionEmpleadoTarea.findUnique({
      where: { id },
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async update(id: number, updateDto: UpdateAsignacionEmpleadoTareaDto, usuarioId: number) {
    await this.findOne(id);
    const updated = await this.prisma.asignacionEmpleadoTarea.update({
      where: { id },
      data: updateDto,
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'actualización',
      'AsignacionEmpleadoTarea',
      id.toString(),
      { cambios: updateDto }
    );
    return updated;
  }

  async delete(id: number, usuarioId: number) {
    await this.findOne(id);
    const deleted = await this.prisma.asignacionEmpleadoTarea.delete({
      where: { id },
    });
    await this.auditoriaService.registrarAccion(
      usuarioId,
      'borrado',
      'AsignacionEmpleadoTarea',
      id.toString(),
      {}
    );
    return deleted;
  }
}

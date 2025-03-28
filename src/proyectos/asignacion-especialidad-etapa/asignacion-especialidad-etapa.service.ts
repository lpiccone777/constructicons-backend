import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignacionEspecialidadEtapaDto } from './dto/create-asignacion-especialidad-etapa.dto';
import { UpdateAsignacionEspecialidadEtapaDto } from './dto/update-asignacion-especialidad-etapa.dto';
import { AuditoriaService } from '../../auditoria/auditoria.service';

@Injectable()
export class AsignacionEspecialidadEtapaService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(createDto: CreateAsignacionEspecialidadEtapaDto, usuarioId: number) {
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
  }

  async findAll() {
    return this.prisma.asignacionEspecialidadEtapa.findMany({
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async findOne(id: number) {
    const asignacion = await this.prisma.asignacionEspecialidadEtapa.findUnique({
      where: { id },
    });
    if (!asignacion) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    return asignacion;
  }

  async update(id: number, updateDto: UpdateAsignacionEspecialidadEtapaDto, usuarioId: number) {
    await this.findOne(id);
    // Si se actualizan campos que afectan costoTotal, recalcularlo
    if (
      updateDto.cantidadRecursos !== undefined ||
      updateDto.horasEstimadas !== undefined ||
      updateDto.valorHora !== undefined
    ) {
      const asignacion = await this.findOne(id);
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
  }

  async delete(id: number, usuarioId: number) {
    await this.findOne(id);
    const deleted = await this.prisma.asignacionEspecialidadEtapa.delete({
      where: { id },
    });
    await this.auditoriaService.registrarAccion(usuarioId, 'borrado', 'AsignacionEspecialidadEtapa', id.toString(), {});
    return deleted;
  }
}

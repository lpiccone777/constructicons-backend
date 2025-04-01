import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionEspecialidadTareaDto } from './create-asignacion-especialidad-tarea.dto';

export class UpdateAsignacionEspecialidadTareaDto extends PartialType(
  CreateAsignacionEspecialidadTareaDto,
) {}

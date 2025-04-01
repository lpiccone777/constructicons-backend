import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionEspecialidadEtapaDto } from './create-asignacion-especialidad-etapa.dto';

export class UpdateAsignacionEspecialidadEtapaDto extends PartialType(
  CreateAsignacionEspecialidadEtapaDto,
) {}

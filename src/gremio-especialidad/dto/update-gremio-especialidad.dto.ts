import { PartialType } from '@nestjs/swagger';
import { CreateGremioEspecialidadDto } from './create-gremio-especialidad.dto';

export class UpdateGremioEspecialidadDto extends PartialType(CreateGremioEspecialidadDto) {}

// src/especialidades/dto/update-especialidad.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEspecialidadDto } from './create-especialidad.dto';

export class UpdateEspecialidadDto extends PartialType(CreateEspecialidadDto) {}

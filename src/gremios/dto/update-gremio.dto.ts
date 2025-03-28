import { PartialType } from '@nestjs/swagger';
import { CreateGremioDto } from './create-gremio.dto';

export class UpdateGremioDto extends PartialType(CreateGremioDto) {}

// src/empleados/dto/update-empleado.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEmpleadoDto } from './create-empleado.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsISO8601 } from 'class-validator';

export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
  @ApiPropertyOptional({
    example: '2023-12-31',
    description: 'Fecha de egreso',
  })
  @IsOptional()
  @IsISO8601()
  fechaEgreso?: string;
}

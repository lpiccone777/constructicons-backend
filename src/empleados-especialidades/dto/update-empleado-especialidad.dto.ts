// src/empleados-especialidades/dto/update-empleado-especialidad.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDecimal,
  IsBoolean,
  IsArray,
  IsString,
  IsISO8601,
  IsIn,
} from 'class-validator';

export class UpdateEmpleadoEspecialidadDto {
  @ApiPropertyOptional({
    example: '1600.00',
    description: 'Valor hora para esta especialidad y empleado',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  valorHora?: string;

  @ApiPropertyOptional({
    example: ['Certificación 1', 'Certificación 2'],
    description: 'Certificaciones que tiene el empleado',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certificaciones?: string[];

  @ApiPropertyOptional({
    example: 'senior',
    description: 'Nivel de experiencia',
    enum: ['junior', 'medio', 'senior'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['junior', 'medio', 'senior'])
  nivelExperiencia?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si es la especialidad principal del empleado',
  })
  @IsBoolean()
  @IsOptional()
  esPrincipal?: boolean;

  @ApiPropertyOptional({
    example: 'Observaciones actualizadas',
    description: 'Observaciones',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiPropertyOptional({
    example: '2023-12-31',
    description: 'Fecha hasta la que tiene la especialidad (para dar de baja)',
  })
  @IsISO8601()
  @IsOptional()
  fechaHasta?: string;
}

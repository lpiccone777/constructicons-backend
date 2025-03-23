// src/empleados-especialidades/dto/create-empleado-especialidad.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  IsBoolean,
  IsArray,
  IsString,
  IsISO8601,
  IsIn,
} from 'class-validator';

export class CreateEmpleadoEspecialidadDto {
  @ApiProperty({
    example: 1,
    description: 'ID del empleado',
  })
  @IsNumber()
  @IsNotEmpty()
  empleadoId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la especialidad',
  })
  @IsNumber()
  @IsNotEmpty()
  especialidadId!: number;

  @ApiProperty({
    example: '1500.00',
    description: 'Valor hora para esta especialidad y empleado',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  valorHora!: string;

  @ApiPropertyOptional({
    example: ['Certificación 1', 'Certificación 2'],
    description: 'Certificaciones que tiene el empleado',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certificaciones?: string[];

  @ApiPropertyOptional({
    example: 'medio',
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
    example: 'Observaciones adicionales',
    description: 'Observaciones',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

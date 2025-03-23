// src/proyectos/asignaciones-materiales/dto/create-asignacion-material.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDecimal,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateAsignacionMaterialDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la tarea a la que se asigna el material',
  })
  @IsNumber()
  @IsNotEmpty()
  tareaId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del material a asignar',
  })
  @IsNumber()
  @IsNotEmpty()
  materialId!: number;

  @ApiProperty({
    example: '12.75',
    description: 'Cantidad del material requerida',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  cantidad!: string;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Unidad de medida del material',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidadMedida?: string;

  @ApiPropertyOptional({
    example: 'pendiente',
    description: 'Estado actual de la asignación del material',
    enum: ['pendiente', 'solicitado', 'comprado', 'entregado'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['pendiente', 'solicitado', 'comprado', 'entregado'])
  estado?: string;

  @ApiPropertyOptional({
    example: 'Material para cimentación',
    description: 'Observaciones sobre la asignación del material',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}

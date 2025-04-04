// src/proyectos/asignaciones-materiales/dto/update-asignacion-material.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDecimal,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateAsignacionMaterialDto {
  @ApiPropertyOptional({
    example: '12.75',
    description: 'Cantidad del material requerida (con 0-2 decimales)',
  })
  @IsDecimal(
    { decimal_digits: '0,2' },
    { message: 'La cantidad debe ser un valor decimal con máximo 2 decimales' },
  )
  @IsOptional()
  cantidad?: string;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Unidad de medida del material',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidadMedida?: string;

  @ApiPropertyOptional({
    example: 'comprado',
    description: 'Estado actual de la asignación del material',
    enum: ['pendiente', 'solicitado', 'comprado', 'entregado'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['pendiente', 'solicitado', 'comprado', 'entregado'])
  estado?: string;

  @ApiPropertyOptional({
    example: 'Material ya disponible en almacén',
    description: 'Observaciones sobre la asignación del material',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}

// src/proyectos/materiales-proveedores/dto/create-material-proveedor.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDecimal,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreateMaterialProveedorDto {
  @ApiProperty({
    example: 1,
    description: 'ID del material',
  })
  @IsNumber()
  @IsNotEmpty()
  materialId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID del proveedor',
  })
  @IsNumber()
  @IsNotEmpty()
  proveedorId!: number;

  @ApiProperty({
    example: '350.50',
    description: 'Precio del material ofrecido por el proveedor',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  precio!: string;

  @ApiProperty({
    example: 'kg',
    description: 'Unidad de medida del material',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unidadMedida!: string;

  @ApiPropertyOptional({
    example: '3-5 días',
    description: 'Tiempo estimado de entrega',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tiempoEntrega?: string;

  @ApiPropertyOptional({
    example: '100.00',
    description: 'Cantidad mínima de pedido',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  cantidadMinima?: string;

  @ApiPropertyOptional({
    example: 'Incluye transporte dentro del área metropolitana',
    description: 'Observaciones adicionales',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si es el proveedor principal para este material',
  })
  @IsBoolean()
  @IsOptional()
  esProveedorPrincipal?: boolean;
}

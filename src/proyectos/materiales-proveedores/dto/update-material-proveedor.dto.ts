// src/proyectos/materiales-proveedores/dto/update-material-proveedor.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDecimal,
  IsBoolean,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class UpdateMaterialProveedorDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID del material',
  })
  @IsNumber()
  @IsOptional()
  materialId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del proveedor',
  })
  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @ApiPropertyOptional({
    example: '375.25',
    description: 'Precio del material ofrecido por el proveedor',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  precio?: string;

  @ApiPropertyOptional({
    example: 'kg',
    description: 'Unidad de medida del material',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidadMedida?: string;

  @ApiPropertyOptional({
    example: '2-3 días',
    description: 'Tiempo estimado de entrega',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tiempoEntrega?: string;

  @ApiPropertyOptional({
    example: '50.00',
    description: 'Cantidad mínima de pedido',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  cantidadMinima?: string;

  @ApiPropertyOptional({
    example: 'Descuento adicional por volumen',
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

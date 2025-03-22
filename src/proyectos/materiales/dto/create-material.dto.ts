import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDecimal,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ 
    example: 'MAT-001', 
    description: 'Código único del material' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código debe contener solo letras mayúsculas, números y guiones' 
  })
  codigo!: string;

  @ApiProperty({ 
    example: 'Cemento Portland', 
    description: 'Nombre del material' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ 
    example: 'Cemento de uso general para construcción',
    description: 'Descripción detallada del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ 
    example: 'estructurales', 
    description: 'Categoría del material' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  categoria!: string;

  @ApiProperty({ 
    example: 'kg', 
    description: 'Unidad de medida del material' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unidadMedida!: string;

  @ApiProperty({ 
    example: '350.50', 
    description: 'Precio de referencia del material' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  precioReferencia!: string;

  @ApiPropertyOptional({ 
    example: '100.00', 
    description: 'Stock mínimo recomendado' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  stockMinimo?: string;
}
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDecimal,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ 
    example: 'MAT-002', 
    description: 'Código único del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código debe contener solo letras mayúsculas, números y guiones' 
  })
  codigo?: string;

  @ApiPropertyOptional({ 
    example: 'Cemento Portland Tipo II', 
    description: 'Nombre del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ 
    example: 'Cemento resistente a sulfatos para construcciones especiales',
    description: 'Descripción detallada del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ 
    example: 'especiales', 
    description: 'Categoría del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  categoria?: string;

  @ApiPropertyOptional({ 
    example: 'bolsa', 
    description: 'Unidad de medida del material' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidadMedida?: string;

  @ApiPropertyOptional({ 
    example: '375.25', 
    description: 'Precio de referencia del material' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  precioReferencia?: string;

  @ApiPropertyOptional({ 
    example: '120.00', 
    description: 'Stock mínimo recomendado' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  stockMinimo?: string;
}
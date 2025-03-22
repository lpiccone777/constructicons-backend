import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  MaxLength
} from 'class-validator';

export class CreateContactoDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID del proveedor al que pertenece el contacto' 
  })
  @IsNumber()
  @IsNotEmpty()
  proveedorId!: number;

  @ApiProperty({ 
    example: 'Juan Pérez', 
    description: 'Nombre completo del contacto' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ 
    example: 'Gerente de Ventas', 
    description: 'Cargo o puesto del contacto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string;

  @ApiPropertyOptional({ 
    example: '+52 55 9876 5432', 
    description: 'Teléfono del contacto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ 
    example: 'juan.perez@empresa.com', 
    description: 'Email del contacto' 
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Indica si es el contacto principal' 
  })
  @IsBoolean()
  @IsOptional()
  esPrincipal?: boolean;

  @ApiPropertyOptional({ 
    example: 'Contacto principal para cotizaciones', 
    description: 'Observaciones adicionales' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}
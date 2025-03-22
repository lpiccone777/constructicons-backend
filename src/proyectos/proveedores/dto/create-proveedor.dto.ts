import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
  IsArray,
  IsDecimal,
  MaxLength,
  Matches,
  IsIn
} from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty({ 
    example: 'PROV-001', 
    description: 'Código único del proveedor' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código debe contener solo letras mayúsculas, números y guiones' 
  })
  codigo!: string;

  @ApiProperty({ 
    example: 'Materiales Construcción S.A.', 
    description: 'Nombre legal del proveedor' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ 
    example: 'MatCon', 
    description: 'Nombre comercial o de fantasía' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombreComercial?: string;

  @ApiProperty({ 
    example: 'RFC', 
    description: 'Tipo de documento de identidad' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tipoDocumento!: string;

  @ApiProperty({ 
    example: 'ABCD123456XYZ', 
    description: 'Número de documento' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiPropertyOptional({ 
    example: 'Av. Principal 123', 
    description: 'Dirección del proveedor' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @ApiPropertyOptional({ 
    example: 'Ciudad de México', 
    description: 'Ciudad' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ 
    example: '12345', 
    description: 'Código postal' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  codigoPostal?: string;

  @ApiPropertyOptional({ 
    example: 'México', 
    description: 'País' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({ 
    example: '+52 55 1234 5678', 
    description: 'Teléfono de contacto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ 
    example: 'info@matcon.com', 
    description: 'Email del proveedor' 
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ 
    example: 'https://www.matcon.com', 
    description: 'Sitio web del proveedor' 
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(200)
  sitioWeb?: string;

  @ApiPropertyOptional({ 
    example: ['materiales', 'construcción', 'acabados'], 
    description: 'Categorías de productos/servicios que ofrece' 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categorias?: string[];

  @ApiPropertyOptional({ 
    example: '30 días', 
    description: 'Condiciones de pago estándar' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @ApiPropertyOptional({ 
    example: '5.00', 
    description: 'Descuento estándar (porcentaje)' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  descuento?: string;

  @ApiPropertyOptional({ 
    example: 'Proveedor preferente para materiales estructurales', 
    description: 'Observaciones adicionales' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({ 
    example: 'activo', 
    description: 'Estado del proveedor (activo/inactivo)',
    enum: ['activo', 'inactivo'] 
  })
  @IsString()
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: string;
}
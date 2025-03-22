import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsArray,
  IsDecimal,
  MaxLength,
  Matches,
  IsIn
} from 'class-validator';

export class UpdateProveedorDto {
  @ApiPropertyOptional({ 
    example: 'PROV-002', 
    description: 'Código único del proveedor' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código debe contener solo letras mayúsculas, números y guiones' 
  })
  codigo?: string;

  @ApiPropertyOptional({ 
    example: 'Suministros Construcción S.A.', 
    description: 'Nombre legal del proveedor' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ 
    example: 'SumiCon', 
    description: 'Nombre comercial o de fantasía' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombreComercial?: string;

  @ApiPropertyOptional({ 
    example: 'NIF', 
    description: 'Tipo de documento de identidad' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  tipoDocumento?: string;

  @ApiPropertyOptional({ 
    example: 'WXYZ987654ABC', 
    description: 'Número de documento' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  numeroDocumento?: string;

  @ApiPropertyOptional({ 
    example: 'Calle Secundaria 456', 
    description: 'Dirección del proveedor' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @ApiPropertyOptional({ 
    example: 'Guadalajara', 
    description: 'Ciudad' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ 
    example: '54321', 
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
    example: '+52 33 8765 4321', 
    description: 'Teléfono de contacto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ 
    example: 'contacto@sumicon.com', 
    description: 'Email del proveedor' 
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ 
    example: 'https://www.sumicon.com', 
    description: 'Sitio web del proveedor' 
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(200)
  sitioWeb?: string;

  @ApiPropertyOptional({ 
    example: ['materiales', 'herramientas', 'seguridad'], 
    description: 'Categorías de productos/servicios que ofrece' 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categorias?: string[];

  @ApiPropertyOptional({ 
    example: '60 días', 
    description: 'Condiciones de pago estándar' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  condicionesPago?: string;

  @ApiPropertyOptional({ 
    example: '7.50', 
    description: 'Descuento estándar (porcentaje)' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  descuento?: string;

  @ApiPropertyOptional({ 
    example: 'Especialistas en herramientas de seguridad', 
    description: 'Observaciones adicionales' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({ 
    example: 'inactivo', 
    description: 'Estado del proveedor (activo/inactivo)',
    enum: ['activo', 'inactivo'] 
  })
  @IsString()
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: string;
}
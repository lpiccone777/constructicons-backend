import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UpdateContactoDto {
  @ApiPropertyOptional({
    example: 'María Rodríguez',
    description: 'Nombre completo del contacto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Directora Comercial',
    description: 'Cargo o puesto del contacto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  cargo?: string;

  @ApiPropertyOptional({
    example: '+52 55 1122 3344',
    description: 'Teléfono del contacto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({
    example: 'maria.rodriguez@empresa.com',
    description: 'Email del contacto',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si es el contacto principal',
  })
  @IsBoolean()
  @IsOptional()
  esPrincipal?: boolean;

  @ApiPropertyOptional({
    example: 'Contacto para temas administrativos',
    description: 'Observaciones adicionales',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}

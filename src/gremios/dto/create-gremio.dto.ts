import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGremioDto {
  @ApiProperty({ example: 'GRE-001', description: 'Código único del gremio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiProperty({
    example: 'Gremio de Albañiles',
    description: 'Nombre del gremio',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Descripción del gremio',
    description: 'Descripción del gremio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'Contacto del gremio',
    description: 'Nombre del contacto principal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoNombre?: string;

  @ApiPropertyOptional({
    example: '+541112345678',
    description: 'Teléfono de contacto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactoTelefono?: string;

  @ApiPropertyOptional({
    example: 'gremio@example.com',
    description: 'Email de contacto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactoEmail?: string;

  // Campos adicionales enviados desde el frontend:
  @ApiPropertyOptional({
    example: 'Convenio 2025',
    description: 'Información sobre el convenio vigente',
  })
  @IsOptional()
  @IsString()
  convenioVigente?: string;

  @ApiPropertyOptional({
    example: '2025-03-27',
    description: 'Fecha de convenio',
  })
  @IsOptional()
  @IsDateString()
  fechaConvenio?: string;

  @ApiPropertyOptional({
    example: 'Observaciones adicionales',
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

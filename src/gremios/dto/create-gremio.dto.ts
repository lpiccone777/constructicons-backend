import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGremioDto {
  @ApiProperty({ example: 'GRE-001', description: 'Código único del gremio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiProperty({ example: 'Gremio de Albañiles', description: 'Nombre del gremio' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Descripción del gremio', description: 'Descripción del gremio', required: false })
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ example: 'Contacto del gremio', description: 'Nombre del contacto principal', required: false })
  @IsString()
  @MaxLength(100)
  contactoNombre?: string;

  @ApiProperty({ example: '+541112345678', description: 'Teléfono de contacto', required: false })
  @IsString()
  @MaxLength(20)
  contactoTelefono?: string;

  @ApiProperty({ example: 'gremio@example.com', description: 'Email de contacto', required: false })
  @IsString()
  @MaxLength(100)
  contactoEmail?: string;
}

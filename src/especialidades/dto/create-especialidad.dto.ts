// src/especialidades/dto/create-especialidad.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateEspecialidadDto {
  @ApiProperty({
    example: 'ESP-001',
    description: 'Código único de la especialidad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'El código debe contener solo letras mayúsculas, números y guiones',
  })
  codigo!: string;

  @ApiProperty({
    example: 'Electricista',
    description: 'Nombre de la especialidad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Especialista en instalaciones eléctricas',
    description: 'Descripción de la especialidad',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    example: '1500.00',
    description: 'Valor hora base para esta especialidad',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  valorHoraBase!: string;
}

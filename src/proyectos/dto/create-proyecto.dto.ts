import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsDecimal,
  IsIn,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty({
    example: 'PROJ-2025-001',
    description: 'Código único del proyecto',
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
    example: 'Edificio Residencial Torres del Parque',
    description: 'Nombre del proyecto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({
    example:
      'Proyecto de 24 apartamentos distribuidos en 6 pisos con áreas comunes',
    description: 'Descripción detallada del proyecto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    example: 'Calle 45 #23-12, Bogotá',
    description: 'Ubicación física del proyecto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ubicacion!: string;

  @ApiPropertyOptional({
    example: '2025-04-15',
    description: 'Fecha planeada de inicio del proyecto',
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: '2026-10-30',
    description: 'Fecha estimada de finalización del proyecto',
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiProperty({
    example: '2500000.50',
    description: 'Presupuesto total asignado al proyecto',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  presupuestoTotal!: string;

  @ApiPropertyOptional({
    example: 'planificacion',
    description: 'Estado actual del proyecto',
    enum: ['planificacion', 'ejecucion', 'pausado', 'finalizado', 'cancelado'],
  })
  @IsIn(['planificacion', 'ejecucion', 'pausado', 'finalizado', 'cancelado'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    example: 'alta',
    description: 'Nivel de prioridad del proyecto',
    enum: ['baja', 'media', 'alta'],
  })
  @IsIn(['baja', 'media', 'alta'])
  @IsOptional()
  prioridad?: string;
}

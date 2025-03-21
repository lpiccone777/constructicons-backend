import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsDecimal,
  IsIn,
  MaxLength,
  Matches
} from 'class-validator';

export class UpdateProyectoDto {
  @ApiPropertyOptional({ 
    example: 'PROJ-2025-002', 
    description: 'Código único del proyecto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { 
    message: 'El código debe contener solo letras mayúsculas, números y guiones' 
  })
  codigo?: string;

  @ApiPropertyOptional({ 
    example: 'Edificio Residencial Torres del Bosque', 
    description: 'Nombre del proyecto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ 
    example: 'Proyecto de 30 apartamentos distribuidos en 8 pisos con áreas comunes', 
    description: 'Descripción detallada del proyecto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ 
    example: 'Calle 50 #25-15, Bogotá', 
    description: 'Ubicación física del proyecto' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  ubicacion?: string;

  @ApiPropertyOptional({ 
    example: '2025-05-20', 
    description: 'Fecha planeada de inicio del proyecto' 
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ 
    example: '2026-11-30', 
    description: 'Fecha estimada de finalización del proyecto' 
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiPropertyOptional({ 
    example: '2025-12-15', 
    description: 'Fecha real de finalización del proyecto' 
  })
  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  @ApiPropertyOptional({ 
    example: '2800000.75', 
    description: 'Presupuesto total asignado al proyecto' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  presupuestoTotal?: string;

  @ApiPropertyOptional({ 
    example: 'ejecucion', 
    description: 'Estado actual del proyecto',
    enum: ['planificacion', 'ejecucion', 'pausado', 'finalizado', 'cancelado'] 
  })
  @IsIn(['planificacion', 'ejecucion', 'pausado', 'finalizado', 'cancelado'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ 
    example: 'media', 
    description: 'Nivel de prioridad del proyecto',
    enum: ['baja', 'media', 'alta'] 
  })
  @IsIn(['baja', 'media', 'alta'])
  @IsOptional()
  prioridad?: string;
}
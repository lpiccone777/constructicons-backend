import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTareaDto {
  @ApiPropertyOptional({
    example: 'Excavación y preparación para cimientos',
    description: 'Nombre de la tarea',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    example:
      'Excavación de 3.5 metros de profundidad y compactación del terreno',
    description: 'Descripción detallada de la tarea',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Orden de la tarea dentro de la etapa',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  orden?: number;

  @ApiPropertyOptional({
    example: '2025-04-18',
    description: 'Fecha planeada de inicio de la tarea',
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: '2025-04-28',
    description: 'Fecha estimada de finalización de la tarea',
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiPropertyOptional({
    example: '2025-04-27',
    description: 'Fecha real de finalización de la tarea',
  })
  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  @ApiPropertyOptional({
    example: 'en_progreso',
    description: 'Estado actual de la tarea',
    enum: ['pendiente', 'en_progreso', 'completada'],
  })
  @IsIn(['pendiente', 'en_progreso', 'completada'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    example: 'media',
    description: 'Nivel de prioridad de la tarea',
    enum: ['baja', 'media', 'alta'],
  })
  @IsIn(['baja', 'media', 'alta'])
  @IsOptional()
  prioridad?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  IsNotEmpty,
  MaxLength,
  Min
} from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({ 
    example: 'Excavación para cimientos', 
    description: 'Nombre de la tarea' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ 
    example: 'Excavación de 3 metros de profundidad para la base de los cimientos', 
    description: 'Descripción detallada de la tarea' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID de la etapa a la que pertenece esta tarea' 
  })
  @IsNumber()
  @IsNotEmpty()
  etapaId!: number;

  @ApiProperty({ 
    example: 1, 
    description: 'Orden de la tarea dentro de la etapa' 
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  orden!: number;

  @ApiPropertyOptional({ 
    example: '2025-04-15', 
    description: 'Fecha planeada de inicio de la tarea' 
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ 
    example: '2025-04-25', 
    description: 'Fecha estimada de finalización de la tarea' 
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiPropertyOptional({ 
    example: 'pendiente', 
    description: 'Estado actual de la tarea',
    enum: ['pendiente', 'en_progreso', 'completada'] 
  })
  @IsIn(['pendiente', 'en_progreso', 'completada'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ 
    example: 'alta', 
    description: 'Nivel de prioridad de la tarea',
    enum: ['baja', 'media', 'alta'] 
  })
  @IsIn(['baja', 'media', 'alta'])
  @IsOptional()
  prioridad?: string;
}
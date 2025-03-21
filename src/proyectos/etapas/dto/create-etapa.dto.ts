import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsDecimal,
  IsIn,
  IsNotEmpty,
  MaxLength,
  Min,
  Max
} from 'class-validator';

export class CreateEtapaDto {
  @ApiProperty({ 
    example: 'Cimentación', 
    description: 'Nombre de la etapa del proyecto' 
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ 
    example: 'Construcción de cimientos y estructura base', 
    description: 'Descripción detallada de la etapa' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID del proyecto al que pertenece esta etapa' 
  })
  @IsNumber()
  @IsNotEmpty()
  proyectoId!: number;

  @ApiProperty({ 
    example: 1, 
    description: 'Orden de la etapa dentro del proyecto' 
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  orden!: number;

  @ApiPropertyOptional({ 
    example: '2025-04-15', 
    description: 'Fecha planeada de inicio de la etapa' 
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({ 
    example: '2025-07-30', 
    description: 'Fecha estimada de finalización de la etapa' 
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiProperty({ 
    example: '500000.50', 
    description: 'Presupuesto asignado a esta etapa' 
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  presupuesto!: string;

  @ApiPropertyOptional({ 
    example: 'pendiente', 
    description: 'Estado actual de la etapa',
    enum: ['pendiente', 'en_progreso', 'completada'] 
  })
  @IsIn(['pendiente', 'en_progreso', 'completada'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ 
    example: 30, 
    description: 'Porcentaje de avance de la etapa (0-100)' 
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  avance?: number;
}
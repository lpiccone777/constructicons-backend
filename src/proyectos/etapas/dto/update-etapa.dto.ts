import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsDecimal,
  IsIn,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateEtapaDto {
  @ApiPropertyOptional({
    example: 'Cimentación y Estructura',
    description: 'Nombre de la etapa del proyecto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Construcción de cimientos, columnas y vigas',
    description: 'Descripción detallada de la etapa',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Orden de la etapa dentro del proyecto',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  orden?: number;

  @ApiPropertyOptional({
    example: '2025-05-01',
    description: 'Fecha planeada de inicio de la etapa',
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: '2025-08-15',
    description: 'Fecha estimada de finalización de la etapa',
  })
  @IsDateString()
  @IsOptional()
  fechaFinEstimada?: string;

  @ApiPropertyOptional({
    example: '2025-08-10',
    description: 'Fecha real de finalización de la etapa',
  })
  @IsDateString()
  @IsOptional()
  fechaFinReal?: string;

  @ApiPropertyOptional({
    example: '550000.75',
    description: 'Presupuesto asignado a esta etapa',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  presupuesto?: string;

  @ApiPropertyOptional({
    example: 'en_progreso',
    description: 'Estado actual de la etapa',
    enum: ['pendiente', 'en_progreso', 'completada'],
  })
  @IsIn(['pendiente', 'en_progreso', 'completada'])
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    example: 45,
    description: 'Porcentaje de avance de la etapa (0-100)',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  avance?: number;
}

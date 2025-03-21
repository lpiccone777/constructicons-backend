import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  IsDateString,
  MaxLength
} from 'class-validator';

export class UpdateAsignacionProyectoDto {
  @ApiPropertyOptional({ 
    example: 'ingeniero', 
    description: 'Rol del usuario en el proyecto',
    enum: ['director', 'arquitecto', 'ingeniero', 'capataz', 'obrero', 'administrativo'] 
  })
  @IsString()
  @IsOptional()
  @IsIn(['director', 'arquitecto', 'ingeniero', 'capataz', 'obrero', 'administrativo'])
  @MaxLength(50)
  rol?: string;

  @ApiPropertyOptional({ 
    example: '2025-05-30', 
    description: 'Fecha de desasignación del usuario' 
  })
  @IsDateString()
  @IsOptional()
  fechaDesasignacion?: string;

  @ApiPropertyOptional({ 
    example: false, 
    description: 'Indica si la asignación está activa' 
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
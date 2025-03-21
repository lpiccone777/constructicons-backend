import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsIn,
  MaxLength
} from 'class-validator';

export class CreateAsignacionProyectoDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID del proyecto al que se asigna el usuario' 
  })
  @IsNumber()
  @IsNotEmpty()
  proyectoId!: number;

  @ApiProperty({ 
    example: 2, 
    description: 'ID del usuario que se asigna al proyecto' 
  })
  @IsNumber()
  @IsNotEmpty()
  usuarioId!: number;

  @ApiProperty({ 
    example: 'director', 
    description: 'Rol del usuario en el proyecto',
    enum: ['director', 'arquitecto', 'ingeniero', 'capataz', 'obrero', 'administrativo'] 
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['director', 'arquitecto', 'ingeniero', 'capataz', 'obrero', 'administrativo'])
  @MaxLength(50)
  rol!: string;
}
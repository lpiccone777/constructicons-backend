import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty
} from 'class-validator';

export class CreateAsignacionTareaDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID de la tarea a la que se asigna el usuario' 
  })
  @IsNumber()
  @IsNotEmpty()
  tareaId!: number;

  @ApiProperty({ 
    example: 2, 
    description: 'ID del usuario que se asigna a la tarea' 
  })
  @IsNumber()
  @IsNotEmpty()
  usuarioId!: number;
}
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAsignacionEmpleadoTareaDto {
  @ApiProperty({ example: 1, description: 'ID del empleado asignado' })
  @IsNumber()
  @IsNotEmpty()
  empleadoId!: number;

  @ApiProperty({ example: 5, description: 'ID de la tarea a la que se asigna el empleado' })
  @IsNumber()
  @IsNotEmpty()
  tareaId!: number;

  @ApiProperty({ example: 40, description: 'Horas estimadas para la tarea' })
  @IsNumber()
  @IsNotEmpty()
  horasEstimadas!: number;

  @ApiProperty({ example: 1500.00, description: 'Valor hora del empleado en la tarea' })
  @IsNumber()
  @IsNotEmpty()
  valorHora!: number;

  @ApiPropertyOptional({ example: 'Asignación para el desarrollo de la instalación eléctrica', description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

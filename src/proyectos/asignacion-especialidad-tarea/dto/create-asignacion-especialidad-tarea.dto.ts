import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAsignacionEspecialidadTareaDto {
  @ApiProperty({ example: 1, description: 'ID de la tarea' })
  @IsNumber()
  @IsNotEmpty()
  tareaId!: number;

  @ApiProperty({ example: 2, description: 'ID de la especialidad a asignar' })
  @IsNumber()
  @IsNotEmpty()
  especialidadId!: number;

  @ApiProperty({ example: 2, description: 'Cantidad de especialistas requeridos' })
  @IsNumber()
  @IsNotEmpty()
  cantidad!: number;

  @ApiProperty({ example: 40, description: 'Horas estimadas para la tarea' })
  @IsNumber()
  @IsNotEmpty()
  horasEstimadas!: number;

  @ApiProperty({ example: 1500.00, description: 'Valor hora de la especialidad en la tarea' })
  @IsNumber()
  @IsNotEmpty()
  valorHora!: number;

  @ApiPropertyOptional({ example: 120000.00, description: 'Costo total calculado (cantidad * horasEstimadas * valorHora)', required: false })
  @IsNumber()
  @IsOptional()
  costoTotal?: number;

  @ApiPropertyOptional({ example: 'Observaciones sobre la asignación', description: 'Observaciones adicionales', required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

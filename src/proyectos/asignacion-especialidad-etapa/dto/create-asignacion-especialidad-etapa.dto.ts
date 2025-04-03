import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAsignacionEspecialidadEtapaDto {
  @ApiProperty({ example: 1, description: 'ID de la etapa del proyecto' })
  @IsNumber()
  @IsNotEmpty()
  etapaId!: number;

  @ApiProperty({ example: 2, description: 'ID de la especialidad' })
  @IsNumber()
  @IsNotEmpty()
  especialidadId!: number;

  @ApiProperty({ example: 3, description: 'Cantidad de recursos asignados' })
  @IsNumber()
  @IsNotEmpty()
  cantidadRecursos!: number;

  @ApiProperty({ example: 120.5, description: 'Horas estimadas para la etapa' })
  @IsNumber()
  @IsNotEmpty()
  horasEstimadas!: number;

  @ApiProperty({
    example: 1500.0,
    description: 'Valor hora para la especialidad en la etapa',
  })
  @IsNumber()
  @IsNotEmpty()
  valorHora!: number;

  @ApiPropertyOptional({
    example: 5400.0,
    description:
      'Costo total calculado (cantidadRecursos * horasEstimadas * valorHora)',
  })
  @IsNumber()
  @IsOptional()
  costoTotal?: number;

  @ApiPropertyOptional({
    example: 'Observaciones sobre la asignación',
    description: 'Observaciones adicionales',
    required: false,
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

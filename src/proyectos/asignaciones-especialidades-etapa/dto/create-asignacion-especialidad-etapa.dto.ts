import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDecimal,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateAsignacionEspecialidadEtapaDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la etapa a la que se asigna la especialidad',
  })
  @IsNumber()
  @IsNotEmpty()
  etapaId!: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la especialidad a asignar',
  })
  @IsNumber()
  @IsNotEmpty()
  especialidadId!: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad de recursos necesarios de esta especialidad',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  cantidadRecursos!: number;

  @ApiProperty({
    example: '160.00',
    description: 'Horas estimadas para la etapa',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  horasEstimadas!: string;

  @ApiProperty({
    example: '1500.00',
    description: 'Valor hora para esta especialidad',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  valorHora!: string;

  @ApiPropertyOptional({
    example: 'Horas estimadas para realizar la cimentación',
    description: 'Observaciones adicionales',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}
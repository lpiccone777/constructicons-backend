import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDecimal,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateAsignacionEspecialidadEtapaDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Cantidad de recursos necesarios de esta especialidad',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  cantidadRecursos?: number;

  @ApiPropertyOptional({
    example: '200.00',
    description: 'Horas estimadas para la etapa',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  horasEstimadas?: string;

  @ApiPropertyOptional({
    example: '1650.75',
    description: 'Valor hora para esta especialidad',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  valorHora?: string;

  @ApiPropertyOptional({
    example: 'Se requiere más tiempo por complejidad del terreno',
    description: 'Observaciones adicionales',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}

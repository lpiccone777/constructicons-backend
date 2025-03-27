import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGremioEspecialidadDto {
  @ApiProperty({ example: 1, description: 'ID del gremio' })
  @IsNumber()
  @IsNotEmpty()
  gremioId!: number;

  @ApiProperty({ example: 2, description: 'ID de la especialidad' })
  @IsNumber()
  @IsNotEmpty()
  especialidadId!: number;
}

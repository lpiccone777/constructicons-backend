import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateNotaDto {
  @ApiProperty({
    example: 1,
    description: 'ID del proyecto al que pertenece la nota',
  })
  @IsNumber()
  @IsNotEmpty()
  proyectoId!: number;

  @ApiProperty({
    example: 'Se requiere revisar los niveles de la cimentación',
    description: 'Contenido de la nota o comentario',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenido!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la nota es privada (solo para roles específicos)',
  })
  @IsBoolean()
  @IsOptional()
  esPrivada?: boolean;
}

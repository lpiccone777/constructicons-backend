import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength
} from 'class-validator';

export class UpdateNotaDto {
  @ApiPropertyOptional({ 
    example: 'Se requiere revisar urgentemente los niveles de la cimentación', 
    description: 'Contenido de la nota o comentario' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  contenido?: string;

  @ApiPropertyOptional({ 
    example: false, 
    description: 'Indica si la nota es privada (solo para roles específicos)' 
  })
  @IsBoolean()
  @IsOptional()
  esPrivada?: boolean;
}
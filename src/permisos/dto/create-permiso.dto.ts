// src/permisos/dto/create-permiso.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermisoDto {
  @ApiProperty({ example: 'usuarios.crear' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({ example: 'Permiso para crear nuevos usuarios' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 'usuarios' })
  @IsString()
  @IsNotEmpty()
  modulo!: string;

  @ApiProperty({ example: 'crear' })
  @IsString()
  @IsNotEmpty()
  accion!: string;
}

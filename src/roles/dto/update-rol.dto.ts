// src/roles/dto/update-rol.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRolDto {
  @ApiPropertyOptional({ example: 'superadmin' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Super Administrador' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: ['usuarios.crear', 'usuarios.leer'] })
  @IsOptional()
  @IsArray()
  permisos?: string[];
}

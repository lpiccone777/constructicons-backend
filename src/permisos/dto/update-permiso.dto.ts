// src/permisos/dto/update-permiso.dto.ts
import {
    IsString,
    IsOptional,
  } from 'class-validator';
  
  import { ApiPropertyOptional } from '@nestjs/swagger';
  
  export class UpdatePermisoDto {
    @ApiPropertyOptional({ example: 'usuarios.modificar' })
    @IsOptional()
    @IsString()
    nombre?: string;
  
    @ApiPropertyOptional({ example: 'Permiso para modificar usuarios' })
    @IsOptional()
    @IsString()
    descripcion?: string;
  
    @ApiPropertyOptional({ example: 'usuarios' })
    @IsOptional()
    @IsString()
    modulo?: string;
  
    @ApiPropertyOptional({ example: 'modificar' })
    @IsOptional()
    @IsString()
    accion?: string;
  }
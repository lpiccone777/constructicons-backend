// src/roles/dto/create-rol.dto.ts
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
  } from 'class-validator';
  
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export class CreateRolDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    @IsNotEmpty()
    nombre!: string;
  
    @ApiPropertyOptional({ example: 'Administrador del sistema' })
    @IsOptional()
    @IsString()
    descripcion?: string;
  
    @ApiPropertyOptional({ example: ['usuarios.crear', 'usuarios.leer'] })
    @IsOptional()
    @IsArray()
    permisos?: string[];
  }
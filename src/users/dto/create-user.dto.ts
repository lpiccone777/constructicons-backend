// src/users/dto/create-user.dto.ts
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsOptional,
    IsArray,
    IsBoolean,
    IsIn,
  } from 'class-validator';
  
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    nombre!: string;
  
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email!: string;
  
    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6)
    password!: string;
  
    @ApiPropertyOptional({ example: ['admin'] })
    @IsOptional()
    @IsArray()
    roles?: string[];
  
    @ApiPropertyOptional({ example: 'activo' })
    @IsOptional()
    @IsIn(['activo', 'inactivo'])
    estado?: string;
  
    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    esSuperUsuario?: boolean;
  }
// src/users/dto/update-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: ['admin'] })
  @IsOptional()
  @IsArray()
  roles?: string[];

  @ApiPropertyOptional({ example: 'inactivo' })
  @IsOptional()
  @IsIn(['activo', 'inactivo'])
  estado?: string;
}

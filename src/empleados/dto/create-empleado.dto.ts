// src/empleados/dto/create-empleado.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDate,
  IsISO8601,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateEmpleadoDto {
  @ApiProperty({
    example: 'EMP-001',
    description: 'Código único del empleado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message:
      'El código debe contener solo letras mayúsculas, números y guiones',
  })
  codigo!: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del empleado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del empleado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;

  @ApiProperty({
    example: 'DNI',
    description: 'Tipo de documento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tipoDocumento!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de documento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiPropertyOptional({
    example: '1980-01-01',
    description: 'Fecha de nacimiento',
  })
  @IsOptional()
  @IsISO8601()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Teléfono de contacto',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'Email de contacto',
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    example: 'Calle Principal 123',
    description: 'Dirección',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion?: string;

  @ApiPropertyOptional({
    example: 'Ciudad',
    description: 'Ciudad',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({
    example: '12345',
    description: 'Código postal',
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  codigoPostal?: string;

  @ApiPropertyOptional({
    example: 'País',
    description: 'País',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  pais?: string;

  @ApiPropertyOptional({
    example: '2023-01-01',
    description: 'Fecha de ingreso',
  })
  @IsOptional()
  @IsISO8601()
  fechaIngreso?: string;

  @ApiPropertyOptional({
    example: 'activo',
    description: 'Estado del empleado',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  estado?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del gremio al que pertenece',
  })
  @IsOptional()
  gremioId?: number;

  @ApiPropertyOptional({
    example: 'Observaciones adicionales',
    description: 'Observaciones',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}

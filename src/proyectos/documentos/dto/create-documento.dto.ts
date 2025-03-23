import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateDocumentoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del proyecto al que pertenece el documento',
  })
  @IsNumber()
  @IsNotEmpty()
  proyectoId!: number;

  @ApiProperty({
    example: 'Plano arquitectónico - Planta baja',
    description: 'Nombre del documento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Plano detallado de la distribución de espacios en planta baja',
    description: 'Descripción del documento',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    example: 'plano',
    description: 'Tipo de documento',
    enum: ['plano', 'contrato', 'permiso', 'informe', 'presupuesto', 'otro'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['plano', 'contrato', 'permiso', 'informe', 'presupuesto', 'otro'])
  tipo!: string;

  @ApiProperty({
    example:
      'https://storage.constructicons.com/documentos/proyecto1/plano-pb.pdf',
    description: 'URL de almacenamiento del archivo',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  urlArchivo!: string;
}

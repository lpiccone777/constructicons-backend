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

// Este DTO se usa cuando se sube un archivo físicamente
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

  // El archivo se envía como un archivo multipart/form-data
  // No se incluye en el DTO porque se accede a través de req.file

  @ApiPropertyOptional({
    example:
      'https://storage.constructicons.com/documentos/proyecto1/plano-pb.pdf',
    description:
      'URL de almacenamiento del archivo (opcional si se sube archivo físico)',
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  urlArchivo?: string;
}

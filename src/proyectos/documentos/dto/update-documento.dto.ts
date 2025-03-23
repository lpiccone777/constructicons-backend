import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsUrl, MaxLength } from 'class-validator';

export class UpdateDocumentoDto {
  @ApiPropertyOptional({
    example: 'Plano arquitectónico - Planta baja v2',
    description: 'Nombre del documento',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({
    example:
      'Versión actualizada del plano con modificaciones en área de cocina',
    description: 'Descripción del documento',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'plano',
    description: 'Tipo de documento',
    enum: ['plano', 'contrato', 'permiso', 'informe', 'presupuesto', 'otro'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['plano', 'contrato', 'permiso', 'informe', 'presupuesto', 'otro'])
  tipo?: string;

  @ApiPropertyOptional({
    example:
      'https://storage.constructicons.com/documentos/proyecto1/plano-pb-v2.pdf',
    description: 'URL de almacenamiento del archivo',
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  urlArchivo?: string;
}

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDocumentoDto } from './create-documento.dto';
import { IsOptional, IsUrl, IsString, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Extendemos del DTO de creación, pero omitimos el proyectoId que no debería actualizarse
export class UpdateDocumentoDto extends PartialType(
  OmitType(CreateDocumentoDto, ['proyectoId'] as const),
) {
  @ApiPropertyOptional({
    example: 'Plano arquitectónico - Planta baja actualizado',
    description: 'Nombre del documento',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Plano detallado actualizado',
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
      'https://storage.constructicons.com/documentos/proyecto1/plano-pb-actualizado.pdf',
    description: 'URL de almacenamiento del archivo',
  })
  @IsString()
  @IsOptional()
  @IsUrl()
  urlArchivo?: string;
}

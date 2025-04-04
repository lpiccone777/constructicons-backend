import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';

// Configuración para validar tipos de archivos
const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  // Definir tipos MIME permitidos
  const allowedMimeTypes = [
    'application/pdf', // PDF
    'image/jpeg',
    'image/png',
    'image/gif', // Imágenes
    'application/msword', // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.ms-excel', // XLS
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-powerpoint', // PPT
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/zip',
    'application/x-zip-compressed', // ZIP
    'text/plain', // TXT
    'application/rtf', // RTF
    'image/svg+xml', // SVG
    'application/dxf', // DXF (AutoCAD)
    'application/dwg', // DWG (AutoCAD)
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`),
      false,
    );
  }
};

@ApiTags('documentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los documentos' })
  @ApiQuery({
    name: 'proyectoId',
    required: false,
    description: 'Filtrar por ID de proyecto',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de documento',
  })
  async findAll(
    @Query('proyectoId') proyectoId?: number,
    @Query('tipo') tipo?: string,
  ) {
    return this.documentosService.findAll(
      proyectoId ? +proyectoId : undefined,
      tipo,
    );
  }

  @Get(':id')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un documento por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findById(id);
  }

  @Get(':id/descargar')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Descargar un documento' })
  async descargarDocumento(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const documento = await this.documentosService.getDocumentoConContenido(id);

    if (!documento.contenidoArchivo) {
      if (documento.urlArchivo) {
        return res.redirect(documento.urlArchivo);
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'El documento no tiene contenido ni URL disponible',
      });
    }

    // Enviar el archivo como respuesta
    res.setHeader(
      'Content-Type',
      documento.mimeType || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${documento.nombre}${documento.extension ? '.' + documento.extension : ''}"`,
    );

    // Convertir el buffer a un stream para enviarlo
    const buffer = Buffer.from(documento.contenidoArchivo);
    res.end(buffer);
  }

  @Post()
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo documento sin archivo' })
  async create(@Body() createDto: CreateDocumentoDto, @Request() req: any) {
    if (!createDto.urlArchivo) {
      throw new BadRequestException(
        'Se requiere una URL de archivo cuando no se sube un archivo físico',
      );
    }
    return this.documentosService.create(createDto, req.user.id);
  }

  @Post('upload')
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @UseInterceptors(
    FileInterceptor('archivo', {
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB máximo
      },
    }),
  )
  @ApiOperation({ summary: 'Subir un documento con archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (máximo 10MB)',
        },
        proyectoId: {
          type: 'number',
          description: 'ID del proyecto al que pertenece el documento',
        },
        nombre: {
          type: 'string',
          description: 'Nombre del documento',
        },
        descripcion: {
          type: 'string',
          description: 'Descripción del documento (opcional)',
        },
        tipo: {
          type: 'string',
          enum: [
            'plano',
            'contrato',
            'permiso',
            'informe',
            'presupuesto',
            'otro',
          ],
          description: 'Tipo de documento',
        },
      },
    },
  })
  async uploadDocumento(
    @UploadedFile() archivo: Express.Multer.File,
    @Body() body: Record<string, any>,
    @Request() req: any,
  ) {
    if (!archivo) {
      throw new BadRequestException('No se ha enviado ningún archivo');
    }

    // Construir manualmente un DTO con solo los campos esperados
    const createDto: CreateDocumentoDto = {
      proyectoId: parseInt(body.proyectoId, 10),
      nombre: body.nombre,
      tipo: body.tipo,
    };

    // Agregar campos opcionales solo si existen
    if (body.descripcion) {
      createDto.descripcion = body.descripcion;
    }

    if (body.urlArchivo) {
      createDto.urlArchivo = body.urlArchivo;
    }

    // Extraer la extensión del archivo original
    const extension = path.extname(archivo.originalname).substring(1);

    return this.documentosService.createConArchivo(
      createDto,
      archivo.buffer,
      extension,
      archivo.mimetype,
      archivo.size,
      req.user.id,
    );
  }

  @Put(':id')
  @RequirePermissions('proyectos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un documento' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentoDto,
    @Request() req: any,
  ) {
    return this.documentosService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un documento' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.documentosService.delete(id, req.user.id);
  }
}

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
    Query
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
  import { PermissionsGuard } from '../../auth/guards/permissions.guard';
  import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
  import { DocumentosService } from './documentos.service';
  import { CreateDocumentoDto } from './dto/create-documento.dto';
  import { UpdateDocumentoDto } from './dto/update-documento.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
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
    @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por ID de proyecto' })
    @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de documento' })
    async findAll(
      @Query('proyectoId') proyectoId?: number,
      @Query('tipo') tipo?: string
    ) {
      return this.documentosService.findAll(
        proyectoId ? +proyectoId : undefined,
        tipo
      );
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener un documento por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.documentosService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear un nuevo documento' })
    async create(
      @Body() createDto: CreateDocumentoDto,
      @Request() req: any
    ) {
      return this.documentosService.create(createDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar un documento' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateDocumentoDto,
      @Request() req: any
    ) {
      return this.documentosService.update(id, updateDto, req.user.id);
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar un documento' })
    async delete(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.documentosService.delete(id, req.user.id);
    }
  }
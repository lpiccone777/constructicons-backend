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
  import { EtapasService } from './etapas.service';
  import { CreateEtapaDto } from './dto/create-etapa.dto';
  import { UpdateEtapaDto } from './dto/update-etapa.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('etapas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('etapas')
  export class EtapasController {
    constructor(private readonly etapasService: EtapasService) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las etapas' })
    @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por ID de proyecto' })
    async findAll(@Query('proyectoId') proyectoId?: number) {
      return this.etapasService.findAll(proyectoId ? +proyectoId : undefined);
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una etapa por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.etapasService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva etapa' })
    async create(@Body() createEtapaDto: CreateEtapaDto, @Request() req: any) {
      return this.etapasService.create(createEtapaDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una etapa' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateEtapaDto: UpdateEtapaDto,
      @Request() req: any
    ) {
      return this.etapasService.update(id, updateEtapaDto, req.user.id);
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una etapa' })
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
      return this.etapasService.delete(id, req.user.id);
    }
  
    @Post('reordenar/:proyectoId')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Reordenar las etapas de un proyecto' })
    async reordenar(
      @Param('proyectoId', ParseIntPipe) proyectoId: number,
      @Body() nuevosOrdenes: { id: number, orden: number }[],
      @Request() req: any
    ) {
      return this.etapasService.reordenarEtapas(proyectoId, nuevosOrdenes, req.user.id);
    }
  }
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
  import { TareasService } from './tareas.service';
  import { CreateTareaDto } from './dto/create-tarea.dto';
  import { UpdateTareaDto } from './dto/update-tarea.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('tareas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('tareas')
  export class TareasController {
    constructor(private readonly tareasService: TareasService) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las tareas' })
    @ApiQuery({ name: 'etapaId', required: false, description: 'Filtrar por ID de etapa' })
    async findAll(@Query('etapaId') etapaId?: number) {
      return this.tareasService.findAll(etapaId ? +etapaId : undefined);
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una tarea por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.tareasService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva tarea' })
    async create(@Body() createTareaDto: CreateTareaDto, @Request() req: any) {
      return this.tareasService.create(createTareaDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una tarea' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateTareaDto: UpdateTareaDto,
      @Request() req: any
    ) {
      return this.tareasService.update(id, updateTareaDto, req.user.id);
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una tarea' })
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
      return this.tareasService.delete(id, req.user.id);
    }
  
    @Post('reordenar/:etapaId')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Reordenar las tareas de una etapa' })
    async reordenar(
      @Param('etapaId', ParseIntPipe) etapaId: number,
      @Body() nuevosOrdenes: { id: number, orden: number }[],
      @Request() req: any
    ) {
      return this.tareasService.reordenarTareas(etapaId, nuevosOrdenes, req.user.id);
    }
  }
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
  import { AsignacionesService } from './asignaciones.service';
  import { CreateAsignacionProyectoDto } from './dto/create-asignacion-proyecto.dto';
  import { UpdateAsignacionProyectoDto } from './dto/update-asignacion-proyecto.dto';
  import { CreateAsignacionTareaDto } from './dto/create-asignacion-tarea.dto';
  import { UpdateAsignacionTareaDto } from './dto/update-asignacion-tarea.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('asignaciones')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('asignaciones')
  export class AsignacionesController {
    constructor(private readonly asignacionesService: AsignacionesService) {}
  
    // Endpoints para asignaciones de proyectos
    @Get('proyectos')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las asignaciones de proyectos' })
    @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por ID de proyecto' })
    @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por ID de usuario' })
    @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
    async findAllProyectoAsignaciones(
      @Query('proyectoId') proyectoId?: number,
      @Query('usuarioId') usuarioId?: number,
      @Query('activo') activo?: boolean
    ) {
      return this.asignacionesService.findAllProyectoAsignaciones(
        proyectoId ? +proyectoId : undefined,
        usuarioId ? +usuarioId : undefined,
        activo !== undefined ? activo === true : undefined
      );
    }
  
    @Get('proyectos/:id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una asignación de proyecto por su ID' })
    async findOneProyectoAsignacion(@Param('id', ParseIntPipe) id: number) {
      return this.asignacionesService.findProyectoAsignacionById(id);
    }
  
    @Post('proyectos')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva asignación de proyecto' })
    async createProyectoAsignacion(
      @Body() createDto: CreateAsignacionProyectoDto,
      @Request() req: any
    ) {
      return this.asignacionesService.createProyectoAsignacion(createDto, req.user.id);
    }
  
    @Put('proyectos/:id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una asignación de proyecto' })
    async updateProyectoAsignacion(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateAsignacionProyectoDto,
      @Request() req: any
    ) {
      return this.asignacionesService.updateProyectoAsignacion(id, updateDto, req.user.id);
    }
  
    @Delete('proyectos/:id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una asignación de proyecto' })
    async deleteProyectoAsignacion(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.asignacionesService.deleteProyectoAsignacion(id, req.user.id);
    }
  
    // Endpoints para asignaciones de tareas
    @Get('tareas')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las asignaciones de tareas' })
    @ApiQuery({ name: 'tareaId', required: false, description: 'Filtrar por ID de tarea' })
    @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por ID de usuario' })
    @ApiQuery({ name: 'activo', required: false, description: 'Filtrar por estado activo/inactivo' })
    async findAllTareaAsignaciones(
      @Query('tareaId') tareaId?: number,
      @Query('usuarioId') usuarioId?: number,
      @Query('activo') activo?: boolean
    ) {
      return this.asignacionesService.findAllTareaAsignaciones(
        tareaId ? +tareaId : undefined,
        usuarioId ? +usuarioId : undefined,
        activo !== undefined ? activo === true : undefined
      );
    }
  
    @Get('tareas/:id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una asignación de tarea por su ID' })
    async findOneTareaAsignacion(@Param('id', ParseIntPipe) id: number) {
      return this.asignacionesService.findTareaAsignacionById(id);
    }
  
    @Post('tareas')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva asignación de tarea' })
    async createTareaAsignacion(
      @Body() createDto: CreateAsignacionTareaDto,
      @Request() req: any
    ) {
      return this.asignacionesService.createTareaAsignacion(createDto, req.user.id);
    }
  
    @Put('tareas/:id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una asignación de tarea' })
    async updateTareaAsignacion(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateAsignacionTareaDto,
      @Request() req: any
    ) {
      return this.asignacionesService.updateTareaAsignacion(id, updateDto, req.user.id);
    }
  
    @Delete('tareas/:id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una asignación de tarea' })
    async deleteTareaAsignacion(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.asignacionesService.deleteTareaAsignacion(id, req.user.id);
    }
  }
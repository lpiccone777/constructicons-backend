// src/proyectos/asignaciones-materiales/asignaciones-materiales.controller.ts

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
  import { AsignacionesMaterialesService } from './asignaciones-materiales.service';
  import { CreateAsignacionMaterialDto } from './dto/create-asignacion-material.dto';
  import { UpdateAsignacionMaterialDto } from './dto/update-asignacion-material.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('asignaciones-materiales')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('asignaciones-materiales')
  export class AsignacionesMaterialesController {
    constructor(private readonly asignacionesMaterialesService: AsignacionesMaterialesService) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las asignaciones de materiales' })
    @ApiQuery({ name: 'tareaId', required: false, description: 'Filtrar por ID de tarea' })
    @ApiQuery({ name: 'materialId', required: false, description: 'Filtrar por ID de material' })
    @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
    async findAll(
      @Query('tareaId') tareaId?: number,
      @Query('materialId') materialId?: number,
      @Query('estado') estado?: string
    ) {
      return this.asignacionesMaterialesService.findAll(
        tareaId ? +tareaId : undefined,
        materialId ? +materialId : undefined,
        estado
      );
    }
  
    @Get('proyecto/:proyectoId/resumen')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener resumen de materiales por proyecto' })
    async getResumenMaterialesPorProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number) {
      return this.asignacionesMaterialesService.getResumenMaterialesPorProyecto(proyectoId);
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una asignación de material por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.asignacionesMaterialesService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva asignación de material' })
    async create(
      @Body() createDto: CreateAsignacionMaterialDto,
      @Request() req: any
    ) {
      return this.asignacionesMaterialesService.create(createDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una asignación de material' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateAsignacionMaterialDto,
      @Request() req: any
    ) {
      return this.asignacionesMaterialesService.update(id, updateDto, req.user.id);
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una asignación de material' })
    async delete(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.asignacionesMaterialesService.delete(id, req.user.id);
    }
  }
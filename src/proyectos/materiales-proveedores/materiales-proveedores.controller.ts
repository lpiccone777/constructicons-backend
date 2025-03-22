// src/proyectos/materiales-proveedores/materiales-proveedores.controller.ts

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
  import { MaterialesProveedoresService } from './materiales-proveedores.service';
  import { CreateMaterialProveedorDto } from './dto/create-material-proveedor.dto';
  import { UpdateMaterialProveedorDto } from './dto/update-material-proveedor.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('materiales-proveedores')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('materiales-proveedores')
  export class MaterialesProveedoresController {
    constructor(private readonly materialesProveedoresService: MaterialesProveedoresService) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las relaciones material-proveedor' })
    @ApiQuery({ name: 'materialId', required: false, description: 'Filtrar por ID de material' })
    @ApiQuery({ name: 'proveedorId', required: false, description: 'Filtrar por ID de proveedor' })
    async findAll(
      @Query('materialId') materialId?: number,
      @Query('proveedorId') proveedorId?: number
    ) {
      return this.materialesProveedoresService.findAll(
        materialId ? +materialId : undefined,
        proveedorId ? +proveedorId : undefined
      );
    }
  
    @Get('material/:materialId/comparativa')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener comparativa de proveedores para un material' })
    async getComparativaProveedores(@Param('materialId', ParseIntPipe) materialId: number) {
      return this.materialesProveedoresService.comparativaProveedores(materialId);
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una relación material-proveedor por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.materialesProveedoresService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva relación material-proveedor' })
    async create(
      @Body() createDto: CreateMaterialProveedorDto,
      @Request() req: any
    ) {
      return this.materialesProveedoresService.create(createDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una relación material-proveedor' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateMaterialProveedorDto,
      @Request() req: any
    ) {
      return this.materialesProveedoresService.update(id, updateDto, req.user.id);
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una relación material-proveedor' })
    async delete(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.materialesProveedoresService.delete(id, req.user.id);
    }
  }
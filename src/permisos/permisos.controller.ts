// src/permisos/permisos.controller.ts
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
  ForbiddenException,
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermisosService, CreatePermisoDto, UpdatePermisoDto } from './permisos.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiQuery({ name: 'modulo', required: false, description: 'Filtrar por módulo' })
  async findAll(@Query('modulo') modulo: string, @Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'permisos',
      'leer'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para ver permisos');
    }
    
    if (modulo) {
      return this.permisosService.findByModulo(modulo);
    }
    
    return this.permisosService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  async create(@Body() createPermisoDto: CreatePermisoDto, @Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'permisos',
      'crear'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para crear permisos');
    }
    
    return this.permisosService.create(createPermisoDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermisoDto: UpdatePermisoDto,
    @Request() req: any
  ) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'permisos',
      'actualizar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para actualizar permisos');
    }
    
    return this.permisosService.update(id, updatePermisoDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un permiso' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'permisos',
      'eliminar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para eliminar permisos');
    }
    
    return this.permisosService.delete(id, req.user.id);
  }
}
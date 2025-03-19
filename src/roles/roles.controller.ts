// src/roles/roles.controller.ts
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
  ForbiddenException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesService, CreateRolDto, UpdateRolDto } from './roles.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermisosService } from '../permisos/permisos.service';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permisosService: PermisosService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  async findAll(@Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'roles',
      'leer'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para ver roles');
    }
    
    return this.rolesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  async create(@Body() createRolDto: CreateRolDto, @Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'roles',
      'crear'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para crear roles');
    }
    
    return this.rolesService.create(createRolDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
    @Request() req: any
  ) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'roles',
      'actualizar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para actualizar roles');
    }
    
    return this.rolesService.update(id, updateRolDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'roles',
      'eliminar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para eliminar roles');
    }
    
    return this.rolesService.delete(id, req.user.id);
  }
}
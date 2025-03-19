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
  Query
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @RequirePermissions('permisos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiQuery({ name: 'modulo', required: false, description: 'Filtrar por módulo' })
  async findAll(@Query('modulo') modulo: string) {
    if (modulo) {
      return this.permisosService.findByModulo(modulo);
    }
    
    return this.permisosService.findAll();
  }

  @Post()
  @RequirePermissions('permisos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  async create(@Body() createPermisoDto: CreatePermisoDto, @Request() req: any) {
    return this.permisosService.create(createPermisoDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('permisos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un permiso' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermisoDto: UpdatePermisoDto,
    @Request() req: any
  ) {
    return this.permisosService.update(id, updatePermisoDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('permisos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un permiso' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.permisosService.delete(id, req.user.id);
  }
}
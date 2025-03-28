import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GremiosService } from './gremios.service';
import { CreateGremioDto } from './dto/create-gremio.dto';
import { UpdateGremioDto } from './dto/update-gremio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('gremios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('gremios')
export class GremiosController {
  constructor(private readonly gremiosService: GremiosService) {}

  @Post()
  @RequirePermissions('rrhh.crear')
  @ApiOperation({ summary: 'Crear un nuevo gremio' })
  async create(@Body() createDto: CreateGremioDto, @Request() req: any) {
    return this.gremiosService.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermissions('rrhh.leer')
  @ApiOperation({ summary: 'Obtener todos los gremios' })
  async findAll() {
    return this.gremiosService.findAll();
  }

  @Get(':id')
  @RequirePermissions('rrhh.leer')
  @ApiOperation({ summary: 'Obtener un gremio por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gremiosService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('rrhh.actualizar')
  @ApiOperation({ summary: 'Actualizar un gremio' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateGremioDto, @Request() req: any) {
    return this.gremiosService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('rrhh.eliminar')
  @ApiOperation({ summary: 'Eliminar un gremio' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.gremiosService.delete(id, req.user.id);
  }
}

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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('proyectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del proyecto',
  })
  async findAll(@Query('estado') estado?: string) {
    return this.proyectosService.findAll({ estado });
  }

  @Get('stats')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener estadísticas de proyectos' })
  async getStats() {
    return this.proyectosService.getStats();
  }

  @Get(':id')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un proyecto por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proyectosService.findById(id);
  }

  @Post()
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  async create(
    @Body() createProyectoDto: CreateProyectoDto,
    @Request() req: any,
  ) {
    return this.proyectosService.create(createProyectoDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('proyectos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un proyecto' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProyectoDto: UpdateProyectoDto,
    @Request() req: any,
  ) {
    return this.proyectosService.update(id, updateProyectoDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un proyecto' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.proyectosService.delete(id, req.user.id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AsignacionEspecialidadTareaService } from './asignacion-especialidad-tarea.service';
import { CreateAsignacionEspecialidadTareaDto } from './dto/create-asignacion-especialidad-tarea.dto';
import { UpdateAsignacionEspecialidadTareaDto } from './dto/update-asignacion-especialidad-tarea.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('asignacion-especialidad-tarea')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('asignacion-especialidad-tarea')
export class AsignacionEspecialidadTareaController {
  constructor(private readonly service: AsignacionEspecialidadTareaService) {}

  @Post()
  @RequirePermissions('proyectos.crear')
  @ApiOperation({ summary: 'Crear una asignación de especialidad a una tarea' })
  async create(@Body() createDto: CreateAsignacionEspecialidadTareaDto, @Request() req: any) {
    return this.service.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermissions('proyectos.leer')
  @ApiOperation({ summary: 'Obtener todas las asignaciones de especialidad a tareas' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('proyectos.leer')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('proyectos.actualizar')
  @ApiOperation({ summary: 'Actualizar una asignación de especialidad a una tarea' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAsignacionEspecialidadTareaDto, @Request() req: any) {
    return this.service.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @ApiOperation({ summary: 'Eliminar una asignación de especialidad a una tarea' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.delete(id, req.user.id);
  }
}

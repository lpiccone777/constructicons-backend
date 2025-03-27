import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AsignacionEmpleadoTareaService } from './asignacion-empleado-tarea.service';
import { CreateAsignacionEmpleadoTareaDto } from './dto/create-asignacion-empleado-tarea.dto';
import { UpdateAsignacionEmpleadoTareaDto } from './dto/update-asignacion-empleado-tarea.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('asignacion-empleado-tarea')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('asignacion-empleado-tarea')
export class AsignacionEmpleadoTareaController {
  constructor(private readonly service: AsignacionEmpleadoTareaService) {}

  @Post()
  @RequirePermissions('proyectos.crear')
  @ApiOperation({ summary: 'Crear una asignación de empleado a una tarea' })
  async create(@Body() createDto: CreateAsignacionEmpleadoTareaDto, @Request() req: any) {
    return this.service.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermissions('proyectos.leer')
  @ApiOperation({ summary: 'Obtener todas las asignaciones de empleado a tareas' })
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
  @ApiOperation({ summary: 'Actualizar una asignación de empleado a una tarea' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAsignacionEmpleadoTareaDto, @Request() req: any) {
    return this.service.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @ApiOperation({ summary: 'Eliminar una asignación de empleado a una tarea' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.delete(id, req.user.id);
  }
}

// src/empleados-especialidades/empleados-especialidades.controller.ts
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
import { EmpleadosEspecialidadesService } from './empleados-especialidades.service';
import { CreateEmpleadoEspecialidadDto } from './dto/create-empleado-especialidad.dto';
import { UpdateEmpleadoEspecialidadDto } from './dto/update-empleado-especialidad.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('empleados-especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empleados-especialidades')
export class EmpleadosEspecialidadesController {
  constructor(
    private readonly empleadosEspecialidadesService: EmpleadosEspecialidadesService,
  ) {}

  @Get()
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todas las asignaciones de especialidades' })
  @ApiQuery({
    name: 'empleadoId',
    required: false,
    description: 'Filtrar por ID de empleado',
  })
  @ApiQuery({
    name: 'especialidadId',
    required: false,
    description: 'Filtrar por ID de especialidad',
  })
  async findAll(
    @Query('empleadoId') empleadoId?: number,
    @Query('especialidadId') especialidadId?: number,
  ) {
    return this.empleadosEspecialidadesService.findAll({
      empleadoId: empleadoId ? +empleadoId : undefined,
      especialidadId: especialidadId ? +especialidadId : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener una asignación por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosEspecialidadesService.findById(id);
  }

  @Post()
  @RequirePermissions('rrhh.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear una nueva asignación de especialidad' })
  async create(
    @Body() createDto: CreateEmpleadoEspecialidadDto,
    @Request() req: any,
  ) {
    return this.empleadosEspecialidadesService.create(createDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('rrhh.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar una asignación de especialidad' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmpleadoEspecialidadDto,
    @Request() req: any,
  ) {
    return this.empleadosEspecialidadesService.update(
      id,
      updateDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @RequirePermissions('rrhh.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar una asignación de especialidad' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.empleadosEspecialidadesService.delete(id, req.user.id);
  }
}

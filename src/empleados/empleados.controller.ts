// src/empleados/empleados.controller.ts
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
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('empleados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los empleados' })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del empleado',
  })
  @ApiQuery({
    name: 'gremioId',
    required: false,
    description: 'Filtrar por ID de gremio',
  })
  async findAll(
    @Query('estado') estado?: string,
    @Query('gremioId') gremioId?: number,
  ) {
    return this.empleadosService.findAll({
      estado,
      gremioId: gremioId ? +gremioId : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un empleado por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findById(id);
  }

  @Post()
  @RequirePermissions('rrhh.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  async create(
    @Body() createEmpleadoDto: CreateEmpleadoDto,
    @Request() req: any,
  ) {
    return this.empleadosService.create(createEmpleadoDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('rrhh.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un empleado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @Request() req: any,
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('rrhh.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un empleado' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.empleadosService.delete(id, req.user.id);
  }
}

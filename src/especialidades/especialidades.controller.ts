// src/especialidades/especialidades.controller.ts
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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { EspecialidadesService } from './especialidades.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('especialidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  @Get()
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todas las especialidades' })
  async findAll() {
    return this.especialidadesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('rrhh.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener una especialidad por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.especialidadesService.findById(id);
  }

  @Post()
  @RequirePermissions('rrhh.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear una nueva especialidad' })
  async create(
    @Body() createEspecialidadDto: CreateEspecialidadDto,
    @Request() req: any,
  ) {
    return this.especialidadesService.create(
      createEspecialidadDto,
      req.user.id,
    );
  }

  @Put(':id')
  @RequirePermissions('rrhh.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar una especialidad' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEspecialidadDto: UpdateEspecialidadDto,
    @Request() req: any,
  ) {
    return this.especialidadesService.update(
      id,
      updateEspecialidadDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @RequirePermissions('rrhh.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar una especialidad' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.especialidadesService.delete(id, req.user.id);
  }
}

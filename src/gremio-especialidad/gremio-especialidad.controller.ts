import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GremioEspecialidadService } from './gremio-especialidad.service';
import { CreateGremioEspecialidadDto } from './dto/create-gremio-especialidad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('gremio-especialidad')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('gremio-especialidad')
export class GremioEspecialidadController {
  constructor(private readonly service: GremioEspecialidadService) {}

  @Post()
  @RequirePermissions('rrhh.crear')
  @ApiOperation({ summary: 'Asociar una especialidad a un gremio' })
  async create(
    @Body() createDto: CreateGremioEspecialidadDto,
    @Request() req: any,
  ) {
    return this.service.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermissions('rrhh.leer')
  @ApiOperation({
    summary: 'Obtener todas las asociaciones de especialidades a gremios',
  })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('rrhh.leer')
  @ApiOperation({ summary: 'Obtener una asociación por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @RequirePermissions('rrhh.eliminar')
  @ApiOperation({ summary: 'Eliminar una asociación de especialidad a gremio' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.delete(id, req.user.id);
  }
}

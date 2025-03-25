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
  import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
  import { PermissionsGuard } from '../../auth/guards/permissions.guard';
  import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
  import { AsignacionesEspecialidadesEtapaService } from './asignaciones-especialidades-etapa.service';
  import { CreateAsignacionEspecialidadEtapaDto } from './dto/create-asignacion-especialidad-etapa.dto';
  import { UpdateAsignacionEspecialidadEtapaDto } from './dto/update-asignacion-especialidad-etapa.dto';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
  } from '@nestjs/swagger';
  
  @ApiTags('asignaciones-especialidades-etapa')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('asignaciones-especialidades-etapa')
  export class AsignacionesEspecialidadesEtapaController {
    constructor(
      private readonly asignacionesEspecialidadesEtapaService: AsignacionesEspecialidadesEtapaService,
    ) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las asignaciones de especialidades a etapas' })
    @ApiQuery({
      name: 'etapaId',
      required: false,
      description: 'Filtrar por ID de etapa',
    })
    @ApiQuery({
      name: 'especialidadId',
      required: false,
      description: 'Filtrar por ID de especialidad',
    })
    async findAll(
      @Query('etapaId') etapaId?: number,
      @Query('especialidadId') especialidadId?: number,
    ) {
      return this.asignacionesEspecialidadesEtapaService.findAll(
        etapaId ? +etapaId : undefined,
        especialidadId ? +especialidadId : undefined,
      );
    }
  
    @Get('proyectos/:proyectoId/resumen')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener resumen de mano de obra por proyecto' })
    async getResumenPorProyecto(
      @Param('proyectoId', ParseIntPipe) proyectoId: number,
    ) {
      return this.asignacionesEspecialidadesEtapaService.getResumenPorProyecto(proyectoId);
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una asignación de especialidad a etapa por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.asignacionesEspecialidadesEtapaService.findById(id);
    }
  
    @Post()
    @RequirePermissions('proyectos.crear')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Crear una nueva asignación de especialidad a etapa' })
    async create(
      @Body() createDto: CreateAsignacionEspecialidadEtapaDto,
      @Request() req: any,
    ) {
      return this.asignacionesEspecialidadesEtapaService.create(createDto, req.user.id);
    }
  
    @Put(':id')
    @RequirePermissions('proyectos.actualizar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Actualizar una asignación de especialidad a etapa' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateAsignacionEspecialidadEtapaDto,
      @Request() req: any,
    ) {
      return this.asignacionesEspecialidadesEtapaService.update(
        id,
        updateDto,
        req.user.id,
      );
    }
  
    @Delete(':id')
    @RequirePermissions('proyectos.eliminar')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Eliminar una asignación de especialidad a etapa' })
    async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
      return this.asignacionesEspecialidadesEtapaService.delete(id, req.user.id);
    }
  }
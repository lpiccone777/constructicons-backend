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
  import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
  import { PermissionsGuard } from '../../auth/guards/permissions.guard';
  import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
  import { NotasService } from './notas.service';
  import { CreateNotaDto } from './dto/create-nota.dto';
  import { UpdateNotaDto } from './dto/update-nota.dto';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
  
  @ApiTags('notas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('notas')
  export class NotasController {
    constructor(private readonly notasService: NotasService) {}
  
    @Get()
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener todas las notas' })
    @ApiQuery({ name: 'proyectoId', required: false, description: 'Filtrar por ID de proyecto' })
    @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por ID de usuario' })
    async findAll(
      @Query('proyectoId') proyectoId?: number,
      @Query('usuarioId') usuarioId?: number
    ) {
      return this.notasService.findAll(
        proyectoId ? +proyectoId : undefined,
        usuarioId ? +usuarioId : undefined
      );
    }
  
    @Get(':id')
    @RequirePermissions('proyectos.leer')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Obtener una nota por su ID' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.notasService.findById(id);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard) // No requiere permiso especial - todos pueden crear notas
    @ApiOperation({ summary: 'Crear una nueva nota' })
    async create(
      @Body() createDto: CreateNotaDto,
      @Request() req: any
    ) {
      return this.notasService.create(createDto, req.user.id);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard) // Solo el creador puede modificar, lo que se comprueba en el servicio
    @ApiOperation({ summary: 'Actualizar una nota' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateNotaDto,
      @Request() req: any
    ) {
      return this.notasService.update(id, updateDto, req.user.id);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard) // Solo el creador puede eliminar, lo que se comprueba en el servicio
    @ApiOperation({ summary: 'Eliminar una nota' })
    async delete(
      @Param('id', ParseIntPipe) id: number,
      @Request() req: any
    ) {
      return this.notasService.delete(id, req.user.id);
    }
  }
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
import { MaterialesService } from './materiales.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('materiales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materiales')
export class MaterialesController {
  constructor(private readonly materialesService: MaterialesService) {}

  @Get()
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los materiales' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filtrar por categoría de material',
  })
  async findAll(@Query('categoria') categoria?: string) {
    return this.materialesService.findAll(categoria);
  }

  @Get('categorias')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener categorías de materiales' })
  async findCategorias() {
    return this.materialesService.findByCategorias();
  }

  @Get(':id')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un material por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialesService.findById(id);
  }

  @Post()
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo material' })
  async create(
    @Body() createMaterialDto: CreateMaterialDto,
    @Request() req: any,
  ) {
    return this.materialesService.create(createMaterialDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('proyectos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un material' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
    @Request() req: any,
  ) {
    return this.materialesService.update(id, updateMaterialDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un material' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.materialesService.delete(id, req.user.id);
  }
}

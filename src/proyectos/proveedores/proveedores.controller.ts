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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('proveedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filtrar por categoría de proveedor',
  })
  async findAll(@Query('categoria') categoria?: string) {
    return this.proveedoresService.findAll(categoria);
  }

  @Get(':id')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un proveedor por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findById(id);
  }

  @Post()
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  async create(
    @Body() createProveedorDto: CreateProveedorDto,
    @Request() req: any,
  ) {
    return this.proveedoresService.create(createProveedorDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('proyectos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedorDto: UpdateProveedorDto,
    @Request() req: any,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('proyectos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un proveedor' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.proveedoresService.delete(id, req.user.id);
  }

  // Endpoints para gestión de contactos
  @Get(':id/contactos')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener contactos de un proveedor' })
  async findContactos(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findContactos(id);
  }

  @Get('contactos/:id')
  @RequirePermissions('proyectos.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener un contacto por su ID' })
  async findContacto(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findContactoById(id);
  }

  @Post('contactos')
  @RequirePermissions('proyectos.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo contacto para un proveedor' })
  async createContacto(
    @Body() createContactoDto: CreateContactoDto,
    @Request() req: any,
  ) {
    return this.proveedoresService.createContacto(
      createContactoDto,
      req.user.id,
    );
  }

  @Put('contactos/:id')
  @RequirePermissions('proyectos.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un contacto' })
  async updateContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactoDto: UpdateContactoDto,
    @Request() req: any,
  ) {
    return this.proveedoresService.updateContacto(
      id,
      updateContactoDto,
      req.user.id,
    );
  }

  @Delete('contactos/:id')
  @RequirePermissions('proyectos.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un contacto' })
  async deleteContacto(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.proveedoresService.deleteContacto(id, req.user.id);
  }
}

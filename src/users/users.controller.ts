// src/users/users.controller.ts
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
  ForbiddenException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermisosService } from '../permisos/permisos.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permisosService: PermisosService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  async findAll(@Request() req) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'usuarios',
      'leer'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para ver usuarios');
    }
    
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'usuarios',
      'leer'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para ver usuarios');
    }
    
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'usuarios',
      'crear'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para crear usuarios');
    }
    
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'usuarios',
      'actualizar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para actualizar usuarios');
    }
    
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.id,
      'usuarios',
      'eliminar'
    );
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para eliminar usuarios');
    }
    
    return this.usersService.delete(id, req.user.id);
  }
}
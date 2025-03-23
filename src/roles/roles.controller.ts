// src/roles/roles.controller.ts
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
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.leer')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Obtener todos los roles' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('roles.crear')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  async create(@Body() createRolDto: CreateRolDto, @Request() req: any) {
    return this.rolesService.create(createRolDto, req.user.id);
  }

  @Put(':id')
  @RequirePermissions('roles.actualizar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Actualizar un rol' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRolDto: UpdateRolDto,
    @Request() req: any,
  ) {
    return this.rolesService.update(id, updateRolDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('roles.eliminar')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Eliminar un rol' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.rolesService.delete(id, req.user.id);
  }
}

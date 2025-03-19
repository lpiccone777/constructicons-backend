// src/permisos/permisos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

export interface CreatePermisoDto {
  nombre: string;
  descripcion?: string;
  modulo: string;
  accion: string;
}

export interface UpdatePermisoDto {
  nombre?: string;
  descripcion?: string;
  modulo?: string;
  accion?: string;
}

@Injectable()
export class PermisosService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    return this.prisma.permiso.findMany();
  }

  async findByModulo(modulo: string) {
    return this.prisma.permiso.findMany({
      where: { modulo },
    });
  }

  async create(data: CreatePermisoDto, usuarioCreadorId: number) {
    const nuevoPermiso = await this.prisma.permiso.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        modulo: data.modulo,
        accion: data.accion,
      },
    });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioCreadorId,
      'inserción',
      'Permiso',
      nuevoPermiso.id.toString(),
      { nombre: nuevoPermiso.nombre, modulo: nuevoPermiso.modulo }
    );
    
    return nuevoPermiso;
  }

  async update(id: number, data: UpdatePermisoDto, usuarioModificadorId: number) {
    // Verificar existencia del permiso
    const permisoExistente = await this.prisma.permiso.findUnique({
      where: { id },
    });
    
    if (!permisoExistente) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    
    // Actualizar permiso
    const permisoActualizado = await this.prisma.permiso.update({
      where: { id },
      data,
    });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioModificadorId,
      'actualización',
      'Permiso',
      id.toString(),
      { cambios: data }
    );
    
    return permisoActualizado;
  }

  async delete(id: number, usuarioEliminadorId: number) {
    // Verificar existencia del permiso
    const permiso = await this.prisma.permiso.findUnique({ 
      where: { id },
      include: { roles: true }
    });
    
    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    
    // Verificar si el permiso está asignado a roles
    if (permiso.roles.length > 0) {
      throw new NotFoundException(`No se puede eliminar el permiso porque está asignado a ${permiso.roles.length} roles`);
    }
    
    // Eliminar permiso
    await this.prisma.permiso.delete({ where: { id } });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioEliminadorId,
      'borrado',
      'Permiso',
      id.toString(),
      { nombre: permiso.nombre }
    );
  }

  async verificarPermiso(usuarioId: number, modulo: string, accion: string): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        roles: {
          include: {
            permisos: true,
          },
        },
      },
    });

    // Verificar si el usuario existe
    if (!usuario) return false;

    // Super usuario siempre tiene acceso
    if (usuario.esSuperUsuario) return true;

    // Verificar si alguno de los roles del usuario tiene el permiso requerido
    for (const rol of usuario.roles) {
      const tienePermiso = rol.permisos.some(
        p => p.modulo === modulo && p.accion === accion
      );
      if (tienePermiso) return true;
    }

    return false;
  }
}
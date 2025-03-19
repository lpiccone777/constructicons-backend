// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
  permisos?: string[]; // Nombres de los permisos
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  permisos?: string[];
}

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    return this.prisma.rol.findMany({
      include: { permisos: true },
    });
  }

  async findByNombre(nombre: string) {
    return this.prisma.rol.findFirst({
      where: { nombre },
      include: { permisos: true },
    });
  }

  async create(data: CreateRolDto, usuarioCreadorId: number) {
    // Preparar permisos si se proporcionan
    let permisosToConnect: { id: number }[] = [];
    if (data.permisos && data.permisos.length > 0) {
      permisosToConnect = await Promise.all(
        data.permisos.map(async (permisoNombre) => {
          const permiso = await this.prisma.permiso.findFirst({
            where: { nombre: permisoNombre },
          });
          if (!permiso) {
            throw new NotFoundException(`Permiso ${permisoNombre} no encontrado`);
          }
          return { id: permiso.id };
        })
      );
    }
    
    // Crear rol
    const nuevoRol = await this.prisma.rol.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        ...(permisosToConnect.length > 0 ? { permisos: { connect: permisosToConnect } } : {}),
      },
      include: { permisos: true },
    });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioCreadorId,
      'inserción',
      'Rol',
      nuevoRol.id.toString(),
      { nombre: nuevoRol.nombre, permisos: data.permisos }
    );
    
    return nuevoRol;
  }

  async update(id: number, data: UpdateRolDto, usuarioModificadorId: number) {
    // Verificar existencia del rol
    const rolExistente = await this.prisma.rol.findUnique({
      where: { id },
      include: { permisos: true },
    });
    
    if (!rolExistente) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    
    // Preparar datos de actualización
    const updateData: any = {};
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.descripcion) updateData.descripcion = data.descripcion;
    
    // Preparar permisos si se proporcionan
    let permisosToConnect: { id: number }[] = [];
    if (data.permisos && data.permisos.length > 0) {
      permisosToConnect = await Promise.all(
        data.permisos.map(async (permisoNombre) => {
          const permiso = await this.prisma.permiso.findFirst({
            where: { nombre: permisoNombre },
          });
          if (!permiso) {
            throw new NotFoundException(`Permiso ${permisoNombre} no encontrado`);
          }
          return { id: permiso.id };
        })
      );
    }
    
    // Realizar actualización en una transacción
    const rolActualizado = await this.prisma.$transaction(async (prisma) => {
      // Si hay nuevos permisos, primero desconectamos los anteriores
      if (permisosToConnect.length > 0) {
        await prisma.rol.update({
          where: { id },
          data: {
            permisos: {
              disconnect: rolExistente.permisos.map(permiso => ({ id: permiso.id })),
            },
          },
        });
      }
      
      // Ahora actualizamos con los nuevos datos
      return prisma.rol.update({
        where: { id },
        data: {
          ...updateData,
          ...(permisosToConnect.length > 0 ? { permisos: { connect: permisosToConnect } } : {}),
        },
        include: { permisos: true },
      });
    });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioModificadorId,
      'actualización',
      'Rol',
      id.toString(),
      { cambios: data }
    );
    
    return rolActualizado;
  }

  async delete(id: number, usuarioEliminadorId: number) {
    // Verificar existencia del rol
    const rol = await this.prisma.rol.findUnique({ 
      where: { id },
      include: { usuarios: true }
    });
    
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    
    // Verificar si el rol tiene usuarios asignados
    if (rol.usuarios.length > 0) {
      throw new NotFoundException(`No se puede eliminar el rol porque tiene ${rol.usuarios.length} usuarios asignados`);
    }
    
    // Eliminar rol
    await this.prisma.rol.delete({ where: { id } });
    
    // Registrar auditoría
    await this.auditoriaService.registrarAccion(
      usuarioEliminadorId,
      'borrado',
      'Rol',
      id.toString(),
      { nombre: rol.nombre }
    );
  }
}
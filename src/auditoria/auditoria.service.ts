// src/auditoria/auditoria.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private prisma: PrismaService) {}

  async registrarAccion(
    usuarioId: number,
    accion: string,
    entidad: string,
    entidadId: string,
    detalles?: any,
  ) {
    return this.prisma.auditoria.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        detalles: detalles ? detalles : undefined,
      },
    });
  }

  async obtenerRegistrosPorUsuario(usuarioId: number) {
    return this.prisma.auditoria.findMany({
      where: { usuarioId },
      orderBy: { fechaHora: 'desc' },
    });
  }

  async obtenerRegistrosPorEntidad(entidad: string, entidadId: string) {
    return this.prisma.auditoria.findMany({
      where: { entidad, entidadId },
      orderBy: { fechaHora: 'desc' },
      include: { usuario: { select: { id: true, nombre: true, email: true } } },
    });
  }
}

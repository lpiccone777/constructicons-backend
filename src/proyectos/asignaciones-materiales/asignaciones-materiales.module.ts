import { Module } from '@nestjs/common';
import { AsignacionesMaterialesController } from './asignaciones-materiales.controller';
import { AsignacionesMaterialesService } from './asignaciones-materiales.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';
import { PermisosModule } from '../../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [AsignacionesMaterialesController],
  providers: [AsignacionesMaterialesService],
  exports: [AsignacionesMaterialesService],
})
export class AsignacionesMaterialesModule {}
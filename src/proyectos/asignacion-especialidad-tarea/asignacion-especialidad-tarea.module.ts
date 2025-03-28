import { Module } from '@nestjs/common';
import { AsignacionEspecialidadTareaController } from './asignacion-especialidad-tarea.controller';
import { AsignacionEspecialidadTareaService } from './asignacion-especialidad-tarea.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';
import { PermisosModule } from '../../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [AsignacionEspecialidadTareaController],
  providers: [AsignacionEspecialidadTareaService],
  exports: [AsignacionEspecialidadTareaService],
})
export class AsignacionEspecialidadTareaModule {}
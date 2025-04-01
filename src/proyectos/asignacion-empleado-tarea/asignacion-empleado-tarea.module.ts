import { Module } from '@nestjs/common';
import { AsignacionEmpleadoTareaController } from './asignacion-empleado-tarea.controller';
import { AsignacionEmpleadoTareaService } from './asignacion-empleado-tarea.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';
import { PermisosModule } from '../../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [AsignacionEmpleadoTareaController],
  providers: [AsignacionEmpleadoTareaService],
  exports: [AsignacionEmpleadoTareaService],
})
export class AsignacionEmpleadoTareaModule {}

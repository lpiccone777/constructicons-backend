import { Module } from '@nestjs/common';
import { AsignacionEmpleadoTareaController } from './asignacion-empleado-tarea.controller';
import { AsignacionEmpleadoTareaService } from './asignacion-empleado-tarea.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [AsignacionEmpleadoTareaController],
  providers: [AsignacionEmpleadoTareaService],
  exports: [AsignacionEmpleadoTareaService],
})
export class AsignacionEmpleadoTareaModule {}

// src/empleados-especialidades/empleados-especialidades.module.ts
import { Module } from '@nestjs/common';
import { EmpleadosEspecialidadesController } from './empleados-especialidades.controller';
import { EmpleadosEspecialidadesService } from './empleados-especialidades.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisosModule } from '../permisos/permisos.module';

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule],
  controllers: [EmpleadosEspecialidadesController],
  providers: [EmpleadosEspecialidadesService],
  exports: [EmpleadosEspecialidadesService],
})
export class EmpleadosEspecialidadesModule {}

// src/especialidades/especialidades.module.ts
import { Module } from '@nestjs/common';
import { EspecialidadesController } from './especialidades.controller';
import { EspecialidadesService } from './especialidades.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisosModule } from '../permisos/permisos.module';

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule],
  controllers: [EspecialidadesController],
  providers: [EspecialidadesService],
  exports: [EspecialidadesService],
})
export class EspecialidadesModule {}

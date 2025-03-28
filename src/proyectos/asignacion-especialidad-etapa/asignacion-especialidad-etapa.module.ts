import { Module } from '@nestjs/common';
import { AsignacionEspecialidadEtapaController } from './asignacion-especialidad-etapa.controller';
import { AsignacionEspecialidadEtapaService } from './asignacion-especialidad-etapa.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [AsignacionEspecialidadEtapaController],
  providers: [AsignacionEspecialidadEtapaService],
  exports: [AsignacionEspecialidadEtapaService],
})
export class AsignacionEspecialidadEtapaModule {}

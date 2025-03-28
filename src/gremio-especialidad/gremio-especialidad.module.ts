import { Module } from '@nestjs/common';
import { GremioEspecialidadController } from './gremio-especialidad.controller';
import { GremioEspecialidadService } from './gremio-especialidad.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  controllers: [GremioEspecialidadController],
  providers: [GremioEspecialidadService],
  exports: [GremioEspecialidadService],
})
export class GremioEspecialidadModule {}

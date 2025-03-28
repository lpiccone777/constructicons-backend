import { Module } from '@nestjs/common';
import { GremiosController } from './gremios.controller';
import { GremiosService } from './gremios.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisosModule } from '../permisos/permisos.module'; // Importación agregada

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule],
  controllers: [GremiosController],
  providers: [GremiosService],
  exports: [GremiosService],
})
export class GremiosModule {}

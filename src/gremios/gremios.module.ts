import { Module } from '@nestjs/common';
import { GremiosController } from './gremios.controller';
import { GremiosService } from './gremios.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisosModule } from '../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [GremiosController],
  providers: [GremiosService],
  exports: [GremiosService],
})
export class GremiosModule {}

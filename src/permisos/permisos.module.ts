// src/permisos/permisos.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, AuditoriaModule],
  providers: [PermisosService],
  controllers: [PermisosController],
  exports: [PermisosService],
})
export class PermisosModule {}
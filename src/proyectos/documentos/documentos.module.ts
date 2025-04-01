import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';
import { PermisosModule } from '../../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [DocumentosService],
})
export class DocumentosModule {}

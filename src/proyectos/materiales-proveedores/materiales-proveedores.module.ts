import { Module } from '@nestjs/common';
import { MaterialesProveedoresController } from './materiales-proveedores.controller';
import { MaterialesProveedoresService } from './materiales-proveedores.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditoriaModule } from '../../auditoria/auditoria.module';
import { PermisosModule } from '../../permisos/permisos.module'; // Añadir esta importación

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule], // Añadir PermisosModule aquí
  controllers: [MaterialesProveedoresController],
  providers: [MaterialesProveedoresService],
  exports: [MaterialesProveedoresService],
})
export class MaterialesProveedoresModule {}
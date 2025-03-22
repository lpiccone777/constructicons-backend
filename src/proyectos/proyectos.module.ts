import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermisosModule } from '../permisos/permisos.module';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';
import { EtapasController } from './etapas/etapas.controller';
import { EtapasService } from './etapas/etapas.service';
import { TareasController } from './tareas/tareas.controller';
import { TareasService } from './tareas/tareas.service';
import { AsignacionesController } from './asignaciones/asignaciones.controller';
import { AsignacionesService } from './asignaciones/asignaciones.service';
import { DocumentosController } from './documentos/documentos.controller';
import { DocumentosService } from './documentos/documentos.service';
import { NotasController } from './notas/notas.controller';
import { NotasService } from './notas/notas.service';
import { MaterialesController } from './materiales/materiales.controller';
import { MaterialesService } from './materiales/materiales.service';
import { ProveedoresController } from './proveedores/proveedores.controller';
import { ProveedoresService } from './proveedores/proveedores.service';

@Module({
  imports: [
    PrismaModule,
    AuditoriaModule,
    PermisosModule
  ],
  controllers: [
    ProyectosController,
    EtapasController,
    TareasController,
    AsignacionesController,
    DocumentosController,
    NotasController,
    MaterialesController,
    ProveedoresController
  ],
  providers: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService,
    DocumentosService,
    NotasService,
    MaterialesService,
    ProveedoresService
  ],
  exports: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService,
    MaterialesService,
    ProveedoresService
  ]
})
export class ProyectosModule {}
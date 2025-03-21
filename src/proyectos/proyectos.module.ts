import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
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

@Module({
  imports: [
    PrismaModule,
    AuditoriaModule
  ],
  controllers: [
    ProyectosController,
    EtapasController,
    TareasController,
    AsignacionesController,
    DocumentosController,
    NotasController
  ],
  providers: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService,
    DocumentosService,
    NotasService
  ],
  exports: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService
  ]
})
export class ProyectosModule {}
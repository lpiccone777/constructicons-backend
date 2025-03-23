// src/proyectos/proyectos.module.ts

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
import { AsignacionesMaterialesController } from './asignaciones-materiales/asignaciones-materiales.controller';
import { AsignacionesMaterialesService } from './asignaciones-materiales/asignaciones-materiales.service';
// Importar nuevos componentes
import { MaterialesProveedoresController } from './materiales-proveedores/materiales-proveedores.controller';
import { MaterialesProveedoresService } from './materiales-proveedores/materiales-proveedores.service';

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule],
  controllers: [
    ProyectosController,
    EtapasController,
    TareasController,
    AsignacionesController,
    DocumentosController,
    NotasController,
    MaterialesController,
    ProveedoresController,
    AsignacionesMaterialesController,
    MaterialesProveedoresController, // Nuevo controlador
  ],
  providers: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService,
    DocumentosService,
    NotasService,
    MaterialesService,
    ProveedoresService,
    AsignacionesMaterialesService,
    MaterialesProveedoresService, // Nuevo servicio
  ],
  exports: [
    ProyectosService,
    EtapasService,
    TareasService,
    AsignacionesService,
    MaterialesService,
    ProveedoresService,
    AsignacionesMaterialesService,
    MaterialesProveedoresService, // Exportar nuevo servicio
  ],
})
export class ProyectosModule {}

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
import { NotasController } from './notas/notas.controller';
import { NotasService } from './notas/notas.service';
import { MaterialesController } from './materiales/materiales.controller';
import { MaterialesService } from './materiales/materiales.service';
import { ProveedoresController } from './proveedores/proveedores.controller';
import { ProveedoresService } from './proveedores/proveedores.service';
import { AsignacionesMaterialesController } from './asignaciones-materiales/asignaciones-materiales.controller';
import { AsignacionesMaterialesService } from './asignaciones-materiales/asignaciones-materiales.service';
import { MaterialesProveedoresController } from './materiales-proveedores/materiales-proveedores.controller';
import { MaterialesProveedoresService } from './materiales-proveedores/materiales-proveedores.service';
import { AsignacionEmpleadoTareaController } from './asignacion-empleado-tarea/asignacion-empleado-tarea.controller';
import { AsignacionEmpleadoTareaService } from './asignacion-empleado-tarea/asignacion-empleado-tarea.service';
import { AsignacionEspecialidadTareaController } from './asignacion-especialidad-tarea/asignacion-especialidad-tarea.controller';
import { AsignacionEspecialidadTareaService } from './asignacion-especialidad-tarea/asignacion-especialidad-tarea.service';
import { AsignacionEspecialidadEtapaController } from './asignacion-especialidad-etapa/asignacion-especialidad-etapa.controller';
import { AsignacionEspecialidadEtapaService } from './asignacion-especialidad-etapa/asignacion-especialidad-etapa.service';
import { DocumentosModule } from './documentos/documentos.module';

@Module({
  imports: [PrismaModule, AuditoriaModule, PermisosModule, DocumentosModule],
  controllers: [
    ProyectosController,
    EtapasController,
    TareasController,
    NotasController,
    MaterialesController,
    ProveedoresController,
    AsignacionesMaterialesController,
    MaterialesProveedoresController,
    AsignacionEmpleadoTareaController,
    AsignacionEspecialidadTareaController,
    AsignacionEspecialidadEtapaController,
  ],
  providers: [
    ProyectosService,
    EtapasService,
    TareasService,
    NotasService,
    MaterialesService,
    ProveedoresService,
    AsignacionesMaterialesService,
    MaterialesProveedoresService,
    AsignacionEmpleadoTareaService,
    AsignacionEspecialidadTareaService,
    AsignacionEspecialidadEtapaService,
  ],
  exports: [
    ProyectosService,
    EtapasService,
    TareasService,
    NotasService,
    MaterialesService,
    ProveedoresService,
    AsignacionesMaterialesService,
    MaterialesProveedoresService,
    AsignacionEmpleadoTareaService,
    AsignacionEspecialidadTareaService,
    AsignacionEspecialidadEtapaService,
  ],
})
export class ProyectosModule {}

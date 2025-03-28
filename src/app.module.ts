// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { CommonModule } from './common/common.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';
import { EmpleadosEspecialidadesModule } from './empleados-especialidades/empleados-especialidades.module';
import { GremiosModule } from './gremios/gremios.module';
import { GremioEspecialidadModule } from './gremio-especialidad/gremio-especialidad.module';
import { AsignacionEmpleadoTareaModule } from './proyectos/asignacion-empleado-tarea/asignacion-empleado-tarea.module';
import { AsignacionEspecialidadTareaModule } from './proyectos/asignacion-especialidad-tarea/asignacion-especialidad-tarea.module';
import { AsignacionEspecialidadEtapaModule } from './proyectos/asignacion-especialidad-etapa/asignacion-especialidad-etapa.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
    AuditoriaModule,
    PermisosModule,
    RolesModule,
    AuthModule,
    UsersModule,
    ProyectosModule,
    EmpleadosModule,
    EspecialidadesModule,
    EmpleadosEspecialidadesModule,
    GremiosModule,
    GremioEspecialidadModule,
    AsignacionEmpleadoTareaModule,
    AsignacionEspecialidadTareaModule,
    AsignacionEspecialidadEtapaModule,
  ],
})
export class AppModule {}
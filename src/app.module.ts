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
  ],
})
export class AppModule {}

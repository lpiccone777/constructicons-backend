// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { CommonModule } from './common/common.module';

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
  ],
})
export class AppModule {}
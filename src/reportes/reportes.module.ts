import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProyectosModule } from '../proyectos/proyectos.module';

@Module({
  imports: [PrismaModule, ProyectosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService],
})
export class ReportesModule {}

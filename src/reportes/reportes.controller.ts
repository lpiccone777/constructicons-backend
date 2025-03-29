// src/reportes/reportes.controller.ts
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportesService } from './reportes.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  DashboardEjecutivoResponse, 
  AnalisisMaterialesResponse, 
  AvanceProyectoResponse,
  RecursosHumanosResponse
} from './types';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard-ejecutivo')
  @ApiOperation({ summary: 'Obtener datos para dashboard ejecutivo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos del dashboard ejecutivo'
  })
  async getDashboardEjecutivo(): Promise<DashboardEjecutivoResponse> {
    return this.reportesService.getDashboardEjecutivo();
  }

  @Get('analisis-materiales')
  @ApiOperation({ summary: 'Obtener análisis de materiales y proveedores' })
  @ApiResponse({ 
    status: 200, 
    description: 'Análisis de materiales y proveedores'
  })
  async getAnalisisMateriales(): Promise<AnalisisMaterialesResponse> {
    return this.reportesService.getAnalisisMateriales();
  }

  @Get('avance-proyecto/:proyectoId')
  @ApiOperation({ summary: 'Obtener informe de avance de un proyecto específico' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informe de avance del proyecto'
  })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async getAvanceProyecto(@Param('proyectoId', ParseIntPipe) proyectoId: number): Promise<AvanceProyectoResponse> {
    return this.reportesService.getAvanceProyecto(proyectoId);
  }

  @Get('recursos-humanos')
  @ApiOperation({ summary: 'Obtener métricas de recursos humanos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Métricas de recursos humanos'
  })
  async getRecursosHumanos(): Promise<RecursosHumanosResponse> {
    return this.reportesService.getRecursosHumanos();
  }
}
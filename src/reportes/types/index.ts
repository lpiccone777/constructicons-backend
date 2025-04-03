// Interfaces compartidas para los reportes
export interface EstadisticasPorEstado {
  [key: string]: number;
}

// Dashboard Ejecutivo
export interface ResumenProyectos {
  total: number;
  porEstado: EstadisticasPorEstado;
  presupuestoTotal: number;
  presupuestoEjecutadoEstimado: number;
}

export interface ProyectoPrincipal {
  id: number;
  codigo: string;
  nombre: string;
  avance: number;
  estado: string;
  diasRestantes: number | null;
  presupuesto: number;
  presupuestoEjecutado: number;
  indicadorEstado: 'en-tiempo' | 'adelantado' | 'demorado';
}

export interface RecursoEspecialidad {
  especialidad: string;
  cantidadAsignada: number;
  proyectosAsignados: number;
  horasTotales: number;
}

export interface DashboardEjecutivoResponse {
  resumenProyectos: ResumenProyectos;
  proyectosPrincipales: ProyectoPrincipal[];
  recursosEspecialidades: RecursoEspecialidad[];
}

// Análisis de Materiales
export interface Proveedor {
  id: number;
  nombre: string;
  precio: number;
  tiempoEntrega: string;
}

export interface MejorOferta {
  proveedorId: number;
  precio: number;
  ahorroEstimadoTotal: number;
}

export interface EstadoCompra {
  pendiente: number;
  solicitado: number;
  comprado: number;
  entregado: number;
}

export interface MaterialCritico {
  id: number;
  codigo: string;
  nombre: string;
  cantidadTotal: number;
  unidadMedida: string;
  costoTotal: number;
  estadoCompra: EstadoCompra;
  proveedores: Proveedor[];
  mejorOferta: MejorOferta | null;
}

export interface ProveedorPrincipal {
  id: number;
  nombre: string;
  cantidadMateriales: number;
  montoTotal: number;
  tiempoEntregaPromedio: string;
}

export interface AnalisisMaterialesResponse {
  materialesCriticos: MaterialCritico[];
  proveedoresPrincipales: ProveedorPrincipal[];
  ahorroPotencialTotal: number;
  totalMateriales: number;
  totalProveedores: number;
  categorias: string[];
  distribucionPorEstado: { [estado: string]: number };
  comparativaProveedores: Array<{
    material: {
      id: number;
      codigo: string;
      nombre: string;
      categoria: string;
      precioReferencia: number;
    };
    mejorPrecio: number;
    ahorroPotencial: number;
    variacionPorcentaje: number;
    proveedorMejorPrecio: string;
  }>;
  materialesPorProveedor: Array<{
    id: number;
    nombre: string;
    materiales: Array<{
      materialId: number;
      precio: number;
    }>;
  }>;
  rankingProveedores: Array<{
    nombre: string;
    materialesOfrecidos: number;
    mejoresPreciosCantidad: number;
  }>;
}

// Avance de Proyecto
export interface InformacionProyecto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  fechaInicio: Date | null;
  fechaFinEstimada: Date | null;
  fechaFinProyectada: Date | null;
  diasAdelanto: number;
  presupuestoTotal: number;
  presupuestoEjecutado: number;
  variacionPresupuesto: number;
  avanceGeneral: number;
}

export interface MaterialAsignado {
  nombre: string;
  estado: string;
}

export interface Tarea {
  id: number;
  nombre: string;
  estado: string;
  responsables: string[];
  materialesAsignados: MaterialAsignado[];
}

export interface Etapa {
  id: number;
  nombre: string;
  orden: number;
  fechaInicio: Date | null;
  fechaFinEstimada: Date | null;
  fechaFinReal: Date | null;
  estado: string;
  avance: number;
  presupuesto: number;
  presupuestoConsumido: number;
  tareas: Tarea[];
}

export interface Riesgo {
  descripcion: string;
  impacto: string;
  estado: string;
  accionPropuesta: string;
}

export interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  fechaCarga: Date;
}

export interface AvanceProyectoResponse {
  proyecto: InformacionProyecto;
  etapas: Etapa[];
  riesgosIdentificados: Riesgo[];
  documentosClaves: Documento[];
}

// Recursos Humanos
export interface EspecialidadDemandada {
  id: number;
  nombre: string;
  cantidadEmpleados: number;
  proyectosAsignados: number;
  horasAsignadas: number;
  costoEstimado: number;
}

export interface ProyectoAsignado {
  id: number;
  nombre: string;
  horasAsignadas: number;
}

export interface AsignacionEmpleado {
  id: number;
  nombre: string;
  especialidad: string;
  cargaActual: number;
  proyectosAsignados: ProyectoAsignado[];
}

export interface RecursosHumanosResponse {
  especialidadesDemandadas: EspecialidadDemandada[];
  asignacionEmpleados: AsignacionEmpleado[];
}

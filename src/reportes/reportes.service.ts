// src/reportes/reportes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardEjecutivoResponse,
  EstadisticasPorEstado,
  AnalisisMaterialesResponse,
  EstadoCompra,
  AvanceProyectoResponse,
  RecursosHumanosResponse,
} from './types';
import { AsignacionEmpleadoTareaController } from 'src/proyectos/asignacion-empleado-tarea/asignacion-empleado-tarea.controller';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async getDashboardEjecutivo(): Promise<DashboardEjecutivoResponse> {
    // Obtener resumen de proyectos
    const proyectos = await this.prisma.proyecto.findMany({
      include: {
        etapas: {
          include: {
            tareas: true,
          },
        },
        _count: {
          select: {
            asignacionesEmpleados: true,
          },
        },
      },
    });

    // Calcular estadísticas por estado
    const porEstado: EstadisticasPorEstado = proyectos.reduce(
      (acc: EstadisticasPorEstado, proyecto) => {
        acc[proyecto.estado] = (acc[proyecto.estado] || 0) + 1;
        return acc;
      },
      {},
    );

    // Calcular presupuesto total y ejecutado estimado
    const presupuestoTotal = proyectos.reduce(
      (sum, proyecto) => sum + Number(proyecto.presupuestoTotal),
      0,
    );

    // Estimación básica de presupuesto ejecutado basado en avance de etapas
    const presupuestoEjecutadoEstimado = proyectos.reduce((sum, proyecto) => {
      const avancePromedio =
        proyecto.etapas.length > 0
          ? proyecto.etapas.reduce(
              (etapaSum, etapa) => etapaSum + etapa.avance,
              0,
            ) / proyecto.etapas.length
          : 0;
      return sum + (Number(proyecto.presupuestoTotal) * avancePromedio) / 100;
    }, 0);

    // Obtener los 5 proyectos principales (por presupuesto)
    const proyectosPrincipales = proyectos
      .sort((a, b) => Number(b.presupuestoTotal) - Number(a.presupuestoTotal))
      .slice(0, 5)
      .map((proyecto) => {
        // Calcular avance general del proyecto
        const avance =
          proyecto.etapas.length > 0
            ? Math.floor(
                proyecto.etapas.reduce((sum, etapa) => sum + etapa.avance, 0) /
                  proyecto.etapas.length,
              )
            : 0;

        // Calcular días restantes
        const hoy = new Date();
        const fechaFin = proyecto.fechaFinEstimada
          ? new Date(proyecto.fechaFinEstimada)
          : null;
        const diasRestantes = fechaFin
          ? Math.floor(
              (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;

        // Calcular presupuesto ejecutado estimado para este proyecto
        const presupuestoEjecutado =
          (Number(proyecto.presupuestoTotal) * avance) / 100;

        // Determinar indicador de estado
        let indicadorEstado: 'en-tiempo' | 'adelantado' | 'demorado' =
          'en-tiempo';
        if (proyecto.fechaFinEstimada && proyecto.fechaInicio) {
          const avanceEsperado =
            fechaFin && hoy < fechaFin
              ? (1 -
                  (fechaFin.getTime() - hoy.getTime()) /
                    (fechaFin.getTime() -
                      new Date(proyecto.fechaInicio).getTime())) *
                100
              : 100;

          indicadorEstado =
            avance >= avanceEsperado ? 'adelantado' : 'demorado';
        }

        return {
          id: proyecto.id,
          codigo: proyecto.codigo,
          nombre: proyecto.nombre,
          avance,
          estado: proyecto.estado,
          diasRestantes,
          presupuesto: Number(proyecto.presupuestoTotal),
          presupuestoEjecutado,
          indicadorEstado,
        };
      });

    // Obtener métricas de especialidades
    const especialidades = await this.prisma.especialidad.findMany({
      include: {
        etapasAsignadas: true,
        asignacionEspecialidadTarea: true,
        empleados: {
          include: {
            empleado: true,
          },
        },
      },
    });

    const recursosEspecialidades = especialidades.map((especialidad) => {
      // Contar proyectos únicos donde está asignada esta especialidad
      const proyectosIds = new Set();
      especialidad.etapasAsignadas.forEach((asignacion) => {
        proyectosIds.add(asignacion.etapaId);
      });

      // Calcular horas totales asignadas a esta especialidad
      const horasTotales = especialidad.asignacionEspecialidadTarea.reduce(
        (sum, asignacion) => sum + Number(asignacion.horasEstimadas),
        0,
      );

      return {
        especialidad: especialidad.nombre,
        cantidadAsignada: especialidad.empleados.length,
        proyectosAsignados: proyectosIds.size,
        horasTotales,
      };
    });

    return {
      resumenProyectos: {
        total: proyectos.length,
        porEstado,
        presupuestoTotal,
        presupuestoEjecutadoEstimado,
      },
      proyectosPrincipales,
      recursosEspecialidades,
    };
  }

  async getAnalisisMateriales(): Promise<AnalisisMaterialesResponse> {
    const [materiales, proveedores] = await Promise.all([
      this.prisma.material.findMany({
        include: {
          asignaciones: true,
          proveedores: { include: { proveedor: true } },
        },
      }),
      this.prisma.proveedor.findMany({
        include: {
          materiales: true,
        },
      }),
    ]);

    const categoriasSet = new Set<string>();
    const distribucionPorEstado: Record<string, number> = {};

    const materialesCriticos = materiales.map((material) => {
      categoriasSet.add(material.categoria);
      const cantidadTotal = material.asignaciones.reduce(
        (sum, a) => sum + Number(a.cantidad),
        0,
      );
      const costoTotal = cantidadTotal * Number(material.precioReferencia);

      const estadoCompra: EstadoCompra = {
        pendiente: 0,
        solicitado: 0,
        comprado: 0,
        entregado: 0,
      };
      material.asignaciones.forEach((a) => {
        if (a.estado in estadoCompra) {
          estadoCompra[a.estado as keyof EstadoCompra] += Number(a.cantidad);
          distribucionPorEstado[a.estado] =
            (distribucionPorEstado[a.estado] || 0) + Number(a.cantidad);
        }
      });

      const mejorProveedor = material.proveedores.reduce(
        (best, current) => {
          if (!best || Number(current.precio) < Number(best.precio))
            return current;
          return best;
        },
        null as (typeof material.proveedores)[0] | null,
      );

      const ahorroEstimadoTotal = mejorProveedor
        ? cantidadTotal *
          (Number(material.precioReferencia) - Number(mejorProveedor.precio))
        : 0;

      return {
        id: material.id,
        codigo: material.codigo,
        nombre: material.nombre,
        cantidadTotal,
        unidadMedida: material.unidadMedida,
        costoTotal,
        estadoCompra,
        proveedores: material.proveedores.map((p) => ({
          id: p.proveedor.id,
          nombre: p.proveedor.nombre,
          precio: Number(p.precio),
          tiempoEntrega: p.tiempoEntrega || 'No especificado',
        })),
        mejorOferta: mejorProveedor
          ? {
              proveedorId: mejorProveedor.proveedor.id,
              precio: Number(mejorProveedor.precio),
              ahorroEstimadoTotal,
            }
          : null,
      };
    });

    const ahorroPotencialTotal = materialesCriticos.reduce(
      (total, m) => total + (m.mejorOferta?.ahorroEstimadoTotal || 0),
      0,
    );

    const comparativaProveedores = materialesCriticos.map((material) => {
      const matOriginal = materiales.find((m) => m.id === material.id);
      const precioReferencia = matOriginal
        ? Number(matOriginal.precioReferencia)
        : 0;
      const variacionPorcentaje = material.mejorOferta
        ? (1 - material.mejorOferta.precio / precioReferencia) * 100
        : 0;

      return {
        material: {
          id: material.id,
          codigo: material.codigo,
          nombre: material.nombre,
          categoria: matOriginal?.categoria || 'Desconocida',
          precioReferencia,
        },
        mejorPrecio: material.mejorOferta?.precio || precioReferencia,
        ahorroPotencial: material.mejorOferta?.ahorroEstimadoTotal || 0,
        variacionPorcentaje,
        proveedorMejorPrecio:
          material.proveedores.find(
            (p) => p.id === material.mejorOferta?.proveedorId,
          )?.nombre || 'N/A',
      };
    });

    const materialesPorProveedor = proveedores.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      materiales: p.materiales.map((mp) => ({
        materialId: mp.materialId,
        precio: Number(mp.precio),
      })),
    }));

    const rankingProveedores = proveedores.map((p) => ({
      nombre: p.nombre,
      materialesOfrecidos: p.materiales.length,
      mejoresPreciosCantidad: comparativaProveedores.filter(
        (c) => c.proveedorMejorPrecio === p.nombre,
      ).length,
    }));

    return {
      materialesCriticos,
      proveedoresPrincipales: proveedores.slice(0, 5).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidadMateriales: p.materiales.length,
        montoTotal: p.materiales.reduce((acc, m) => acc + Number(m.precio), 0),
        tiempoEntregaPromedio: 'N/A',
      })),
      ahorroPotencialTotal,
      totalMateriales: materiales.length,
      totalProveedores: proveedores.length,
      categorias: Array.from(categoriasSet),
      distribucionPorEstado,
      comparativaProveedores,
      materialesPorProveedor,
      rankingProveedores,
    };
  }

  async getAvanceProyecto(proyectoId: number): Promise<AvanceProyectoResponse> {
    // Obtener proyecto con todas sus relaciones
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: {
        etapas: {
          include: {
            tareas: {
              include: {
                asignacionesEmpleados: {
                  include: {
                    empleado: true,
                  },
                },
                materialesAsignados: {
                  include: {
                    material: true,
                  },
                },
              },
            },
          },
          orderBy: { orden: 'asc' },
        },
        documentos: true,
        notas: {
          orderBy: { fechaCreacion: 'desc' },
        },
      },
    });

    // Verificar si el proyecto existe
    if (!proyecto) {
      throw new NotFoundException(
        `Proyecto con ID ${proyectoId} no encontrado`,
      );
    }

    // Calculo de fechas y avance
    const fechaInicio = proyecto.fechaInicio
      ? new Date(proyecto.fechaInicio)
      : new Date();
    const fechaFinEstimada = proyecto.fechaFinEstimada
      ? new Date(proyecto.fechaFinEstimada)
      : null;

    // Calcular avance general del proyecto
    const avanceGeneral =
      proyecto.etapas.length > 0
        ? Math.floor(
            proyecto.etapas.reduce((sum, etapa) => sum + etapa.avance, 0) /
              proyecto.etapas.length,
          )
        : 0;

    // Proyectar fecha de fin basada en el avance actual
    let fechaFinProyectada = null;
    if (fechaFinEstimada && proyecto.fechaInicio) {
      const diasTotales =
        (fechaFinEstimada.getTime() - fechaInicio.getTime()) /
        (1000 * 60 * 60 * 24);
      const diasNecesarios = diasTotales / (avanceGeneral / 100 || 0.01); // Evitar división por cero
      fechaFinProyectada = new Date(
        fechaInicio.getTime() + diasNecesarios * 1000 * 60 * 60 * 24,
      );
    }

    // Calcular días de adelanto/retraso
    const diasAdelanto =
      fechaFinEstimada && fechaFinProyectada
        ? Math.floor(
            (fechaFinEstimada.getTime() - fechaFinProyectada.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

    // Calcular presupuesto ejecutado y variación
    const presupuestoEjecutado =
      (Number(proyecto.presupuestoTotal) * avanceGeneral) / 100;

    // Para la variación, simulamos un dato que en la vida real vendría de algún sistema de control de gastos
    const variacionPresupuesto = Math.random() * 200000 - 100000; // Simulación entre -100k y +100k

    // Formatear datos de etapas
    const etapas = proyecto.etapas.map((etapa) => {
      // Calcular presupuesto consumido de la etapa (simulado)
      const presupuestoConsumido =
        ((Number(etapa.presupuesto) * etapa.avance) / 100) *
        (1 + (Math.random() * 0.2 - 0.1)); // ±10%

      return {
        id: etapa.id,
        nombre: etapa.nombre,
        orden: etapa.orden,
        fechaInicio: etapa.fechaInicio,
        fechaFinEstimada: etapa.fechaFinEstimada,
        fechaFinReal: etapa.fechaFinReal,
        estado: etapa.estado,
        avance: etapa.avance,
        presupuesto: Number(etapa.presupuesto),
        presupuestoConsumido,
        tareas: etapa.tareas.map((tarea) => {
          // Extraer responsables
          const responsables = tarea.asignacionesEmpleados.map(
            (asignacionEmpleados) => asignacionEmpleados.empleado.nombre,
          );

          // Extraer materiales
          const materialesAsignados = tarea.materialesAsignados.map(
            (asignacionMat) => ({
              nombre: asignacionMat.material.nombre,
              estado: asignacionMat.estado,
            }),
          );

          return {
            id: tarea.id,
            nombre: tarea.nombre,
            estado: tarea.estado,
            responsables,
            materialesAsignados,
          };
        }),
      };
    });

    // Generar riesgos identificados (simulado)
    const riesgosIdentificados = [
      {
        descripcion: 'Retraso en entrega de materiales estructurales',
        impacto: 'alto',
        estado: 'mitigado',
        accionPropuesta: 'Contactar proveedor alternativo',
      },
      {
        descripcion: 'Cambios en regulaciones municipales',
        impacto: 'medio',
        estado: 'pendiente',
        accionPropuesta: 'Reunión con asesor legal',
      },
      {
        descripcion: 'Escasez de mano de obra especializada',
        impacto: 'alto',
        estado: 'activo',
        accionPropuesta: 'Contratar con anticipación',
      },
    ];

    // Formatear documentos clave
    const documentosClaves = proyecto.documentos
      .sort((a, b) => b.fechaCarga.getTime() - a.fechaCarga.getTime())
      .slice(0, 5)
      .map((doc) => ({
        id: doc.id,
        nombre: doc.nombre,
        tipo: doc.tipo,
        fechaCarga: doc.fechaCarga,
      }));

    return {
      proyecto: {
        id: proyecto.id,
        codigo: proyecto.codigo,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fechaInicio: proyecto.fechaInicio,
        fechaFinEstimada: proyecto.fechaFinEstimada,
        fechaFinProyectada,
        diasAdelanto,
        presupuestoTotal: Number(proyecto.presupuestoTotal),
        presupuestoEjecutado,
        variacionPresupuesto,
        avanceGeneral,
      },
      etapas,
      riesgosIdentificados,
      documentosClaves,
    };
  }

  async getRecursosHumanos(): Promise<RecursosHumanosResponse> {
    // Obtener especialidades con empleados asignados
    const especialidades = await this.prisma.especialidad.findMany({
      include: {
        empleados: {
          include: {
            empleado: true,
          },
        },
        etapasAsignadas: {
          include: {
            etapa: {
              include: {
                proyecto: true,
              },
            },
          },
        },
      },
    });

    // Formatear especialidades demandadas
    const especialidadesDemandadas = especialidades
      .sort((a, b) => b.empleados.length - a.empleados.length)
      .map((especialidad) => {
        // Contar proyectos únicos
        const proyectosIds = new Set();
        especialidad.etapasAsignadas.forEach((asignacion) => {
          proyectosIds.add(asignacion.etapa.proyecto.id);
        });

        // Calcular horas asignadas
        const horasAsignadas = especialidad.etapasAsignadas.reduce(
          (sum, asignacion) => sum + Number(asignacion.horasEstimadas),
          0,
        );

        // Calcular costo estimado
        const costoEstimado =
          horasAsignadas * Number(especialidad.valorHoraBase);

        return {
          id: especialidad.id,
          nombre: especialidad.nombre,
          cantidadEmpleados: especialidad.empleados.length,
          proyectosAsignados: proyectosIds.size,
          horasAsignadas,
          costoEstimado,
        };
      });

    // Obtener empleados con sus asignaciones
    const empleados = await this.prisma.empleado.findMany({
      include: {
        especialidades: {
          include: {
            especialidad: true,
          },
          where: {
            fechaHasta: null, // Solo especialidades vigentes
          },
        },
        asignacionesProyecto: {
          include: {
            proyecto: true,
          },
          where: {
            activo: true,
          },
        },
        asignacionesTarea: {
          include: {
            tarea: {
              include: {
                etapa: {
                  include: {
                    proyecto: true,
                  },
                },
              },
            },
          },
          where: {
            activo: true,
          },
        },
      },
    });

    // Formatear asignación de empleados
    const asignacionEmpleados = empleados
      .filter(
        (empleado) =>
          empleado.asignacionesProyecto.length > 0 ||
          empleado.asignacionesTarea.length > 0,
      )
      .map((empleado) => {
        // Determinar especialidad principal
        const especialidadPrincipal =
          empleado.especialidades.find((esp) => esp.esPrincipal)?.especialidad
            .nombre ||
          (empleado.especialidades.length > 0
            ? empleado.especialidades[0].especialidad.nombre
            : 'Sin especialidad');

        // Calcular carga actual (porcentaje de tiempo asignado)
        const horasTotales = empleado.asignacionesTarea.reduce(
          (sum, asignacion) => sum + Number(asignacion.horasEstimadas),
          0,
        );
        const cargaActual = Math.min(
          100,
          Math.floor((horasTotales / 160) * 100),
        ); // Asumiendo 160 horas laborables al mes

        // Formatear proyectos asignados
        const proyectosAsignadosMap = new Map();

        // Añadir asignaciones directas a proyectos
        empleado.asignacionesProyecto.forEach((asignacion) => {
          const proyectoId = asignacion.proyecto.id;
          if (!proyectosAsignadosMap.has(proyectoId)) {
            proyectosAsignadosMap.set(proyectoId, {
              id: proyectoId,
              nombre: asignacion.proyecto.nombre,
              horasAsignadas: Number(asignacion.horasDiarias) * 20, // Asumiendo 20 días laborables
            });
          }
        });

        // Añadir asignaciones a través de tareas
        empleado.asignacionesTarea.forEach((asignacion) => {
          const proyectoId = asignacion.tarea.etapa.proyecto.id;
          if (proyectosAsignadosMap.has(proyectoId)) {
            proyectosAsignadosMap.get(proyectoId).horasAsignadas += Number(
              asignacion.horasEstimadas,
            );
          } else {
            proyectosAsignadosMap.set(proyectoId, {
              id: proyectoId,
              nombre: asignacion.tarea.etapa.proyecto.nombre,
              horasAsignadas: Number(asignacion.horasEstimadas),
            });
          }
        });

        return {
          id: empleado.id,
          nombre: `${empleado.nombre} ${empleado.apellido}`,
          especialidad: especialidadPrincipal,
          cargaActual,
          proyectosAsignados: Array.from(proyectosAsignadosMap.values()),
        };
      });

    return {
      especialidadesDemandadas,
      asignacionEmpleados,
    };
  }
}

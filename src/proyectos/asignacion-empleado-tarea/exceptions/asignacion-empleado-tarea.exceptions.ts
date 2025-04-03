// src/proyectos/asignacion-empleado-tarea/exceptions/asignacion-empleado-tarea.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../../common/exceptions';
import { ErrorCode } from '../../../common/constants/error-codes';

/**
 * Excepción cuando una asignación de empleado a tarea no se encuentra
 */
export class AsignacionEmpleadoTareaNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(
      `Asignación de empleado a tarea con ID ${id} no encontrada`,
      'ASIGNACION_EMPLEADO_TAREA_NOT_FOUND' as ErrorCode,
      { id },
    );
  }
}

/**
 * Excepción cuando ya existe una asignación activa de empleado a tarea
 */
export class AsignacionEmpleadoTareaConflictException extends ConflictException {
  constructor(empleadoId: number, tareaId: number) {
    super(
      `Ya existe una asignación activa entre el empleado ID ${empleadoId} y la tarea ID ${tareaId}`,
      'ASIGNACION_EMPLEADO_TAREA_ALREADY_EXISTS' as ErrorCode,
      { empleadoId, tareaId },
    );
  }
}

/**
 * Excepción cuando hay un problema con la operación sobre la asignación de empleado a tarea
 */
export class AsignacionEmpleadoTareaOperationException extends BusinessException {
  constructor(message: string, details: Record<string, any>) {
    super(
      message,
      'ASIGNACION_EMPLEADO_TAREA_OPERATION_ERROR' as ErrorCode,
      details,
    );
  }
}

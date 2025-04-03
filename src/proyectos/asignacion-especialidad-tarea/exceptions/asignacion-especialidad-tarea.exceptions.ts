// src/proyectos/asignacion-especialidad-tarea/exceptions/asignacion-especialidad-tarea.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../../common/exceptions';
import { ErrorCode } from '../../../common/constants/error-codes';

/**
 * Excepción cuando una asignación de especialidad a tarea no se encuentra
 */
export class AsignacionEspecialidadTareaNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(
      `Asignación de especialidad a tarea con ID ${id} no encontrada`,
      'ASIGNACION_ESPECIALIDAD_TAREA_NOT_FOUND' as ErrorCode,
      { id },
    );
  }
}

/**
 * Excepción cuando ya existe una asignación de especialidad a tarea
 */
export class AsignacionEspecialidadTareaConflictException extends ConflictException {
  constructor(especialidadId: number, tareaId: number) {
    super(
      `Ya existe una asignación entre la especialidad ID ${especialidadId} y la tarea ID ${tareaId}`,
      'ASIGNACION_ESPECIALIDAD_TAREA_ALREADY_EXISTS' as ErrorCode,
      { especialidadId, tareaId },
    );
  }
}

/**
 * Excepción cuando hay un problema con la operación sobre la asignación de especialidad a tarea
 */
export class AsignacionEspecialidadTareaOperationException extends BusinessException {
  constructor(message: string, details: Record<string, any>) {
    super(
      message,
      'ASIGNACION_ESPECIALIDAD_TAREA_OPERATION_ERROR' as ErrorCode,
      details,
    );
  }
}

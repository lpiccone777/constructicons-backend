// src/proyectos/exceptions/asignacion.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

export class AsignacionProyectoNotFoundException extends NotFoundException {
  constructor(asignacionId: number) {
    super(
      `Asignación de proyecto con ID ${asignacionId} no encontrada`,
      'ASSIGNMENT_PROJECT_NOT_FOUND' as ErrorCode,
      { asignacionId },
    );
  }
}

export class AsignacionProyectoConflictException extends ConflictException {
  constructor(asignacionId: number, field: string, value: any) {
    super(
      `Conflicto en asignación de proyecto: ${field} con valor '${value}' ya existe`,
      'ASSIGNMENT_PROJECT_CONFLICT' as ErrorCode,
      { asignacionId, field, value },
    );
  }
}

export class AsignacionTareaNotFoundException extends NotFoundException {
  constructor(asignacionId: number) {
    super(
      `Asignación de tarea con ID ${asignacionId} no encontrada`,
      'ASSIGNMENT_TASK_NOT_FOUND' as ErrorCode,
      { asignacionId },
    );
  }
}

export class AsignacionTareaConflictException extends ConflictException {
  constructor(asignacionId: number, field: string, value: any) {
    super(
      `Conflicto en asignación de tarea: ${field} con valor '${value}' ya existe`,
      'ASSIGNMENT_TASK_CONFLICT' as ErrorCode,
      { asignacionId, field, value },
    );
  }
}

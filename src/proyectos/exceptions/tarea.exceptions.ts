// src/proyectos/exceptions/tarea.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

export class TareaNotFoundException extends NotFoundException {
  constructor(tareaId: number) {
    super(
      `Tarea con ID ${tareaId} no encontrada`,
      'TASK_NOT_FOUND' as ErrorCode,
      { tareaId },
    );
  }
}

export class TareaConflictException extends ConflictException {
  constructor(tareaId: number, field: string, value: any) {
    super(
      `Conflicto en tarea: ${field} con valor '${value}' ya existe`,
      'TASK_CONFLICT' as ErrorCode,
      { tareaId, field, value },
    );
  }
}

export class TareaDependenciesException extends ConflictException {
  constructor(tareaId: number, dependencies: string[]) {
    super(
      `No se puede eliminar la tarea porque tiene ${dependencies.join(', ')} asociados`,
      'TASK_HAS_DEPENDENCIES' as ErrorCode,
      { tareaId, dependencies },
    );
  }
}

export class TareaInvalidStateException extends BusinessException {
  constructor(tareaId: number, currentState: string, requiredStates: string[]) {
    super(
      `La tarea está en estado '${currentState}' pero se requiere uno de estos estados: ${requiredStates.join(', ')}`,
      'TASK_INVALID_STATE' as ErrorCode,
      { tareaId, currentState, requiredStates },
    );
  }
}

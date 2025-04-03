// src/proyectos/exceptions/proyecto.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
  ForbiddenException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un proyecto no se encuentra
 */
export class ProyectoNotFoundException extends NotFoundException {
  constructor(proyectoId: number) {
    super(
      `Proyecto con ID ${proyectoId} no encontrado`,
      'PROJECT_NOT_FOUND' as ErrorCode,
      { proyectoId },
    );
  }
}

/**
 * Excepción cuando un proyecto ya existe con el mismo código
 */
export class ProyectoConflictException extends ConflictException {
  constructor(codigo: string) {
    super(
      `Ya existe un proyecto con el código ${codigo}`,
      'PROJECT_ALREADY_EXISTS' as ErrorCode,
      { codigo },
    );
  }
}

/**
 * Excepción cuando un proyecto tiene etapas u otros elementos asociados
 */
export class ProyectoDependenciesException extends ConflictException {
  constructor(proyectoId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el proyecto porque tiene ${dependencies.join(', ')} asociados`,
      'PROJECT_HAS_DEPENDENCIES' as ErrorCode,
      { proyectoId, dependencies },
    );
  }
}

/**
 * Excepción cuando un proyecto está en un estado que no permite la operación
 */
export class ProyectoInvalidStateException extends BusinessException {
  constructor(
    proyectoId: number,
    currentState: string,
    requiredStates: string[],
  ) {
    super(
      `El proyecto está en estado '${currentState}' pero se requiere uno de estos estados: ${requiredStates.join(', ')}`,
      'PROJECT_INVALID_STATE' as ErrorCode,
      { proyectoId, currentState, requiredStates },
    );
  }
}

/**
 * Excepción cuando se intenta modificar un proyecto finalizado o cancelado
 */
export class ProyectoClosedException extends ForbiddenException {
  constructor(proyectoId: number, estado: string) {
    super(
      `No se pueden realizar modificaciones en un proyecto ${estado}`,
      'PROJECT_CLOSED' as ErrorCode,
      { proyectoId, estado },
    );
  }
}

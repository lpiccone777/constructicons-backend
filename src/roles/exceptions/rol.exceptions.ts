// src/roles/exceptions/rol.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un rol no se encuentra
 */
export class RolNotFoundException extends NotFoundException {
  constructor(rolId: number) {
    super(
      `Rol con ID ${rolId} no encontrado`,
      'ROL_NOT_FOUND' as ErrorCode,
      { rolId },
    );
  }
}

/**
 * Excepción cuando un rol ya existe con el mismo nombre
 */
export class RolConflictException extends ConflictException {
  constructor(nombre: string) {
    super(
      `Ya existe un rol con el nombre ${nombre}`,
      'ROL_ALREADY_EXISTS' as ErrorCode,
      { nombre },
    );
  }
}

/**
 * Excepción cuando un rol tiene usuarios u otros elementos asociados
 */
export class RolDependenciesException extends ConflictException {
  constructor(rolId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el rol porque tiene ${dependencies.join(', ')} asociados`,
      'ROL_HAS_DEPENDENCIES' as ErrorCode,
      { rolId, dependencies },
    );
  }
}

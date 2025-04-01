// src/permisos/exceptions/permiso.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un permiso no se encuentra
 */
export class PermisoNotFoundException extends NotFoundException {
  constructor(permisoId: number) {
    super(
      `Permiso con ID ${permisoId} no encontrado`,
      'PERMISO_NOT_FOUND' as ErrorCode,
      { permisoId },
    );
  }
}

/**
 * Excepción cuando un permiso ya existe con la misma combinación modulo/acción
 */
export class PermisoConflictException extends ConflictException {
  constructor(modulo: string, accion: string) {
    super(
      `Ya existe un permiso para el módulo '${modulo}' y acción '${accion}'`,
      'PERMISO_ALREADY_EXISTS' as ErrorCode,
      { modulo, accion },
    );
  }
}

/**
 * Excepción cuando un permiso tiene roles u otros elementos asociados
 */
export class PermisoDependenciesException extends ConflictException {
  constructor(permisoId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el permiso porque tiene ${dependencies.join(', ')} asociados`,
      'PERMISO_HAS_DEPENDENCIES' as ErrorCode,
      { permisoId, dependencies },
    );
  }
}

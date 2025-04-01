// src/empleados/exceptions/empleado.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un empleado no se encuentra
 */
export class EmpleadoNotFoundException extends NotFoundException {
  constructor(empleadoId: number) {
    super(
      `Empleado con ID ${empleadoId} no encontrado`,
      'EMPLEADO_NOT_FOUND' as ErrorCode,
      { empleadoId },
    );
  }
}

/**
 * Excepción cuando un empleado ya existe con el mismo código o email
 */
export class EmpleadoConflictException extends ConflictException {
  constructor(campo: string, valor: string) {
    super(
      `Ya existe un empleado con ${campo} ${valor}`,
      'EMPLEADO_ALREADY_EXISTS' as ErrorCode,
      { campo, valor },
    );
  }
}

/**
 * Excepción cuando un empleado tiene especialidades, asignaciones u otros elementos asociados
 */
export class EmpleadoDependenciesException extends ConflictException {
  constructor(empleadoId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el empleado porque tiene ${dependencies.join(', ')} asociados`,
      'EMPLEADO_HAS_DEPENDENCIES' as ErrorCode,
      { empleadoId, dependencies },
    );
  }
}

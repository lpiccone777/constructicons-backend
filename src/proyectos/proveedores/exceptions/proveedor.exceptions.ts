// src/proyectos/proveedores/exceptions/proveedor.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../../common/exceptions';
import { ErrorCode } from '../../../common/constants/error-codes';

/**
 * Excepción cuando un proveedor no se encuentra
 */
export class ProveedorNotFoundException extends NotFoundException {
  constructor(proveedorId: number) {
    super(
      `Proveedor con ID ${proveedorId} no encontrado`,
      'PROVEEDOR_NOT_FOUND' as ErrorCode,
      { proveedorId },
    );
  }
}

/**
 * Excepción cuando un proveedor ya existe con el mismo nombre
 */
export class ProveedorConflictException extends ConflictException {
  constructor(nombre: string) {
    super(
      `Ya existe un proveedor con el nombre ${nombre}`,
      'PROVEEDOR_ALREADY_EXISTS' as ErrorCode,
      { nombre },
    );
  }
}

/**
 * Excepción cuando un proveedor tiene materiales u otros elementos asociados
 */
export class ProveedorDependenciesException extends ConflictException {
  constructor(proveedorId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el proveedor porque tiene ${dependencies.join(', ')} asociados`,
      'PROVEEDOR_HAS_DEPENDENCIES' as ErrorCode,
      { proveedorId, dependencies },
    );
  }
}

// src/gremios/exceptions/gremio.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un gremio no se encuentra
 */
export class GremioNotFoundException extends NotFoundException {
  constructor(gremioId: number) {
    super(
      `Gremio con ID ${gremioId} no encontrado`,
      'GREMIO_NOT_FOUND' as ErrorCode,
      { gremioId },
    );
  }
}

/**
 * Excepción cuando un gremio ya existe con el mismo código
 */
export class GremioConflictException extends ConflictException {
  constructor(codigo: string) {
    super(
      `Ya existe un gremio con el código ${codigo}`,
      'GREMIO_ALREADY_EXISTS' as ErrorCode,
      { codigo },
    );
  }
}

/**
 * Excepción cuando un gremio tiene especialidades u otros elementos asociados
 */
export class GremioDependenciesException extends ConflictException {
  constructor(gremioId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el gremio porque tiene ${dependencies.join(', ')} asociados`,
      'GREMIO_HAS_DEPENDENCIES' as ErrorCode,
      { gremioId, dependencies },
    );
  }
}
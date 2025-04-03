// src/gremio-especialidad/exceptions/gremio-especialidad.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando una relación gremio-especialidad no se encuentra
 */
export class GremioEspecialidadNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(
      `Relación gremio-especialidad con ID ${id} no encontrada`,
      'GREMIO_ESPECIALIDAD_NOT_FOUND' as ErrorCode,
      { id },
    );
  }
}

/**
 * Excepción cuando ya existe una relación gremio-especialidad
 */
export class GremioEspecialidadConflictException extends ConflictException {
  constructor(gremioId: number, especialidadId: number) {
    super(
      `Ya existe una relación entre el gremio ID ${gremioId} y la especialidad ID ${especialidadId}`,
      'GREMIO_ESPECIALIDAD_ALREADY_EXISTS' as ErrorCode,
      { gremioId, especialidadId },
    );
  }
}

/**
 * Excepción cuando una relación gremio-especialidad tiene dependencias
 */
export class GremioEspecialidadDependenciesException extends ConflictException {
  constructor(id: number, dependencies: string[]) {
    super(
      `No se puede eliminar la relación gremio-especialidad porque tiene ${dependencies.join(', ')} asociados`,
      'GREMIO_ESPECIALIDAD_HAS_DEPENDENCIES' as ErrorCode,
      { id, dependencies },
    );
  }
}

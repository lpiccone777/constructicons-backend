// src/especialidades/exceptions/especialidad.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando una especialidad no se encuentra
 */
export class EspecialidadNotFoundException extends NotFoundException {
  constructor(especialidadId: number) {
    super(
      `Especialidad con ID ${especialidadId} no encontrada`,
      'ESPECIALIDAD_NOT_FOUND' as ErrorCode,
      { especialidadId },
    );
  }
}

/**
 * Excepción cuando una especialidad ya existe con el mismo código
 */
export class EspecialidadConflictException extends ConflictException {
  constructor(codigo: string) {
    super(
      `Ya existe una especialidad con el código ${codigo}`,
      'ESPECIALIDAD_ALREADY_EXISTS' as ErrorCode,
      { codigo },
    );
  }
}

/**
 * Excepción cuando una especialidad tiene empleados u otros elementos asociados
 */
export class EspecialidadDependenciesException extends ConflictException {
  constructor(especialidadId: number, dependencies: any[]) {
    super(
      `No se puede eliminar la especialidad porque tiene ${dependencies[1]} ${dependencies[0]} asociados`,
      'ESPECIALIDAD_HAS_DEPENDENCIES' as ErrorCode,
      {
        especialidadId,
        dependencyType: dependencies[0],
        count: dependencies[1],
      },
    );
  }
}

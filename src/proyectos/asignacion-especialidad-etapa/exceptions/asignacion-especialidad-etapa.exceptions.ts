// src/proyectos/asignacion-especialidad-etapa/exceptions/asignacion-especialidad-etapa.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../../common/exceptions';
import { ErrorCode } from '../../../common/constants/error-codes';

/**
 * Excepción cuando una asignación de especialidad a etapa no se encuentra
 */
export class AsignacionEspecialidadEtapaNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(
      `Asignación de especialidad a etapa con ID ${id} no encontrada`,
      'ASIGNACION_ESPECIALIDAD_ETAPA_NOT_FOUND' as ErrorCode,
      { id },
    );
  }
}

/**
 * Excepción cuando ya existe una asignación de especialidad a etapa
 */
export class AsignacionEspecialidadEtapaConflictException extends ConflictException {
  constructor(especialidadId: number, etapaId: number) {
    super(
      `Ya existe una asignación entre la especialidad ID ${especialidadId} y la etapa ID ${etapaId}`,
      'ASIGNACION_ESPECIALIDAD_ETAPA_ALREADY_EXISTS' as ErrorCode,
      { especialidadId, etapaId },
    );
  }
}

/**
 * Excepción cuando hay un problema con la operación sobre la asignación de especialidad a etapa
 */
export class AsignacionEspecialidadEtapaOperationException extends BusinessException {
  constructor(message: string, details: Record<string, any>) {
    super(
      message,
      'ASIGNACION_ESPECIALIDAD_ETAPA_OPERATION_ERROR' as ErrorCode,
      details,
    );
  }
}

// src/common/exceptions/conflict.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para conflictos en reglas de negocio (duplicaciones, violaciones de reglas, etc.)
 */
export class ConflictException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'Conflicto con el estado actual de los recursos',
    errorCode: ErrorCode = 'COMMON_CONFLICT' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.CONFLICT, details);
  }

  /**
   * Crea una excepción para una entidad duplicada
   * @param entityName Nombre de la entidad (ej: 'Usuario', 'Proyecto')
   * @param field Campo que causa la duplicación
   * @param value Valor duplicado
   * @param errorCode Código de error específico (opcional)
   */
  static duplicateEntity(
    entityName: string,
    field: string,
    value: any,
    errorCode?: ErrorCode,
  ): ConflictException {
    return new ConflictException(
      `Ya existe un ${entityName.toLowerCase()} con ${field} '${value}'`,
      errorCode || ('COMMON_CONFLICT' as ErrorCode),
      { entityName, field, value },
    );
  }

  /**
   * Crea una excepción para cuando una operación no es válida debido a dependencias
   * @param entityName Nombre de la entidad
   * @param entityId ID de la entidad
   * @param reason Razón de la restricción
   * @param errorCode Código de error específico (opcional)
   */
  static dependencyConflict(
    entityName: string,
    entityId: string | number,
    reason: string,
    errorCode?: ErrorCode,
  ): ConflictException {
    return new ConflictException(
      `No se puede realizar la operación en ${entityName.toLowerCase()} con ID ${entityId}: ${reason}`,
      errorCode || ('COMMON_CONFLICT' as ErrorCode),
      { entityName, entityId, reason },
    );
  }
}

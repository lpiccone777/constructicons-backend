// src/common/exceptions/business.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para errores relacionados con reglas de negocio
 */
export class BusinessException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'Violación de regla de negocio',
    errorCode: ErrorCode = 'COMMON_BUSINESS_ERROR' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }

  /**
   * Crea una excepción para estado inválido
   * @param entityName Nombre de la entidad
   * @param currentState Estado actual
   * @param requiredState Estado requerido
   * @param errorCode Código de error específico (opcional)
   */
  static invalidState(
    entityName: string,
    currentState: string,
    requiredState: string | string[],
    errorCode?: ErrorCode,
  ): BusinessException {
    const requiredStateStr = Array.isArray(requiredState)
      ? requiredState.join(' o ')
      : requiredState;

    return new BusinessException(
      `La entidad ${entityName} está en estado '${currentState}' pero se requiere '${requiredStateStr}'`,
      errorCode || ('COMMON_BUSINESS_ERROR' as ErrorCode),
      { entityName, currentState, requiredState },
    );
  }

  /**
   * Crea una excepción para operación no permitida
   * @param operation Operación intentada
   * @param entityName Nombre de la entidad
   * @param reason Razón de la restricción
   * @param errorCode Código de error específico (opcional)
   */
  static operationNotAllowed(
    operation: string,
    entityName: string,
    reason: string,
    errorCode?: ErrorCode,
  ): BusinessException {
    return new BusinessException(
      `Operación '${operation}' no permitida en ${entityName}: ${reason}`,
      errorCode || ('COMMON_BUSINESS_ERROR' as ErrorCode),
      { operation, entityName, reason },
    );
  }
}

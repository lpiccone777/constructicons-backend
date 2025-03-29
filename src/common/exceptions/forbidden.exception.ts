// src/common/exceptions/forbidden.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para cuando un usuario no tiene permiso para realizar una acción
 */
export class ForbiddenException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'No tiene permisos para realizar esta acción',
    errorCode: ErrorCode = 'COMMON_FORBIDDEN' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.FORBIDDEN, details);
  }

  /**
   * Crea una excepción para permisos insuficientes
   * @param requiredPermission Permiso requerido
   * @param errorCode Código de error específico (opcional)
   */
  static insufficientPermission(
    requiredPermission: string,
    errorCode?: ErrorCode,
  ): ForbiddenException {
    return new ForbiddenException(
      `No tiene el permiso requerido: ${requiredPermission}`,
      errorCode || ('AUTH_INSUFFICIENT_PERMISSIONS' as ErrorCode),
      { requiredPermission },
    );
  }

  /**
   * Crea una excepción para acciones restringidas
   * @param action Acción que se intentó realizar
   * @param resource Recurso sobre el que se intentó actuar
   * @param reason Razón de la restricción
   * @param errorCode Código de error específico (opcional)
   */
  static restrictedAction(
    action: string,
    resource: string,
    reason: string,
    errorCode?: ErrorCode,
  ): ForbiddenException {
    return new ForbiddenException(
      `No puede ${action} ${resource}: ${reason}`,
      errorCode || ('COMMON_FORBIDDEN' as ErrorCode),
      { action, resource, reason },
    );
  }
}

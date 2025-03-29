// src/common/exceptions/unauthorized.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para errores de autenticación (credenciales inválidas, token expirado, etc.)
 */
export class UnauthorizedException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'No está autorizado para acceder a este recurso',
    errorCode: ErrorCode = 'COMMON_UNAUTHORIZED' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.UNAUTHORIZED, details);
  }

  /**
   * Crea una excepción para credenciales inválidas
   * @param errorCode Código de error específico (opcional)
   */
  static invalidCredentials(errorCode?: ErrorCode): UnauthorizedException {
    return new UnauthorizedException(
      'Credenciales inválidas',
      errorCode || ('USER_INVALID_CREDENTIALS' as ErrorCode),
    );
  }

  /**
   * Crea una excepción para token expirado o inválido
   * @param tokenIssue Problema con el token (expired, invalid, etc.)
   * @param errorCode Código de error específico (opcional)
   */
  static invalidToken(
    tokenIssue: string = 'inválido',
    errorCode?: ErrorCode,
  ): UnauthorizedException {
    return new UnauthorizedException(
      `Token ${tokenIssue}`,
      errorCode ||
        ((tokenIssue === 'expirado'
          ? 'AUTH_EXPIRED_TOKEN'
          : 'AUTH_INVALID_TOKEN') as ErrorCode),
      { tokenIssue },
    );
  }
}

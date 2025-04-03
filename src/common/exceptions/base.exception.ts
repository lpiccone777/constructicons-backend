// src/common/exceptions/base.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorCodes } from '../constants/error-codes';

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  errorCode: string;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

/**
 * Excepción base para todas las excepciones personalizadas de la aplicación.
 * Proporciona estructura y comportamiento común.
 */
export class BaseException extends HttpException {
  /**
   * @param message Mensaje descriptivo del error
   * @param errorCode Código de error estandarizado
   * @param status Código de estado HTTP
   * @param details Detalles adicionales del error
   */
  constructor(
    message: string,
    public readonly errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR' as ErrorCode,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: Record<string, any>,
  ) {
    // Crear respuesta estructurada
    const response: ErrorResponseBody = {
      statusCode: status,
      message,
      errorCode: ErrorCodes[errorCode] || errorCode,
      timestamp: new Date().toISOString(),
      details,
    };

    super(response, status);

    // Asegurar que el stack trace apunte a la ubicación original
    Error.captureStackTrace(this, this.constructor);
  }
}

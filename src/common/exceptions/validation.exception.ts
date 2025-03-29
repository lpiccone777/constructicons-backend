// src/common/exceptions/validation.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Modelo para representar un error de validación en un campo específico
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}

/**
 * Excepción para errores de validación de entrada
 */
export class ValidationException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errors Lista de errores de validación
   * @param errorCode Código de error específico
   */
  constructor(
    message: string = 'Error de validación en los datos de entrada',
    public readonly errors: ValidationError[] = [],
    errorCode: ErrorCode = 'COMMON_VALIDATION_ERROR' as ErrorCode,
  ) {
    super(message, errorCode, HttpStatus.BAD_REQUEST, {
      validationErrors: errors,
    });
  }

  /**
   * Crea una excepción para un campo inválido
   * @param field Nombre del campo
   * @param message Mensaje de error
   * @param value Valor inválido
   * @param errorCode Código de error específico (opcional)
   */
  static invalidField(
    field: string,
    message: string,
    value?: any,
    errorCode?: ErrorCode,
  ): ValidationException {
    const error: ValidationError = { field, message, value };
    return new ValidationException(
      `Campo inválido: ${field} - ${message}`,
      [error],
      errorCode || ('COMMON_VALIDATION_ERROR' as ErrorCode),
    );
  }

  /**
   * Crea una excepción a partir de errores de class-validator
   * @param validationErrors Errores de class-validator
   * @param errorCode Código de error específico (opcional)
   */
  static fromClassValidatorErrors(
    validationErrors: any[],
    errorCode?: ErrorCode,
  ): ValidationException {
    const errors: ValidationError[] = validationErrors.map((error) => {
      return {
        field: error.property,
        message: Object.values(error.constraints || {}).join(', '),
        value: error.value,
        constraints: error.constraints,
      };
    });

    return new ValidationException(
      'Errores de validación en múltiples campos',
      errors,
      errorCode || ('COMMON_VALIDATION_ERROR' as ErrorCode),
    );
  }
}

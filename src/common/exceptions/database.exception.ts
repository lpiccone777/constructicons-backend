// src/common/exceptions/database.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para errores relacionados con la base de datos
 */
export class DatabaseException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'Error de base de datos',
    errorCode: ErrorCode = 'COMMON_DATABASE_ERROR' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }

  /**
   * Crea una excepción para violación de llave foránea
   * @param tableName Nombre de la tabla
   * @param fieldName Campo con la restricción
   * @param details Detalles adicionales
   * @param errorCode Código de error específico (opcional)
   */
  static foreignKeyViolation(
    tableName: string,
    fieldName: string,
    details?: Record<string, any>,
    errorCode?: ErrorCode,
  ): DatabaseException {
    return new DatabaseException(
      `Violación de llave foránea en tabla ${tableName}, campo ${fieldName}`,
      errorCode || ('DB_FOREIGN_KEY_VIOLATION' as ErrorCode),
      { tableName, fieldName, ...details },
    );
  }

  /**
   * Crea una excepción para violación de restricción única
   * @param tableName Nombre de la tabla
   * @param fieldName Campo con la restricción
   * @param value Valor duplicado
   * @param errorCode Código de error específico (opcional)
   */
  static uniqueConstraintViolation(
    tableName: string,
    fieldName: string,
    value: any,
    errorCode?: ErrorCode,
  ): DatabaseException {
    return new DatabaseException(
      `Valor duplicado en tabla ${tableName}, campo ${fieldName}: ${value}`,
      errorCode || ('DB_UNIQUE_CONSTRAINT_VIOLATION' as ErrorCode),
      { tableName, fieldName, value },
    );
  }
}

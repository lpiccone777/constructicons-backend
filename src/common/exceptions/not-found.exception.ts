// src/common/exceptions/not-found.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';

/**
 * Excepción para cuando una entidad o recurso no se encuentra
 */
export class NotFoundException extends BaseException {
  /**
   * @param message Mensaje descriptivo
   * @param errorCode Código de error específico
   * @param details Detalles adicionales
   */
  constructor(
    message: string = 'El recurso solicitado no fue encontrado',
    errorCode: ErrorCode = 'COMMON_NOT_FOUND' as ErrorCode,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, HttpStatus.NOT_FOUND, details);
  }

  /**
   * Crea una excepción para una entidad específica
   * @param entityName Nombre de la entidad (ej: 'Usuario', 'Proyecto')
   * @param entityId Identificador de la entidad
   * @param errorCode Código de error específico (opcional)
   */
  static forEntity(
    entityName: string,
    entityId: string | number,
    errorCode?: ErrorCode,
  ): NotFoundException {
    return new NotFoundException(
      `${entityName} con ID ${entityId} no encontrado`,
      errorCode || ('COMMON_NOT_FOUND' as ErrorCode),
      { entityName, entityId },
    );
  }
}

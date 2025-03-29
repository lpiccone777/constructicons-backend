// src/common/services/error-message.service.ts

import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * Servicio para centralizar los mensajes de error
 * Facilita la internacionalización y mantenimiento
 */
@Injectable()
export class ErrorMessageService {
  // Mapeo de códigos de error a mensajes
  private readonly errorMessages: Record<string, string> = {
    // Mensajes generales
    COMMON_NOT_FOUND: 'El recurso solicitado no fue encontrado',
    COMMON_BAD_REQUEST: 'La solicitud contiene errores o datos incorrectos',
    COMMON_UNAUTHORIZED: 'No está autorizado para acceder a este recurso',
    COMMON_FORBIDDEN: 'No tiene permisos para realizar esta acción',
    COMMON_CONFLICT:
      'La solicitud no puede ser procesada debido a un conflicto',
    COMMON_INTERNAL_ERROR: 'Ha ocurrido un error interno en el servidor',
    COMMON_VALIDATION_ERROR: 'La solicitud contiene datos inválidos',
    COMMON_BUSINESS_ERROR:
      'No se pudo completar la operación debido a una restricción de negocio',
    COMMON_DATABASE_ERROR: 'Error al procesar la operación en la base de datos',

    // Mensajes específicos de usuarios
    USER_NOT_FOUND: 'Usuario no encontrado',
    USER_ALREADY_EXISTS: 'Ya existe un usuario con ese correo electrónico',
    USER_INVALID_CREDENTIALS: 'Credenciales inválidas',
    USER_INACTIVE: 'El usuario está inactivo',
    USER_CANNOT_DELETE_SUPER: 'No se puede eliminar al superusuario',

    // Mensajes específicos de proyectos
    PROJECT_NOT_FOUND: 'Proyecto no encontrado',
    PROJECT_ALREADY_EXISTS: 'Ya existe un proyecto con ese código',
    PROJECT_INVALID_STATE:
      'El proyecto está en un estado que no permite esta operación',
    PROJECT_HAS_DEPENDENCIES:
      'El proyecto tiene dependencias que impiden eliminarlo',

    // Mensajes para errores de base de datos
    DB_FOREIGN_KEY_VIOLATION:
      'La operación viola una restricción de integridad referencial',
    DB_UNIQUE_CONSTRAINT_VIOLATION:
      'Ya existe un registro con el mismo valor para el campo único',
    DB_CONNECTION_ERROR: 'Error de conexión con la base de datos',
    DB_QUERY_ERROR: 'Error en la consulta a la base de datos',

    // Mensajes de autenticación
    AUTH_INVALID_TOKEN: 'Token inválido o malformado',
    AUTH_EXPIRED_TOKEN: 'El token ha expirado',
    AUTH_INSUFFICIENT_PERMISSIONS:
      'No tiene los permisos necesarios para esta acción',
  };

  /**
   * Obtiene el mensaje asociado a un código de error
   * @param errorCode Código de error
   * @param defaultMessage Mensaje por defecto si no existe un mensaje para el código
   * @returns Mensaje de error
   */
  getErrorMessage(
    errorCode: ErrorCode | string,
    defaultMessage?: string,
  ): string {
    return (
      this.errorMessages[errorCode] || defaultMessage || 'Ha ocurrido un error'
    );
  }

  /**
   * Obtiene el mensaje asociado a un código de error, con variables interpoladas
   * @param errorCode Código de error
   * @param variables Variables para interpolar en el mensaje (ej: {entity: 'usuario', id: 5})
   * @param defaultMessage Mensaje por defecto si no existe un mensaje para el código
   * @returns Mensaje de error con variables interpoladas
   */
  getFormattedErrorMessage(
    errorCode: ErrorCode | string,
    variables: Record<string, any> = {},
    defaultMessage?: string,
  ): string {
    let message = this.getErrorMessage(errorCode, defaultMessage);

    // Reemplazar variables en el mensaje (formato: ${variable})
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(
        new RegExp(`\\$\\{${key}\\}`, 'g'),
        String(value),
      );
    });

    return message;
  }
}

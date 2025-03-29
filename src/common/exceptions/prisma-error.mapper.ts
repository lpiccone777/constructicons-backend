// src/common/exceptions/prisma-error.mapper.ts (corregido)

import { Prisma } from '@prisma/client';
import {
  BusinessException,
  ConflictException,
  DatabaseException,
  NotFoundException,
} from './index';
import { ErrorCode } from '../constants/error-codes';

/**
 * Clase utilitaria para mapear errores de Prisma a excepciones personalizadas
 */
export class PrismaErrorMapper {
  /**
   * Mapea un error de Prisma a una excepción personalizada
   * @param error Error original de Prisma
   * @param entity Entidad relacionada con la operación
   * @param operation Operación que se estaba realizando
   * @param context Contexto adicional del error
   */
  static map(
    error: any,
    entity: string,
    operation: string,
    context?: Record<string, any>,
  ): Error {
    // Verificar si es un error conocido de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapKnownError(error, entity, operation, context);
    }

    // Verificar si es un error de validación de Prisma
    if (error instanceof Prisma.PrismaClientValidationError) {
      return this.mapValidationError(error, entity, operation, context);
    }

    // Otros errores de Prisma
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return new DatabaseException(
        `Error interno en el cliente de base de datos: ${error.message}`,
        'DB_CONNECTION_ERROR' as ErrorCode,
        { ...context, originalError: error.message },
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return new DatabaseException(
        `Error de inicialización de base de datos: ${error.message}`,
        'DB_CONNECTION_ERROR' as ErrorCode,
        { ...context, originalError: error.message },
      );
    }

    // Si no es un error de Prisma o no podemos mapearlo específicamente,
    // pasamos el error original pero envuelto en nuestra excepción
    return new DatabaseException(
      `Error de base de datos durante ${operation} de ${entity}: ${error.message}`,
      'COMMON_DATABASE_ERROR' as ErrorCode,
      { entity, operation, ...context, originalError: error.message },
    );
  }

  /**
   * Mapea errores conocidos de Prisma (códigos específicos)
   */
  private static mapKnownError(
    error: Prisma.PrismaClientKnownRequestError,
    entity: string,
    operation: string,
    context?: Record<string, any>,
  ): Error {
    // Extraer información útil del error
    const { code, meta } = error;

    switch (code) {
      // Violación de llave única
      case 'P2002': {
        const fields = (meta?.target as string[]) || ['campo desconocido'];
        return new ConflictException(
          `Ya existe un ${entity} con el mismo valor para: ${fields.join(', ')}`,
          'DB_UNIQUE_CONSTRAINT_VIOLATION' as ErrorCode,
          { entity, fields, ...context },
        );
      }

      // Violación de llave foránea
      case 'P2003': {
        const field = (meta?.field_name as string) || 'campo desconocido';
        const tableName = (meta?.model_name as string) || 'tabla desconocida';

        return DatabaseException.foreignKeyViolation(tableName, field, {
          entity,
          operation,
          ...context,
        });
      }

      // Registro no encontrado para operación de modificación
      case 'P2001':
      case 'P2018':
      case 'P2025': {
        return new NotFoundException(
          `No se encontró el ${entity} para ${operation}`,
          `${entity.toUpperCase()}_NOT_FOUND` as ErrorCode,
          { entity, operation, ...context },
        );
      }

      // Restricciones de negocio
      case 'P2004': {
        return new BusinessException(
          `Restricción violada en ${entity} durante ${operation}`,
          'COMMON_BUSINESS_ERROR' as ErrorCode,
          { entity, operation, constraint: meta?.constraint, ...context },
        );
      }

      // Error por defecto para códigos no manejados específicamente
      default:
        return new DatabaseException(
          `Error de base de datos (${code}) durante ${operation} de ${entity}: ${error.message}`,
          'COMMON_DATABASE_ERROR' as ErrorCode,
          {
            entity,
            operation,
            prismaCode: code,
            prismaMeta: meta,
            ...context,
          },
        );
    }
  }

  /**
   * Mapea errores de validación de Prisma
   */
  private static mapValidationError(
    error: Prisma.PrismaClientValidationError,
    entity: string,
    operation: string,
    context?: Record<string, any>,
  ): Error {
    return new DatabaseException(
      `Error de validación en base de datos para ${entity} durante ${operation}: ${error.message}`,
      'DB_QUERY_ERROR' as ErrorCode,
      { entity, operation, ...context, validationError: error.message },
    );
  }
}

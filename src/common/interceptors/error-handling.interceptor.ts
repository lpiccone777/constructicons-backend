// src/common/interceptors/error-handling.interceptor.ts (corregido)

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  BaseException,
  DatabaseException,
  ValidationException,
} from '../exceptions';
import { PrismaErrorMapper } from '../exceptions/prisma-error.mapper';
import { Prisma } from '@prisma/client';

/**
 * Interceptor para manejar errores de forma centralizada
 * Captura errores técnicos y los convierte en excepciones personalizadas
 */
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Si ya es una excepción personalizada, la pasamos sin modificar
        if (error instanceof BaseException) {
          this.logger.warn(
            `Error controlado: ${error.message} [${error.errorCode}]`,
          );
          return throwError(() => error);
        }

        // Intentamos determinar algo de contexto
        const req = context.switchToHttp().getRequest();
        const entity = this.getEntityFromRequest(req);
        const operation = this.getOperationFromRequest(req);
        const userId = req.user?.id;

        // Errores de Prisma
        if (
          error instanceof Prisma.PrismaClientKnownRequestError ||
          error instanceof Prisma.PrismaClientValidationError ||
          error instanceof Prisma.PrismaClientRustPanicError ||
          error instanceof Prisma.PrismaClientInitializationError
        ) {
          const mappedError = PrismaErrorMapper.map(error, entity, operation, {
            userId,
          });
          this.logger.error(
            `Error de base de datos mapeado: ${mappedError.message}`,
            error.stack,
          );
          return throwError(() => mappedError);
        }

        // Errores de validación de class-validator (normalmente capturados por ValidationPipe)
        if (error.response?.message && Array.isArray(error.response.message)) {
          const validationError = ValidationException.fromClassValidatorErrors(
            error.response.message,
          );
          this.logger.warn(`Error de validación: ${validationError.message}`);
          return throwError(() => validationError);
        }

        // Cualquier otro error no manejado se considera interno
        this.logger.error(
          `Error no manejado: ${error.message || 'Error desconocido'}`,
          error.stack,
        );

        const databaseError = new DatabaseException(
          `Error interno del servidor: ${error.message || 'Error desconocido'}`,
          'COMMON_INTERNAL_ERROR',
          { path: req.path, method: req.method, userId },
        );

        return throwError(() => databaseError);
      }),
    );
  }

  /**
   * Intenta determinar la entidad basándose en la ruta de la petición
   */
  private getEntityFromRequest(req: any): string {
    if (!req || !req.path) return 'desconocido';

    // Intentamos extraer entidad de la ruta: /usuarios/1 => usuarios
    const pathParts = req.path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // Normalizamos a singular: usuarios => usuario
      let entity = pathParts[0];

      // Mapeamos algunos plurales específicos
      const singularMap: Record<string, string> = {
        usuarios: 'usuario',
        proyectos: 'proyecto',
        materiales: 'material',
        proveedores: 'proveedor',
        empleados: 'empleado',
        etapas: 'etapa',
        tareas: 'tarea',
        roles: 'rol',
        permisos: 'permiso',
      };

      return singularMap[entity] || entity;
    }

    return 'desconocido';
  }

  /**
   * Intenta determinar la operación basándose en el método HTTP
   */
  private getOperationFromRequest(req: any): string {
    if (!req || !req.method) return 'desconocido';

    const methodMap: Record<string, string> = {
      GET: 'consulta',
      POST: 'creación',
      PUT: 'actualización',
      PATCH: 'modificación',
      DELETE: 'eliminación',
    };

    return methodMap[req.method] || 'operación';
  }
}

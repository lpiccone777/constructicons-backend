// src/users/exceptions/user.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
  ForbiddenException,
  UnauthorizedException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando un usuario no se encuentra
 */
export class UserNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(
      `Usuario con ID ${userId} no encontrado`,
      'USER_NOT_FOUND' as ErrorCode,
      { userId },
    );
  }
}

/**
 * Excepción cuando no se encuentra un usuario por su email
 */
export class UserByEmailNotFoundException extends NotFoundException {
  constructor(email: string) {
    super(
      `Usuario con email ${email} no encontrado`,
      'USER_BY_EMAIL_NOT_FOUND' as ErrorCode,
      { email },
    );
  }
}

/**
 * Excepción cuando un usuario ya existe con el mismo email
 */
export class UserEmailConflictException extends ConflictException {
  constructor(email: string) {
    super(
      `Ya existe un usuario con el email ${email}`,
      'USER_EMAIL_ALREADY_EXISTS' as ErrorCode,
      { email },
    );
  }
}

/**
 * Excepción cuando un usuario ya existe con el mismo nombre de usuario
 */
export class UserNameConflictException extends ConflictException {
  constructor(username: string) {
    super(
      `Ya existe un usuario con el nombre de usuario ${username}`,
      'USERNAME_ALREADY_EXISTS' as ErrorCode,
      { username },
    );
  }
}

/**
 * Excepción cuando un usuario no puede ser eliminado debido a dependencias
 */
export class UserDependenciesException extends ConflictException {
  constructor(userId: number, dependencies: string[]) {
    super(
      `No se puede eliminar el usuario porque tiene ${dependencies.join(', ')} asociados`,
      'USER_HAS_DEPENDENCIES' as ErrorCode,
      { userId, dependencies },
    );
  }
}

/**
 * Excepción cuando las credenciales son inválidas
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Credenciales inválidas', 'INVALID_CREDENTIALS' as ErrorCode, {});
  }
}

/**
 * Excepción cuando el usuario no tiene permisos suficientes
 */
export class UserPermissionException extends ForbiddenException {
  constructor(userId: number, requiredPermission: string) {
    super(
      `El usuario no tiene el permiso requerido: ${requiredPermission}`,
      'USER_INSUFFICIENT_PERMISSIONS' as ErrorCode,
      { userId, requiredPermission },
    );
  }
}

/**
 * Excepción cuando hay un error en la operación sobre el usuario
 */
export class UserOperationException extends BusinessException {
  constructor(message: string, details: Record<string, any>) {
    super(message, 'USER_OPERATION_ERROR' as ErrorCode, details);
  }
}

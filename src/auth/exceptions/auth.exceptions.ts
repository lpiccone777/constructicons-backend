// src/auth/exceptions/auth.exceptions.ts

import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando las credenciales de autenticación son inválidas
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Credenciales inválidas', 'INVALID_CREDENTIALS' as ErrorCode, {});
  }
}

/**
 * Excepción cuando el token ha expirado
 */
export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('El token ha expirado', 'TOKEN_EXPIRED' as ErrorCode, {});
  }
}

/**
 * Excepción cuando el token es inválido
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super('Token inválido', 'INVALID_TOKEN' as ErrorCode, {});
  }
}

/**
 * Excepción cuando el usuario está inactivo
 */
export class InactiveUserException extends UnauthorizedException {
  constructor(email: string) {
    super('La cuenta de usuario está inactiva', 'USER_INACTIVE' as ErrorCode, {
      email,
    });
  }
}

/**
 * Excepción cuando ocurre un error durante la autenticación
 */
export class AuthenticationException extends BusinessException {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 'AUTHENTICATION_ERROR' as ErrorCode, details);
  }
}

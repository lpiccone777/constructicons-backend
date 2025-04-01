import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ErrorCode } from '../../../common/constants/error-codes';

export class ContactoProveedorException extends BaseException {
  constructor(
    message: string, 
    errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, status, details);
  }
}

export class ContactoProveedorNotFoundException extends ContactoProveedorException {
  constructor(id: number) {
    super(
      `Contacto con ID ${id} no encontrado`,
      'COMMON_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class ContactoProveedorConflictException extends ContactoProveedorException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'COMMON_CONFLICT', HttpStatus.CONFLICT, details);
  }
}

export class ContactoProveedorDependenciesException extends ContactoProveedorException {
  constructor(id: number) {
    super(
      `No se puede eliminar el contacto con ID ${id} porque tiene dependencias`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
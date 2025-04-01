import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class ContactoProveedorException extends BaseException {
  constructor(
    message: string, 
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'ContactoProveedorException', details);
  }
}

export class ContactoProveedorNotFoundException extends ContactoProveedorException {
  constructor(id: number) {
    super(
      `Contacto con ID ${id} no encontrado`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class ContactoProveedorConflictException extends ContactoProveedorException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class ContactoProveedorDependenciesException extends ContactoProveedorException {
  constructor(id: number) {
    super(
      `No se puede eliminar el contacto con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
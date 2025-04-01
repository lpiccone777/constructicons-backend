import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ErrorCode } from '../../../common/constants/error-codes';

export class TareaException extends BaseException {
  constructor(
    message: string, 
    errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, status, details);
  }
}

export class TareaNotFoundException extends TareaException {
  constructor(id: number) {
    super(
      `Tarea con ID ${id} no encontrada`,
      'COMMON_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class TareaConflictException extends TareaException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'COMMON_CONFLICT', HttpStatus.CONFLICT, details);
  }
}

export class TareaDependenciesException extends TareaException {
  constructor(id: number) {
    super(
      `No se puede eliminar la tarea con ID ${id} porque tiene dependencias`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
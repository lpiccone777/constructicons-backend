import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class EtapaException extends BaseException {
  constructor(
    message: string, 
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'EtapaException', details);
  }
}

export class EtapaNotFoundException extends EtapaException {
  constructor(id: number) {
    super(
      `Etapa con ID ${id} no encontrada`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class EtapaConflictException extends EtapaException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class EtapaDependenciesException extends EtapaException {
  constructor(id: number) {
    super(
      `No se puede eliminar la etapa con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
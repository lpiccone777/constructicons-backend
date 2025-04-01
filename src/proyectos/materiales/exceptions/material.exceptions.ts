import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class MaterialException extends BaseException {
  constructor(
    message: string, 
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'MaterialException', details);
  }
}

export class MaterialNotFoundException extends MaterialException {
  constructor(id: number) {
    super(
      `Material con ID ${id} no encontrado`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class MaterialConflictException extends MaterialException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class MaterialCodigoConflictException extends MaterialException {
  constructor(codigo: string) {
    super(
      `Ya existe un material con el código ${codigo}`,
      HttpStatus.CONFLICT,
      { codigo },
    );
  }
}

export class MaterialDependenciesException extends MaterialException {
  constructor(id: number) {
    super(
      `No se puede eliminar el material con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
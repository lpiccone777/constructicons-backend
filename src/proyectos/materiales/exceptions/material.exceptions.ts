import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ErrorCode } from '../../../common/constants/error-codes';

export class MaterialException extends BaseException {
  constructor(
    message: string,
    errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, status, details);
  }
}

export class MaterialNotFoundException extends MaterialException {
  constructor(id: number) {
    super(
      `Material con ID ${id} no encontrado`,
      'MATERIAL_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class MaterialConflictException extends MaterialException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'COMMON_CONFLICT', HttpStatus.CONFLICT, details);
  }
}

export class MaterialCodigoConflictException extends MaterialException {
  constructor(codigo: string) {
    super(
      `Ya existe un material con el código ${codigo}`,
      'MATERIAL_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
      { codigo },
    );
  }
}

export class MaterialDependenciesException extends MaterialException {
  constructor(id: number) {
    super(
      `No se puede eliminar el material con ID ${id} porque tiene dependencias`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { id },
    );
  }
}

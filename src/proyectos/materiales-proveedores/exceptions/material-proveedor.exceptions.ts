import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ErrorCode } from '../../../common/constants/error-codes';

export class MaterialProveedorException extends BaseException {
  constructor(
    message: string,
    errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, status, details);
  }
}

export class MaterialProveedorNotFoundException extends MaterialProveedorException {
  constructor(id: number) {
    super(
      `Relación material-proveedor con ID ${id} no encontrada`,
      'COMMON_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class MaterialProveedorConflictException extends MaterialProveedorException {
  constructor(materialId: number, proveedorId: number) {
    super(
      `Ya existe una relación para este material y proveedor`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { materialId, proveedorId },
    );
  }
}

export class MaterialProveedorDependenciesException extends MaterialProveedorException {
  constructor(id: number) {
    super(
      `No se puede eliminar la relación material-proveedor con ID ${id} porque tiene dependencias`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { id },
    );
  }
}

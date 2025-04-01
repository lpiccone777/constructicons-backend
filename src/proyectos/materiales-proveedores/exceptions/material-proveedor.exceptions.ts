import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class MaterialProveedorException extends BaseException {
  constructor(
    message: string, 
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'MaterialProveedorException', details);
  }
}

export class MaterialProveedorNotFoundException extends MaterialProveedorException {
  constructor(id: number) {
    super(
      `Relación material-proveedor con ID ${id} no encontrada`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class MaterialProveedorConflictException extends MaterialProveedorException {
  constructor(materialId: number, proveedorId: number) {
    super(
      `Ya existe una relación para este material y proveedor`,
      HttpStatus.CONFLICT,
      { materialId, proveedorId },
    );
  }
}

export class MaterialProveedorDependenciesException extends MaterialProveedorException {
  constructor(id: number) {
    super(
      `No se puede eliminar la relación material-proveedor con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
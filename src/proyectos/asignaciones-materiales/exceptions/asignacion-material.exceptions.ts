import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';
import { ErrorCode } from '../../../common/constants/error-codes';

export class AsignacionMaterialException extends BaseException {
  constructor(
    message: string, 
    errorCode: ErrorCode = 'COMMON_INTERNAL_ERROR',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, errorCode, status, details);
  }
}

export class AsignacionMaterialNotFoundException extends AsignacionMaterialException {
  constructor(id: number) {
    super(
      `Asignación de material con ID ${id} no encontrada`,
      'COMMON_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class AsignacionMaterialConflictException extends AsignacionMaterialException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'COMMON_CONFLICT', HttpStatus.CONFLICT, details);
  }
}

export class AsignacionMaterialProyectoEstadoException extends AsignacionMaterialException {
  constructor(estado: string) {
    super(
      `No se pueden gestionar asignaciones de materiales en un proyecto ${estado}`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { estadoProyecto: estado },
    );
  }
}

export class AsignacionMaterialDuplicadaException extends AsignacionMaterialException {
  constructor(materialId: number, tareaId: number) {
    super(
      `Ya existe una asignación para este material en esta tarea`,
      'COMMON_CONFLICT',
      HttpStatus.CONFLICT,
      { materialId, tareaId },
    );
  }
}
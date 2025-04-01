import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class AsignacionMaterialException extends BaseException {
  constructor(
    message: string, 
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'AsignacionMaterialException', details);
  }
}

export class AsignacionMaterialNotFoundException extends AsignacionMaterialException {
  constructor(id: number) {
    super(
      `Asignación de material con ID ${id} no encontrada`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class AsignacionMaterialConflictException extends AsignacionMaterialException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class AsignacionMaterialProyectoEstadoException extends AsignacionMaterialException {
  constructor(estado: string) {
    super(
      `No se pueden gestionar asignaciones de materiales en un proyecto ${estado}`,
      HttpStatus.CONFLICT,
      { estadoProyecto: estado },
    );
  }
}

export class AsignacionMaterialDuplicadaException extends AsignacionMaterialException {
  constructor(materialId: number, tareaId: number) {
    super(
      `Ya existe una asignación para este material en esta tarea`,
      HttpStatus.CONFLICT,
      { materialId, tareaId },
    );
  }
}
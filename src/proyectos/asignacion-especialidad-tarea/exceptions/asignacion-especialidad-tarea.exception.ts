import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class AsignacionEspecialidadTareaException extends BaseException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'AsignacionEspecialidadTareaException', details);
  }
}

export class AsignacionEspecialidadTareaNotFoundException extends AsignacionEspecialidadTareaException {
  constructor(id: number) {
    super(
      `Asignación de especialidad a tarea con ID ${id} no encontrada`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class AsignacionEspecialidadTareaConflictException extends AsignacionEspecialidadTareaException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class AsignacionEspecialidadTareaDependenciesException extends AsignacionEspecialidadTareaException {
  constructor(id: number) {
    super(
      `No se puede eliminar la asignación de especialidad a tarea con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
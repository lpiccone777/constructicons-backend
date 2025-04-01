import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../../../common/exceptions/base.exception';

export class AsignacionEspecialidadEtapaException extends BaseException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>,
  ) {
    super(message, statusCode, 'AsignacionEspecialidadEtapaException', details);
  }
}

export class AsignacionEspecialidadEtapaNotFoundException extends AsignacionEspecialidadEtapaException {
  constructor(id: number) {
    super(
      `Asignación de especialidad a etapa con ID ${id} no encontrada`,
      HttpStatus.NOT_FOUND,
      { id },
    );
  }
}

export class AsignacionEspecialidadEtapaConflictException extends AsignacionEspecialidadEtapaException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class AsignacionEspecialidadEtapaDependenciesException extends AsignacionEspecialidadEtapaException {
  constructor(id: number) {
    super(
      `No se puede eliminar la asignación de especialidad a etapa con ID ${id} porque tiene dependencias`,
      HttpStatus.CONFLICT,
      { id },
    );
  }
}
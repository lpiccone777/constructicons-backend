// src/empleados-especialidades/exceptions/empleado-especialidad.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * Excepción cuando una relación empleado-especialidad no se encuentra
 */
export class EmpleadoEspecialidadNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(
      `Relación empleado-especialidad con ID ${id} no encontrada`,
      'EMPLEADO_ESPECIALIDAD_NOT_FOUND' as ErrorCode,
      { id },
    );
  }
}

/**
 * Excepción cuando ya existe una relación empleado-especialidad activa
 */
export class EmpleadoEspecialidadConflictException extends ConflictException {
  constructor(empleadoId: number, especialidadId: number) {
    super(
      `Ya existe una relación activa entre el empleado ID ${empleadoId} y la especialidad ID ${especialidadId}`,
      'EMPLEADO_ESPECIALIDAD_ALREADY_EXISTS' as ErrorCode,
      { empleadoId, especialidadId },
    );
  }
}

/**
 * Excepción cuando hay un problema con la operación sobre la relación empleado-especialidad
 */
export class EmpleadoEspecialidadOperationException extends BusinessException {
  constructor(message: string, details: Record<string, any>) {
    super(
      message,
      'EMPLEADO_ESPECIALIDAD_OPERATION_ERROR' as ErrorCode,
      details,
    );
  }
}

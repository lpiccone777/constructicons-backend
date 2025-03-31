// src/proyectos/exceptions/etapa.exceptions.ts

import {
  NotFoundException,
  ConflictException,
  BusinessException,
} from '../../common/exceptions';
import { ErrorCode } from '../../common/constants/error-codes';

export class EtapaNotFoundException extends NotFoundException {
  constructor(etapaId: number) {
    super(
      `Etapa con ID ${etapaId} no encontrada`,
      'STAGE_NOT_FOUND' as ErrorCode,
      { etapaId },
    );
  }
}

export class EtapaConflictException extends ConflictException {
  constructor(etapaId: number, field: string, value: any) {
    super(
      `Conflicto en etapa: ${field} con valor '${value}' ya existe`,
      'STAGE_CONFLICT' as ErrorCode,
      { etapaId, field, value },
    );
  }
}

export class EtapaDependenciesException extends ConflictException {
  constructor(etapaId: number, dependencies: string[]) {
    super(
      `No se puede eliminar la etapa porque tiene ${dependencies.join(', ')} asociados`,
      'STAGE_HAS_DEPENDENCIES' as ErrorCode,
      { etapaId, dependencies },
    );
  }
}

export class EtapaInvalidStateException extends BusinessException {
  constructor(etapaId: number, currentState: string, requiredStates: string[]) {
    super(
      `La etapa está en estado '${currentState}' pero se requiere uno de estos estados: ${requiredStates.join(', ')}`,
      'STAGE_INVALID_STATE' as ErrorCode,
      { etapaId, currentState, requiredStates },
    );
  }
}

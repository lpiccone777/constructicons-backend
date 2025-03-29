// src/common/common.module.ts (actualizado)

import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorHandlingInterceptor } from './interceptors/error-handling.interceptor';
import { ErrorMessageService } from './services/error-message.service';

@Global()
@Module({
  providers: [
    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Interceptores globales
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorHandlingInterceptor,
    },
    // Servicios
    ErrorMessageService,
  ],
  exports: [ErrorMessageService],
})
export class CommonModule {}

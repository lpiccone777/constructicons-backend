import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      transform: true, // Transforma automáticamente los datos
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
    }),
  );

  // Filtro global de excepciones (opcional, ya aplicado a través de APP_FILTER)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor global de registro (opcional, ya aplicado a través de APP_INTERCEPTOR)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuración CORS
  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Constructicons API')
    .setDescription('API para el sistema de gestión de la empresa constructora')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();

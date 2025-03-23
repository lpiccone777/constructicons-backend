// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Si es necesario, podemos especificar la ubicación del schema aquí
    super({
      // Puedes descomentar esto si sigue habiendo problemas
      // datasources: {
      //   db: {
      //     url: process.env.DATABASE_URL,
      //   },
      // },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { PrismaModule } from './database/prisma.module.js';
import { ProductsRepository } from './repositories/products.repository.js';
import { ProductsService } from './services/products.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [AppController, ProductsController],
  providers: [AppService, ProductsService, ProductsRepository],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { OrdersController } from './controllers/orders.controller.js';
import { ProductsController } from './controllers/products.controller.js';
import { PrismaModule } from './database/prisma.module.js';
import { OrdersRepository } from './repositories/orders.repository.js';
import { ProductsRepository } from './repositories/products.repository.js';
import { OrdersService } from './services/orders.service.js';
import { ProductsService } from './services/products.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [AppController, ProductsController, OrdersController],
  providers: [
    AppService,
    ProductsService,
    ProductsRepository,
    OrdersService,
    OrdersRepository,
  ],
})
export class AppModule {}

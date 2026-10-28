import { Injectable } from '@nestjs/common';
import { InsufficientStockError } from '../common/errors/insufficient-stock.error.js';
import { NotFoundError } from '../common/errors/not-found.error.js';
import { PrismaService } from '../database/prisma.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  OrdersRepository,
  type NewOrderItem,
} from '../repositories/orders.repository.js';
import { ProductsRepository } from '../repositories/products.repository.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  create(dto: CreateOrderDto) {
    // Lock product rows in a fixed order so concurrent orders cannot deadlock
    const requested = [...dto.items].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );

    return this.prisma.$transaction(async (tx) => {
      const products = await this.productsRepository.findManyByIds(
        requested.map((item) => item.productId),
        tx,
      );
      const priceById = new Map(products.map((p) => [p.id, p.price]));

      const items: NewOrderItem[] = [];
      for (const { productId, quantity } of requested) {
        const unitPrice = priceById.get(productId);
        if (!unitPrice) throw new NotFoundError('Product', productId);

        const decremented = await this.productsRepository.decrementStock(
          productId,
          quantity,
          tx,
        );
        if (!decremented) throw new InsufficientStockError(productId);

        items.push({ productId, quantity, unitPrice });
      }

      const total = items.reduce(
        (sum, item) => sum.add(item.unitPrice.mul(item.quantity)),
        new Prisma.Decimal(0),
      );

      return this.ordersRepository.create(total, items, tx);
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundError('Order', id);
    return order;
  }
}

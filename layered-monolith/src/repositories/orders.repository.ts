import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

export type NewOrderItem = {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
};

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    total: Prisma.Decimal,
    items: NewOrderItem[],
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.order.create({
      data: { total, items: { create: items } },
      include: { items: true },
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });
  }
}

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const products = [
  { sku: 'KB-001', name: 'Mechanical Keyboard', price: '2490.00', stock: 20 },
  { sku: 'MS-001', name: 'Wireless Mouse', price: '890.00', stock: 50 },
  { sku: 'MN-001', name: '27-inch Monitor', price: '7990.00', stock: 10 },
];

try {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products`);
} finally {
  await prisma.$disconnect();
}

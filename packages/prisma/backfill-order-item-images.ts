/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.orderItem.findMany({
    where: { image: null, productId: { not: null } },
    select: { id: true, productId: true },
  });
  console.log(`Found ${items.length} order items without images`);

  const productIds = Array.from(new Set(items.map((i) => i.productId!).filter(Boolean)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
    },
  });
  const byProduct = new Map(products.map((p) => [p.id, p.images?.[0]?.url ?? null]));

  let updated = 0;
  for (const item of items) {
    const url = byProduct.get(item.productId!);
    if (!url) continue;
    await prisma.orderItem.update({ where: { id: item.id }, data: { image: url } });
    updated += 1;
  }
  console.log(`Updated ${updated} order items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
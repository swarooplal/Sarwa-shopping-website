import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __sarwaPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__sarwaPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.__sarwaPrisma = prisma;

export * from '@prisma/client';
export default prisma;

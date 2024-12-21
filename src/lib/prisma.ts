// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declare a global variable for Prisma to avoid multiple instances during development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a single Prisma Client instance or reuse an existing one during development
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development' // Log only in development for easier debugging
        ? ['query', 'info', 'warn', 'error']
        : ['error'], // Minimize logs in production for performance
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
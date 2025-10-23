import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

beforeAll(async () => {
  // Clean database before tests
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Clean database after tests
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export { prisma };

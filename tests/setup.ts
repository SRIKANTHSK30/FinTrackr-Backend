// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] || 'postgresql://username:password@localhost:5432/fintrackr_test?schema=public';
// Redis removed
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-jwt-secret-key-32-characters-long';
process.env['JWT_REFRESH_SECRET'] = process.env['JWT_REFRESH_SECRET'] || 'test-refresh-secret-key-32-characters-long';

// Mock Prisma for tests that don't need database
// const prisma = new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env['DATABASE_URL']
//     }
//   }
// });

// beforeAll(async () => {
//   // Clean database before tests
//   await prisma.transaction.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.user.deleteMany();
// });

// afterAll(async () => {
//   // Clean database after tests
//   await prisma.transaction.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.user.deleteMany();
//   await prisma.$disconnect();
// });

// export { prisma };

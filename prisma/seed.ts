import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await hashPassword('password123');
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrackr.com' },
    update: {},
    create: {
      email: 'demo@fintrackr.com',
      passwordHash: hashedPassword,
      name: 'Demo User'
    }
  });

  console.log('✅ Created user:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Salary' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Salary',
        type: 'INCOME',
        color: '#10B981'
      }
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Freelance' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Freelance',
        type: 'INCOME',
        color: '#3B82F6'
      }
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Food & Dining' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Food & Dining',
        type: 'EXPENSE',
        color: '#EF4444'
      }
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Transportation' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Transportation',
        type: 'EXPENSE',
        color: '#F59E0B'
      }
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Entertainment' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Entertainment',
        type: 'EXPENSE',
        color: '#8B5CF6'
      }
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Shopping' } },
      update: {},
      create: {
        userId: user.id,
        name: 'Shopping',
        type: 'EXPENSE',
        color: '#EC4899'
      }
    })
  ]);

  console.log('✅ Created categories:', categories.length);

  // Create sample transactions
  const transactions = [
    // Income transactions
    {
      userId: user.id,
      type: 'CREDIT' as const,
      amount: 5000.00,
      category: 'Salary',
      description: 'Monthly salary',
      date: new Date('2024-01-01')
    },
    {
      userId: user.id,
      type: 'CREDIT' as const,
      amount: 1200.00,
      category: 'Freelance',
      description: 'Web development project',
      date: new Date('2024-01-15')
    },
    // Expense transactions
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 45.50,
      category: 'Food & Dining',
      description: 'Lunch at restaurant',
      date: new Date('2024-01-02')
    },
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 12.30,
      category: 'Transportation',
      description: 'Uber ride',
      date: new Date('2024-01-03')
    },
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 89.99,
      category: 'Entertainment',
      description: 'Movie tickets',
      date: new Date('2024-01-05')
    },
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 150.00,
      category: 'Shopping',
      description: 'New clothes',
      date: new Date('2024-01-10')
    },
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 25.75,
      category: 'Food & Dining',
      description: 'Grocery shopping',
      date: new Date('2024-01-12')
    },
    {
      userId: user.id,
      type: 'DEBIT' as const,
      amount: 8.50,
      category: 'Transportation',
      description: 'Bus fare',
      date: new Date('2024-01-14')
    }
  ];

  for (const transaction of transactions) {
    await prisma.transaction.upsert({
      where: {
        id: `${user.id}-${transaction.date.toISOString()}-${transaction.amount}`
      },
      update: {},
      create: transaction
    });
  }

  console.log('✅ Created transactions:', transactions.length);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

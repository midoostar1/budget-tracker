import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seed...');

  // Example: Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      provider: 'google',
      providerId: 'google-test-123',
      firstName: 'Test',
      lastName: 'User',
    },
  });

  logger.info({ userId: testUser.id }, 'Created test user');

  // Example: Create sample transactions
  const transaction = await prisma.transaction.create({
    data: {
      userId: testUser.id,
      amount: 50.0,
      type: 'expense',
      category: 'Groceries',
      payee: 'Whole Foods',
      notes: 'Weekly shopping',
      transactionDate: new Date(),
      status: 'cleared',
    },
  });

  logger.info({ transactionId: transaction.id }, 'Created sample transaction');

  // Example: Create a scheduled transaction
  const scheduledTransaction = await prisma.scheduledTransaction.create({
    data: {
      userId: testUser.id,
      amount: 1500.0,
      type: 'expense',
      description: 'Rent payment',
      category: 'Housing',
      frequency: 'monthly',
      startDate: new Date(),
      nextDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isBill: true,
    },
  });

  logger.info(
    { scheduledTransactionId: scheduledTransaction.id },
    'Created scheduled transaction'
  );

  logger.info('✅ Database seed completed successfully');
}

main()
  .catch((e) => {
    logger.error({ error: e }, '❌ Error seeding database');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



import { Transaction, Prisma } from '@prisma/client';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';

export interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlySummaryData {
  month: number;
  year: number;
  period: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  };
  incomeByCategory: CategorySummary[];
  expensesByCategory: CategorySummary[];
  transactions: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get monthly summary with aggregations
 */
export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number,
  page: number = 1,
  limit: number = 100
): Promise<MonthlySummaryData> {
  try {
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1); // month is 1-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    logger.debug({ userId, month, year, startDate, endDate }, 'Generating monthly summary');

    // Build where clause
    const where: Prisma.TransactionWhereInput = {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Execute all queries in parallel
    const [
      totalIncome,
      totalExpense,
      transactionCount,
      incomeByCategory,
      expensesByCategory,
      transactions,
      totalTransactions,
    ] = await Promise.all([
      // Total income
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'income',
        },
        _sum: {
          amount: true,
        },
      }),

      // Total expense
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'expense',
        },
        _sum: {
          amount: true,
        },
      }),

      // Total transaction count
      prisma.transaction.count({ where }),

      // Income by category
      prisma.transaction.groupBy({
        by: ['category'],
        where: {
          ...where,
          type: 'income',
        },
        _sum: {
          amount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),

      // Expenses by category
      prisma.transaction.groupBy({
        by: ['category'],
        where: {
          ...where,
          type: 'expense',
        },
        _sum: {
          amount: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),

      // Paginated transactions
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          transactionDate: 'desc',
        },
      }),

      // Total for pagination
      prisma.transaction.count({ where }),
    ]);

    const income = totalIncome._sum.amount ? Number(totalIncome._sum.amount) : 0;
    const expense = totalExpense._sum.amount ? Number(totalExpense._sum.amount) : 0;

    // Calculate percentages for income categories
    const incomeCategorySummaries: CategorySummary[] = incomeByCategory.map((cat) => {
      const amount = cat._sum.amount ? Number(cat._sum.amount) : 0;
      return {
        category: cat.category,
        totalAmount: amount,
        transactionCount: cat._count,
        percentage: income > 0 ? (amount / income) * 100 : 0,
      };
    });

    // Calculate percentages for expense categories
    const expenseCategorySummaries: CategorySummary[] = expensesByCategory.map((cat) => {
      const amount = cat._sum.amount ? Number(cat._sum.amount) : 0;
      return {
        category: cat.category,
        totalAmount: amount,
        transactionCount: cat._count,
        percentage: expense > 0 ? (amount / expense) * 100 : 0,
      };
    });

    const totalPages = Math.ceil(totalTransactions / limit);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const result: MonthlySummaryData = {
      month,
      year,
      period: `${monthNames[month - 1]} ${year}`,
      summary: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: income - expense,
        transactionCount,
      },
      incomeByCategory: incomeCategorySummaries,
      expensesByCategory: expenseCategorySummaries,
      transactions,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        totalPages,
      },
    };

    logger.info(
      {
        userId,
        month,
        year,
        totalIncome: income,
        totalExpense: expense,
        transactionCount,
      },
      'Monthly summary generated'
    );

    return result;
  } catch (error) {
    logger.error({ error, userId, month, year }, 'Failed to generate monthly summary');
    throw new Error('Failed to generate monthly summary');
  }
}



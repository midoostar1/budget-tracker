import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import { z } from 'zod';
import { logger } from '../lib/logger';
import { MonthlySummaryQuerySchema } from '../models/reportSchema';
import { getMonthlySummary } from '../services/reportsService';
import { generateMonthlySummaryPDF } from '../lib/pdfGenerator';

/**
 * GET /api/reports/monthly-summary
 * Get monthly summary report in JSON, CSV, or PDF format
 */
export async function monthlySummary(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Validate query parameters
    const query = MonthlySummaryQuerySchema.parse(req.query);

    // Get monthly summary data
    const data = await getMonthlySummary(
      req.user.userId,
      query.month,
      query.year,
      query.page,
      query.limit
    );

    // Handle different export formats
    switch (query.format) {
      case 'json':
        res.status(200).json({
          report: data,
        });
        break;

      case 'csv':
        try {
          // Prepare CSV data - flatten transactions
          const csvData = data.transactions.map((txn) => ({
            Date: new Date(txn.transactionDate).toLocaleDateString(),
            Type: txn.type,
            Category: txn.category,
            Payee: txn.payee || '',
            Amount: txn.amount ? Number(txn.amount).toFixed(2) : '0.00',
            Status: txn.status,
            Notes: txn.notes || '',
          }));

          // Add summary rows at the beginning
          const summaryRows = [
            {
              Date: 'SUMMARY',
              Type: '',
              Category: '',
              Payee: '',
              Amount: '',
              Status: '',
              Notes: '',
            },
            {
              Date: 'Period',
              Type: data.period,
              Category: '',
              Payee: '',
              Amount: '',
              Status: '',
              Notes: '',
            },
            {
              Date: 'Total Income',
              Type: '',
              Category: '',
              Payee: '',
              Amount: data.summary.totalIncome.toFixed(2),
              Status: '',
              Notes: '',
            },
            {
              Date: 'Total Expense',
              Type: '',
              Category: '',
              Payee: '',
              Amount: data.summary.totalExpense.toFixed(2),
              Status: '',
              Notes: '',
            },
            {
              Date: 'Net Balance',
              Type: '',
              Category: '',
              Payee: '',
              Amount: data.summary.netBalance.toFixed(2),
              Status: '',
              Notes: '',
            },
            {
              Date: '',
              Type: '',
              Category: '',
              Payee: '',
              Amount: '',
              Status: '',
              Notes: '',
            },
            {
              Date: 'TRANSACTIONS',
              Type: '',
              Category: '',
              Payee: '',
              Amount: '',
              Status: '',
              Notes: '',
            },
          ];

          const allRows = [...summaryRows, ...csvData];

          const parser = new Parser({
            fields: ['Date', 'Type', 'Category', 'Payee', 'Amount', 'Status', 'Notes'],
          });

          const csv = parser.parse(allRows);

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="budget-summary-${data.year}-${String(data.month).padStart(2, '0')}.csv"`
          );
          res.status(200).send(csv);

          logger.info({ userId: req.user.userId, month: query.month, year: query.year }, 'CSV report generated');
        } catch (error) {
          logger.error({ error }, 'Failed to generate CSV');
          res.status(500).json({
            error: 'Export Error',
            message: 'Failed to generate CSV export',
          });
        }
        break;

      case 'pdf':
        try {
          const pdfDoc = generateMonthlySummaryPDF(data);

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="budget-summary-${data.year}-${String(data.month).padStart(2, '0')}.pdf"`
          );

          // Pipe PDF to response
          pdfDoc.pipe(res);
          pdfDoc.end();

          logger.info({ userId: req.user.userId, month: query.month, year: query.year }, 'PDF report generated');
        } catch (error) {
          logger.error({ error }, 'Failed to generate PDF');
          
          // PDF already started streaming, can't send JSON error
          // Just end the response
          if (!res.headersSent) {
            res.status(500).json({
              error: 'Export Error',
              message: 'Failed to generate PDF export',
            });
          }
        }
        break;

      default:
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid export format',
        });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.issues,
      });
      return;
    }

    logger.error({ error }, 'Monthly summary error');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate monthly summary',
    });
  }
}



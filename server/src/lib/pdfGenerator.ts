import PDFDocument from 'pdfkit';
import { MonthlySummaryData, CategorySummary } from '../services/reportsService';

/**
 * Generate PDF report from monthly summary data
 */
export function generateMonthlySummaryPDF(data: MonthlySummaryData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Budget Summary - ${data.period}`,
      Author: 'Budget Tracker',
      Subject: 'Monthly Financial Report',
    },
  });

  // Header
  doc.fontSize(24).text('Budget Tracker', { align: 'center' });
  doc.fontSize(16).text('Monthly Summary Report', { align: 'center' });
  doc.fontSize(12).text(data.period, { align: 'center' });
  doc.moveDown(2);

  // Summary Section
  doc.fontSize(16).text('Summary', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12);
  doc.text(`Total Income: $${data.summary.totalIncome.toFixed(2)}`, { continued: false });
  doc.text(`Total Expense: $${data.summary.totalExpense.toFixed(2)}`, { continued: false });
  doc
    .font('Helvetica-Bold')
    .text(`Net Balance: $${data.summary.netBalance.toFixed(2)}`, { continued: false });
  doc.font('Helvetica');
  doc.text(`Total Transactions: ${data.summary.transactionCount}`, { continued: false });
  doc.moveDown(2);

  // Expenses by Category
  if (data.expensesByCategory.length > 0) {
    doc.fontSize(16).text('Expenses by Category', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const categoryX = 50;
    const amountX = 300;
    const percentX = 400;
    const countX = 480;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Category', categoryX, tableTop);
    doc.text('Amount', amountX, tableTop);
    doc.text('Percent', percentX, tableTop);
    doc.text('Count', countX, tableTop);
    doc.font('Helvetica');

    // Draw line under header
    doc
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke();

    doc.moveDown(0.3);

    // Table rows
    data.expensesByCategory.forEach((cat: CategorySummary) => {
      const y = doc.y;
      doc.fontSize(10);
      doc.text(cat.category, categoryX, y, { width: 240 });
      doc.text(`$${cat.totalAmount.toFixed(2)}`, amountX, y);
      doc.text(`${cat.percentage.toFixed(1)}%`, percentX, y);
      doc.text(cat.transactionCount.toString(), countX, y);
      doc.moveDown(0.5);

      // Add new page if needed
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.moveDown(1);
  }

  // Income by Category
  if (data.incomeByCategory.length > 0) {
    // Check if we need a new page
    if (doc.y > 600) {
      doc.addPage();
    }

    doc.fontSize(16).text('Income by Category', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const categoryX = 50;
    const amountX = 300;
    const percentX = 400;
    const countX = 480;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Category', categoryX, tableTop);
    doc.text('Amount', amountX, tableTop);
    doc.text('Percent', percentX, tableTop);
    doc.text('Count', countX, tableTop);
    doc.font('Helvetica');

    // Draw line under header
    doc
      .moveTo(50, doc.y + 5)
      .lineTo(550, doc.y + 5)
      .stroke();

    doc.moveDown(0.3);

    // Table rows
    data.incomeByCategory.forEach((cat: CategorySummary) => {
      const y = doc.y;
      doc.fontSize(10);
      doc.text(cat.category, categoryX, y, { width: 240 });
      doc.text(`$${cat.totalAmount.toFixed(2)}`, amountX, y);
      doc.text(`${cat.percentage.toFixed(1)}%`, percentX, y);
      doc.text(cat.transactionCount.toString(), countX, y);
      doc.moveDown(0.5);

      // Add new page if needed
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.moveDown(1);
  }

  // Transactions Section (if space available or new page)
  if (data.transactions.length > 0) {
    if (doc.y > 650) {
      doc.addPage();
    }

    doc.fontSize(16).text('Recent Transactions', { underline: true });
    doc.moveDown(0.5);

    const maxTransactionsInPDF = 20; // Limit to keep PDF size reasonable
    const displayTransactions = data.transactions.slice(0, maxTransactionsInPDF);

    displayTransactions.forEach((txn) => {
      const y = doc.y;
      const dateStr = new Date(txn.transactionDate).toLocaleDateString();
      const typeSymbol = txn.type === 'income' ? '+' : '-';
      const amount = txn.amount ? Number(txn.amount).toFixed(2) : '0.00';

      doc.fontSize(9);
      doc.text(dateStr, 50, y, { width: 80 });
      doc.text(txn.category, 140, y, { width: 100 });
      doc.text(txn.payee || '-', 250, y, { width: 150 });
      doc.text(`${typeSymbol}$${amount}`, 410, y, { width: 100, align: 'right' });

      doc.moveDown(0.4);

      // Add new page if needed
      if (doc.y > 720) {
        doc.addPage();
      }
    });

    if (data.transactions.length > maxTransactionsInPDF) {
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .fillColor('gray')
        .text(
          `... and ${data.transactions.length - maxTransactionsInPDF} more transactions`,
          { align: 'center' }
        );
      doc.fillColor('black');
    }
  }

  // Footer
  doc.fontSize(8).fillColor('gray');
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.text(
      `Page ${i + 1} of ${pages.count} - Generated on ${new Date().toLocaleDateString()}`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );
  }
  doc.fillColor('black');

  return doc;
}



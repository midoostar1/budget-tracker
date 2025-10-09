# Reports API Documentation

## Overview

Generate monthly financial reports with SQL aggregations and export in multiple formats (JSON, CSV, PDF). Includes income/expense totals, category breakdowns, and transaction listings with pagination.

## Features

✅ **SQL Aggregations** - Efficient database-level calculations  
✅ **Category Breakdowns** - Income and expenses by category  
✅ **Multiple Formats** - JSON, CSV, PDF exports  
✅ **Pagination** - Handle large transaction sets  
✅ **Percentages** - Category spending as percentage of total  
✅ **Authentication** - Secure user-specific reports  

---

## API Endpoint

### GET `/api/reports/monthly-summary`

Generate a monthly summary report with optional export formats.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | string | Yes | Month in MM format (01-12) |
| `year` | string | Yes | Year in YYYY format (2000-2100) |
| `format` | string | No | Export format: `json`, `csv`, or `pdf` (default: `json`) |
| `page` | number | No | Page number for transactions (default: 1) |
| `limit` | number | No | Transactions per page (1-1000, default: 100) |

**Example Requests:**

```bash
# JSON format (default)
GET /api/reports/monthly-summary?month=10&year=2024

# CSV export
GET /api/reports/monthly-summary?month=10&year=2024&format=csv

# PDF export
GET /api/reports/monthly-summary?month=10&year=2024&format=pdf

# JSON with pagination
GET /api/reports/monthly-summary?month=10&year=2024&format=json&page=1&limit=50
```

---

## Response Formats

### JSON Format

**Success Response (200):**
```json
{
  "report": {
    "month": 10,
    "year": 2024,
    "period": "October 2024",
    "summary": {
      "totalIncome": 5000.00,
      "totalExpense": 3250.50,
      "netBalance": 1749.50,
      "transactionCount": 42
    },
    "incomeByCategory": [
      {
        "category": "Salary",
        "totalAmount": 4500.00,
        "transactionCount": 1,
        "percentage": 90.0
      },
      {
        "category": "Freelance",
        "totalAmount": 500.00,
        "transactionCount": 2,
        "percentage": 10.0
      }
    ],
    "expensesByCategory": [
      {
        "category": "Groceries",
        "totalAmount": 850.00,
        "transactionCount": 12,
        "percentage": 26.15
      },
      {
        "category": "Rent",
        "totalAmount": 1500.00,
        "transactionCount": 1,
        "percentage": 46.15
      },
      {
        "category": "Utilities",
        "totalAmount": 250.00,
        "transactionCount": 3,
        "percentage": 7.69
      }
    ],
    "transactions": [
      {
        "id": "uuid",
        "amount": "1500.00",
        "type": "expense",
        "category": "Rent",
        "payee": "Landlord",
        "transactionDate": "2024-10-01T00:00:00.000Z",
        "status": "cleared"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 42,
      "totalPages": 1
    }
  }
}
```

---

### CSV Format

**Content-Type**: `text/csv`  
**Filename**: `budget-summary-2024-10.csv`

**Structure:**
```csv
Date,Type,Category,Payee,Amount,Status,Notes
SUMMARY,,,,,,
Period,October 2024,,,,,
Total Income,,,,5000.00,,
Total Expense,,,,3250.50,,
Net Balance,,,,1749.50,,
,,,,,,
TRANSACTIONS,,,,,,
10/01/2024,expense,Rent,Landlord,1500.00,cleared,
10/05/2024,expense,Groceries,Whole Foods,85.50,cleared,Weekly shopping
10/10/2024,income,Salary,Employer,4500.00,cleared,
...
```

**Features:**
- Summary header with totals
- All transactions included
- Easy import to Excel/Google Sheets
- Preserves all transaction details

---

### PDF Format

**Content-Type**: `application/pdf`  
**Filename**: `budget-summary-2024-10.pdf`

**Contents:**

**Page 1:**
- Header: "Budget Tracker - Monthly Summary Report"
- Period: "October 2024"
- Summary section:
  - Total Income
  - Total Expense
  - Net Balance (bold)
  - Total Transactions
- Expenses by Category table:
  - Category | Amount | Percent | Count
  - Sorted by amount (descending)

**Page 2** (if needed):
- Income by Category table
- Recent Transactions list (up to 20)
- Footer: Page numbers and generation date

**Features:**
- Professional formatting
- Tables with headers
- Automatic pagination
- Print-ready format

---

## SQL Aggregations

### Queries Used

**Total Income:**
```sql
SELECT SUM(amount) FROM transactions
WHERE userId = ? AND type = 'income'
AND transactionDate >= ? AND transactionDate <= ?
```

**Total Expense:**
```sql
SELECT SUM(amount) FROM transactions
WHERE userId = ? AND type = 'expense'
AND transactionDate >= ? AND transactionDate <= ?
```

**Expenses by Category:**
```sql
SELECT category, SUM(amount) as total, COUNT(*) as count
FROM transactions
WHERE userId = ? AND type = 'expense'
AND transactionDate >= ? AND transactionDate <= ?
GROUP BY category
ORDER BY total DESC
```

**Income by Category:**
```sql
SELECT category, SUM(amount) as total, COUNT(*) as count
FROM transactions
WHERE userId = ? AND type = 'income'
AND transactionDate >= ? AND transactionDate <= ?
GROUP BY category
ORDER BY total DESC
```

### Performance

- **Execution Time**: 100-500ms (typical)
- **Optimization**: Parallel query execution
- **Indexes Used**: (userId, transactionDate)
- **Scalability**: Handles thousands of transactions efficiently

---

## Usage Examples

### cURL Examples

**JSON Report:**
```bash
curl "http://localhost:3000/api/reports/monthly-summary?month=10&year=2024" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Download CSV:**
```bash
curl "http://localhost:3000/api/reports/monthly-summary?month=10&year=2024&format=csv" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o budget-october-2024.csv
```

**Download PDF:**
```bash
curl "http://localhost:3000/api/reports/monthly-summary?month=10&year=2024&format=pdf" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o budget-october-2024.pdf
```

---

### JavaScript/TypeScript Client

```typescript
// Get JSON report
const getMonthlyReport = async (month: number, year: number) => {
  const response = await fetch(
    `/api/reports/monthly-summary?month=${month}&year=${year}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  return response.json();
};

// Download CSV
const downloadCSV = async (month: number, year: number) => {
  const response = await fetch(
    `/api/reports/monthly-summary?month=${month}&year=${year}&format=csv`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-${year}-${String(month).padStart(2, '0')}.csv`;
  a.click();
};

// Download PDF
const downloadPDF = async (month: number, year: number) => {
  const response = await fetch(
    `/api/reports/monthly-summary?month=${month}&year=${year}&format=pdf`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-${year}-${String(month).padStart(2, '0')}.pdf`;
  a.click();
};
```

---

### React Component Example

```tsx
import React, { useState } from 'react';

const MonthlyReport: React.FC = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/monthly-summary?month=${month}&year=${year}&format=${format}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (format === 'json') {
        const data = await response.json();
        console.log(data.report);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-${year}-${String(month).padStart(2, '0')}.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>

      <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
        {Array.from({ length: 5 }, (_, i) => (
          <option key={i} value={2024 - i}>
            {2024 - i}
          </option>
        ))}
      </select>

      <button onClick={() => handleExport('json')} disabled={loading}>
        View Report
      </button>
      <button onClick={() => handleExport('csv')} disabled={loading}>
        Download CSV
      </button>
      <button onClick={() => handleExport('pdf')} disabled={loading}>
        Download PDF
      </button>
    </div>
  );
};
```

---

## Error Handling

**400 Bad Request** - Invalid parameters
```json
{
  "error": "Validation Error",
  "message": "Invalid query parameters",
  "details": [
    {
      "path": ["month"],
      "message": "Month must be MM format (01-12)"
    }
  ]
}
```

**401 Unauthorized** - Missing authentication
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**500 Internal Server Error** - Generation failed
```json
{
  "error": "Internal Server Error",
  "message": "Failed to generate monthly summary"
}
```

---

## Future Enhancements

- [ ] Year-to-date reports
- [ ] Custom date range reports
- [ ] Comparison reports (month over month)
- [ ] Category trend analysis
- [ ] Excel (.xlsx) export
- [ ] Email delivery of reports
- [ ] Scheduled report generation
- [ ] Report templates
- [ ] Charts and graphs in PDF
- [ ] Multi-currency support in reports

---

**Last Updated**: 2024-10-09  
**Supported Formats**: JSON, CSV, PDF



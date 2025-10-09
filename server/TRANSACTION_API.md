# Transaction API Documentation

## Overview

Complete REST API for managing financial transactions with pagination, filtering, and Zod validation.

## API Endpoints

Base path: `/api/transactions`

All endpoints require authentication (Bearer token in Authorization header).

---

## Endpoints

### 1. Create Transaction

**POST** `/api/transactions`

Create a new manual transaction with cleared status.

**Request Body:**
```json
{
  "amount": 50.00,
  "type": "expense",
  "category": "Groceries",
  "payee": "Whole Foods",
  "notes": "Weekly shopping",
  "transactionDate": "2024-10-09T00:00:00.000Z",
  "status": "cleared"
}
```

**Validation Rules:**
- `amount`: Required, positive number, max 9,999,999,999.99
- `type`: Required, enum: `"income"` or `"expense"`
- `category`: Required, string, 1-100 characters
- `payee`: Optional, string, max 200 characters
- `notes`: Optional, string, max 5000 characters
- `transactionDate`: Required, valid date
- `status`: Optional, enum: `"cleared"` or `"pending_receipt"`, defaults to `"cleared"`

**Success Response (201):**
```json
{
  "transaction": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "50.00",
    "type": "expense",
    "category": "Groceries",
    "payee": "Whole Foods",
    "notes": "Weekly shopping",
    "transactionDate": "2024-10-09T00:00:00.000Z",
    "status": "cleared",
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z"
  },
  "message": "Transaction created successfully"
}
```

---

### 2. Get Transactions (Paginated & Filtered)

**GET** `/api/transactions`

Get paginated list of transactions with optional filters.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 20 | Items per page (1-100) |
| `status` | string | - | Filter by status: `cleared` or `pending_receipt` |
| `type` | string | - | Filter by type: `income` or `expense` |
| `category` | string | - | Filter by category |
| `startDate` | date | - | Filter by date range (from) |
| `endDate` | date | - | Filter by date range (to) |
| `minAmount` | number | - | Filter by minimum amount |
| `maxAmount` | number | - | Filter by maximum amount |
| `sortBy` | string | transactionDate | Sort field: `transactionDate`, `amount`, `createdAt`, `category` |
| `sortOrder` | string | desc | Sort order: `asc` or `desc` |

**Example Request:**
```
GET /api/transactions?page=1&limit=20&type=expense&startDate=2024-10-01&endDate=2024-10-31&sortBy=transactionDate&sortOrder=desc
```

**Success Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": "50.00",
      "type": "expense",
      "category": "Groceries",
      "payee": "Whole Foods",
      "notes": "Weekly shopping",
      "transactionDate": "2024-10-09T00:00:00.000Z",
      "status": "cleared",
      "createdAt": "2024-10-09T10:30:00.000Z",
      "updatedAt": "2024-10-09T10:30:00.000Z",
      "receipt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Get Single Transaction

**GET** `/api/transactions/:id`

Get a single transaction by ID.

**URL Parameters:**
- `id`: Transaction UUID

**Success Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "50.00",
    "type": "expense",
    "category": "Groceries",
    "payee": "Whole Foods",
    "notes": "Weekly shopping",
    "transactionDate": "2024-10-09T00:00:00.000Z",
    "status": "cleared",
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z",
    "receipt": {
      "id": "uuid",
      "imageUrl": "https://...",
      "ocrStatus": "processed",
      "ocrData": {...}
    }
  }
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "Transaction not found"
}
```

---

### 4. Update Transaction

**PUT** `/api/transactions/:id`

Update an existing transaction. All fields are optional.

**URL Parameters:**
- `id`: Transaction UUID

**Request Body:**
```json
{
  "amount": 55.00,
  "type": "expense",
  "category": "Food & Dining",
  "payee": "Trader Joe's",
  "notes": "Updated shopping trip",
  "transactionDate": "2024-10-09T00:00:00.000Z",
  "status": "cleared"
}
```

**Success Response (200):**
```json
{
  "transaction": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "55.00",
    "type": "expense",
    "category": "Food & Dining",
    "payee": "Trader Joe's",
    "notes": "Updated shopping trip",
    "transactionDate": "2024-10-09T00:00:00.000Z",
    "status": "cleared",
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T11:00:00.000Z"
  },
  "message": "Transaction updated successfully"
}
```

---

### 5. Delete Transaction

**DELETE** `/api/transactions/:id`

Delete a transaction permanently.

**URL Parameters:**
- `id`: Transaction UUID

**Success Response (200):**
```json
{
  "message": "Transaction deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "Transaction not found or access denied"
}
```

---

### 6. Get Transaction Statistics

**GET** `/api/transactions/stats`

Get income, expense, and balance statistics.

**Query Parameters:**
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Example Request:**
```
GET /api/transactions/stats?startDate=2024-10-01&endDate=2024-10-31
```

**Success Response (200):**
```json
{
  "stats": {
    "totalIncome": 5000.00,
    "totalExpense": 3250.50,
    "netBalance": 1749.50,
    "transactionCount": 42
  }
}
```

---

## Database Indexes

The following composite indexes are created for optimal query performance:

```prisma
@@index([userId, transactionDate])
@@index([userId, status])
```

These indexes optimize:
- User-specific queries
- Date range filtering
- Status filtering
- Pagination

---

## Usage Examples

### cURL Examples

**Create Transaction:**
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "type": "expense",
    "category": "Groceries",
    "payee": "Whole Foods",
    "transactionDate": "2024-10-09"
  }'
```

**Get Transactions (Filtered):**
```bash
curl "http://localhost:3000/api/transactions?page=1&limit=10&type=expense&startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Transaction:**
```bash
curl -X PUT http://localhost:3000/api/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55.00,
    "notes": "Updated amount"
  }'
```

**Delete Transaction:**
```bash
curl -X DELETE http://localhost:3000/api/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Statistics:**
```bash
curl "http://localhost:3000/api/transactions/stats?startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### JavaScript/TypeScript Client Examples

```typescript
// Create transaction
const createTransaction = async (data) => {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Get paginated transactions
const getTransactions = async (params) => {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/transactions?${query}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

// Update transaction
const updateTransaction = async (id, data) => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Delete transaction
const deleteTransaction = async (id) => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

// Get statistics
const getStats = async (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`/api/transactions/stats?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return response.json();
};
```

---

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request** - Validation errors
```json
{
  "error": "Validation Error",
  "message": "Invalid transaction data",
  "details": [
    {
      "code": "too_small",
      "path": ["amount"],
      "message": "Amount must be positive"
    }
  ]
}
```

**401 Unauthorized** - Missing or invalid authentication
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found** - Transaction not found
```json
{
  "error": "Not Found",
  "message": "Transaction not found"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to create transaction"
}
```

---

## Implementation Details

### File Structure

```
server/src/
├── models/
│   └── transactionSchema.ts       # Zod validation schemas
├── services/
│   └── transactionService.ts      # Business logic & database operations
├── controllers/
│   └── transactionController.ts   # Request handlers
└── routes/
    └── transactionRoutes.ts       # Route definitions
```

### Validation Schemas

All request validation is handled by Zod schemas defined in `transactionSchema.ts`:

- **CreateTransactionSchema** - Validates transaction creation
- **UpdateTransactionSchema** - Validates partial updates
- **TransactionQuerySchema** - Validates query parameters
- **TransactionIdSchema** - Validates UUID parameters

### Service Layer

The service layer (`transactionService.ts`) provides:

- `createTransaction()` - Create new transaction
- `getTransactions()` - Paginated retrieval with filters
- `getTransactionById()` - Single transaction lookup
- `updateTransaction()` - Update existing transaction
- `deleteTransaction()` - Delete transaction
- `getTransactionStats()` - Aggregate statistics

### Security

- All routes require JWT authentication
- User can only access their own transactions
- All database queries filtered by `userId`
- SQL injection protection via Prisma
- Input validation via Zod

---

## Performance Considerations

### Indexing Strategy

Composite indexes on `(userId, transactionDate)` and `(userId, status)` provide optimal performance for:

- User-specific queries (most common)
- Date range filtering
- Status filtering
- Combined filters

### Pagination

- Default page size: 20
- Maximum page size: 100
- Uses offset-based pagination (skip/take)
- Returns pagination metadata

### Query Optimization

- Parallel queries for data + count
- Selective field inclusion for receipts
- Efficient date range queries

---

## Testing

Example test cases to implement:

```typescript
describe('Transaction API', () => {
  it('should create a transaction', async () => {
    const response = await createTransaction({
      amount: 50.00,
      type: 'expense',
      category: 'Groceries',
      transactionDate: new Date(),
    });
    expect(response.transaction.id).toBeDefined();
  });

  it('should validate amount is positive', async () => {
    const response = await createTransaction({
      amount: -50.00,
      type: 'expense',
      category: 'Groceries',
      transactionDate: new Date(),
    });
    expect(response.status).toBe(400);
  });

  it('should paginate results', async () => {
    const response = await getTransactions({ page: 1, limit: 10 });
    expect(response.pagination.page).toBe(1);
    expect(response.transactions.length).toBeLessThanOrEqual(10);
  });

  it('should filter by date range', async () => {
    const response = await getTransactions({
      startDate: '2024-10-01',
      endDate: '2024-10-31',
    });
    response.transactions.forEach(t => {
      expect(new Date(t.transactionDate)).toBeGreaterThanOrEqual(new Date('2024-10-01'));
      expect(new Date(t.transactionDate)).toBeLessThanOrEqual(new Date('2024-10-31'));
    });
  });
});
```

---

## Future Enhancements

- [ ] Bulk operations (create/update/delete multiple)
- [ ] Export to CSV/Excel
- [ ] Transaction categories management
- [ ] Recurring transactions from scheduled
- [ ] Transaction search (full-text)
- [ ] Soft delete with restore
- [ ] Transaction tags/labels
- [ ] Attachments beyond receipts

---

**Last Updated**: 2024-10-09



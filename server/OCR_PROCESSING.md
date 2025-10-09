# OCR Processing Documentation

## Overview

Automated receipt processing using Veryfi's OCR API to extract transaction data from receipt images. The system supports single receipt processing, batch processing, and retry mechanisms for failed receipts.

## Architecture

### Components

1. **Veryfi SDK** - Third-party OCR service
2. **OCR Service** (`src/services/ocrService.ts`) - Processing logic
3. **OCR Worker** (`src/workers/ocrWorker.ts`) - Scheduled batch processing
4. **Receipt Controller** - API endpoints

### Processing Flow

```
1. Receipt uploaded → Transaction created (status: pending_receipt, amount: null)
2. Manual trigger OR scheduled batch processing
3. Load receipt → Generate signed URL → Download image
4. Send to Veryfi API → Extract data
5. Update Receipt (ocrStatus: processed, ocrData: {json})
6. Update Transaction (amount, payee, date) - status remains pending_receipt
7. User reviews and confirms → Update status to cleared
```

---

## API Endpoints

### 1. Process Single Receipt

**POST** `/api/receipts/process/:receiptId`

Process a single receipt with OCR.

**URL Parameters:**
- `receiptId`: Receipt UUID

**Success Response (200):**
```json
{
  "message": "Receipt processed successfully",
  "result": {
    "total": 50.00,
    "vendor": "Whole Foods",
    "date": "2024-10-09"
  }
}
```

**Error Response (502):**
```json
{
  "error": "OCR Processing Failed",
  "message": "Failed to process receipt with OCR"
}
```

**Notes:**
- Automatically updates transaction with extracted data
- Sets receipt ocrStatus to 'processed' or 'failed'
- Transaction status remains 'pending_receipt' for user review

---

### 2. Batch Process Pending Receipts

**POST** `/api/receipts/process/batch`

Process all pending receipts in batch (for cron/scheduled use).

**Query Parameters:**
- `limit` (optional): Maximum number of receipts to process (default: 10)

**Success Response (200):**
```json
{
  "message": "Batch processing completed",
  "processed": 8,
  "failed": 2,
  "results": [
    {
      "receiptId": "uuid-1",
      "success": true
    },
    {
      "receiptId": "uuid-2",
      "success": false,
      "error": "Image download failed"
    }
  ]
}
```

---

### 3. Get OCR Statistics

**GET** `/api/receipts/ocr/stats`

Get OCR processing statistics.

**Success Response (200):**
```json
{
  "stats": {
    "pending": 15,
    "processed": 342,
    "failed": 8,
    "total": 365
  }
}
```

---

### 4. Retry Failed Receipt

**POST** `/api/receipts/retry/:receiptId`

Retry processing a failed receipt.

**URL Parameters:**
- `receiptId`: Receipt UUID

**Success Response (200):**
```json
{
  "message": "Receipt reprocessed successfully",
  "result": {
    "total": 50.00,
    "vendor": "Whole Foods",
    "date": "2024-10-09"
  }
}
```

---

## Veryfi Integration

### Configuration

**Required Environment Variables:**
```bash
VERYFI_CLIENT_ID=your-client-id
VERYFI_CLIENT_SECRET=your-client-secret
VERYFI_USERNAME=your-username
VERYFI_API_KEY=your-api-key
```

### Setup Steps

1. **Create Veryfi Account:**
   - Go to [Veryfi.com](https://www.veryfi.com)
   - Sign up for an account
   - Choose appropriate plan (free tier available)

2. **Get API Credentials:**
   - Navigate to API Keys section
   - Generate new API keys
   - Copy: Client ID, Client Secret, Username, API Key

3. **Configure Application:**
   - Add credentials to `.env` file
   - Restart server to load new configuration

### API Features Used

- **Document Processing**: `client.process_document()`
- **Auto-delete**: Documents deleted after processing for privacy
- **Categories**: Receipts tagged as "Expense"
- **Data Extracted**:
  - Total amount
  - Vendor name, address, phone
  - Date
  - Tax, tip
  - Line items
  - Payment method
  - Confidence score

---

## Data Extraction

### OCR Data Structure

```typescript
{
  total: number,                // Total amount
  vendor: {
    name: string,               // Merchant name
    address: string,            // Store address
    phone: string,              // Phone number
  },
  date: string,                 // Transaction date (YYYY-MM-DD)
  currency: string,             // Currency code (e.g., "USD")
  tax: number,                  // Tax amount
  tip: number,                  // Tip amount
  lineItems: [                  // Individual items
    {
      description: string,
      total: number,
      quantity: number,
      price: number,
    }
  ],
  paymentMethod: string,        // Payment type
  confidence: number,           // Quality score (0-100)
  veryfiId: string,            // Veryfi document ID
  rawResponse: object,         // Full Veryfi response
}
```

### Transaction Updates

After successful OCR processing, the transaction is automatically updated with:

- **amount**: Extracted total amount
- **payee**: Vendor name
- **transactionDate**: Receipt date
- **status**: Remains `pending_receipt` (user review required)

---

## Batch Processing

### Scheduled Worker

The OCR worker runs automatically every 5 minutes:

```typescript
// src/workers/ocrWorker.ts
export function startOCRWorker() {
  cron.schedule('*/5 * * * *', async () => {
    await processPendingReceipts(10);
  });
}
```

### Worker Features

- **Automatic Processing**: Runs every 5 minutes
- **Batch Limit**: Processes up to 10 receipts per run
- **Rate Limiting**: 1 second delay between receipts
- **Error Handling**: Continues on failure, logs errors
- **Monitoring**: Detailed logging for tracking

### Starting the Worker

Add to `src/index.ts`:

```typescript
import { startOCRWorker } from './workers/ocrWorker';

// After server starts
if (config.NODE_ENV === 'production') {
  startOCRWorker();
}
```

### Production Alternative

For production, consider using Cloud Scheduler instead:

```bash
# Cloud Scheduler hitting webhook every 5 minutes
POST /api/receipts/process/batch?limit=10
Authorization: Bearer CRON_SECRET_TOKEN
```

---

## Usage Examples

### cURL Examples

**Process Single Receipt:**
```bash
curl -X POST http://localhost:3000/api/receipts/process/RECEIPT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Batch Process:**
```bash
curl -X POST "http://localhost:3000/api/receipts/process/batch?limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Stats:**
```bash
curl http://localhost:3000/api/receipts/ocr/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Retry Failed Receipt:**
```bash
curl -X POST http://localhost:3000/api/receipts/retry/RECEIPT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### JavaScript/TypeScript Examples

**Process Receipt:**
```typescript
const processReceipt = async (receiptId: string) => {
  const response = await fetch(`/api/receipts/process/${receiptId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  console.log('Extracted:', result.result);
  // { total: 50.00, vendor: "Whole Foods", date: "2024-10-09" }
};
```

**Upload and Auto-Process:**
```typescript
const uploadAndProcess = async (file: File) => {
  // 1. Upload receipt
  const formData = new FormData();
  formData.append('image', file);

  const uploadResponse = await fetch('/api/receipts/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: formData,
  });

  const { receiptId, transactionId } = await uploadResponse.json();

  // 2. Process with OCR
  const processResponse = await fetch(`/api/receipts/process/${receiptId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  const processResult = await processResponse.json();

  // 3. Display extracted data for user review
  return {
    receiptId,
    transactionId,
    extracted: processResult.result,
  };
};
```

---

## Error Handling

### Common Errors

**502 Bad Gateway - OCR Processing Failed**
```json
{
  "error": "OCR Processing Failed",
  "message": "Veryfi credentials not configured"
}
```

**Causes:**
- Veryfi credentials missing/invalid
- Image download failed
- Network timeout
- Veryfi API rate limit exceeded
- Invalid image format

**Solutions:**
- Verify credentials in `.env`
- Check Veryfi API status
- Retry failed receipts
- Adjust rate limiting delays

---

### Retry Strategy

Failed receipts can be retried:

```typescript
// Automatic retry via batch processing
await processPendingReceipts(10);

// Manual retry
await retryFailedReceipt(receiptId);
```

**Best Practices:**
- Wait before retrying (avoid rate limits)
- Log failures for monitoring
- Set max retry attempts (future enhancement)
- Alert on persistent failures

---

## Performance Considerations

### Processing Time

- **Single Receipt**: 3-10 seconds (Veryfi processing)
- **Batch (10 receipts)**: 30-60 seconds (with rate limiting)
- **Signed URL Generation**: < 1 second
- **Database Updates**: < 100ms

### Optimization Tips

1. **Batch Processing**:
   - Process during low-traffic periods
   - Adjust batch size based on Veryfi plan
   - Use queue system for high volume

2. **Rate Limiting**:
   - Add delays between requests
   - Monitor Veryfi rate limits
   - Adjust based on plan tier

3. **Caching**:
   - Cache OCR results (already in database)
   - Don't reprocess successfully processed receipts

4. **Error Recovery**:
   - Automatic retry for transient failures
   - Manual retry for persistent issues
   - Alert on high failure rates

---

## Monitoring & Logging

### Key Metrics to Track

- **Processing Rate**: Receipts/hour
- **Success Rate**: % successful vs failed
- **Processing Time**: Average duration
- **Queue Size**: Pending receipts count
- **Error Rate**: Failures/hour

### Logging

All OCR operations are logged:

```typescript
logger.info({ receiptId }, 'Starting OCR processing');
logger.info({ total, vendor }, 'Receipt processed');
logger.error({ error, receiptId }, 'OCR processing failed');
```

**Log Queries:**
```bash
# View OCR processing logs
grep "OCR processing" logs/app.log

# View failures only
grep "OCR processing failed" logs/app.log

# Count processed today
grep "Receipt processed" logs/app.log | wc -l
```

---

## Security Considerations

### Data Privacy

✅ **Image Privacy**: Images deleted from Veryfi after processing  
✅ **Secure Storage**: Original images in private GCS bucket  
✅ **Time-Limited Access**: Signed URLs expire after 60 minutes  
✅ **User Isolation**: Users can only process their own receipts  

### API Security

✅ **Authentication Required**: All endpoints require valid JWT  
✅ **User Ownership Verification**: Checks before processing  
✅ **Rate Limiting**: Prevents abuse  
✅ **Credential Protection**: Veryfi keys in environment variables  

### Best Practices

- Rotate Veryfi API keys periodically
- Monitor for unusual processing patterns
- Set up alerts for high failure rates
- Review Veryfi security recommendations
- Comply with data retention policies

---

## Cost Management

### Veryfi Pricing

Veryfi charges per document processed. Key considerations:

1. **Free Tier**: Limited documents per month
2. **Pay-as-you-go**: Per-document pricing
3. **Subscription Plans**: Monthly quotas

### Cost Optimization

1. **Batch Processing**:
   - Process in bulk during off-peak hours
   - Adjust frequency based on volume

2. **Validation**:
   - Validate images before sending to Veryfi
   - Reject poor quality images early

3. **Deduplication**:
   - Prevent reprocessing same receipt
   - Check ocrStatus before processing

4. **Monitoring**:
   - Track processing costs
   - Alert on unexpected spikes
   - Review failed attempts (wasted credits)

---

## Workflow Integration

### Complete User Flow

```
1. User uploads receipt photo
   ↓
2. Server uploads to GCS, creates transaction (pending, amount=null)
   ↓
3. Server creates receipt record (ocrStatus=pending)
   ↓
4. [Automatic] Worker processes pending receipts every 5 minutes
   OR
   [Manual] User triggers "Process Receipt" button
   ↓
5. Server sends image to Veryfi API
   ↓
6. Veryfi extracts data and returns JSON
   ↓
7. Server updates receipt (ocrStatus=processed, ocrData={...})
   ↓
8. Server updates transaction (amount, payee, date)
   ↓
9. User receives notification: "Receipt processed"
   ↓
10. User reviews extracted data
    ↓
11. User edits if needed (PUT /api/transactions/:id)
    ↓
12. User confirms (status → cleared)
```

### UI/UX Recommendations

1. **Upload**:
   - Show progress indicator
   - Display uploaded image
   - Indicate "Processing..." status

2. **Processing**:
   - Show processing status
   - Display extracted data when complete
   - Highlight fields for review

3. **Review**:
   - Allow inline editing
   - Show confidence score
   - Provide "Looks good" button

4. **Errors**:
   - Explain failure clearly
   - Offer retry option
   - Allow manual entry fallback

---

## Future Enhancements

- [ ] Multi-page receipt support
- [ ] Receipt categorization (machine learning)
- [ ] Duplicate receipt detection
- [ ] Confidence threshold filtering
- [ ] Custom field extraction
- [ ] Receipt archiving lifecycle
- [ ] A/B testing with multiple OCR providers
- [ ] Real-time processing (webhook)
- [ ] Mobile app integration
- [ ] Offline queue for mobile uploads

---

## Troubleshooting

### Issue: "Veryfi credentials not configured"

**Solution**: Add credentials to `.env`:
```bash
VERYFI_CLIENT_ID=your-client-id
VERYFI_CLIENT_SECRET=your-client-secret
VERYFI_USERNAME=your-username
VERYFI_API_KEY=your-api-key
```

### Issue: "Failed to download image"

**Solution**:
- Verify GCS signed URL is valid
- Check GCS bucket permissions
- Ensure service account has access
- Check network connectivity

### Issue: "Rate limit exceeded"

**Solution**:
- Reduce batch processing frequency
- Increase delay between requests
- Upgrade Veryfi plan
- Process during off-peak hours

### Issue: "Low confidence scores"

**Solution**:
- Improve image quality (lighting, focus)
- Use higher resolution camera
- Crop to receipt only
- Avoid wrinkled/damaged receipts
- Consider manual review for low scores

---

## Testing

### Manual Testing

```bash
# 1. Upload a test receipt
RECEIPT_ID=$(curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-receipt.jpg" \
  | jq -r '.receiptId')

# 2. Process it
curl -X POST http://localhost:3000/api/receipts/process/$RECEIPT_ID \
  -H "Authorization: Bearer $TOKEN"

# 3. Check transaction was updated
TRANSACTION_ID=$(curl http://localhost:3000/api/receipts/$RECEIPT_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.receipt.transactionId')

curl http://localhost:3000/api/transactions/$TRANSACTION_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Automated Tests (Example)

```typescript
describe('OCR Processing', () => {
  it('should process receipt and update transaction', async () => {
    // Upload receipt
    const uploadResult = await uploadReceipt(testImageBuffer, token);
    
    // Process with OCR
    const processResult = await processReceipt(uploadResult.receiptId, token);
    
    expect(processResult.result.total).toBeGreaterThan(0);
    expect(processResult.result.vendor).toBeDefined();
    
    // Verify transaction updated
    const transaction = await getTransaction(uploadResult.transactionId, token);
    expect(transaction.amount).toBe(processResult.result.total);
    expect(transaction.payee).toBe(processResult.result.vendor);
  });
});
```

---

**Last Updated**: 2024-10-09
**API Version**: v1.0.0
**Veryfi SDK Version**: @veryfi/veryfi-sdk



# Receipt Upload API Documentation

## Overview

Complete API for uploading receipt images to Google Cloud Storage, creating transactions with pending status, and generating time-limited signed URLs for secure access.

## Architecture

### Components

1. **Google Cloud Storage (GCS)** - Private file storage for receipt images
2. **Multer** - File upload handling with in-memory storage
3. **Receipt Service** - Business logic for receipts and transactions
4. **Signed URLs** - Time-limited access to private files

### File Storage Strategy

- **Storage Path**: `receipts/{userId}/{uuid}.jpg`
- **Privacy**: Files are private by default
- **Access**: Via signed URLs (time-limited, typically 60 minutes)
- **Path Format**: Stored as canonical `gs://bucket-name/path` in database

---

## API Endpoints

Base path: `/api/receipts`

All endpoints require authentication (Bearer token in Authorization header).

---

### 1. Upload Receipt

**POST** `/api/receipts/upload`

Upload a receipt image, automatically create a transaction with `pending_receipt` status.

**Content-Type**: `multipart/form-data`

**Form Data:**
- `image` (required): Image file (JPEG, PNG, GIF, WebP)

**File Constraints:**
- Maximum size: 10MB
- Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Success Response (201):**
```json
{
  "transactionId": "uuid",
  "receiptId": "uuid",
  "signedUrl": "https://storage.googleapis.com/...[signed URL valid for 60 minutes]",
  "message": "Receipt uploaded successfully"
}
```

**Automatic Transaction Creation:**
- `amount`: `null` (to be filled later)
- `type`: `expense`
- `category`: `Uncategorized`
- `transactionDate`: Current timestamp
- `status`: `pending_receipt`

**Automatic Receipt Creation:**
- `imageUrl`: `gs://bucket-name/receipts/userId/uuid.jpg`
- `ocrStatus`: `pending`
- `ocrData`: `null`

**Error Responses:**

400 Bad Request - No file provided
```json
{
  "error": "Bad Request",
  "message": "No image file provided"
}
```

400 Bad Request - Invalid file type
```json
{
  "error": "Validation Error",
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

400 Bad Request - File too large
```json
{
  "error": "File Too Large",
  "message": "File size exceeds 10MB limit"
}
```

---

### 2. Get Receipt

**GET** `/api/receipts/:id`

Get a receipt with a fresh signed URL for viewing.

**URL Parameters:**
- `id`: Receipt UUID

**Query Parameters:**
- `expiration` (optional): URL expiration in minutes (default: 60)

**Success Response (200):**
```json
{
  "receipt": {
    "id": "uuid",
    "transactionId": "uuid",
    "imageUrl": "gs://bucket-name/receipts/userId/uuid.jpg",
    "ocrStatus": "pending",
    "ocrData": null,
    "createdAt": "2024-10-09T10:30:00.000Z",
    "updatedAt": "2024-10-09T10:30:00.000Z",
    "signedUrl": "https://storage.googleapis.com/...[signed URL]"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "Receipt not found"
}
```

---

### 3. Delete Receipt

**DELETE** `/api/receipts/:id`

Delete a receipt and its associated file from Google Cloud Storage.

**URL Parameters:**
- `id`: Receipt UUID

**Success Response (200):**
```json
{
  "message": "Receipt deleted successfully"
}
```

**Notes:**
- Deletes file from GCS
- Deletes receipt record from database
- Transaction remains (can be manually deleted or kept)

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "Receipt not found or access denied"
}
```

---

### 4. Get Transaction Receipts

**GET** `/api/receipts/transaction/:transactionId`

Get all receipts for a specific transaction with signed URLs.

**URL Parameters:**
- `transactionId`: Transaction UUID

**Query Parameters:**
- `expiration` (optional): URL expiration in minutes (default: 60)

**Success Response (200):**
```json
{
  "receipts": [
    {
      "id": "uuid",
      "transactionId": "uuid",
      "imageUrl": "gs://bucket-name/receipts/userId/uuid.jpg",
      "ocrStatus": "processed",
      "ocrData": {
        "total": 50.00,
        "merchant": "Whole Foods",
        "date": "2024-10-09",
        "items": [...]
      },
      "createdAt": "2024-10-09T10:30:00.000Z",
      "updatedAt": "2024-10-09T11:00:00.000Z",
      "signedUrl": "https://storage.googleapis.com/...[signed URL]"
    }
  ]
}
```

---

## Google Cloud Storage Configuration

### Environment Variables Required

```bash
# Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-gcp-project-id
GCS_KEY_FILE=path/to/service-account-key.json
```

### Setup Steps

1. **Create GCS Bucket:**
   ```bash
   gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l US gs://your-bucket-name
   ```

2. **Set Bucket Permissions:**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-bucket-name
   ```

3. **Create Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to IAM & Admin > Service Accounts
   - Create service account with "Storage Object Admin" role
   - Download JSON key file

4. **Configure Application:**
   - Place key file in secure location
   - Update `.env` with `GCS_KEY_FILE` path
   - Set `GCS_BUCKET_NAME` and `GCS_PROJECT_ID`

### File Structure in GCS

```
gs://your-bucket-name/
└── receipts/
    ├── user-id-1/
    │   ├── uuid-1.jpg
    │   ├── uuid-2.png
    │   └── uuid-3.jpg
    ├── user-id-2/
    │   └── uuid-4.jpg
    └── user-id-3/
        └── uuid-5.jpg
```

---

## Signed URLs

### What Are Signed URLs?

Signed URLs provide time-limited access to private GCS objects without requiring authentication.

### Key Features:

- **Time-Limited**: Expire after specified duration (default: 60 minutes)
- **Secure**: Cannot be guessed or modified
- **No Auth Required**: Client can access directly with URL
- **Auditable**: GCS logs all access

### Generation:

```typescript
import { generateSignedUrl } from '../lib/gcsStorage';

// Generate URL valid for 60 minutes
const url = await generateSignedUrl('gs://bucket/file.jpg', 60);
```

### Best Practices:

- Use short expiration times (15-60 minutes)
- Regenerate URLs when needed (don't cache long-term)
- Monitor access logs for unusual patterns
- Rotate service account keys periodically

---

## Usage Examples

### cURL Examples

**Upload Receipt:**
```bash
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/receipt.jpg"
```

**Get Receipt:**
```bash
curl http://localhost:3000/api/receipts/RECEIPT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Receipt with Custom Expiration (15 minutes):**
```bash
curl "http://localhost:3000/api/receipts/RECEIPT_ID?expiration=15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Delete Receipt:**
```bash
curl -X DELETE http://localhost:3000/api/receipts/RECEIPT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Transaction Receipts:**
```bash
curl http://localhost:3000/api/receipts/transaction/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### JavaScript/TypeScript Client Examples

**Upload Receipt:**
```typescript
const uploadReceipt = async (file: File, accessToken: string) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/receipts/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return response.json();
};

// Usage
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadReceipt(file, accessToken);
console.log('Receipt uploaded:', result.receiptId);
console.log('View at:', result.signedUrl);
```

**Display Receipt Image:**
```typescript
const displayReceipt = async (receiptId: string, accessToken: string) => {
  const response = await fetch(`/api/receipts/${receiptId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const { receipt } = await response.json();
  
  // Display image using signed URL
  const img = document.createElement('img');
  img.src = receipt.signedUrl;
  document.body.appendChild(img);
};
```

**React Component Example:**
```tsx
import React, { useState } from 'react';

const ReceiptUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();
      setReceiptUrl(result.signedUrl);
      alert(`Transaction created: ${result.transactionId}`);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {receiptUrl && <img src={receiptUrl} alt="Receipt" />}
    </div>
  );
};
```

---

## Workflow Integration

### Complete Receipt Processing Flow

1. **User uploads receipt** → `POST /api/receipts/upload`
2. **Server creates transaction** with `status='pending_receipt'`, `amount=null`
3. **Server uploads to GCS** under `/receipts/{userId}/{uuid}.jpg`
4. **Server creates receipt** with `ocrStatus='pending'`
5. **Server returns** `transactionId`, `receiptId`, `signedUrl`
6. **Client displays** receipt using signed URL
7. **(Future) OCR processing** extracts data from receipt
8. **Server updates** transaction with extracted amount, payee, date
9. **Server updates** receipt with `ocrStatus='processed'`, `ocrData={...}`
10. **User reviews/edits** transaction details
11. **User confirms** → Update transaction `status='cleared'`

### Typical User Journey

```
1. User takes photo of receipt (mobile app)
2. App uploads to /api/receipts/upload
3. App receives transactionId and displays receipt
4. (Background) OCR processes receipt
5. (Background) Transaction updated with OCR data
6. User receives notification: "Receipt processed"
7. User reviews transaction details
8. User edits if needed (via PUT /api/transactions/:id)
9. User confirms transaction
```

---

## Security Considerations

### File Upload Security

✅ **File Type Validation** - Only images allowed  
✅ **File Size Limit** - 10MB maximum  
✅ **In-Memory Processing** - No temporary files on disk  
✅ **Private Storage** - Files not publicly accessible  
✅ **User Isolation** - Files organized by userId  

### Access Control

✅ **Authentication Required** - All endpoints require JWT  
✅ **User Ownership** - Can only access own receipts  
✅ **Signed URLs** - Time-limited, cannot be forged  
✅ **Path Validation** - Prevents directory traversal  

### Best Practices

- Rotate GCS service account keys regularly
- Use short-lived signed URLs (15-60 minutes)
- Monitor GCS access logs
- Implement virus scanning (future enhancement)
- Implement content moderation (future enhancement)
- Set up GCS lifecycle policies for old receipts
- Enable GCS audit logging

---

## Error Handling

All endpoints return consistent error responses:

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**400 Bad Request**
```json
{
  "error": "Validation Error",
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

**404 Not Found**
```json
{
  "error": "Not Found",
  "message": "Receipt not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to upload receipt"
}
```

---

## Testing

### Manual Testing

```bash
# 1. Get access token (login first)
ACCESS_TOKEN="your_access_token"

# 2. Upload receipt
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "image=@test-receipt.jpg"

# Response will include signedUrl - test in browser

# 3. Get receipt
RECEIPT_ID="uuid-from-upload"
curl http://localhost:3000/api/receipts/$RECEIPT_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Verify transaction was created
TRANSACTION_ID="uuid-from-upload"
curl http://localhost:3000/api/transactions/$TRANSACTION_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Automated Tests (Example)

```typescript
describe('Receipt Upload API', () => {
  it('should upload receipt and create transaction', async () => {
    const response = await uploadReceipt(testImageBuffer, accessToken);
    
    expect(response.transactionId).toBeDefined();
    expect(response.receiptId).toBeDefined();
    expect(response.signedUrl).toMatch(/^https:\/\/storage\.googleapis\.com/);
  });

  it('should reject invalid file types', async () => {
    const response = await uploadFile(pdfBuffer, 'application/pdf', accessToken);
    expect(response.status).toBe(400);
  });

  it('should reject files over 10MB', async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    const response = await uploadReceipt(largeBuffer, accessToken);
    expect(response.status).toBe(400);
  });
});
```

---

## Performance Considerations

### Upload Performance

- In-memory buffer processing (fast)
- Direct upload to GCS (no local disk I/O)
- Parallel database operations (transaction + receipt)
- Async signed URL generation

### Optimization Tips

1. **Client-Side**:
   - Compress images before upload
   - Use progressive upload UI
   - Cache signed URLs (within expiration)

2. **Server-Side**:
   - Use GCS regional buckets near users
   - Enable GCS CDN for frequent access
   - Batch signed URL generation

3. **Database**:
   - Index on `transactionId` for receipt lookup
   - Index on `userId` for user queries

---

## Future Enhancements

- [ ] OCR processing integration (Google Vision API)
- [ ] Automatic transaction field population from OCR
- [ ] Receipt thumbnail generation
- [ ] Bulk receipt upload
- [ ] Receipt search by content
- [ ] PDF receipt support
- [ ] Receipt sharing/export
- [ ] Receipt archiving/lifecycle management
- [ ] Duplicate detection
- [ ] Multiple receipts per transaction

---

## Troubleshooting

### Issue: "Failed to upload file: Could not load the default credentials"

**Solution**: Ensure GCS credentials are configured:
- Set `GCS_KEY_FILE` to service account JSON file
- Or use default credentials in GCP environment
- Verify service account has Storage Object Admin role

### Issue: "Signed URL generation failed"

**Solution**: Check service account permissions:
- Ensure service account can sign URLs
- Verify `iam.serviceAccounts.signBlob` permission
- May need to add Service Account Token Creator role

### Issue: "File uploaded but not accessible"

**Solution**: Check bucket configuration:
- Verify bucket exists
- Check CORS settings if accessing from browser
- Ensure signed URLs are being used for private files

### Issue: "Upload slow or timing out"

**Solution**: Optimize upload:
- Reduce image size client-side
- Check network connectivity
- Consider regional bucket placement
- Increase request timeout if needed

---

**Last Updated**: 2024-10-09



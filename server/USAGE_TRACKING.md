# Usage Tracking & Subscription System

## 🎯 **Receipt Quota System Implemented**

Complete usage tracking with monthly receipt limits for free tier users.

**Date**: October 9, 2024  
**Status**: ✅ **Implementation Complete**

---

## 📊 **Overview**

### **Subscription Tiers**

**Free Tier:**
- 10 receipt scans per month
- Unlimited manual transactions
- All core features
- Push notifications

**Premium Tier:**
- Unlimited receipt scans
- All features
- Priority support

---

## 🗄️ **Database Schema**

### **New Usage Model**

```prisma
model Usage {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid
  month           String   // Format: YYYY-MM (e.g., "2024-10")
  receiptCaptures Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month], name: "userId_month")
  @@index([userId])
  @@index([month])
}
```

**Indexes:**
- Unique constraint on (userId, month) - One record per user per month
- Index on userId for fast user lookups
- Index on month for monthly reporting

---

### **Updated User Model**

```prisma
model User {
  // ... existing fields
  subscriptionTier  String   @default("free") // "free" or "premium"
  
  // Relations
  usageRecords      Usage[]
  
  @@index([subscriptionTier])
}
```

---

## 📝 **Migration**

```bash
# Create and apply migration
cd server
npx prisma migrate dev --name add_usage_and_subscription_tier

# Or for production
npx prisma migrate deploy
```

**Migration SQL:**
```sql
-- Add subscriptionTier to User table
ALTER TABLE "User" ADD COLUMN "subscriptionTier" TEXT NOT NULL DEFAULT 'free';
CREATE INDEX "User_subscriptionTier_idx" ON "User"("subscriptionTier");

-- Create Usage table
CREATE TABLE "Usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "receiptCaptures" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- Create indexes and constraints
CREATE UNIQUE INDEX "Usage_userId_month_key" ON "Usage"("userId", "month");
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");
CREATE INDEX "Usage_month_idx" ON "Usage"("month");

-- Add foreign key
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 🔧 **Implementation**

### **1. Usage Service** ✅
**File**: `src/services/usageService.ts` (180 lines)

**Functions:**

```typescript
// Get current month in YYYY-MM format
function getCurrentMonth(): string

// Get or create usage record
async function getOrCreateUsage(userId: string)

// Increment receipt count
async function incrementReceiptCaptures(userId: string): Promise<number>

// Get current month count
async function getCurrentMonthReceiptCount(userId: string): Promise<number>

// Check if user can upload (quota check)
async function checkReceiptQuota(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
  };
}>

// Get full usage stats for subscription endpoint
async function getUserUsageStats(userId: string)
```

---

### **2. Quota Check Middleware** ✅
**File**: `src/middleware/checkQuota.ts` (60 lines)

**Function**: `checkReceiptUploadQuota()`

**Process:**
1. Get userId from authenticated request
2. Call `checkReceiptQuota(userId)`
3. If quota exceeded:
   - Return 402 Payment Required
   - Include error code: `FREE_QUOTA_EXCEEDED`
   - Include usage stats
   - Suggest upgrade
4. If quota OK: Proceed to next middleware

**Response (Quota Exceeded):**
```json
{
  "error": "PAYMENT_REQUIRED",
  "code": "FREE_QUOTA_EXCEEDED",
  "message": "You have reached your monthly receipt limit. Upgrade to Premium for unlimited scans.",
  "usage": {
    "used": 10,
    "limit": 10,
    "remaining": 0
  },
  "upgradeUrl": "/upgrade"
}
```

---

### **3. Updated Receipt Upload** ✅

**Route**:
```typescript
router.post('/upload', checkReceiptUploadQuota, upload.single('image'), uploadReceipt);
```

**Flow:**
1. User authenticated (via authenticate middleware)
2. **Quota checked** (via checkReceiptUploadQuota middleware) ← NEW
3. File uploaded (via multer middleware)
4. Receipt processed (via uploadReceipt controller)
5. **Usage incremented** (in receiptService.uploadReceipt) ← NEW

---

### **4. Subscription Endpoint** ✅

**Route**: `GET /api/users/subscription`

**Controller**: `getSubscription()` in `userController.ts`

**Response:**
```json
{
  "subscription": {
    "tier": "free",
    "receiptsUsedThisMonth": 7,
    "receiptsLimitThisMonth": 10,
    "receiptsRemaining": 3,
    "monthlyResetDate": "2024-11-01T00:00:00.000Z"
  }
}
```

**Premium User:**
```json
{
  "subscription": {
    "tier": "premium",
    "receiptsUsedThisMonth": 45,
    "receiptsLimitThisMonth": 9999,
    "receiptsRemaining": 9999,
    "monthlyResetDate": "2024-11-01T00:00:00.000Z"
  }
}
```

---

## 🔄 **Complete Flow**

### **Receipt Upload with Quota Check**

```
Mobile: POST /api/receipts/upload
    Headers: Authorization: Bearer <token>
    Body: multipart/form-data (image file)
    ↓
Backend: authenticate middleware
    Verifies JWT token
    Sets req.user.userId
    ↓
Backend: checkReceiptUploadQuota middleware ← NEW
    ↓
Get user's subscription tier from DB
    ↓
If Premium:
    allowed = true → Continue
    ↓
If Free:
    Get current month receipt count
    ↓
    If count >= 10:
        Return 402 with FREE_QUOTA_EXCEEDED
        {
          error: "PAYMENT_REQUIRED",
          code: "FREE_QUOTA_EXCEEDED",
          usage: { used: 10, limit: 10, remaining: 0 }
        }
        ↓
        Mobile Shows: "Upgrade to Premium" dialog
    ↓
    If count < 10:
        allowed = true → Continue
    ↓
Backend: multer middleware
    Process file upload
    ↓
Backend: uploadReceipt controller
    Upload to GCS
    Create transaction (status='pending_receipt')
    Create receipt record
    ↓
Backend: INCREMENT usage counter ← NEW
    increment receiptCaptures for current month
    ↓
Return success response
    ↓
Mobile: Receipt uploaded, OCR processing starts
```

---

### **Subscription Display Flow**

```
Mobile: Open Settings Screen
    ↓
GET /api/users/subscription
    Headers: Authorization: Bearer <token>
    ↓
Backend: getUserUsageStats(userId)
    ↓
Query current month Usage record
    month = "2024-10"
    receiptsUsedThisMonth = 7
    ↓
Get user subscription tier
    tier = "free" or "premium"
    ↓
Calculate limits:
    Free: limit = 10, remaining = 10 - 7 = 3
    Premium: limit = 9999, remaining = 9999
    ↓
Calculate next reset date:
    First day of next month
    ↓
Return subscription data
    ↓
Mobile: Display in Settings
    - Badge (Free/Premium)
    - Progress bar (7/10)
    - "3 scans remaining"
```

---

## 🎯 **Counting Strategy**

### **Count on Upload** (Current Implementation)

**Pros:**
- Prevents quota abuse (can't upload 100 and only confirm 10)
- OCR costs incurred on upload
- Clear user feedback upfront

**Implementation:**
```typescript
// In receiptService.uploadReceipt()
await incrementReceiptCaptures(userId);
```

**When Counted:**
- Immediately after receipt uploaded to GCS
- Before OCR processing
- User sees quota decremented right away

---

### **Alternative: Count on Confirm** (Not Implemented)

**Pros:**
- Only counts "confirmed" receipts
- User can test without hitting quota

**Cons:**
- OCR costs incurred even if not confirmed
- Can abuse by uploading many, confirming few

**To Implement (if preferred):**
```typescript
// In transactionController.updateTransaction()
if (oldStatus === 'pending_receipt' && newStatus === 'cleared') {
  await incrementReceiptCaptures(userId);
}
```

---

## 🧪 **Testing**

### **Test Free Tier Quota**

```bash
# 1. Create free tier user
# (Default: all new users are free)

# 2. Upload receipts
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/receipts/upload \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "image=@receipt.jpg"
done

# 3. Try 11th upload
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@receipt.jpg"

# Expected: 402 Payment Required
# {
#   "error": "PAYMENT_REQUIRED",
#   "code": "FREE_QUOTA_EXCEEDED",
#   "message": "You have reached your monthly receipt limit...",
#   "usage": { "used": 10, "limit": 10, "remaining": 0 }
# }
```

---

### **Test Subscription Endpoint**

```bash
# Get subscription status
curl -X GET http://localhost:3000/api/users/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
# {
#   "subscription": {
#     "tier": "free",
#     "receiptsUsedThisMonth": 7,
#     "receiptsLimitThisMonth": 10,
#     "receiptsRemaining": 3,
#     "monthlyResetDate": "2024-11-01T00:00:00.000Z"
#   }
# }
```

---

### **Test Premium Upgrade**

```sql
-- Upgrade user to premium
UPDATE "User" 
SET "subscriptionTier" = 'premium' 
WHERE email = 'user@example.com';
```

```bash
# Upload should now work unlimited
curl -X POST http://localhost:3000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@receipt.jpg"

# No quota limit

# Check subscription
curl -X GET http://localhost:3000/api/users/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected:
# {
#   "subscription": {
#     "tier": "premium",
#     "receiptsUsedThisMonth": 15,
#     "receiptsLimitThisMonth": 9999,
#     "receiptsRemaining": 9999,
#     ...
#   }
# }
```

---

### **Test Monthly Reset**

```sql
-- Check usage table
SELECT * FROM "Usage" WHERE "userId" = 'user-uuid';

-- Should see records like:
-- | id | userId | month    | receiptCaptures |
-- |----|--------|----------|-----------------|
-- | .. | ...    | 2024-09  | 10              |
-- | .. | ...    | 2024-10  | 7               |

-- New month automatically creates new record
-- Old months remain for analytics
```

---

## 📱 **Mobile App Integration**

### **Handling Quota Exceeded**

```typescript
// In receiptService.uploadReceipt()
try {
  const response = await api.post('/api/receipts/upload', formData);
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error) && error.response?.status === 402) {
    // Quota exceeded
    const data = error.response.data;
    
    Alert.alert(
      'Upgrade Required',
      data.message || 'You have reached your monthly receipt limit.',
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Upgrade to Premium', 
          onPress: () => router.push('/upgrade')
        },
      ]
    );
    
    throw new Error(data.code || 'QUOTA_EXCEEDED');
  }
  
  throw error;
}
```

---

### **Subscription Status Display**

Already implemented in mobile app:
- Settings screen shows subscription card
- Progress bar (7/10)
- Remaining scans counter
- Upgrade button for free users

---

## 🔐 **Security Considerations**

### **Quota Bypass Prevention**

**Protected:**
- ✅ Quota checked before file upload
- ✅ Middleware runs after authentication
- ✅ Can't bypass by directly calling controller
- ✅ Database constraint on unique (userId, month)

**Failsafe:**
- If quota check fails (error), upload is allowed
- Better to fail open than block legitimate users
- Error is logged for monitoring

---

### **Usage Data Integrity**

**Atomic Operations:**
```typescript
// Upsert ensures no race conditions
await prisma.usage.upsert({
  where: { userId_month: { userId, month } },
  update: { receiptCaptures: { increment: 1 } },
  create: { userId, month, receiptCaptures: 1 },
});
```

**Monthly Reset:**
- Automatic via month-based records
- New month → New record created automatically
- Old records preserved for analytics

---

## 📈 **Analytics & Reporting**

### **Monthly Usage Report**

```sql
-- Total receipts processed per month
SELECT 
  month,
  SUM("receiptCaptures") as total_receipts,
  COUNT(DISTINCT "userId") as active_users,
  AVG("receiptCaptures") as avg_per_user
FROM "Usage"
GROUP BY month
ORDER BY month DESC;

-- Users hitting quota
SELECT 
  u.email,
  u."subscriptionTier",
  usage."receiptCaptures"
FROM "Usage" usage
JOIN "User" u ON u.id = usage."userId"
WHERE usage."receiptCaptures" >= 10
  AND u."subscriptionTier" = 'free'
  AND usage.month = '2024-10';
```

---

### **Conversion Tracking**

```sql
-- Users who might upgrade (hit quota)
SELECT 
  COUNT(*) as potential_upgrades
FROM "Usage"
WHERE "receiptCaptures" >= 10
  AND "userId" IN (
    SELECT id FROM "User" WHERE "subscriptionTier" = 'free'
  )
  AND month = '2024-10';
```

---

## 🎯 **Business Logic**

### **Free Tier Limits**

**10 Receipts Per Month:**
- Generous for casual users
- Encourages premium for power users
- Typical user: 5-8 receipts/month
- Power user: 20+ receipts/month

**Why 10?**
- ~2 receipts per week
- Covers typical household expenses
- Room for occasional extra purchases

---

### **Premium Value Proposition**

**At $4.99/month:**
- Unlimited scans ($0 per receipt)
- Free tier: $0.50 per receipt (if you could buy more)
- Break-even at 10+ receipts/month
- Value for frequent users

**Annual Plan ($49.99/year):**
- $4.16/month (17% savings)
- Best for committed users

---

## 🚀 **Future Enhancements**

### **Soft Limit with Overage**

```typescript
// Allow 1-2 extra receipts with warning
if (currentCount >= FREE_TIER_LIMIT && currentCount < FREE_TIER_LIMIT + 2) {
  // Allow but warn
  res.setHeader('X-Quota-Warning', 'Approaching limit');
  next();
}
```

### **Rollover Unused Scans**

```typescript
// Allow up to 5 rollover scans
const previousMonth = getPreviousMonth();
const previousUsage = await getUsage(userId, previousMonth);
const unused = Math.max(0, 10 - previousUsage.receiptCaptures);
const rollover = Math.min(5, unused);

const effectiveLimit = 10 + rollover; // 10-15 receipts
```

### **Usage Alerts**

```typescript
// Send push when user hits 8/10 receipts
if (newCount === 8) {
  await sendPush(token, {
    title: 'Quota Alert',
    body: 'You have 2 receipt scans remaining this month',
  });
}
```

---

## 📊 **API Endpoints**

### **GET /api/users/subscription**

**Request:**
```
GET /api/users/subscription
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "subscription": {
    "tier": "free",
    "receiptsUsedThisMonth": 7,
    "receiptsLimitThisMonth": 10,
    "receiptsRemaining": 3,
    "monthlyResetDate": "2024-11-01T00:00:00.000Z"
  }
}
```

---

### **POST /api/receipts/upload** (with quota)

**Success (Quota Available):**
```json
{
  "transactionId": "uuid",
  "receiptId": "uuid",
  "signedUrl": "https://...",
  "message": "Receipt uploaded successfully"
}
```

**Error (Quota Exceeded):**
```json
{
  "error": "PAYMENT_REQUIRED",
  "code": "FREE_QUOTA_EXCEEDED",
  "message": "You have reached your monthly receipt limit. Upgrade to Premium for unlimited scans.",
  "usage": {
    "used": 10,
    "limit": 10,
    "remaining": 0
  },
  "upgradeUrl": "/upgrade"
}
```

---

## ✅ **Implementation Checklist**

### **Backend**
- [x] Usage model in Prisma schema
- [x] subscriptionTier field on User
- [x] Usage service (CRUD operations)
- [x] Quota check middleware
- [x] Integration with receipt upload
- [x] Subscription endpoint
- [x] Usage counter increment
- [x] TypeScript compilation

### **Database**
- [ ] Run migration (when DB available)
- [ ] Verify indexes created
- [ ] Test unique constraint
- [ ] Seed test data

### **Mobile** (Already Complete)
- [x] Subscription display in Settings
- [x] Progress bar visualization
- [x] Usage stats fetching
- [x] Upgrade button UI

### **Testing**
- [ ] Test quota enforcement
- [ ] Test 402 response handling
- [ ] Test premium unlimited
- [ ] Test monthly reset
- [ ] Test mobile upgrade flow

---

## 🎯 **Deployment Notes**

### **Database Migration**

```bash
# Development
npm run prisma:migrate

# Production (Cloud Run)
npm run prisma:migrate:prod

# Or manual
DATABASE_URL="..." npx prisma migrate deploy
```

### **Existing Users**

All existing users will:
- Default to `subscriptionTier = 'free'`
- Start with 0 receipts this month
- New Usage record created on first upload

### **Monitoring**

```bash
# Check quota usage
SELECT COUNT(*) FROM "Usage" WHERE "receiptCaptures" >= 10;

# Check premium users
SELECT COUNT(*) FROM "User" WHERE "subscriptionTier" = 'premium';

# Monthly totals
SELECT month, SUM("receiptCaptures") 
FROM "Usage" 
GROUP BY month 
ORDER BY month DESC 
LIMIT 12;
```

---

## ✅ **Complete**

Your usage tracking system is ready with:

✅ **Usage table** for monthly tracking  
✅ **Quota middleware** (returns 402 if exceeded)  
✅ **Free tier limit** (10 receipts/month)  
✅ **Premium unlimited**  
✅ **Usage counter** (increments on upload)  
✅ **Subscription endpoint** (for mobile display)  
✅ **Type-safe** implementation  
✅ **Error handling** throughout  
✅ **Mobile integration** complete  

**Next**: Run migration when database is available

---

**Created**: October 9, 2024  
**Files**: 2 new, 4 updated  
**Lines Added**: 300+  
**Status**: ✅ **READY FOR MIGRATION & TESTING**


# Authentication System Implementation

## Overview

This document describes the complete authentication system implementation for the Budget Tracker API, including social login (Google, Apple, Facebook), JWT token management, and refresh token rotation.

## Architecture

### Components

1. **Token Service** (`src/services/tokenService.ts`)
   - JWT access token generation (15 minutes)
   - JWT refresh token generation (30 days)
   - Token verification
   - Refresh token storage and rotation
   - Token revocation

2. **Social Verification Service** (`src/services/socialVerify.ts`)
   - Google ID Token verification
   - Apple Identity Token verification
   - Facebook Access Token verification

3. **Auth Middleware** (`src/middleware/auth.ts`)
   - JWT authentication middleware
   - Optional authentication
   - User-specific route protection

4. **Auth Controller** (`src/controllers/authController.ts`)
   - Social login endpoint
   - Token refresh endpoint
   - Logout endpoints
   - Current user endpoint

5. **Auth Routes** (`src/routes/authRoutes.ts`)
   - Route definitions for all auth endpoints

## Database Schema

### RefreshToken Model

```prisma
model RefreshToken {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @db.Uuid
  tokenHash String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
}
```

## API Endpoints

### POST `/api/auth/social-login`

Authenticate user with social provider (Google, Apple, or Facebook).

**Request Body:**
```json
{
  "provider": "google" | "apple" | "facebook",
  "token": "provider_token_here",
  "email": "user@example.com",        // Optional, required for Apple if email not in token
  "firstName": "John",                 // Optional
  "lastName": "Doe"                    // Optional
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "google"
  },
  "accessToken": "jwt_access_token",
  "message": "Login successful"
}
```

**Notes:**
- Refresh token is set as HTTP-only cookie
- Creates new user or updates existing user based on (provider, providerId)
- Email is required for all providers

---

### POST `/api/auth/refresh`

Refresh access token using refresh token from HTTP-only cookie.

**Request:** No body required, refresh token read from cookie

**Success Response (200):**
```json
{
  "accessToken": "new_jwt_access_token",
  "message": "Token refreshed successfully"
}
```

**Notes:**
- Old refresh token is revoked
- New refresh token is issued and set in cookie (rotation)
- Returns 401 if refresh token is invalid or expired

---

### POST `/api/auth/logout`

Logout user and revoke current refresh token.

**Request:** No body required

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Notes:**
- Revokes refresh token from database
- Clears refresh token cookie

---

### POST `/api/auth/logout-all`

Logout from all devices (revoke all refresh tokens).

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Logged out from all devices successfully"
}
```

**Notes:**
- Requires valid access token (authenticated route)
- Revokes all refresh tokens for the user

---

### GET `/api/auth/me`

Get current authenticated user information.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "provider": "google",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Token Flow

### 1. Social Login Flow

```
Client → POST /api/auth/social-login
         ↓
    Verify token with provider (Google/Apple/Facebook)
         ↓
    Upsert user in database
         ↓
    Generate access token (15m) + refresh token (30d)
         ↓
    Store refresh token hash in database
         ↓
    Set refresh token in HTTP-only cookie
         ↓
    Return: { user, accessToken }
```

### 2. Token Refresh Flow

```
Client → POST /api/auth/refresh (with refresh token cookie)
         ↓
    Validate refresh token (check database)
         ↓
    Revoke old refresh token
         ↓
    Generate new access token + refresh token
         ↓
    Store new refresh token hash in database
         ↓
    Set new refresh token in cookie
         ↓
    Return: { accessToken }
```

### 3. Protected Route Access

```
Client → Request with Authorization: Bearer <access_token>
         ↓
    Verify JWT signature and expiration
         ↓
    Extract user payload { userId, email }
         ↓
    Attach to req.user
         ↓
    Continue to route handler
```

## Security Features

### 1. JWT Tokens
- **Access Token**: 15-minute expiration, short-lived
- **Refresh Token**: 30-day expiration, stored as hash
- **Signature**: HMAC SHA256 with secret key
- **Claims**: issuer, audience for validation

### 2. Refresh Token Security
- Stored as SHA256 hash (not plaintext)
- Automatic rotation on refresh
- Revocation support (logout)
- Expiration tracking
- Database-backed validation

### 3. HTTP-Only Cookies
- Refresh tokens stored in HTTP-only cookies
- Not accessible via JavaScript (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite=strict (CSRF protection)
- Path restricted to `/api/auth`

### 4. Social Provider Verification
- **Google**: OAuth2Client verification
- **Apple**: JWT signature verification with Apple's public keys
- **Facebook**: debug_token API validation + profile fetch

### 5. Additional Security
- CORS with credentials support
- Helmet security headers
- Rate limiting on API routes
- Database cascade deletes (user cleanup)

## Environment Variables

Required configuration in `.env`:

```bash
# JWT
JWT_SECRET=your-super-secret-min-32-chars

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Apple Sign In
APPLE_BUNDLE_ID=com.yourcompany.budgettracker
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID

# Facebook Login
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Usage Examples

### Client-Side: Social Login

```typescript
// Google Login
const googleToken = await getGoogleIdToken(); // From Google Sign-In SDK

const response = await fetch('/api/auth/social-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: include cookies
  body: JSON.stringify({
    provider: 'google',
    token: googleToken,
  }),
});

const { user, accessToken } = await response.json();
// Store accessToken in memory or state management
```

### Client-Side: Using Access Token

```typescript
// Make authenticated request
const response = await fetch('/api/transactions', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  credentials: 'include',
});
```

### Client-Side: Refresh Token

```typescript
// When access token expires (401 error)
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include', // Sends refresh token cookie
});

const { accessToken } = await response.json();
// Update stored access token
```

### Client-Side: Logout

```typescript
// Logout from current device
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

// Or logout from all devices (requires access token)
await fetch('/api/auth/logout-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  credentials: 'include',
});
```

## Server-Side: Protecting Routes

### Example: Protected Route

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected route - requires authentication
router.get('/transactions', authenticate, async (req, res) => {
  // req.user is available here
  const userId = req.user!.userId;
  
  const transactions = await getTransactionsForUser(userId);
  res.json({ transactions });
});

export default router;
```

### Example: Optional Authentication

```typescript
import { optionalAuthenticate } from '../middleware/auth';

// Public route with optional auth
router.get('/public-data', optionalAuthenticate, async (req, res) => {
  if (req.user) {
    // User is authenticated, return personalized data
    return res.json({ data: getPersonalizedData(req.user.userId) });
  }
  
  // User not authenticated, return generic data
  res.json({ data: getGenericData() });
});
```

## Testing

### Manual Testing with cURL

```bash
# 1. Social Login
curl -X POST http://localhost:3000/api/auth/social-login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "provider": "google",
    "token": "your_google_id_token"
  }'

# 2. Access Protected Route
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 3. Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Database Migrations

To apply the RefreshToken model to your database:

```bash
cd server

# Create migration
npm run prisma:migrate

# Or in production
npm run prisma:migrate:prod
```

## Maintenance Tasks

### Cleanup Expired Tokens

The token service includes a cleanup function. Add to a cron job:

```typescript
import cron from 'node-cron';
import { cleanupExpiredTokens } from './services/tokenService';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const count = await cleanupExpiredTokens();
  logger.info({ count }, 'Expired tokens cleaned up');
});
```

## Error Handling

All auth endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Descriptive error message"
}
```

Common errors:
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Best Practices

1. **Access Token Storage**
   - Store in memory or React state (not localStorage)
   - Never log access tokens
   - Clear on logout

2. **Refresh Token Handling**
   - Always use HTTP-only cookies
   - Never expose to JavaScript
   - Automatic rotation on refresh

3. **Error Handling**
   - Catch 401 errors globally
   - Automatically retry with refresh
   - Redirect to login on refresh failure

4. **Security**
   - Always use HTTPS in production
   - Validate CORS origins in production
   - Rotate JWT secret periodically
   - Monitor for suspicious activity

## Troubleshooting

### Issue: "Invalid or expired refresh token"
- Check if refresh token cookie is being sent
- Verify cookie settings (httpOnly, secure, sameSite)
- Check if token has expired or been revoked
- Ensure database connection is working

### Issue: Social token verification fails
- Verify provider credentials in environment variables
- Check token audience matches your client IDs
- Ensure tokens are not expired
- Review provider-specific documentation

### Issue: CORS errors with cookies
- Ensure `credentials: 'include'` in fetch requests
- Verify CORS origin configuration
- Check cookie SameSite settings

## Future Enhancements

- [ ] Add 2FA support
- [ ] Implement session management UI
- [ ] Add device tracking (user agent, IP)
- [ ] Email verification for new accounts
- [ ] Password reset flow (for future email/password auth)
- [ ] Rate limiting per user
- [ ] Anomaly detection (unusual login locations)

---

**Last Updated**: 2024-10-09



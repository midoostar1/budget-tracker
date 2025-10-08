# Project Structure

Complete file structure of the mobile authentication system.

```
mobile-auth-system/
│
├── mobile/                          # Expo React Native App
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts         # Firebase configuration
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Auth state management
│   │   ├── screens/
│   │   │   ├── WelcomeScreen.tsx   # Landing/welcome screen
│   │   │   ├── SignInScreen.tsx    # Social login screen
│   │   │   └── ProfileScreen.tsx   # User profile screen
│   │   ├── services/
│   │   │   ├── api.ts              # API client with interceptors
│   │   │   ├── googleAuth.ts       # Google Sign-In logic
│   │   │   ├── appleAuth.ts        # Apple Sign-In logic
│   │   │   └── facebookAuth.ts     # Facebook Sign-In logic
│   │   └── types/
│   │       └── env.d.ts            # Environment type definitions
│   ├── App.tsx                      # Main app component
│   ├── app.json                     # Expo configuration
│   ├── babel.config.js              # Babel configuration
│   ├── metro.config.js              # Metro bundler config
│   ├── tsconfig.json                # TypeScript configuration
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment variables template
│   └── .gitignore                   # Git ignore rules
│
├── backend/                         # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.ts   # Auth endpoints logic
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT verification middleware
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── models/
│   │   │   ├── User.ts             # User schema
│   │   │   ├── AccountProvider.ts  # OAuth provider links
│   │   │   └── RefreshToken.ts     # Refresh token storage
│   │   ├── routes/
│   │   │   ├── auth.ts             # Auth routes
│   │   │   └── protected.ts        # Protected API routes
│   │   ├── services/
│   │   │   └── providerVerification.ts  # Token verification
│   │   ├── types/
│   │   │   └── environment.d.ts    # Environment types
│   │   ├── utils/
│   │   │   └── jwt.ts              # JWT utilities
│   │   └── index.ts                # Server entry point
│   ├── tsconfig.json                # TypeScript configuration
│   ├── package.json                 # Dependencies
│   ├── .env.example                 # Environment template
│   └── .gitignore                   # Git ignore rules
│
├── README.md                        # Main documentation
├── SETUP_GUIDE.md                   # Step-by-step setup guide
├── PROJECT_STRUCTURE.md             # This file
└── .gitignore                       # Root git ignore

```

## Key Files Explained

### Mobile App

#### App.tsx
- Main application entry point
- Sets up navigation based on auth state
- Wraps app with AuthProvider

#### AuthContext.tsx
- Global auth state management
- Handles login/logout for all providers
- Manages token storage
- Auto-loads user on app start

#### Screens
- **WelcomeScreen**: First screen with "Get Started" button
- **SignInScreen**: Shows social login buttons (Google, Apple, Facebook)
- **ProfileScreen**: Displays user info and logout option

#### Services
- **api.ts**: Axios client with auto token refresh
- **googleAuth.ts**: Google Sign-In implementation
- **appleAuth.ts**: Apple Sign-In implementation  
- **facebookAuth.ts**: Facebook Sign-In implementation

### Backend

#### index.ts
- Express server setup
- MongoDB connection
- Middleware configuration
- Route mounting

#### Controllers
- **authController.ts**: 
  - socialLogin: Verifies provider tokens, creates/links users
  - refreshAccessToken: Issues new access tokens
  - logout: Invalidates refresh tokens

#### Models
- **User**: Stores user profile data
- **AccountProvider**: Links users to OAuth providers
- **RefreshToken**: Manages refresh token lifecycle

#### Middleware
- **auth.ts**: Verifies JWT tokens, attaches user to request
- **errorHandler.ts**: Global error handling

#### Services
- **providerVerification.ts**: 
  - Verifies Google ID tokens
  - Verifies Apple identity tokens
  - Verifies Facebook access tokens

#### Routes
- **auth.ts**: 
  - POST /auth/social/login
  - POST /auth/refresh
  - POST /auth/logout
- **protected.ts**: 
  - GET /api/profile (requires auth)
  - PUT /api/profile (requires auth)
  - GET /api/data (example protected route)

## Data Flow

### Login Flow

1. User taps social login button in app
2. Native SDK handles OAuth flow
3. App receives provider token
4. App sends token to `/auth/social/login`
5. Backend verifies token with provider
6. Backend creates/updates User and AccountProvider
7. Backend generates JWT access + refresh tokens
8. Backend returns access token + user data
9. App stores tokens and updates auth state

### API Request Flow

1. App attaches access token to request header
2. Backend middleware verifies token
3. If valid, request proceeds to route handler
4. If expired, app uses refresh token
5. App gets new access token
6. App retries original request

### Token Refresh Flow

1. API request fails with 401
2. Interceptor catches error
3. Calls `/auth/refresh` with refresh token cookie
4. Backend verifies refresh token
5. Backend issues new access token
6. App retries original request with new token

## Security Features

- **JWT Access Tokens**: Short-lived (15 min), stored in memory
- **Refresh Tokens**: Long-lived (7 days), HTTP-only cookies
- **Token Verification**: All provider tokens verified server-side
- **Database Validation**: User existence checked on each request
- **Automatic Cleanup**: Expired tokens removed via TTL index
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: Security headers

## Environment Variables

### Mobile (.env)
- API_URL: Backend server URL
- Firebase config (6 variables)
- Google Client IDs (3 for iOS/Android/Web)
- Facebook App ID
- Bundle identifiers

### Backend (.env)
- Server config (PORT, NODE_ENV)
- MongoDB URI
- JWT secrets (2) and expiry times
- Google OAuth credentials
- Apple Sign-In config (4 variables)
- Facebook credentials
- CORS origins

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId
  email: string (unique)
  name?: string
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
}
```

### AccountProvider Collection
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  provider: 'google' | 'apple' | 'facebook'
  providerId: string (unique per provider)
  accessToken?: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}
```

### RefreshToken Collection
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  token: string (unique)
  expiresAt: Date (TTL index)
  createdAt: Date
}
```

## API Endpoints Summary

### Public Endpoints
- `POST /auth/social/login` - Social provider authentication
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (clear refresh token)
- `GET /health` - Health check

### Protected Endpoints (require JWT)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/data` - Example protected data

## Development Workflow

1. Start MongoDB
2. Start backend: `cd backend && npm run dev`
3. Start mobile: `cd mobile && npm start`
4. Choose platform (iOS/Android/Web)
5. Test authentication flows
6. Check MongoDB for data persistence
7. Monitor console logs for errors

## Testing Checklist

- [ ] Welcome screen loads
- [ ] Sign in screen shows all buttons
- [ ] Google Sign-In works
- [ ] Apple Sign-In works (iOS only)
- [ ] Facebook Sign-In works
- [ ] Profile screen shows user data
- [ ] Logout works
- [ ] Token refresh works automatically
- [ ] App persists auth state on reload
- [ ] Protected routes require authentication

## Deployment Considerations

### Mobile App
- Build with EAS Build or classic Expo build
- Configure production Firebase
- Update bundle identifiers
- Submit to App Store and Google Play
- Set up OTA updates with `expo publish`

### Backend
- Deploy to cloud provider (Railway, Render, etc.)
- Use MongoDB Atlas for database
- Set all environment variables
- Enable HTTPS
- Add rate limiting
- Set up monitoring and logging
- Configure production CORS

## Next Steps

1. Customize UI/UX
2. Add analytics
3. Implement error tracking (Sentry)
4. Add unit and integration tests
5. Set up CI/CD pipelines
6. Add more features (password reset, email verification, etc.)
7. Optimize performance
8. Prepare for production launch

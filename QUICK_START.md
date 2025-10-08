# Quick Start Commands

Get up and running in minutes!

## 🚀 Fast Setup (Already Have Accounts)

If you already have Google, Apple, and Facebook developer accounts configured:

### 1. Generate JWT Secrets
```bash
cd backend
node scripts/generate-jwt-secrets.js
```

### 2. Configure Environment Files

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

**Mobile** (`mobile/.env`):
```bash
cp mobile/.env.example mobile/.env
# Edit mobile/.env with your credentials
```

### 3. Install & Run

```bash
# Terminal 1 - MongoDB (if local)
mongod

# Terminal 2 - Backend
cd backend
npm install
npm run dev

# Terminal 3 - Mobile
cd mobile
npm install
npm start
```

## 📋 First Time Setup

Don't have accounts yet? Follow this order:

### 1. Install Prerequisites
```bash
# Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Expo CLI
npm install -g expo-cli

# MongoDB (choose one)
# Option A: Local installation
brew install mongodb-community  # macOS
# Option B: MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas
```

### 2. Create Provider Accounts

1. **Google/Firebase**: https://console.firebase.google.com/
   - Create project
   - Enable Google Authentication
   - Add iOS and Android apps
   - Download config files

2. **Apple** (iOS required): https://developer.apple.com/
   - Requires paid account ($99/year)
   - Create App ID
   - Create Service ID
   - Create Key (.p8 file)

3. **Facebook**: https://developers.facebook.com/
   - Create app
   - Add Facebook Login
   - Configure iOS and Android platforms

### 3. Follow Full Setup Guide

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## 🧪 Verify Installation

### Backend Health Check
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Run API Tests
```bash
cd backend
./scripts/test-api.sh
```

### Mobile App
1. Start with `npm start`
2. Press `i` for iOS or `a` for Android
3. App should load Welcome screen

## 🔑 Essential Commands

### Backend

```bash
cd backend

# Development
npm run dev              # Start with hot reload

# Production
npm run build           # Compile TypeScript
npm start              # Run compiled code

# Utilities
npm run lint           # Check code quality
npm run type-check     # TypeScript validation
node scripts/generate-jwt-secrets.js  # Generate JWT secrets
```

### Mobile

```bash
cd mobile

# Development
npm start              # Start Expo
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser

# Utilities
npm run lint          # Check code quality
npm run type-check    # TypeScript validation
```

### Database

```bash
# Local MongoDB
mongod                           # Start MongoDB
mongo                           # Open MongoDB shell
use mobile-auth                # Switch to database
db.users.find().pretty()      # View users

# MongoDB Atlas (cloud)
# Use MongoDB Compass or web interface
```

## 🐛 Quick Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 3000
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
```

**MongoDB connection failed:**
```bash
# Check MongoDB is running
ps aux | grep mongod
# Or start it
mongod --dbpath /usr/local/var/mongodb
```

**Module not found:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Mobile Issues

**Expo won't start:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
expo start --clear
```

**Can't connect to backend from device:**
```bash
# Update mobile/.env with your computer's local IP
# Find your IP:
ipconfig getifaddr en0  # macOS
ip addr show           # Linux
ipconfig              # Windows

# Update API_URL in mobile/.env:
API_URL=http://192.168.1.xxx:3000
```

**Pods error (iOS):**
```bash
cd mobile/ios
pod install
cd ..
npm run ios
```

### Provider Issues

**Google Sign-In fails:**
- Check `google-services.json` exists in `mobile/`
- Verify SHA-1 certificate in Firebase (Android)
- Confirm Web Client ID in backend `.env`

**Apple Sign-In not showing:**
- iOS 13+ required (simulator or real device)
- Check `usesAppleSignIn: true` in `app.json`
- Verify bundle ID matches App ID

**Facebook Login fails:**
- Confirm App ID in both `.env` files
- Check key hash in Facebook Console (Android)
- Verify platform configurations

## 📱 Test Flow

1. **Welcome Screen** → Tap "Get Started"
2. **Sign In Screen** → Choose a provider
3. Complete provider OAuth flow
4. **Profile Screen** → See user info
5. Tap "Logout" → Return to Welcome

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for backend
- [ ] Configure production CORS origins
- [ ] Use MongoDB Atlas or secured MongoDB
- [ ] Enable rate limiting
- [ ] Add monitoring (Sentry, DataDog, etc.)
- [ ] Remove all `console.log` statements
- [ ] Validate all environment variables
- [ ] Test on real devices (iOS and Android)

## 📚 Documentation Index

- **[README.md](README.md)** - Main documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code organization
- **[QUICK_START.md](QUICK_START.md)** - This file

## 🆘 Getting Help

1. Check error messages in console
2. Review environment variables
3. Verify provider configurations
4. Check [troubleshooting](#-quick-troubleshooting) section
5. Review provider documentation:
   - [Firebase](https://firebase.google.com/docs)
   - [Apple](https://developer.apple.com/documentation/sign_in_with_apple)
   - [Facebook](https://developers.facebook.com/docs/facebook-login)

## 🎯 Next Steps

After successful setup:

1. **Customize UI** - Update colors, fonts, layouts
2. **Add Features** - Password reset, email verification
3. **Analytics** - Firebase Analytics, Mixpanel
4. **Error Tracking** - Sentry integration
5. **Testing** - Unit tests, E2E tests
6. **Deployment** - Production servers, app stores

## ⚡ Pro Tips

- Use `npx expo start --clear` to clear cache
- Keep provider tokens in backend `.env` only
- Test on real devices before deploying
- Enable Expo OTA updates for quick fixes
- Use environment-specific `.env` files
- Set up CI/CD early in development
- Monitor token expiration in production
- Implement graceful error handling
- Add logging for debugging

Happy coding! 🚀

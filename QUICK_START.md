# Budget Tracker - Quick Start Guide

## ⚡ **Get Running in 30 Minutes**

Minimal configuration to see the app working.

---

## 🎯 **What You'll Get**

After this quick start:
- ✅ Backend API running
- ✅ Database connected
- ✅ Mobile app on emulator/device
- ✅ Can navigate and see UI
- ⚠️ Social login won't work yet (needs OAuth)

---

## 📋 **Prerequisites**

- Node.js 20+ installed
- Docker Desktop installed (for database)
- Android Studio or Xcode (for mobile testing)

---

## 🚀 **Step-by-Step (30 Minutes)**

### **Step 1: Start Database** (2 min)

```bash
cd server
docker-compose up -d postgres

# Wait for PostgreSQL to start (30 seconds)
```

---

### **Step 2: Configure Backend** (3 min)

```bash
# Create .env file
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker?schema=public"
JWT_SECRET="change-this-to-a-random-64-character-string-for-production"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="*"
ENVEOF

# Install dependencies (if not already)
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migration
npm run prisma:migrate
# When prompted for migration name, enter: initial_setup
```

---

### **Step 3: Start Backend** (1 min)

```bash
npm run dev

# You should see:
# 🚀 Server running on port 3000
# 📝 Environment: development
# 🔗 Health check: http://localhost:3000/health
```

**Test it:**
```bash
# In a new terminal
curl http://localhost:3000/health

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   ...
# }
```

✅ **Backend is running!**

---

### **Step 4: Configure Mobile** (5 min)

```bash
cd ../app

# Update app.json with API URL
# Edit the file or use this command:

# For Android emulator:
cat > temp_config.json << 'CONFIGEOF'
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://10.0.2.2:3000"
    }
  }
}
CONFIGEOF

# Merge with existing app.json manually, or just remember:
# - Android emulator: http://10.0.2.2:3000
# - iOS simulator: http://localhost:3000
# - Physical device: http://YOUR_COMPUTER_IP:3000
```

**Edit app/app.json:**
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://10.0.2.2:3000"
    }
  }
}
```

---

### **Step 5: Start Mobile App** (2 min)

```bash
# Install dependencies (if not already)
npm install

# Start Expo
npm start

# Choose your platform:
# Press 'a' for Android
# Press 'i' for iOS (Mac only)
# Press 'w' for web
```

✅ **Mobile app is running!**

---

## 🎨 **What You Can Test**

### **Without OAuth Configuration**

✅ App launches successfully  
✅ See login screen (buttons won't work yet)  
✅ Navigate between tabs (shows login redirect)  
✅ View all UI components  
✅ Test animations  
✅ See Settings screen  
✅ Read Privacy Policy  
✅ Read Terms of Service  
✅ View Paywall modal  

---

### **To Enable Login**

You need **Google OAuth Client IDs**:

**Quick Config (10 min):**

1. Go to: https://console.cloud.google.com
2. Create project: "Budget Tracker"
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID:
   - Web: Get Client ID
   - Android: Get Client ID (need SHA-1 fingerprint)
   - iOS: Get Client ID

5. Update backend .env:
   ```bash
   GOOGLE_WEB_CLIENT_ID="123-abc.apps.googleusercontent.com"
   GOOGLE_ANDROID_CLIENT_ID="123-android.apps.googleusercontent.com"
   GOOGLE_IOS_CLIENT_ID="123-ios.apps.googleusercontent.com"
   ```

6. Update app/app.json:
   ```json
   "extra": {
     "googleWebClientId": "123-abc.apps.googleusercontent.com",
     "googleAndroidClientId": "123-android.apps.googleusercontent.com",
     "googleIosClientId": "123-ios.apps.googleusercontent.com"
   }
   ```

7. Restart both backend and mobile app

✅ **Login now works!**

---

## 🐛 **Common Issues**

### **Backend: "Can't reach database"**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not, start it
cd server && docker-compose up -d postgres

# Wait 30 seconds, then try again
```

---

### **Backend: "Environment validation failed"**

```bash
# Ensure .env file exists
cd server && ls -la .env

# Check it has required variables
cat .env | grep DATABASE_URL
cat .env | grep JWT_SECRET

# If missing, copy from example
cp .env.example .env
# Edit and fill in values
```

---

### **Mobile: "Cannot connect to backend"**

**Android Emulator:**
```json
"apiBaseUrl": "http://10.0.2.2:3000"  // NOT localhost
```

**iOS Simulator:**
```json
"apiBaseUrl": "http://localhost:3000"
```

**Physical Device:**
```bash
# Find your computer's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Use that IP
"apiBaseUrl": "http://192.168.1.XXX:3000"
```

---

### **Mobile: "Native module errors"**

**In Expo Go** (Expected):
- Social auth won't work
- Push notifications limited
- These are Expo Go limitations

**Solution:**
```bash
# Build development client
eas build --profile development --platform android
# Install APK on device
```

---

## ✅ **Success Criteria**

After quick start, you should have:

✅ Backend running on http://localhost:3000  
✅ Database connected and migrated  
✅ Mobile app running on emulator/simulator  
✅ Can navigate between screens  
✅ Can see all UI  
✅ Health endpoint returns "healthy"  

---

## 🎯 **Next Steps**

1. **Configure OAuth** (10-20 min)
   - See: `CONFIGURATION_CHECKLIST.md`
   - Minimum: Just Google

2. **Test Login** (5 min)
   - Build development client OR
   - Use configured OAuth in Expo Go (limited)

3. **Add Services** (30-60 min)
   - Firebase (push notifications)
   - GCS (receipt storage)
   - Veryfi (OCR processing)

4. **Deploy** (20-30 min)
   - Backend to Cloud Run
   - Mobile to EAS

---

## 📚 **Full Documentation**

- **Configuration**: `CONFIGURATION_CHECKLIST.md` (this was just created)
- **OAuth Setup**: `app/SOCIAL_AUTH_SETUP.md`
- **Deployment**: `server/GCP_DEPLOYMENT_GUIDE.md`
- **Testing**: `ANDROID_TESTING_GUIDE.md`

---

**Ready to start? Begin with Step 1!** 🚀


# Budget Tracker - How to Sign In

## 🔐 **Step-by-Step Sign In Guide**

Your app is running on the emulator. Here's how to sign in:

---

## 📱 **Method 1: Sign In with Google (Recommended)**

### **Step 1: Open the App**
- Look at your Android emulator
- The Budget Tracker app should be open
- You should see the Login screen with 3 buttons

### **Step 2: Tap "Sign in with Google"**
- Tap the blue Google button (top button)
- Wait for Google sign-in dialog

### **Step 3: Select Your Google Account**
Two scenarios:

**Scenario A: If Google Account Picker Appears**
- You'll see a list of Google accounts
- Select the account you want to use
- Tap "Allow" or "Continue"
- ✅ You're signed in!

**Scenario B: If No Accounts Configured**
You need to add a Google account to your emulator:

1. **Open Settings on emulator**
   - Swipe down from top
   - Tap the gear icon
   - OR open Settings app

2. **Add Google Account**
   - Settings → Passwords & accounts
   - Tap "Add account"
   - Select "Google"
   - Sign in with your Google account
   - Complete 2FA if prompted

3. **Return to Budget Tracker**
   - Open Budget Tracker app again
   - Tap "Sign in with Google"
   - Select your account
   - ✅ You're signed in!

---

## 🎯 **What Happens When You Sign In**

```
1. You tap "Sign in with Google"
   ↓
2. Google OAuth screen appears
   ↓
3. You select your Google account
   ↓
4. Google returns an ID token
   ↓
5. App sends token to production backend:
   POST https://budget-api-swpx3wltjq-uc.a.run.app/api/auth/social-login
   ↓
6. Backend validates token with Google
   ↓
7. Backend creates/updates user in database
   ↓
8. Backend returns JWT access token
   ↓
9. App saves token to SecureStore
   ↓
10. App navigates to Dashboard
   ↓
✅ YOU'RE SIGNED IN!
```

---

## 🐛 **Troubleshooting**

### **Issue 1: "Sign in with Google" button does nothing**

**Check:**
```bash
# On emulator, check logs
adb logcat | grep -i google

# OR check Metro bundler terminal
# Look for error messages
```

**Solution:**
- Make sure you're using the **development APK** (not Expo Go)
- Verify Google account is configured on emulator
- Check if app is connected to internet

---

### **Issue 2: "No account found" or blank screen**

**Solution:**
Add a Google account to your emulator:

1. Open Settings app on emulator
2. Passwords & accounts → Add account
3. Select Google
4. Sign in with your credentials
5. Return to Budget Tracker and try again

---

### **Issue 3: "Authentication failed" error**

**Possible causes:**
- Internet connection issue
- Backend not reachable
- OAuth client ID mismatch

**Debug:**
```bash
# Test backend is reachable
curl https://budget-api-swpx3wltjq-uc.a.run.app/health

# Should return: ok

# Check app logs
adb logcat | grep -E "AUTH|Login|OAuth"
```

---

### **Issue 4: App crashes on sign in**

**Check logs:**
```bash
# View crash logs
adb logcat *:E | grep -A 20 "FATAL"

# OR in Metro bundler terminal, look for error stack trace
```

**Common fix:**
```bash
# Rebuild app
cd app
npx expo run:android --variant debug
```

---

## 🎯 **Quick Test Checklist**

Before signing in, verify:

- [ ] App is open on emulator
- [ ] You see the Login screen
- [ ] Three sign-in buttons are visible (Google, Apple, Facebook)
- [ ] Emulator has internet connection
- [ ] Google account is configured on emulator

Then:

- [ ] Tap "Sign in with Google"
- [ ] Google account picker appears
- [ ] Select account
- [ ] App navigates to Dashboard
- [ ] ✅ You're signed in!

---

## 🔍 **Verify Sign In Worked**

### **In the App:**
- Dashboard shows your name
- Transactions tab is accessible
- Settings shows "Free" tier
- No login screen appears

### **In the Database:**
```bash
cd server
npx prisma studio
# Opens http://localhost:5556

# Check User table:
# - Should see your Google email
# - provider: 'google'
# - firstName and lastName
# - createdAt timestamp
```

### **Test Creating Data:**
```
1. Go to Transactions tab
2. Tap + button
3. Add transaction: $10, Expense, Food, Lunch
4. Tap Submit
5. ✅ Transaction appears in list
6. Check Prisma Studio → See it in Transaction table!
```

---

## 🚀 **Alternative: Test Without Google Sign In**

If you want to test the app without Google OAuth:

### **Create Test User in Database**

```bash
cd server
npx prisma studio
# Opens http://localhost:5556

# In User table:
1. Click "Add record"
2. Fill in:
   - id: (auto-generated UUID)
   - email: "test@example.com"
   - provider: "google"
   - providerId: "test-123"
   - firstName: "Test"
   - lastName: "User"
3. Click "Save 1 change"
```

### **Get JWT Token**

```bash
cd server
node -e "
const jwt = require('jsonwebtoken');
const userId = 'YOUR_USER_ID_FROM_PRISMA_STUDIO';
const token = jwt.sign(
  { userId: userId, email: 'test@example.com' },
  'cXk9PGRvZmF3ZWZhd2VmYXdlZmF3ZWZhd2VmYXdlZmF3ZWZhd2VmYXdlZjEyMzQ1Njc4OTA=',
  { expiresIn: '7d' }
);
console.log('Token:', token);
"
```

### **Manually Set Token in App**

This is advanced - but you could add a temporary "Dev Login" button that sets this token.

---

## ✅ **Expected Sign In Flow**

### **Success:**
```
Tap "Sign in with Google"
   ↓
Google account picker
   ↓
Select account
   ↓
App navigates to Dashboard
   ↓
✅ Shows: "Welcome, [Your Name]!"
```

### **If It Fails:**
Check:
1. Google account on emulator?
2. Internet connection?
3. Backend reachable? `curl https://budget-api-swpx3wltjq-uc.a.run.app/health`
4. App logs for errors

---

## 🎯 **After Sign In**

Once signed in, you can:

1. **View Dashboard**
   - See welcome message
   - View account summary

2. **Create Transactions**
   - Tap Transactions tab
   - Tap + button
   - Add details
   - ✅ Saves to production database

3. **Scan Receipts**
   - Tap Receipts tab
   - Tap Scan button
   - ✅ Camera opens
   - Take photo
   - ✅ Uploads to backend

4. **Check Settings**
   - View subscription tier
   - See usage (receipts uploaded)
   - Test paywall

5. **Verify in Database**
   ```bash
   npx prisma studio
   ```
   - See your user
   - See your transactions
   - All in real-time!

---

## 🎊 **You're Ready!**

**Just tap "Sign in with Google" on your emulator and you're in!**

Everything is connected to production - your data will be real! 🚀

See `FINAL_STATUS.md` for complete testing guide.

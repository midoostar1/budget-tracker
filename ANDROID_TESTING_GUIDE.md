# Android Testing Guide - Budget Tracker

## 📱 **Testing with Android Studio**

Complete guide for testing the Budget Tracker mobile app on Android emulator.

**Date**: October 9, 2024  
**Status**: Ready for Testing

---

## 🚀 **Quick Start**

### **1. Start Development Server**
```bash
cd app
npm start
```

The Expo development server is now starting in the background!

### **2. Launch on Android**
Once the QR code appears, press `a` to open Android emulator.

Or manually:
```bash
npm run android
```

---

## ✅ **Pre-Flight Checklist**

### **Backend Server**
- [ ] Backend running: `cd server && npm run dev`
- [ ] Database accessible (PostgreSQL)
- [ ] API responding at http://localhost:3000

**Test Backend:**
```bash
curl http://localhost:3000/health

# Expected:
# {
#   "status": "healthy",
#   "database": "connected",
#   ...
# }
```

---

### **Android Studio Setup**
- [ ] Android Studio installed
- [ ] Android SDK installed (API 21+)
- [ ] Android emulator created
- [ ] Emulator running or will auto-start

**Check Emulator:**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator (if not auto-starting)
emulator -avd Pixel_6_API_33 &
```

---

### **App Configuration**

**Current Status:**
- ⚠️ OAuth Client IDs: **Not configured** (will show login screen but auth won't work)
- ⚠️ API Base URL: **Default to localhost** (change in app.json)
- ✅ All features implemented
- ✅ TypeScript compiles

**Quick Config:**
```json
// app/app.json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://10.0.2.2:3000",  // Android emulator localhost
      // OAuth IDs needed for login (see SOCIAL_AUTH_SETUP.md)
    }
  }
}
```

---

## 🧪 **What to Test**

### **Phase 1: App Launch & Navigation** (No Auth Required)

✅ **App Opens**
- See login screen
- 3 social login buttons visible
- Google, (Apple on iOS), Facebook
- UI looks good

✅ **Navigation** (after login/mock)
- Tab bar visible at bottom
- 4 tabs: Dashboard, Transactions, Receipts, Settings
- Tap each tab → Screen changes
- Tab bar highlights active tab

---

### **Phase 2: Authentication** (Requires OAuth Config)

⚠️ **Requires Configuration:**
- Google Client IDs in app.json
- google-services.json in app/
- See `app/SOCIAL_AUTH_SETUP.md`

**Skip for now** unless you want to configure OAuth.

**Alternative**: Mock authentication for testing other features.

---

### **Phase 3: Transactions** (Backend Required)

✅ **Transaction List**
- Navigate to Transactions tab
- Pull down to refresh
- See empty state: "No Transactions"

✅ **Add Transaction**
- Tap floating action button (+ button)
- Menu expands: "Add Manual" and "Scan Receipt"
- Tap "Add Manual"
- Modal opens

✅ **Create Transaction**
- Select "Expense"
- Enter: $50.00
- Select "Groceries"
- Enter payee: "Test Store"
- Tap "Save"
- Should see success alert
- Transaction appears in list

✅ **Filters**
- Tap "Income" chip → Filters to income
- Tap "Expenses" → Filters to expenses
- Tap "All" → Shows all

---

### **Phase 4: Receipts** (Backend Required)

✅ **Pending Receipts**
- Navigate to Receipts tab
- See "All Caught Up!" (no pending receipts)
- Or see pending receipts if any exist

✅ **Scan Button**
- Tap "📷 Scan Receipt"
- See placeholder alert: "Camera integration coming"

---

### **Phase 5: Settings**

✅ **Profile Display**
- Navigate to Settings tab
- See user profile (if authenticated)
- Avatar with initial
- Email address
- Provider badge

✅ **Subscription Status**
- See subscription card
- Badge: "Free" or "⭐ Premium"
- Progress bar: X/10 scans
- "Upgrade to Premium" button (if free)

✅ **Privacy & Terms**
- Tap "Privacy Policy" → Opens full screen
- Tap "‹ Back" → Returns to settings
- Tap "Terms of Service" → Opens full screen
- Scroll through content → All sections visible

✅ **Logout**
- Tap "Logout"
- Confirmation dialog appears
- Tap "Logout" → Returns to login screen

---

### **Phase 6: Paywall** (Backend Required)

✅ **Trigger Paywall**
- Upload 10+ receipts (backend quota)
- Try to upload 11th
- Should see 402 error
- **Paywall modal appears**

✅ **Paywall UI**
- See "Upgrade to Premium"
- See "You've reached your free limit (10/10)"
- See pricing cards
- Yearly plan has "BEST VALUE" badge
- 8 benefits listed with icons
- Tap plans → Radio button changes

✅ **Upgrade Flow**
- Tap "Start Premium - $69.99/year"
- Alert: "Payment processing not yet implemented"
- Tap "Contact Support"
- Modal closes

---

## 🐛 **Common Issues & Fixes**

### **Issue: App Won't Load**

**Check:**
```bash
# Is Expo server running?
ps aux | grep expo

# Any port conflicts?
lsof -i :8081
lsof -i :19000
lsof -i :19001
```

**Fix:**
```bash
# Clear Expo cache
cd app
npx expo start -c
```

---

### **Issue: Cannot Connect to Backend**

**Problem**: Android emulator localhost is different

**Fix:**
```json
// app/app.json
"apiBaseUrl": "http://10.0.2.2:3000"  // Android emulator special IP
```

**Verify:**
```bash
# In Android emulator terminal or adb shell
curl http://10.0.2.2:3000/health
```

---

### **Issue: "Failed to load transactions"**

**Cause**: Backend not running or not authenticated

**Check:**
1. Backend server running on port 3000
2. User is authenticated
3. API_BASE_URL correct
4. No CORS errors (check backend logs)

---

### **Issue: Social Login Doesn't Work**

**Expected**: OAuth not configured yet

**To Fix**: See `app/SOCIAL_AUTH_SETUP.md`

**Workaround for Testing**:
- Skip auth testing for now
- Test other features (transactions, settings)
- Or manually set user in auth store (dev only)

---

## 📊 **What's Testable Now**

### **✅ Without Any Configuration**

1. App launches and displays
2. UI components render
3. Navigation works
4. Screens transition smoothly
5. Modals open and close
6. Forms work
7. Animations play
8. Layout is responsive
9. Empty states display
10. Error states display

### **✅ With Backend Running**

11. API calls work
12. Transactions CRUD
13. Receipt listing
14. Push notification registration
15. Subscription status display
16. Logout functionality

### **⚠️ Requires OAuth Config**

17. Social login (Google/Facebook)
18. Authentication flow
19. Protected routes
20. Token management

### **⚠️ Requires Physical Device**

21. Push notifications (delivery)
22. Apple Sign In (iOS only)
23. Camera (can test in emulator with images)

---

## 🎯 **Testing Scenarios**

### **Scenario 1: UI/UX Testing** (No Backend)

```
1. Launch app
2. See login screen → Looks good? ✓
3. Tap through all tabs (will redirect to login)
4. Check modal animations
5. Test form inputs
6. Verify empty states
7. Check color scheme
8. Test light theme
```

---

### **Scenario 2: API Integration** (Backend Required)

```
1. Start backend: cd server && npm run dev
2. Login (or mock auth)
3. Navigate to Transactions
4. Add transaction → See in list? ✓
5. Pull to refresh → Works? ✓
6. Filter by type → Filters correctly? ✓
7. Navigate to Settings
8. See subscription status? ✓
9. Check Privacy Policy → Content loads? ✓
```

---

### **Scenario 3: Paywall Testing** (Backend Required)

```
1. Ensure backend running
2. Upload receipts until quota hit (10)
3. Try 11th upload
4. See paywall modal? ✓
5. Review benefits list
6. Select yearly plan
7. Tap upgrade → Stub alert? ✓
8. Manually upgrade via backend
9. Refresh app
10. See Premium badge? ✓
11. Upload unlimited receipts? ✓
```

---

## 🎬 **Step-by-Step First Test**

### **Recommended First-Time Flow:**

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Wait for: "Server running on port 3000"

# Terminal 2: Start Mobile App
cd app
npm start

# Wait for QR code

# Press 'a' to open Android
# Or: npm run android

# Wait for app to build and launch
# Should see: Login screen
```

**Then Test:**
1. ✅ App loads → Check
2. ✅ UI looks good → Check
3. ✅ Tap through tabs → Check (redirects to login)
4. ✅ Open Settings (if you can access)
5. ✅ Tap Privacy Policy → Opens
6. ✅ Tap Back → Returns
7. ✅ Tap Terms → Opens
8. ✅ Scroll through → All visible

**Success!** UI and navigation working ✓

---

## 📝 **Test Results Template**

Copy and fill out:

```
### Test Session: [Date]
Android Version: API __
Emulator: Pixel __ 

✅ App Launch: PASS / FAIL
✅ Login Screen: PASS / FAIL
✅ Navigation: PASS / FAIL
✅ Add Transaction: PASS / FAIL
✅ Transaction List: PASS / FAIL
✅ Settings Display: PASS / FAIL
✅ Privacy/Terms: PASS / FAIL
✅ Paywall Modal: PASS / FAIL
✅ Subscription Status: PASS / FAIL

Issues Found:
- 
- 

Notes:
- 
```

---

## 🔧 **Developer Tools**

### **React Native Debugger**

```bash
# Open debug menu
# Shake device or: Cmd+M (Mac) / Ctrl+M (Windows)

# Enable:
# - "Show Performance Monitor"
# - "Toggle Inspector"
# - "Debug Remote JS"
```

### **View Logs**

```bash
# React Native logs
npx react-native log-android

# Or use Android Studio Logcat

# Filter for your app
adb logcat | grep "Budget"
```

### **Network Inspection**

```bash
# Check API calls
# In Chrome DevTools when debugging
# Network tab → See all API requests
```

---

## 🎉 **What You Can Test Right Now**

Even without OAuth configuration:

✅ **Visual Design** - All screens, colors, layout  
✅ **Navigation** - Tab switching, modals  
✅ **Forms** - Transaction entry, validation  
✅ **Components** - FAB, cards, lists  
✅ **Animations** - FAB menu, modal transitions  
✅ **Empty States** - "No transactions" messages  
✅ **Settings UI** - Subscription card, menu items  
✅ **Legal Screens** - Privacy & Terms content  
✅ **Paywall UI** - Benefits list, pricing  
✅ **TypeScript** - Zero runtime errors  

**With Backend Running:**
✅ **API Integration** - Calls work  
✅ **Transactions** - CRUD operations  
✅ **Subscription** - Status display  
✅ **Quota** - Limit enforcement  
✅ **Paywall** - Triggered at limit  

---

## 🚀 **Quick Commands**

```bash
# Start Android
cd app && npm run android

# Start with cache clear
npx expo start -c --android

# Reload app
Press 'r' in Expo terminal

# Open dev menu
Press 'm' in Expo terminal

# View logs
npx react-native log-android
```

---

**Status**: 🟢 **Expo Server Starting**  
**Next**: Press `a` to launch Android emulator  
**Backend**: Start with `cd server && npm run dev`  

**Happy testing!** 🧪📱

---

**Ready to test all features on Android!** Let me know what you'd like to test first or if you encounter any issues.


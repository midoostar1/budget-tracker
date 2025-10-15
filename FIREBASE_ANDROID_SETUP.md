# 🔥 Firebase Android App Setup Guide

## Quick Setup for Budget Tracker

### 📋 App Information

**Package Name:** `com.budgettracker.app`  
**App Name:** Budget Tracker  
**Project ID:** budget-tracker-474603

### 🔑 SHA-1 Certificates (Copy These!)

**Debug SHA-1:**
```
E0:46:FB:E5:9E:27:E7:E9:BF:62:D3:9C:21:29:58:7B:9A:13:AE:12
```

**Release SHA-1:**
```
16:EE:0A:15:EA:11:D5:18:BE:28:5B:3E:4C:4C:86:EC:A7:C2:05:A2
```

---

## 🚀 Step-by-Step Setup

### Step 1: Open Firebase Console

1. Go to: **https://console.firebase.google.com**
2. Sign in with your Google account

### Step 2: Select/Create Project

**Option A - If project exists:**
- Click on: **budget-tracker-474603**

**Option B - If creating new:**
- Click "Add project"
- Name: Budget Tracker
- Project ID: budget-tracker-474603 (if available)
- Accept terms → Continue
- Disable Google Analytics (optional)
- Click "Create project"

### Step 3: Add Android App

1. On project homepage, click the **Android icon** (robot)
   - Or: Click ⚙️ (Settings) → Project settings → Scroll down → Click "Add app" → Select Android

2. You'll see "Add Firebase to your Android app" page

### Step 4: Register Your App

Fill in the registration form:

**Android package name:** (REQUIRED)
```
com.budgettracker.app
```
⚠️ **CRITICAL:** Must match exactly! Copy/paste from above.

**App nickname:** (Optional but recommended)
```
Budget Tracker
```

**Debug signing certificate SHA-1:** (Optional but REQUIRED for Google Sign-In)
```
E0:46:FB:E5:9E:27:E7:E9:BF:62:D3:9C:21:29:58:7B:9A:13:AE:12
```

Click **"Register app"**

### Step 5: Download Configuration File

1. Click **"Download google-services.json"**
2. File will download to your Downloads folder
3. **Keep this file!** You'll need it in Step 8

Click "Next" → "Next" → "Continue to console"

### Step 6: Add Release SHA-1 Certificate

Now add the release certificate:

1. In Firebase Console, click ⚙️ (Settings) → **Project settings**
2. Scroll down to "Your apps" section
3. Find your Android app (com.budgettracker.app)
4. Look for "SHA certificate fingerprints" section
5. Click **"Add fingerprint"**
6. Paste the **Release SHA-1**:
   ```
   16:EE:0A:15:EA:11:D5:18:BE:28:5B:3E:4C:4C:86:EC:A7:C2:05:A2
   ```
7. Click **"Save"**

✅ Now you have BOTH debug and release certificates registered!

### Step 7: Enable Google Sign-In Authentication

1. In Firebase Console left menu, click **"Authentication"**
2. Click **"Get started"** (if first time)
3. Click **"Sign-in method"** tab at the top
4. Find **"Google"** in the list
5. Click on **"Google"**
6. Toggle the switch to **"Enable"**
7. Enter **Project support email** (your email)
8. Click **"Save"**

✅ Google Sign-In is now enabled!

### Step 8: Install google-services.json in Your App

**After you've downloaded google-services.json:**

Let me know and I'll help you move it to the correct location!

The file needs to go here:
```
/Users/midoostar1/Desktop/Budget tracker/app/android/app/google-services.json
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Android app registered with package name: `com.budgettracker.app`
- [ ] Debug SHA-1 added
- [ ] Release SHA-1 added  
- [ ] google-services.json downloaded
- [ ] google-services.json placed in: `app/android/app/`
- [ ] Google Sign-In enabled in Authentication
- [ ] Support email added

---

## 🔄 After Firebase Setup Complete

### Next Steps:

1. **Move google-services.json:**
   ```bash
   # I'll help you with this command once you download it:
   mv ~/Downloads/google-services.json /Users/midoostar1/Desktop/Budget\ tracker/app/android/app/
   ```

2. **Rebuild the app:**
   ```bash
   cd /Users/midoostar1/Desktop/Budget\ tracker/app/android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

3. **Test Google Sign-In:**
   - Install on emulator/device
   - Tap "Sign in with Google"
   - Should work! ✅

---

## 🐛 Troubleshooting

### "Package name mismatch" error
- Make sure you used exactly: `com.budgettracker.app`
- No spaces, no typos!

### "SHA-1 not registered" error
- Double-check you added BOTH SHA-1 certificates
- Wait 5 minutes for Firebase to propagate changes
- Rebuild the app

### "Download failed" for google-services.json
- Check Downloads folder
- Try downloading again from Project settings → Your apps

### Google Sign-In still not working
- Verify Google provider is Enabled in Authentication
- Check support email is set
- Wait a few minutes for changes to propagate
- Rebuild and reinstall app

---

## 📱 Important Notes

### For Development (Emulator/Testing):
- Use Debug SHA-1: `E0:46:FB:E5:9E:27:E7:E9:BF:62:D3:9C:21:29:58:7B:9A:13:AE:12`

### For Production (Play Store):
- Use Release SHA-1: `16:EE:0A:15:EA:11:D5:18:BE:28:5B:3E:4C:4C:86:EC:A7:C2:05:A2`
- Google Play will generate additional SHA-1 (add it when available)

### Security:
- Never commit google-services.json to public repositories
- Keep your keystores secure
- SHA-1 certificates are public, that's OK

---

## 🎯 Quick Reference

**Firebase Console:** https://console.firebase.google.com  
**Project:** budget-tracker-474603  
**Package:** com.budgettracker.app  
**Debug SHA-1:** E0:46:FB:E5:9E:27:E7:E9:BF:62:D3:9C:21:29:58:7B:9A:13:AE:12  
**Release SHA-1:** 16:EE:0A:15:EA:11:D5:18:BE:28:5B:3E:4C:4C:86:EC:A7:C2:05:A2

---

## 🆘 Need Help?

If you get stuck, just let me know which step you're on and I'll help!

**Once you download google-services.json, tell me and I'll:**
1. Move it to the correct location
2. Rebuild your app
3. Test Google Sign-In
4. Get you ready for Play Store! 🚀


# Transaction Management Mobile App

React Native mobile app for managing financial transactions, optimized for one-hand entry.

## Features

### 🚀 One-Hand Optimized
- Large, bottom-aligned number pad for easy thumb access
- Quick amount buttons for common transactions
- Horizontal category scrolling
- Large touch targets throughout

### 📱 Screens

1. **Transactions List**
   - View all transactions with category indicators
   - Search and filter
   - Pull to refresh
   - Swipe actions for quick delete

2. **Add Transaction**
   - Custom number pad optimized for one-hand use
   - Quick amount presets ($5, $10, $20, $50, $100)
   - Income/Expense toggle
   - Visual category picker
   - Description field

3. **Category Picker**
   - Grid view of all categories
   - Create new categories with custom colors and icons
   - Color picker with presets
   - Icon picker with common emojis

## Setup

### Prerequisites
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode and CocoaPods
- For Android: Android Studio

### Installation

```bash
cd mobile
npm install
```

### Configuration

Update the API URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://YOUR_API_URL:3000';
```

For local development:
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical device: Use your computer's local IP

## Running the App

### Start the development server:
```bash
npm start
```

### Run on iOS:
```bash
npm run ios
```

### Run on Android:
```bash
npm run android
```

### Run on Web:
```bash
npm run web
```

## One-Hand Optimization Features

### Design Principles
1. **Bottom-aligned controls**: Number pad and primary actions at the bottom
2. **Large touch targets**: Minimum 48x48dp for all interactive elements
3. **Thumb-zone optimization**: Most frequent actions within easy thumb reach
4. **Quick actions**: Preset amounts and categories reduce typing
5. **Horizontal scrolling**: Categories scroll horizontally to stay within thumb reach

### Usage Tips
- Use quick amount buttons for common transactions
- Swipe categories horizontally with your thumb
- Number pad is positioned for right-hand use (can be mirrored for left-hand)
- Pull down to refresh transaction list

## Tech Stack

- **React Native** with Expo
- **React Navigation** for routing
- **React Native Paper** for Material Design components
- **Axios** for API calls
- **Decimal.js** for precise decimal calculations
- **TypeScript** for type safety

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── TransactionsList.tsx
│   │   ├── AddTransaction.tsx
│   │   └── CategoryPicker.tsx
│   └── services/         # API services
│       └── api.ts
├── App.tsx              # Root component
├── app.json            # Expo configuration
└── package.json
```

## Customization

### Adding More Quick Amounts
Edit `QUICK_AMOUNTS` in `AddTransaction.tsx`:

```typescript
const QUICK_AMOUNTS = ['5', '10', '20', '50', '100', '200'];
```

### Adding More Category Icons
Edit `PRESET_ICONS` in `CategoryPicker.tsx`:

```typescript
const PRESET_ICONS = ['🍔', '🚗', '🛍️', ...];
```

### Changing Theme Colors
Edit the theme in `App.tsx`:

```typescript
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#YourPrimaryColor',
    secondary: '#YourSecondaryColor',
  },
};
```
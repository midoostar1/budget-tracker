# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- For mobile: iOS Simulator or Android Emulator (optional)

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Run tests to verify everything works
npm test

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`
View API docs at `http://localhost:3000/api-docs`

### 2. Mobile Setup (Optional)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Update API URL in src/services/api.ts
# For iOS Simulator: http://localhost:3000
# For Android Emulator: http://10.0.2.2:3000
# For physical device: http://YOUR_COMPUTER_IP:3000

# Start Expo
npm start

# Then press:
# - 'i' for iOS simulator
# - 'a' for Android emulator
# - 'w' for web browser
# - Or scan QR code with Expo Go app
```

## 🧪 Test the API

### Using the OpenAPI UI
1. Open `http://localhost:3000/api-docs`
2. Try out the endpoints directly in the browser

### Using curl

Create a transaction:
```bash
# First, get a category ID
curl http://localhost:3000/categories | jq '.[0].id'

# Create a transaction (replace CATEGORY_ID)
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "25.50",
    "description": "Coffee and breakfast",
    "categoryId": "CATEGORY_ID"
  }'
```

List transactions:
```bash
curl http://localhost:3000/transactions
```

## 📱 Mobile App Features

### Optimized for One-Hand Use:
- **Large number pad** at the bottom for easy thumb access
- **Quick amount buttons** ($5, $10, $20, $50, $100)
- **Horizontal category scroll** within thumb reach
- **70x70dp touch targets** for comfortable tapping

### Screens:
1. **Transactions List** - View and search all transactions
2. **Add Transaction** - Quick entry with number pad
3. **Category Picker** - Visual category selection

## 🎯 Key Features

### Backend
✅ REST API with full OpenAPI documentation
✅ Zod validation (amounts as strings → Decimal)
✅ Paginated transaction list
✅ CRUD operations for transactions
✅ Category management
✅ 43 passing unit tests

### Mobile
✅ One-hand optimized UI
✅ Quick transaction entry
✅ Visual category picker
✅ Real-time updates
✅ Pull-to-refresh

## 📊 Default Categories

The app comes with 8 pre-seeded categories:
- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Health
- 💰 Income
- 📦 Other

## 🔍 API Endpoints

All endpoints return JSON.

**Transactions:**
- `POST /transactions` - Create
- `GET /transactions?from&to&page&pageSize` - List (paginated)
- `PATCH /transactions/:id` - Update
- `DELETE /transactions/:id` - Delete

**Categories:**
- `GET /categories` - List all
- `POST /categories` - Create

## 💡 Tips

1. **One-hand entry speed**: Use quick amount buttons for common transactions
2. **Accuracy**: Amounts use Decimal.js for precise calculations
3. **Search**: Filter transactions by description in the mobile app
4. **Pagination**: Default is 20 items per page, max 100

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available: `lsof -i :3000`
- Try a different port: `PORT=3001 npm run dev`

### Tests failing
- Make sure dependencies are installed: `npm install`
- Clear Jest cache: `npx jest --clearCache`

### Mobile can't connect to API
- Use correct IP address for your setup
- Check that backend is running
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical device: `http://YOUR_COMPUTER_IP:3000`

### Mobile app shows blank screen
- Make sure all dependencies are installed: `cd mobile && npm install`
- Clear Expo cache: `expo start -c`

## 📚 Next Steps

1. Check out the [README.md](README.md) for full documentation
2. Read [IMPLEMENTATION.md](IMPLEMENTATION.md) for technical details
3. Explore the OpenAPI docs at `/api-docs`
4. Try the mobile app on your device

## 🔗 Useful Links

- Backend: `http://localhost:3000`
- API Docs: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

Happy coding! 🎉
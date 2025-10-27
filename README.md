# GasGuard

🏆 **Seedify Prediction Markets Hackathon Submission**
🔗 **Built on BNB Chain** | 📊 **Live on BSC Testnet**

> Competitive prediction market for multi-chain gas prices. Make predictions, earn accuracy scores, climb leaderboards - all on-chain!

🌐 **Live Demo:** https://gasguard.gen-a.dev
📜 **Smart Contract:** [BSC Testnet](./SMART_CONTRACT.md) - `0xA18F113ADC48B3823057ED892989320b5FD5C055`
🎥 **Demo Video:** [YouTube](YOUR_VIDEO_LINK)
🔍 **Contract Explorer:** https://testnet.bscscan.com/address/0xA18F113ADC48B3823057ED892989320b5FD5C055

---

## 🎯 Prediction Market Features

GasGuard transforms gas optimization into a competitive prediction market:

- **🎲 Make Predictions** - Predict gas prices 1-24 hours in advance across 6 blockchains
- **📊 Accuracy Scoring** - Automatic on-chain scoring (95%+ = perfect prediction)
- **🏆 Leaderboards** - Compete with other predictors on chain-specific leaderboards
- **🔥 Streak System** - Maintain prediction streaks for consecutive perfect predictions
- **⛓️ Multi-Chain** - Predict across Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, Base
- **💎 On-Chain** - All predictions recorded immutably on BNB Smart Chain
- **🎓 Educational** - No financial risk, skill-based learning
- **💰 Real Utility** - Actually save money on gas fees with accurate predictions

---

## 🚀 Why This Is a Prediction Market

Unlike traditional gas trackers, GasGuard is a **competitive prediction marketplace**:

1. **Users Make Predictions** - "BNB gas will be 0.03 Gwei in 2 hours"
2. **On-Chain Recording** - Smart contract stores predictions immutably
3. **Automated Resolution** - Oracle resolves predictions at deadline
4. **Accuracy Scoring** - Points awarded based on prediction accuracy
5. **Competitive Rankings** - Global leaderboard of top predictors
6. **Streak Rewards** - Incentivize consistent accuracy

**This is a prediction market for GAS PRICES** - a novel niche no one else is addressing!

---

## ✨ Additional Features

Beyond prediction markets:
- 🔗 MetaMask wallet integration
- 📊 Real-time gas price tracking across 8 chains
- 💰 Transaction cost analysis for DeFi actions (Swaps, NFTs, Bridging)
- 📈 Actual savings tracking from blockchain transactions
- 📱 Telegram alerts for optimal gas prices
- ⚙️ Customizable gas thresholds
- 💳 Pro subscriptions ($7.99/month with 14-day free trial)

---

## 💡 Market Opportunity

Gas fees are a **massive pain point** in crypto:
- **$10B+ spent annually** on Ethereum gas fees alone
- **Unpredictable costs** make DeFi inaccessible to many users
- **No existing prediction markets** specifically for gas prices
- **Users overpay** by 2-10x due to poor timing

GasGuard addresses this with a competitive, gamified approach that:
- **Educates users** on gas price patterns
- **Saves real money** through better transaction timing
- **Creates engagement** through leaderboards and streaks
- **Builds community** around gas optimization

---

## Tech Stack

**Smart Contracts:**
- Solidity 0.8.19
- **BNB Smart Chain Testnet** (deployed)
- Custom oracle for prediction resolution

**Backend:**
- Node.js + Express.js
- MongoDB Atlas for data persistence
- Oracle service for on-chain resolution
- Etherscan/BscScan APIs for multi-chain data
- Telegram Bot API for alerts
- Stripe Payments for subscriptions

**Frontend:**
- React + Vite
- Web3.js for wallet connection & smart contract interaction
- Axios for API calls
- React Router for navigation
- Responsive design for mobile/desktop

**Deployment:**
- CloudPanel VPS hosting
- MongoDB Atlas (cloud database)
- Let's Encrypt SSL
- PM2 process manager

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Etherscan API key
- Telegram bot token (optional)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gasguard
ETHERSCAN_API_KEY=your_key_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_BOT_USERNAME=YourBotUsername
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.development)
```env
VITE_API_URL=http://localhost:3001
```

---

## Deployment


**TL;DR:**
1. Set up MongoDB Atlas (free)
2. Deploy backend to VPS with CloudPanel
3. Build and upload frontend
4. Configure DNS and SSL
5. Set up Stripe webhooks

---

## API Endpoints

### Multi-Chain Gas Tracking
- `GET /api/multichain/chains` - Get supported chains
- `GET /api/multichain/gas/:chain` - Current gas prices for specific chain
- `GET /api/multichain/history/:chain` - Gas price history

### Prediction Market (Smart Contract Integration)
- `POST /api/predictions/make` - Make a new prediction (calls smart contract)
- `GET /api/predictions/user/:address` - Get user's predictions
- `GET /api/predictions/:id` - Get specific prediction details
- `GET /api/predictions/leaderboard/:chain` - Get chain leaderboard
- `POST /api/predictions/resolve` - Resolve prediction (oracle only)

### Legacy Gas Tracking
- `GET /api/gas/current` - Current Ethereum gas prices
- `GET /api/gas/predict` - Smart prediction
- `GET /api/gas/forecast` - Comprehensive 4hr forecast

### Transactions
- `GET /api/transactions/savings/:wallet` - Real blockchain savings data
- `POST /api/transactions/refresh/:wallet` - Force refresh cache

### Alerts
- `GET /api/alerts/status/:wallet` - Telegram alert settings
- `POST /api/alerts/threshold` - Update gas threshold

### Payments
- `POST /api/stripe/create-checkout-session` - Start subscription
- `GET /api/stripe/subscription-status/:wallet` - Check subscription
- `POST /api/stripe/webhook` - Stripe webhooks

---

## Project Structure
```
GasGuard/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express server
│   │   ├── database.js            # MongoDB connection
│   │   ├── gasTracker.js          # Real-time gas prices
│   │   ├── gasPricePredictor.js   # Smart forecasting
│   │   ├── transactionTracker.js  # Blockchain data
│   │   ├── telegramBot.js         # Telegram integration
│   │   ├── stripe.js              # Payments
│   │   └── models/
│   │       ├── User.js            # User schema
│   │       └── TransactionCache.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── GasDashboard.jsx
│   │   │   ├── SavingsTracker.jsx
│   │   │   ├── ForecastCard.jsx
│   │   │   ├── AlertSettings.jsx
│   │   │   └── Subscription.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Success.jsx
│   │   └── api/
│   │       └── gasApi.js
│   └── package.json
└── docs/
    (documentation files)
```

---

## 📸 Screenshots

### 1. Multi-Chain Gas Tracker
Real-time gas prices across 6 blockchains with accuracy indicators.

### 2. Prediction League Interface
Make predictions, view leaderboards, and track your accuracy stats.

### 3. Prediction History
See all your past predictions with accuracy scores and streak tracking.

### 4. Savings Tracker
Real transaction cost analysis showing how much you could have saved.

### 5. Pro Features
Advanced analytics, unlimited predictions, priority oracle resolution.

---

## 🏆 Hackathon Submission

**Seedify Prediction Markets Hackathon**

### What Makes This a Prediction Market?

GasGuard is NOT just a gas tracker - it's a **competitive prediction marketplace** where:

1. **Users stake their reputation** by making on-chain predictions
2. **Predictions are immutable** - recorded on BNB Chain
3. **Oracle resolves predictions** - automated, trustless resolution
4. **Leaderboards create competition** - social proof and gamification
5. **Accuracy determines ranking** - skill-based, not luck-based
6. **Real utility** - predictions actually help users save money

### Novel Aspects

- **First prediction market specifically for gas prices**
- **Multi-chain predictions** (6 chains supported)
- **Educational with real value** - learn patterns while saving money
- **No financial betting** - accessible to everyone
- **Streak mechanics** - incentivize consistent accuracy

### Technical Highlights

- ✅ Smart contract deployed on BSC Testnet
- ✅ Custom oracle for automated resolution
- ✅ Multi-chain gas price aggregation (8 chains)
- ✅ Real-time Etherscan API integration
- ✅ Full-stack Web3 integration (wallet, contract calls, events)
- ✅ Production-ready with revenue model ($7.99/month)

---

## Contributing

This is a hackathon project built as a solo submission. Feedback and suggestions are welcome!

---

## License

Proprietary - All rights reserved

---

## Support

**Live Demo:** https://gasguard.gen-a.dev
**Smart Contract:** https://testnet.bscscan.com/address/0xA18F113ADC48B3823057ED892989320b5FD5C055
**Documentation:** See [SMART_CONTRACT.md](./SMART_CONTRACT.md) for contract details

For technical issues:
- Check backend logs: `pm2 logs` or CloudPanel logs
- Check browser console for frontend errors
- Verify wallet is connected and on correct network

---
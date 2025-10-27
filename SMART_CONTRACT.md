# GasGuard Smart Contract

## Deployment

**Network:** BNB Smart Chain Testnet
**Contract Address:** `0xA18F113ADC48B3823057ED892989320b5FD5C055`
**Explorer:** https://testnet.bscscan.com/address/0xA18F113ADC48B3823057ED892989320b5FD5C055
**Compiler:** Solidity 0.8.19
**Deployed:** October 27, 2025

## Contract Overview

GasGuard Prediction League is an on-chain smart contract that enables users to make competitive predictions about future gas prices across multiple blockchains. Built on BNB Chain, it creates a skill-based prediction market for gas price forecasting.

### Key Features

- **Multi-chain predictions** - Predict gas prices for Ethereum, BNB Chain, Polygon, Arbitrum, Optimism, and Base
- **Time-based predictions** - 1h to 24h prediction windows
- **Accuracy scoring** - Automatic calculation of prediction accuracy (0-100 score)
- **Perfect prediction tracking** - 95%+ accuracy = perfect prediction
- **Leaderboards** - Chain-specific leaderboards for top predictors
- **Streak system** - Reward consistency with streak tracking
- **No betting** - Educational and competitive, no financial risk
- **Oracle-based resolution** - Automated resolution using off-chain oracle

---

## Contract Functions

### `makePrediction(uint256 _chainId, uint256 _targetTimestamp, uint256 _predictedMilliGwei)`
Make a gas price prediction for a specific chain and time.

**Parameters:**
- `_chainId`: Chain to predict for (1=ETH, 56=BSC, 137=Polygon, 42161=Arbitrum, 10=Optimism, 8453=Base)
- `_targetTimestamp`: Unix timestamp when prediction should be evaluated
- `_predictedMilliGwei`: Predicted gas price in milliGwei (0.001 Gwei units)

**Returns:** Prediction ID (uint256)

---

### `resolvePrediction(uint256 _predictionId, uint256 _actualMilliGwei)`
Oracle resolves a prediction with actual gas price data. **Only callable by oracle.**

---

### `getUserStats(address user)`
Get prediction statistics for a user.

**Returns:**
- `totalPredictions`: Number of predictions made
- `averageScore`: Average accuracy score (0-100)
- `perfectPredictions`: Number of 95%+ accurate predictions
- `currentStreak`: Current streak of perfect predictions
- `bestStreak`: Best streak achieved

---

### `getPrediction(uint256 predictionId)`
Get details of a specific prediction.

**Returns:** Full prediction data (predictor, chainId, timestamps, prices, score)

---

## Supported Chains

| Chain ID | Name | Symbol |
|----------|------|--------|
| 1 | Ethereum | ETH |
| 56 | BNB Chain | BNB |
| 137 | Polygon | MATIC |
| 42161 | Arbitrum | ETH |
| 10 | Optimism | ETH |
| 8453 | Base | ETH |

---

## Prediction Windows

- **Minimum:** 1 hour in the future
- **Maximum:** 24 hours in the future

---

## Scoring Algorithm

```solidity
Accuracy = 100 - (|predicted - actual| / actual * 100)

Examples:
- Predicted: 5 Gwei, Actual: 5 Gwei → 100% accuracy
- Predicted: 5 Gwei, Actual: 5.2 Gwei → 96% accuracy
- Predicted: 5 Gwei, Actual: 6 Gwei → 80% accuracy
```

**Perfect Prediction:** 95-100% accuracy = Streak continues
**All Other Predictions:** Streak resets

---

## Gas Price Format

All gas prices are stored in **milliGwei** (0.001 Gwei units):
- 1 Gwei = 1,000 milliGwei
- 3.5 Gwei = 3,500 milliGwei

This allows sub-Gwei precision for L2 chains (Arbitrum, Optimism, Base).

---

## Gas Costs (BSC Testnet)

| Operation | Estimated Gas | Cost (5 Gwei) |
|-----------|---------------|---------------|
| makePrediction | ~80,000 | ~0.0004 BNB |
| getUserStats | Free (view) | $0 |

---

## Security

- **No Reentrancy Risk:** No external calls or ETH transfers
- **Oracle-only Resolution:** Only designated oracle can resolve predictions
- **Validation Checks:** Time windows, chain support, price ranges
- **Immutable Predictions:** Cannot be modified after submission
- **No Financial Risk:** Educational/competitive only

---

## Testing

Deployed and tested on BSC Testnet with:
- ✅ Multiple predictions from different addresses
- ✅ Multi-chain predictions (ETH, BNB, Polygon, etc.)
- ✅ Time window validations
- ✅ Oracle resolution and accuracy scoring
- ✅ Streak tracking and leaderboard updates

---

## Future Enhancements

### Phase 1 (Post-Hackathon)
- Enhanced leaderboard (top 10 per chain)
- Global leaderboard (best overall predictors)
- More granular time windows

### Phase 2 (Mainnet)
- Deploy to BNB Chain mainnet
- Prize pools for top monthly predictors
- NFT badges for achievements
- Prediction market for other metrics

### Phase 3 (Advanced)
- Cross-chain oracle integration (Chainlink, Pyth)
- Governance token for platform decisions
- DAO-managed prize pools

---

## Resources

- **Contract Source:** `backend/contracts/GasPredictionLeague.sol`
- **Testnet Explorer:** https://testnet.bscscan.com/address/0xA18F113ADC48B3823057ED892989320b5FD5C055
- **Frontend Integration:** `frontend/src/contracts/GasPredictionLeague.js`
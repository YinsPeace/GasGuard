// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GasPredictionLeague
 * @dev Gas price prediction tracking across multiple EVM chains
 * No betting, just gamified predictions with leaderboard
 */
contract GasPredictionLeague {
    
    // Prediction structure
    struct Prediction {
        address predictor;
        uint256 chainId;        // 1=ETH, 56=BSC, 137=Polygon, etc.
        uint256 targetTimestamp;
        uint256 predictedMilliGwei;  // Predicted gas price in milliGwei (0.001 Gwei units)
        uint256 actualMilliGwei;     // Actual gas price in milliGwei (set by oracle)
        bool resolved;
        uint256 accuracyScore;  // 0-100 score based on accuracy
    }
    
    // User statistics
    struct UserStats {
        uint256 totalPredictions;
        uint256 totalScore;
        uint256 perfectPredictions; // Within 5% accuracy
        uint256 currentStreak;
        uint256 bestStreak;
    }
    
    // State variables
    mapping(uint256 => Prediction) public predictions;
    mapping(address => UserStats) public userStats;
    mapping(uint256 => address[]) public chainLeaderboard; // Top 10 per chain
    
    uint256 public predictionCount;
    address public oracle;
    uint256 public constant MAX_PREDICTION_WINDOW = 24 hours;
    uint256 public constant MIN_PREDICTION_WINDOW = 1 hours;
    
    // Events
    event PredictionMade(
        uint256 indexed predictionId,
        address indexed predictor,
        uint256 chainId,
        uint256 targetTimestamp,
        uint256 predictedMilliGwei
    );
    
    event PredictionResolved(
        uint256 indexed predictionId,
        uint256 actualMilliGwei,
        uint256 accuracyScore
    );
    
    event LeaderboardUpdated(uint256 chainId, address[] topPredictors);
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can resolve");
        _;
    }
    
    constructor() {
        oracle = msg.sender;
    }
    
    /**
     * @dev Make a gas price prediction
     * @param _chainId Chain to predict for (1=ETH, 56=BSC, etc.)
     * @param _targetTimestamp When the prediction is for
     * @param _predictedMilliGwei Predicted gas price in milliGwei (0.001 Gwei units)
     */
    function makePrediction(
        uint256 _chainId,
        uint256 _targetTimestamp,
        uint256 _predictedMilliGwei
    ) external returns (uint256) {
        // Validations
        require(_targetTimestamp > block.timestamp, "Must predict future");
        require(
            _targetTimestamp <= block.timestamp + MAX_PREDICTION_WINDOW,
            "Too far in future"
        );
        require(
            _targetTimestamp >= block.timestamp + MIN_PREDICTION_WINDOW,
            "Too soon"
        );
        require(_predictedMilliGwei > 0 && _predictedMilliGwei < 10000000, "Invalid gas price");
        require(isValidChain(_chainId), "Unsupported chain");
        
        // Create prediction
        predictionCount++;
        predictions[predictionCount] = Prediction({
            predictor: msg.sender,
            chainId: _chainId,
            targetTimestamp: _targetTimestamp,
            predictedMilliGwei: _predictedMilliGwei,
            actualMilliGwei: 0,
            resolved: false,
            accuracyScore: 0
        });
        
        // Update user stats
        userStats[msg.sender].totalPredictions++;
        
        emit PredictionMade(
            predictionCount,
            msg.sender,
            _chainId,
            _targetTimestamp,
            _predictedMilliGwei
        );
        
        return predictionCount;
    }
    
    /**
     * @dev Oracle resolves a prediction with actual gas price
     * @param _predictionId ID of the prediction to resolve
     * @param _actualMilliGwei Actual gas price at target time in milliGwei
     */
    function resolvePrediction(
        uint256 _predictionId,
        uint256 _actualMilliGwei
    ) external onlyOracle {
        Prediction storage pred = predictions[_predictionId];
        
        require(!pred.resolved, "Already resolved");
        require(block.timestamp >= pred.targetTimestamp, "Too early to resolve");
        require(_actualMilliGwei > 0, "Invalid actual price");
        
        // Calculate accuracy score (100 = perfect, 0 = very wrong)
        uint256 accuracy = calculateAccuracy(pred.predictedMilliGwei, _actualMilliGwei);
        
        // Update prediction
        pred.actualMilliGwei = _actualMilliGwei;
        pred.resolved = true;
        pred.accuracyScore = accuracy;
        
        // Update user stats
        UserStats storage stats = userStats[pred.predictor];
        stats.totalScore += accuracy;
        
        // Perfect prediction (within 5% accuracy)
        if (accuracy >= 95) {
            stats.perfectPredictions++;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        } else {
            stats.currentStreak = 0;
        }
        
        // Update leaderboard for this chain
        updateLeaderboard(pred.chainId, pred.predictor);
        
        emit PredictionResolved(_predictionId, _actualMilliGwei, accuracy);
    }
    
    /**
     * @dev Calculate accuracy score (0-100)
     */
    function calculateAccuracy(
        uint256 predicted,
        uint256 actual
    ) internal pure returns (uint256) {
        if (predicted == actual) return 100;
        
        uint256 diff = predicted > actual ? predicted - actual : actual - predicted;
        uint256 percentError = (diff * 100) / actual;
        
        if (percentError >= 100) return 0;
        return 100 - percentError;
    }
    
    /**
     * @dev Update leaderboard for a chain
     */
    function updateLeaderboard(uint256 chainId, address user) internal {
        address[] storage leaders = chainLeaderboard[chainId];
        
        // Check if user should be in top 10
        uint256 userAvgScore = getUserAverageScore(user);

        // Track top performer per chain
        if (leaders.length == 0) {
            leaders.push(user);
        } else if (userAvgScore > getUserAverageScore(leaders[0])) {
            if (leaders[0] != user) {
                leaders[0] = user;
            }
        }
        
        emit LeaderboardUpdated(chainId, leaders);
    }
    
    /**
     * @dev Get user's average prediction score
     */
    function getUserAverageScore(address user) public view returns (uint256) {
        UserStats memory stats = userStats[user];
        if (stats.totalPredictions == 0) return 0;
        return stats.totalScore / stats.totalPredictions;
    }
    
    /**
     * @dev Check if chain is supported
     */
    function isValidChain(uint256 chainId) internal pure returns (bool) {
        return chainId == 1 ||     // Ethereum
               chainId == 56 ||    // BSC
               chainId == 137 ||   // Polygon
               chainId == 42161 || // Arbitrum
               chainId == 10 ||    // Optimism
               chainId == 8453;    // Base
    }
    
    /**
     * @dev Get prediction details
     */
    function getPrediction(uint256 predictionId) 
        external 
        view 
        returns (
            address predictor,
            uint256 chainId,
            uint256 targetTimestamp,
            uint256 predictedMilliGwei,
            uint256 actualMilliGwei,
            bool resolved,
            uint256 accuracyScore
        ) 
    {
        Prediction memory pred = predictions[predictionId];
        return (
            pred.predictor,
            pred.chainId,
            pred.targetTimestamp,
            pred.predictedMilliGwei,
            pred.actualMilliGwei,
            pred.resolved,
            pred.accuracyScore
        );
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 totalPredictions,
            uint256 averageScore,
            uint256 perfectPredictions,
            uint256 currentStreak,
            uint256 bestStreak
        ) 
    {
        UserStats memory stats = userStats[user];
        uint256 avgScore = getUserAverageScore(user);
        
        return (
            stats.totalPredictions,
            avgScore,
            stats.perfectPredictions,
            stats.currentStreak,
            stats.bestStreak
        );
    }
    
    /**
     * @dev Update oracle address (only current oracle)
     */
    function updateOracle(address newOracle) external onlyOracle {
        require(newOracle != address(0), "Invalid oracle");
        oracle = newOracle;
    }
    
    /**
     * @dev Get chain name for display
     */
    function getChainName(uint256 chainId) external pure returns (string memory) {
        if (chainId == 1) return "Ethereum";
        if (chainId == 56) return "BNB Chain";
        if (chainId == 137) return "Polygon";
        if (chainId == 42161) return "Arbitrum";
        if (chainId == 10) return "Optimism";
        if (chainId == 8453) return "Base";
        return "Unknown";
    }
}

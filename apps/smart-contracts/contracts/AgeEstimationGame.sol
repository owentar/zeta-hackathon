// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Age Estimation Game Contract
contract AgeEstimationGame is Ownable, ReentrancyGuard {
    struct Game {
        uint256 id;
        uint256 secretAge;
        uint256 endTime;
        uint256 betAmount;
        uint256 potSize;
        bool isRevealed;
        bool isFinished;
        address owner;
    }

    struct Bet {
        address player;
        uint256 guessedAge;
        bool isWinner;
        bool isClaimed;
    }

    // Constants
    uint256 public constant PLATFORM_FEE_PERCENT = 1; // 1%
    uint256 public constant CREATOR_FEE_PERCENT = 1; // 1%

    // State variables
    uint256 public gameCount;
    mapping(uint256 => Game) public games;
    mapping(uint256 => Bet[]) public bets;
    mapping(uint256 => mapping(address => bool)) public hasBet;
    address public platformWallet;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed owner, uint256 endTime, uint256 betAmount);
    event BetPlaced(uint256 indexed gameId, address indexed player, uint256 guessedAge);
    event GameRevealed(uint256 indexed gameId, uint256 secretAge);
    event GameFinished(uint256 indexed gameId, address[] winners);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    function createGame(uint256 _secretAge, uint256 _duration, uint256 _betAmount) external {
        uint256 gameId = gameCount++;
        uint256 endTime = block.timestamp + _duration;

        games[gameId] = Game({
            id: gameId,
            secretAge: _secretAge,
            endTime: endTime,
            betAmount: _betAmount,
            potSize: 0,
            isRevealed: false,
            isFinished: false,
            owner: msg.sender
        });

        emit GameCreated(gameId, msg.sender, endTime, _betAmount);
    }

    function placeBet(uint256 _gameId, uint256 _guessedAge) external payable nonReentrant {
        Game storage game = games[_gameId];
        require(block.timestamp < game.endTime, "Game has ended");
        require(msg.value == game.betAmount, "Incorrect bet amount");
        require(!hasBet[_gameId][msg.sender], "Already placed a bet");

        game.potSize += msg.value;
        hasBet[_gameId][msg.sender] = true;
        bets[_gameId].push(Bet({
            player: msg.sender,
            guessedAge: _guessedAge,
            isWinner: false,
            isClaimed: false
        }));

        emit BetPlaced(_gameId, msg.sender, _guessedAge);
    }

    function revealAndFinishGame(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        require(
            msg.sender == game.owner || msg.sender == owner(),
            "Only game owner or contract owner can reveal"
        );
        require(block.timestamp >= game.endTime, "Game not ended yet");
        require(!game.isFinished, "Game already finished");

        game.isRevealed = true;
        game.isFinished = true;

        emit GameRevealed(_gameId, game.secretAge);

        // Calculate winners
        Bet[] storage gameBets = bets[_gameId];
        uint256 minDifference = type(uint256).max;
        uint256 winnerCount = 0;

        // First pass: find minimum difference
        for (uint256 i = 0; i < gameBets.length; i++) {
            uint256 difference = _absDiff(gameBets[i].guessedAge, game.secretAge);
            if (difference < minDifference) {
                minDifference = difference;
            }
        }

        // Second pass: mark winners
        for (uint256 i = 0; i < gameBets.length; i++) {
            if (_absDiff(gameBets[i].guessedAge, game.secretAge) == minDifference) {
                gameBets[i].isWinner = true;
                winnerCount++;
            }
        }

        // Calculate prize distribution
        uint256 platformFee = (game.potSize * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (game.potSize * CREATOR_FEE_PERCENT) / 100;
        uint256 winnersShare = (game.potSize - platformFee - creatorFee) / winnerCount;

        // Transfer fees
        (bool success1, ) = platformWallet.call{value: platformFee}("");
        require(success1, "Platform fee transfer failed");
        (bool success2, ) = game.owner.call{value: creatorFee}("");
        require(success2, "Creator fee transfer failed");

        // Emit winners
        address[] memory winners = new address[](winnerCount);
        uint256 winnerIndex = 0;
        for (uint256 i = 0; i < gameBets.length; i++) {
            if (gameBets[i].isWinner) {
                winners[winnerIndex++] = gameBets[i].player;
            }
        }

        emit GameFinished(_gameId, winners);
    }

    function claimPrize(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];
        require(game.isFinished, "Game not finished");
        
        Bet[] storage gameBets = bets[_gameId];
        uint256 winnerCount = 0;
        uint256 winnersShare = 0;

        // Count winners and calculate share
        for (uint256 i = 0; i < gameBets.length; i++) {
            if (gameBets[i].isWinner) {
                winnerCount++;
            }
        }

        uint256 platformFee = (game.potSize * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorFee = (game.potSize * CREATOR_FEE_PERCENT) / 100;
        winnersShare = (game.potSize - platformFee - creatorFee) / winnerCount;

        // Find and transfer prize to the caller if they are a winner
        for (uint256 i = 0; i < gameBets.length; i++) {
            if (gameBets[i].player == msg.sender && gameBets[i].isWinner && !gameBets[i].isClaimed) {
                gameBets[i].isClaimed = true;
                (bool success, ) = msg.sender.call{value: winnersShare}("");
                require(success, "Prize transfer failed");
                emit PrizeClaimed(_gameId, msg.sender, winnersShare);
                return;
            }
        }

        revert("No prize to claim");
    }

    function _absDiff(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : b - a;
    }

    // View functions
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getBets(uint256 _gameId) external view returns (Bet[] memory) {
        return bets[_gameId];
    }

    function getPlayerBet(uint256 _gameId, address _player) external view returns (Bet memory) {
        Bet[] storage gameBets = bets[_gameId];
        for (uint256 i = 0; i < gameBets.length; i++) {
            if (gameBets[i].player == _player) {
                return gameBets[i];
            }
        }
        revert("Bet not found");
    }
} 

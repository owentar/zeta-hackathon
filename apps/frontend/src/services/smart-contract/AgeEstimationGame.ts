import { BrowserProvider, ethers } from "ethers";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_platformWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guessedAge",
        type: "uint256",
      },
    ],
    name: "BetPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
    ],
    name: "GameCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "winners",
        type: "address[]",
      },
    ],
    name: "GameFinished",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualAge",
        type: "uint256",
      },
    ],
    name: "GameRevealed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "PrizeClaimed",
    type: "event",
  },
  {
    inputs: [],
    name: "CREATOR_FEE_PERCENT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PLATFORM_FEE_PERCENT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "bets",
    outputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "guessedAge",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isWinner",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isClaimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "claimPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_age",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_salt",
        type: "string",
      },
    ],
    name: "computeHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_secretHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_duration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_betAmount",
        type: "uint256",
      },
    ],
    name: "createGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "games",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "secretHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "betAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "potSize",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isRevealed",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isFinished",
        type: "bool",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "actualAge",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "getBets",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "guessedAge",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isWinner",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isClaimed",
            type: "bool",
          },
        ],
        internalType: "struct AgeEstimationGame.Bet[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
    ],
    name: "getGame",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "secretHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "betAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "potSize",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isRevealed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isFinished",
            type: "bool",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "actualAge",
            type: "uint256",
          },
        ],
        internalType: "struct AgeEstimationGame.Game",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_player",
        type: "address",
      },
    ],
    name: "getPlayerBet",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "player",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "guessedAge",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isWinner",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isClaimed",
            type: "bool",
          },
        ],
        internalType: "struct AgeEstimationGame.Bet",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasBet",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_guessedAge",
        type: "uint256",
      },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "platformWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_actualAge",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_salt",
        type: "string",
      },
    ],
    name: "revealAndFinishGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const DURATION = 2 * 60;
const BET_AMOUNT = ethers.parseEther("0.01");

export interface GameInfo {
  endTime: bigint;
  isFinished: boolean;
  betAmount: bigint;
  owner: string;
}

export interface UserBet {
  player: string;
  guessedAge: bigint;
  isWinner: boolean;
  isClaimed: boolean;
}

const getContract = async (provider: BrowserProvider) => {
  const signer = await provider.getSigner();
  return new ethers.Contract(
    import.meta.env.VITE_CONTRACT_ADDRESS,
    _abi,
    signer
  );
};

const createGame = async (
  provider: BrowserProvider,
  estimationId: number,
  ageHash: string
) => {
  const contract = await getContract(provider);
  return contract.createGame(estimationId, ageHash, DURATION, BET_AMOUNT);
};

const getGame = async (provider: BrowserProvider, gameId: number) => {
  const contract = await getContract(provider);
  return contract.games(BigInt(gameId)) as Promise<GameInfo>;
};

const getPlayerBet = async (
  provider: BrowserProvider,
  gameId: number,
  player: string
) => {
  const contract = await getContract(provider);
  return contract.getPlayerBet(BigInt(gameId), player) as Promise<UserBet>;
};

const hasBet = async (
  provider: BrowserProvider,
  gameId: number,
  player: string
) => {
  const contract = await getContract(provider);
  return contract.hasBet(BigInt(gameId), player) as Promise<boolean>;
};

const placeBet = async (
  provider: BrowserProvider,
  gameId: number,
  age: number
) => {
  const contract = await getContract(provider);
  return contract.placeBet(BigInt(gameId), age, { value: BET_AMOUNT });
};

const getBets = async (provider: BrowserProvider, gameId: number) => {
  const contract = await getContract(provider);
  return contract.getBets(BigInt(gameId)) as Promise<UserBet[]>;
};

const claimPrize = async (provider: BrowserProvider, gameId: number) => {
  const contract = await getContract(provider);
  return contract.claimPrize(BigInt(gameId));
};

export const AgeEstimationGameContract = {
  createGame,
  getGame,
  getPlayerBet,
  hasBet,
  placeBet,
  getBets,
  claimPrize,
};

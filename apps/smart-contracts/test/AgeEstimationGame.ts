import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { AgeEstimationGame } from "../typechain-types";

describe("AgeEstimationGame", function () {
  let game: AgeEstimationGame;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;
  let platformWallet: SignerWithAddress;

  const SECRET_AGE = 25;
  const GAME_DURATION = 3600; // 1 hour
  const BET_AMOUNT = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, player1, player2, player3, platformWallet] =
      await ethers.getSigners();

    const AgeEstimationGame = await ethers.getContractFactory(
      "AgeEstimationGame"
    );
    game = await AgeEstimationGame.deploy(platformWallet.address);
  });

  describe("Game Creation", function () {
    it("Should allow anyone to create a game", async function () {
      await expect(
        game.connect(player1).createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT)
      )
        .to.emit(game, "GameCreated")
        .withArgs(
          0,
          player1.address,
          (await time.latest()) + GAME_DURATION,
          BET_AMOUNT
        );

      const gameInfo = await game.getGame(0);
      expect(gameInfo.owner).to.equal(player1.address);
      expect(gameInfo.secretAge).to.equal(SECRET_AGE);
      expect(gameInfo.betAmount).to.equal(BET_AMOUNT);
      expect(gameInfo.isRevealed).to.be.false;
      expect(gameInfo.isFinished).to.be.false;
    });
  });

  describe("Placing Bets", function () {
    beforeEach(async function () {
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
    });

    it("Should allow players to place bets", async function () {
      await expect(game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT }))
        .to.emit(game, "BetPlaced")
        .withArgs(0, player1.address, 24);

      const gameInfo = await game.getGame(0);
      expect(gameInfo.potSize).to.equal(BET_AMOUNT);
    });

    it("Should not allow placing bets after game end", async function () {
      await time.increase(GAME_DURATION + 1);
      await expect(
        game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT })
      ).to.be.revertedWith("Game has ended");
    });

    it("Should not allow placing multiple bets from the same player", async function () {
      await game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT });
      await expect(
        game.connect(player1).placeBet(0, 25, { value: BET_AMOUNT })
      ).to.be.revertedWith("Already placed a bet");
    });

    it("Should not allow incorrect bet amount", async function () {
      await expect(
        game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT + 1n })
      ).to.be.revertedWith("Incorrect bet amount");
    });
  });

  describe("Revealing and Finishing Game", function () {
    beforeEach(async function () {
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
      await game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT });
      await game.connect(player2).placeBet(0, 25, { value: BET_AMOUNT });
      await game.connect(player3).placeBet(0, 26, { value: BET_AMOUNT });
      await time.increase(GAME_DURATION + 1);
    });

    it("Should allow game owner to reveal and finish game", async function () {
      await expect(game.revealAndFinishGame(0))
        .to.emit(game, "GameRevealed")
        .withArgs(0, SECRET_AGE)
        .and.to.emit(game, "GameFinished")
        .withArgs(0, [player2.address]);

      const gameInfo = await game.getGame(0);
      expect(gameInfo.isRevealed).to.be.true;
      expect(gameInfo.isFinished).to.be.true;
    });

    it("Should allow contract owner to reveal and finish game", async function () {
      await expect(game.connect(owner).revealAndFinishGame(0))
        .to.emit(game, "GameRevealed")
        .withArgs(0, SECRET_AGE)
        .and.to.emit(game, "GameFinished")
        .withArgs(0, [player2.address]);
    });

    it("Should not allow others to reveal and finish game", async function () {
      await expect(
        game.connect(player1).revealAndFinishGame(0)
      ).to.be.revertedWith("Only game owner or contract owner can reveal");
    });

    it("Should not allow revealing before game end", async function () {
      // Create a new game and try to reveal immediately
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
      await expect(game.revealAndFinishGame(1)).to.be.revertedWith(
        "Game not ended yet"
      );
    });

    it("Should not allow revealing twice", async function () {
      await game.revealAndFinishGame(0);
      await expect(game.revealAndFinishGame(0)).to.be.revertedWith(
        "Game already finished"
      );
    });
  });

  describe("Claiming Prizes", function () {
    beforeEach(async function () {
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
      await game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT });
      await game.connect(player2).placeBet(0, 25, { value: BET_AMOUNT });
      await game.connect(player3).placeBet(0, 26, { value: BET_AMOUNT });
      await time.increase(GAME_DURATION + 1);
      await game.revealAndFinishGame(0);
    });

    it("Should allow winners to claim their prizes", async function () {
      const initialBalance = await ethers.provider.getBalance(player2.address);
      const platformFee = (BET_AMOUNT * 3n * 1n) / 100n;
      const creatorFee = (BET_AMOUNT * 3n * 1n) / 100n;
      const winnersShare = BET_AMOUNT * 3n - platformFee - creatorFee;

      const tx = await game.connect(player2).claimPrize(0);
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(game, "PrizeClaimed")
        .withArgs(0, player2.address, winnersShare);

      const finalBalance = await ethers.provider.getBalance(player2.address);
      expect(finalBalance - initialBalance + gasCost).to.equal(winnersShare);
    });

    it("Should not allow non-winners to claim prizes", async function () {
      await expect(game.connect(player1).claimPrize(0)).to.be.revertedWith(
        "No prize to claim"
      );
    });

    it("Should not allow claiming twice", async function () {
      await game.connect(player2).claimPrize(0);
      await expect(game.connect(player2).claimPrize(0)).to.be.revertedWith(
        "No prize to claim"
      );
    });

    it("Should not allow claiming before game is finished", async function () {
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
      await game.connect(player1).placeBet(1, 25, { value: BET_AMOUNT });
      await expect(game.connect(player1).claimPrize(1)).to.be.revertedWith(
        "Game not finished"
      );
    });
  });

  describe("Multiple Winners", function () {
    beforeEach(async function () {
      await game.createGame(SECRET_AGE, GAME_DURATION, BET_AMOUNT);
      await game.connect(player1).placeBet(0, 24, { value: BET_AMOUNT });
      await game.connect(player2).placeBet(0, 25, { value: BET_AMOUNT });
      await game.connect(player3).placeBet(0, 25, { value: BET_AMOUNT });
      await time.increase(GAME_DURATION + 1);
      await game.revealAndFinishGame(0);
    });

    it("Should split prize between multiple winners", async function () {
      const initialBalance1 = await ethers.provider.getBalance(player2.address);
      const initialBalance2 = await ethers.provider.getBalance(player3.address);

      const platformFee = (BET_AMOUNT * 3n * 1n) / 100n;
      const creatorFee = (BET_AMOUNT * 3n * 1n) / 100n;
      const winnersShare = (BET_AMOUNT * 3n - platformFee - creatorFee) / 2n;

      const tx1 = await game.connect(player2).claimPrize(0);
      const receipt1 = await tx1.wait();
      const gasCost1 = receipt1!.gasUsed * receipt1!.gasPrice;

      const tx2 = await game.connect(player3).claimPrize(0);
      const receipt2 = await tx2.wait();
      const gasCost2 = receipt2!.gasUsed * receipt2!.gasPrice;

      const finalBalance1 = await ethers.provider.getBalance(player2.address);
      const finalBalance2 = await ethers.provider.getBalance(player3.address);

      expect(finalBalance1 - initialBalance1 + gasCost1).to.equal(winnersShare);
      expect(finalBalance2 - initialBalance2 + gasCost2).to.equal(winnersShare);
    });
  });
});

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount, useWalletClient } from "wagmi";
import { Button, Logo, SocialShare } from "../components";
import BackendAPI from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";
import { AgeEstimationGameContract } from "../services/smart-contract/AgeEstimationGame";

const formatTimeLeft = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const GuessScreen = () => {
  const { id } = useParams<{ id: string }>();
  const estimationId = id ? parseInt(id, 10) : 0;
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [guessedAge, setGuessedAge] = useState<string>("");
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  interface AgeEstimation {
    id: number;
    cloudinary_public_id: string;
    estimated_age?: number;
    wallet_address: string;
    chain_id: number;
    created_at: string;
    status: "REVEALED" | "UNREVEALED";
  }

  const {
    data: ageEstimation,
    isLoading,
    error,
    refetch: refetchAgeEstimation,
  } = useQuery<AgeEstimation>({
    queryKey: ["ageEstimation", estimationId],
    queryFn: () => BackendAPI.getAgeEstimation(estimationId),
    enabled: !!estimationId,
  });

  const { data: gameInfo, refetch: refetchGameInfo } = useQuery({
    queryKey: ["gameInfo", estimationId, walletClient?.account.address],
    queryFn: async () => {
      if (!ageEstimation || !walletClient) return null;

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);

      try {
        const game = await AgeEstimationGameContract.getGame(
          provider,
          estimationId
        );
        return {
          endTime: game.endTime,
          isFinished: game.isFinished,
          betAmount: game.betAmount,
          owner: game.owner,
        };
      } catch (error) {
        // If game doesn't exist, return null
        return null;
      }
    },
    enabled: !!ageEstimation && !!walletClient,
  });

  const { data: userBet, refetch: refetchUserBet } = useQuery({
    queryKey: ["userBet", estimationId, address],
    queryFn: async () => {
      if (!ageEstimation || !walletClient || !address) return null;

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);

      try {
        const bet = await AgeEstimationGameContract.getPlayerBet(
          provider,
          estimationId,
          address
        );
        return {
          player: bet.player,
          guessedAge: bet.guessedAge,
          isWinner: bet.isWinner,
          isClaimed: bet.isClaimed,
        };
      } catch (error) {
        // If bet doesn't exist, return null
        return null;
      }
    },
    enabled: !!ageEstimation && !!walletClient && !!address,
  });

  const placeBetMutation = useMutation({
    mutationFn: async (age: number) => {
      if (!walletClient || !gameInfo) throw new Error("No wallet connected");

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);

      const tx = await AgeEstimationGameContract.placeBet(
        provider,
        estimationId,
        age
      );
      await tx.wait();
      refetchUserBet();
    },
    onSuccess: () => {
      toast.success("Bet placed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to place bet. Please try again.");
      console.error("Place bet error:", error);
    },
  });

  const revealAndFinishMutation = useMutation({
    mutationFn: async () => {
      await BackendAPI.finishGame(estimationId);
    },
    onSuccess: () => {
      toast.success("Game revealed and finished successfully!");
      refetchAgeEstimation();
      refetchGameInfo();
    },
    onError: (error) => {
      toast.error("Failed to reveal and finish game. Please try again.");
      console.error("Reveal and finish game error:", error);
    },
  });

  const claimPrizeMutation = useMutation({
    mutationFn: async () => {
      if (!walletClient) throw new Error("No wallet connected");

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);

      const tx = await AgeEstimationGameContract.claimPrize(
        provider,
        estimationId
      );
      await tx.wait();
      refetchUserBet();
    },
    onSuccess: () => {
      toast.success("Prize claimed successfully!");
    },
    onError: (error) => {
      toast.error("Failed to claim prize. Please try again.");
      console.error("Claim prize error:", error);
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const { ageHash, isRewarded } = await BackendAPI.startGame(estimationId);

      // Create game in smart contract
      if (!walletClient) {
        throw new Error("No wallet client available");
      }

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);

      const tx = await AgeEstimationGameContract.createGame(
        provider,
        estimationId,
        ageHash
      );

      await tx.wait();
      return { ageHash, isRewarded };
    },
    onSuccess: () => {
      refetchAgeEstimation();
      refetchGameInfo();
    },
    onError: (error) => {
      toast.error("Failed to start game. Please try again.");
      console.error("Start game error:", error);
    },
  });

  useEffect(() => {
    if (!gameInfo?.endTime) return;

    const updateTimeLeft = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const endTime = gameInfo.endTime;
      const remaining = Number(endTime - now);
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [gameInfo?.endTime]);

  const isGameRegistered = useMemo(
    () => gameInfo?.owner !== ethers.ZeroAddress,
    [gameInfo]
  );

  const isGameOwner = useMemo(
    () => ageEstimation?.wallet_address === address?.toLowerCase(),
    [ageEstimation, address]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-dvh">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-dvh">
        <div className="text-2xl font-bold text-red-500">
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      </div>
    );
  }

  if (!ageEstimation) {
    return (
      <div className="flex flex-col justify-center items-center h-dvh">
        <div className="text-2xl font-bold text-red-500">
          Age estimation not found
        </div>
      </div>
    );
  }

  const imageUrl = CloudinaryService.getImageUrl(
    ageEstimation.cloudinary_public_id,
    {
      width: 800,
      quality: 90,
      format: "webp",
    }
  );

  const title = ageEstimation.estimated_age
    ? `Age Lens guessed ${ageEstimation.estimated_age} years`
    : "Can you guess their age? | Age Lens Game";
  const description = `Check out what Age Lens guessed for this photo! Can it guess your age too?`;

  const handlePlaceBet = () => {
    const age = parseInt(guessedAge);
    if (isNaN(age) || age <= 0) {
      toast.error("Please enter a valid age");
      return;
    }
    placeBetMutation.mutate(age);
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
      </Helmet>
      <div className="flex flex-col justify-between items-center px-4 py-10 h-dvh">
        <Link to="/">
          <Logo />
        </Link>

        <div className="rounded-full w-64 h-64 overflow-hidden">
          <img className="w-full h-full object-cover" src={imageUrl} />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[42px] font-bold">The Lens' Guess</p>
          <span className="text-[126px] font-bold">
            {ageEstimation.estimated_age}
          </span>
          {!isGameRegistered && ageEstimation.status === "UNREVEALED" && (
            <div className="flex gap-2 mt-4">
              {!isConnected && (
                <Button onClick={openConnectModal!} className="w-full">
                  CONNECT WALLET
                </Button>
              )}
              {isConnected && (
                <>
                  {isGameOwner && (
                    <Button
                      onClick={() => startGameMutation.mutate()}
                      disabled={startGameMutation.isPending}
                      className="w-full"
                    >
                      {startGameMutation.isPending
                        ? "STARTING..."
                        : "START GAME"}
                    </Button>
                  )}
                  {!isGameOwner && (
                    <p className="text-white/60 text-xl">
                      Game has not started yet
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {gameInfo &&
            timeLeft !== null &&
            timeLeft > 0 &&
            !gameInfo.isFinished && (
              <>
                <div className="mt-4 text-2xl font-bold">
                  Time left: {formatTimeLeft(timeLeft)}
                </div>
                {!isConnected && (
                  <Button onClick={openConnectModal!} className="mt-4 w-48">
                    CONNECT WALLET
                  </Button>
                )}
                {isConnected && !userBet && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <input
                      type="number"
                      value={guessedAge}
                      onChange={(e) => setGuessedAge(e.target.value)}
                      placeholder="Enter your guess"
                      className="px-4 py-2 rounded-lg bg-white/10 text-white text-center text-xl w-48"
                    />
                    <Button
                      onClick={handlePlaceBet}
                      disabled={placeBetMutation.isPending || !guessedAge}
                    >
                      {placeBetMutation.isPending
                        ? "PLACING BET..."
                        : "PLACE BET"}
                    </Button>
                    <p className="text-white/60 text-sm">
                      Bet amount:{" "}
                      {ethers.formatEther(gameInfo?.betAmount || 0n)} ZETA
                    </p>
                  </div>
                )}
                {isConnected && userBet && (
                  <div className="mt-4 text-xl font-bold">
                    Your guess: {userBet.guessedAge.toString()}
                  </div>
                )}
              </>
            )}
          {gameInfo &&
            timeLeft !== null &&
            timeLeft <= 0 &&
            !gameInfo.isFinished &&
            ageEstimation && (
              <div className="flex flex-col gap-4">
                {isGameOwner &&
                  gameInfo.endTime < Date.now() / 1000 &&
                  !gameInfo.isFinished && (
                    <Button
                      onClick={() => revealAndFinishMutation.mutate()}
                      disabled={revealAndFinishMutation.isPending}
                    >
                      {revealAndFinishMutation.isPending
                        ? "Revealing..."
                        : "Reveal and Finish Game"}
                    </Button>
                  )}
                {!isGameOwner &&
                  gameInfo.endTime < Date.now() / 1000 &&
                  !gameInfo.isFinished && (
                    <p className="text-white/60 text-xl">
                      Game has finished, await the results
                    </p>
                  )}
              </div>
            )}
          {gameInfo?.isFinished && (
            <>
              <div className="mt-4 text-2xl font-bold text-green-500">
                Game Finished
              </div>
              {userBet && (
                <div className="mt-8 w-full max-w-lg">
                  <div
                    className={`p-4 rounded-lg ${
                      userBet.isWinner
                        ? "bg-green-500/20 border border-green-500"
                        : "bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold">
                          Your guess: {userBet.guessedAge.toString()}
                        </p>
                        {userBet.isWinner ? (
                          <p className="text-green-500 font-bold">
                            You won! 🎉
                          </p>
                        ) : (
                          <p className="text-white/60">
                            Better luck next time!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {userBet.isWinner && !userBet.isClaimed && (
                    <Button
                      onClick={() => claimPrizeMutation.mutate()}
                      disabled={claimPrizeMutation.isPending}
                    >
                      {claimPrizeMutation.isPending
                        ? "Claiming..."
                        : "Claim Prize"}
                    </Button>
                  )}
                  {userBet.isWinner && userBet.isClaimed && (
                    <span className="text-white/60">Prize Claimed</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <SocialShare
          title={`I'm playing Age Lens! Come! Join me and earn prizes guessing the age of this photo!`}
          url={window.location.href}
          imageUrl={imageUrl}
        />
      </div>
    </>
  );
};

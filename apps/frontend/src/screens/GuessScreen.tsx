import { AgeEstimationGame__factory } from "@contracts/factories/contracts/AgeEstimationGame__factory";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useWalletClient } from "wagmi";
import { Logo } from "../components";
import BackendAPI from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";

interface AgeEstimation {
  id: number;
  cloudinary_public_id: string;
  estimated_age?: number;
  wallet_address: string;
  chain_id: number;
  created_at: string;
}

interface GameInfo {
  endTime: bigint;
  isFinished: boolean;
}

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
  const { data: walletClient } = useWalletClient();

  const {
    data: ageEstimation,
    isLoading,
    error,
  } = useQuery<AgeEstimation>({
    queryKey: ["ageEstimation", estimationId],
    queryFn: () => BackendAPI.getAgeEstimation(estimationId),
    enabled: !!estimationId,
  });

  const { data: gameInfo } = useQuery({
    queryKey: ["gameInfo", estimationId, walletClient?.account.address],
    queryFn: async () => {
      if (!ageEstimation || !walletClient) return null;

      // Convert wallet client to ethers signer
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const contract = AgeEstimationGame__factory.connect(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        signer
      );

      const game = await contract.games(BigInt(estimationId));
      return {
        endTime: game.endTime,
        isFinished: game.isFinished,
      } as GameInfo;
    },
    enabled: !!ageEstimation && !!walletClient,
    refetchInterval: 1000, // Refetch every second
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
          {timeLeft !== null && !gameInfo?.isFinished && (
            <div className="mt-4 text-2xl font-bold">
              Time left: {formatTimeLeft(timeLeft)}
            </div>
          )}
          {gameInfo?.isFinished && (
            <div className="mt-4 text-2xl font-bold text-green-500">
              Game Finished
            </div>
          )}
        </div>
        <div className="text-white/60 text-xl">
          <p>Wallet: {ageEstimation.wallet_address}</p>
          <p>Created: {new Date(ageEstimation.created_at).toLocaleString()}</p>
        </div>
      </div>
    </>
  );
};

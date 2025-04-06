import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount, useWalletClient } from "wagmi";
import { Button, Logo } from "../../components";
import BackendAPI from "../../services/backend";
import { AgeEstimationGameContract } from "../../services/smart-contract/AgeEstimationGame";

export const AgeEstimated: React.FC<{
  photo: string;
  estimationId: number;
}> = ({ photo, estimationId }) => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();

  const revealMutation = useMutation({
    mutationFn: () => BackendAPI.revealAgeEstimation(estimationId),
    onSuccess: () => {
      navigate(`/guess/${estimationId}`);
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const { ageHash, isRewarded } = await BackendAPI.startGame(estimationId);

      if (isRewarded) {
        toast.success("You will receive a ZETA airdrop!");
      }

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
      navigate(`/guess/${estimationId}`);
    },
    onError: (error) => {
      toast.error("Failed to start game. Please try again.");
      console.error("Start game error:", error);
    },
  });

  return (
    <div className="flex flex-col justify-between items-center px-4 py-10 h-dvh">
      <Link to="/">
        <Logo />
      </Link>
      <div className="rounded-full w-64 h-64 overflow-hidden">
        <img className="w-full h-full object-cover" src={photo} />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[42px] font-bold">The Lens' Guess</p>
        <span className="text-[126px] font-bold">?</span>
      </div>
      <div className="flex gap-2">
        {!isConnected && (
          <Button onClick={openConnectModal!} className="w-full">
            CONNECT WALLET
          </Button>
        )}
        {isConnected && (
          <>
            <Button
              onClick={() => revealMutation.mutate()}
              disabled={revealMutation.isPending || startGameMutation.isPending}
              className="w-full"
            >
              {revealMutation.isPending ? "REVEALING..." : "REVEAL AGE"}
            </Button>
            <Button
              onClick={() => startGameMutation.mutate()}
              disabled={startGameMutation.isPending || revealMutation.isPending}
              className="w-full"
            >
              {startGameMutation.isPending ? "STARTING..." : "START GAME"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

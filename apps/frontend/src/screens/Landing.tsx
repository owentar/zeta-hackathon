import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { WalletIcon } from "../components/icons";

export const Landing = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected && (
        <div className="absolute top-4 right-4 z-10">
          <ConnectButton showBalance={false} />
        </div>
      )}
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#01184D] relative overflow-hidden bg-cover md:bg-contain"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Decorative palm leaves */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-1/4 w-32 h-32 bg-[#232194] opacity-20 blur-lg transform -rotate-45"></div>
          <div className="absolute right-0 top-1/3 w-32 h-32 bg-[#4A9EFF] opacity-20 blur-lg transform rotate-45"></div>
        </div>

        <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center gap-44">
          <div className="text-4xl md:text-5xl font-bold flex items-center gap-2">
            <span>AGE</span>
            <span>LENS</span>
          </div>

          {/* Text and button container */}
          <div className="text-center space-y-6 max-w-xs w-full px-4">
            <h1 className="text-[42px] font-bold text-white">
              Can I guess your age?
            </h1>
            <p className="text-lg text-white font-montserrat">
              Let me guess your age and win some tokens!
            </p>

            <div className="flex justify-center mt-8">
              {isConnected && (
                <Link
                  to="/guess"
                  className="w-full bg-[#C4594F] hover:bg-[#B54940] text-white text-[32px] font-medium py-3 px-6 rounded-lg transition-colors text-center"
                >
                  LET'S BEGIN
                </Link>
              )}
              {!isConnected && (
                <div className="w-full">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="w-full bg-[#C4594F] hover:bg-[#B54940] text-white text-[32px] font-medium py-3 px-6 rounded-lg transition-colors flex justify-center items-center gap-2"
                      >
                        <WalletIcon />
                        CONNECT WALLET
                      </button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

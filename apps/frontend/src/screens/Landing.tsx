import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { WalletIcon } from "../components/icons";

export const Landing = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected && <ConnectButton showBalance={false} />}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#01184D]">
        <div className="relative w-full max-w-md mx-auto">
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-[#232194] bg-opacity-30 flex items-center justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-[#232194] bg-opacity-50 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#232194] flex items-center justify-center">
                  <div className="text-[#4A9EFF] text-4xl font-bold flex items-center gap-2">
                    <span>AGE</span>
                    <span>LENS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6 max-w-xs mt-8">
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
                className="w-full bg-[#C4594F] hover:bg-[#B54940] text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
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
    </>
  );
};

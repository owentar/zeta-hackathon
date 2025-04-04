import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useIsMobile } from "../hooks";
import { Button } from "./Button";
import { CloseIcon, Logo, MenuIcon } from "./icons";

export const MainMenu: React.FC<{ withLogo?: boolean }> = ({
  withLogo = false,
}) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();

  if (isMobile) {
    return (
      <div className="relative z-50">
        {!isOpen && (
          <div
            className={clsx("flex items-center", {
              "justify-end": !withLogo,
              "justify-between": withLogo,
            })}
          >
            {withLogo && (
              <Link to="/">
                <Logo />
              </Link>
            )}
            <Button
              className="bg-transparent !p-0"
              onClick={() => setIsOpen(true)}
            >
              <MenuIcon />
            </Button>
          </div>
        )}
        {isOpen && (
          <div className="absolute top-0 w-full h-full rounded-lg">
            <div className="absolute top-0 right-0">
              <Button
                className="bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </Button>
            </div>
            {isConnected && (
              <div className="py-14 rounded-lg bg-[#000B26] bg-opacity-80">
                <nav className="flex flex-col gap-14 items-center justify-center">
                  {withLogo && (
                    <Link to="/">
                      <Logo />
                    </Link>
                  )}
                  <Link
                    to="/how_to_play"
                    className="text-white text-[42px] font-medium py-3 px-6 transition-colors"
                  >
                    How to Play
                  </Link>
                  <Link
                    to="/feed"
                    className="text-white text-[42px] font-medium py-3 px-6 transition-colors"
                  >
                    Gallery of Guesses
                  </Link>
                  <ConnectButton showBalance={false} />
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="flex items-center justify-evenly">
      {withLogo && (
        <Link to="/">
          <Logo />
        </Link>
      )}
      <Link
        to="/how_to_play"
        className="text-white text-[32px] font-medium py-3 px-6 transition-colors"
      >
        How to Play
      </Link>
      <Link
        to="/feed"
        className="text-white text-[32px] font-medium py-3 px-6 transition-colors"
      >
        Gallery of Guesses
      </Link>
      <ConnectButton showBalance={false} />
    </nav>
  );
};

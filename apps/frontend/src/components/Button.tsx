import clsx from "clsx";
import { PropsWithChildren } from "react";

export const Button: React.FC<
  PropsWithChildren<{
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }>
> = ({ children, onClick, icon, disabled, className }) => {
  return (
    <button
      className={clsx(
        "bg-[#C4594F] rounded-lg text-white text-[32px] font-bold px-6 py-4 flex items-center gap-2",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
};

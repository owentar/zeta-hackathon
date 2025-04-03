import { PropsWithChildren } from "react";

export const Button: React.FC<
  PropsWithChildren<{
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>
> = ({ children, onClick, icon, disabled }) => {
  return (
    <button
      className="bg-[#C4594F] rounded-lg text-white font-bold px-6 py-4 flex items-center gap-2"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
};

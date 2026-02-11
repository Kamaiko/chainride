import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "success" | "danger";
type ButtonSize = "sm" | "md";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "gradient-btn",
  success: "bg-green-600 hover:bg-green-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 rounded-xl",
};

interface TransactionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isPending: boolean;
  isConfirming: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  pendingText?: string;
  confirmingText?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function TransactionButton({
  onClick,
  disabled,
  isPending,
  isConfirming,
  variant = "primary",
  size = "md",
  icon,
  pendingText,
  confirmingText,
  children,
  fullWidth,
}: TransactionButtonProps) {
  const { t } = useTranslation();
  const isLoading = isPending || isConfirming;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isPending ? (pendingText ?? t("tx.btn.pending")) : (confirmingText ?? t("tx.btn.confirming"))}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

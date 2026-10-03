import type { ReactNode } from "react";
import { cn } from "@/utils";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-600 text-white shadow-xs hover:bg-brand-700 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition shrink-0 select-none",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;

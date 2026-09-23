import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const StockPilotLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-14 w-14",
  };

  return (
    <div className={`relative flex shrink-0 items-center justify-center ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-full drop-shadow-sm transition-transform duration-200 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sp-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="sp-wing-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <linearGradient id="sp-wing-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Squircle App Icon Container */}
        <rect width="40" height="40" rx="10" fill="url(#sp-bg-grad)" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="9.25"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />

        {/* Clean, Modern Aerodynamic Flight Arrow (Pilot Vector) */}
        {/* Left Wing (Light) */}
        <path
          d="M10 27L20 8.5L20 21.5L10 27Z"
          fill="url(#sp-wing-main)"
        />
        {/* Right Wing (Shaded for 3D Depth) */}
        <path
          d="M30 27L20 8.5L20 21.5L30 27Z"
          fill="#e0f2fe"
        />
        {/* Inner Aerodynamic Keel / Thrust */}
        <path
          d="M15 24.5L20 16L25 24.5L20 22L15 24.5Z"
          fill="url(#sp-wing-accent)"
        />

        {/* Central Guidance Point */}
        <circle cx="20" cy="13.5" r="1.5" fill="#0284c7" />
      </svg>
    </div>
  );
};

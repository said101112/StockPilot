import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  useImage?: boolean;
}

export const StockPilotLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  useImage = true,
}) => {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  if (useImage) {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 shadow-md ring-1 ring-sky-500/30 transition-transform duration-300 hover:scale-105 ${sizeMap[size]} ${className}`}
      >
        <img
          src="/stockpilot-logo.jpg"
          alt="StockPilot Logo"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Pure SVG Vector Fallback
  return (
    <svg
      viewBox="0 0 100 100"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${sizeMap[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sp-wing-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="sp-cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="sp-cube-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="sp-cube-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
      </defs>

      {/* Rounded Background Badge */}
      <rect width="100" height="100" rx="22" fill="#0b1428" />
      <rect
        width="98"
        height="98"
        x="1"
        y="1"
        rx="21"
        stroke="#1e3a8a"
        strokeWidth="2"
      />

      {/* Isometric 3D Stock Cube */}
      <g transform="translate(18, 28)">
        {/* Top Face */}
        <polygon points="32,22 56,10 32,-2 8,10" fill="url(#sp-cube-top)" />
        {/* Left Face */}
        <polygon points="8,10 32,22 32,48 8,36" fill="url(#sp-cube-front)" />
        {/* Right Face */}
        <polygon points="32,22 56,10 56,36 32,48" fill="url(#sp-cube-side)" />
      </g>

      {/* Aerospace Pilot Wing / Ascending Guidance Vector */}
      <path
        d="M20,48 C28,42 45,32 78,16 L65,19 L72,8 L85,25 L76,26 L80,38 C60,45 42,56 36,65 C32,58 26,52 20,48 Z"
        fill="url(#sp-wing-grad)"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      {/* Aerodynamic Speed Feathers */}
      <path
        d="M24,53 C32,48 42,42 54,36"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M28,60 C36,54 44,48 52,43"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

import React from "react";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const StockPilotLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    xs: "h-6 w-6",
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
          {/* Fond Squircle Sombre & Luxueux */}
          <linearGradient id="sp-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#021324" />
          </linearGradient>

          {/* Facette Stock : Gauche (Cyan Vibrant) */}
          <linearGradient id="sp-face-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Facette Stock : Droite (Bleu Profond) */}
          <linearGradient id="sp-face-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#075985" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          {/* Facette Stock : Haut (Navy Industriel) */}
          <linearGradient id="sp-face-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Flèche Pilot : Gradient Lumineux Haute Télémétrie */}
          <linearGradient id="sp-arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <filter id="sp-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. Cadre Squircle B2B Enterprise */}
        <rect width="40" height="40" rx="10" fill="url(#sp-bg-gradient)" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="9.25"
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="1.2"
        />

        {/* 2. Le Cube Isométrique (STOCK / Warehouse Container) */}
        {/* Face Supérieure (Toit du cube) */}
        <path
          d="M20 8.5L30.5 14.5L20 20.5L9.5 14.5Z"
          fill="url(#sp-face-top)"
          stroke="rgba(56, 189, 248, 0.3)"
          strokeWidth="0.75"
        />

        {/* Face Gauche (Rayonnage physique) */}
        <path
          d="M9.5 14.5L20 20.5V32.5L9.5 26.5Z"
          fill="url(#sp-face-left)"
        />

        {/* Face Droite (Flux d'expédition) */}
        <path
          d="M20 20.5L30.5 14.5V26.5L20 32.5Z"
          fill="url(#sp-face-right)"
        />

        {/* Découpe de précision du conteneur */}
        <path
          d="M20 20.5V32.5"
          stroke="#0f172a"
          strokeWidth="1"
          strokeOpacity="0.5"
        />

        {/* 3. La Flèche Aérodynamique Traversante (PILOT / Navigation Vector) */}
        {/* Faisceau / Corps de la flèche s'élevant à travers le cube */}
        <path
          d="M13.5 24.5L22 15.5L24 17.5L15.5 26.5Z"
          fill="#38bdf8"
          opacity="0.9"
        />

        {/* Tête de Flèche Traversante en diagonale ascendante */}
        <path
          d="M20 11L28.5 12L27.5 20.5L24 17.5L19 22L17.5 20.5L22.5 15.5L20 11Z"
          fill="url(#sp-arrow-grad)"
          filter="url(#sp-glow)"
        />

        {/* Point de mire télémétrique au sommet */}
        <circle cx="28.5" cy="12" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
};

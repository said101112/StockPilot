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
          {/* Fond dégradé bleu StockPilot */}
          <linearGradient id="sp-box-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Face dessus du carton */}
          <linearGradient id="sp-box-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>

          {/* Face gauche (ombre) */}
          <linearGradient id="sp-box-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          {/* Face droite */}
          <linearGradient id="sp-box-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Bande adhésive (Tape) */}
          <linearGradient id="sp-box-tape" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 1. Conteneur d'application Squircle */}
        <rect width="40" height="40" rx="9" fill="url(#sp-box-bg)" />
        <rect
          x="0.75"
          y="0.75"
          width="38.5"
          height="38.5"
          rx="8.25"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />

        {/* 2. LE CARTON / COLIS DE STOCK (Immédiatement compréhensible) */}
        {/* Face supérieure du carton */}
        <path
          d="M20 9L31 15L20 21L9 15L20 9Z"
          fill="url(#sp-box-top)"
        />

        {/* Ruban adhésif bleu sur le dessus (Scellé de colis) */}
        <path
          d="M17 10.6L23 13.9L20 15.6L14 12.3L17 10.6Z"
          fill="url(#sp-box-tape)"
        />

        {/* Face latérale gauche du carton */}
        <path
          d="M9 15L20 21V32L9 26V15Z"
          fill="url(#sp-box-left)"
        />

        {/* Rabat du ruban adhésif sur le côté gauche */}
        <path
          d="M14 17.7L20 21V24L14 20.7V17.7Z"
          fill="url(#sp-box-tape)"
        />

        {/* Face latérale droite du carton */}
        <path
          d="M20 21L31 15V26L20 32V21Z"
          fill="url(#sp-box-right)"
        />

        {/* 3. FLÈCHE DE PILOTAGE / EXPÉDITION (PILOT) sur la face droite */}
        {/* Ligne diagonale ascendante de flux */}
        <path
          d="M24 28L28.5 20.5"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Pointe de la flèche de navigation */}
        <path
          d="M25 20.5H28.5V24"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

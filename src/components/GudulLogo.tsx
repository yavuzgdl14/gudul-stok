import React from 'react';

interface GudulLogoProps {
  className?: string;
  size?: number; // width and height
  showCircle?: boolean; // whether to show the circle background
}

export default function GudulLogo({ className = '', size = 200, showCircle = true }: GudulLogoProps) {
  // High-fidelity recreation of the official sticker logo (white on black/dark circle)
  // "sadece altındaki numara olmasın" - phone number and its banner are omitted.
  const bgFill = showCircle ? "#0c0c0e" : "transparent";
  const primaryColor = "#ffffff";
  const contrastColor = "#0c0c0e";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      id="gudul-logo-svg"
    >
      {/* Circle Background matching the round sticker shape */}
      {showCircle && (
        <circle cx="200" cy="200" r="185" fill={bgFill} stroke="#222" strokeWidth="2" />
      )}
      
      {/* GÜDÜL TİCARET Text (Thick, dense, ultra-bold sans-serif font stack exactly like the sticker) */}
      <text 
        x="55" 
        y="198" 
        fontFamily='"Impact", "Arial Black", "Trebuchet MS", "Inter", sans-serif' 
        fontWeight="900" 
        fontSize="36" 
        letterSpacing="0.5px" 
        fill={primaryColor}
      >
        GÜDÜL TİCARET
      </text>

      {/* Double Horizontal Line matching the sticker */}
      {/* Main thicker line */}
      <line x1="55" y1="210" x2="345" y2="210" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="square" />
      {/* Accent thinner line below */}
      <line x1="55" y1="215" x2="345" y2="215" stroke={primaryColor} strokeWidth="1" strokeLinecap="square" />

      {/* Door Frame (Black rect with white stroke) */}
      <rect x="270" y="138" width="45" height="69" fill={contrastColor} stroke={primaryColor} strokeWidth="2.5" />
      
      {/* Door Panel (White polygon opening outwards to the right) */}
      <polygon 
        points="315,138 350,142 350,214 315,207" 
        fill={primaryColor} 
        stroke={primaryColor} 
        strokeWidth="1" 
        strokeLinejoin="round"
      />
      
      {/* Door Knob/Handle (Black dot on the white open door) */}
      <circle cx="341" cy="178" r="3.5" fill={contrastColor} />

      {/* Subtitles: elegant serif font matching the physical sticker */}
      <text 
        x="200" 
        y="252" 
        fontFamily='Georgia, Cambria, "Times New Roman", Times, serif' 
        fontWeight="bold" 
        fontSize="14" 
        textAnchor="middle" 
        fill={primaryColor}
        letterSpacing="0.2px"
      >
        Panel-PVC-Melamin-Lake-Çelik Kapı
      </text>
      
      <text 
        x="200" 
        y="278" 
        fontFamily='Georgia, Cambria, "Times New Roman", Times, serif' 
        fontWeight="bold" 
        fontSize="14" 
        textAnchor="middle" 
        fill={primaryColor}
        letterSpacing="0.2px"
      >
        Laminant Parke-Mutfak
      </text>
    </svg>
  );
}

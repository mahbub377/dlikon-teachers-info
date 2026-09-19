import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = "w-12 h-12", 
  size = 48,
  monochrome = false 
}) => {
  return (
    <svg 
      id="dlma-school-crest"
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Shield / Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="47" 
        stroke={monochrome ? "#1e293b" : "#0f766e"} 
        strokeWidth="3" 
        fill={monochrome ? "#ffffff" : "#f0fdfa"} 
      />
      <circle 
        cx="50" 
        cy="50" 
        r="43" 
        stroke={monochrome ? "#1e293b" : "#0d9488"} 
        strokeWidth="1" 
        strokeDasharray="2 2" 
      />

      {/* Decorative stars */}
      <path d="M50 11L51.5 15.5H56L52.5 18L54 22.5L50 19.5L46 22.5L47.5 18L44 15.5H48.5L50 11Z" fill={monochrome ? "#1e293b" : "#f59e0b"} />
      <path d="M22 25L23 28H26L23.5 29.5L24.5 32.5L22 30.5L19.5 32.5L20.5 29.5L18 28H21L22 25Z" fill={monochrome ? "#1e293b" : "#f59e0b"} />
      <path d="M78 25L79 28H82L79.5 29.5L80.5 32.5L78 30.5L75.5 32.5L76.5 29.5L74 28H77L78 25Z" fill={monochrome ? "#1e293b" : "#f59e0b"} />

      {/* Open Book in Center */}
      <path 
        d="M50 48C43 44 32 45 27 48V70C33 67 43 66 50 71C57 66 67 67 73 70V48C68 45 57 44 50 48Z" 
        fill={monochrome ? "#f8fafc" : "#ffffff"} 
        stroke={monochrome ? "#1e293b" : "#0f766e"} 
        strokeWidth="2.5" 
      />
      <path d="M50 48V71" stroke={monochrome ? "#1e293b" : "#0f766e"} strokeWidth="2.5" />
      {/* Book page lines */}
      <line x1="33" y1="53" x2="45" y2="51" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />
      <line x1="33" y1="58" x2="45" y2="56" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />
      <line x1="33" y1="63" x2="45" y2="61" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />
      <line x1="55" y1="51" x2="67" y2="53" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />
      <line x1="55" y1="56" x2="67" y2="58" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />
      <line x1="55" y1="61" x2="67" y2="63" stroke={monochrome ? "#64748b" : "#99f6e4"} strokeWidth="1.5" />

      {/* Knowledge Torch behind book */}
      <path d="M47 34H53L51 44H49L47 34Z" fill={monochrome ? "#334155" : "#b45309"} />
      <path 
        d="M50 22C46 27 45 30 47 34C48 31 51 30 50 28C53 30 54 32 53 34C55 30 54 26 50 22Z" 
        fill={monochrome ? "#1e293b" : "#ef4444"} 
      />

      {/* Laurel Wreath base */}
      <path 
        d="M22 62C22 75 34 83 50 83C66 83 78 75 78 62" 
        stroke={monochrome ? "#1e293b" : "#0d9488"} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <circle cx="50" cy="83" r="2.5" fill={monochrome ? "#1e293b" : "#f59e0b"} />
    </svg>
  );
};

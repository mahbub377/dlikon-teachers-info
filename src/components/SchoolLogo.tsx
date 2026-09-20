import React, { useState } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = "w-12 h-12", 
  size = 120,
  glow = false
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Animated radiating golden aura glow */}
      {glow && (
        <div className="absolute inset-0 -m-6 rounded-full bg-gradient-to-r from-amber-400/35 via-yellow-300/45 to-orange-400/35 blur-2xl animate-pulse pointer-events-none" />
      )}

      {/* 1. High-fidelity Master Image Rendering with rounded crest framing */}
      {!imgError ? (
        <img
          src="/school-emblem.jpg"
          alt="ডি-লিকন মডেল একাডেমী"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain rounded-2xl drop-shadow-md transition-transform duration-300 hover:scale-105 pointer-events-none"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* 2. Pristine Fallback Scaled Vector Crest */
        <svg 
          id="dlma-official-emblem"
          width={size} 
          height={size} 
          viewBox="0 0 400 440" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
            <linearGradient id="goldArchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="laurelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#5b21b6" />
            </linearGradient>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="50%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <path id="topTextArc" d="M 68 190 A 132 132 0 0 1 332 190" fill="none" />
            <path id="bottomTextArc" d="M 78 200 A 122 122 0 0 0 322 200" fill="none" />
          </defs>

          {/* Laurel Wreath */}
          <g fill="url(#laurelGrad)">
            {/* Left Wreath Leaves */}
            <path d="M 45 75 C 30 55 50 40 55 60 C 60 75 45 75 45 75 Z" />
            <path d="M 32 110 C 15 95 30 75 42 95 C 50 110 32 110 32 110 Z" />
            <path d="M 24 150 C 6 140 18 118 32 138 C 40 152 24 150 24 150 Z" />
            <path d="M 22 195 C 4 190 12 168 28 185 C 35 198 22 195 22 195 Z" />
            <path d="M 28 240 C 12 240 16 218 34 230 C 44 242 28 240 28 240 Z" />
            <path d="M 42 285 C 28 290 28 268 48 275 C 58 285 42 285 42 285 Z" />
            <path d="M 68 325 C 55 335 50 315 72 315 C 84 322 68 325 68 325 Z" />
            <path d="M 105 355 C 92 370 82 350 105 345 C 118 350 105 355 105 355 Z" />

            {/* Right Wreath Leaves */}
            <path d="M 355 75 C 370 55 350 40 345 60 C 340 75 355 75 355 75 Z" />
            <path d="M 368 110 C 385 95 370 75 358 95 C 350 110 368 110 368 110 Z" />
            <path d="M 376 150 C 394 140 382 118 368 138 C 360 152 376 150 376 150 Z" />
            <path d="M 378 195 C 396 190 388 168 372 185 C 365 198 378 195 378 195 Z" />
            <path d="M 372 240 C 388 240 384 218 366 230 C 356 242 372 240 372 240 Z" />
            <path d="M 358 285 C 372 290 372 268 352 275 C 342 285 358 285 358 285 Z" />
            <path d="M 332 325 C 345 335 350 315 328 315 C 316 322 332 325 332 325 Z" />
            <path d="M 295 355 C 308 370 318 350 295 345 C 282 350 295 355 295 355 Z" />
          </g>

          {/* Central Badges */}
          <circle cx="200" cy="195" r="150" stroke="#1e1b4b" strokeWidth="5" fill="#ffffff" />
          <circle cx="200" cy="195" r="142" stroke="#4338ca" strokeWidth="2" fill="none" />
          
          {/* Golden Yellow Bottom Half */}
          <path d="M 58 195 A 142 142 0 0 0 342 195 L 314 195 A 114 114 0 0 1 86 195 Z" fill="url(#goldArchGrad)" />
          
          {/* Inner Circle */}
          <circle cx="200" cy="195" r="114" stroke="#1e1b4b" strokeWidth="3" fill="#ffffff" />
          
          {/* Bengali Top Arch: ডি-লিকন মডেল একাডেমী */}
          <text className="font-extrabold fill-red-600" style={{ fontSize: '23px', fontWeight: 900 }}>
            <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
              ডি-লিকন মডেল একাডেমী
            </textPath>
          </text>

          {/* Bengali Bottom Arch: মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর। */}
          <text className="font-bold fill-white" style={{ fontSize: '13px', fontWeight: 700 }}>
            <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
              মীর মার্কেট, সনমানিয়া, কাপাসিয়া, গাজীপুর।
            </textPath>
          </text>

          {/* Sun & Rays */}
          <g transform="translate(200, 142)">
            {[0, 30, 60, 90, 120, 150, 180, 210].map((deg, i) => (
              <line 
                key={i} 
                x1="0" 
                y1="-5" 
                x2={Math.cos((deg * Math.PI) / 180) * 34} 
                y2={-Math.abs(Math.sin((deg * Math.PI) / 180) * 34) - 8} 
                stroke="#ea580c" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
            ))}
            <path d="M -28 0 A 28 28 0 0 1 28 0 Z" fill="url(#sunGlow)" />
          </g>

          {/* Open Book with DLMA */}
          <g transform="translate(200, 172)">
            <path d="M 0 5 C -15 -2 -38 0 -48 6 L -48 54 C -38 48 -15 46 0 52 Z" fill="#bae6fd" stroke="#1e3a8a" strokeWidth="2.5" />
            <path d="M 0 5 C 15 -2 38 0 48 6 L 48 54 C 38 48 15 46 0 52 Z" fill="#bae6fd" stroke="#1e3a8a" strokeWidth="2.5" />
            <path d="M 0 5 L 0 52" stroke="#1e3a8a" strokeWidth="3" />
            <text x="-28" y="24" textAnchor="middle" fill="#6b21a8" fontSize="16" fontWeight="bold">D</text>
            <text x="28" y="24" textAnchor="middle" fill="#6b21a8" fontSize="16" fontWeight="bold">L</text>
            <text x="-28" y="44" textAnchor="middle" fill="#6b21a8" fontSize="16" fontWeight="bold">M</text>
            <text x="28" y="44" textAnchor="middle" fill="#6b21a8" fontSize="16" fontWeight="bold">A</text>
          </g>

          {/* স্থাপিত:২০১৮ইং */}
          <text x="200" y="250" textAnchor="middle" fill="#1e1b4b" fontSize="17" fontWeight="bold">
            স্থাপিত:২০১৮ইং
          </text>

          {/* Bottom Ribbon */}
          <g transform="translate(200, 385)">
            <path d="M -150 0 L -170 -16 L -130 -24 L -115 -8 Z" fill="#7c3aed" />
            <path d="M -150 0 L -170 16 L -130 24 L -115 8 Z" fill="#6d28d9" />
            <path d="M 150 0 L 170 -16 L 130 -24 L 115 -8 Z" fill="#7c3aed" />
            <path d="M 150 0 L 170 16 L 130 24 L 115 8 Z" fill="#6d28d9" />
            <path d="M -130 -20 C -50 -10 50 -10 130 -20 L 125 16 C 50 24 -50 24 -125 16 Z" fill="url(#ribbonGrad)" stroke="#5b21b6" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="17" fontWeight="bold" fontFamily="serif, sans-serif">
              D-Likon Model Academy
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};

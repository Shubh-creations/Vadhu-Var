import React from 'react';

export const Logo = ({ variant = 'full', className = '', size = 'normal' }) => {
  // size: 'small' (nav header), 'normal', 'large' (landing/auth)
  const iconHeight = size === 'small' ? 'h-7 sm:h-8' : size === 'large' ? 'h-16 sm:h-20' : 'h-10 sm:h-12';
  
  if (variant === 'icon') {
    return (
      <svg
        className={`${iconHeight} aspect-square ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crown / Kalash Top */}
        <path
          d="M50 8 L54 18 L64 16 L57 24 L65 30 L50 26 L35 30 L43 24 L36 16 L46 18 Z"
          fill="#D4A343"
        />
        <ellipse cx="50" cy="30" rx="14" ry="4" fill="#B8860B" />
        
        {/* Infinity Loop - Bride Side (Maroon / Gold) */}
        <path
          d="M32 45 C15 45 10 65 25 78 C38 88 48 72 50 65 C45 58 38 45 32 45 Z"
          fill="url(#brideGrad)"
        />
        
        {/* Infinity Loop - Groom Side (Sky Blue) */}
        <path
          d="M68 45 C85 45 90 65 75 78 C62 88 52 72 50 65 C55 58 62 45 68 45 Z"
          fill="url(#groomGrad)"
        />

        {/* Center Interlock Chain Link */}
        <ellipse cx="50" cy="63" rx="6" ry="8" fill="none" stroke="#D4A343" strokeWidth="3" />

        {/* Bride Profile Silhouette */}
        <path
          d="M26 62 C23 60 21 54 24 50 C26 47 28 50 28 53 C28 56 26 62 26 62 Z"
          fill="#FFF"
        />
        
        {/* Groom Profile Silhouette */}
        <path
          d="M74 62 C77 60 79 54 76 50 C74 47 72 50 72 53 C72 56 74 62 74 62 Z"
          fill="#FFF"
        />

        <defs>
          <linearGradient id="brideGrad" x1="10" y1="45" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4A343" />
            <stop offset="0.5" stopColor="#8B1E24" />
          </linearGradient>
          <linearGradient id="groomGrad" x1="90" y1="45" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BA0CE" />
            <stop offset="1" stopColor="#3B73A1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Infinity Emblem SVG */}
      <svg
        className={`${iconHeight} aspect-square flex-shrink-0`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Kalash Top */}
        <path
          d="M50 10 L54 18 L64 16 L57 24 L65 28 L50 25 L35 28 L43 24 L36 16 L46 18 Z"
          fill="#D4A343"
        />
        <ellipse cx="50" cy="27" rx="13" ry="3.5" fill="#B8860B" />
        
        {/* Bride Loop */}
        <path
          d="M32 42 C15 42 10 63 25 76 C38 86 48 70 50 63 C45 56 38 42 32 42 Z"
          fill="url(#brideGradNav)"
        />
        
        {/* Groom Loop */}
        <path
          d="M68 42 C85 42 90 63 75 76 C62 86 52 70 50 63 C55 56 62 42 68 42 Z"
          fill="url(#groomGradNav)"
        />

        {/* Center Golden Knot Link */}
        <ellipse cx="50" cy="61" rx="5.5" ry="7.5" fill="none" stroke="#D4A343" strokeWidth="2.8" />

        {/* Silhouettes */}
        <circle cx="26" cy="54" r="3" fill="#FFFFFF" />
        <path d="M24 58 C24 54 28 54 28 58 Z" fill="#FFFFFF" />

        <circle cx="74" cy="54" r="3" fill="#FFFFFF" />
        <path d="M72 58 C72 54 76 54 76 58 Z" fill="#FFFFFF" />

        <defs>
          <linearGradient id="brideGradNav" x1="10" y1="42" x2="50" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4A343" />
            <stop offset="0.55" stopColor="#8B1E24" />
          </linearGradient>
          <linearGradient id="groomGradNav" x1="90" y1="42" x2="50" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BA0CE" />
            <stop offset="1" stopColor="#3B73A1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Typography: Devanagari "वधू - वर" + Subtext */}
      <div className="flex flex-col">
        <span className="font-serif font-extrabold text-main text-lg sm:text-xl tracking-tight leading-none text-[#8B1E24] dark:text-main">
          वधू - वर
        </span>
        <span className="text-[10px] font-semibold text-[#6BA0CE] tracking-wider block mt-0.5 leading-none">
          vadhu-var.vercel.app
        </span>
      </div>
    </div>
  );
};

export default Logo;

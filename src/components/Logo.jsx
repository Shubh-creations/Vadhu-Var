import React from 'react';

export const Logo = ({ variant, type, className = '', size = 'normal' }) => {
  const mode = variant || type || 'full';

  // 1st Image: Website Icon (Emblem only)
  if (mode === 'icon' || mode === 'website-icon' || mode === 'emblem') {
    return (
      <img
        src="/website-icon.png"
        alt="Vadhu Var Icon"
        className={`object-contain flex-shrink-0 ${
          size === 'small' || size === 'sm'
            ? 'h-7 w-7 sm:h-8 sm:w-8'
            : size === 'large' || size === 'lg'
            ? 'h-16 w-16 sm:h-20 sm:w-20'
            : 'h-9 w-9 sm:h-10 sm:w-10'
        } ${className}`}
      />
    );
  }

  // 2nd Image: App Icon (Squircle with gradient for mobile app / PWA)
  if (mode === 'app' || mode === 'app-icon') {
    return (
      <img
        src="/app-icon.png"
        alt="Vadhu Var App Icon"
        className={`object-contain rounded-2xl shadow-sm flex-shrink-0 ${
          size === 'small' || size === 'sm'
            ? 'h-8 w-8'
            : size === 'large' || size === 'lg'
            ? 'h-20 w-20 sm:h-24 sm:w-24'
            : 'h-14 w-14 sm:h-16 sm:w-16'
        } ${className}`}
      />
    );
  }

  // Navbar Header logo: Emblem + Brand Typography
  if (mode === 'nav' || mode === 'header') {
    return (
      <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
        <img
          src="/website-icon.png"
          alt="Vadhu Var Emblem"
          className="h-7 w-7 sm:h-8 sm:w-8 object-contain flex-shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-serif font-black text-main text-base sm:text-lg tracking-tight leading-none">
            वधू - वर
          </span>
          <span className="text-[10px] font-medium text-sub tracking-wider block mt-0.5 leading-none">
            Vadhu Var
          </span>
        </div>
      </div>
    );
  }

  // 3rd Image: Full logo (Opening / Landing / Splash)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img
        src="/full-logo.png"
        alt="Vadhu Var Matrimony - Finding Your Perfect Match"
        className={`object-contain ${
          size === 'small' || size === 'sm'
            ? 'h-12 sm:h-14'
            : size === 'large' || size === 'lg'
            ? 'h-32 sm:h-40'
            : 'h-20 sm:h-24'
        }`}
      />
    </div>
  );
};

export default Logo;

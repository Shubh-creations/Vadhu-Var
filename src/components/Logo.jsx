import React from 'react';

export const Logo = ({ variant = 'full', className = '', size = 'normal' }) => {
  // size: 'small' (nav header), 'normal', 'large' (landing/auth/opened)

  // 1st Image: Website Icon (Emblem only)
  if (variant === 'icon' || variant === 'website-icon') {
    return (
      <img
        src="/website-icon.png"
        alt="Vadhu Var Icon"
        className={`object-contain ${
          size === 'small' ? 'h-8 sm:h-9' : size === 'large' ? 'h-20 sm:h-24' : 'h-12 sm:h-14'
        } ${className}`}
      />
    );
  }

  // 2nd Image: App Icon (Squircle with gradient for mobile app / PWA)
  if (variant === 'app' || variant === 'app-icon') {
    return (
      <img
        src="/app-icon.png"
        alt="Vadhu Var App Icon"
        className={`object-contain rounded-2xl shadow-sm ${
          size === 'small' ? 'h-9 w-9' : size === 'large' ? 'h-24 w-24' : 'h-16 w-16'
        } ${className}`}
      />
    );
  }

  // Navbar Header logo: 1st Website Icon + Brand Text
  if (variant === 'nav' || variant === 'header') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src="/website-icon.png"
          alt="Vadhu Var Emblem"
          className="h-8 sm:h-9 object-contain flex-shrink-0"
        />
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
  }

  // 3rd Image: Full logo when website or app is opened (Opening / Landing / Auth / Splash)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img
        src="/full-logo.png"
        alt="Vadhu Var Matrimony - Finding Your Perfect Match"
        className={`object-contain ${
          size === 'small'
            ? 'h-20 sm:h-24'
            : size === 'large'
            ? 'h-40 sm:h-48'
            : 'h-28 sm:h-32'
        }`}
      />
    </div>
  );
};

export default Logo;

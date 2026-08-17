import React, { useState } from 'react';
import { User, Camera } from 'lucide-react';

export const CandidateAvatar = ({
  src,
  name = 'Candidate',
  size = 'md',
  shape = 'circle',
  className = '',
  showNoPhotoText = false
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanName = (name || 'Candidate').trim();
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'VV';

  const isRealPhoto = src && !src.includes('unsplash') && !hasError && src.trim().length > 0;

  const sizeClasses = {
    xs: 'w-8 h-8 text-[11px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-base sm:text-lg',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-xl sm:text-2xl',
    hero: 'w-32 h-32 sm:w-40 sm:h-40 text-3xl sm:text-4xl',
    full: 'w-full h-full text-3xl sm:text-4xl'
  }[size] || 'w-14 h-14 text-sm';

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-none'
  }[shape] || 'rounded-full';

  if (isRealPhoto) {
    return (
      <img
        src={src}
        alt={cleanName}
        onError={() => setHasError(true)}
        className={`${sizeClasses} ${shapeClasses} object-cover border border-main shadow-2xs ${className}`}
      />
    );
  }

  // Blank/Initials Placeholder when no real photo is uploaded
  return (
    <div
      className={`${sizeClasses} ${shapeClasses} bg-gradient-to-br from-surface-ground to-surface-card border border-main text-sky-blue flex flex-col items-center justify-center font-serif font-bold shadow-2xs select-none flex-shrink-0 ${className}`}
      title={`${cleanName} (No photo uploaded)`}
    >
      <span>{initials}</span>
      {showNoPhotoText && (
        <span className="text-[10px] text-sub font-sans font-normal mt-0.5">
          No photo
        </span>
      )}
    </div>
  );
};

export default CandidateAvatar;

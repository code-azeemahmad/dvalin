import React from 'react';
import { resolveAssetPath } from '@/utils/assetPath';

interface BerryLogoProps {
  className?: string;
  size?: number;
}

/**
 * Official Dvalin Logo component rendering the dragon insignia.
 */
export const BerryLogo: React.FC<BerryLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <img
      src={resolveAssetPath('logo.svg')}
      alt="Dvalin Logo"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export const DvalinLogo = BerryLogo;

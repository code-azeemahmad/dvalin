import React from 'react';

interface BerryLogoProps {
  className?: string;
  size?: number;
}

/**
 * Pixel-art Berry / Blue Apple logo matching Dvalin OS reference images.
 */
export const BerryLogo: React.FC<BerryLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 image-rendering-pixelated ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Green leaves at the top */}
      <rect x="9" y="2" width="2" height="2" fill="#48bb78" />
      <rect x="11" y="2" width="2" height="2" fill="#38a169" />
      <rect x="8" y="3" width="2" height="2" fill="#48bb78" />
      <rect x="12" y="3" width="2" height="2" fill="#2f855a" />
      <rect x="10" y="4" width="2" height="2" fill="#276749" />
      <rect x="13" y="4" width="2" height="2" fill="#38a169" />

      {/* Blue Berry Body with pixel shading */}
      {/* Top row */}
      <rect x="8" y="6" width="3" height="2" fill="#4299e1" />
      <rect x="11" y="6" width="3" height="2" fill="#3182ce" />
      {/* Main body */}
      <rect x="6" y="8" width="3" height="4" fill="#63b3ed" />
      <rect x="9" y="8" width="5" height="4" fill="#4299e1" />
      <rect x="14" y="8" width="3" height="4" fill="#2b6cb0" />
      {/* Right bite / notch highlight */}
      <rect x="16" y="9" width="2" height="2" fill="#1a365d" opacity="0.3" />

      {/* Mid body */}
      <rect x="6" y="12" width="3" height="5" fill="#4299e1" />
      <rect x="9" y="12" width="6" height="5" fill="#3182ce" />
      <rect x="15" y="12" width="3" height="4" fill="#2b6cb0" />

      {/* Bottom rounding */}
      <rect x="7" y="17" width="4" height="2" fill="#3182ce" />
      <rect x="11" y="17" width="5" height="2" fill="#2c5282" />
      <rect x="9" y="19" width="6" height="2" fill="#2b6cb0" />

      {/* Highlights */}
      <rect x="7" y="9" width="2" height="2" fill="#ebf8ff" />
      <rect x="8" y="11" width="1" height="2" fill="#bee3f8" />
      <rect x="9" y="13" width="1" height="2" fill="#bee3f8" />
    </svg>
  );
};

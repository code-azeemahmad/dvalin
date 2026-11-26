import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { resolveAssetPath } from '@/utils/assetPath';

export interface SocialItem {
  id: string;
  name: string;
  url: string;
  iconSrc: string;
}

export const SOCIAL_LINKS: SocialItem[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    url: 'https://x.com/azeemnadeemy',
    iconSrc: resolveAssetPath('assets/images/socials/twitter.webp'),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/azeemahmad.me/',
    iconSrc: resolveAssetPath('assets/images/socials/instagram.webp'),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@AzeemAhmad-v7o',
    iconSrc: resolveAssetPath('assets/images/socials/youtube.webp'),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/azeem-ahmad327',
    iconSrc: resolveAssetPath('assets/images/socials/linkedin.webp'),
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/code-azeemahmad',
    iconSrc: resolveAssetPath('assets/images/socials/github.webp'),
  },
  {
    id: 'website',
    name: 'Website',
    url: 'https://azeemahmad.me/',
    iconSrc: resolveAssetPath('assets/images/socials/website.webp'),
  },
];

interface MySocialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MySocialsModal: React.FC<MySocialsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="my-socials-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none pointer-events-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl px-5 py-4 sm:px-6 sm:py-5 max-w-lg w-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close Socials Menu"
          className="absolute top-2.5 right-2.5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/15 transition-colors cursor-pointer pointer-events-auto"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2 className="text-center font-mono font-bold text-white text-sm sm:text-base tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-3.5">
          My Socials
        </h2>

        {/* 6 Social Media Apps in a row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-nowrap">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank', 'noopener,noreferrer');
              }}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-1.5 hover:scale-105 active:scale-95 focus:outline-none pointer-events-auto"
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden shadow-lg border border-black/40 bg-black/20 flex items-center justify-center transition-shadow group-hover:shadow-sky-500/30">
                <img
                  src={item.iconSrc}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="mt-1.5 text-[11px] sm:text-xs font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] text-center tracking-wide group-hover:text-sky-300 transition-colors">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900/65 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Socials Menu"
          className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-center font-mono font-bold text-white text-lg tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-6">
          My Socials
        </h2>

        {/* 6 Social Media Apps in a row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center cursor-pointer transition-transform duration-150 hover:-translate-y-2 hover:scale-105 active:scale-95 focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shadow-xl border border-black/40 bg-black/20 flex items-center justify-center transition-shadow group-hover:shadow-sky-500/30">
                <img
                  src={item.iconSrc}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <span className="mt-2 text-xs sm:text-[13px] font-mono font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] text-center tracking-wide group-hover:text-sky-300 transition-colors">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

import { AppDefinition } from './types';

export const APP_REGISTRY: Record<string, AppDefinition> = {
  'linux-desktop': {
    id: 'linux-desktop',
    title: 'Tiny Core Linux Desktop',
    iconName: 'Monitor',
    category: 'guest',
    description: 'Genuine 32-bit x86 Linux guest environment with FLWM window manager and Xvesa graphics.',
    defaultSize: { width: 1060, height: 830 },
    defaultPosition: { x: 40, y: 30 },
    isSingleton: true,
  },
  'terminal': {
    id: 'terminal',
    title: 'Linux Terminal',
    iconName: 'Terminal',
    category: 'guest',
    description: 'Interactive shell environment executing commands directly inside Tiny Core Linux.',
    defaultSize: { width: 720, height: 480 },
    defaultPosition: { x: 120, y: 80 },
    isSingleton: false,
  },
  'settings': {
    id: 'settings',
    title: 'System Settings',
    iconName: 'Settings',
    category: 'system',
    description: 'Configure desktop appearance, wallpapers, display scaling, and emulator profile.',
    defaultSize: { width: 680, height: 520 },
    defaultPosition: { x: 180, y: 120 },
    isSingleton: true,
  },
  'about': {
    id: 'about',
    title: 'About WebOS',
    iconName: 'Info',
    category: 'system',
    description: 'System specifications, hardware emulation parameters, and open-source licenses.',
    defaultSize: { width: 620, height: 500 },
    defaultPosition: { x: 240, y: 160 },
    isSingleton: true,
  },
};

export const WALLPAPER_OPTIONS = [
  {
    id: 'slate-mesh' as const,
    name: 'Deep Slate Mesh',
    className: 'bg-radial from-slate-900 via-slate-950 to-black',
    previewColor: '#0f172a',
    description: 'Subtle slate grid pattern with dark ambient lighting.',
  },
  {
    id: 'deep-cosmos' as const,
    name: 'Cosmic Indigo',
    className: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-neutral-950',
    previewColor: '#1e1b4b',
    description: 'Deep celestial indigo gradient with stellar backdrop.',
  },
  {
    id: 'cyber-terminal' as const,
    name: 'Emerald Matrix',
    className: 'bg-gradient-to-b from-emerald-950/40 via-slate-950 to-black',
    previewColor: '#064e3b',
    description: 'High-contrast monochrome dark aesthetic inspired by vintage terminals.',
  },
  {
    id: 'aurora-borealis' as const,
    name: 'Cyan Aurora',
    className: 'bg-gradient-to-tr from-cyan-950/50 via-slate-950 to-slate-900',
    previewColor: '#083344',
    description: 'Modern twilight tones blending cyan accents with deep black.',
  },
];

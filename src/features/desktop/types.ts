export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition;
  size: WindowSize;
  minSize: WindowSize;
  zIndex: number;
  isFocused: boolean;
  prevPosition?: WindowPosition;
  prevSize?: WindowSize;
}

export type AppCategory = 'system' | 'guest' | 'tools';

export interface AppDefinition {
  id: string;
  title: string;
  iconName: string;
  category: AppCategory;
  description: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  isSingleton?: boolean;
}

export type WallpaperId = 'slate-mesh' | 'deep-cosmos' | 'cyber-terminal' | 'aurora-borealis';

export interface WallpaperOption {
  id: WallpaperId;
  name: string;
  className: string;
  previewColor: string;
  description: string;
}

export interface HostSettings {
  wallpaper: WallpaperId;
  displayScale: number;
  theme: 'dark' | 'midnight';
  autoCaptureMouse: boolean;
}

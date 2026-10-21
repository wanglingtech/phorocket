export type ThemeId =
  | 'violet-pulse'
  | 'cyber-cyan'
  | 'neon-matrix'
  | 'crimson-drive'
  | 'solar-gold'
  | 'magenta-flux';

export type VisualizerMode =
  | 'bars'
  | 'wave'
  | 'circle'
  | 'spectrum'
  | 'particles'
  | 'minimal'
  | 'd3-cyberpunk'
  | 'd3-radial-hud';

export interface CustomColorPalette {
  isCustomActive: boolean;
  accentPrimary: string;
  accentSecondary: string;
  bgMain: string;
  bgSurface: string;
  bgElevated: string;
  glowIntensity: number; // 0.2 to 2.0
  crtScanlines: boolean;
  scanlineOpacity: number; // 0.05 to 0.4
  tacticalHudBrackets: boolean;
  bassPulseReactive: boolean;
}

export type PlayerBarStyle = 'cyber-dock' | 'studio-rack' | 'minimal-hud';
export type ArtworkDisplayStyle = 'hologram-glow' | 'vinyl-cyber' | 'glass-3d' | 'clean-flat';
export type BackgroundVfxStyle = 'thunder-storm' | 'cyber-grid' | 'quantum-dust' | 'solid-clean';
export type SidebarDensity = 'hud-expanded' | 'compact-dock';

export type SystemFontFamily =
  | 'jakarta'
  | 'outfit'
  | 'orbitron'
  | 'rajdhani'
  | 'inter'
  | 'space-grotesk'
  | 'jetbrains'
  | 'poppins';

export interface ComponentCustomization {
  playerBarStyle: PlayerBarStyle;
  artworkStyle: ArtworkDisplayStyle;
  backgroundVfx: BackgroundVfxStyle;
  sidebarDensity: SidebarDensity;
  showPeakMeter: boolean;
  d3VisualizerSubStyle: 'radar-hud' | 'spectral-ribbon' | 'constellation' | 'hex-matrix';
  d3Sensitivity: number;
  fontScale: number; // 0.80 to 1.35 (default 1.0)
  fontFamily?: SystemFontFamily;
  highContrastText?: boolean;
  reducedMotion?: boolean;
  lowResourceMode?: boolean; // Disables heavy ambient canvas VFX and visualizer loops
}

export type ViewId =
  | 'home'
  | 'now-playing'
  | 'search'
  | 'library'
  | 'legal'
  | 'import'
  | 'favorites'
  | 'playlist-detail'
  | 'history'
  | 'settings'
  | 'integrations';

export type LicenseType =
  | 'Public Domain (CC0)'
  | 'Creative Commons CC-BY 4.0'
  | 'Creative Commons CC-BY-SA 4.0'
  | 'Open Audio License (Free Commercial)';

export interface LicenseInfo {
  type: LicenseType;
  author: string;
  authorUrl?: string;
  sourceUrl: string;
  allowCommercial: boolean;
  allowRemix: boolean;
  attributionRequired: boolean;
  downloadAllowed: boolean;
  termsSummary: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverGradient: string; // CSS gradient representation
  coverImage?: string; // Optional custom data URL or image path
  genre: string;
  bpm?: number;
  source: 'legal_curated' | 'local_imported' | 'generative_cyberpunk';
  license: LicenseInfo;
  audioUrl?: string; // If using external/local blob
  synthSeed?: number; // For procedural Web Audio synth
  synthStyle?: 'cyber_arpeggio' | 'neon_bass' | 'ambient_void' | 'lofi_pulse' | 'techno_drive';
  addedAt: string;
  lyrics?: string[];
  fileSize?: string;
  storageStatus?: 'session' | 'persistent';
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverGradient: string;
  trackIds: string[];
  createdAt: string;
  isCustom?: boolean;
}

export interface HistoryItem {
  id: string;
  trackId: string;
  playedAt: number; // timestamp
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Track[];
  queueIndex: number;
}

export interface EqualizerBands {
  '60Hz': number;
  '250Hz': number;
  '1kHz': number;
  '4kHz': number;
  '12kHz': number;
}

export interface EqualizerProfile {
  id: string;
  name: string;
  description?: string;
  bands: EqualizerBands;
  isCustom: boolean;
  colorTag?: string;
  createdAt?: string;
}

export type AmbientEffectType = 'rain' | 'static' | 'snow' | 'thunder' | 'embers' | 'matrix';

export interface ThunderConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  glow: number;
  type?: AmbientEffectType;
}

export interface ArtworkVisualConfig {
  pulseEnabled: boolean;
  rotateShape: boolean;
  glowColor: string;
}

export interface ElementBackdropConfig {
  enabled: boolean;
  imageUrl: string;
  scale: number; // 1.0 to 2.5
  positionX: number; // 0 to 100 (%)
  positionY: number; // 0 to 100 (%)
  opacity: number; // 0.1 to 1.0
  overlayOpacity: number; // 0.1 to 0.95
  blur: number; // 0 to 20px
}

export type BackdropTarget = 'sidebar' | 'playerBar' | 'mainModule';

export interface CustomBackdropsConfig {
  sidebar: ElementBackdropConfig;
  playerBar: ElementBackdropConfig;
  mainModule: ElementBackdropConfig;
}

export const DEFAULT_CUSTOM_BACKDROPS: CustomBackdropsConfig = {
  sidebar: {
    enabled: false,
    imageUrl: '',
    scale: 1.0,
    positionX: 50,
    positionY: 50,
    opacity: 0.45,
    overlayOpacity: 0.75,
    blur: 0
  },
  playerBar: {
    enabled: false,
    imageUrl: '',
    scale: 1.0,
    positionX: 50,
    positionY: 50,
    opacity: 0.4,
    overlayOpacity: 0.75,
    blur: 0
  },
  mainModule: {
    enabled: false,
    imageUrl: '',
    scale: 1.0,
    positionX: 50,
    positionY: 50,
    opacity: 0.25,
    overlayOpacity: 0.85,
    blur: 0
  }
};



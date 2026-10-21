import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';
import { INITIAL_PLAYLISTS, INITIAL_TRACKS } from '../data/mockTracks';
import {
  saveAudioBlob,
  getAudioBlob,
  deleteAudioBlob
} from '../services/storage/indexedDbStorage';
import {
  HistoryItem,
  Playlist,
  ThemeId,
  Track,
  ViewId,
  VisualizerMode,
  EqualizerBands,
  EqualizerProfile,
  CustomColorPalette,
  ComponentCustomization,
  ThunderConfig,
  ArtworkVisualConfig,
  AmbientEffectType,
  CustomBackdropsConfig,
  ElementBackdropConfig,
  DEFAULT_CUSTOM_BACKDROPS,
  BackdropTarget
} from '../types/music';
import {
  DEFAULT_BANDS,
  FACTORY_EQUALIZER_PROFILES,
  STORAGE_KEY_ACTIVE_BANDS,
  STORAGE_KEY_ACTIVE_PRESET,
  loadSavedCustomProfiles,
  saveCustomProfilesToStorage
} from '../data/equalizerProfiles';

export const DEFAULT_CUSTOM_COLORS: CustomColorPalette = {
  isCustomActive: false,
  accentPrimary: '#a855f7',
  accentSecondary: '#00e5ff',
  bgMain: '#07060c',
  bgSurface: '#0e0c18',
  bgElevated: '#161326',
  glowIntensity: 1.0,
  crtScanlines: false,
  scanlineOpacity: 0.15,
  tacticalHudBrackets: true,
  bassPulseReactive: true
};

export const DEFAULT_COMPONENT_CUSTOMIZATION: ComponentCustomization = {
  playerBarStyle: 'cyber-dock',
  artworkStyle: 'hologram-glow',
  backgroundVfx: 'thunder-storm',
  sidebarDensity: 'hud-expanded',
  showPeakMeter: true,
  d3VisualizerSubStyle: 'radar-hud',
  d3Sensitivity: 1.0,
  fontScale: 1.0,
  fontFamily: 'jakarta',
  highContrastText: false,
  reducedMotion: false
};

interface MusicContextType {
  // Navigation & Views
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string | null) => void;

  // Catalog & Library
  tracks: Track[];
  playlists: Playlist[];
  favorites: Set<string>;
  history: HistoryItem[];
  isHistoryPaused: boolean;
  togglePauseHistory: () => void;
  clearHistory: () => void;

  // Themes & Visualizer
  activeTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;

  // Full Customization System
  customColors: CustomColorPalette;
  updateCustomColors: (partial: Partial<CustomColorPalette>) => void;
  componentCustomization: ComponentCustomization;
  updateComponentCustomization: (partial: Partial<ComponentCustomization>) => void;
  resetAllToDefaults: () => void;

  // Equalizer & DSP Presets
  equalizerPreset: string;
  setEqualizerPreset: (preset: string) => void;
  equalizerProfiles: EqualizerProfile[];
  activeEqualizerBands: EqualizerBands;
  setCustomEqualizerBands: (bands: EqualizerBands) => void;
  saveCustomEqualizerProfile: (name: string, bands: EqualizerBands, description?: string, colorTag?: string) => EqualizerProfile;
  updateCustomEqualizerProfile: (id: string, updates: Partial<EqualizerProfile>) => void;
  deleteCustomEqualizerProfile: (id: string) => boolean;
  resetEqualizerToDefaults: () => void;
  importEqualizerProfiles: (profiles: EqualizerProfile[]) => number;
  stereoBalance: number;
  setStereoBalance: (pan: number) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  sleepTimerMinutes: number | null;
  setSleepTimer: (minutes: number | null) => void;

  // Playback State
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

  // Playback Controls
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  // Favorites
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;

  // Queue Operations
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;

  // Playlist Operations
  createPlaylist: (name: string, description?: string) => string;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  duplicatePlaylist: (id: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  exportPlaylistAsM3U: (playlistId: string) => void;

  // Local Import & Files
  importLocalFiles: (files: FileList | File[]) => Promise<number>;
  editTrackMetadata: (trackId: string, updates: Partial<Track>) => void;
  deleteLocalTrack: (trackId: string) => void;

  // Legal Downloads
  downloadLegalTrack: (track: Track) => void;

  // Modals & Sheets
  isFullscreenPlayerOpen: boolean;
  setIsFullscreenPlayerOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isAudioSettingsOpen: boolean;
  setIsAudioSettingsOpen: (open: boolean) => void;
  isLogoModalOpen: boolean;
  setIsLogoModalOpen: (open: boolean) => void;
  isWatchModalOpen: boolean;
  setIsWatchModalOpen: (open: boolean) => void;
  isLyricPanelOpen: boolean;
  setIsLyricPanelOpen: (open: boolean) => void;
  lyricTargetTrack: Track | null;
  openLyricPanel: (track?: Track) => void;
  closeLyricPanel: () => void;
  updateTrackLyrics: (trackId: string, lyrics: string[]) => void;

  // Sidebar Controls
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (open: boolean) => void;

  // Spotify Export Modal
  isSpotifyModalOpen: boolean;
  spotifyModalPlaylistId: string | null;
  openSpotifyModal: (playlistId?: string) => void;
  closeSpotifyModal: () => void;

  // Artwork Customizer Modal
  artworkModalTrack: Track | null;
  openArtworkModal: (track: Track) => void;
  closeArtworkModal: () => void;

  // Metadata Editor Modal
  editingMetadataTrack: Track | null;
  openEditMetadataModal: (track: Track) => void;
  closeEditMetadataModal: () => void;

  // Audio Reactive Thunder & Ambient Background
  thunderConfig: ThunderConfig;
  setThunderConfig: (config: Partial<ThunderConfig>) => void;

  // Low Resource / Eco Mode (Disables heavy canvas VFX and visualizers to save CPU/battery)
  lowResourceMode: boolean;
  setLowResourceMode: (enabled: boolean) => void;

  // System-wide Color Customization Modal
  isColorModalOpen: boolean;
  setIsColorModalOpen: (open: boolean) => void;

  // Artwork Pulsing & Rotating Background Customization
  artworkVisualConfig: ArtworkVisualConfig;
  setArtworkVisualConfig: (config: Partial<ArtworkVisualConfig>) => void;

  // Custom Backdrops for UI Elements (Sidebar, PlayerBar & Modules with interactive framing)
  customBackdrops: CustomBackdropsConfig;
  updateCustomBackdrop: (target: BackdropTarget, config: Partial<ElementBackdropConfig>) => void;
  resetCustomBackdrop: (target: BackdropTarget) => void;
  isBackdropModalOpen: boolean;
  backdropModalTarget: BackdropTarget;
  openBackdropModal: (target?: BackdropTarget) => void;
  closeBackdropModal: () => void;

  // AI Assistant Global Drawer
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  toggleAIAssistant: () => void;

  // Feedback Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeView, setActiveView] = useState<ViewId>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Tracks & Playlists state
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const savedCustom = localStorage.getItem('phorocket_tracks_custom');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const saved = localStorage.getItem('phorocket_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_TRACKS, ...parsed];
      }
    } catch {
      // ignore
    }
    return INITIAL_TRACKS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('phorocket_playlists');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PLAYLISTS;
  });

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('phorocket_favorites');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // ignore
    }
    return new Set(['pho-01', 'pho-02']);
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('phorocket_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'h-1', trackId: 'pho-01', playedAt: Date.now() - 1000 * 60 * 14 },
      { id: 'h-2', trackId: 'pho-04', playedAt: Date.now() - 1000 * 60 * 45 }
    ];
  });

  const [isHistoryPaused, setIsHistoryPaused] = useState(false);

  // Themes & Visualizer
  const [activeTheme, setActiveThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('phorocket_theme') as ThemeId;
    return saved || 'violet-pulse';
  });

  const [visualizerMode, setVisualizerModeState] = useState<VisualizerMode>(() => {
    const saved = localStorage.getItem('phorocket_visualizer_mode') as VisualizerMode;
    return saved || 'bars';
  });

  // Custom Color Palette State
  const [customColors, setCustomColorsState] = useState<CustomColorPalette>(() => {
    try {
      const saved = localStorage.getItem('phorocket_custom_colors');
      if (saved) return { ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CUSTOM_COLORS;
  });

  // Component Customization State
  const [componentCustomization, setComponentCustomizationState] = useState<ComponentCustomization>(() => {
    try {
      const saved = localStorage.getItem('phorocket_component_customization');
      if (saved) return { ...DEFAULT_COMPONENT_CUSTOMIZATION, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_COMPONENT_CUSTOMIZATION;
  });

  // Equalizer & Presets State
  const [customProfiles, setCustomProfiles] = useState<EqualizerProfile[]>(() => {
    return loadSavedCustomProfiles();
  });

  const equalizerProfiles = useMemo<EqualizerProfile[]>(() => {
    return [...FACTORY_EQUALIZER_PROFILES, ...customProfiles];
  }, [customProfiles]);

  const [equalizerPreset, setEqualizerPresetState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_PRESET) || 'flat';
  });

  const [activeEqualizerBands, setActiveEqualizerBandsState] = useState<EqualizerBands>(() => {
    try {
      const savedBands = localStorage.getItem(STORAGE_KEY_ACTIVE_BANDS);
      if (savedBands) {
        return JSON.parse(savedBands);
      }
    } catch {}
    return DEFAULT_BANDS;
  });

  const [stereoBalance, setStereoBalanceState] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<number | null>(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(INITIAL_TRACKS[0].duration);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // Modals
  const [isFullscreenPlayerOpen, setIsFullscreenPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [isLyricPanelOpen, setIsLyricPanelOpen] = useState(false);
  const [lyricTargetTrack, setLyricTargetTrack] = useState<Track | null>(null);

  const openLyricPanel = useCallback((track?: Track) => {
    if (track) {
      setLyricTargetTrack(track);
    } else if (currentTrack) {
      setLyricTargetTrack(currentTrack);
    }
    setIsLyricPanelOpen(true);
  }, [currentTrack]);

  const closeLyricPanel = useCallback(() => {
    setIsLyricPanelOpen(false);
  }, []);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Spotify Export Modal
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [spotifyModalPlaylistId, setSpotifyModalPlaylistId] = useState<string | null>(null);
  const openSpotifyModal = useCallback((playlistId?: string) => {
    if (playlistId) {
      setSpotifyModalPlaylistId(playlistId);
    }
    setIsSpotifyModalOpen(true);
  }, []);
  const closeSpotifyModal = useCallback(() => {
    setIsSpotifyModalOpen(false);
  }, []);

  // Artwork Modal
  const [artworkModalTrack, setArtworkModalTrack] = useState<Track | null>(null);
  const openArtworkModal = useCallback((track: Track) => {
    setArtworkModalTrack(track);
  }, []);
  const closeArtworkModal = useCallback(() => {
    setArtworkModalTrack(null);
  }, []);

  // Metadata Editor Modal
  const [editingMetadataTrack, setEditingMetadataTrack] = useState<Track | null>(null);
  const openEditMetadataModal = useCallback((track: Track) => {
    setEditingMetadataTrack(track);
  }, []);
  const closeEditMetadataModal = useCallback(() => {
    setEditingMetadataTrack(null);
  }, []);

  // Ambient / Thunder Background Reactive Effect
  const [thunderConfig, setThunderConfigState] = useState<ThunderConfig>(() => {
    try {
      const saved = localStorage.getItem('phorocket_thunder_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          color: parsed.color || '#00f0ff',
          intensity: parsed.intensity ?? 1.0,
          glow: parsed.glow ?? 1.2,
          type: parsed.type || 'rain'
        };
      }
    } catch {
      // ignore
    }
    return {
      enabled: true,
      color: '#00f0ff',
      intensity: 1.0,
      glow: 1.2,
      type: 'rain'
    };
  });

  const setThunderConfig = useCallback((updates: Partial<ThunderConfig>) => {
    setThunderConfigState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('phorocket_thunder_config', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Artwork Pulsing & Rotating Background Customization
  const [artworkVisualConfig, setArtworkVisualConfigState] = useState<ArtworkVisualConfig>(() => {
    try {
      const saved = localStorage.getItem('phorocket_artwork_visual_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      pulseEnabled: true,
      rotateShape: true,
      glowColor: '#a855f7'
    };
  });

  const setArtworkVisualConfig = useCallback((updates: Partial<ArtworkVisualConfig>) => {
    setArtworkVisualConfigState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('phorocket_artwork_visual_config', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Low Resource / Eco Mode (Pauses ambient canvas loops and heavy visualizer processing)
  const [lowResourceMode, setLowResourceModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('phorocket_low_resource') === 'true';
    } catch {
      return false;
    }
  });

  const setLowResourceMode = useCallback((enabled: boolean) => {
    setLowResourceModeState(enabled);
    try {
      localStorage.setItem('phorocket_low_resource', String(enabled));
    } catch {}
    if (enabled) {
      document.documentElement.classList.add('low-resource-mode');
      showToast('Modo bajo consumo activado: Efectos ambientales y visualizadores pesados pausados');
    } else {
      document.documentElement.classList.remove('low-resource-mode');
      showToast('Modo normal restaurado: Efectos visuales y ambientales activos');
    }
  }, [showToast]);

  useEffect(() => {
    if (lowResourceMode) {
      document.documentElement.classList.add('low-resource-mode');
    } else {
      document.documentElement.classList.remove('low-resource-mode');
    }
  }, [lowResourceMode]);

  // System-wide Color Customization Modal
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // Custom Backdrops State (Sidebar, PlayerBar & Modules with positioning, zoom, opacity, and contrast overlay)
  const [customBackdrops, setCustomBackdropsState] = useState<CustomBackdropsConfig>(() => {
    try {
      const saved = localStorage.getItem('phorocket_custom_backdrops');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          sidebar: { ...DEFAULT_CUSTOM_BACKDROPS.sidebar, ...(parsed.sidebar || {}) },
          playerBar: { ...DEFAULT_CUSTOM_BACKDROPS.playerBar, ...(parsed.playerBar || {}) },
          mainModule: { ...DEFAULT_CUSTOM_BACKDROPS.mainModule, ...(parsed.mainModule || {}) }
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOM_BACKDROPS;
  });

  const updateCustomBackdrop = useCallback((target: BackdropTarget, updates: Partial<ElementBackdropConfig>) => {
    setCustomBackdropsState((prev) => {
      const next: CustomBackdropsConfig = {
        ...prev,
        [target]: {
          ...prev[target],
          ...updates
        }
      };
      try {
        localStorage.setItem('phorocket_custom_backdrops', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save custom backdrops to localStorage', err);
      }
      return next;
    });
  }, []);

  const resetCustomBackdrop = useCallback((target: BackdropTarget) => {
    setCustomBackdropsState((prev) => {
      const next: CustomBackdropsConfig = {
        ...prev,
        [target]: { ...DEFAULT_CUSTOM_BACKDROPS[target] }
      };
      try {
        localStorage.setItem('phorocket_custom_backdrops', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save custom backdrops to localStorage', err);
      }
      return next;
    });
  }, []);

  // Custom Backdrop Modal
  const [isBackdropModalOpen, setIsBackdropModalOpen] = useState(false);
  const [backdropModalTarget, setBackdropModalTarget] = useState<BackdropTarget>('sidebar');

  const openBackdropModal = useCallback((target: BackdropTarget = 'sidebar') => {
    setBackdropModalTarget(target);
    setIsBackdropModalOpen(true);
  }, []);

  const closeBackdropModal = useCallback(() => {
    setIsBackdropModalOpen(false);
  }, []);

  // AI Assistant Global Drawer State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const toggleAIAssistant = useCallback(() => {
    setIsAIAssistantOpen((prev) => !prev);
  }, []);


  // Sync theme attribute to HTML tag
  const setTheme = useCallback((theme: ThemeId) => {
    setActiveThemeState(theme);
    localStorage.setItem('phorocket_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const setVisualizerMode = useCallback((mode: VisualizerMode) => {
    setVisualizerModeState(mode);
    localStorage.setItem('phorocket_visualizer_mode', mode);
  }, []);

  // Initial sync of active equalizer bands
  useEffect(() => {
    try {
      const savedBands = localStorage.getItem(STORAGE_KEY_ACTIVE_BANDS);
      if (savedBands) {
        const bands = JSON.parse(savedBands);
        audioEngine.set5BandEqualizer(bands);
      }
    } catch {}
  }, []);

  const setCustomEqualizerBands = useCallback((bands: EqualizerBands) => {
    setActiveEqualizerBandsState(bands);
    localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(bands));
    audioEngine.set5BandEqualizer(bands);
  }, []);

  const setEqualizerPreset = useCallback((presetId: string) => {
    setEqualizerPresetState(presetId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, presetId);

    const profile = [...FACTORY_EQUALIZER_PROFILES, ...customProfiles].find(p => p.id === presetId);
    if (profile) {
      setActiveEqualizerBandsState(profile.bands);
      localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(profile.bands));
      audioEngine.set5BandEqualizer(profile.bands);
      showToast(`Perfil acústico cambiado a "${profile.name}"`);
    } else {
      audioEngine.setEqualizer(presetId);
      showToast('Perfil acústico cambiado');
    }
  }, [customProfiles, showToast]);

  const saveCustomEqualizerProfile = useCallback((name: string, bands: EqualizerBands, description?: string, colorTag?: string) => {
    const trimmedName = name.trim() || `Perfil Personalizado ${customProfiles.length + 1}`;
    const newProfile: EqualizerProfile = {
      id: `custom_eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      description: description?.trim() || `Perfil personalizado (${bands['60Hz']}dB, ${bands['250Hz']}dB, ${bands['1kHz']}dB, ${bands['4kHz']}dB, ${bands['12kHz']}dB)`,
      bands: { ...bands },
      isCustom: true,
      colorTag: colorTag || '#a855f7',
      createdAt: new Date().toISOString()
    };

    setCustomProfiles(prev => {
      const next = [newProfile, ...prev];
      saveCustomProfilesToStorage(next);
      return next;
    });

    setEqualizerPresetState(newProfile.id);
    localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, newProfile.id);
    setActiveEqualizerBandsState(newProfile.bands);
    localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(newProfile.bands));
    audioEngine.set5BandEqualizer(newProfile.bands);
    showToast(`Perfil "${trimmedName}" guardado correctamente`);

    return newProfile;
  }, [customProfiles.length, showToast]);

  const updateCustomEqualizerProfile = useCallback((id: string, updates: Partial<EqualizerProfile>) => {
    setCustomProfiles(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            bands: updates.bands ? { ...updates.bands } : p.bands
          };
        }
        return p;
      });
      saveCustomProfilesToStorage(next);
      return next;
    });

    if (equalizerPreset === id && updates.bands) {
      setActiveEqualizerBandsState(updates.bands);
      localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(updates.bands));
      audioEngine.set5BandEqualizer(updates.bands);
    }
    showToast('Perfil de ecualización actualizado');
  }, [equalizerPreset, showToast]);

  const deleteCustomEqualizerProfile = useCallback((id: string) => {
    const target = customProfiles.find(p => p.id === id);
    if (!target) return false;

    setCustomProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveCustomProfilesToStorage(next);
      return next;
    });

    if (equalizerPreset === id) {
      setEqualizerPresetState('flat');
      localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, 'flat');
      const flatProfile = FACTORY_EQUALIZER_PROFILES.find(p => p.id === 'flat')!;
      setActiveEqualizerBandsState(flatProfile.bands);
      localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(flatProfile.bands));
      audioEngine.set5BandEqualizer(flatProfile.bands);
    }

    showToast(`Perfil "${target.name}" eliminado`);
    return true;
  }, [customProfiles, equalizerPreset, showToast]);

  const resetEqualizerToDefaults = useCallback(() => {
    setCustomProfiles([]);
    saveCustomProfilesToStorage([]);
    setEqualizerPresetState('flat');
    localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, 'flat');
    const flatProfile = FACTORY_EQUALIZER_PROFILES.find(p => p.id === 'flat')!;
    setActiveEqualizerBandsState(flatProfile.bands);
    localStorage.setItem(STORAGE_KEY_ACTIVE_BANDS, JSON.stringify(flatProfile.bands));
    audioEngine.set5BandEqualizer(flatProfile.bands);
    showToast('Ecualizador restablecido a perfiles de fábrica');
  }, [showToast]);

  const importEqualizerProfiles = useCallback((profilesToImport: EqualizerProfile[]) => {
    if (!Array.isArray(profilesToImport) || profilesToImport.length === 0) return 0;
    const sanitized: EqualizerProfile[] = profilesToImport.filter(p =>
      p && typeof p.name === 'string' && p.bands &&
      typeof p.bands['60Hz'] === 'number' &&
      typeof p.bands['250Hz'] === 'number' &&
      typeof p.bands['1kHz'] === 'number' &&
      typeof p.bands['4kHz'] === 'number' &&
      typeof p.bands['12kHz'] === 'number'
    ).map(p => ({
      id: `imported_eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: p.name,
      description: p.description || 'Perfil importado',
      bands: { ...p.bands },
      isCustom: true,
      colorTag: p.colorTag || '#06b6d4',
      createdAt: new Date().toISOString()
    }));

    if (sanitized.length === 0) return 0;

    setCustomProfiles(prev => {
      const next = [...sanitized, ...prev];
      saveCustomProfilesToStorage(next);
      return next;
    });

    showToast(`Se importaron ${sanitized.length} perfiles con éxito`);
    return sanitized.length;
  }, [showToast]);

  // Custom Colors & Component Customization Handlers
  const updateCustomColors = useCallback((partial: Partial<CustomColorPalette>) => {
    setCustomColorsState((prev) => {
      const next = { ...prev, ...partial, isCustomActive: true };
      try {
        localStorage.setItem('phorocket_custom_colors', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const updateComponentCustomization = useCallback((partial: Partial<ComponentCustomization>) => {
    setComponentCustomizationState((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem('phorocket_component_customization', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Sync custom CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    if (customColors.isCustomActive) {
      const hexToRgb = (hex: string) => {
        let c = hex.trim().replace('#', '');
        if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
        if (c.length !== 6) return '168, 85, 247';
        const num = parseInt(c, 16);
        return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
      };

      const rgb = hexToRgb(customColors.accentPrimary);
      root.style.setProperty('--accent-primary', customColors.accentPrimary);
      root.style.setProperty('--accent-secondary', customColors.accentSecondary);
      root.style.setProperty('--accent-glow', `rgba(${rgb}, ${0.4 * customColors.glowIntensity})`);
      root.style.setProperty('--accent-rgb', rgb);
      root.style.setProperty('--selection-bg', `rgba(${rgb}, 0.22)`);
      root.style.setProperty('--bg-main', customColors.bgMain);
      root.style.setProperty('--bg-surface', customColors.bgSurface);
      root.style.setProperty('--bg-elevated', customColors.bgElevated);
      root.style.setProperty('--border-accent', `rgba(${rgb}, 0.35)`);
    } else {
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-secondary');
      root.style.removeProperty('--accent-glow');
      root.style.removeProperty('--accent-rgb');
      root.style.removeProperty('--selection-bg');
      root.style.removeProperty('--bg-main');
      root.style.removeProperty('--bg-surface');
      root.style.removeProperty('--bg-elevated');
      root.style.removeProperty('--border-accent');
    }
  }, [customColors]);

  // Sync global UI font family, font scaling and accessibility preferences to root
  useEffect(() => {
    const scale = componentCustomization.fontScale ?? 1.0;
    document.documentElement.style.fontSize = `${scale * 100}%`;
    document.documentElement.style.setProperty('--ui-font-scale', `${scale}`);

    // System-wide Font Family configuration
    const font = componentCustomization.fontFamily || 'jakarta';
    const fontMap: Record<string, { body: string; heading: string }> = {
      jakarta: {
        body: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        heading: "'Outfit', 'Plus Jakarta Sans', sans-serif"
      },
      outfit: {
        body: "'Outfit', system-ui, sans-serif",
        heading: "'Outfit', sans-serif"
      },
      orbitron: {
        body: "'Plus Jakarta Sans', system-ui, sans-serif",
        heading: "'Orbitron', sans-serif"
      },
      rajdhani: {
        body: "'Rajdhani', 'Plus Jakarta Sans', sans-serif",
        heading: "'Rajdhani', sans-serif"
      },
      inter: {
        body: "'Inter', system-ui, -apple-system, sans-serif",
        heading: "'Inter', sans-serif"
      },
      'space-grotesk': {
        body: "'Space Grotesk', system-ui, sans-serif",
        heading: "'Space Grotesk', sans-serif"
      },
      jetbrains: {
        body: "'JetBrains Mono', monospace",
        heading: "'JetBrains Mono', monospace"
      },
      poppins: {
        body: "'Poppins', system-ui, sans-serif",
        heading: "'Poppins', sans-serif"
      }
    };

    const selectedFont = fontMap[font] || fontMap.jakarta;
    document.documentElement.style.setProperty('--font-body', selectedFont.body);
    document.documentElement.style.setProperty('--font-heading', selectedFont.heading);

    if (componentCustomization.highContrastText) {
      document.documentElement.classList.add('high-contrast-text');
    } else {
      document.documentElement.classList.remove('high-contrast-text');
    }

    if (componentCustomization.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [
    componentCustomization.fontScale,
    componentCustomization.fontFamily,
    componentCustomization.highContrastText,
    componentCustomization.reducedMotion
  ]);

  // Reset Everything to Factory Defaults ("Regresar al predeterminado por si algo sale feo")
  const resetAllToDefaults = useCallback(() => {
    setActiveThemeState('violet-pulse');
    localStorage.setItem('phorocket_theme', 'violet-pulse');
    document.documentElement.setAttribute('data-theme', 'violet-pulse');

    setCustomColorsState(DEFAULT_CUSTOM_COLORS);
    localStorage.removeItem('phorocket_custom_colors');

    setComponentCustomizationState(DEFAULT_COMPONENT_CUSTOMIZATION);
    localStorage.removeItem('phorocket_component_customization');

    setVisualizerModeState('bars');
    localStorage.setItem('phorocket_visualizer_mode', 'bars');

    const root = document.documentElement;
    root.style.fontSize = '100%';
    root.style.removeProperty('--ui-font-scale');
    root.classList.remove('high-contrast-text');
    root.classList.remove('reduce-motion');
    root.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-secondary');
    root.style.removeProperty('--accent-glow');
    root.style.removeProperty('--accent-rgb');
    root.style.removeProperty('--selection-bg');
    root.style.removeProperty('--bg-main');
    root.style.removeProperty('--bg-surface');
    root.style.removeProperty('--bg-elevated');
    root.style.removeProperty('--border-accent');

    // Also reset equalizer
    resetEqualizerToDefaults();

    showToast('Configuración restablecida: Colores, componentes y audio vueltos al predeterminado');
  }, [resetEqualizerToDefaults, showToast]);

  const setStereoBalance = useCallback((pan: number) => {
    setStereoBalanceState(pan);
    audioEngine.setStereoPan(pan);
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed);
    audioEngine.setPlaybackSpeed(speed);
    showToast(`Velocidad de reproducción ajustada a ${speed}x`);
  }, [showToast]);

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutesState(minutes);
    if (minutes === null) {
      audioEngine.cancelSleepTimer();
      showToast('Temporizador de apagado desactivado');
    } else {
      audioEngine.startSleepTimer(minutes, () => {
        setIsPlaying(false);
        setSleepTimerMinutesState(null);
        showToast('Temporizador de apagado completado: reproducción pausada');
      });
      showToast(`Temporizador de apagado activado: ${minutes} minutos`);
    }
  }, [showToast]);

  // Restore audio Blobs from IndexedDB upon initial mount
  useEffect(() => {
    const restoreBlobs = async () => {
      const localOnly = tracks.filter((t) => t.source === 'local_imported');
      if (localOnly.length === 0) return;
      let updated = false;
      const restored = await Promise.all(
        tracks.map(async (t) => {
          if (t.source === 'local_imported' && !t.audioUrl) {
            const blob = await getAudioBlob(t.id);
            if (blob) {
              updated = true;
              return {
                ...t,
                audioUrl: URL.createObjectURL(blob),
                storageStatus: 'persistent' as const
              };
            }
          }
          return t;
        })
      );
      if (updated) {
        setTracks(restored);
      }
    };
    restoreBlobs();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('phorocket_playlists', JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('phorocket_favorites', JSON.stringify(Array.from(favorites)));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('phorocket_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Audio Engine Callbacks
  useEffect(() => {
    audioEngine.setCallbacks(
      (time) => {
        setCurrentTime(time);
      },
      () => {
        // Track ended
        handleTrackEnded();
      }
    );
  }, [repeatMode, queueIndex, queue]);

  const recordHistory = useCallback((track: Track) => {
    if (isHistoryPaused) return;
    setHistory((prev) => [
      { id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, trackId: track.id, playedAt: Date.now() },
      ...prev.slice(0, 49) // Keep last 50
    ]);
  }, [isHistoryPaused]);

  // Play a track
  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      // Check if track is in existing queue
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx);
      } else {
        setQueue((prev) => [track, ...prev]);
        setQueueIndex(0);
      }
    }

    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setCurrentTime(0);
    setIsPlaying(true);
    audioEngine.playTrack(track, 0);
    recordHistory(track);
  }, [queue, recordHistory]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, tracks, playTrack]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }

    setQueueIndex(nextIdx);
    const next = queue[nextIdx];
    if (next) {
      setCurrentTrack(next);
      setDuration(next.duration || 180);
      setCurrentTime(0);
      setIsPlaying(true);
      audioEngine.playTrack(next, 0);
      recordHistory(next);
    }
  }, [queue, queueIndex, isShuffle, recordHistory]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    setQueueIndex(prevIdx);
    const prev = queue[prevIdx];
    if (prev) {
      setCurrentTrack(prev);
      setDuration(prev.duration || 180);
      setCurrentTime(0);
      setIsPlaying(true);
      audioEngine.playTrack(prev, 0);
      recordHistory(prev);
    }
  }, [currentTime, queue, queueIndex, seekTo, recordHistory]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      seekTo(0);
      audioEngine.playTrack(currentTrack, 0);
      setIsPlaying(true);
    } else if (repeatMode === 'all' || queueIndex < queue.length - 1) {
      nextTrack();
    } else {
      setIsPlaying(false);
      seekTo(0);
    }
  }, [repeatMode, currentTrack, queueIndex, queue.length, seekTo, nextTrack]);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    setIsMuted(val === 0);
    audioEngine.setVolume(val);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
    showToast(!isShuffle ? 'Modo aleatorio activado' : 'Modo aleatorio desactivado');
  }, [isShuffle, showToast]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      showToast(next === 'off' ? 'Repetición desactivada' : next === 'all' ? 'Repetir toda la cola' : 'Repetir canción actual');
      return next;
    });
  }, [showToast]);

  // Favorites
  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
        showToast('Eliminada de tus canciones favoritas');
      } else {
        next.add(trackId);
        showToast('Añadida a tus canciones favoritas');
      }
      return next;
    });
  }, [showToast]);

  const isFavorite = useCallback((trackId: string) => favorites.has(trackId), [favorites]);

  // Queue
  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
    showToast(`"${track.title}" añadida a la cola`);
  }, [showToast]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      if (startIndex < 0 || startIndex >= prev.length || endIndex < 0 || endIndex >= prev.length) {
        return prev;
      }
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });

    setQueueIndex((prevIndex) => {
      if (prevIndex === startIndex) {
        return endIndex;
      }
      if (startIndex < prevIndex && endIndex >= prevIndex) {
        return prevIndex - 1;
      }
      if (startIndex > prevIndex && endIndex <= prevIndex) {
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
    showToast('Cola de reproducción limpiada');
  }, [currentTrack, showToast]);

  // Playlists
  const createPlaylist = useCallback((name: string, description = '') => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'Nueva Lista Cyberpunk',
      description,
      coverGradient: 'linear-gradient(135deg, #a855f7 0%, #00e5ff 100%)',
      trackIds: [],
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };
    setPlaylists((prev) => [...prev, newPl]);
    showToast(`Playlist "${newPl.name}" creada`);
    return newPl.id;
  }, [showToast]);

  const updatePlaylist = useCallback((id: string, updates: Partial<Playlist>) => {
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === id ? { ...pl, ...updates } : pl))
    );
    showToast('Lista actualizada');
  }, [showToast]);

  const duplicatePlaylist = useCallback((id: string) => {
    const target = playlists.find((pl) => pl.id === id);
    if (!target) return;
    const duplicated: Playlist = {
      ...target,
      id: `pl-${Date.now()}`,
      name: `${target.name} (Copia)`,
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };
    setPlaylists((prev) => [...prev, duplicated]);
    showToast(`Copia de "${target.name}" creada`);
  }, [playlists, showToast]);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== id));
    showToast('Playlist eliminada de tu biblioteca');
  }, [showToast]);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.trackIds.includes(trackId)) {
            showToast('Esta canción ya está en la lista');
            return pl;
          }
          showToast(`Canción agregada a "${pl.name}"`);
          return { ...pl, trackIds: [...pl.trackIds, trackId] };
        }
        return pl;
      })
    );
  }, [showToast]);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, trackIds: pl.trackIds.filter((t) => t !== trackId) };
        }
        return pl;
      })
    );
    showToast('Canción eliminada de la lista');
  }, [showToast]);

  // Local File Import
  const importLocalFiles = useCallback(async (files: FileList | File[]): Promise<number> => {
    const fileArray = Array.from(files);
    let importedCount = 0;
    const newTracks: Track[] = [];

    for (const file of fileArray) {
      // Validate common audio mime/extension
      const validExtensions = /\.(mp3|wav|flac|ogg|aac|m4a)$/i;
      if (!file.type.startsWith('audio/') && !validExtensions.test(file.name)) {
        continue;
      }

      // Check duplicates by filename
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      const isDuplicate = tracks.some((t) => t.title === cleanTitle && t.source === 'local_imported');
      if (isDuplicate) continue;

      const audioBlobUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      // Read audio duration using Audio element
      let fileDuration = 180;
      try {
        const tempAudio = new Audio();
        tempAudio.src = audioBlobUrl;
        await new Promise((resolve) => {
          tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              fileDuration = Math.round(tempAudio.duration);
            }
            resolve(true);
          };
          tempAudio.onerror = () => resolve(true);
          setTimeout(resolve, 1500); // timeout fallback
        });
      } catch {
        // use fallback duration
      }

      const gradients = [
        'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)',
        'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
      ];
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      const newTrack: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: cleanTitle,
        artist: 'Archivo Local',
        album: 'Biblioteca del Dispositivo',
        duration: fileDuration,
        coverGradient: randomGradient,
        genre: 'Local Audio',
        source: 'local_imported',
        audioUrl: audioBlobUrl,
        fileSize: sizeMb,
        storageStatus: 'persistent',
        addedAt: new Date().toISOString().split('T')[0],
        license: {
          type: 'Open Audio License (Free Commercial)',
          author: 'Usuario / Archivo Local',
          sourceUrl: 'local://file-system',
          allowCommercial: true,
          allowRemix: true,
          attributionRequired: false,
          downloadAllowed: true,
          termsSummary: 'Archivo proporcionado voluntariamente por el usuario para reproducción local persistente en IndexedDB.'
        }
      };

      // Persist raw audio file in IndexedDB
      await saveAudioBlob(newTrack.id, file);

      newTracks.push(newTrack);
      importedCount++;
    }

    if (newTracks.length > 0) {
      setTracks((prev) => [...prev, ...newTracks]);
      showToast(`${importedCount} archivo${importedCount > 1 ? 's' : ''} de audio guardado${importedCount > 1 ? 's' : ''} persistentemente en la base de datos del navegador`);
    } else {
      showToast('No se encontraron archivos de audio válidos o ya existían');
    }

    return importedCount;
  }, [tracks, showToast]);

  const editTrackMetadata = useCallback((trackId: string, updates: Partial<Track>) => {
    setTracks((prev) => {
      const next = prev.map((t) => (t.id === trackId ? { ...t, ...updates } : t));
      try {
        const persistentTracks = next.map((t) => {
          const { audioUrl, ...rest } = t;
          return rest;
        });
        localStorage.setItem('phorocket_tracks_custom', JSON.stringify(persistentTracks));
      } catch {
        // ignore
      }
      return next;
    });
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, ...updates } : null));
    }
    if (lyricTargetTrack?.id === trackId) {
      setLyricTargetTrack((prev) => (prev ? { ...prev, ...updates } : null));
    }
    if (editingMetadataTrack?.id === trackId) {
      setEditingMetadataTrack((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Metadatos de la canción actualizados');
  }, [currentTrack, lyricTargetTrack, editingMetadataTrack, showToast]);

  const updateTrackLyrics = useCallback((trackId: string, lyrics: string[]) => {
    editTrackMetadata(trackId, { lyrics });
    showToast('Letras actualizadas en la pista');
  }, [editTrackMetadata, showToast]);

  const deleteLocalTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
    deleteAudioBlob(trackId);
    if (currentTrack?.id === trackId) {
      audioEngine.stopCurrent();
      setIsPlaying(false);
      setCurrentTrack(null);
    }
    showToast('Archivo local eliminado de la biblioteca y de IndexedDB');
  }, [currentTrack, showToast]);

  const exportPlaylistAsM3U = useCallback((playlistId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const plTracks = pl.trackIds
      .map((tid) => tracks.find((t) => t.id === tid))
      .filter(Boolean) as Track[];

    let m3u = '#EXTM3U\n#PLAYLIST:' + pl.name + '\n';
    plTracks.forEach((t) => {
      m3u += `#EXTINF:${t.duration},${t.artist} - ${t.title}\n`;
      m3u += (t.audioUrl || `https://phorocket.io/stream/${t.id}`) + '\n';
    });

    const blob = new Blob([m3u], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phorocket-${pl.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.m3u8`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Playlist "${pl.name}" exportada en formato estándar M3U8`);
  }, [playlists, tracks, showToast]);

  // Legal Audio Download with License File
  const downloadLegalTrack = useCallback((track: Track) => {
    if (!track.license.downloadAllowed) {
      showToast('Esta obra no tiene licencia que autorice su descarga directa');
      return;
    }

    showToast(`Preparando descarga legal de "${track.title}"...`);

    // 1. Generate Audio Blob
    const audioBlob = audioEngine.generateWavFileBlob(track);
    const audioUrl = URL.createObjectURL(audioBlob);
    const sanitizedTitle = track.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const audioLink = document.createElement('a');
    audioLink.href = audioUrl;
    audioLink.download = `phorocket-${sanitizedTitle}.wav`;
    document.body.appendChild(audioLink);
    audioLink.click();
    document.body.removeChild(audioLink);

    // 2. Generate Legal Attribution License file
    const licenseText = `=====================================================
PHOROCKET — CERTIFICADO DE LICENCIA Y ATRIBUCIÓN LEGAL
=====================================================

Pista: ${track.title}
Artista / Autor: ${track.artist}
Álbum: ${track.album}
Género: ${track.genre}
Duración: ${track.duration} segundos

TIPO DE LICENCIA:
${track.license.type}

AUTOR ORIGINAL:
${track.license.author}
${track.license.authorUrl ? `Enlace autor: ${track.license.authorUrl}\n` : ''}
Fuente oficial: ${track.license.sourceUrl}

CONDICIONES DE USO:
- Uso comercial permitido: ${track.license.allowCommercial ? 'SÍ' : 'NO'}
- Obras derivadas / Remix permitido: ${track.license.allowRemix ? 'SÍ' : 'NO'}
- Atribución obligatoria: ${track.license.attributionRequired ? 'SÍ' : 'NO'}
- Descarga permitida: SÍ

RESUMEN DE TÉRMINOS:
${track.license.termsSummary}

TEXTO DE ATRIBUCIÓN SUGERIDO PARA TUS PROYECTOS:
"Música: ${track.title} por ${track.artist} (${track.license.type}). Obtenido mediante Phorocket Legal Discovery."

=====================================================
Generado por Phorocket Music Platform — https://phorocket.io
=====================================================`;

    const licenseBlob = new Blob([licenseText], { type: 'text/plain;charset=utf-8' });
    const licenseUrl = URL.createObjectURL(licenseBlob);
    const licenseLink = document.createElement('a');
    licenseLink.href = licenseUrl;
    licenseLink.download = `phorocket-${sanitizedTitle}-LICENCIA.txt`;
    setTimeout(() => {
      document.body.appendChild(licenseLink);
      licenseLink.click();
      document.body.removeChild(licenseLink);
      URL.revokeObjectURL(audioUrl);
      URL.revokeObjectURL(licenseUrl);
      showToast(`Descarga completada con archivo de licencia y atribución legal`);
    }, 400);
  }, [showToast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    showToast('Historial de reproducción vaciado');
  }, [showToast]);

  const togglePauseHistory = useCallback(() => {
    setIsHistoryPaused((prev) => {
      const next = !prev;
      showToast(next ? 'Historial pausado' : 'Historial reactivado');
      return next;
    });
  }, [showToast]);

  const contextValue = useMemo<MusicContextType>(
    () => ({
      activeView,
      setActiveView,
      selectedPlaylistId,
      setSelectedPlaylistId,
      tracks,
      playlists,
      favorites,
      history,
      isHistoryPaused,
      togglePauseHistory,
      clearHistory,
      activeTheme,
      setTheme,
      visualizerMode,
      setVisualizerMode,
      customColors,
      updateCustomColors,
      componentCustomization,
      updateComponentCustomization,
      resetAllToDefaults,
      equalizerPreset,
      setEqualizerPreset,
      equalizerProfiles,
      activeEqualizerBands,
      setCustomEqualizerBands,
      saveCustomEqualizerProfile,
      updateCustomEqualizerProfile,
      deleteCustomEqualizerProfile,
      resetEqualizerToDefaults,
      importEqualizerProfiles,
      stereoBalance,
      setStereoBalance,
      playbackSpeed,
      setPlaybackSpeed,
      sleepTimerMinutes,
      setSleepTimer,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      queue,
      queueIndex,
      playTrack,
      togglePlayPause,
      seekTo,
      nextTrack,
      prevTrack,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      toggleFavorite,
      isFavorite,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue,
      createPlaylist,
      updatePlaylist,
      duplicatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      exportPlaylistAsM3U,
      importLocalFiles,
      editTrackMetadata,
      deleteLocalTrack,
      downloadLegalTrack,
      isFullscreenPlayerOpen,
      setIsFullscreenPlayerOpen,
      isQueueOpen,
      setIsQueueOpen,
      isAudioSettingsOpen,
      setIsAudioSettingsOpen,
      isLogoModalOpen,
      setIsLogoModalOpen,
      isWatchModalOpen,
      setIsWatchModalOpen,
      isLyricPanelOpen,
      setIsLyricPanelOpen,
      lyricTargetTrack,
      openLyricPanel,
      closeLyricPanel,
      updateTrackLyrics,
      isSidebarOpen,
      toggleSidebar,
      setIsSidebarOpen,
      isSpotifyModalOpen,
      spotifyModalPlaylistId,
      openSpotifyModal,
      closeSpotifyModal,
      artworkModalTrack,
      openArtworkModal,
      closeArtworkModal,
      editingMetadataTrack,
      openEditMetadataModal,
      closeEditMetadataModal,
      thunderConfig,
      setThunderConfig,
      lowResourceMode,
      setLowResourceMode,
      isColorModalOpen,
      setIsColorModalOpen,
      artworkVisualConfig,
      setArtworkVisualConfig,
      customBackdrops,
      updateCustomBackdrop,
      resetCustomBackdrop,
      isBackdropModalOpen,
      backdropModalTarget,
      openBackdropModal,
      closeBackdropModal,
      toastMessage,
      showToast,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
      toggleAIAssistant
    }),
    [
      activeView,
      selectedPlaylistId,
      tracks,
      playlists,
      favorites,
      history,
      isHistoryPaused,
      togglePauseHistory,
      clearHistory,
      activeTheme,
      setTheme,
      visualizerMode,
      setVisualizerMode,
      customColors,
      updateCustomColors,
      componentCustomization,
      updateComponentCustomization,
      resetAllToDefaults,
      equalizerPreset,
      setEqualizerPreset,
      equalizerProfiles,
      activeEqualizerBands,
      setCustomEqualizerBands,
      saveCustomEqualizerProfile,
      updateCustomEqualizerProfile,
      deleteCustomEqualizerProfile,
      resetEqualizerToDefaults,
      importEqualizerProfiles,
      stereoBalance,
      setStereoBalance,
      playbackSpeed,
      setPlaybackSpeed,
      sleepTimerMinutes,
      setSleepTimer,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      queue,
      queueIndex,
      playTrack,
      togglePlayPause,
      seekTo,
      nextTrack,
      prevTrack,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      toggleFavorite,
      isFavorite,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      clearQueue,
      createPlaylist,
      updatePlaylist,
      duplicatePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      exportPlaylistAsM3U,
      importLocalFiles,
      editTrackMetadata,
      updateTrackLyrics,
      deleteLocalTrack,
      downloadLegalTrack,
      isFullscreenPlayerOpen,
      isQueueOpen,
      isAudioSettingsOpen,
      isLogoModalOpen,
      isWatchModalOpen,
      isLyricPanelOpen,
      lyricTargetTrack,
      openLyricPanel,
      closeLyricPanel,
      isSidebarOpen,
      toggleSidebar,
      isSpotifyModalOpen,
      spotifyModalPlaylistId,
      openSpotifyModal,
      closeSpotifyModal,
      artworkModalTrack,
      openArtworkModal,
      closeArtworkModal,
      editingMetadataTrack,
      openEditMetadataModal,
      closeEditMetadataModal,
      thunderConfig,
      setThunderConfig,
      lowResourceMode,
      setLowResourceMode,
      isColorModalOpen,
      setIsColorModalOpen,
      artworkVisualConfig,
      setArtworkVisualConfig,
      customBackdrops,
      updateCustomBackdrop,
      resetCustomBackdrop,
      isBackdropModalOpen,
      backdropModalTarget,
      openBackdropModal,
      closeBackdropModal,
      toastMessage,
      showToast,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
      toggleAIAssistant
    ]
  );

  return <MusicContext.Provider value={contextValue}>{children}</MusicContext.Provider>;
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Activity,
  Download,
  Info,
  ExternalLink,
  Plus,
  Camera,
  Zap,
  ZapOff,
  Sliders,
  Sparkles,
  CloudRain,
  Tv,
  Snowflake,
  Flame,
  Terminal,
  Palette,
  RotateCw,
  X,
  Check,
  Disc3,
  SlidersHorizontal,
  Waves,
  FileCode,
  Music,
  Clock,
  Layers,
  Radio,
  Share2,
  Edit3
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { AudioVisualizer } from '../visualizer/AudioVisualizer';
import { ThunderBackground } from '../visualizer/ThunderBackground';
import { formatTime } from '../../utils/formatters';
import { VisualizerMode } from '../../types/music';

export type NowPlayingTab = 'overview' | 'lyrics' | 'visualizer' | 'metadata' | 'queue';

export const FullscreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
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
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    visualizerMode,
    setVisualizerMode,
    queue,
    queueIndex,
    playTrack,
    downloadLegalTrack,
    playlists,
    addTrackToPlaylist,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimerMinutes,
    setSleepTimer,
    openArtworkModal,
    openLyricPanel,
    openEditMetadataModal,
    setIsAudioSettingsOpen,
    thunderConfig,
    setThunderConfig,
    artworkVisualConfig,
    setArtworkVisualConfig,
    lowResourceMode,
    setLowResourceMode,
    setIsColorModalOpen,
    showToast
  } = useMusic();

  // Core Tabbed Navigation State
  const [activeTab, setActiveTab] = useState<NowPlayingTab>('overview');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showAuraModal, setShowAuraModal] = useState(false);

  // Keyboard shortcut listener for Esc to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPlayerOpen) {
        if (showAuraModal) {
          setShowAuraModal(false);
        } else if (showPlaylistMenu) {
          setShowPlaylistMenu(false);
        } else {
          setIsFullscreenPlayerOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPlayerOpen, showAuraModal, showPlaylistMenu, setIsFullscreenPlayerOpen]);

  if (!isFullscreenPlayerOpen || !currentTrack) return null;

  const favorite = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? ((isScrubbing ? scrubValue : currentTime) / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubValue(parseFloat(e.target.value));
  };

  const handleSliderMouseUp = () => {
    setIsScrubbing(false);
    seekTo(scrubValue);
  };

  const tabs: { id: NowPlayingTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Disc3 },
    { id: 'lyrics', label: 'Lyrics', icon: FileText },
    { id: 'visualizer', label: 'Visualizer', icon: Activity },
    { id: 'metadata', label: 'Metadata', icon: Info },
    { id: 'queue', label: 'Queue', icon: ListMusic }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#07050e]/95 backdrop-blur-3xl flex flex-col overflow-hidden animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-label="Reproductor inmersivo a pantalla completa"
    >
      {/* Ambient background VFX (respects lowResourceMode) */}
      {!lowResourceMode && thunderConfig.enabled && (
        <ThunderBackground className="opacity-90 pointer-events-none" intensityMultiplier={1.0} />
      )}

      {/* Top Header Bar with Clean 3-Zone Contract */}
      <header className="border-b border-white/10 shrink-0 relative z-20 bg-[#0c0919]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2 sm:gap-4 max-w-7xl mx-auto w-full">
          {/* Left Zone: Minimize button & Mini Track Context */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsFullscreenPlayerOpen(false)}
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              title="Cerrar modal de reproducción"
              aria-label="Cerrar reproductor"
            >
              <ChevronDown size={22} />
              <span className="hidden sm:inline text-xs font-semibold text-slate-300">Minimizar</span>
            </button>

            {/* In non-overview tabs, show small pill of current song */}
            {activeTab !== 'overview' && (
              <div
                onClick={() => setActiveTab('overview')}
                className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors max-w-[200px]"
                title="Volver a la vista principal"
              >
                <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                  {currentTrack.coverImage ? (
                    <img src={currentTrack.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-600" />
                  )}
                </div>
                <span className="text-xs text-white truncate font-medium">{currentTrack.title}</span>
              </div>
            )}
          </div>

          {/* Center Zone: Segmented Tab Bar */}
          <nav
            className="flex items-center gap-1 bg-[#151226] p-1 rounded-2xl border border-white/10 max-w-full overflow-x-auto no-scrollbar shadow-inner"
            aria-label="Pestañas de reproducción"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-white shadow-md shadow-purple-950/60 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Zone: Quick Tools & Favorite */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Low Resource Mode Toggle */}
            <button
              onClick={() => {
                setLowResourceMode(!lowResourceMode);
                showToast(lowResourceMode ? 'Modo ahorro desactivado' : 'Modo ahorro activado');
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                lowResourceMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={lowResourceMode ? 'Ahorro de recursos activo' : 'Activar ahorro de recursos'}
              aria-label="Ahorro de recursos"
            >
              {lowResourceMode ? <ZapOff size={16} className="text-amber-400" /> : <Zap size={16} />}
              <span className="hidden xl:inline text-[11px]">{lowResourceMode ? 'Ahorro ON' : 'Ahorro'}</span>
            </button>

            {/* System Color Customizer Modal Trigger */}
            <button
              onClick={() => setIsColorModalOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1"
              title="Personalizar los colores del sistema"
              aria-label="Personalizar colores"
            >
              <Palette size={16} className="text-[var(--accent-primary)]" />
              <span className="hidden xl:inline text-[11px]">Colores</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-2 rounded-xl border transition-all ${
                favorite
                  ? 'text-rose-500 bg-rose-500/15 border-rose-500/30'
                  : 'text-slate-400 hover:text-white bg-white/5 border-white/10'
              }`}
              title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              aria-label="Favorito"
            >
              <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content Body (Scrollable, full-height) */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {/* ===================================================================== */}
        {/* TAB 1: OVERVIEW (Resumen & Protagonist Playback Experience)            */}
        {/* ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="flex-1 flex flex-col justify-between max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-150">
            {/* Split layout: Artwork on left (or top), details & controls on right (or bottom) */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-14 my-auto w-full">
              {/* Protagonist Artwork Stage with Rotating Squircle Background */}
              <div className="relative flex items-center justify-center p-4 sm:p-6 shrink-0">
                {/* Rotating Squircle Frame with Corner Brackets */}
                <div
                  className={`absolute pointer-events-none rounded-[2.6rem] sm:rounded-[3rem] border-2 transition-transform duration-700 ${
                    artworkVisualConfig.rotateShape && !lowResourceMode
                      ? isPlaying
                        ? 'animate-spin-squircle-fast'
                        : 'animate-spin-squircle'
                      : ''
                  }`}
                  style={{
                    width: 'calc(100% + 2rem)',
                    height: 'calc(100% + 2rem)',
                    maxWidth: '340px',
                    maxHeight: '340px',
                    borderColor: artworkVisualConfig.glowColor,
                    boxShadow: `0 0 35px ${artworkVisualConfig.glowColor}50, inset 0 0 25px ${artworkVisualConfig.glowColor}25`,
                    background: `radial-gradient(circle, ${artworkVisualConfig.glowColor}18 0%, transparent 75%)`
                  }}
                >
                  {/* Cyberpunk corner notches */}
                  <div
                    className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg"
                    style={{ borderColor: artworkVisualConfig.glowColor }}
                  />
                  <div
                    className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg"
                    style={{ borderColor: artworkVisualConfig.glowColor }}
                  />
                  <div
                    className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg"
                    style={{ borderColor: artworkVisualConfig.glowColor }}
                  />
                  <div
                    className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 rounded-br-lg"
                    style={{ borderColor: artworkVisualConfig.glowColor }}
                  />
                </div>

                {/* Inner Cover Artwork */}
                <div
                  className={`relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/20 group transition-all duration-300 ${
                    isPlaying && artworkVisualConfig.pulseEnabled && !lowResourceMode
                      ? 'animate-music-pulse'
                      : 'scale-100'
                  }`}
                  style={{
                    boxShadow: `0 20px 45px -10px ${artworkVisualConfig.glowColor}50`
                  }}
                >
                  {currentTrack.coverImage ? (
                    <img
                      src={currentTrack.coverImage}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center text-white p-6 relative overflow-hidden"
                      style={{ background: currentTrack.coverGradient }}
                    >
                      <div className="w-16 h-16 rounded-2xl border-2 border-white/30 flex items-center justify-center mb-2 backdrop-blur-sm bg-black/25">
                        <span className="font-display font-extrabold text-2xl tracking-wider">PHO</span>
                      </div>
                      <span className="text-xs uppercase tracking-widest font-semibold opacity-85">
                        {currentTrack.genre}
                      </span>
                    </div>
                  )}

                  {/* Hover button to change artwork */}
                  <button
                    onClick={() => openArtworkModal(currentTrack)}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4 backdrop-blur-sm z-20 cursor-pointer"
                    title="Subir o cambiar imagen de esta canción"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)] flex items-center justify-center shadow-lg">
                      <Camera size={20} />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full border border-white/20">
                      Cambiar Carátula
                    </span>
                  </button>
                </div>
              </div>

              {/* Right/Bottom Stage: Track Info, Scrubber, Transport, Audio Options */}
              <div className="flex-1 w-full max-w-xl flex flex-col justify-center space-y-4 sm:space-y-5">
                {/* Track Details & Action Badges */}
                <div className="flex items-start justify-between gap-4 text-center lg:text-left">
                  <div className="flex-1 min-w-0">
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white leading-tight break-words tracking-tight"
                      style={{
                        textShadow: `0 0 25px ${artworkVisualConfig.glowColor}60`
                      }}
                    >
                      {currentTrack.title}
                    </h1>
                    <p className="text-base sm:text-lg font-semibold text-slate-300 mt-1 break-words">
                      {currentTrack.artist}
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2 text-xs text-slate-400">
                      <span>{currentTrack.album || 'Biblioteca del Dispositivo'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {currentTrack.genre}
                      </span>
                      {currentTrack.bpm && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-purple-300 font-medium">{currentTrack.bpm} BPM</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">Licencia Libre</span>
                    </div>
                  </div>

                  {/* Add to Playlist button */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
                      title="Añadir canción a playlist"
                      aria-label="Añadir a playlist"
                    >
                      <Plus size={20} />
                    </button>

                    {showPlaylistMenu && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[#18142a] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-xs text-left animate-in zoom-in-95">
                        <span className="block px-2.5 py-1.5 font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                          Añadir a lista
                        </span>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {playlists.map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => {
                                addTrackToPlaylist(pl.id, currentTrack.id);
                                setShowPlaylistMenu(false);
                                showToast(`Añadida a playlist: ${pl.name}`);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-slate-200 hover:bg-white/10 truncate transition-colors"
                            >
                              {pl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrubber Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative flex items-center h-5">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-primary)] transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.5}
                      value={isScrubbing ? scrubValue : currentTime}
                      onChange={handleSliderChange}
                      onMouseDown={() => {
                        setIsScrubbing(true);
                        setScrubValue(currentTime);
                      }}
                      onMouseUp={handleSliderMouseUp}
                      onTouchStart={() => {
                        setIsScrubbing(true);
                        setScrubValue(currentTime);
                      }}
                      onTouchEnd={handleSliderMouseUp}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      aria-label="Control de reproducción"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-400">
                    <span className="tabular-nums">{formatTime(isScrubbing ? scrubValue : currentTime)}</span>
                    <span className="tabular-nums">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Tactile Transport Controls */}
                <div className="flex items-center justify-center gap-6 sm:gap-8 pt-1">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2.5 rounded-2xl transition-all ${
                      isShuffle
                        ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30'
                        : 'text-slate-400 hover:text-white bg-white/5 border border-white/10'
                    }`}
                    title={isShuffle ? 'Modo aleatorio activo' : 'Activar aleatorio'}
                    aria-label="Aleatorio"
                  >
                    <Shuffle size={20} />
                  </button>

                  <button
                    onClick={prevTrack}
                    className="p-3 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
                    title="Canción anterior"
                    aria-label="Anterior"
                  >
                    <SkipBack size={26} />
                  </button>

                  {/* Main Hero Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] hover:brightness-110 active:scale-95 shadow-2xl transition-all"
                    style={{
                      boxShadow: '0 0 30px var(--accent-glow)'
                    }}
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? (
                      <Pause size={30} fill="currentColor" />
                    ) : (
                      <Play size={30} fill="currentColor" className="ml-1" />
                    )}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-3 rounded-full text-white hover:bg-white/10 transition-colors active:scale-95"
                    title="Siguiente canción"
                    aria-label="Siguiente"
                  >
                    <SkipForward size={26} />
                  </button>

                  <button
                    onClick={cycleRepeat}
                    className={`p-2.5 rounded-2xl transition-all ${
                      repeatMode !== 'off'
                        ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30'
                        : 'text-slate-400 hover:text-white bg-white/5 border border-white/10'
                    }`}
                    title={
                      repeatMode === 'one'
                        ? 'Repetir pista actual'
                        : repeatMode === 'all'
                        ? 'Repetir toda la cola'
                        : 'Repetición desactivada'
                    }
                    aria-label="Repetir"
                  >
                    {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
                </div>

                {/* Volume Row & Quick Utilities */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  {/* Volume Control */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={toggleMute}
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Silenciar"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-28 sm:w-36 h-1.5 bg-white/20 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                      aria-label="Volumen"
                    />
                    <span className="text-[11px] font-mono text-slate-400 w-8">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>

                  {/* Playback Speed & Sleep Timer */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                      {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-[var(--accent-primary)] text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const next = sleepTimerMinutes === null ? 30 : sleepTimerMinutes === 30 ? 60 : null;
                        setSleepTimer(next);
                        showToast(next ? `Temporizador: ${next} min` : 'Temporizador desactivado');
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                        sleepTimerMinutes !== null
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Temporizador de apagado"
                    >
                      <Clock size={12} />
                      <span>{sleepTimerMinutes ? `${sleepTimerMinutes}m` : 'Off'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Customize Aura, Equalizer & Visualizer shortcut */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400">
                  <button
                    onClick={() => setShowAuraModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white transition-all font-semibold"
                    title="Personalizar color del fondo giratorio y pulsación"
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block border border-white/30"
                      style={{ backgroundColor: artworkVisualConfig.glowColor }}
                    />
                    <span>Fondo y Aura</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAudioSettingsOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                      title="Abrir ecualizador paramétrico"
                    >
                      <SlidersHorizontal size={14} className="text-[var(--accent-primary)]" />
                      <span>Ecualizador</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('visualizer')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 border border-[var(--accent-primary)]/30 text-white transition-all font-semibold"
                      title="Ir al visualizador de audio reactivo"
                    >
                      <Activity size={14} className="text-[var(--accent-primary)]" />
                      <span>Visualizador</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: LYRICS (Letras sincronizadas con seek interactivo)             */}
        {/* ===================================================================== */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-150">
            {/* Header controls for lyrics */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-display font-black text-white">Letras de la Canción</h2>
                <p className="text-xs text-slate-400">
                  {currentTrack.lyrics && currentTrack.lyrics.length > 0
                    ? 'Haz clic en cualquier línea para saltar directamente a ese momento del audio.'
                    : 'Sin pista de letras sincronizada.'}
                </p>
              </div>

              <button
                onClick={() => openLyricPanel(currentTrack)}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                title="Abrir panel completo de edición LRC y modo karaoke"
              >
                <Sparkles size={14} />
                <span>Panel & Editor LRC</span>
              </button>
            </div>

            {/* Lyrics Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-6 pr-2 max-h-[55vh]">
              {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
                currentTrack.lyrics.map((line, idx) => {
                  const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
                  let lineTime: number | null = null;
                  let lineText = line;
                  let timestampBadge = '';
                  if (match) {
                    lineTime = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
                    timestampBadge = `[${match[1]}:${match[2]}]`;
                    lineText = match[4];
                  }

                  const isCurrent = lineTime !== null && lineTime <= currentTime;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (lineTime !== null) {
                          seekTo(lineTime);
                        }
                      }}
                      className={`p-3 rounded-2xl transition-all ${
                        lineTime !== null ? 'cursor-pointer hover:bg-white/5 active:scale-98' : 'cursor-default'
                      } ${
                        isCurrent
                          ? 'text-white font-bold text-lg sm:text-xl border-l-4 border-[var(--accent-primary)] pl-4 bg-white/[0.04] shadow-sm'
                          : 'text-slate-400 text-base sm:text-lg'
                      }`}
                    >
                      {timestampBadge && (
                        <span className="text-xs font-mono text-[var(--accent-primary)] mr-3 opacity-80">
                          {timestampBadge}
                        </span>
                      )}
                      <span>{lineText}</span>
                    </div>
                  );
                })
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <FileText size={32} />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-base font-bold text-white">Esta pista no tiene letra asignada</h3>
                    <p className="text-xs text-slate-400">
                      Puedes añadir letras con tiempos LRC o texto normal mediante el editor integrado.
                    </p>
                  </div>
                  <button
                    onClick={() => openLyricPanel(currentTrack)}
                    className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all"
                  >
                    Añadir letras a esta canción
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Docked Mini Playback Bar */}
            <DockedPlaybackBar
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              togglePlayPause={togglePlayPause}
              seekTo={seekTo}
              prevTrack={prevTrack}
              nextTrack={nextTrack}
            />
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: VISUALIZER (Full-width, Modern, High-impact Reactive Stage)     */}
        {/* ===================================================================== */}
        {activeTab === 'visualizer' && (
          <div className="flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-150 space-y-5">
            {/* Top Toolbar: Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[var(--accent-primary)] animate-pulse" />
                <span className="text-sm font-display font-black text-white">
                  Modo de Visualización: <strong className="capitalize text-[var(--accent-primary)]">{visualizerMode}</strong>
                </span>
              </div>

              {/* Mode segmented buttons */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 no-scrollbar">
                {(
                  [
                    'wave',
                    'bars',
                    'spectrum',
                    'circle',
                    'd3-cyberpunk',
                    'd3-radial-hud',
                    'particles',
                    'minimal'
                  ] as const
                ).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setVisualizerMode(m);
                      showToast(`Visualizador: ${m}`);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      visualizerMode === m
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {m === 'd3-cyberpunk' ? 'Cyberpunk' : m === 'd3-radial-hud' ? 'Radial HUD' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: Expansive Reactive Visualizer Stage */}
            <div className="flex-1 min-h-[260px] sm:min-h-[340px] flex items-center justify-center p-4 rounded-3xl bg-[#0c0919]/70 border border-white/10 backdrop-blur-md relative overflow-hidden">
              <AudioVisualizer
                mode={visualizerMode}
                isPlaying={isPlaying && !lowResourceMode}
                height={260}
                sensitivity={1.15}
              />
            </div>

            {/* Bottom Controls: Ambient Weather VFX & Color Picker */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CloudRain size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Efecto Ambiental de Fondo:
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setThunderConfig({ enabled: !thunderConfig.enabled })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                      thunderConfig.enabled
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {thunderConfig.enabled ? 'Ambiente: Activo' : 'Ambiente: Pausado'}
                  </button>
                </div>
              </div>

              {/* Ambient type buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: 'rain' as const, name: 'Lluvia', icon: CloudRain },
                  { id: 'static' as const, name: 'Estática CRT', icon: Tv },
                  { id: 'snow' as const, name: 'Nieve', icon: Snowflake },
                  { id: 'thunder' as const, name: 'Truenos', icon: Zap },
                  { id: 'embers' as const, name: 'Cenizas', icon: Flame },
                  { id: 'matrix' as const, name: 'Matriz', icon: Terminal }
                ].map((amb) => {
                  const Icon = amb.icon;
                  const isCur = (thunderConfig.type || 'rain') === amb.id;
                  return (
                    <button
                      key={amb.id}
                      onClick={() => {
                        setThunderConfig({ type: amb.id, enabled: true });
                        showToast(`Ambiente: ${amb.name}`);
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                        isCur
                          ? 'border-white bg-white/20 text-white font-bold shadow-md'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                      style={
                        isCur
                          ? { borderColor: thunderConfig.color, boxShadow: `0 0 10px ${thunderConfig.color}40` }
                          : undefined
                      }
                    >
                      <Icon size={14} style={isCur ? { color: thunderConfig.color } : undefined} />
                      <span className="truncate">{amb.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Docked Mini Playback Bar */}
            <DockedPlaybackBar
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              togglePlayPause={togglePlayPause}
              seekTo={seekTo}
              prevTrack={prevTrack}
              nextTrack={nextTrack}
            />
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: METADATA (Información técnica, licencia legal y edición)        */}
        {/* ===================================================================== */}
        {activeTab === 'metadata' && (
          <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-150 space-y-6">
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-display font-black text-white">Metadatos & Ficha Técnica</h2>
                  <p className="text-xs text-slate-400">
                    Información detallada sobre compresión, muestreo y derechos legales de esta pista.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditMetadataModal(currentTrack)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
                    title="Editar etiquetas ID3 / metadatos"
                  >
                    <Edit3 size={14} className="text-[var(--accent-primary)]" />
                    <span>Editar Metadatos</span>
                  </button>

                  <button
                    onClick={() => openArtworkModal(currentTrack)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
                    title="Cambiar carátula de esta pista"
                  >
                    <Camera size={14} className="text-[var(--accent-primary)]" />
                    <span>Carátula</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duración Total</span>
                  <p className="text-sm font-mono font-bold text-white">{formatTime(duration)}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tempo / Ritmo</span>
                  <p className="text-sm font-mono font-bold text-purple-300">
                    {currentTrack.bpm ? `${currentTrack.bpm} BPM` : '124 BPM (Est.)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Frecuencia</span>
                  <p className="text-sm font-mono font-bold text-cyan-300">48.0 kHz / 24-bit</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Canales de Audio</span>
                  <p className="text-sm font-mono font-bold text-emerald-300">Estéreo 2.0</p>
                </div>
              </div>

              {/* Detailed Dossier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Track Details */}
                <div className="p-4 rounded-2xl bg-[#0e0b1c] border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Music size={14} className="text-[var(--accent-primary)]" />
                    <span>Datos de la Pista</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Título:</span>
                      <span className="text-white font-medium">{currentTrack.title}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Artista / Creador:</span>
                      <span className="text-white font-medium">{currentTrack.artist}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Álbum:</span>
                      <span className="text-white font-medium">{currentTrack.album || 'Colección Local'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Género Musical:</span>
                      <span className="text-white font-medium">{currentTrack.genre}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Origen:</span>
                      <span className="text-white font-medium">
                        {currentTrack.source === 'local_imported' ? 'Archivo Local en Dispositivo' : 'Catálogo Libre Legal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* License & Legal Information */}
                <div className="p-4 rounded-2xl bg-[#0e0b1c] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileCode size={14} className="text-emerald-400" />
                      <span>Licencia & Derechos</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {currentTrack.license.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Autor Titular:</span>
                      <span className="text-white font-medium">{currentTrack.license.author}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Uso Comercial:</span>
                      <span className={`font-semibold ${currentTrack.license.allowCommercial ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentTrack.license.allowCommercial ? 'Permitido libremente' : 'No comercial'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-400">Atribución Requerida:</span>
                      <span className="text-purple-300 font-semibold">
                        {currentTrack.license.attributionRequired ? 'Obligatoria' : 'Opcional (CC0)'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">
                      {currentTrack.license.termsSummary}
                    </p>
                  </div>

                  {/* Download Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => downloadLegalTrack(currentTrack)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md text-xs active:scale-98"
                    >
                      <Download size={15} />
                      <span>Descargar Audio WAV + Certificado Legal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Docked Mini Playback Bar */}
            <DockedPlaybackBar
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              togglePlayPause={togglePlayPause}
              seekTo={seekTo}
              prevTrack={prevTrack}
              nextTrack={nextTrack}
            />
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: QUEUE (Cola de reproducción interactiva)                       */}
        {/* ===================================================================== */}
        {activeTab === 'queue' && (
          <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-150">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-display font-black text-white">Cola de Reproducción</h2>
                  <p className="text-xs text-slate-400">{queue.length} canciones en la lista activa</p>
                </div>
              </div>

              {/* Queue Items List */}
              <div className="max-h-[50vh] overflow-y-auto space-y-1.5 pr-2">
                {queue.map((track, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 text-white font-bold shadow-md'
                          : 'hover:bg-white/5 text-slate-300 border border-transparent'
                      }`}
                    >
                      <span className="text-xs font-mono tabular-nums text-slate-400 w-6 text-center">
                        {isCurrent ? <Play size={14} className="text-[var(--accent-primary)] mx-auto animate-pulse" /> : idx + 1}
                      </span>

                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        {track.coverImage ? (
                          <img src={track.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-purple-900 flex items-center justify-center text-[10px] font-bold">
                            PHO
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate text-white">{track.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      </div>

                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Docked Mini Playback Bar */}
            <DockedPlaybackBar
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              togglePlayPause={togglePlayPause}
              seekTo={seekTo}
              prevTrack={prevTrack}
              nextTrack={nextTrack}
            />
          </div>
        )}
      </main>

      {/* Modal: Personalizar Fondo y Aura de la Carátula */}
      {showAuraModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none"
          onClick={() => setShowAuraModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#0f0c1e] border border-white/15 rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-md transition-all"
                  style={{
                    backgroundColor: `${artworkVisualConfig.glowColor}25`,
                    borderColor: artworkVisualConfig.glowColor,
                    color: artworkVisualConfig.glowColor
                  }}
                >
                  <RotateCw size={16} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Fondo y Aura de la Carátula</h3>
                  <p className="text-[11px] text-slate-400">Efecto giratorio, pulsación y color</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuraModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Interactive Preview */}
            <div className="flex items-center justify-center py-4 bg-[#080611] rounded-2xl border border-white/10 overflow-hidden relative">
              <div className="relative flex items-center justify-center w-36 h-36">
                <div
                  className={`absolute rounded-2xl border-2 transition-transform duration-700 ${
                    artworkVisualConfig.rotateShape
                      ? isPlaying
                        ? 'animate-spin-squircle-fast'
                        : 'animate-spin-squircle'
                      : ''
                  }`}
                  style={{
                    width: 'calc(100% + 1.2rem)',
                    height: 'calc(100% + 1.2rem)',
                    borderColor: artworkVisualConfig.glowColor,
                    boxShadow: `0 0 24px ${artworkVisualConfig.glowColor}50`,
                    background: `radial-gradient(circle, ${artworkVisualConfig.glowColor}15 0%, transparent 75%)`
                  }}
                />

                <div
                  className={`relative w-28 h-28 rounded-2xl overflow-hidden shadow-xl border border-white/15 transition-all duration-300 ${
                    isPlaying && artworkVisualConfig.pulseEnabled ? 'animate-music-pulse' : 'scale-100'
                  }`}
                  style={{
                    boxShadow: `0 10px 25px ${artworkVisualConfig.glowColor}40`
                  }}
                >
                  {currentTrack.coverImage ? (
                    <img src={currentTrack.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: currentTrack.coverGradient }}
                    >
                      PHO
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Palette Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">Color del Fondo y Aura:</label>
                <span className="text-xs font-mono text-slate-400 font-medium">
                  {artworkVisualConfig.glowColor}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { name: 'Violeta', hex: '#a855f7' },
                  { name: 'Cian', hex: '#00f0ff' },
                  { name: 'Carmesí', hex: '#ef4444' },
                  { name: 'Rosa', hex: '#ec4899' },
                  { name: 'Esmeralda', hex: '#10b981' },
                  { name: 'Solar', hex: '#f59e0b' },
                  { name: 'Celestial', hex: '#ffffff' },
                  { name: 'Cobalto', hex: '#3b82f6' },
                  { name: 'Lima', hex: '#84cc16' },
                  { name: 'Púrpura', hex: '#7c3aed' }
                ].map((c) => {
                  const isSelected = artworkVisualConfig.glowColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setArtworkVisualConfig({ glowColor: c.hex });
                        showToast(`Aura: ${c.name}`);
                      }}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all text-[11px] font-medium ${
                        isSelected
                          ? 'border-white bg-white/20 ring-2 scale-102 text-white shadow-md'
                          : 'border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                      style={isSelected ? { borderColor: c.hex, boxShadow: `0 0 12px ${c.hex}60` } : undefined}
                      title={`Color ${c.name}`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Any Custom Color Input */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 mt-1.5">
                <div className="flex items-center gap-2">
                  <Palette size={15} className="text-slate-400" />
                  <span className="text-xs text-slate-300">Cualquier Color Personalizado:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={artworkVisualConfig.glowColor}
                    onChange={(e) => setArtworkVisualConfig({ glowColor: e.target.value })}
                    className="w-8 h-7 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                    title="Seleccionar cualquier color"
                  />
                  <span className="text-xs font-mono text-white font-semibold">
                    {artworkVisualConfig.glowColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Features */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-semibold text-white block">Efecto Agrandar / Pulsar</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Pulsa al ritmo de la música solo al reproducir.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={artworkVisualConfig.pulseEnabled}
                  onChange={(e) => setArtworkVisualConfig({ pulseEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--accent-primary)] accent-[var(--accent-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-semibold text-white block">Fondo Giratorio</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Gira continuamente sobre su centro.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={artworkVisualConfig.rotateShape}
                  onChange={(e) => setArtworkVisualConfig({ rotateShape: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--accent-primary)] accent-[var(--accent-primary)] cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={() => setShowAuraModal(false)}
              className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Docked Mini Playback Bar helper component for secondary tabs
 * (Lyrics, Visualizer, Metadata, Queue)
 */
interface DockedPlaybackBarProps {
  currentTrack: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlayPause: () => void;
  seekTo: (sec: number) => void;
  prevTrack: () => void;
  nextTrack: () => void;
}

const DockedPlaybackBar: React.FC<DockedPlaybackBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  togglePlayPause,
  seekTo,
  prevTrack,
  nextTrack
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const progressPercent = duration > 0 ? ((isScrubbing ? scrubValue : currentTime) / duration) * 100 : 0;

  return (
    <div className="w-full mt-4 pt-3 border-t border-white/10 bg-[#0e0b1c]/80 backdrop-blur-xl p-3 sm:px-4 rounded-2xl flex flex-col gap-2">
      {/* Mini Scrubber */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-[10px] font-mono tabular-nums text-slate-400 w-8 text-right">
          {formatTime(isScrubbing ? scrubValue : currentTime)}
        </span>

        <div className="relative flex-1 flex items-center h-4">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={isScrubbing ? scrubValue : currentTime}
            onChange={(e) => setScrubValue(parseFloat(e.target.value))}
            onMouseDown={() => {
              setIsScrubbing(true);
              setScrubValue(currentTime);
            }}
            onMouseUp={() => {
              setIsScrubbing(false);
              seekTo(scrubValue);
            }}
            onTouchStart={() => {
              setIsScrubbing(true);
              setScrubValue(currentTime);
            }}
            onTouchEnd={() => {
              setIsScrubbing(false);
              seekTo(scrubValue);
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Progreso de audio"
          />
        </div>

        <span className="text-[10px] font-mono tabular-nums text-slate-400 w-8 text-left">
          {formatTime(duration)}
        </span>
      </div>

      {/* Mini Transport Strip */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
            {currentTrack.coverImage ? (
              <img src={currentTrack.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-purple-800" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Anterior"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Siguiente"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

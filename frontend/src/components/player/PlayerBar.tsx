import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Zap,
  ZapOff,
  Palette,
  Disc3,
  Image as ImageIcon
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';
import { PlayerBarVisualizer } from './PlayerBarVisualizer';

export const PlayerBar: React.FC = () => {
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
    setActiveView,
    setIsFullscreenPlayerOpen,
    isQueueOpen,
    setIsQueueOpen,
    isLyricPanelOpen,
    openLyricPanel,
    closeLyricPanel,
    lowResourceMode,
    setLowResourceMode,
    setIsColorModalOpen,
    componentCustomization,
    customBackdrops,
    openBackdropModal
  } = useMusic();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  if (!currentTrack) {
    return null;
  }

  const favorite = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? ((isScrubbing ? scrubValue : currentTime) / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
  };

  const handleSliderMouseDown = () => {
    setIsScrubbing(true);
    setScrubValue(currentTime);
  };

  const handleSliderMouseUp = () => {
    setIsScrubbing(false);
    seekTo(scrubValue);
  };

  const barStyleClasses =
    componentCustomization.playerBarStyle === 'cyber-dock'
      ? 'mx-2 sm:mx-4 my-2 rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a0814]/95 shadow-[0_0_30px_-5px_var(--accent-glow)] h-18 sm:h-20'
      : componentCustomization.playerBarStyle === 'studio-rack'
      ? 'h-20 sm:h-22 bg-[#070512] border-t-2 border-[var(--accent-primary)]/50'
      : 'h-18 bg-[#090714]/95 border-t border-white/10';

  const artworkStyleClasses =
    componentCustomization.artworkStyle === 'vinyl-cyber'
      ? `rounded-full ring-2 ring-[var(--accent-primary)] ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`
      : componentCustomization.artworkStyle === 'glass-3d'
      ? 'rounded-xl sm:rounded-2xl border-2 border-white/30 shadow-2xl rotate-1 scale-105'
      : componentCustomization.artworkStyle === 'clean-flat'
      ? 'rounded-lg border border-white/10'
      : 'rounded-xl border border-[var(--accent-primary)]/50 shadow-[0_0_15px_var(--accent-glow)]';

  return (
    <footer
      className={`relative overflow-hidden hidden md:flex px-3 sm:px-4 lg:px-6 backdrop-blur-2xl items-center justify-between gap-2 sm:gap-4 lg:gap-6 z-30 select-none shrink-0 transition-all ${barStyleClasses}`}
      aria-label="Reproductor persistente de escritorio"
    >
      {/* Custom Backdrop Image Layer */}
      {customBackdrops.playerBar.enabled && customBackdrops.playerBar.imageUrl && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            src={customBackdrops.playerBar.imageUrl}
            alt="Fondo de Barra de Reproductor"
            className="w-full h-full object-cover transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${customBackdrops.playerBar.scale})`,
              objectPosition: `${customBackdrops.playerBar.positionX}% ${customBackdrops.playerBar.positionY}%`,
              opacity: customBackdrops.playerBar.opacity,
              filter: customBackdrops.playerBar.blur > 0 ? `blur(${customBackdrops.playerBar.blur}px)` : undefined
            }}
          />
          {/* Dark contrast overlay layer */}
          <div
            className="absolute inset-0 bg-[#090714] transition-opacity"
            style={{ opacity: customBackdrops.playerBar.overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
        </div>
      )}

      {/* Zone A: Track Info & Favorite (Responsive min-w-0, never causes horizontal overflow) */}
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-[200px] md:max-w-[230px] lg:max-w-xs xl:max-w-sm shrink-0">
        {/* Album Artwork */}
        <button
          onClick={() => setActiveView('now-playing')}
          className={`relative group w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 overflow-hidden shrink-0 shadow-lg shadow-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-all ${artworkStyleClasses}`}
          title="Ver sesión completa de Reproduciendo Ahora"
          aria-label="Abrir Reproduciendo Ahora"
        >
          {currentTrack.coverImage ? (
            <img
              src={currentTrack.coverImage}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold group-hover:scale-105 transition-transform"
              style={{ background: currentTrack.coverGradient }}
            >
              PHO
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
            <Disc3 size={16} className={isPlaying ? 'animate-spin' : ''} />
          </div>
        </button>

        {/* Title, Artist, Source badge with strict truncation */}
        <div className="flex flex-col min-w-0 flex-1">
          <button
            onClick={() => setActiveView('now-playing')}
            className="text-left font-bold text-xs sm:text-sm text-white hover:text-[var(--accent-primary)] truncate transition-colors focus:outline-none"
            title={`${currentTrack.title} · Clic para ver sesión completa`}
          >
            {currentTrack.title}
          </button>
          <span className="text-[11px] sm:text-xs text-slate-300 truncate" title={currentTrack.artist}>
            {currentTrack.artist}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-[9px] sm:text-[10px] text-slate-400">
            <span className="truncate max-w-[75px] sm:max-w-[100px]">{currentTrack.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{currentTrack.source === 'local_imported' ? 'Local' : 'Legal'}</span>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none shrink-0 ${
            favorite
              ? 'text-rose-500 bg-rose-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Zone B: Main Playback Controls & Progress Bar (Flexible center area) */}
      <div className="relative z-10 flex-1 min-w-[200px] max-w-xl mx-2 flex flex-col items-center gap-1 shrink">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <button
            onClick={toggleShuffle}
            className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors ${
              isShuffle ? 'text-[var(--accent-primary)]' : 'text-slate-400 hover:text-white'
            }`}
            title={isShuffle ? 'Aleatorio activado' : 'Aleatorio desactivado'}
            aria-label="Modo aleatorio"
          >
            <Shuffle size={15} />
          </button>

          <button
            onClick={prevTrack}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition-colors focus:outline-none"
            title="Canción anterior"
            aria-label="Canción anterior"
          >
            <SkipBack size={18} />
          </button>

          {/* Big Play / Pause button */}
          <button
            onClick={togglePlayPause}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] hover:brightness-110 active:scale-95 shadow-md shadow-purple-950 transition-all focus:outline-none shrink-0"
            style={{
              backgroundColor: 'var(--accent-primary)',
              boxShadow: '0 0 16px -2px var(--accent-glow)'
            }}
            title={isPlaying ? 'Pausar reproducción' : 'Iniciar reproducción'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition-colors focus:outline-none"
            title="Canción siguiente"
            aria-label="Canción siguiente"
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={cycleRepeat}
            className={`hidden sm:inline-flex p-1.5 rounded-lg transition-colors ${
              repeatMode !== 'off' ? 'text-[var(--accent-primary)]' : 'text-slate-400 hover:text-white'
            }`}
            title={`Modo de repetición: ${repeatMode}`}
            aria-label="Modo de repetición"
          >
            {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>
        </div>

        {/* Scrubbing Bar */}
        <div className="w-full flex items-center gap-2 sm:gap-2.5">
          <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-slate-400 w-8 sm:w-9 text-right shrink-0">
            {formatTime(isScrubbing ? scrubValue : currentTime)}
          </span>

          <div className="relative flex-1 flex items-center group h-4">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] group-hover:brightness-110 transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                {isPlaying && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] opacity-90" />
                )}
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={isScrubbing ? scrubValue : currentTime}
              onChange={handleSliderChange}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onTouchStart={handleSliderMouseDown}
              onTouchEnd={handleSliderMouseUp}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Barra de progreso de audio"
            />
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-slate-400 w-8 sm:w-9 text-left shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Zone C: Volume, Queue & Actions (Smart responsive hiding so volume & expand are NEVER pushed off!) */}
      <div className="flex items-center justify-end gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
        {/* Real-time Visualizer (Shown only on xl screens so it doesn't crush the bar on tablet/laptop) */}
        {!lowResourceMode && (
          <div className="hidden xl:block shrink-0">
            <PlayerBarVisualizer
              isPlaying={isPlaying}
              onOpenFullscreen={() => setIsFullscreenPlayerOpen(true)}
            />
          </div>
        )}

        {/* Low Resource Mode quick toggle (Hidden on medium widths since it's already in TopBar) */}
        <button
          onClick={() => setLowResourceMode(!lowResourceMode)}
          className={`hidden 2xl:flex p-1.5 rounded-lg transition-colors focus:outline-none items-center gap-1 shrink-0 ${
            lowResourceMode
              ? 'text-amber-400 bg-amber-500/15 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title={
            lowResourceMode
              ? 'Modo Ahorro Activado'
              : 'Desactivar efectos si consume muchos recursos'
          }
          aria-label="Ahorro de recursos"
        >
          {lowResourceMode ? <ZapOff size={16} /> : <Zap size={16} />}
        </button>

        {/* System Colors Customization trigger (Hidden on medium widths since it's in TopBar) */}
        <button
          onClick={() => setIsColorModalOpen(true)}
          className="hidden 2xl:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none shrink-0"
          title="Personalizar colores del sistema"
          aria-label="Colores del sistema"
        >
          <Palette size={16} className="text-[var(--accent-primary)]" />
        </button>

        {/* Custom Backdrop Trigger for Player Bar */}
        <button
          onClick={() => openBackdropModal('playerBar')}
          className={`hidden xl:flex p-1.5 rounded-lg transition-colors focus:outline-none shrink-0 ${
            customBackdrops.playerBar.enabled && customBackdrops.playerBar.imageUrl
              ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 ring-1 ring-[var(--accent-primary)]/40 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Personalizar imagen de fondo de la barra de reproducción"
          aria-label="Fondo de barra de reproducción"
        >
          <ImageIcon size={16} />
        </button>

        {/* Lyrics Panel Toggle (Visible on lg+) */}
        <button
          onClick={() => (isLyricPanelOpen ? closeLyricPanel() : openLyricPanel())}
          className={`hidden lg:flex p-1.5 sm:p-2 rounded-xl transition-colors focus:outline-none shrink-0 ${
            isLyricPanelOpen
              ? 'text-white bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)] ring-1 ring-[var(--accent-primary)]/40'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Ver panel de letras sincronizadas"
          aria-label="Letras sincronizadas"
        >
          <Mic2 size={16} />
        </button>

        {/* Queue Drawer Toggle (Always visible) */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 sm:p-2 rounded-xl transition-colors focus:outline-none shrink-0 ${
            isQueueOpen
              ? 'text-white bg-white/10'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Ver cola de reproducción"
          aria-label="Cola de reproducción"
        >
          <ListMusic size={16} />
        </button>

        {/* Volume Slider (Compact and responsive) */}
        <div className="flex items-center gap-1.5 group w-20 sm:w-24 lg:w-28 shrink-0">
          <button
            onClick={toggleMute}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition-colors focus:outline-none shrink-0"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div className="relative flex-1 flex items-center h-4">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-200 group-hover:bg-[var(--accent-primary)] transition-all"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Control de volumen"
            />
          </div>
        </div>

        {/* Fullscreen Expand (ALWAYS visible at rightmost edge) */}
        <button
          onClick={() => setIsFullscreenPlayerOpen(true)}
          className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none shrink-0"
          title="Modo pantalla completa inmersiva"
          aria-label="Pantalla completa"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </footer>
  );
};

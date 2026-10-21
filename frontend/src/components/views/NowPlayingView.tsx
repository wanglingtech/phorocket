import React, { useState } from 'react';
import {
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
  Sliders,
  ListMusic,
  FileText,
  Activity,
  CloudRain,
  Camera,
  Sparkles,
  Zap,
  ZapOff,
  Palette,
  Maximize2,
  Tv,
  Snowflake,
  Flame,
  Terminal,
  ShieldCheck,
  Disc3,
  RotateCw,
  Info,
  ChevronRight,
  X,
  Columns,
  Check
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';
import { AudioVisualizer } from '../visualizer/AudioVisualizer';
import { ThunderBackground } from '../visualizer/ThunderBackground';
import { VisualizerMode } from '../../types/music';

export const NowPlayingView: React.FC = () => {
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
    visualizerMode,
    setVisualizerMode,
    thunderConfig,
    setThunderConfig,
    artworkVisualConfig,
    setArtworkVisualConfig,
    lowResourceMode,
    setLowResourceMode,
    openArtworkModal,
    setIsColorModalOpen,
    setIsFullscreenPlayerOpen,
    setActiveView,
    queue,
    playTrack,
    showToast
  } = useMusic();

  // State for single customization modal & tabs
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'ambience' | 'squircle' | 'visualizer' | 'performance' | 'lyrics_queue'>('ambience');

  // Layout presentation: 'horizontal' (Avee card layout like Image 1) vs 'centered'
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'centered'>('horizontal');

  // Audio scrubbing state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // If no track is playing, show a clean, inviting waiting state
  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-6 animate-in fade-in select-none">
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] shadow-2xl shadow-purple-950/60 animate-pulse">
            <Disc3 size={48} />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-dashed border-[var(--accent-primary)]/40 animate-spin-squircle pointer-events-none" />
        </div>

        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-display font-black text-white">
            Sesión de Reproducción en Espera
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No hay ninguna canción reproduciéndose actualmente. Selecciona cualquier pista de tu biblioteca local o catálogo legal para iniciar la experiencia inmersiva.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveView('library')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-lg shadow-purple-950/50 hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Explorar Biblioteca</span>
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => setActiveView('legal')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <span>Catálogo Libre & Legal</span>
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? ((isScrubbing ? scrubValue : currentTime) / duration) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubValue(parseFloat(e.target.value));
  };

  const handleSliderMouseUp = () => {
    setIsScrubbing(false);
    seekTo(scrubValue);
  };

  const cycleVisualizerMode = () => {
    const modes: VisualizerMode[] = [
      'wave',
      'bars',
      'spectrum',
      'circle',
      'd3-cyberpunk',
      'particles',
      'minimal'
    ];
    const nextIdx = (modes.indexOf(visualizerMode) + 1) % modes.length;
    setVisualizerMode(modes[nextIdx]);
    showToast(`Visualizador: ${modes[nextIdx]}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-28 animate-in fade-in select-none max-w-6xl mx-auto relative pt-1 sm:pt-2">
      {/* Background Ambient VFX Layer (respects lowResourceMode) */}
      {!lowResourceMode && thunderConfig.enabled && (
        <div className="fixed inset-0 pointer-events-none opacity-45 overflow-hidden z-0">
          <ThunderBackground intensityMultiplier={0.7} />
        </div>
      )}

      {/* Top Header Bar: Clean & Minimal (Only 1 primary customization button as requested!) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/10 relative z-10 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-ping shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-display font-black text-white tracking-tight flex items-center gap-2 truncate">
              <span>Reproduciendo Ahora</span>
              <span className="hidden sm:inline text-xs font-normal text-slate-400 font-mono truncate">
                · {currentTrack.title}
              </span>
            </h1>
          </div>
        </div>

        {/* Header Right Actions: Layout Switcher + THE SINGLE CUSTOMIZATION BUTTON + Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Orientation / Layout Switcher: Horizontal Avee Card vs Centered Hero */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'horizontal' ? 'centered' : 'horizontal')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title={
              layoutMode === 'horizontal'
                ? 'Cambiar a diseño centrado vertical'
                : 'Cambiar a diseño horizontal estilo tarjeta Avee Player (como imagen de referencia)'
            }
          >
            <Columns size={14} className="text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">
              {layoutMode === 'horizontal' ? 'Vista Avee Card' : 'Vista Centrada'}
            </span>
          </button>

          {/* THE SINGLE CUSTOMIZATION BUTTON */}
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/30 border border-[var(--accent-primary)]/40 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all active:scale-95"
            title="Abrir panel con pestañas para personalizar ambientes, carátula, marco giratorio, visualizador y recursos"
          >
            <Sliders size={14} className="text-[var(--accent-primary)]" />
            <span>Personalizar Sesión</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreenPlayerOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all focus:outline-none"
            title="Pantalla completa"
            aria-label="Pantalla completa"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* MAIN PLAYER STAGE (No bulky grey box panels, breathable and modern!) */}
      <div className="relative z-10">
        {layoutMode === 'horizontal' ? (
          /* ========================================================================= */
          /* DESIGN A: HORIZONTAL AVEE CARD (Inspired directly by the user's Image 1)  */
          /* Left: Rotating Squircle + Pulsing Artwork                                 */
          /* Right: Title, Time, Seamless Visualizer, Scrubber, Transport Controls     */
          /* ========================================================================= */
          <div className="rounded-3xl border border-white/15 bg-[#0c0919]/90 backdrop-blur-2xl p-5 sm:p-7 md:p-9 shadow-2xl shadow-black/80 relative overflow-hidden transition-all">
            {/* Subtle Neon Glow Ambient Backlight */}
            <div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-20"
              style={{ backgroundColor: artworkVisualConfig.glowColor }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-20"
              style={{ backgroundColor: thunderConfig.color }}
            />

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              {/* Left Column: Rotating Squircle & Pulsing Artwork (Never cropped!) */}
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
                    width: 'calc(100% + 1.8rem)',
                    height: 'calc(100% + 1.8rem)',
                    maxWidth: '310px',
                    maxHeight: '310px',
                    borderColor: artworkVisualConfig.glowColor,
                    boxShadow: `0 0 35px ${artworkVisualConfig.glowColor}50, inset 0 0 25px ${artworkVisualConfig.glowColor}25`,
                    background: `radial-gradient(circle, ${artworkVisualConfig.glowColor}18 0%, transparent 75%)`
                  }}
                >
                  {/* Glowing Corner Brackets like Image 1 */}
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

                {/* Cover Artwork: pulses/enlarges ONLY when playing, normal when paused */}
                <div
                  className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/20 group transition-all duration-300 ${
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
                        <span className="font-display font-extrabold text-xl tracking-wider">PHO</span>
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
                    title="Subir o cambiar imagen de esta música"
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

              {/* Right Column: Track Details, Integrated Seamless Visualizer, Scrubber & Controls */}
              <div className="flex-1 w-full min-w-0 space-y-4">
                {/* Title & Artist & Badges (Never truncated, bold and vibrant) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight break-words tracking-tight"
                      style={{
                        textShadow: `0 0 25px ${artworkVisualConfig.glowColor}60`
                      }}
                    >
                      {currentTrack.title}
                    </h2>
                    <p className="text-sm sm:text-base font-semibold text-slate-300 mt-1 break-words">
                      {currentTrack.artist}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">
                        {currentTrack.album || 'Biblioteca del Dispositivo'}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {currentTrack.genre}
                      </span>
                      {currentTrack.bpm && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-mono text-purple-300">
                            {currentTrack.bpm} BPM
                          </span>
                        </>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                        <ShieldCheck size={11} />
                        <span>Legal</span>
                      </span>
                    </div>
                  </div>

                  {/* Favorite & Quick Artwork trigger */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleFavorite(currentTrack.id)}
                      className={`p-3 rounded-2xl border transition-all ${
                        favorite
                          ? 'text-rose-500 bg-rose-500/15 border-rose-500/30 shadow-lg shadow-rose-950/40'
                          : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                      }`}
                      title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Time Indicator & Visualizer Switcher Pill */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-mono font-bold text-white tracking-wider">
                      {formatTime(isScrubbing ? scrubValue : currentTime)}
                    </span>
                    <span className="text-slate-500 font-mono">/</span>
                    <span className="text-xs sm:text-sm font-mono text-slate-400">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Seamless Mode Switcher Pill */}
                  <button
                    onClick={cycleVisualizerMode}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                    title="Alternar estilo de visualizador de audio"
                  >
                    <Activity size={13} className="text-[var(--accent-primary)] animate-pulse" />
                    <span>Modo: <strong className="capitalize text-white">{visualizerMode}</strong> · Alternar</span>
                  </button>
                </div>

                {/* SEAMLESS AUDIO VISUALIZER (NO GREY BOX! Transparent, elegant, integrated like Image 1!) */}
                <div className="w-full h-14 sm:h-16 relative flex items-center justify-center overflow-hidden">
                  <AudioVisualizer
                    mode={visualizerMode}
                    isPlaying={isPlaying && !lowResourceMode}
                    height={58}
                    sensitivity={1.1}
                    className="w-full h-full"
                  />
                </div>

                {/* Progress Bar / Scrubber */}
                <div className="space-y-1 pt-1">
                  <div className="relative flex items-center h-6 group">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all relative"
                        style={{
                          width: `${progressPercent}%`,
                          boxShadow: '0 0 14px var(--accent-glow)'
                        }}
                      >
                        {isPlaying && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
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
                      aria-label="Barra de progreso de audio"
                    />
                  </div>
                </div>

                {/* Large Playback Transport Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6">
                    <button
                      onClick={toggleShuffle}
                      className={`p-2 rounded-xl transition-colors ${
                        isShuffle ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Modo aleatorio"
                    >
                      <Shuffle size={18} />
                    </button>

                    <button
                      onClick={prevTrack}
                      className="p-2.5 rounded-2xl text-white hover:bg-white/10 active:scale-95 transition-all"
                      title="Pista anterior"
                    >
                      <SkipBack size={22} />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] hover:brightness-110 active:scale-95 shadow-2xl transition-all"
                      style={{
                        boxShadow: `0 0 25px ${artworkVisualConfig.glowColor}90`
                      }}
                      title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                      onClick={nextTrack}
                      className="p-2.5 rounded-2xl text-white hover:bg-white/10 active:scale-95 transition-all"
                      title="Pista siguiente"
                    >
                      <SkipForward size={22} />
                    </button>

                    <button
                      onClick={cycleRepeat}
                      className={`p-2 rounded-xl transition-colors ${
                        repeatMode !== 'off' ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15' : 'text-slate-400 hover:text-white'
                      }`}
                      title={`Repetición: ${repeatMode}`}
                    >
                      {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center justify-center gap-2.5 group w-full sm:w-36">
                    <button
                      onClick={toggleMute}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>
                    <div className="relative flex-1 flex items-center h-4">
                      <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
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
                    <span className="text-[11px] font-mono text-slate-400 w-7 text-right">
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* DESIGN B: CENTERED HERO STAGE (Clean, focused, no bulky right box)         */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            {/* Artwork with Rotating Squircle */}
            <div className="relative flex items-center justify-center py-6 px-4">
              <div
                className={`absolute pointer-events-none rounded-[3rem] border-2 transition-transform duration-700 ${
                  artworkVisualConfig.rotateShape && !lowResourceMode
                    ? isPlaying
                      ? 'animate-spin-squircle-fast'
                      : 'animate-spin-squircle'
                    : ''
                }`}
                style={{
                  width: 'calc(100% + 2rem)',
                  height: 'calc(100% + 2rem)',
                  maxWidth: '320px',
                  maxHeight: '320px',
                  borderColor: artworkVisualConfig.glowColor,
                  boxShadow: `0 0 35px ${artworkVisualConfig.glowColor}50, inset 0 0 25px ${artworkVisualConfig.glowColor}25`,
                  background: `radial-gradient(circle, ${artworkVisualConfig.glowColor}18 0%, transparent 75%)`
                }}
              >
                <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: artworkVisualConfig.glowColor }} />
                <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: artworkVisualConfig.glowColor }} />
                <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: artworkVisualConfig.glowColor }} />
                <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: artworkVisualConfig.glowColor }} />
              </div>

              <div
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/20 group transition-all duration-300 ${
                  isPlaying && artworkVisualConfig.pulseEnabled && !lowResourceMode
                    ? 'animate-music-pulse'
                    : 'scale-100'
                }`}
                style={{
                  boxShadow: `0 20px 45px -10px ${artworkVisualConfig.glowColor}50`
                }}
              >
                {currentTrack.coverImage ? (
                  <img src={currentTrack.coverImage} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-6" style={{ background: currentTrack.coverGradient }}>
                    <div className="w-16 h-16 rounded-2xl border-2 border-white/30 flex items-center justify-center mb-2 bg-black/25">
                      <span className="font-display font-extrabold text-xl">PHO</span>
                    </div>
                    <span className="text-xs uppercase font-semibold">{currentTrack.genre}</span>
                  </div>
                )}
                <button
                  onClick={() => openArtworkModal(currentTrack)}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4"
                >
                  <Camera size={20} />
                  <span className="text-xs font-bold uppercase">Cambiar Carátula</span>
                </button>
              </div>
            </div>

            {/* Title & Artist */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">{currentTrack.title}</h2>
              <p className="text-base text-slate-300 mt-1 font-medium">{currentTrack.artist}</p>
            </div>

            {/* Seamless Visualizer & Switcher */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>{formatTime(isScrubbing ? scrubValue : currentTime)}</span>
                <button onClick={cycleVisualizerMode} className="text-[11px] text-[var(--accent-primary)] hover:underline capitalize">
                  {visualizerMode} · Alternar
                </button>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full h-14 relative flex items-center justify-center">
                <AudioVisualizer mode={visualizerMode} isPlaying={isPlaying && !lowResourceMode} height={54} className="w-full h-full" />
              </div>
            </div>

            {/* Scrubber */}
            <div className="relative flex items-center h-6 group">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent-primary)] transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={isScrubbing ? scrubValue : currentTime}
                onChange={handleSliderChange}
                onMouseDown={() => { setIsScrubbing(true); setScrubValue(currentTime); }}
                onMouseUp={handleSliderMouseUp}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={toggleShuffle} className={`p-2 ${isShuffle ? 'text-[var(--accent-primary)]' : 'text-slate-400'}`}>
                <Shuffle size={18} />
              </button>
              <button onClick={prevTrack} className="p-2 text-white">
                <SkipBack size={24} />
              </button>
              <button onClick={togglePlayPause} className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] shadow-xl">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
              </button>
              <button onClick={nextTrack} className="p-2 text-white">
                <SkipForward size={24} />
              </button>
              <button onClick={cycleRepeat} className={`p-2 ${repeatMode !== 'off' ? 'text-[var(--accent-primary)]' : 'text-slate-400'}`}>
                {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* THE CUSTOMIZATION MODAL (All tabs housed cleanly inside this dialog!)      */}
      {/* ========================================================================= */}
      {isCustomizeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in select-none"
          onClick={() => setIsCustomizeModalOpen(false)}
          role="dialog"
          aria-label="Personalización de Sesión Reproduciendo Ahora"
        >
          <div
            className="w-full max-w-2xl bg-[#0e0a1c] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)]">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Personalizar Sesión Activa
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ajusta los ambientes, carátula, marco giratorio y recursos en un solo lugar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Internal Tab Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/10">
              <button
                onClick={() => setModalTab('ambience')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  modalTab === 'ambience'
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CloudRain size={14} />
                <span>Ambientes</span>
              </button>

              <button
                onClick={() => setModalTab('squircle')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  modalTab === 'squircle'
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <RotateCw size={14} />
                <span>Marco & Carátula</span>
              </button>

              <button
                onClick={() => setModalTab('visualizer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  modalTab === 'visualizer'
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity size={14} />
                <span>Visualizador</span>
              </button>

              <button
                onClick={() => setModalTab('performance')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  modalTab === 'performance'
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap size={14} />
                <span>Rendimiento</span>
              </button>

              <button
                onClick={() => setModalTab('lyrics_queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  modalTab === 'lyrics_queue'
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ListMusic size={14} />
                <span>Letras & Cola</span>
              </button>
            </div>

            {/* TAB 1: Ambientes Climáticos */}
            {modalTab === 'ambience' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">Efectos Ambientales Reactivos</span>
                    <span className="text-[11px] text-slate-400">
                      Lluvia, estática, nieve, truenos, brasas y matriz en el fondo
                    </span>
                  </div>
                  <button
                    onClick={() => setThunderConfig({ enabled: !thunderConfig.enabled })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      thunderConfig.enabled && !lowResourceMode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {thunderConfig.enabled && !lowResourceMode ? 'Activo' : 'Desactivado'}
                  </button>
                </div>

                {/* Ambient Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Selecciona el Tipo de Clima:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'rain' as const, name: 'Lluvia', icon: CloudRain },
                      { id: 'static' as const, name: 'Estática', icon: Tv },
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
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            isCur
                              ? 'border-white bg-white/15 text-white font-bold shadow-md'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-[11px]">{amb.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ambient Color (Any color) */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Color del Ambiente (Cualquier Color):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={thunderConfig.color}
                        onChange={(e) => setThunderConfig({ color: e.target.value })}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                        title="Seleccionar cualquier color"
                      />
                      <span className="text-xs font-mono font-semibold text-white">{thunderConfig.color}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['#00f0ff', '#a855f7', '#ef4444', '#10b981', '#f59e0b', '#f43f5e', '#ffffff'].map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setThunderConfig({ color: hex })}
                        className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Marco Giratorio & Carátula */}
            {modalTab === 'squircle' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">
                        Marco Giratorio & Halo de Carátula
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Cuadrado con esquinas redondeadas que rota en ese mismo punto detrás de la música.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={artworkVisualConfig.glowColor}
                        onChange={(e) => setArtworkVisualConfig({ glowColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                        title="Elegir cualquier color para el marco giratorio"
                      />
                      <span className="text-xs font-mono font-semibold text-white">
                        {artworkVisualConfig.glowColor}
                      </span>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold uppercase">Muestras:</span>
                    {['#a855f7', '#00f0ff', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map((hex) => (
                      <button
                        key={`sq-m-${hex}`}
                        onClick={() => setArtworkVisualConfig({ glowColor: hex })}
                        className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <button
                      onClick={() => setArtworkVisualConfig({ glowColor: thunderConfig.color })}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 hover:text-white ml-auto"
                    >
                      Copiar color de ambiente
                    </button>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-2.5 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={artworkVisualConfig.rotateShape}
                        onChange={(e) => setArtworkVisualConfig({ rotateShape: e.target.checked })}
                        className="rounded accent-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                      />
                      <span>Girar marco cuadrado en el mismo punto (más rápido al reproducir música)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={artworkVisualConfig.pulseEnabled}
                        onChange={(e) => setArtworkVisualConfig({ pulseEnabled: e.target.checked })}
                        className="rounded accent-[var(--accent-primary)] w-4 h-4 cursor-pointer"
                      />
                      <span>Efecto de agrandar/pulsar sólo cuando la música se reproduzca (si no, permanece normal)</span>
                    </label>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Cambiar Imagen de Carátula</span>
                    <span className="text-[11px] text-slate-400">Sube una imagen o pega una URL para esta pista</span>
                  </div>
                  <button
                    onClick={() => openArtworkModal(currentTrack)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold"
                  >
                    <Camera size={14} />
                    <span>Cambiar Imagen</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Visualizador */}
            {modalTab === 'visualizer' && (
              <div className="space-y-4 pt-1">
                <span className="text-xs font-bold text-slate-300 block">Estilos de Visualizador de Audio:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'wave' as const, name: 'Onda Sonora' },
                    { id: 'bars' as const, name: 'Barras Neón' },
                    { id: 'spectrum' as const, name: 'Espectro Completo' },
                    { id: 'circle' as const, name: 'Círculo Polar' },
                    { id: 'd3-cyberpunk' as const, name: 'D3 Ciber-Espectral' },
                    { id: 'd3-radial-hud' as const, name: 'D3 Radar Táctico' },
                    { id: 'particles' as const, name: 'Partículas Graves' },
                    { id: 'minimal' as const, name: 'Minimalista' }
                  ].map((v) => {
                    const isSelected = visualizerMode === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setVisualizerMode(v.id);
                          showToast(`Visualizador: ${v.name}`);
                        }}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: Rendimiento & Recursos */}
            {modalTab === 'performance' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Modo Ahorro de Recursos</span>
                      <span className="text-[11px] text-slate-400">
                        Desactiva los fondos de lluvia/nieve/estática y visualizadores pesados para ahorrar batería y CPU.
                      </span>
                    </div>
                    <button
                      onClick={() => setLowResourceMode(!lowResourceMode)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        lowResourceMode
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lowResourceMode ? <ZapOff size={14} className="text-amber-400" /> : <Zap size={14} />}
                      <span>{lowResourceMode ? 'Ahorro: ACTIVADO' : 'Ahorro: DESACTIVADO'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Personalizar Colores de Todo el Sistema</span>
                    <span className="text-[11px] text-slate-400">Cambia el color primario, secundario y fondo general de la app</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCustomizeModalOpen(false);
                      setIsColorModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors"
                  >
                    <Palette size={14} className="text-[var(--accent-primary)]" />
                    <span>Abrir Paleta</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: Letras & Cola */}
            {modalTab === 'lyrics_queue' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Cola de Reproducción ({queue.length}):</span>
                  <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-black/40 rounded-2xl border border-white/5">
                    {queue.map((t, idx) => (
                      <div
                        key={`${t.id}-${idx}`}
                        onClick={() => playTrack(t)}
                        className={`p-2 rounded-xl flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                          t.id === currentTrack.id
                            ? 'bg-[var(--accent-primary)]/20 text-white font-bold'
                            : 'hover:bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{idx + 1}. {t.title} - {t.artist}</span>
                        <span className="font-mono text-slate-500 shrink-0">{formatTime(t.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentTrack.lyrics && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">Letras:</span>
                    <div className="max-h-36 overflow-y-auto p-3 bg-black/40 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-1">
                      {currentTrack.lyrics.map((l, i) => (
                        <p key={i}>{l}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-lg shadow-purple-950/50 hover:brightness-110 active:scale-95 transition-all"
              >
                Listo, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

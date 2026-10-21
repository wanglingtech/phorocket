import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Mic2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Copy,
  Check,
  Edit3,
  AlignLeft,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  Save,
  Music2,
  ChevronDown
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';
import { formatTime } from '../../utils/formatters';

interface ParsedLyricLine {
  id: number;
  timeSeconds: number | null; // null if plain text without timestamp
  rawTimeText: string | null;
  text: string;
}

export const LyricPanel: React.FC = () => {
  const {
    isLyricPanelOpen,
    closeLyricPanel,
    currentTrack,
    lyricTargetTrack,
    openLyricPanel,
    tracks,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    seekTo,
    nextTrack,
    prevTrack,
    updateTrackLyrics,
    showToast
  } = useMusic();

  const [displayMode, setDisplayMode] = useState<'karaoke' | 'plain' | 'edit'>('karaoke');
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>('');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [showTrackPicker, setShowTrackPicker] = useState<boolean>(false);

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active track to show lyrics for (defaults to lyricTargetTrack, then currentTrack)
  const activeTrack: Track | null = useMemo(() => {
    if (selectedTrackId) {
      const found = tracks.find((t) => t.id === selectedTrackId);
      if (found) return found;
    }
    return lyricTargetTrack || currentTrack;
  }, [selectedTrackId, lyricTargetTrack, currentTrack, tracks]);

  // Sync selected track id when target or current changes
  useEffect(() => {
    if (activeTrack) {
      setSelectedTrackId(activeTrack.id);
    }
  }, [activeTrack?.id]);

  // Sync edit text when track changes
  useEffect(() => {
    if (activeTrack?.lyrics) {
      setEditText(activeTrack.lyrics.join('\n'));
    } else {
      setEditText('');
    }
  }, [activeTrack]);

  // Parse lyrics into timestamps and content
  const parsedLyrics: ParsedLyricLine[] = useMemo(() => {
    if (!activeTrack?.lyrics || activeTrack.lyrics.length === 0) return [];

    return activeTrack.lyrics.map((line, index) => {
      // Matches [mm:ss] or [mm:ss.xx]
      const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] ? parseInt(match[3], 10) / 100 : 0;
        return {
          id: index,
          timeSeconds: minutes * 60 + seconds + millis,
          rawTimeText: `[${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}]`,
          text: match[4] || ''
        };
      }
      return {
        id: index,
        timeSeconds: null,
        rawTimeText: null,
        text: line
      };
    });
  }, [activeTrack?.lyrics]);

  // Determine current active lyric line index based on playback time
  const activeLineIndex = useMemo(() => {
    if (!activeTrack || activeTrack.id !== currentTrack?.id) return -1;
    if (parsedLyrics.length === 0) return -1;

    let currentIndex = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      const lineTime = parsedLyrics[i].timeSeconds;
      if (lineTime !== null && lineTime <= currentTime) {
        currentIndex = i;
      }
    }
    return currentIndex;
  }, [activeTrack, currentTrack?.id, parsedLyrics, currentTime]);

  // Auto-scroll to active line
  useEffect(() => {
    if (autoScroll && displayMode === 'karaoke' && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex, autoScroll, displayMode]);

  // Copy lyrics
  const handleCopyLyrics = async () => {
    if (!activeTrack?.lyrics || activeTrack.lyrics.length === 0) {
      showToast('No hay letras para copiar');
      return;
    }
    const cleanText = activeTrack.lyrics
      .map((l) => l.replace(/^\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]\s*/, ''))
      .join('\n');

    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      showToast('Letras copiadas al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Error al copiar al portapapeles');
    }
  };

  // Save edited lyrics
  const handleSaveLyrics = () => {
    if (!activeTrack) return;
    const lines = editText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    updateTrackLyrics(activeTrack.id, lines);
    setDisplayMode('karaoke');
  };

  // Insert current playback timestamp into editor
  const handleInsertCurrentTimestamp = () => {
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const tag = `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}] `;
    setEditText((prev) => (prev ? `${prev}\n${tag}` : tag));
  };

  // Quick generator for cyber lyrics
  const handleGenerateCyberTemplate = () => {
    const cyberTemplate = [
      '[00:10] Inicializando secuencia en la red de neón',
      '[00:25] Frecuencias resonando en el espectro cuántico',
      '[00:45] La metrópolis despierta bajo la lluvia ácida',
      '[01:05] Pulsos de datos atravesando el ciberespacio',
      '[01:25] Modulación armónica completa y sincronizada'
    ].join('\n');
    setEditText(cyberTemplate);
  };

  if (!isLyricPanelOpen) return null;

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    md: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl md:text-2xl leading-relaxed',
    xl: 'text-xl sm:text-2xl md:text-3xl leading-relaxed'
  }[fontSizeLevel];

  const isCurrentTrackPlaying = activeTrack?.id === currentTrack?.id;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={closeLyricPanel}
      role="dialog"
      aria-label="Panel de Letras Sincronizadas"
    >
      <div
        className="w-full sm:w-[540px] lg:w-[620px] h-full bg-[#0a0815]/98 border-l border-white/10 shadow-[0_0_50px_rgba(121,40,202,0.35)] flex flex-col relative z-10 animate-in slide-in-from-right duration-250 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Cyber scanline/radial glow background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--accent-glow)_0%,_transparent_70%)]" />

        {/* Panel Top Header */}
        <header className="p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#0c0919]/90 backdrop-blur-xl relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)] shrink-0">
              <Mic2 size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  Panel de Letras
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                  LRC LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Sincronización karaoke y visor lírico interactivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={closeLyricPanel}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar panel (Esc)"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Track Banner & Selector */}
        {activeTrack && (
          <div className="px-4 sm:px-5 py-3 border-b border-white/5 bg-[#100d20]/80 shrink-0 relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Artwork */}
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 relative shadow-md">
                  {activeTrack.coverImage ? (
                    <img
                      src={activeTrack.coverImage}
                      alt={activeTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: activeTrack.coverGradient }}
                    >
                      PHO
                    </div>
                  )}
                  {isCurrentTrackPlaying && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-[var(--accent-primary)] animate-pulse h-full" />
                        <div className="w-0.5 bg-[var(--accent-primary)] animate-pulse h-2" />
                        <div className="w-0.5 bg-[var(--accent-primary)] animate-pulse h-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate block">
                      {activeTrack.title}
                    </span>
                    {!isCurrentTrackPlaying && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                        Inspeccionando
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 truncate block">
                    {activeTrack.artist} · {activeTrack.album}
                  </span>
                </div>
              </div>

              {/* Playback Controls & Track Switcher */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isCurrentTrackPlaying ? (
                  <>
                    <button
                      onClick={prevTrack}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Pista anterior"
                    >
                      <SkipBack size={15} />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)] hover:brightness-110 transition-all"
                      title={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? (
                        <Pause size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={nextTrack}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Siguiente pista"
                    >
                      <SkipForward size={15} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (currentTrack) {
                        setSelectedTrackId(currentTrack.id);
                        openLyricPanel(currentTrack);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white border border-[var(--accent-primary)]/30 transition-all"
                    title="Volver a la canción en reproducción"
                  >
                    Ver actual
                  </button>
                )}

                {/* Track Selector Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowTrackPicker(!showTrackPicker)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-0.5"
                    title="Elegir otra canción de la biblioteca"
                  >
                    <ChevronDown size={14} />
                  </button>

                  {showTrackPicker && (
                    <div className="absolute right-0 top-full mt-2 w-64 max-h-60 overflow-y-auto bg-[#141026] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                        Cambiar pista a visualizar:
                      </span>
                      {tracks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTrackId(t.id);
                            openLyricPanel(t);
                            setShowTrackPicker(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2 transition-colors ${
                            activeTrack.id === t.id
                              ? 'bg-[var(--accent-primary)] text-white font-bold'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <Music2 size={13} className="shrink-0" />
                          <div className="min-w-0 flex-1 truncate">
                            <span className="block truncate">{t.title}</span>
                            <span className="text-[10px] opacity-75 truncate block">
                              {t.artist}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Playback time progress bar (if currently playing) */}
            {isCurrentTrackPlaying && (
              <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="tabular-nums">{formatTime(currentTime)}</span>
                <div
                  className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    seekTo(ratio * duration);
                  }}
                  title="Clic para saltar en la canción"
                >
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-cyan-400 transition-all"
                    style={{ width: `${(currentTime / Math.max(1, duration)) * 100}%` }}
                  />
                </div>
                <span className="tabular-nums">{formatTime(duration)}</span>
              </div>
            )}
          </div>
        )}

        {/* Toolbar: Display Modes, Font Size, AutoScroll & Copy */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-white/10 bg-[#090714] shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Modes: Karaoke, Plain, Edit */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setDisplayMode('karaoke')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                displayMode === 'karaoke'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Karaoke</span>
            </button>
            <button
              onClick={() => setDisplayMode('plain')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                displayMode === 'plain'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignLeft size={13} />
              <span>Texto Plano</span>
            </button>
            <button
              onClick={() => setDisplayMode('edit')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                displayMode === 'edit'
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={13} />
              <span>Editar</span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {displayMode === 'karaoke' && (
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  autoScroll
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
                title="Desplazar automáticamente hacia la línea activa"
              >
                <span>Auto-scroll</span>
                <span className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-[var(--accent-primary)]' : 'bg-slate-500'}`} />
              </button>
            )}

            {/* Font size toggles */}
            {displayMode !== 'edit' && (
              <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5 text-slate-400">
                {(['sm', 'md', 'lg', 'xl'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFontSizeLevel(lvl)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                      fontSizeLevel === lvl
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'hover:text-white'
                    }`}
                    title={`Tamaño ${lvl}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopyLyrics}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copiar letra al portapapeles"
              aria-label="Copiar letra"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scroll-smooth relative"
        >
          {/* 1. KARAOKE MODE */}
          {displayMode === 'karaoke' && (
            <div className="space-y-6 py-8">
              {parsedLyrics.length > 0 ? (
                parsedLyrics.map((item, idx) => {
                  const isActive = idx === activeLineIndex;
                  const isPast = activeLineIndex >= 0 && idx < activeLineIndex;
                  const hasTimestamp = item.timeSeconds !== null;

                  return (
                    <div
                      key={item.id}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => {
                        if (hasTimestamp && isCurrentTrackPlaying) {
                          seekTo(item.timeSeconds!);
                        }
                      }}
                      className={`group transition-all duration-300 p-3 rounded-2xl relative ${
                        hasTimestamp && isCurrentTrackPlaying ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isActive
                          ? 'bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 scale-[1.02] shadow-[0_0_25px_var(--accent-glow)]'
                          : isPast
                          ? 'opacity-40 hover:opacity-75'
                          : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                      }`}
                    >
                      {/* Active indicator dot & timestamp badge */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {hasTimestamp && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                              isActive
                                ? 'bg-[var(--accent-primary)] text-white font-bold shadow-sm'
                                : 'bg-white/5 text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            {item.rawTimeText}
                          </span>
                        )}
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                            En reproducción
                          </span>
                        )}
                        {hasTimestamp && isCurrentTrackPlaying && !isActive && (
                          <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Play size={10} /> Salta a este punto
                          </span>
                        )}
                      </div>

                      {/* Main Lyric Line */}
                      <p
                        className={`font-display font-medium tracking-wide transition-all ${fontSizeClasses} ${
                          isActive
                            ? 'text-white font-bold drop-shadow-[0_0_12px_var(--accent-glow)] scale-100'
                            : isPast
                            ? 'text-slate-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <EmptyLyricsPrompt onOpenEditor={() => setDisplayMode('edit')} />
              )}
            </div>
          )}

          {/* 2. PLAIN TEXT MODE */}
          {displayMode === 'plain' && (
            <div className="space-y-4 py-4 max-w-xl mx-auto">
              {parsedLyrics.length > 0 ? (
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3 font-serif">
                  {parsedLyrics.map((item, idx) => (
                    <p
                      key={item.id}
                      className={`${fontSizeClasses} text-slate-200 leading-relaxed hover:text-white transition-colors`}
                    >
                      {item.text}
                    </p>
                  ))}
                </div>
              ) : (
                <EmptyLyricsPrompt onOpenEditor={() => setDisplayMode('edit')} />
              )}
            </div>
          )}

          {/* 3. EDIT MODE */}
          {displayMode === 'edit' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[var(--accent-primary)]" />
                    Editor de Letras y Formato LRC
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInsertCurrentTimestamp}
                      className="px-2.5 py-1 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white border border-[var(--accent-primary)]/40 font-mono font-semibold transition-all flex items-center gap-1"
                      title="Inserta la marca de tiempo exacta del reproductor"
                    >
                      <Clock size={12} />
                      <span>Insertar tiempo actual ({formatTime(currentTime)})</span>
                    </button>
                    <button
                      onClick={handleGenerateCyberTemplate}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Cargar versos cyberpunk de ejemplo"
                    >
                      Plantilla Demo
                    </button>
                  </div>
                </div>
                <p className="text-slate-400">
                  Usa marcas como <code className="text-purple-300 font-mono">[00:15] Letra aquí</code> para sincronizar karaoke al segundo con la reproducción. Las líneas sin marca de tiempo se mostrarán como texto regular.
                </p>
              </div>

              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={14}
                placeholder="[00:10] Escribe aquí tus versos o estrofas..."
                className="w-full bg-[#120e26] border border-white/15 rounded-2xl p-4 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-mono">
                  {editText.split('\n').filter((l) => l.trim()).length} líneas registradas
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeTrack?.lyrics) {
                        setEditText(activeTrack.lyrics.join('\n'));
                      }
                      setDisplayMode('karaoke');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveLyrics}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--accent-primary)] hover:brightness-110 text-white shadow-lg shadow-purple-950/60 flex items-center gap-1.5 transition-all"
                  >
                    <Save size={14} />
                    <span>Guardar Letras</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer Telemetry */}
        <footer className="p-3.5 border-t border-white/10 bg-[#080612] shrink-0 text-center text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Motor LRC reactivo Phorocket Audio</span>
          </span>
          <span className="font-mono text-slate-400">
            {parsedLyrics.length} versos cargados
          </span>
        </footer>
      </div>
    </div>
  );
};

const EmptyLyricsPrompt: React.FC<{ onOpenEditor: () => void }> = ({ onOpenEditor }) => {
  return (
    <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
        <Mic2 size={28} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Sin letras registradas</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta pista no dispone de letra o es una composición puramente instrumental. Puedes agregar letras o versos con sincronización temporal en cualquier momento.
        </p>
      </div>
      <button
        onClick={onOpenEditor}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent-primary)] text-white shadow-lg shadow-purple-950/50 hover:brightness-110 transition-all"
      >
        <Edit3 size={14} />
        <span>Escribir o agregar letras</span>
      </button>
    </div>
  );
};

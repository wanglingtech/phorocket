import React from 'react';
import { Play, Pause, SkipForward, Heart, Mic2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    toggleFavorite,
    isFavorite,
    setIsFullscreenPlayerOpen,
    openLyricPanel
  } = useMusic();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const favorite = isFavorite(currentTrack.id);

  return (
    <div
      className="md:hidden fixed bottom-16 left-2 right-2 h-14 bg-[#120f22]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl shadow-black/60 z-35 flex flex-col overflow-hidden"
      aria-label="Mini reproductor móvil"
    >
      {/* Mini top progress indicator */}
      <div className="w-full h-0.5 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 px-3 flex items-center justify-between gap-3">
        {/* Tap area to expand to Fullscreen Player */}
        <div
          onClick={() => setIsFullscreenPlayerOpen(true)}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
            {currentTrack.coverImage ? (
              <img
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: currentTrack.coverGradient }}
              >
                PHO
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-2 rounded-lg transition-colors ${
              favorite ? 'text-rose-500' : 'text-slate-400'
            }`}
            title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            aria-label="Favorito"
          >
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openLyricPanel();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Letras de la canción"
            aria-label="Letras"
          >
            <Mic2 size={17} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-[var(--accent-primary)] shadow-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--accent-primary)'
            }}
            title={isPlaying ? 'Pausar' : 'Reproducir'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-2 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Siguiente pista"
            aria-label="Siguiente canción"
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

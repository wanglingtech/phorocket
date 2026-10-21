import React from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Heart, Watch, Wifi } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';

export const SmartwatchCompanionModal: React.FC = () => {
  const {
    isWatchModalOpen,
    setIsWatchModalOpen,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    prevTrack,
    toggleFavorite,
    isFavorite
  } = useMusic();

  if (!isWatchModalOpen || !currentTrack) return null;

  const favorite = isFavorite(currentTrack.id);
  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const strokeDashoffset = 440 - 440 * progressRatio;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={() => setIsWatchModalOpen(false)}
      role="dialog"
      aria-label="Simulador de Smartwatch Companion"
    >
      <div
        className="relative max-w-sm w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={() => setIsWatchModalOpen(false)}
          className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 transition-colors"
          title="Cerrar vista Smartwatch"
        >
          <X size={20} />
        </button>

        {/* Informational banner about the concept view */}
        <div className="mb-4 text-center">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--accent-primary)] uppercase">
            Experiencia Complementaria
          </span>
          <h3 className="text-base font-display font-bold text-white">Phorocket Watch OS</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-0.5">
            Concepto de interfaz optimizada para pantallas ultra-compactas y control remoto táctil.
          </p>
        </div>

        {/* Watch Chassis (Physical Watch Casing) */}
        <div className="w-72 h-80 rounded-[48px] bg-[#14121f] p-4 border-4 border-[#2d2744] shadow-2xl shadow-purple-950/80 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Top Watch Status Bar */}
          <div className="w-full flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono">
            <span>10:42</span>
            <div className="flex items-center gap-1 text-[var(--accent-primary)]">
              <Wifi size={11} />
              <span className="text-[9px]">SYNC</span>
            </div>
          </div>

          {/* Center Circular Watch Face with Radial Progress Ring */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-white/10"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="var(--accent-primary)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>

            {/* Inner Content Inside Watch Core */}
            <div className="absolute inset-4 rounded-full bg-[#0a0815] flex flex-col items-center justify-center p-3 text-center overflow-hidden">
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {currentTrack.artist}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[110px] mt-0.5">
                {currentTrack.title}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-purple-400 mt-1">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>

          {/* Bottom Tactile Watch Controls */}
          <div className="w-full flex items-center justify-around px-2 py-1">
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-2 rounded-full ${favorite ? 'text-rose-500' : 'text-slate-400'}`}
              aria-label="Favorito en reloj"
            >
              <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={prevTrack}
              className="p-2 text-white hover:text-slate-200"
              aria-label="Pista anterior"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
              aria-label="Reproducir o pausar en reloj"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-white hover:text-slate-200"
              aria-label="Siguiente pista"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Note on future native implementation */}
        <span className="text-[11px] text-slate-500 mt-3 text-center">
          * Vista de concepto de alta fidelidad: conectará mediante Web Bluetooth o API nativa en fase de producción.
        </span>
      </div>
    </div>
  );
};

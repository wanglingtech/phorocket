import React, { useState } from 'react';
import { History, Play, Trash2, PauseCircle, PlayCircle, Clock } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatRelativeTime, formatTime } from '../../utils/formatters';

export const HistoryView: React.FC = () => {
  const {
    history,
    tracks,
    playTrack,
    currentTrack,
    isPlaying,
    clearHistory,
    isHistoryPaused,
    togglePauseHistory
  } = useMusic();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const historyTracks = history
    .map((item) => {
      const track = tracks.find((t) => t.id === item.trackId);
      return track ? { ...track, playedAtTimestamp: item.playedAt, historyId: item.id } : null;
    })
    .filter(Boolean) as (typeof tracks[0] & { playedAtTimestamp: number; historyId: string })[];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <History size={20} className="text-[var(--accent-primary)]" />
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
              Historial de Reproducción
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico de tus canciones reproducidas recientemente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause/Resume History Privacy Toggle */}
          <button
            onClick={togglePauseHistory}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isHistoryPaused
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            }`}
          >
            {isHistoryPaused ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
            <span>{isHistoryPaused ? 'Reanudar Historial' : 'Pausar Historial'}</span>
          </button>

          {historyTracks.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={15} />
              <span>Vaciar</span>
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      {historyTracks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
          <History size={32} className="mx-auto text-slate-500 opacity-50" />
          <h3 className="text-base font-bold text-white">El historial está vacío</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Las pistas que reproduzcas se registrarán aquí con su marca temporal para que puedas volver a escucharlas fácilmente.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {historyTracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={`${track.historyId}-${idx}`}
                onClick={() => playTrack(track)}
                className={`flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group ${
                  isCurrent ? 'bg-purple-500/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                  {track.coverImage ? (
                    <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: track.coverGradient }}>
                      PHO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Play size={16} fill="currentColor" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold block truncate ${isCurrent ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {track.artist} · {track.album}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">
                    {formatRelativeTime(track.playedAtTimestamp)}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-500">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#120f26] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-base font-bold text-white">¿Vaciar el historial?</h3>
            <p className="text-xs text-slate-400">
              Se eliminará el registro de las últimas canciones escuchadas. No afectará a tus listas ni a tus favoritos.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2 px-4 rounded-xl text-xs text-slate-300 hover:text-white bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Vaciar historial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Music2,
  GripVertical,
  ArrowUpToLine,
  ListOrdered,
  Sparkles
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';

export const QueueDrawer: React.FC = () => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    showToast,
    openArtworkModal
  } = useMusic();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('after');
  
  // Touch drag state
  const touchStartY = useRef<number | null>(null);
  const touchIndex = useRef<number | null>(null);

  if (!isQueueOpen) return null;

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'before' : 'after';
    
    if (dragOverIndex !== index || dropPosition !== pos) {
      setDragOverIndex(index);
      setDropPosition(pos);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    let finalIndex = targetIndex;
    if (dropPosition === 'before' && targetIndex > draggedIndex) {
      finalIndex = Math.max(0, targetIndex - 1);
    } else if (dropPosition === 'after' && targetIndex < draggedIndex) {
      finalIndex = targetIndex + 1;
    }

    if (draggedIndex !== finalIndex) {
      reorderQueue(draggedIndex, finalIndex);
      const movedTrack = queue[draggedIndex];
      if (movedTrack) {
        showToast(`"${movedTrack.title}" reordenada en la cola`);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch Support
  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchIndex.current = index;
    setDraggedIndex(index);
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    touchIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const totalDuration = queue.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setIsQueueOpen(false)}
      role="dialog"
      aria-label="Panel de cola de reproducción"
    >
      <div
        className="w-full max-w-md h-full bg-[#0d0a1b] border-l border-white/10 p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <ListOrdered size={18} className="text-[var(--accent-primary)]" />
              <h2 className="text-base font-display font-bold text-white">Cola de reproducción</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {queue.length} canciones ({formatTime(totalDuration)}) · Arrastra para reordenar
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={clearQueue}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
              title="Limpiar cola"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Cerrar panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Current Playing Track */}
        {currentTrack && (
          <div className="my-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" />
                Sonando ahora
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Pista {queueIndex + 1} de {queue.length}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 to-cyan-500/10 border border-purple-500/30 shadow-lg shadow-purple-950/30">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 relative shadow-md">
                {currentTrack.coverImage ? (
                  <img src={currentTrack.coverImage} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ background: currentTrack.coverGradient }}
                  >
                    PHO
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate block">{currentTrack.title}</span>
                <span className="text-xs text-slate-300 truncate block mt-0.5">{currentTrack.artist}</span>
              </div>
              <span className="text-xs font-mono tabular-nums text-purple-300 font-semibold bg-purple-500/20 px-2 py-1 rounded-lg border border-purple-500/30">
                {formatTime(currentTrack.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Up Next List with HTML5 Drag and Drop Reordering */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between mb-2.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              A continuación ({Math.max(0, queue.length - 1)})
            </span>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
              Arrastra desde ⋮⋮ para mover
            </span>
          </div>

          {queue.length <= 1 ? (
            <div className="p-8 text-center text-slate-500 text-xs rounded-2xl border border-dashed border-white/10 my-4">
              <Music2 size={28} className="mx-auto mb-2.5 opacity-50 text-[var(--accent-primary)]" />
              <p className="font-medium text-slate-300">No hay más pistas en la cola.</p>
              <p className="mt-1 text-slate-500">Añade canciones desde la biblioteca o una playlist para armar tu secuencia.</p>
            </div>
          ) : (
            <div className="space-y-1.5 pb-6">
              {queue.map((track, idx) => {
                if (idx === queueIndex) return null; // Displayed above in "Sonando ahora"

                const isBeingDragged = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx;

                return (
                  <div key={`${track.id}-${idx}`} className="relative">
                    {/* Visual Drop line indicator */}
                    {isDragOver && dropPosition === 'before' && (
                      <div className="h-1 bg-[var(--accent-primary)] rounded-full mb-1 shadow-lg shadow-[var(--accent-primary)] flex items-center">
                        <div className="w-2 h-2 rounded-full bg-white ml-1 ring-2 ring-[var(--accent-primary)]" />
                      </div>
                    )}

                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all select-none group ${
                        isBeingDragged
                          ? 'opacity-35 border-dashed border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-[0.98]'
                          : isDragOver
                          ? 'bg-purple-500/20 border-[var(--accent-primary)] shadow-md'
                          : 'border-white/5 bg-[#120f24]/50 hover:bg-white/10 hover:border-white/15'
                      }`}
                    >
                      {/* Drag Handle with touch and pointer support */}
                      <div
                        className="text-slate-500 group-hover:text-slate-200 hover:text-[var(--accent-primary)] cursor-grab active:cursor-grabbing p-1.5 -ml-1 transition-colors rounded-lg hover:bg-white/5 touch-none"
                        title="Arrastrar para mover posición"
                        onTouchStart={(e) => handleTouchStart(idx, e)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <GripVertical size={16} />
                      </div>

                      {/* Position Index Badge */}
                      <span className="text-[10px] font-mono font-medium text-slate-500 w-4 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Thumbnail */}
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 relative cursor-pointer hover:border-[var(--accent-primary)] transition-colors shadow-sm"
                        onClick={() => openArtworkModal(track)}
                        title="Haz clic para personalizar carátula"
                      >
                        {track.coverImage ? (
                          <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold"
                            style={{ background: track.coverGradient }}
                          >
                            PHO
                          </div>
                        )}
                      </div>

                      {/* Title & Artist */}
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playTrack(track)}>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate block">
                          {track.title}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {track.artist}
                        </span>
                      </div>

                      {/* Reorder actions & Delete */}
                      <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] font-mono tabular-nums text-slate-400 mr-1 hidden sm:inline">
                          {formatTime(track.duration)}
                        </span>

                        {/* Quick Promoters: Move to Top of Up Next */}
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              const targetPos = queueIndex >= 0 && idx > queueIndex ? queueIndex + 1 : 0;
                              reorderQueue(idx, targetPos);
                              showToast(`"${track.title}" movida al inicio de la cola`);
                            }}
                            className="p-1 text-slate-400 hover:text-[var(--accent-primary)] rounded-lg hover:bg-white/10 transition-colors"
                            title="Reproducir a continuación (al inicio)"
                          >
                            <ArrowUpToLine size={13} />
                          </button>
                        )}

                        {idx > 0 && (
                          <button
                            onClick={() => reorderQueue(idx, idx - 1)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            title="Subir un puesto"
                          >
                            <ChevronUp size={14} />
                          </button>
                        )}

                        {idx < queue.length - 1 && (
                          <button
                            onClick={() => reorderQueue(idx, idx + 1)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            title="Bajar un puesto"
                          >
                            <ChevronDown size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            removeFromQueue(idx);
                            showToast(`"${track.title}" eliminada de la cola`);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 ml-0.5 transition-colors"
                          title="Eliminar de la cola"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Visual Drop line indicator after */}
                    {isDragOver && dropPosition === 'after' && (
                      <div className="h-1 bg-[var(--accent-primary)] rounded-full mt-1 shadow-lg shadow-[var(--accent-primary)] flex items-center">
                        <div className="w-2 h-2 rounded-full bg-white ml-1 ring-2 ring-[var(--accent-primary)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

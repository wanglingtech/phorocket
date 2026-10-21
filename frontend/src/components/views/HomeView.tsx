import React from 'react';
import {
  Play,
  Heart,
  Scale,
  FolderOpen,
  Sparkles,
  ArrowRight,
  Disc3,
  Flame,
  Radio
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';
import { formatTime } from '../../utils/formatters';

export const HomeView: React.FC = () => {
  const {
    tracks,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    toggleFavorite,
    isFavorite,
    setActiveView,
    setSelectedPlaylistId
  } = useMusic();

  // Contextual greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Buenos días'
      : hour < 19
      ? 'Buenas tardes'
      : 'Buenas noches';

  const recentTracks = tracks.slice(0, 4);
  const legalPicks = tracks.filter((t) => t.source === 'legal_curated').slice(0, 4);

  const handleOpenPlaylist = (plId: string) => {
    setSelectedPlaylistId(plId);
    setActiveView('playlist-detail');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12 select-none">
      {/* Hero Contextual Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#1c1438] via-[#0f0c20] to-[#0a0715] border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
            <Radio size={14} className="animate-pulse" />
            <span>Biblioteca Inteligente Phorocket</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {greeting}, Piloto Sonoro.
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Explora tu música personal, sintetizadores cyberpunk generativos y catálogo de libre descarga legal con certificación Creative Commons.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => playTrack(tracks[0], tracks)}
              className="py-2.5 px-5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
              style={{
                boxShadow: '0 0 20px -3px var(--accent-glow)'
              }}
            >
              <Play size={16} fill="currentColor" />
              <span>Reproducir Sesión Neón</span>
            </button>

            <button
              onClick={() => setActiveView('legal')}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
            >
              <Scale size={16} />
              <span>Descubrir Música Legal</span>
            </button>

            <button
              onClick={() => setActiveView('import')}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <FolderOpen size={16} />
              <span>Importar Locales</span>
            </button>
          </div>
        </div>

        {/* Cyberpunk ambient background art */}
        <div className="absolute right-[-40px] top-[-40px] w-96 h-96 rounded-full bg-[var(--accent-glow)] blur-3xl opacity-30 pointer-events-none" />
      </div>

      {/* Quick Access: Continue Listening */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[var(--accent-primary)]" />
            <h2 className="text-lg font-display font-bold text-white">Continuar Escuchando</h2>
          </div>
          <button
            onClick={() => setActiveView('library')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Ver todo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const fav = isFavorite(track.id);

            return (
              <div
                key={track.id}
                className="group p-3 rounded-2xl bg-[#110e22]/70 hover:bg-[#181430] border border-white/5 hover:border-white/15 transition-all flex items-center gap-3 cursor-pointer shadow-sm hover:shadow-xl"
                onClick={() => playTrack(track, tracks)}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative border border-white/10 shadow-md">
                  {track.coverImage ? (
                    <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: track.coverGradient }}
                    >
                      PHO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Play size={18} fill="currentColor" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-semibold truncate block ${isCurrent ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {track.artist}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                    <span>{track.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{formatTime(track.duration)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    fav ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                  aria-label="Favorito"
                >
                  <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Playlists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Disc3 size={18} className="text-[var(--accent-secondary)]" />
            <h2 className="text-lg font-display font-bold text-white">Colecciones Destacadas</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => handleOpenPlaylist(pl.id)}
              className="p-5 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 hover:border-white/15 transition-all cursor-pointer group flex flex-col justify-between h-44 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-md"
                  style={{ background: pl.coverGradient }}
                >
                  <Disc3 size={24} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono tabular-nums text-slate-400 block">
                    {pl.trackIds.length} pistas
                  </span>
                  <span className="text-[10px] text-slate-400">Phorocket</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors truncate">
                  {pl.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {pl.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Music Discovery Spotlight */}
      <div className="p-6 rounded-3xl bg-[#0f0c1d] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-emerald-400" />
              <h2 className="text-lg font-display font-bold text-white">
                Música Autorizada & Descarga Legal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Obras con licencias abiertas verificadas (CC0, CC-BY 4.0) con descarga de audio y certificado de atribución.
            </p>
          </div>

          <button
            onClick={() => setActiveView('legal')}
            className="self-start sm:self-auto py-2 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Explorar catálogo legal completo</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {legalPicks.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, tracks)}
              className="p-3.5 rounded-2xl bg-[#141126] hover:bg-[#1c1836] border border-white/5 hover:border-white/15 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 relative border border-white/10">
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: track.coverGradient }}
                >
                  PHO
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-white truncate block">
                  {track.title}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {track.artist}
                </span>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 truncate max-w-[120px]">
                    {track.license.type.split(' ')[0]}
                  </span>
                  <span className="text-slate-400 font-mono tabular-nums">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

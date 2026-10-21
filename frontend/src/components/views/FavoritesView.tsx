import React from 'react';
import { Heart, Play, Shuffle, Plus, Music2, Clock, Camera } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';
import { SpotifyIcon } from './SpotifyExportModal';

export const FavoritesView: React.FC = () => {
  const {
    tracks,
    favorites,
    playTrack,
    currentTrack,
    toggleFavorite,
    setActiveView,
    toggleShuffle,
    openSpotifyModal,
    openArtworkModal
  } = useMusic();

  const favoriteTracks = tracks.filter((t) => favorites.has(t.id));

  const handlePlayAll = (shuffle = false) => {
    if (favoriteTracks.length === 0) return;
    if (shuffle) toggleShuffle();
    playTrack(favoriteTracks[0], favoriteTracks);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-rose-950/40">
            <Heart size={32} fill="currentColor" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Colección Privada
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
              Canciones Favoritas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {favoriteTracks.length} canciones marcadas con corazón
            </p>
          </div>
        </div>

        {favoriteTracks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handlePlayAll(false)}
              className="py-2.5 px-5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Play size={16} fill="currentColor" />
              <span>Reproducir</span>
            </button>
            <button
              onClick={() => handlePlayAll(true)}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
            >
              <Shuffle size={16} />
              <span>Aleatorio</span>
            </button>
            <button
              onClick={() => openSpotifyModal('favorites')}
              className="py-2.5 px-4 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border border-[#1DB954]/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Exportar canciones favoritas a Spotify"
            >
              <SpotifyIcon size={15} />
              <span>Exportar a Spotify</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {favoriteTracks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Heart size={28} />
          </div>
          <h2 className="text-lg font-bold text-white">Aún no tienes canciones favoritas</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Pulsa el icono de corazón en cualquier canción mientras navegas o escuchas música para guardarla aquí.
          </p>
          <button
            onClick={() => setActiveView('home')}
            className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors inline-block"
          >
            Explorar catálogo
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0e0c1a]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141026] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4 hidden md:table-cell">Álbum</th>
                <th className="py-3 px-4 hidden lg:table-cell">Género</th>
                <th className="py-3 px-4 text-right w-20">
                  <Clock size={12} className="inline mr-1" />
                </th>
                <th className="py-3 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {favoriteTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;

                return (
                  <tr
                    key={track.id}
                    onClick={() => playTrack(track, favoriteTracks)}
                    className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                      isCurrent ? 'bg-purple-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          {track.coverImage ? (
                            <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: track.coverGradient }}>
                              PHO
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className={`font-semibold block truncate ${isCurrent ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                            {track.title}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {track.artist}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell truncate max-w-[160px]">
                      {track.album}
                    </td>
                    <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">
                      {track.genre}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {formatTime(track.duration)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openArtworkModal(track);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                          title="Subir o cambiar carátula"
                        >
                          <Camera size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400"
                          title="Quitar de favoritos"
                        >
                          <Heart size={15} fill="currentColor" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

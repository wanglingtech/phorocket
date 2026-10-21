import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Trash2,
  Copy,
  Edit2,
  Music2,
  Clock,
  X,
  Heart,
  Calendar,
  AlertTriangle,
  Download,
  Camera
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';
import { SpotifyIcon } from './SpotifyExportModal';

export const PlaylistDetailView: React.FC = () => {
  const {
    playlists,
    selectedPlaylistId,
    tracks,
    playTrack,
    currentTrack,
    isPlaying,
    updatePlaylist,
    duplicatePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    exportPlaylistAsM3U,
    toggleFavorite,
    isFavorite,
    setActiveView,
    toggleShuffle,
    openArtworkModal,
    openSpotifyModal
  } = useMusic();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const playlist = playlists.find((pl) => pl.id === selectedPlaylistId);

  if (!playlist) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No se encontró la playlist seleccionada.</p>
        <button
          onClick={() => setActiveView('library')}
          className="mt-3 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold"
        >
          Volver a la Biblioteca
        </button>
      </div>
    );
  }

  // Get tracks belonging to playlist
  const playlistTracks = playlist.trackIds
    .map((tid) => tracks.find((t) => t.id === tid))
    .filter(Boolean) as typeof tracks;

  const totalSeconds = playlistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const startEdit = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description);
    setIsEditing(true);
  };

  const saveEdit = () => {
    updatePlaylist(playlist.id, {
      name: editName.trim() || playlist.name,
      description: editDesc.trim()
    });
    setIsEditing(false);
  };

  const handlePlayAll = (shuffle = false) => {
    if (playlistTracks.length === 0) return;
    if (shuffle) toggleShuffle();
    playTrack(playlistTracks[0], playlistTracks);
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    setShowDeleteConfirm(false);
    setActiveView('library');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 md:p-8 rounded-3xl bg-[#0f0c20] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Cover Art */}
        <div
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-purple-950/60 border border-white/15"
          style={{ background: playlist.coverGradient }}
        >
          <Music2 size={64} className="opacity-90" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <span className="text-[11px] font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
            Lista de Reproducción
          </span>

          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight truncate">
            {playlist.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {playlist.description || 'Sin descripción'}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <span>{playlistTracks.length} canciones</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatTime(totalSeconds)}</span>
            <span aria-hidden="true">·</span>
            <span>Creada el {playlist.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlayAll(false)}
            disabled={playlistTracks.length === 0}
            className="py-2.5 px-5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Play size={16} fill="currentColor" />
            <span>Reproducir Todo</span>
          </button>

          <button
            onClick={() => handlePlayAll(true)}
            disabled={playlistTracks.length === 0}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
          >
            <Shuffle size={16} />
            <span>Aleatorio</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={startEdit}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            title="Editar nombre y descripción"
          >
            <Edit2 size={16} />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            onClick={() => openSpotifyModal(playlist.id)}
            className="p-2 sm:px-3 rounded-xl text-[#1DB954] hover:text-white bg-[#1DB954]/10 hover:bg-[#1DB954] border border-[#1DB954]/30 hover:border-[#1DB954] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Exportar esta lista a tu cuenta de Spotify"
          >
            <SpotifyIcon size={15} />
            <span className="hidden sm:inline">Exportar a Spotify</span>
          </button>

          <button
            onClick={() => exportPlaylistAsM3U(playlist.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            title="Exportar archivo de lista M3U8"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar M3U8</span>
          </button>

          <button
            onClick={() => duplicatePlaylist(playlist.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            title="Duplicar lista"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Duplicar</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            title="Eliminar playlist"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>

      {/* Playlist Tracks Table */}
      {playlistTracks.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
          <Music2 size={32} className="mx-auto text-slate-500 opacity-50" />
          <h3 className="text-base font-bold text-white">Esta playlist aún no tiene canciones</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explora el buscador o tu biblioteca y haz clic en el botón '+' para añadir canciones a esta lista.
          </p>
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
                <th className="py-3 px-4 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {playlistTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const fav = isFavorite(track.id);

                return (
                  <tr
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, playlistTracks)}
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
                          className={`p-1.5 rounded-lg ${fav ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
                        >
                          <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(playlist.id, track.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                          title="Quitar de la lista"
                        >
                          <X size={14} />
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

      {/* Edit Playlist Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#120f26] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Editar Lista de Reproducción</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#181432] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Descripción</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#181432] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="py-2 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#120f26] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-white">¿Eliminar esta playlist?</h3>
            <p className="text-xs text-slate-400">
              Esta acción no se puede deshacer. Se eliminará la lista "{playlist.name}", pero las pistas seguirán en tu biblioteca.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 px-4 rounded-xl text-xs text-slate-300 hover:text-white bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

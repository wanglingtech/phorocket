import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Table as TableIcon,
  Play,
  Heart,
  ArrowUpDown,
  Plus,
  FolderOpen,
  Music2,
  Calendar,
  Clock,
  Camera,
  Edit3,
  Tag
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';
import { formatTime } from '../../utils/formatters';
import { SpotifyIcon } from './SpotifyExportModal';

export const LibraryView: React.FC = () => {
  const {
    tracks,
    playlists,
    playTrack,
    currentTrack,
    isPlaying,
    toggleFavorite,
    isFavorite,
    setActiveView,
    createPlaylist,
    setSelectedPlaylistId,
    openArtworkModal,
    openSpotifyModal,
    openEditMetadataModal
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'all' | 'imported' | 'albums' | 'artists' | 'playlists' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album' | 'duration' | 'addedAt'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered tracks
  const displayedTracks = useMemo(() => {
    let list = [...tracks];

    if (activeTab === 'imported') {
      list = list.filter((t) => t.source === 'local_imported');
    } else if (activeTab === 'favorites') {
      list = list.filter((t) => isFavorite(t.id));
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'artist') cmp = a.artist.localeCompare(b.artist);
      else if (sortBy === 'album') cmp = a.album.localeCompare(b.album);
      else if (sortBy === 'duration') cmp = a.duration - b.duration;
      else if (sortBy === 'addedAt') cmp = a.addedAt.localeCompare(b.addedAt);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [tracks, activeTab, sortBy, sortOrder, isFavorite]);

  // Unique Albums
  const albums = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; count: number; gradient: string }>();
    tracks.forEach((t) => {
      if (!map.has(t.album)) {
        map.set(t.album, { album: t.album, artist: t.artist, count: 1, gradient: t.coverGradient });
      } else {
        const item = map.get(t.album)!;
        item.count++;
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Unique Artists
  const artists = useMemo(() => {
    const map = new Map<string, number>();
    tracks.forEach((t) => {
      map.set(t.artist, (map.get(t.artist) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [tracks]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
            Biblioteca Personal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra tu colección musical: {tracks.length} canciones · {playlists.length} playlists
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Quick actions */}
          <button
            onClick={() => setActiveView('import')}
            className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderOpen size={15} />
            <span>Importar</span>
          </button>

          <button
            onClick={() => {
              const id = createPlaylist(`Nueva Lista ${playlists.length + 1}`);
              setSelectedPlaylistId(id);
              setActiveView('playlist-detail');
            }}
            className="py-2 px-3.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus size={15} />
            <span>Crear Playlist</span>
          </button>

          <button
            onClick={() => openSpotifyModal()}
            className="py-2 px-3.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border border-[#1DB954]/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Exportar listas de reproducción a Spotify"
          >
            <SpotifyIcon size={15} />
            <span className="hidden sm:inline">Exportar a Spotify</span>
          </button>

          {/* View mode toggle */}
          <div className="hidden md:flex items-center bg-[#141026] p-1 rounded-xl border border-white/10 ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[var(--accent-primary)] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'compact' ? 'bg-[var(--accent-primary)] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Lista compacta"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[var(--accent-primary)] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tabla detallada"
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'Todas las Canciones' },
          { id: 'imported', label: 'Archivos Locales' },
          { id: 'albums', label: 'Álbumes' },
          { id: 'artists', label: 'Artistas' },
          { id: 'playlists', label: 'Playlists' },
          { id: 'favorites', label: 'Favoritos' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--accent-primary)] text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Albums view */}
      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((alb) => (
            <div
              key={alb.album}
              className="p-3.5 rounded-2xl bg-[#110e22] hover:bg-[#181430] border border-white/5 transition-all group cursor-pointer"
            >
              <div
                className="aspect-square w-full rounded-xl flex items-center justify-center text-white text-base font-bold shadow-md mb-3"
                style={{ background: alb.gradient }}
              >
                PHO
              </div>
              <span className="text-xs font-bold text-white block truncate group-hover:text-[var(--accent-primary)]">
                {alb.album}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {alb.artist}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {alb.count} canciones
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Artists view */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {artists.map(([artistName, count]) => (
            <div
              key={artistName}
              className="p-4 rounded-2xl bg-[#110e22] hover:bg-[#181430] border border-white/5 transition-all text-center group cursor-pointer"
            >
              <div className="w-18 h-18 rounded-full bg-purple-500/20 border border-purple-500/30 mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-105 transition-transform">
                {artistName[0]}
              </div>
              <span className="text-sm font-bold text-white block truncate group-hover:text-[var(--accent-primary)]">
                {artistName}
              </span>
              <span className="text-xs text-slate-400">{count} pistas</span>
            </div>
          ))}
        </div>
      )}

      {/* Playlists view */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                setSelectedPlaylistId(pl.id);
                setActiveView('playlist-detail');
              }}
              className="p-5 rounded-2xl bg-[#110e22] hover:bg-[#181430] border border-white/5 transition-all cursor-pointer group flex flex-col justify-between h-40"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: pl.coverGradient }}
                >
                  <Music2 size={22} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {pl.trackIds.length} canciones
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSpotifyModal(pl.id);
                    }}
                    className="p-1.5 rounded-lg bg-black/40 text-slate-400 hover:text-white hover:bg-[#1DB954] transition-all opacity-0 group-hover:opacity-100"
                    title="Exportar a Spotify"
                  >
                    <SpotifyIcon size={14} />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-base font-bold text-white block group-hover:text-[var(--accent-primary)] truncate">
                  {pl.name}
                </span>
                <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {pl.description || 'Lista personalizada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracks views (All, Imported, Favorites) */}
      {(activeTab === 'all' || activeTab === 'imported' || activeTab === 'favorites') && (
        <>
          {displayedTracks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
              <Music2 size={32} className="mx-auto text-slate-500 opacity-50" />
              <h3 className="text-base font-bold text-white">No hay canciones en esta categoría</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeTab === 'imported'
                  ? 'Importa archivos MP3, WAV o FLAC desde tu dispositivo para reproducirlos.'
                  : activeTab === 'favorites'
                  ? 'Marca el icono de corazón en tus canciones preferidas para verlas aquí.'
                  : 'Explora el catálogo legal para añadir música.'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table Mode (Desktop) */
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0e0c1a]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141026] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('title')}>
                      <div className="flex items-center gap-1.5">
                        <span>Título</span>
                        {sortBy === 'title' && <ArrowUpDown size={12} className="text-[var(--accent-primary)]" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hidden md:table-cell" onClick={() => toggleSort('album')}>
                      <div className="flex items-center gap-1.5">
                        <span>Álbum</span>
                        {sortBy === 'album' && <ArrowUpDown size={12} className="text-[var(--accent-primary)]" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hidden lg:table-cell" onClick={() => toggleSort('addedAt')}>
                      <div className="flex items-center gap-1.5">
                        <span>Fecha</span>
                        {sortBy === 'addedAt' && <ArrowUpDown size={12} className="text-[var(--accent-primary)]" />}
                      </div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer text-right w-20" onClick={() => toggleSort('duration')}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock size={12} />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedTracks.map((track, idx) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const fav = isFavorite(track.id);

                    return (
                      <tr
                        key={track.id}
                        onClick={() => playTrack(track, displayedTracks)}
                        className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                          isCurrent ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                          {isCurrent && isPlaying ? (
                            <span className="text-[var(--accent-primary)] font-bold">▶</span>
                          ) : (
                            idx + 1
                          )}
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
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {track.artist}
                                </span>
                                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/25 max-w-[130px] truncate">
                                  {track.genre}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell truncate max-w-[160px]">
                          {track.album}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono hidden lg:table-cell">
                          {track.addedAt}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                          {formatTime(track.duration)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditMetadataModal(track);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--accent-primary)] hover:bg-white/10 transition-colors"
                              title="Editar metadatos (título, artista, etiquetas de género)"
                              aria-label="Editar metadatos"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openArtworkModal(track);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                              title="Subir o cambiar carátula de esta pista"
                            >
                              <Camera size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(track.id);
                              }}
                              className={`p-1.5 rounded-lg ${fav ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
                              title={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                            >
                              <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Mode */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedTracks.map((track) => {
                const fav = isFavorite(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, displayedTracks)}
                    className="p-3.5 rounded-2xl bg-[#110e22] hover:bg-[#181430] border border-white/5 transition-all group cursor-pointer relative"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden relative mb-3 border border-white/10">
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: track.coverGradient }}>
                          PHO
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Play size={20} fill="currentColor" />
                      </div>

                      {/* Quick Action Buttons on Grid Card */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditMetadataModal(track);
                          }}
                          className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-[var(--accent-primary)] transition-colors shadow-sm"
                          title="Editar metadatos (título, artista, géneros)"
                          aria-label="Editar metadatos"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openArtworkModal(track);
                          }}
                          className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-[var(--accent-primary)] transition-colors shadow-sm"
                          title="Subir o cambiar carátula"
                          aria-label="Cambiar carátula"
                        >
                          <Camera size={12} />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white block truncate">
                      {track.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {track.artist}
                    </span>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25 truncate max-w-full">
                        {track.genre}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Compact List Mode */
            <div className="space-y-1">
              {displayedTracks.map((track) => {
                const fav = isFavorite(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, displayedTracks)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10 relative group/thumb"
                      onClick={(e) => {
                        e.stopPropagation();
                        openArtworkModal(track);
                      }}
                      title="Haz clic para cambiar carátula"
                    >
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: track.coverGradient }}>
                          PHO
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white truncate block">{track.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 truncate">{track.artist}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-white/5 text-slate-400 border border-white/5 truncate max-w-[120px]">
                          {track.genre}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditMetadataModal(track);
                      }}
                      className="p-1.5 text-slate-400 hover:text-[var(--accent-primary)] rounded-lg hover:bg-white/5 transition-colors"
                      title="Editar metadatos"
                      aria-label="Editar metadatos"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openArtworkModal(track);
                      }}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Cambiar carátula"
                    >
                      <Camera size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className={`p-1.5 ${fav ? 'text-rose-500' : 'text-slate-500 hover:text-white'}`}
                      title={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

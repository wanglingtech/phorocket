import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Play,
  Heart,
  Music2,
  Sparkles,
  ExternalLink,
  History,
  Disc,
  User,
  Mic2,
  ArrowRight,
  CornerDownLeft,
  Filter,
  Check
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track, Playlist } from '../../types/music';
import { formatTime } from '../../utils/formatters';

interface AlbumResult {
  name: string;
  artist: string;
  coverGradient: string;
  coverImage?: string;
  tracks: Track[];
}

interface ArtistResult {
  name: string;
  tracks: Track[];
  sampleGenre: string;
  coverGradient: string;
}

// Helper to highlight matching substrings with cyberpunk neon glow
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + lowerQuery.length);
  const after = text.slice(index + lowerQuery.length);

  return (
    <>
      {before}
      <span className="text-[var(--accent-primary)] font-bold bg-[var(--accent-primary)]/20 px-1 py-0.5 rounded shadow-[0_0_8px_var(--accent-glow)]">
        {match}
      </span>
      {after}
    </>
  );
};

export const SearchView: React.FC = () => {
  const {
    tracks,
    playlists,
    playTrack,
    toggleFavorite,
    isFavorite,
    setSelectedPlaylistId,
    setActiveView,
    openLyricPanel,
    showToast
  } = useMusic();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'local' | 'legal'>('all');
  const [selectedLicense, setSelectedLicense] = useState<string>('all');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestionTab, setSuggestionTab] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('phorocket_search_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['Neon', 'Synthwave', 'Vector Pulse', 'Tokyo 2099'];
  });

  // Unique catalog of albums across all loaded tracks
  const allAlbums: AlbumResult[] = useMemo(() => {
    const map = new Map<string, AlbumResult>();
    tracks.forEach((t) => {
      const albumKey = t.album.toLowerCase();
      if (!map.has(albumKey)) {
        map.set(albumKey, {
          name: t.album,
          artist: t.artist,
          coverGradient: t.coverGradient,
          coverImage: t.coverImage,
          tracks: [t]
        });
      } else {
        map.get(albumKey)!.tracks.push(t);
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Unique catalog of artists across all tracks
  const allArtists: ArtistResult[] = useMemo(() => {
    const map = new Map<string, ArtistResult>();
    tracks.forEach((t) => {
      const artistKey = t.artist.toLowerCase();
      if (!map.has(artistKey)) {
        map.set(artistKey, {
          name: t.artist,
          tracks: [t],
          sampleGenre: t.genre,
          coverGradient: t.coverGradient
        });
      } else {
        map.get(artistKey)!.tracks.push(t);
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  // Debounce query for main view list
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = query.trim();
      setDebouncedQuery(trimmed);
      if (trimmed && !searchHistory.includes(trimmed)) {
        const nextHist = [trimmed, ...searchHistory.slice(0, 7)];
        setSearchHistory(nextHist);
        localStorage.setItem('phorocket_search_history', JSON.stringify(nextHist));
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // REAL-TIME SEARCH SUGGESTION ENGINE:
  // Evaluates instantly upon typing (zero debounce delay)
  const realTimeSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        tracks: [] as Track[],
        artists: [] as ArtistResult[],
        albums: [] as AlbumResult[],
        totalCount: 0
      };
    }

    // 1. Suggested Tracks
    const suggestedTracks = tracks
      .filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const artistMatch = t.artist.toLowerCase().includes(q);
        const albumMatch = t.album.toLowerCase().includes(q);
        const genreMatch = t.genre.toLowerCase().includes(q);
        return titleMatch || artistMatch || albumMatch || genreMatch;
      })
      .sort((a, b) => {
        // Boost exact startsWith matches
        const aStart = a.title.toLowerCase().startsWith(q) ? 2 : 0;
        const bStart = b.title.toLowerCase().startsWith(q) ? 2 : 0;
        return bStart - aStart;
      })
      .slice(0, 5);

    // 2. Suggested Artists
    const suggestedArtists = allArtists
      .filter((art) => art.name.toLowerCase().includes(q) || art.sampleGenre.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 2 : 0;
        const bStart = b.name.toLowerCase().startsWith(q) ? 2 : 0;
        return bStart - aStart;
      })
      .slice(0, 4);

    // 3. Suggested Albums
    const suggestedAlbums = allAlbums
      .filter((alb) => alb.name.toLowerCase().includes(q) || alb.artist.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 2 : 0;
        const bStart = b.name.toLowerCase().startsWith(q) ? 2 : 0;
        return bStart - aStart;
      })
      .slice(0, 4);

    const totalCount = suggestedTracks.length + suggestedArtists.length + suggestedAlbums.length;

    return {
      tracks: suggestedTracks,
      artists: suggestedArtists,
      albums: suggestedAlbums,
      totalCount
    };
  }, [query, tracks, allArtists, allAlbums]);

  // Flatten suggestions for keyboard navigation
  const flattenedSuggestions = useMemo(() => {
    const list: Array<{
      type: 'track' | 'artist' | 'album';
      item: Track | ArtistResult | AlbumResult;
    }> = [];

    if (suggestionTab === 'all' || suggestionTab === 'songs') {
      realTimeSuggestions.tracks.forEach((t) => list.push({ type: 'track', item: t }));
    }
    if (suggestionTab === 'all' || suggestionTab === 'artists') {
      realTimeSuggestions.artists.forEach((a) => list.push({ type: 'artist', item: a }));
    }
    if (suggestionTab === 'all' || suggestionTab === 'albums') {
      realTimeSuggestions.albums.forEach((al) => list.push({ type: 'album', item: al }));
    }
    return list;
  }, [realTimeSuggestions, suggestionTab]);

  // Reset highlight index when query changes
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [query, suggestionTab]);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen && e.key === 'ArrowDown') {
      setIsSuggestionsOpen(true);
      return;
    }

    if (isSuggestionsOpen && flattenedSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < flattenedSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : flattenedSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < flattenedSuggestions.length) {
          e.preventDefault();
          const target = flattenedSuggestions[selectedSuggestionIndex];
          executeSuggestionSelection(target.type, target.item);
        } else {
          setIsSuggestionsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsSuggestionsOpen(false);
      }
    }
  };

  const executeSuggestionSelection = (
    type: 'track' | 'artist' | 'album',
    item: Track | ArtistResult | AlbumResult
  ) => {
    if (type === 'track') {
      const track = item as Track;
      playTrack(track);
      setQuery(track.title);
      showToast(`Reproduciendo "${track.title}"`);
    } else if (type === 'artist') {
      const artist = item as ArtistResult;
      setQuery(artist.name);
      setActiveCategory('artists');
      showToast(`Filtrado por artista "${artist.name}"`);
    } else if (type === 'album') {
      const album = item as AlbumResult;
      setQuery(album.name);
      setActiveCategory('albums');
      showToast(`Filtrado por álbum "${album.name}"`);
    }
    setIsSuggestionsOpen(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('phorocket_search_history');
    showToast('Historial de búsquedas eliminado');
  };

  // Main filtered tracks
  const filteredTracks = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();

    return tracks.filter((t) => {
      const matchText =
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q);

      if (!matchText) return false;

      if (activeCategory === 'local' && t.source !== 'local_imported') return false;
      if (activeCategory === 'legal' && t.source !== 'legal_curated') return false;

      if (selectedLicense !== 'all' && !t.license.type.toLowerCase().includes(selectedLicense.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [tracks, debouncedQuery, activeCategory, selectedLicense]);

  // Main filtered artists
  const filteredArtists = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allArtists.filter((a) => a.name.toLowerCase().includes(q) || a.sampleGenre.toLowerCase().includes(q));
  }, [allArtists, debouncedQuery]);

  // Main filtered albums
  const filteredAlbums = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return allAlbums.filter(
      (alb) => alb.name.toLowerCase().includes(q) || alb.artist.toLowerCase().includes(q)
    );
  }, [allAlbums, debouncedQuery]);

  // Filtered playlists
  const filteredPlaylists = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return playlists.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [playlists, debouncedQuery]);

  const categories = [
    { id: 'all', label: 'Todo' },
    { id: 'songs', label: 'Canciones' },
    { id: 'artists', label: 'Artistas' },
    { id: 'albums', label: 'Álbumes' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'local', label: 'Archivos Locales' },
    { id: 'legal', label: 'Descargas Legales' }
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Search Header Container with Popover Anchored */}
      <div ref={searchContainerRef} className="space-y-4 relative">
        <div className="relative max-w-3xl">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar en tiempo real por canción, artista, álbum, género..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => {
              setIsInputFocused(true);
              setIsSuggestionsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#120f24] border border-white/10 rounded-2xl pl-12 pr-28 py-3.5 text-base text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/40 transition-all shadow-xl"
            autoFocus
          />

          {/* Quick HUD indicators inside the right of the search bar */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
              <CornerDownLeft size={10} /> Enter
            </span>
          </div>

          {/* ============================================================== */}
          {/* REAL-TIME SEARCH SUGGESTION ENGINE OVERLAY / DROPDOWN          */}
          {/* ============================================================== */}
          {isSuggestionsOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0919]/98 border border-[var(--accent-primary)]/40 rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Telemetry Header inside Suggestion Popover */}
              <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                  <span className="font-bold text-white tracking-wide">
                    Motor de Sugerencias en Tiempo Real
                  </span>
                  {query.trim() && (
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      ({realTimeSuggestions.tracks.length} pistas · {realTimeSuggestions.artists.length} artistas · {realTimeSuggestions.albums.length} álbumes)
                    </span>
                  )}
                </div>

                {/* Filter Tabs in Suggestions */}
                {query.trim() && (
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    {(['all', 'songs', 'artists', 'albums'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setSuggestionTab(tab)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors capitalize ${
                          suggestionTab === tab
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab === 'all'
                          ? 'Todo'
                          : tab === 'songs'
                          ? 'Canciones'
                          : tab === 'artists'
                          ? 'Artistas'
                          : 'Álbumes'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions Body */}
              <div className="max-h-[460px] overflow-y-auto p-3 space-y-4">
                {query.trim().length === 0 ? (
                  /* When input is focused but empty: Show instant quick prompts & recent searches */
                  <div className="p-3 space-y-4">
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <History size={14} className="text-[var(--accent-primary)]" />
                            <span>Búsquedas recientes</span>
                          </span>
                          <button
                            onClick={clearHistory}
                            className="hover:text-white transition-colors text-[11px]"
                          >
                            Limpiar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setQuery(item);
                                setIsSuggestionsOpen(false);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <Search size={12} className="text-slate-400" />
                              <span>{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-2">
                        Tendencias Cyberpunk recomendadas
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { title: 'Neon Orbit', type: 'Pista' },
                          { title: 'Vector Pulse', type: 'Artista' },
                          { title: 'Tokyo 2099', type: 'Álbum' },
                          { title: 'Synthwave', type: 'Género' }
                        ].map((trend) => (
                          <button
                            key={trend.title}
                            onClick={() => {
                              setQuery(trend.title);
                              setIsSuggestionsOpen(false);
                            }}
                            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left transition-all group"
                          >
                            <span className="text-xs font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors block truncate">
                              {trend.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{trend.type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : realTimeSuggestions.totalCount === 0 ? (
                  /* No suggestions found */
                  <div className="p-8 text-center space-y-2">
                    <Search size={28} className="mx-auto text-slate-500 opacity-60" />
                    <p className="text-sm font-semibold text-white">
                      Sin sugerencias directas para "{query}"
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Presiona Enter para buscar en todo el catálogo o intenta con términos como "Neon", "Synthwave", o "Electro".
                    </p>
                  </div>
                ) : (
                  /* Active Suggestions Categorized */
                  <div className="space-y-4">
                    {/* SECTION 1: SUGGESTED TRACKS */}
                    {(suggestionTab === 'all' || suggestionTab === 'songs') &&
                      realTimeSuggestions.tracks.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Music2 size={13} className="text-[var(--accent-primary)]" />
                              <span>Canciones sugeridas ({realTimeSuggestions.tracks.length})</span>
                            </span>
                          </div>
                          <div className="space-y-1">
                            {realTimeSuggestions.tracks.map((track) => {
                              const isHighlighted =
                                selectedSuggestionIndex >= 0 &&
                                flattenedSuggestions[selectedSuggestionIndex]?.item === track;

                              return (
                                <div
                                  key={track.id}
                                  onClick={() => executeSuggestionSelection('track', track)}
                                  className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl transition-all cursor-pointer group ${
                                    isHighlighted
                                      ? 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/50 text-white'
                                      : 'hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  {/* Art & Title */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                                      {track.coverImage ? (
                                        <img
                                          src={track.coverImage}
                                          alt={track.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div
                                          className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                                          style={{ background: track.coverGradient }}
                                        >
                                          PHO
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <Play size={14} fill="currentColor" />
                                      </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <span className="text-sm font-semibold text-white truncate block">
                                        <HighlightMatch text={track.title} query={query} />
                                      </span>
                                      <span className="text-xs text-slate-400 truncate block">
                                        <HighlightMatch text={track.artist} query={query} /> ·{' '}
                                        <HighlightMatch text={track.album} query={query} />
                                      </span>
                                    </div>
                                  </div>

                                  {/* Genre & Duration */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 font-mono">
                                      {track.genre}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                                      {formatTime(track.duration)}
                                    </span>

                                    {/* Quick Lyric Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openLyricPanel(track);
                                        setIsSuggestionsOpen(false);
                                      }}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                      title="Ver letra en el Panel de Letras"
                                      aria-label="Ver letra"
                                    >
                                      <Mic2 size={15} />
                                    </button>

                                    {/* Direct Play Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playTrack(track);
                                        showToast(`Reproduciendo "${track.title}"`);
                                        setIsSuggestionsOpen(false);
                                      }}
                                      className="p-1.5 rounded-lg text-white bg-[var(--accent-primary)] hover:brightness-110 shadow-sm transition-all"
                                      title="Reproducir ahora"
                                      aria-label="Reproducir"
                                    >
                                      <Play size={13} fill="currentColor" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* SECTION 2: SUGGESTED ARTISTS */}
                    {(suggestionTab === 'all' || suggestionTab === 'artists') &&
                      realTimeSuggestions.artists.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <User size={13} className="text-cyan-400" />
                              <span>Artistas sugeridos ({realTimeSuggestions.artists.length})</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {realTimeSuggestions.artists.map((artist) => {
                              const isHighlighted =
                                selectedSuggestionIndex >= 0 &&
                                flattenedSuggestions[selectedSuggestionIndex]?.item === artist;

                              return (
                                <div
                                  key={artist.name}
                                  onClick={() => executeSuggestionSelection('artist', artist)}
                                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                                    isHighlighted
                                      ? 'bg-cyan-950/40 border border-cyan-400/50'
                                      : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0 shadow-sm">
                                      {artist.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white block truncate">
                                        <HighlightMatch text={artist.name} query={query} />
                                      </span>
                                      <span className="text-[11px] text-slate-400 truncate block">
                                        {artist.tracks.length} pistas · {artist.sampleGenre}
                                      </span>
                                    </div>
                                  </div>

                                  <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* SECTION 3: SUGGESTED ALBUMS */}
                    {(suggestionTab === 'all' || suggestionTab === 'albums') &&
                      realTimeSuggestions.albums.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Disc size={13} className="text-pink-400" />
                              <span>Álbumes sugeridos ({realTimeSuggestions.albums.length})</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {realTimeSuggestions.albums.map((album) => {
                              const isHighlighted =
                                selectedSuggestionIndex >= 0 &&
                                flattenedSuggestions[selectedSuggestionIndex]?.item === album;

                              return (
                                <div
                                  key={album.name}
                                  onClick={() => executeSuggestionSelection('album', album)}
                                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                                    isHighlighted
                                      ? 'bg-pink-950/40 border border-pink-400/50'
                                      : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold border border-white/10 shadow-sm"
                                      style={{ background: album.coverGradient }}
                                    >
                                      <Disc size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-white block truncate">
                                        <HighlightMatch text={album.name} query={query} />
                                      </span>
                                      <span className="text-[11px] text-slate-400 truncate block">
                                        {album.artist} · {album.tracks.length} canciones
                                      </span>
                                    </div>
                                  </div>

                                  <ArrowRight size={14} className="text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Suggestions Footer Navigation Help */}
              <div className="px-5 py-2.5 border-t border-white/10 bg-[#090714] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Navega con flechas ↑ ↓ y pulsa Enter</span>
                <button
                  onClick={() => setIsSuggestionsOpen(false)}
                  className="hover:text-white transition-colors"
                >
                  Cerrar sugerencias (Esc)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeCategory === c.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}

          {/* License Filter */}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            <span>Licencia:</span>
            <select
              value={selectedLicense}
              onChange={(e) => setSelectedLicense(e.target.value)}
              className="bg-[#120f24] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="all">Todas las licencias</option>
              <option value="CC0">Public Domain (CC0)</option>
              <option value="CC-BY 4.0">Creative Commons CC-BY</option>
              <option value="CC-BY-SA">CC-BY-SA 4.0</option>
              <option value="Open Audio">Open Audio License</option>
            </select>
          </div>
        </div>

        {/* Recent Search History (Interactive buttons outside) */}
        {!debouncedQuery && searchHistory.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <History size={14} />
                <span>Búsquedas recientes</span>
              </span>
              <button onClick={clearHistory} className="hover:text-white transition-colors">
                Limpiar historial
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(item)}
                  className="px-3 py-1.5 rounded-lg bg-[#141026] hover:bg-[#1c1836] border border-white/5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {debouncedQuery ? (
        <div className="space-y-8">
          {filteredTracks.length === 0 &&
          filteredArtists.length === 0 &&
          filteredAlbums.length === 0 &&
          filteredPlaylists.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
              <Search size={32} className="mx-auto text-slate-500 opacity-50" />
              <h3 className="text-base font-bold text-white">Sin resultados para "{debouncedQuery}"</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No se encontraron coincidencias en tu biblioteca local ni en el catálogo de demostración. Intenta con "Neon", "Cyber", o importa archivos de audio.
              </p>
            </div>
          ) : (
            <>
              {/* Songs List */}
              {(activeCategory === 'all' || activeCategory === 'songs' || activeCategory === 'local' || activeCategory === 'legal') &&
                filteredTracks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                      Canciones encontradas ({filteredTracks.length})
                    </h3>
                    <div className="space-y-1">
                      {filteredTracks.map((track) => {
                        const fav = isFavorite(track.id);
                        return (
                          <div
                            key={track.id}
                            onClick={() => playTrack(track, filteredTracks)}
                            className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
                          >
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                              {track.coverImage ? (
                                <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                                  style={{ background: track.coverGradient }}
                                >
                                  PHO
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Play size={16} fill="currentColor" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-semibold text-white truncate block">
                                <HighlightMatch text={track.title} query={debouncedQuery} />
                              </span>
                              <span className="text-xs text-slate-400 truncate block">
                                <HighlightMatch text={track.artist} query={debouncedQuery} /> ·{' '}
                                <HighlightMatch text={track.album} query={debouncedQuery} />
                              </span>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                                {track.genre}
                              </span>
                              <span className="text-emerald-400 text-[10px]">
                                {track.license.type.split(' ')[0]}
                              </span>
                            </div>

                            <span className="text-xs font-mono tabular-nums text-slate-400">
                              {formatTime(track.duration)}
                            </span>

                            {/* Open Lyric Panel button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openLyricPanel(track);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="Ver letras de esta canción"
                              aria-label="Ver letras"
                            >
                              <Mic2 size={16} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(track.id);
                              }}
                              className={`p-2 rounded-lg ${fav ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}
                              aria-label="Favorito"
                            >
                              <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Artists Section */}
              {(activeCategory === 'all' || activeCategory === 'artists') && filteredArtists.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Artistas ({filteredArtists.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {filteredArtists.map((artist) => (
                      <div
                        key={artist.name}
                        onClick={() => {
                          setQuery(artist.name);
                          playTrack(artist.tracks[0], artist.tracks);
                        }}
                        className="p-4 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 text-center cursor-pointer transition-all group"
                      >
                        <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-300 font-bold text-lg mb-2 shadow-sm group-hover:scale-105 transition-transform">
                          {artist.name[0]}
                        </div>
                        <span className="text-sm font-bold text-white block truncate">
                          <HighlightMatch text={artist.name} query={debouncedQuery} />
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {artist.tracks.length} {artist.tracks.length === 1 ? 'pista' : 'pistas'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Albums Section */}
              {(activeCategory === 'all' || activeCategory === 'albums') && filteredAlbums.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Álbumes ({filteredAlbums.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {filteredAlbums.map((album) => (
                      <div
                        key={album.name}
                        onClick={() => {
                          setQuery(album.name);
                          playTrack(album.tracks[0], album.tracks);
                        }}
                        className="p-4 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 cursor-pointer transition-all flex items-center gap-3 group"
                      >
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 font-bold border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                          style={{ background: album.coverGradient }}
                        >
                          <Disc size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-bold text-white block truncate">
                            <HighlightMatch text={album.name} query={debouncedQuery} />
                          </span>
                          <span className="text-xs text-slate-400 block truncate">
                            {album.artist}
                          </span>
                          <span className="text-[10px] text-purple-400 block mt-0.5">
                            {album.tracks.length} canciones
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlists Section */}
              {(activeCategory === 'all' || activeCategory === 'playlists') && filteredPlaylists.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    Listas de reproducción
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {filteredPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setSelectedPlaylistId(pl.id);
                          setActiveView('playlist-detail');
                        }}
                        className="p-4 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 cursor-pointer transition-all flex items-center gap-3"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
                          style={{ background: pl.coverGradient }}
                        >
                          <Music2 size={20} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-white block truncate">{pl.name}</span>
                          <span className="text-xs text-slate-400">{pl.trackIds.length} canciones</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* External Integrations Architecture Card */}
          <div className="p-5 rounded-2xl bg-[#0c0919] border border-white/5 text-xs text-slate-400 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Sparkles size={16} className="text-[var(--accent-primary)]" />
                <span>Arquitectura de Adaptadores para Proveedores Externos</span>
              </div>
              <button
                onClick={() => setActiveView('integrations')}
                className="py-1 px-3 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all flex items-center gap-1"
              >
                <span>Abrir Hub de Proveedores</span>
                <ExternalLink size={12} />
              </button>
            </div>
            <p className="leading-relaxed">
              Phorocket incluye contratos de integración preparados para conectar APIs oficiales autorizadas (como YouTube IFrame Player o servicios de catálogo abierto) mediante adaptadores desacoplados sin exponer credenciales en el cliente.
            </p>
          </div>
        </div>
      ) : (
        /* Empty / Exploration state */
        <div className="space-y-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Explorar por géneros y estilos
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Synthwave', color: 'linear-gradient(135deg, #7928ca 0%, #ff0080 100%)' },
              { label: 'Cyber Electro', color: 'linear-gradient(135deg, #00f0ff 0%, #7000ff 100%)' },
              { label: 'Ambient Void', color: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)' },
              { label: 'Dark Techno', color: 'linear-gradient(135deg, #ff0055 0%, #6366f1 100%)' },
              { label: 'Lo-Fi Cyber', color: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' },
              { label: 'Chiptune Arcade', color: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
              { label: 'Dominio Público CC0', color: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)' },
              { label: 'Archivos Locales', color: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }
            ].map((genre) => (
              <div
                key={genre.label}
                onClick={() => setQuery(genre.label)}
                className="h-24 p-3.5 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden flex items-end shadow-md"
                style={{ background: genre.color }}
              >
                <span className="font-display font-extrabold text-base text-white tracking-tight">
                  {genre.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

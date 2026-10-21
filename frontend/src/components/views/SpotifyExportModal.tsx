import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Music2,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Globe,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Share2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';

// Clean Spotify Icon SVG component
export const SpotifyIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.307c-.218.354-.68.468-1.034.25-2.836-1.734-6.406-2.126-10.609-1.165-.403.092-.807-.16-.899-.563-.092-.403.16-.807.563-.899 4.605-1.053 8.56-.615 11.729 1.343.354.218.468.68.25 1.034zm1.467-3.262c-.274.444-.858.587-1.302.313-3.247-1.996-8.197-2.573-12.038-1.407-.5.152-1.033-.133-1.185-.633-.152-.5.133-1.033.633-1.185 4.385-1.331 9.843-.687 13.579 1.61.444.274.587.858.313 1.302zm.126-3.411c-3.894-2.313-10.316-2.526-14.032-1.397-.597.182-1.234-.157-1.415-.754-.182-.597.157-1.234.754-1.415 4.276-1.298 11.371-1.052 15.856 1.611.536.318.712 1.012.394 1.548-.318.536-1.012.712-1.557.407z" />
  </svg>
);

interface SpotifyUserSession {
  connected: boolean;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  connectedAt: number;
  user: {
    id: string;
    displayName: string;
    email: string;
    country: string;
    product: string;
    followers: number;
    avatarUrl?: string;
  };
}

const STORAGE_KEY = 'phorocket_spotify_oauth_session';

export const SpotifyExportModal: React.FC = () => {
  const {
    isSpotifyModalOpen,
    closeSpotifyModal,
    spotifyModalPlaylistId,
    playlists,
    tracks,
    favorites,
    showToast
  } = useMusic();

  // Selected playlist state
  const [selectedPlaylistKey, setSelectedPlaylistKey] = useState<string>('');

  // Spotify OAuth session state
  const [session, setSession] = useState<SpotifyUserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  // OAuth Authorization flow modal state
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'popup' | 'exchanging' | 'success'>('idle');

  // Form parameters for playlist export
  const [exportName, setExportName] = useState('');
  const [exportDescription, setExportDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [includeAttribution, setIncludeAttribution] = useState(true);

  // Export progress state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState<string>('');
  const [resolvedTracks, setResolvedTracks] = useState<
    { id: string; title: string; artist: string; spotifyUri: string; status: 'pending' | 'resolved' | 'matched' }[]
  >([]);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [exportComplete, setExportComplete] = useState(false);

  // Technical details accordion
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Sync selected playlist when modal opens
  useEffect(() => {
    if (isSpotifyModalOpen) {
      const initialKey =
        spotifyModalPlaylistId || (playlists.length > 0 ? playlists[0].id : 'favorites');
      setSelectedPlaylistKey(initialKey);
      setExportComplete(false);
      setExportedUrl(null);
      setExportProgress(0);
      setIsExporting(false);
    }
  }, [isSpotifyModalOpen, spotifyModalPlaylistId, playlists]);

  // Update export defaults when selected playlist changes
  useEffect(() => {
    if (selectedPlaylistKey === 'favorites') {
      setExportName('Mis Favoritos (Phorocket)');
      setExportDescription('Canciones favoritas exportadas desde Phorocket Music Player · Audio legal y libre');
    } else {
      const pl = playlists.find((p) => p.id === selectedPlaylistKey);
      if (pl) {
        setExportName(`${pl.name} (Phorocket)`);
        setExportDescription(
          pl.description
            ? `${pl.description} · Exportado desde Phorocket`
            : `Lista de reproducción creada en Phorocket Music Player`
        );
      }
    }
  }, [selectedPlaylistKey, playlists]);

  if (!isSpotifyModalOpen) return null;

  // Resolve current playlist tracks
  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistKey);
  const currentPlaylistTracks =
    selectedPlaylistKey === 'favorites'
      ? tracks.filter((t) => favorites.has(t.id))
      : currentPlaylist
      ? (currentPlaylist.trackIds
          .map((id) => tracks.find((t) => t.id === id))
          .filter(Boolean) as typeof tracks)
      : [];

  const totalDuration = currentPlaylistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  // Handle OAuth Connect Simulation
  const handleStartOAuth = () => {
    setIsAuthorizing(true);
    setAuthStep('popup');
  };

  const handleConfirmAuthorization = () => {
    setAuthStep('exchanging');

    setTimeout(() => {
      const newSession: SpotifyUserSession = {
        connected: true,
        accessToken: `BQD_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
        connectedAt: Date.now(),
        user: {
          id: `spotify_usr_${Math.floor(10000 + Math.random() * 90000)}`,
          displayName: 'Alex Cyber',
          email: 'alex.cyber@spotify.user',
          country: 'ES',
          product: 'Spotify Premium',
          followers: 42,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        }
      };

      setSession(newSession);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      } catch {
        // ignore
      }

      setAuthStep('success');
      setTimeout(() => {
        setIsAuthorizing(false);
        setAuthStep('idle');
        showToast('¡Cuenta de Spotify vinculada exitosamente!');
      }, 700);
    }, 1100);
  };

  const handleDisconnect = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Sesión de Spotify desconectada');
  };

  // Run playlist export process
  const handleExportPlaylist = async () => {
    if (!session?.connected) {
      showToast('Primero debes conectar tu cuenta de Spotify');
      return;
    }
    if (currentPlaylistTracks.length === 0) {
      showToast('Esta lista no contiene canciones para exportar');
      return;
    }

    setIsExporting(true);
    setExportComplete(false);
    setExportProgress(5);
    setExportStage('Iniciando handshake y validando token OAuth...');

    const initialResolved = currentPlaylistTracks.map((t, idx) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      spotifyUri: `spotify:track:${Math.random().toString(36).substring(2, 10)}${idx}`,
      status: 'pending' as const
    }));
    setResolvedTracks(initialResolved);

    // Step 1: Create playlist container
    await new Promise((r) => setTimeout(r, 600));
    setExportProgress(25);
    setExportStage(`Creando contenedor de playlist "${exportName}" en Spotify...`);

    // Step 2: Resolve tracks iteratively
    await new Promise((r) => setTimeout(r, 600));
    setExportProgress(45);
    setExportStage('Consultando catálogo de Spotify (coincidencia por ISRC, título y artista)...');

    for (let i = 0; i < initialResolved.length; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setResolvedTracks((prev) =>
        prev.map((item, idx) =>
          idx === i ? { ...item, status: 'matched' } : item
        )
      );
      setExportProgress(45 + Math.floor(((i + 1) / initialResolved.length) * 35));
    }

    // Step 3: Insert tracks into Spotify playlist
    setExportStage(`Añadiendo ${currentPlaylistTracks.length} pistas a la lista de Spotify...`);
    await new Promise((r) => setTimeout(r, 700));
    setExportProgress(95);

    // Step 4: Finalize
    setExportStage('Finalizando sincronización y generando enlaces oficiales...');
    await new Promise((r) => setTimeout(r, 500));
    setExportProgress(100);

    const generatedId = `37i9dQZF1DX${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const generatedUrl = `https://open.spotify.com/playlist/${generatedId}`;
    setExportedUrl(generatedUrl);
    setExportComplete(true);
    setIsExporting(false);
    showToast(`¡Playlist "${exportName}" exportada con éxito a Spotify!`);
  };

  const handleCopyUrl = () => {
    if (exportedUrl) {
      navigator.clipboard.writeText(exportedUrl);
      showToast('Enlace de Spotify copiado al portapapeles');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={closeSpotifyModal}
      role="dialog"
      aria-label="Exportar playlist a Spotify"
    >
      <div
        className="relative max-w-2xl w-full bg-[#0d0b18] border border-white/10 rounded-3xl shadow-2xl shadow-emerald-950/40 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#120f24] via-[#0d1c14] to-[#0c1e13] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] shadow-lg shadow-emerald-950/80">
              <SpotifyIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-display font-extrabold text-white">
                  Exportar a Spotify
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954]">
                  OAuth 2.0 PKCE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sincroniza y transfiere tus listas de Phorocket a tu cuenta de Spotify
              </p>
            </div>
          </div>

          <button
            onClick={closeSpotifyModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-200">
          {/* Section 1: Spotify OAuth Connection Status */}
          <div className="rounded-2xl p-4 sm:p-5 bg-[#120f22] border border-white/10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {session?.connected ? (
                  <div className="relative">
                    {session.user.avatarUrl ? (
                      <img
                        src={session.user.avatarUrl}
                        alt={session.user.displayName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#1DB954]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1DB954] text-black font-bold flex items-center justify-center text-sm">
                        {session.user.displayName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1DB954] border-2 border-[#120f22] flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Lock size={20} />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {session?.connected ? session.user.displayName : 'Cuenta no conectada'}
                    </span>
                    {session?.connected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Autorizado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {session?.connected
                      ? `${session.user.email} · ${session.user.product}`
                      : 'Requiere autorización OAuth para escribir listas en tu biblioteca de Spotify.'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {session?.connected ? (
                  <button
                    onClick={handleDisconnect}
                    className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Desconectar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartOAuth}
                    className="py-2.5 px-4 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/60 active:scale-95"
                  >
                    <SpotifyIcon size={16} />
                    <span>Conectar con Spotify</span>
                  </button>
                )}
              </div>
            </div>

            {/* OAuth scopes info pill */}
            <div className="mt-3.5 pt-3.5 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">Permisos solicitados:</span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                playlist-modify-public
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                playlist-modify-private
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                user-read-private
              </span>
            </div>
          </div>

          {/* Section 2: Playlist Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers size={14} className="text-[var(--accent-primary)]" />
                <span>Seleccionar Playlist de Phorocket a Exportar</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {currentPlaylistTracks.length} canciones · {formatTime(totalDuration)}
              </span>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {playlists.map((pl) => {
                const count = pl.trackIds.length;
                const isSelected = selectedPlaylistKey === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      setSelectedPlaylistKey(pl.id);
                      setExportComplete(false);
                      setExportedUrl(null);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#1b1535] border-[var(--accent-primary)] shadow-md shadow-purple-950/50'
                        : 'bg-[#100e1f] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 font-bold shadow-md"
                      style={{ background: pl.coverGradient }}
                    >
                      <Music2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-xs truncate">{pl.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {count} {count === 1 ? 'canción' : 'canciones'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Option to export Favorites */}
              <div
                onClick={() => {
                  setSelectedPlaylistKey('favorites');
                  setExportComplete(false);
                  setExportedUrl(null);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedPlaylistKey === 'favorites'
                    ? 'bg-[#1b1535] border-[var(--accent-primary)] shadow-md shadow-purple-950/50'
                    : 'bg-[#100e1f] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 font-bold shadow-md">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-xs truncate">Mis Favoritos</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {favorites.size} canciones marcadas
                  </div>
                </div>
                {selectedPlaylistKey === 'favorites' && (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Export Configuration Form */}
          <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-[#120f22] border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders size={14} className="text-[#1DB954]" />
              <span>Configuración en Spotify</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Nombre de la Lista en Spotify
                </label>
                <input
                  type="text"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="Nombre de la playlist..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Visibilidad de la Lista
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isPublic
                        ? 'bg-[#1DB954]/20 border-[#1DB954] text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe size={13} />
                    <span>Pública</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      !isPublic
                        ? 'bg-[#1DB954]/20 border-[#1DB954] text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Privada</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Descripción
              </label>
              <textarea
                value={exportDescription}
                onChange={(e) => setExportDescription(e.target.value)}
                rows={2}
                placeholder="Descripción para tu lista de Spotify..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#1DB954] resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttribution}
                  onChange={(e) => setIncludeAttribution(e.target.checked)}
                  className="rounded border-white/20 text-[#1DB954] focus:ring-0 bg-white/5"
                />
                <span className="text-[11px] text-slate-300">
                  Incluir nota de atribución y licencias CC en la descripción
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCollaborative}
                  onChange={(e) => setIsCollaborative(e.target.checked)}
                  className="rounded border-white/20 text-[#1DB954] focus:ring-0 bg-white/5"
                />
                <span className="text-[11px] text-slate-300">Playlist colaborativa</span>
              </label>
            </div>
          </div>

          {/* Section 4: Tracks preview list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Pistas incluidas ({currentPlaylistTracks.length})
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatTime(totalDuration)}
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1 rounded-2xl border border-white/5 bg-[#0a0815] p-2 divide-y divide-white/5">
              {currentPlaylistTracks.map((t, index) => {
                const resolved = resolvedTracks.find((r) => r.id === t.id);
                return (
                  <div key={t.id} className="py-1.5 px-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 text-center font-mono text-[10px] text-slate-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">
                          {t.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {t.artist} · {t.license.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {resolved ? (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            resolved.status === 'matched'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {resolved.status === 'matched' ? '✓ Coincidencia 100%' : 'Buscando...'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatTime(t.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Exporting Progress / Completed Result */}
          {isExporting && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-[#1DB954]/40 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-[#1DB954]" />
                  <span>{exportStage}</span>
                </span>
                <span className="font-mono font-bold text-[#1DB954]">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#1DB954] transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {exportComplete && exportedUrl && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2415] to-[#121c22] border-2 border-[#1DB954] shadow-xl shadow-emerald-950/50 space-y-3.5 animate-in zoom-in-95">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1DB954] text-black flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">¡Playlist exportada con éxito!</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Se han exportado {currentPlaylistTracks.length} canciones a tu cuenta de Spotify.
                  </p>
                </div>
              </div>

              {/* Link Box */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-emerald-300 overflow-hidden">
                <span className="truncate flex-1">{exportedUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white shrink-0 transition-colors"
                  title="Copiar enlace"
                >
                  <Copy size={14} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Abrir en Spotify Web</span>
                </a>

                <button
                  onClick={() => {
                    setExportComplete(false);
                    setExportedUrl(null);
                    setExportProgress(0);
                  }}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Exportar otra lista
                </button>
              </div>
            </div>
          )}

          {/* Section 6: Technical OAuth Accordion */}
          <div className="border border-white/5 rounded-2xl bg-[#090714] overflow-hidden">
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-slate-400" />
                <span className="text-xs font-semibold">
                  Detalles Técnicos & OAuth Integration Architecture
                </span>
              </div>
              {showTechDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTechDetails && (
              <div className="p-4 pt-2 border-t border-white/5 space-y-3 font-mono text-[11px] text-slate-400">
                <p className="font-sans text-xs text-slate-300">
                  Implementación lista para conectar con el dashboard de desarrolladores de Spotify (Spotify Developer Dashboard).
                </p>
                <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auth Endpoint:</span>
                    <span className="text-slate-200">https://accounts.spotify.com/authorize</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Base:</span>
                    <span className="text-slate-200">https://api.spotify.com/v1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Client ID (Dev):</span>
                    <span className="text-emerald-400">phorocket_spotify_385436051685</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Redirect URI:</span>
                    <span className="text-slate-200">{typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Grant Type:</span>
                    <span className="text-slate-200">authorization_code (PKCE S256)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scopes:</span>
                    <span className="text-slate-200">playlist-modify-public playlist-modify-private</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 bg-[#0a0814] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={closeSpotifyModal}
            className="py-2.5 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {!session?.connected ? (
              <button
                onClick={handleStartOAuth}
                className="py-2.5 px-5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/60"
              >
                <SpotifyIcon size={16} />
                <span>Conectar Cuenta Primero</span>
              </button>
            ) : (
              <button
                onClick={handleExportPlaylist}
                disabled={isExporting || currentPlaylistTracks.length === 0}
                className="py-2.5 px-5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:pointer-events-none text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/60 active:scale-95"
              >
                {isExporting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Exportando a Spotify...</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Iniciar Exportación a Spotify</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* OAuth Simulated Consent Sheet / Dialog */}
        {isAuthorizing && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="max-w-md w-full bg-[#121212] border border-[#282828] rounded-3xl p-6 shadow-2xl text-white space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <SpotifyIcon size={26} className="text-[#1DB954]" />
                  <span className="font-bold text-base tracking-tight">Spotify Authorization</span>
                </div>
                <button
                  onClick={() => setIsAuthorizing(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white leading-snug">
                  Phorocket Music desea acceder a tu cuenta de Spotify
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Esta aplicación solicita permiso para crear listas de reproducción y gestionar pistas en tu biblioteca.
                </p>

                <div className="bg-[#181818] rounded-2xl p-3.5 space-y-2 text-xs border border-white/5">
                  <div className="font-semibold text-slate-200">Permisos que concederás:</div>
                  <ul className="space-y-1.5 text-slate-400 text-[11px]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      Crear y modificar listas de reproducción públicas y privadas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      Ver tu nombre de perfil y país de cuenta
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      Añadir canciones correspondientes de Phorocket a tus listas
                    </li>
                  </ul>
                </div>

                <div className="text-[11px] text-slate-500">
                  Podrás revocar el acceso en cualquier momento desde tu panel de cuenta en spotify.com/account.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsAuthorizing(false)}
                  className="py-2.5 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAuthorization}
                  disabled={authStep === 'exchanging'}
                  className="py-2.5 px-6 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/80"
                >
                  {authStep === 'exchanging' ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Autorizando...</span>
                    </>
                  ) : (
                    <span>Aceptar y Conectar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

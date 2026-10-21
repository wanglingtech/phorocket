import React, { useState } from 'react';
import {
  Globe,
  Youtube,
  Radio,
  Archive,
  Music,
  ExternalLink,
  Play,
  Plus,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Download,
  Info
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import {
  ExternalTrack,
  MOCK_EXTERNAL_RESULTS,
  PROVIDER_REGISTRY,
  ProviderId,
  ProviderState
} from '../../services/api/externalProvidersService';
import { formatTime } from '../../utils/formatters';
import { SpotifyIcon } from './SpotifyExportModal';

export const ExternalIntegrationsView: React.FC<{
  onSelectYouTubeTrack?: (track: ExternalTrack) => void;
}> = ({ onSelectYouTubeTrack }) => {
  const { playTrack, tracks, showToast, openSpotifyModal, playlists } = useMusic();

  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('youtube');
  const [simulatedState, setSimulatedState] = useState<ProviderState>('found');
  const [activeYouTubeTrack, setActiveYouTubeTrack] = useState<ExternalTrack | null>(null);

  const currentProviderInfo = PROVIDER_REGISTRY.find((p) => p.id === selectedProvider)!;
  const tracksList = MOCK_EXTERNAL_RESULTS[selectedProvider] || [];

  const handlePlayExternal = (track: ExternalTrack) => {
    if (track.provider === 'youtube') {
      setActiveYouTubeTrack(track);
      if (onSelectYouTubeTrack) onSelectYouTubeTrack(track);
      showToast('Abriendo reproductor oficial autorizado de YouTube...');
    } else {
      // Direct stream in Phorocket player
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album || 'Catálogo Externo',
        duration: track.duration,
        coverGradient: track.coverGradient,
        genre: 'External Stream',
        source: 'legal_curated',
        addedAt: new Date().toISOString().split('T')[0],
        license: {
          type: 'Creative Commons CC-BY 4.0',
          author: track.artist,
          sourceUrl: track.officialUrl,
          allowCommercial: track.canDownload,
          allowRemix: true,
          attributionRequired: true,
          downloadAllowed: track.canDownload,
          termsSummary: track.licenseNotes
        }
      });
      showToast(`Reproduciendo "${track.title}" vía adaptador oficial`);
    }
  };

  const statesList: { id: ProviderState; label: string }[] = [
    { id: 'available', label: '1. Proveedor disponible' },
    { id: 'loading', label: '2. Cargando resultados' },
    { id: 'found', label: '3. Resultados encontrados' },
    { id: 'no_results', label: '4. Sin resultados' },
    { id: 'rate_limited', label: '5. Límite de solicitudes (Rate Limit)' },
    { id: 'connection_error', label: '6. Error de conexión' },
    { id: 'service_unavailable', label: '7. Servicio no disponible' },
    { id: 'auth_required', label: '8. Autenticación requerida' },
    { id: 'source_only', label: '9. Solo en fuente original' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-[var(--accent-primary)]" />
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
              Adaptadores & Proveedores Externos
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Arquitectura desacoplada para fuentes de audio autorizadas (YouTube IFrame, Internet Archive, Jamendo, FMA).
          </p>
        </div>

        {/* State Simulator Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Estado de API:</span>
          <select
            value={simulatedState}
            onChange={(e) => setSimulatedState(e.target.value as ProviderState)}
            className="bg-[#141026] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent-primary)]"
          >
            {statesList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROVIDER_REGISTRY.map((prov) => {
          const isSelected = selectedProvider === prov.id;
          return (
            <button
              key={prov.id}
              onClick={() => setSelectedProvider(prov.id)}
              className={`p-3.5 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-md'
                  : 'bg-[#110e24] border-white/5 hover:border-white/15 text-slate-300'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--selection-bg)',
                      borderColor: 'var(--border-accent)'
                    }
                  : undefined
              }
            >
              <div className="p-2 rounded-xl bg-white/5 text-[var(--accent-primary)]">
                {prov.id === 'youtube' ? (
                  <Youtube size={18} className="text-rose-500" />
                ) : prov.id === 'archive_org' ? (
                  <Archive size={18} className="text-amber-400" />
                ) : prov.id === 'jamendo' ? (
                  <Music size={18} className="text-emerald-400" />
                ) : (
                  <Radio size={18} className="text-cyan-400" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">{prov.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 block truncate">Adaptador oficial</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Provider Status Details Card */}
      <div className="p-5 rounded-3xl bg-[#0f0c1e] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{currentProviderInfo.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Estado: {simulatedState}
            </span>
          </div>
          <p className="text-xs text-slate-300">{currentProviderInfo.stateMessage}</p>
        </div>

        <a
          href={currentProviderInfo.officialApiDocUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start md:self-auto py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <span>Documentación Oficial de API</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* State View Rendering */}
      {simulatedState === 'loading' && (
        <div className="p-16 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
          <RefreshCw size={32} className="mx-auto text-[var(--accent-primary)] animate-spin" />
          <h3 className="text-sm font-bold text-white">Consultando proveedor externo...</h3>
          <p className="text-xs text-slate-400">Verificando tokens de sesión y disponibilidad del servicio.</p>
        </div>
      )}

      {simulatedState === 'rate_limited' && (
        <div className="p-12 text-center rounded-3xl bg-amber-950/20 border border-amber-500/20 space-y-3">
          <AlertTriangle size={32} className="mx-auto text-amber-400" />
          <h3 className="text-base font-bold text-white">Límite de solicitudes alcanzado (HTTP 429)</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            La cuota de peticiones por minuto del proveedor ha expirado temporalmente. El adaptador reintentará automáticamente tras enfriamiento exponencial.
          </p>
        </div>
      )}

      {simulatedState === 'connection_error' && (
        <div className="p-12 text-center rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-3">
          <ShieldAlert size={32} className="mx-auto text-rose-400" />
          <h3 className="text-base font-bold text-white">Error de conexión con el proveedor</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            No se pudo establecer el protocolo SSL con el servidor del servicio. Verifica tu conexión a Internet o reintenta en unos instantes.
          </p>
        </div>
      )}

      {simulatedState === 'service_unavailable' && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-3">
          <AlertTriangle size={32} className="mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">Servicio temporalmente no disponible (HTTP 503)</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            El servicio externo se encuentra en mantenimiento programado. Tu biblioteca local y música sin conexión siguen completamente operativas.
          </p>
        </div>
      )}

      {simulatedState === 'auth_required' && (
        <div className="p-12 text-center rounded-3xl bg-[#141026] border border-purple-500/30 space-y-3">
          <Lock size={32} className="mx-auto text-[var(--accent-primary)]" />
          <h3 className="text-base font-bold text-white">Autenticación Requerida (OAuth 2.0)</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Este proveedor requiere vincular tu cuenta autorizada para acceder al catálogo completo sin compartir contraseñas.
          </p>
          <button
            onClick={() => {
              setSimulatedState('found');
              showToast('Sesión de prueba vinculada correctamente');
            }}
            className="py-2.5 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md inline-block"
          >
            Vincular Cuenta (Simulación)
          </button>
        </div>
      )}

      {simulatedState === 'no_results' && (
        <div className="p-12 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-2">
          <Info size={32} className="mx-auto text-slate-500" />
          <h3 className="text-base font-bold text-white">Sin resultados coincidentes</h3>
          <p className="text-xs text-slate-400">No se encontraron pistas para los términos solicitados en este catálogo.</p>
        </div>
      )}

      {simulatedState === 'source_only' && (
        <div className="p-12 text-center rounded-3xl bg-[#0f0c1d] border border-white/5 space-y-3">
          <ExternalLink size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-white">Contenido accesible únicamente en la fuente original</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Por condiciones de licencia y derechos de autor del distribuidor, esta obra solo puede escucharse accediendo a su portal oficial oficial sin retransmisión no autorizada.
          </p>
          <a
            href={currentProviderInfo.officialApiDocUrl}
            target="_blank"
            rel="noreferrer"
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-block"
          >
            Abrir Fuente Oficial
          </a>
        </div>
      )}

      {/* Found Results Grid */}
      {(simulatedState === 'found' || simulatedState === 'available') && (
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Pistas Autorizadas Disponibles ({tracksList.length})
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracksList.map((track) => (
              <div
                key={track.id}
                className="p-5 rounded-2xl bg-[#110e24] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div
                    onClick={() => handlePlayExternal(track)}
                    className="w-18 h-18 rounded-2xl overflow-hidden shrink-0 relative border border-white/10 cursor-pointer shadow-md"
                  >
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: track.coverGradient }}
                    >
                      {track.provider === 'youtube' ? 'YT' : 'EXT'}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Play size={22} fill="currentColor" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
                      {track.providerName}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate mt-0.5">{track.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="font-mono tabular-nums">{formatTime(track.duration)}</span>
                      <span>·</span>
                      <span>{track.playbackMode === 'authorized_embed' ? 'IFrame Oficial' : 'Stream Directo'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <p className="text-[11px] text-slate-400 leading-snug">{track.licenseNotes}</p>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handlePlayExternal(track)}
                      className="py-1.5 px-3 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>{track.provider === 'youtube' ? 'Ver en IFrame Oficial' : 'Reproducir'}</span>
                    </button>

                    <a
                      href={track.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir oficial</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spotify Integration Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c2415] via-[#101b22] to-[#120f26] border border-[#1DB954]/30 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/60">
            <SpotifyIcon size={30} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Sincronización & Exportación a Spotify
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                OAuth 2.0 PKCE
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Transfiere tus listas locales y colecciones de Phorocket directamente a tu biblioteca oficial de Spotify. Mapeo inteligente de ISRC y metadatos de autor.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span>{playlists.length} listas listas para exportar</span>
              <span>·</span>
              <span className="font-mono text-emerald-400">playlist-modify-public / private</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => openSpotifyModal()}
          className="py-3 px-5 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/80 shrink-0 active:scale-95"
        >
          <SpotifyIcon size={16} />
          <span>Abrir Exportador a Spotify</span>
        </button>
      </div>

      {/* YouTube Official IFrame Player Modal */}
      {activeYouTubeTrack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-label="Reproductor Oficial IFrame de YouTube"
        >
          <div className="w-full max-w-2xl bg-[#0e0c1a] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Youtube size={20} className="text-rose-500" />
                <h3 className="text-sm font-bold text-white">Reproductor Oficial IFrame de YouTube</h3>
              </div>
              <button
                onClick={() => setActiveYouTubeTrack(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/5"
              >
                Cerrar
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeYouTubeTrack.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                title={activeYouTubeTrack.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{activeYouTubeTrack.title}</span>
                <span>{activeYouTubeTrack.artist}</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                API Oficial Google YouTube
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

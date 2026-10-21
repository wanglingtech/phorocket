/**
 * Phorocket External Provider Adapter Architecture
 * Typed contracts and adapters for external music sources (YouTube authorized IFrame,
 * Internet Archive, Jamendo Open Music, Free Music Archive).
 */

export type ProviderId = 'youtube' | 'archive_org' | 'jamendo' | 'freemusicarchive';

export type ProviderState =
  | 'available'
  | 'loading'
  | 'found'
  | 'no_results'
  | 'rate_limited'
  | 'connection_error'
  | 'service_unavailable'
  | 'auth_required'
  | 'source_only';

export interface ExternalTrack {
  id: string;
  provider: ProviderId;
  providerName: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverGradient: string;
  officialUrl: string;
  youtubeVideoId?: string;
  playbackMode: 'authorized_embed' | 'direct_stream' | 'external_source_only';
  canAddToLibrary: boolean;
  canDownload: boolean;
  licenseNotes: string;
}

export interface ProviderStatusInfo {
  id: ProviderId;
  name: string;
  currentState: ProviderState;
  stateMessage: string;
  requiresAuth: boolean;
  officialApiDocUrl: string;
}

export const PROVIDER_REGISTRY: ProviderStatusInfo[] = [
  {
    id: 'youtube',
    name: 'YouTube Data API v3 & IFrame Player',
    currentState: 'available',
    stateMessage: 'Conexión preparada para reproductor oficial IFrame (sin extracción ilícita de streams)',
    requiresAuth: true,
    officialApiDocUrl: 'https://developers.google.com/youtube/v3'
  },
  {
    id: 'archive_org',
    name: 'Internet Archive Audio Collection',
    currentState: 'available',
    stateMessage: 'Acceso a millones de grabaciones sonoras históricas de dominio público',
    requiresAuth: false,
    officialApiDocUrl: 'https://archive.org/help/about.php'
  },
  {
    id: 'jamendo',
    name: 'Jamendo Music API (Creative Commons)',
    currentState: 'available',
    stateMessage: 'Catálogo de artistas independientes bajo licencias Creative Commons',
    requiresAuth: true,
    officialApiDocUrl: 'https://developer.jamendo.com/v3.0'
  },
  {
    id: 'freemusicarchive',
    name: 'Free Music Archive (FMA)',
    currentState: 'available',
    stateMessage: 'Música curada por radioemisoras comunitarias para creadores',
    requiresAuth: false,
    officialApiDocUrl: 'https://freemusicarchive.org/api'
  }
];

export const MOCK_EXTERNAL_RESULTS: Record<ProviderId, ExternalTrack[]> = {
  youtube: [
    {
      id: 'yt-01',
      provider: 'youtube',
      providerName: 'YouTube Official',
      title: 'Neon Tokyo 2099 (Official Stream)',
      artist: 'Cyberwave Orchestra',
      album: 'Metropolis Live',
      duration: 230,
      coverGradient: 'linear-gradient(135deg, #ff0000 0%, #7928ca 100%)',
      officialUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeVideoId: 'dQw4w9WgXcQ',
      playbackMode: 'authorized_embed',
      canAddToLibrary: true,
      canDownload: false,
      licenseNotes: 'Reproducción únicamente mediante el reproductor oficial IFrame de YouTube.'
    },
    {
      id: 'yt-02',
      provider: 'youtube',
      providerName: 'YouTube Official',
      title: 'Hologram Skies Ambient Session',
      artist: 'Aura Studio',
      album: 'Singularity',
      duration: 310,
      coverGradient: 'linear-gradient(135deg, #00f0ff 0%, #ff0055 100%)',
      officialUrl: 'https://www.youtube.com',
      youtubeVideoId: 'jfKfPfyJRdk',
      playbackMode: 'authorized_embed',
      canAddToLibrary: true,
      canDownload: false,
      licenseNotes: 'Protegido por derechos del creador. No apto para descarga local.'
    }
  ],
  archive_org: [
    {
      id: 'arc-01',
      provider: 'archive_org',
      providerName: 'Internet Archive',
      title: 'Early Electronic Soundscapes (1968)',
      artist: 'Experimental Audio Pioneer Lab',
      album: 'Vintage Synthesizer Archives',
      duration: 195,
      coverGradient: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
      officialUrl: 'https://archive.org/details/audio',
      playbackMode: 'direct_stream',
      canAddToLibrary: true,
      canDownload: true,
      licenseNotes: 'Dominio Público universal. Apto para escucha y descarga legal directa.'
    }
  ],
  jamendo: [
    {
      id: 'jam-01',
      provider: 'jamendo',
      providerName: 'Jamendo Music',
      title: 'Cyber Highway Drift',
      artist: 'Stardust Drive',
      album: 'Neon Nights CC',
      duration: 180,
      coverGradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
      officialUrl: 'https://www.jamendo.com',
      playbackMode: 'direct_stream',
      canAddToLibrary: true,
      canDownload: true,
      licenseNotes: 'Licencia Creative Commons CC-BY 4.0. Libre descarga con atribución.'
    }
  ],
  freemusicarchive: [
    {
      id: 'fma-01',
      provider: 'freemusicarchive',
      providerName: 'Free Music Archive',
      title: 'Ambient Space Walk Station',
      artist: 'Cosmo Drone',
      album: 'FMA Curated Vol. 4',
      duration: 210,
      coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      officialUrl: 'https://freemusicarchive.org',
      playbackMode: 'direct_stream',
      canAddToLibrary: true,
      canDownload: true,
      licenseNotes: 'CC-BY-NC: Libre para escucha y descarga no comercial.'
    }
  ]
};

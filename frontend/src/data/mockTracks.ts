import { Playlist, Track } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'pho-01',
    title: 'Neon Orbit',
    artist: 'Phorocket Labs',
    album: 'Synthetic Skies',
    duration: 198,
    coverGradient: 'linear-gradient(135deg, #7928ca 0%, #ff0080 100%)',
    genre: 'Synthwave',
    bpm: 124,
    source: 'legal_curated',
    synthStyle: 'cyber_arpeggio',
    synthSeed: 101,
    addedAt: '2026-09-15',
    license: {
      type: 'Creative Commons CC-BY 4.0',
      author: 'Phorocket Audio Lab',
      authorUrl: 'https://phorocket.io/licenses/cc-by',
      sourceUrl: 'https://phorocket.io/audio/neon-orbit',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Libre para uso comercial y remixes bajo atribución explícita al autor original.'
    },
    lyrics: [
      '[00:12] Pulsos de neón cruzando el horizonte',
      '[00:28] Señales binarias en la noche de cristal',
      '[00:45] La nave despega hacia la órbita violeta',
      '[01:02] Frecuencias que resuenan en la eternidad',
      '[01:30] Cero gravedad, solo ritmo y luz'
    ]
  },
  {
    id: 'pho-02',
    title: 'Quantum Drift',
    artist: 'Vector Pulse',
    album: 'Zero Horizon',
    duration: 214,
    coverGradient: 'linear-gradient(135deg, #00f0ff 0%, #7000ff 100%)',
    genre: 'Cyber Electro',
    bpm: 128,
    source: 'legal_curated',
    synthStyle: 'neon_bass',
    synthSeed: 102,
    addedAt: '2026-09-18',
    license: {
      type: 'Public Domain (CC0)',
      author: 'Vector Pulse Project',
      sourceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: false,
      downloadAllowed: true,
      termsSummary: 'Dedicado al dominio público universal sin restricciones de ningún tipo.'
    },
    lyrics: [
      '[00:15] Sensores calibrados a mil hercios',
      '[00:32] Distorsión electromagnética controlada',
      '[00:54] El vacío responde con armonía pura'
    ]
  },
  {
    id: 'pho-03',
    title: 'Void Sublimation',
    artist: 'Aether 09',
    album: 'Deep Space Reverie',
    duration: 245,
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
    genre: 'Ambient Void',
    bpm: 84,
    source: 'legal_curated',
    synthStyle: 'ambient_void',
    synthSeed: 103,
    addedAt: '2026-09-22',
    license: {
      type: 'Creative Commons CC-BY-SA 4.0',
      author: 'Aether Collective',
      sourceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Permite distribución y obras derivadas siempre que se comparta bajo la misma licencia.'
    },
    lyrics: [
      '[00:20] Ecos del cosmos en silencio absoluto',
      '[01:10] Ondas gravitacionales que mecen la mente',
      '[02:00] Respira la quietud del hiperespacio'
    ]
  },
  {
    id: 'pho-04',
    title: 'Midnight Grid Run',
    artist: 'Kuro Cyber',
    album: 'Tokyo 2099',
    duration: 182,
    coverGradient: 'linear-gradient(135deg, #ff0055 0%, #6366f1 100%)',
    genre: 'Dark Techno',
    bpm: 134,
    source: 'legal_curated',
    synthStyle: 'techno_drive',
    synthSeed: 104,
    addedAt: '2026-09-25',
    license: {
      type: 'Creative Commons CC-BY 4.0',
      author: 'Kuro Cyber',
      sourceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Uso comercial permitido con atribución a Kuro Cyber.'
    },
    lyrics: [
      '[00:08] Acelerando en la autopista elevada',
      '[00:24] Destellos de lluvia ácida en el parabrisas',
      '[00:40] El bajo sacude la estructura de acero'
    ]
  },
  {
    id: 'pho-05',
    title: 'Solar Flare Protocol',
    artist: 'Helios Synth',
    album: 'Photon Storm',
    duration: 172,
    coverGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    genre: 'Synthwave',
    bpm: 122,
    source: 'legal_curated',
    synthStyle: 'cyber_arpeggio',
    synthSeed: 105,
    addedAt: '2026-09-28',
    license: {
      type: 'Open Audio License (Free Commercial)',
      author: 'Helios Music Group',
      sourceUrl: 'https://openaudiolicense.org/helios-solar-flare',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Licencia abierta comercial sin regalías para streaming y videojuegos.'
    },
    lyrics: [
      '[00:16] Radiación dorada iluminando los paneles',
      '[00:36] El reactor ruge al compás del arpegio',
      '[01:04] Energía infinita en el núcleo estelar'
    ]
  },
  {
    id: 'pho-06',
    title: 'Rain on Neo-Shibuya',
    artist: 'Lo-Fi Pilot',
    album: 'Late Night Coffee & Megacities',
    duration: 160,
    coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    genre: 'Lo-Fi Cyber',
    bpm: 88,
    source: 'legal_curated',
    synthStyle: 'lofi_pulse',
    synthSeed: 106,
    addedAt: '2026-10-01',
    license: {
      type: 'Public Domain (CC0)',
      author: 'Lo-Fi Pilot',
      sourceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: false,
      downloadAllowed: true,
      termsSummary: 'Dominio público: libre descarga, remix y uso sin atribución necesaria.'
    },
    lyrics: [
      '[00:10] Gotas cayendo sobre los anuncios holográficos',
      '[00:30] Una taza caliente mientras la ciudad duerme',
      '[01:00] Teclados suaves y memorias lejanas'
    ]
  },
  {
    id: 'pho-07',
    title: 'Hyperlink Velocity',
    artist: 'DataStrider',
    album: 'Bandwidth Unlimited',
    duration: 205,
    coverGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    genre: 'Cyber Electro',
    bpm: 126,
    source: 'legal_curated',
    synthStyle: 'cyber_arpeggio',
    synthSeed: 107,
    addedAt: '2026-10-03',
    license: {
      type: 'Creative Commons CC-BY 4.0',
      author: 'DataStrider Net',
      sourceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Permitido para streaming, podcasts y videos con mención de autor.'
    },
    lyrics: [
      '[00:14] Enlace óptico conectado a la red neuronal',
      '[00:32] Millones de paquetes fluyendo a la velocidad de la luz',
      '[00:52] Saltando firewalls entre rascacielos de silicio',
      '[01:15] El buffer se desborda en una sinfonía digital',
      '[01:40] Señal limpia, latencia cero en el núcleo central'
    ]
  },
  {
    id: 'pho-08',
    title: 'Neural Echoes',
    artist: 'MindMatrix',
    album: 'Synapse 3.0',
    duration: 190,
    coverGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    genre: 'Dark Techno',
    bpm: 130,
    source: 'legal_curated',
    synthStyle: 'neon_bass',
    synthSeed: 108,
    addedAt: '2026-10-05',
    license: {
      type: 'Creative Commons CC-BY 4.0',
      author: 'MindMatrix Audio',
      sourceUrl: 'https://creativecommons.org/licenses/by/4.0/',
      allowCommercial: true,
      allowRemix: true,
      attributionRequired: true,
      downloadAllowed: true,
      termsSummary: 'Libre para uso creativo y comercial bajo atribución formal.'
    },
    lyrics: [
      '[00:10] Recuerdos sintéticos grabados en chips de memoria',
      '[00:26] El sintetizador modular despierta el subconsciente',
      '[00:48] Pulsos oscuros vibrando en el cortex cerebral',
      '[01:12] Ecos que no se apagan en la matriz cibernética',
      '[01:38] Reconexión completada, mente y máquina en fase'
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-cyber-night',
    name: 'Cyberpunk Night Drive',
    description: 'Arpegios analógicos, bajos de neón y atmósferas nocturnas para transitar la megaciudad.',
    coverGradient: 'linear-gradient(135deg, #7928ca 0%, #00f0ff 100%)',
    trackIds: ['pho-01', 'pho-02', 'pho-04', 'pho-07'],
    createdAt: '2026-09-20'
  },
  {
    id: 'pl-lofi-code',
    name: 'Neon Focus & Code [Lo-Fi]',
    description: 'Ritmos lentos y envolventes para sesiones profundas de programación y diseño.',
    coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    trackIds: ['pho-06', 'pho-03', 'pho-01'],
    createdAt: '2026-09-25'
  },
  {
    id: 'pl-open-licensed',
    name: 'Colección Abierta CC0 & Dominio Público',
    description: 'Pistas verificadas con licencias permisivas para descarga legal y creación de contenido.',
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    trackIds: ['pho-02', 'pho-06', 'pho-03', 'pho-05'],
    createdAt: '2026-10-01'
  }
];

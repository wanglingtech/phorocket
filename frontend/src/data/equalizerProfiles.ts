import { EqualizerBands, EqualizerProfile } from '../types/music';

export const DEFAULT_BANDS: EqualizerBands = {
  '60Hz': 0,
  '250Hz': 0,
  '1kHz': 0,
  '4kHz': 0,
  '12kHz': 0
};

export const FACTORY_EQUALIZER_PROFILES: EqualizerProfile[] = [
  {
    id: 'flat',
    name: 'Equilibrado (Flat)',
    description: 'Respuesta acústica neutra, fiel y equilibrada sin coloración.',
    bands: { '60Hz': 0, '250Hz': 0, '1kHz': 0, '4kHz': 0, '12kHz': 0 },
    isCustom: false,
    colorTag: '#8b5cf6'
  },
  {
    id: 'cyber_bass',
    name: 'Graves Reforzados (Cyber Bass)',
    description: 'Graves profundos y contundentes optimizados para synthwave y techno.',
    bands: { '60Hz': 7, '250Hz': 4, '1kHz': 0, '4kHz': 1, '12kHz': 2 },
    isCustom: false,
    colorTag: '#ec4899'
  },
  {
    id: 'neon_treble',
    name: 'Neón Treble & Brillo',
    description: 'Realce nítido de sintetizadores, platillos y frecuencias altas.',
    bands: { '60Hz': 1, '250Hz': 0, '1kHz': 2, '4kHz': 5, '12kHz': 7 },
    isCustom: false,
    colorTag: '#06b6d4'
  },
  {
    id: 'vocal_boost',
    name: 'Vocales Claras & Presencia',
    description: 'Mayor articulación en el rango medio vocal entre 1 kHz y 4 kHz.',
    bands: { '60Hz': -2, '250Hz': 1, '1kHz': 5, '4kHz': 4, '12kHz': 1 },
    isCustom: false,
    colorTag: '#eab308'
  },
  {
    id: 'electronic',
    name: 'Electrónica Club (Curva V)',
    description: 'Clásica curva V enérgica con bombos rotundos y agudos brillantes.',
    bands: { '60Hz': 6, '250Hz': 3, '1kHz': -2, '4kHz': 4, '12kHz': 6 },
    isCustom: false,
    colorTag: '#10b981'
  },
  {
    id: 'lofi_warmth',
    name: 'Lo-Fi Cálido & Vinilo',
    description: 'Atenuación suave de altas frecuencias y refuerzo medio-grave analógico.',
    bands: { '60Hz': 4, '250Hz': 3, '1kHz': 1, '4kHz': -2, '12kHz': -4 },
    isCustom: false,
    colorTag: '#f97316'
  },
  {
    id: 'gaming_atmos',
    name: 'Inmersión Espacial 3D',
    description: 'Realce dinámico periférico para detalles cinematográficos y juegos.',
    bands: { '60Hz': 5, '250Hz': -1, '1kHz': 1, '4kHz': 5, '12kHz': 4 },
    isCustom: false,
    colorTag: '#ef4444'
  },
  {
    id: 'acoustic_pure',
    name: 'Acústico & Sala Viva',
    description: 'Timbre natural, aireado y orgánico para piano, cuerdas y guitarras.',
    bands: { '60Hz': 2, '250Hz': 1, '1kHz': 3, '4kHz': 2, '12kHz': 3 },
    isCustom: false,
    colorTag: '#3b82f6'
  }
];

export const STORAGE_KEY_CUSTOM_PROFILES = 'phorocket_eq_custom_profiles_v1';
export const STORAGE_KEY_ACTIVE_PRESET = 'phorocket_eq_active_preset_v1';
export const STORAGE_KEY_ACTIVE_BANDS = 'phorocket_eq_active_bands_v1';

export function loadSavedCustomProfiles(): EqualizerProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PROFILES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is EqualizerProfile =>
        p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        p.bands &&
        typeof p.bands['60Hz'] === 'number' &&
        typeof p.bands['250Hz'] === 'number' &&
        typeof p.bands['1kHz'] === 'number' &&
        typeof p.bands['4kHz'] === 'number' &&
        typeof p.bands['12kHz'] === 'number'
    );
  } catch {
    return [];
  }
}

export function saveCustomProfilesToStorage(profiles: EqualizerProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save EQ profiles to localStorage', err);
  }
}

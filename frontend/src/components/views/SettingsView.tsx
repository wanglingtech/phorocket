import React, { useState } from 'react';
import {
  Palette,
  Activity,
  Sliders,
  HardDrive,
  Keyboard,
  Sparkles,
  Watch,
  Info,
  Check,
  Trash2,
  Globe,
  RotateCcw,
  Zap,
  Radio,
  Layers,
  Monitor,
  Disc,
  Eye,
  Box,
  Tv,
  AlertTriangle,
  Flame,
  Layout,
  Maximize2,
  Type,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  SlidersHorizontal
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import {
  ThemeId,
  VisualizerMode,
  PlayerBarStyle,
  ArtworkDisplayStyle,
  BackgroundVfxStyle,
  SidebarDensity,
  SystemFontFamily
} from '../../types/music';
import { SpotifyIcon } from './SpotifyExportModal';
import { D3CyberAudioVisualizer } from '../visualizer/D3CyberAudioVisualizer';

const QUICK_NEON_SWATCHES = [
  { name: 'Púrpura Eléctrico', hex: '#a855f7' },
  { name: 'Cian Cíber', hex: '#00e5ff' },
  { name: 'Verde Matrix', hex: '#10b981' },
  { name: 'Magenta Neón', hex: '#ec4899' },
  { name: 'Ámbar Solar', hex: '#f59e0b' },
  { name: 'Rojo Carmesí', hex: '#f43f5e' },
  { name: 'Lima Láser', hex: '#a3e635' },
  { name: 'Azul Índigo', hex: '#6366f1' }
];

const BACKGROUND_TONES = [
  { name: 'Vacío Cuántico (Defecto)', hex: '#07060c', desc: 'Negro con matiz violeta profundo' },
  { name: 'Negro OLED Puro', hex: '#000000', desc: '0% luminosidad, máximo contraste' },
  { name: 'Azul Neo-Tokyo', hex: '#060d17', desc: 'Profundidad de ciberespacio nocturno' },
  { name: 'Terminal Matrix', hex: '#040c07', desc: 'Verde oscuro de consola retro' },
  { name: 'Carmesí Void', hex: '#0d0508', desc: 'Rojo carbón de alto octanaje' }
];

const SYSTEM_FONT_OPTIONS: {
  id: SystemFontFamily;
  name: string;
  category: string;
  previewSample: string;
  cssFamily: string;
}[] = [
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Neo-Grotesque Pro · Predeterminado',
    previewSample: 'Phorocket Audio Player // 2026',
    cssFamily: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Geométrico Minimalista & Moderno',
    previewSample: 'Phorocket Audio Player // 2026',
    cssFamily: "'Outfit', sans-serif"
  },
  {
    id: 'orbitron',
    name: 'Orbitron',
    category: 'Sci-Fi Espacial & Cyberpunk Mecha',
    previewSample: 'PHOROCKET AUDIO // 2026',
    cssFamily: "'Orbitron', sans-serif"
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani',
    category: 'Táctico HUD Cuadrado & Denso',
    previewSample: 'PHOROCKET TACTICAL HUD // 2026',
    cssFamily: "'Rajdhani', sans-serif"
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    category: 'Brutalismo Digital & Techno',
    previewSample: 'Phorocket Space Grotesk // 2026',
    cssFamily: "'Space Grotesk', sans-serif"
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Universal · Máxima Claridad y Precisión',
    previewSample: 'Phorocket Audio Player // 2026',
    cssFamily: "'Inter', sans-serif"
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    category: 'Monospace Hacker & Terminal',
    previewSample: 'phorocket.audio.dsp.synthesize()',
    cssFamily: "'JetBrains Mono', monospace"
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Geométrico Amigable & Redondeado',
    previewSample: 'Phorocket Audio Player // 2026',
    cssFamily: "'Poppins', sans-serif"
  }
];

export const SettingsView: React.FC = () => {
  const {
    activeTheme,
    setTheme,
    visualizerMode,
    setVisualizerMode,
    customColors,
    updateCustomColors,
    componentCustomization,
    updateComponentCustomization,
    resetAllToDefaults,
    tracks,
    isPlaying,
    setIsAudioSettingsOpen,
    setIsLogoModalOpen,
    setIsWatchModalOpen,
    showToast,
    openSpotifyModal,
    setActiveView,
    equalizerPreset,
    equalizerProfiles,
    customBackdrops,
    openBackdropModal,
    updateCustomBackdrop,
    resetCustomBackdrop
  } = useMusic();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'colors' | 'components' | 'appearance' | 'system'>('colors');

  const themes: { id: ThemeId; name: string; hex: string; desc: string }[] = [
    { id: 'violet-pulse', name: 'Violet Pulse', hex: '#a855f7', desc: 'Violeta eléctrico · Identidad original Phorocket' },
    { id: 'cyber-cyan', name: 'Cyber Cyan', hex: '#00e5ff', desc: 'Cian de alta frecuencia · Atmósfera neo-Tokyo' },
    { id: 'neon-matrix', name: 'Neon Matrix', hex: '#10b981', desc: 'Verde terminal cuántico · Contraste nítido' },
    { id: 'crimson-drive', name: 'Crimson Drive', hex: '#f43f5e', desc: 'Rojo carmesí de sobremarcha · Energía agresiva' },
    { id: 'solar-gold', name: 'Solar Gold', hex: '#f59e0b', desc: 'Ámbar y oro fotónico · Calidez electromagnética' },
    { id: 'magenta-flux', name: 'Magenta Flux', hex: '#ec4899', desc: 'Magenta estroboscópico · Dinamismo sintético' }
  ];

  const visualizerModes: { id: VisualizerMode; name: string; desc: string; badge?: string }[] = [
    { id: 'd3-cyberpunk', name: 'D3 Ciber-Espectral HUD', desc: 'Motor D3 vectorial con cintas fluidas y radar orbital', badge: 'Nuevo D3' },
    { id: 'd3-radial-hud', name: 'D3 Radar Polar Táctico', desc: 'Analizador circular 360° con barrido láser y telemetría', badge: 'Nuevo D3' },
    { id: 'bars', name: 'Barras de Ecualizador', desc: 'Columnas verticales con picos luminosos flotantes' },
    { id: 'wave', name: 'Onda Sonora Horizontal', desc: 'Osciloscopio vectorial fluido y suave' },
    { id: 'circle', name: 'Círculo Reactivo', desc: 'Ondas radiales concéntricas envolventes' },
    { id: 'spectrum', name: 'Espectro de Frecuencias', desc: 'Curva analítica continua de alta densidad' },
    { id: 'particles', name: 'Partículas Luminosas', desc: 'Polvo de neón sutil que responde a los graves' },
    { id: 'minimal', name: 'Minimalista', desc: 'Línea de nivel discreta sin saturación visual' }
  ];

  const playerBarStyles: { id: PlayerBarStyle; name: string; desc: string }[] = [
    { id: 'cyber-dock', name: 'Dock Flotante Cyberpunk', desc: 'Cápsula elevada translúcida con halos de luz y biseles neón' },
    { id: 'studio-rack', name: 'Rack Estudio DSP', desc: 'Consola de audio profesional con medidores extendidos' },
    { id: 'minimal-hud', name: 'HUD Minimalista', desc: 'Barra delgada de perfil bajo para máxima concentración' }
  ];

  const artworkStyles: { id: ArtworkDisplayStyle; name: string; desc: string }[] = [
    { id: 'hologram-glow', name: 'Marco Holográfico', desc: 'Bordes neón dinámicos y reflejo especular cibernético' },
    { id: 'vinyl-cyber', name: 'Vinilo Giratorio Cyber', desc: 'Surcos circulares que giran al compás de la música' },
    { id: 'glass-3d', name: 'Cristal Translúcido 3D', desc: 'Efecto de profundidad refractiva con luz perimetral' },
    { id: 'clean-flat', name: 'Minimalista Moderno', desc: 'Diseño limpio y sobrio sin ornamentos distractores' }
  ];

  const backgroundVfxStyles: { id: BackgroundVfxStyle; name: string; desc: string }[] = [
    { id: 'thunder-storm', name: 'Tormenta de Rayos Reactiva', desc: 'Relámpagos y descargas sincronizadas con los graves' },
    { id: 'cyber-grid', name: 'Rejilla Synthwave 3D', desc: 'Perspectiva futurista en cuadrícula de horizonte infinito' },
    { id: 'quantum-dust', name: 'Polvo Cuántico Estelar', desc: 'Partículas estelares que flotan suavemente en el vacío' },
    { id: 'solid-clean', name: 'Fondo Sólido Puro', desc: 'Sin animaciones gráficas pesadas para optimizar batería' }
  ];

  const shortcuts = [
    { key: 'Barra espaciadora', action: 'Reproducir / Pausar' },
    { key: 'Flecha Izquierda / Derecha', action: 'Rebobinar / Avanzar 5 segundos' },
    { key: 'Flecha Arriba / Abajo', action: 'Subir / Bajar volumen' },
    { key: 'M', action: 'Silenciar / Reactivar audio' },
    { key: 'L', action: 'Marcar / Desmarcar como Favorito' },
    { key: 'F', action: 'Abrir / Cerrar Reproductor Pantalla Completa' }
  ];

  const handleClearCache = () => {
    localStorage.removeItem('phorocket_tracks');
    localStorage.removeItem('phorocket_history');
    showToast('Caché y datos temporales restablecidos');
  };

  const handleApplyPresetColor = (primaryHex: string) => {
    updateCustomColors({
      accentPrimary: primaryHex,
      isCustomActive: true
    });
    showToast(`Color primario actualizado a ${primaryHex}`);
  };

  const handleApplySecondaryColor = (secHex: string) => {
    updateCustomColors({
      accentSecondary: secHex,
      isCustomActive: true
    });
    showToast(`Color secundario actualizado a ${secHex}`);
  };

  const handleConfirmReset = () => {
    resetAllToDefaults();
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16 select-none max-w-5xl mx-auto">
      {/* Top Header & Reset Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-display font-black text-white">
              Configuración & Personalización
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 font-bold">
              v1.2 Cyber
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personaliza colores en tiempo real, estilos de componentes y el nuevo visualizador vectorial D3.
          </p>
        </div>

        {/* Safety Reset Button ("por si algo sale feo") */}
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-500/60 text-rose-200 text-xs font-bold transition-all shadow-lg hover:shadow-rose-950/50 self-start md:self-auto group"
        >
          <RotateCcw size={15} className="group-hover:-rotate-90 transition-transform duration-300 text-rose-400" />
          <span>Restablecer Todo a Predeterminado</span>
        </button>
      </div>

      {/* Navigation Tabs for Settings Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'colors'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Palette size={15} />
          <span>Estudio de Colores ({customColors.isCustomActive ? 'Personalizado' : 'Tema'})</span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'components'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Layout size={15} />
          <span>Personalización de Componentes</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Type size={15} />
          <span>Apariencia & Accesibilidad</span>
          {componentCustomization.fontScale && componentCustomization.fontScale !== 1.0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono font-bold">
              {Math.round(componentCustomization.fontScale * 100)}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'visualizer'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Activity size={15} />
          <span>Visualizador Inmersivo D3</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'system'
              ? 'bg-[var(--accent-primary)] text-white shadow-lg'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Sliders size={15} />
          <span>Audio, Atajos & Integraciones</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: COLOR CUSTOMIZATION STUDIO                             */}
      {/* ============================================================== */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Quick Notice if Custom Palette is Active */}
          {customColors.isCustomActive && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-[var(--accent-primary)] shrink-0" />
                <span className="text-purple-200">
                  Estás usando una paleta personalizada sobrecargada. Haz clic en "Restablecer" o selecciona un tema predeterminado para regresar.
                </span>
              </div>
              <button
                onClick={() => updateCustomColors({ isCustomActive: false })}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] whitespace-nowrap transition-colors"
              >
                Volver a Tema Base
              </button>
            </div>
          )}

          {/* 1. Cyberpunk Preset Themes */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Palette size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Temas Cyberpunk Calibrados</h2>
                <p className="text-xs text-slate-400">
                  Paletas equilibradas de fábrica. Al elegir uno, se aplicará al instante en toda la interfaz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {themes.map((th) => {
                const isActive = activeTheme === th.id && !customColors.isCustomActive;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      setTheme(th.id);
                      updateCustomColors({ isCustomActive: false });
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-[#141126] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5"
                      style={{
                        backgroundColor: th.hex,
                        boxShadow: `0 0 12px ${th.hex}60`
                      }}
                    >
                      {isActive && <Check size={16} />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{th.name}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">{th.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Color Picker Studio */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame size={20} className="text-[var(--accent-primary)]" />
                <div>
                  <h2 className="text-base font-bold text-white">Editor de Paleta Personalizada en Tiempo Real</h2>
                  <p className="text-xs text-slate-400">
                    Modifica cualquier color con precisión hexadecimal o selecciona un tono neón rápido.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Estado:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    customColors.isCustomActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {customColors.isCustomActive ? 'Personalizado Activo' : 'Tema de Fábrica'}
                </span>
              </div>
            </div>

            {/* Primary & Secondary Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Primary Accent Color */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Color Primario (Acento Principal)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.accentPrimary}
                      onChange={(e) => updateCustomColors({ accentPrimary: e.target.value })}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      title="Seleccionar color primario con selector nativo"
                    />
                    <input
                      type="text"
                      value={customColors.accentPrimary}
                      onChange={(e) => updateCustomColors({ accentPrimary: e.target.value })}
                      className="w-20 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-white"
                      placeholder="#a855f7"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Controla botones de acción, barras de reproducción, picos del ecualizador y halos activos.
                </p>

                {/* Swatches */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_NEON_SWATCHES.map((sw) => (
                    <button
                      key={sw.name}
                      onClick={() => handleApplyPresetColor(sw.hex)}
                      className="w-7 h-7 rounded-xl border border-white/20 transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: sw.hex }}
                      title={sw.name}
                    >
                      {customColors.accentPrimary.toLowerCase() === sw.hex.toLowerCase() && (
                        <Check size={14} className="text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Accent Color */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Color Secundario (Neón Complementario)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors.accentSecondary}
                      onChange={(e) => updateCustomColors({ accentSecondary: e.target.value })}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      title="Seleccionar color secundario"
                    />
                    <input
                      type="text"
                      value={customColors.accentSecondary}
                      onChange={(e) => updateCustomColors({ accentSecondary: e.target.value })}
                      className="w-20 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-white"
                      placeholder="#00e5ff"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Aplica reflejos a gradientes, analizadores D3 vectoriales y contornos reflectantes.
                </p>

                {/* Swatches */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_NEON_SWATCHES.map((sw) => (
                    <button
                      key={sw.name}
                      onClick={() => handleApplySecondaryColor(sw.hex)}
                      className="w-7 h-7 rounded-xl border border-white/20 transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: sw.hex }}
                      title={sw.name}
                    >
                      {customColors.accentSecondary.toLowerCase() === sw.hex.toLowerCase() && (
                        <Check size={14} className="text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Tone Selector */}
            <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 space-y-3">
              <span className="text-xs font-bold text-white block">Tono de Fondo del Ciberespacio</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {BACKGROUND_TONES.map((bg) => {
                  const isSelected = customColors.bgMain === bg.hex;
                  return (
                    <button
                      key={bg.name}
                      onClick={() =>
                        updateCustomColors({
                          bgMain: bg.hex,
                          bgSurface: bg.hex === '#000000' ? '#09090b' : '#0e0c18',
                          isCustomActive: true
                        })
                      }
                      className={`p-3 rounded-xl text-left border transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-white/10 border-white/30'
                          : 'bg-black/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-lg border border-white/30 shrink-0"
                        style={{ backgroundColor: bg.hex }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{bg.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{bg.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Neon Glow & VFX Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Glow Intensity */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Intensidad del Resplandor Neón</span>
                  <span className="font-mono text-[var(--accent-primary)] font-bold">
                    {Math.round(customColors.glowIntensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={customColors.glowIntensity}
                  onChange={(e) => updateCustomColors({ glowIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  Regula la dispersión de las sombras luminosas en botones y tarjetas.
                </span>
              </div>

              {/* CRT Scanline Overlay Toggle */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tv size={15} className="text-purple-400" />
                    <span className="font-bold text-white">Líneas de Escaneo CRT (Scanlines)</span>
                  </div>
                  <button
                    onClick={() => updateCustomColors({ crtScanlines: !customColors.crtScanlines })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      customColors.crtScanlines ? 'bg-[var(--accent-primary)]' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        customColors.crtScanlines ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Crea una textura de monitor arcade retrofuturista superpuesta en la pantalla.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: COMPONENT CUSTOMIZATION                                 */}
      {/* ============================================================== */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* 1. Player Bar Style */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Disc size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Estilo de Barra de Reproductor (Player Bar)</h2>
                <p className="text-xs text-slate-400">
                  Selecciona la arquitectura visual del reproductor inferior persistente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {playerBarStyles.map((style) => {
                const isActive = componentCustomization.playerBarStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => updateComponentCustomization({ playerBarStyle: style.id })}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-lg'
                        : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold block">{style.name}</span>
                      {isActive && <Check size={14} className="text-[var(--accent-primary)]" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-snug">{style.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Artwork Display Style */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Box size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Estilo de Carátulas de Álbumes (Artwork)</h2>
                <p className="text-xs text-slate-400">
                  Elige la animación y acabado perimetral de las portadas de música.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {artworkStyles.map((art) => {
                const isActive = componentCustomization.artworkStyle === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => updateComponentCustomization({ artworkStyle: art.id })}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-lg'
                        : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold block">{art.name}</span>
                      {isActive && <Check size={14} className="text-[var(--accent-primary)]" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-snug">{art.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Atmospheric Background VFX */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Fondo Atmosférico & Efectos Visuales (VFX)</h2>
                <p className="text-xs text-slate-400">
                  Ambientes generativos dinámicos que reaccionan al audio en segundo plano.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {backgroundVfxStyles.map((bg) => {
                const isActive = componentCustomization.backgroundVfx === bg.id;
                return (
                  <button
                    key={bg.id}
                    onClick={() => updateComponentCustomization({ backgroundVfx: bg.id })}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-lg'
                        : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold block">{bg.name}</span>
                      {isActive && <Check size={14} className="text-[var(--accent-primary)]" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-snug">{bg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sidebar Density & Tactical Accents */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Layers size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Detalles de Interfaz & Navegación</h2>
                <p className="text-xs text-slate-400">
                  Opciones para adaptar la densidad visual a pantallas táctiles o monitores ultrawide.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tactical HUD brackets */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Esquinas Tácticas HUD [ + ]</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Muestra corchetes y marcas tácticas cyberpunk en paneles
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateCustomColors({ tacticalHudBrackets: !customColors.tacticalHudBrackets })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    customColors.tacticalHudBrackets ? 'bg-[var(--accent-primary)]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      customColors.tacticalHudBrackets ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bass Pulse Vibration */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Pulsación Reactiva al Sub-Bajo</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Micro-resplandor sincronizado con el bombo y frecuencias bajas
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateCustomColors({ bassPulseReactive: !customColors.bassPulseReactive })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    customColors.bassPulseReactive ? 'bg-[var(--accent-primary)]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      customColors.bassPulseReactive ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Link to Appearance & Accessibility Font Scale */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 to-cyan-950/20 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[var(--accent-primary)]">
                  <Type size={18} />
                </div>
                <div>
                  <span className="font-bold text-white block">Escala Global de Fuentes (UI Font Scaling)</span>
                  <span className="text-[11px] text-slate-400">
                    Actualmente al {Math.round((componentCustomization.fontScale || 1.0) * 100)}%. Puedes ajustarlo con el deslizador en la sección de Apariencia.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold text-xs transition-all self-start sm:self-auto shrink-0 shadow-md"
              >
                Ajustar Escala Tipográfica
              </button>
            </div>
          </div>
          {/* 5. Custom Backdrops for UI Elements (Sidebar & Player Bar) */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-[var(--accent-primary)] border border-purple-500/20">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Fondos de Imagen Personalizados</h2>
                  <p className="text-xs text-slate-400">
                    Añade imágenes de fondo personalizadas al Sidebar, a la Barra de Reproductor y a los Módulos/Vistas centrales con encuadre, zoom y contraste calibrado.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Card A: Sidebar Custom Backdrop */}
              <div className="p-5 rounded-2xl bg-[#141126] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layout size={18} className="text-[var(--accent-primary)]" />
                      <span className="text-sm font-bold text-white">Barra Lateral (Sidebar)</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        customBackdrops.sidebar.enabled && customBackdrops.sidebar.imageUrl
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {customBackdrops.sidebar.enabled && customBackdrops.sidebar.imageUrl
                        ? 'Activo'
                        : 'Desactivado'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Personaliza el lateral con cualquier imagen o preset cyberpunk. Puedes recortar, mover la posición, hacer zoom y nivelar la capa de contraste oscuro para preservar la legibilidad del menú.
                  </p>

                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300/90 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-[var(--accent-primary)]" />
                    <span>
                      <strong className="text-white">Resolución recomendada:</strong> Relación vertical ~1:3 o 9:16 (ej. 1080×1920 o 720×1280 px). Puedes usar el modal para reencuadrar cualquier tamaño.
                    </span>
                  </div>

                  {/* Sidebar Visual Thumbnail Mockup */}
                  <div className="relative h-32 rounded-xl overflow-hidden border border-white/10 bg-black/50 flex">
                    {/* Mock sidebar backdrop */}
                    <div className="w-28 h-full relative overflow-hidden border-r border-white/10 bg-[#090714]">
                      {customBackdrops.sidebar.imageUrl ? (
                        <>
                          <img
                            src={customBackdrops.sidebar.imageUrl}
                            alt="Preview Sidebar"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${customBackdrops.sidebar.scale})`,
                              objectPosition: `${customBackdrops.sidebar.positionX}% ${customBackdrops.sidebar.positionY}%`,
                              opacity: customBackdrops.sidebar.opacity,
                              filter: customBackdrops.sidebar.blur > 0 ? `blur(${customBackdrops.sidebar.blur}px)` : undefined
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-[#090714]"
                            style={{ opacity: customBackdrops.sidebar.overlayOpacity }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                          Sin Imagen
                        </div>
                      )}
                      {/* Mock sidebar items */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none z-10">
                        <div className="space-y-1">
                          <div className="w-12 h-1.5 rounded-full bg-[var(--accent-primary)]/80" />
                          <div className="w-16 h-1 rounded-full bg-white/40" />
                          <div className="w-14 h-1 rounded-full bg-white/20" />
                        </div>
                        <div className="w-8 h-1 rounded-full bg-white/20" />
                      </div>
                    </div>
                    {/* Main content area simulation */}
                    <div className="flex-1 p-3 flex flex-col justify-between text-slate-500 text-[10px]">
                      <div>
                        <div className="w-24 h-2 bg-white/10 rounded-full mb-1.5" />
                        <div className="w-36 h-1.5 bg-white/5 rounded-full" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>Encuadre: X:{Math.round(customBackdrops.sidebar.positionX)}% Y:{Math.round(customBackdrops.sidebar.positionY)}%</span>
                        <span>· Zoom:{Math.round(customBackdrops.sidebar.scale * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Contrast and Opacity quick sliders */}
                  {customBackdrops.sidebar.imageUrl && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Capa de Contraste Oscuro:</span>
                        <span className="font-mono">{Math.round(customBackdrops.sidebar.overlayOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.95"
                        step="0.05"
                        value={customBackdrops.sidebar.overlayOpacity}
                        onChange={(e) =>
                          updateCustomBackdrop('sidebar', { overlayOpacity: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-white/10 rounded-full accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => openBackdropModal('sidebar')}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Ajustar Encuadre & Zoom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCustomBackdrop('sidebar', { enabled: !customBackdrops.sidebar.enabled })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      customBackdrops.sidebar.enabled
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {customBackdrops.sidebar.enabled ? 'Pausar' : 'Activar'}
                  </button>

                  {customBackdrops.sidebar.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCustomBackdrop('sidebar');
                        showToast('Fondo de Sidebar restablecido');
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Quitar imagen de fondo del sidebar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card B: Player Bar Custom Backdrop */}
              <div className="p-5 rounded-2xl bg-[#141126] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Disc size={18} className="text-[var(--accent-primary)]" />
                      <span className="text-sm font-bold text-white">Barra de Reproductor (Player Bar)</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        customBackdrops.playerBar.enabled && customBackdrops.playerBar.imageUrl
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {customBackdrops.playerBar.enabled && customBackdrops.playerBar.imageUrl
                        ? 'Activo'
                        : 'Desactivado'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Personaliza la barra de reproducción inferior. Con el modal interactivo puedes desplazar verticalmente la imagen para encuadrar la mejor zona panorámica y regular el velo de contraste.
                  </p>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-300/90 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-cyan-400" />
                    <span>
                      <strong className="text-white">Resolución recomendada:</strong> Relación horizontal panorámica ~16:2 o 21:3 (ej. 1920×240 o 2560×320 px).
                    </span>
                  </div>

                  {/* PlayerBar Visual Thumbnail Mockup */}
                  <div className="relative h-20 rounded-xl overflow-hidden border border-white/10 bg-[#090714] flex items-center justify-between px-3">
                    {customBackdrops.playerBar.imageUrl ? (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                          src={customBackdrops.playerBar.imageUrl}
                          alt="Preview Player Bar"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${customBackdrops.playerBar.scale})`,
                            objectPosition: `${customBackdrops.playerBar.positionX}% ${customBackdrops.playerBar.positionY}%`,
                            opacity: customBackdrops.playerBar.opacity,
                            filter: customBackdrops.playerBar.blur > 0 ? `blur(${customBackdrops.playerBar.blur}px)` : undefined
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-[#090714]"
                          style={{ opacity: customBackdrops.playerBar.overlayOpacity }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 pointer-events-none">
                        Sin Imagen Personalizada
                      </div>
                    )}
                    {/* Mock player controls */}
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 shrink-0" />
                      <div>
                        <div className="w-16 h-1.5 rounded-full bg-white/60 mb-1" />
                        <div className="w-10 h-1 rounded-full bg-white/30" />
                      </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/80" />
                    </div>
                    <div className="relative z-10 flex items-center gap-1.5">
                      <div className="w-12 h-1 rounded-full bg-white/20" />
                    </div>
                  </div>

                  {/* Contrast and Opacity quick sliders */}
                  {customBackdrops.playerBar.imageUrl && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Capa de Contraste Oscuro:</span>
                        <span className="font-mono">{Math.round(customBackdrops.playerBar.overlayOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.95"
                        step="0.05"
                        value={customBackdrops.playerBar.overlayOpacity}
                        onChange={(e) =>
                          updateCustomBackdrop('playerBar', { overlayOpacity: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-white/10 rounded-full accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => openBackdropModal('playerBar')}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Ajustar Encuadre & Zoom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCustomBackdrop('playerBar', { enabled: !customBackdrops.playerBar.enabled })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      customBackdrops.playerBar.enabled
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {customBackdrops.playerBar.enabled ? 'Pausar' : 'Activar'}
                  </button>

                  {customBackdrops.playerBar.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCustomBackdrop('playerBar');
                        showToast('Fondo de Barra de Reproductor restablecido');
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Quitar imagen de fondo de la barra de reproducción"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card C: Main Content Modules Custom Backdrop */}
              <div className="p-5 rounded-2xl bg-[#141126] border border-white/5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-[var(--accent-primary)]" />
                      <span className="text-sm font-bold text-white">Módulos & Vistas (Central)</span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        customBackdrops.mainModule?.enabled && customBackdrops.mainModule?.imageUrl
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {customBackdrops.mainModule?.enabled && customBackdrops.mainModule?.imageUrl
                        ? 'Activo'
                        : 'Desactivado'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Personaliza el fondo de la pantalla principal donde se visualizan las listas, búsqueda y biblioteca. El velo de contraste asegura legibilidad nítida.
                  </p>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-indigo-300/90 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                    <span>
                      <strong className="text-white">Resolución recomendada:</strong> Panorámica 16:9 (ej. 1920×1080 o 2560×1440 px).
                    </span>
                  </div>

                  {/* Main Module Visual Thumbnail Mockup */}
                  <div className="relative h-20 rounded-xl overflow-hidden border border-white/10 bg-[#07060c] p-2 flex flex-col justify-between">
                    {customBackdrops.mainModule?.imageUrl ? (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                          src={customBackdrops.mainModule.imageUrl}
                          alt="Preview Módulos"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `scale(${customBackdrops.mainModule.scale})`,
                            objectPosition: `${customBackdrops.mainModule.positionX}% ${customBackdrops.mainModule.positionY}%`,
                            opacity: customBackdrops.mainModule.opacity,
                            filter: customBackdrops.mainModule.blur > 0 ? `blur(${customBackdrops.mainModule.blur}px)` : undefined
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-[#07060c]"
                          style={{ opacity: customBackdrops.mainModule.overlayOpacity }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 pointer-events-none">
                        Sin Imagen Personalizada
                      </div>
                    )}
                    {/* Mock modules header */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-14 h-1.5 rounded-full bg-white/70" />
                      <div className="w-8 h-1 rounded-full bg-cyan-400/80" />
                    </div>
                    {/* Mock module cards */}
                    <div className="relative z-10 grid grid-cols-3 gap-1.5">
                      <div className="h-8 rounded bg-white/10 border border-white/10 p-1 flex items-end">
                        <div className="w-8 h-1 bg-white/60 rounded-full" />
                      </div>
                      <div className="h-8 rounded bg-white/10 border border-white/10 p-1 flex items-end">
                        <div className="w-10 h-1 bg-white/60 rounded-full" />
                      </div>
                      <div className="h-8 rounded bg-white/10 border border-white/10 p-1 flex items-end">
                        <div className="w-6 h-1 bg-white/60 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Contrast and Opacity quick sliders */}
                  {customBackdrops.mainModule?.imageUrl && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Capa de Contraste Oscuro:</span>
                        <span className="font-mono">{Math.round((customBackdrops.mainModule.overlayOpacity ?? 0.85) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.95"
                        step="0.05"
                        value={customBackdrops.mainModule.overlayOpacity}
                        onChange={(e) =>
                          updateCustomBackdrop('mainModule', { overlayOpacity: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-white/10 rounded-full accent-[var(--accent-primary)] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => openBackdropModal('mainModule')}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Ajustar Encuadre & Zoom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateCustomBackdrop('mainModule', { enabled: !customBackdrops.mainModule?.enabled })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      customBackdrops.mainModule?.enabled
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {customBackdrops.mainModule?.enabled ? 'Pausar' : 'Activar'}
                  </button>

                  {customBackdrops.mainModule?.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        resetCustomBackdrop('mainModule');
                        showToast('Fondo de Módulos restablecido');
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Quitar imagen de fondo de módulos"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: ACCESSIBILITY & APPEARANCE (UI FONT SCALING)              */}
      {/* ============================================================== */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* 0. System-Wide Font Family Selector */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-[var(--accent-primary)] border border-purple-500/20">
                  <Type size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Tipo de Letra de Todo el Sistema (System Font Family)
                    </h2>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      Tipografía Global
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selecciona la familia tipográfica principal aplicada a textos, botones, menús y carátulas de toda la plataforma.
                  </p>
                </div>
              </div>

              {/* Current Font Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-[#141126] px-3.5 py-2 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-400 font-mono">Activa:</span>
                <span className="text-xs font-bold text-[var(--accent-primary)]">
                  {SYSTEM_FONT_OPTIONS.find((f) => f.id === (componentCustomization.fontFamily || 'jakarta'))?.name || 'Plus Jakarta Sans'}
                </span>
              </div>
            </div>

            {/* Grid of Font Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {SYSTEM_FONT_OPTIONS.map((font) => {
                const isSelected = (componentCustomization.fontFamily || 'jakarta') === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      updateComponentCustomization({ fontFamily: font.id });
                      showToast(`Tipo de letra cambiado a "${font.name}"`);
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500/50 text-white shadow-lg shadow-purple-950/40 ring-1 ring-[var(--accent-primary)]/40'
                        : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold block">{font.name}</span>
                        {isSelected && <Check size={14} className="text-[var(--accent-primary)]" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {font.category}
                      </span>
                    </div>

                    {/* Live Preview Sample Text with actual font family */}
                    <div
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 truncate leading-snug"
                      style={{ fontFamily: font.cssFamily }}
                    >
                      {font.previewSample}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Global UI Font Scaling Slider Section */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-[var(--accent-primary)] border border-purple-500/20">
                  <Type size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Escala Global de Fuentes (UI Font Scaling)
                    </h2>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      Accesibilidad
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ajusta el tamaño tipográfico de toda la aplicación de manera fluida y proporcional. El diseño se adapta automáticamente.
                  </p>
                </div>
              </div>

              {/* Current Scale Telemetry Badge */}
              <div className="flex items-center gap-2 self-start sm:self-auto bg-[#141126] px-3.5 py-2 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-400 font-mono">Factor:</span>
                <span className="text-sm font-mono font-black text-[var(--accent-primary)]">
                  {Math.round((componentCustomization.fontScale || 1.0) * 100)}%
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ({(componentCustomization.fontScale || 1.0).toFixed(2)}x)
                </span>
              </div>
            </div>

            {/* Slider Control Container */}
            <div className="p-5 rounded-2xl bg-[#141126] border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Sliders size={14} className="text-[var(--accent-primary)]" />
                  <span>Control Deslizante de Escala Tipográfica</span>
                </div>

                {/* Profile descriptor badge */}
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-black/40 text-purple-300 border-purple-500/30">
                  {(componentCustomization.fontScale || 1.0) <= 0.88
                    ? 'HUD MICRO (Máxima densidad)'
                    : (componentCustomization.fontScale || 1.0) <= 1.05
                    ? 'ESTÁNDAR CYBERPUNK 1.0x (Predeterminado)'
                    : (componentCustomization.fontScale || 1.0) <= 1.20
                    ? 'CONFORT / LECTURA (+15%)'
                    : 'ACCESIBILIDAD ALTA VISIBILIDAD (+30%)'}
                </span>
              </div>

              {/* Range Slider with minus/plus buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const current = componentCustomization.fontScale || 1.0;
                    const next = Math.max(0.80, parseFloat((current - 0.05).toFixed(2)));
                    updateComponentCustomization({ fontScale: next });
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="Reducir fuente (-5%)"
                  aria-label="Reducir tamaño de fuente"
                >
                  <ZoomOut size={16} />
                </button>

                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    min="0.80"
                    max="1.35"
                    step="0.01"
                    value={componentCustomization.fontScale || 1.0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateComponentCustomization({ fontScale: val });
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)] transition-all"
                    aria-label="Escala de fuente global"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const current = componentCustomization.fontScale || 1.0;
                    const next = Math.min(1.35, parseFloat((current + 0.05).toFixed(2)));
                    updateComponentCustomization({ fontScale: next });
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="Aumentar fuente (+5%)"
                  aria-label="Aumentar tamaño de fuente"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Calibration graduation marks */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1 pt-0.5">
                <span className="hover:text-slate-300 cursor-pointer" onClick={() => updateComponentCustomization({ fontScale: 0.80 })}>
                  80% (Micro)
                </span>
                <span className="hover:text-slate-300 cursor-pointer" onClick={() => updateComponentCustomization({ fontScale: 0.90 })}>
                  90%
                </span>
                <span className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer" onClick={() => updateComponentCustomization({ fontScale: 1.0 })}>
                  100% (Defecto)
                </span>
                <span className="hover:text-slate-300 cursor-pointer" onClick={() => updateComponentCustomization({ fontScale: 1.15 })}>
                  115% (Confort)
                </span>
                <span className="hover:text-slate-300 cursor-pointer" onClick={() => updateComponentCustomization({ fontScale: 1.35 })}>
                  135% (Accesibilidad)
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2.5">
                Perfiles Rápidos Calibrados:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { scale: 0.85, label: '85% · HUD Compacto', desc: 'Densidad extrema estilo terminal' },
                  { scale: 1.0, label: '100% · Predeterminado', desc: 'Calibración original de fábrica' },
                  { scale: 1.15, label: '115% · Confort Visual', desc: 'Lectura óptima y relajada' },
                  { scale: 1.30, label: '130% · Alta Visibilidad', desc: 'Máxima ergonomía de accesibilidad' }
                ].map((item) => {
                  const isCurrent = Math.abs((componentCustomization.fontScale || 1.0) - item.scale) < 0.03;
                  return (
                    <button
                      key={item.scale}
                      type="button"
                      onClick={() => {
                        updateComponentCustomization({ fontScale: item.scale });
                        showToast(`Escala tipográfica fijada en ${Math.round(item.scale * 100)}%`);
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isCurrent
                          ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-950/40'
                          : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold block">{item.label}</span>
                        {isCurrent && <Check size={13} className="text-[var(--accent-primary)]" />}
                      </div>
                      <span className="text-[10px] text-slate-400 block leading-tight">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Interactive Responsive Layout & Typography Preview Card */}
            <div className="p-4 rounded-2xl bg-[#0a0814] border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Monitor size={14} className="text-cyan-400" />
                  <span>Demostración de Responsividad en Vivo (Live Layout Preview)</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                  font-size: {Math.round((componentCustomization.fontScale || 1.0) * 100)}%
                </span>
              </div>

              {/* Sample Cyberpunk Card demonstrating responsive typography scaling */}
              <div className="p-3.5 rounded-xl bg-[#141126] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                    <Activity size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        Phorocket Cyber Resonance
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-bold">
                        320 KBPS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Sintetizador Modular Cuántico · Audio Reactivo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-xs font-mono text-purple-300">03:42</span>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <Zap size={13} />
                    <span>Reproducir</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Observa cómo los textos grandes, secundarios, códigos monoespaciados y botones mantienen su proporción exacta sin romper las cuadrículas ni provocar desbordamientos no deseados.
              </p>
            </div>
          </div>

          {/* 2. Ergonomics & Accessibility Preferences */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Eye size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Ergonomía & Accesibilidad Visual</h2>
                <p className="text-xs text-slate-400">
                  Opciones avanzadas para mejorar la claridad óptica en entornos de trabajo prolongados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* High Contrast Text */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Alto Contraste de Texto</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Maximiza la blancura y nitidez de textos tenues y secundarios
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateComponentCustomization({
                      highContrastText: !componentCustomization.highContrastText
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    componentCustomization.highContrastText
                      ? 'bg-[var(--accent-primary)]'
                      : 'bg-white/10'
                  }`}
                  aria-label="Alternar alto contraste"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      componentCustomization.highContrastText ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="p-4 rounded-2xl bg-[#141126] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Modo Reducción de Animaciones</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Atenúa transiciones para prevenir fatiga o sensibilidad motriz
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateComponentCustomization({
                      reducedMotion: !componentCustomization.reducedMotion
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    componentCustomization.reducedMotion
                      ? 'bg-[var(--accent-primary)]'
                      : 'bg-white/10'
                  }`}
                  aria-label="Alternar reducción de movimiento"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      componentCustomization.reducedMotion ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Reset Button for Appearance / Font Scaling */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
              <span className="text-slate-400 text-[11px]">
                ¿Deseas restaurar únicamente el tamaño de texto estándar de 100%?
              </span>
              <button
                type="button"
                onClick={() => {
                  updateComponentCustomization({
                    fontScale: 1.0,
                    highContrastText: false,
                    reducedMotion: false
                  });
                  showToast('Escala tipográfica y accesibilidad restauradas a 100%');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-[11px]"
              >
                <RotateCcw size={13} />
                <span>Restablecer Solo Escala (100%)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: IMMERSIVE D3 AUDIO VISUALIZER                           */}
      {/* ============================================================== */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          {/* Live Interactive D3 Visualizer Canvas */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity size={20} className="text-[var(--accent-primary)]" />
                <div>
                  <h2 className="text-base font-bold text-white">Visualizador Inmersivo D3 en Vivo</h2>
                  <p className="text-xs text-slate-400">
                    Interactúa directamente con el motor vectorial escalable D3 calibrado para Phorocket.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  D3.js SVG Engine
                </span>
              </div>
            </div>

            {/* Live Component Embed */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <D3CyberAudioVisualizer
                isPlaying={isPlaying}
                height={260}
                showControls={true}
                interactive={true}
                initialSubStyle={componentCustomization.d3VisualizerSubStyle}
                onStyleChange={(s) => updateComponentCustomization({ d3VisualizerSubStyle: s })}
              />
            </div>
          </div>

          {/* Visualizer Mode Selector (All 8 modes) */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Radio size={20} className="text-[var(--accent-primary)]" />
              <div>
                <h2 className="text-base font-bold text-white">Modo Predeterminado de Visualización</h2>
                <p className="text-xs text-slate-400">
                  Selecciona la representación que aparecerá en el reproductor de pantalla completa y barras HUD.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visualizerModes.map((vm) => {
                const isActive = visualizerMode === vm.id;
                return (
                  <button
                    key={vm.id}
                    onClick={() => setVisualizerMode(vm.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'bg-purple-500/15 border-purple-500/40 text-white shadow-lg'
                        : 'bg-[#141126] border-white/5 hover:border-white/15 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold block">{vm.name}</span>
                      {vm.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent-primary)] text-white font-mono font-bold">
                          {vm.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block leading-snug">{vm.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SYSTEM, AUDIO ENGINE & SHORTCUTS                        */}
      {/* ============================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Audio Engine & Equalizer Quick Launcher */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[var(--accent-primary)] border border-purple-500/20 flex items-center justify-center shrink-0">
                <Sliders size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Ecualizador Gráfico & Gestor de Perfiles</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    {equalizerProfiles.find((p) => p.id === equalizerPreset)?.name || 'Personalizado'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  5 bandas Web Audio en tiempo real · {equalizerProfiles.filter((p) => p.isCustom).length} perfiles personalizados guardados.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAudioSettingsOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
            >
              <Sliders size={14} />
              <span>Gestionar Perfiles & Ecualizador</span>
            </button>
          </div>

          {/* Storage & Cache Management */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <HardDrive size={20} className="text-slate-400" />
              <div>
                <h2 className="text-base font-bold text-white">Gestión de Almacenamiento Local</h2>
                <p className="text-xs text-slate-400">
                  Phorocket almacena preferencias y metadatos localmente en tu navegador.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141126] border border-white/5 text-xs">
              <div>
                <span className="font-semibold text-slate-200 block">Pistas indexadas en biblioteca:</span>
                <span className="text-slate-400">{tracks.length} canciones en memoria</span>
              </div>

              <button
                onClick={handleClearCache}
                className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>Limpiar datos temporales</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Keyboard size={20} className="text-slate-400" />
              <div>
                <h2 className="text-base font-bold text-white">Atajos de Teclado Rápidos</h2>
                <p className="text-xs text-slate-400">Controla la reproducción sin levantar las manos del teclado.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {shortcuts.map((sc) => (
                <div
                  key={sc.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141126] border border-white/5"
                >
                  <span className="text-slate-300">{sc.action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-black/50 text-[10px] font-mono text-[var(--accent-primary)] border border-white/10">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Brand & Watch Quick Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setIsLogoModalOpen(true)}
              className="p-5 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className="p-3 rounded-xl bg-purple-500/10 text-[var(--accent-primary)] group-hover:scale-105 transition-transform">
                <Sparkles size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Identidad Oficial de Marca</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Ver las 5 variantes vectoriales del logotipo de Phorocket.
                </span>
              </div>
            </div>

            <div
              onClick={() => setIsWatchModalOpen(true)}
              className="p-5 rounded-2xl bg-[#120f24] hover:bg-[#1a1633] border border-white/5 cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
                <Watch size={22} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Modo Smartwatch Companion</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Simulador de interfaz complementaria para dispositivos portables.
                </span>
              </div>
            </div>
          </div>

          {/* External Integrations */}
          <div className="p-6 rounded-3xl bg-[#0f0c1e] border border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe size={20} className="text-[#1DB954]" />
              <div>
                <h2 className="text-base font-bold text-white">Integraciones & Exportación a Spotify</h2>
                <p className="text-xs text-slate-400">
                  Conecta tu cuenta o exporta tus listas de reproducción locales y favoritas hacia Spotify y proveedores externos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => openSpotifyModal()}
                className="p-4 rounded-2xl bg-[#141126] hover:bg-[#1b1733] border border-[#1DB954]/20 hover:border-[#1DB954]/50 transition-all text-left flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 text-[#1DB954] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <SpotifyIcon size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-[#1DB954] transition-colors">
                    Exportador a Spotify
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    OAuth 2.0 PKCE, sincronización y enlace directo
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveView('integrations')}
                className="p-4 rounded-2xl bg-[#141126] hover:bg-[#1b1733] border border-white/5 hover:border-white/20 transition-all text-left flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-[var(--accent-primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Globe size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-[var(--accent-primary)] transition-colors">
                    Adaptadores Externos
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    YouTube IFrame, Internet Archive, Jamendo, FMA
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety Reset Floating / Bottom Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
            <RotateCcw size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">¿Probaste combinaciones y quieres volver al origen?</h3>
            <p className="text-[11px] text-slate-400">
              Restablece en un instante todos los colores, componentes, estilos y el ecualizador a los valores óptimos predeterminados.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
        >
          Regresar a Predeterminado
        </button>
      </div>

      {/* Modal de Confirmación de Restablecimiento ("por si algo sale feo") */}
      {isResetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#120f24] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">¿Restablecer todo a los valores predeterminados?</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Esta acción devolverá la aplicación al estado original de fábrica de Phorocket:
              </p>
              <ul className="text-[11px] text-slate-400 mt-2 space-y-1 list-disc list-inside">
                <li>Tema base restaurado a <strong>Violet Pulse</strong></li>
                <li>Paleta de colores personalizada eliminada</li>
                <li>Barra de reproducción, carátulas y fondos devueltos al predeterminado</li>
                <li>Escala de fuentes de interfaz restaurada a <strong>100% estándar</strong></li>
                <li>Visualizador reconfigurado a modo estándar</li>
                <li>Curva de ecualizador restaurada a <strong>Flat</strong></li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Sí, Restablecer Todo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

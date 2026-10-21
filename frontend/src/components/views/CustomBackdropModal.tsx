import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  RotateCcw,
  Sliders,
  Move,
  ZoomIn,
  ZoomOut,
  Eye,
  Trash2,
  Maximize2,
  Layout,
  Disc3,
  Play,
  SkipForward,
  Volume2,
  Home,
  Compass,
  Library,
  ShieldCheck,
  Grid
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { ElementBackdropConfig, DEFAULT_CUSTOM_BACKDROPS, BackdropTarget } from '../../types/music';

// Curated High-Definition Cyberpunk & Atmospheric Presets
const BACKDROP_PRESETS: {
  id: string;
  name: string;
  url: string;
  tag: string;
}[] = [
  {
    id: 'cyber-city-night',
    name: 'Neo-Tokyo Cyber City',
    tag: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'synthwave-grid',
    name: 'Horizonte Synthwave 80s',
    tag: 'Synthwave',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'cosmic-nebula',
    name: 'Nebulosa Violeta Profunda',
    tag: 'Cosmic',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'matrix-core',
    name: 'Túnel de Datos Cuántico',
    tag: 'Abstract',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'sound-waves-laser',
    name: 'Ondas de Frecuencia Láser',
    tag: 'Audio',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dark-minimal-mesh',
    name: 'Malla Geométrica Carbón',
    tag: 'Minimal',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  }
];

export const CustomBackdropModal: React.FC = () => {
  const {
    isBackdropModalOpen,
    backdropModalTarget,
    closeBackdropModal,
    customBackdrops,
    updateCustomBackdrop,
    resetCustomBackdrop,
    showToast
  } = useMusic();

  const [activeTarget, setActiveTarget] = useState<BackdropTarget>('sidebar');
  const [configDraft, setConfigDraft] = useState<ElementBackdropConfig>(DEFAULT_CUSTOM_BACKDROPS.sidebar);
  const [activeTab, setActiveTab] = useState<'adjust' | 'upload' | 'presets'>('adjust');
  const [showGridGuide, setShowGridGuide] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft when modal opens or target changes
  useEffect(() => {
    if (isBackdropModalOpen) {
      const target: BackdropTarget = backdropModalTarget || 'sidebar';
      setActiveTarget(target);
      const current = customBackdrops[target] || DEFAULT_CUSTOM_BACKDROPS[target];
      setConfigDraft({ ...current });
      if (!current.imageUrl) {
        setActiveTab('presets');
      } else {
        setActiveTab('adjust');
      }
    }
  }, [isBackdropModalOpen, backdropModalTarget, customBackdrops]);

  if (!isBackdropModalOpen) return null;

  const isSidebar = activeTarget === 'sidebar';

  const handleTargetSwitch = (target: BackdropTarget) => {
    setActiveTarget(target);
    const targetConfig = customBackdrops[target] || DEFAULT_CUSTOM_BACKDROPS[target];
    setConfigDraft({ ...targetConfig });
  };

  // Image Upload with Automatic Smart Canvas Resizing (prevents localStorage overflows)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        // Limit max dimension to 1920px for high performance
        const maxDim = isSidebar ? 1920 : 2560;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setConfigDraft((prev) => ({
            ...prev,
            imageUrl: compressedDataUrl,
            enabled: true
          }));
          setActiveTab('adjust');
          showToast(`Imagen optimizada cargada (${img.width}×${img.height} px). Ajusta el encuadre.`);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetUrl: string, presetName: string) => {
    setConfigDraft((prev) => ({
      ...prev,
      imageUrl: presetUrl,
      enabled: true
    }));
    setActiveTab('adjust');
    showToast(`Fondo "${presetName}" seleccionado`);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setConfigDraft((prev) => ({
      ...prev,
      imageUrl: urlInput.trim(),
      enabled: true
    }));
    setActiveTab('adjust');
    showToast('Imagen cargada desde URL');
  };

  // Interactive Drag-to-Position on the Live Framing Preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!configDraft.imageUrl) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: configDraft.positionX,
      posY: configDraft.positionY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posX - deltaX)));
    const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posY - deltaY)));

    setConfigDraft((prev) => ({
      ...prev,
      positionX: newX,
      positionY: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Save changes
  const handleSave = () => {
    updateCustomBackdrop(activeTarget, configDraft);
    showToast(`Fondo de ${isSidebar ? 'Barra Lateral' : 'Barra de Reproductor'} actualizado y guardado`);
    closeBackdropModal();
  };

  // Clear / remove image
  const handleRemoveImage = () => {
    resetCustomBackdrop(activeTarget);
    setConfigDraft({
      ...DEFAULT_CUSTOM_BACKDROPS[activeTarget],
      enabled: false,
      imageUrl: ''
    });
    const targetLabel =
      activeTarget === 'sidebar'
        ? 'Barra Lateral'
        : activeTarget === 'playerBar'
        ? 'Barra de Reproductor'
        : 'Módulos';
    showToast(`Fondo de ${targetLabel} eliminado`);
  };

  // Reset framing parameters to recommended defaults
  const handleResetFraming = () => {
    setConfigDraft((prev) => ({
      ...prev,
      scale: 1.0,
      positionX: 50,
      positionY: 50,
      opacity: activeTarget === 'sidebar' ? 0.45 : activeTarget === 'playerBar' ? 0.4 : 0.25,
      overlayOpacity: activeTarget === 'mainModule' ? 0.85 : 0.75,
      blur: 0
    }));
    showToast('Encuadre y contraste restablecidos a valores estándar');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in select-none overflow-y-auto"
      onClick={closeBackdropModal}
    >
      <div
        className="w-full max-w-4xl bg-[#0c0919] border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-[#110d24]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-glow)]">
              <ImageIcon size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                Personalizador de Fondo de Componentes
              </h2>
              <p className="text-xs text-slate-400">
                Ajusta el encuadre, zoom, posición y contraste para que los textos e iconos se lean con claridad.
              </p>
            </div>
          </div>

          <button
            onClick={closeBackdropModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Component Selector & Resolution Hint Bar */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#0a0716] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTargetSwitch('sidebar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTarget === 'sidebar'
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-glow)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout size={14} />
              Barra Lateral (Sidebar)
            </button>
            <button
              onClick={() => handleTargetSwitch('playerBar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTarget === 'playerBar'
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-glow)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc3 size={14} />
              Barra Reproductor
            </button>
            <button
              onClick={() => handleTargetSwitch('mainModule')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTarget === 'mainModule'
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-glow)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              Módulos (Vistas Centrales)
            </button>
          </div>

          {/* Specific Resolution Badge Required by User */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs">
            <Maximize2 size={14} className="text-[var(--accent-primary)] shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {activeTarget === 'sidebar' && (
                <>Resolución recomendada: <strong className="text-white">1080 × 1920 px</strong> (Vertical 9:16)</>
              )}
              {activeTarget === 'playerBar' && (
                <>Resolución recomendada: <strong className="text-white">1920 × 400 px</strong> (Ultra-ancho 16:3)</>
              )}
              {activeTarget === 'mainModule' && (
                <>Resolución recomendada: <strong className="text-white">1920 × 1080 px</strong> (Panorámica 16:9)</>
              )}
            </span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Framing & Crop Viewport (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye size={15} className="text-[var(--accent-primary)]" />
                Previsualización en Tiempo Real
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGridGuide(!showGridGuide)}
                  className={`p-1 rounded-lg text-[11px] border flex items-center gap-1 transition-colors ${
                    showGridGuide
                      ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Activar/Desactivar líneas guía de composición"
                >
                  <Grid size={13} />
                  Guías
                </button>
              </div>
            </div>

            {/* Visualizer Frame Container */}
            <div
              ref={previewRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between cursor-move select-none transition-all ${
                activeTarget === 'sidebar'
                  ? 'h-[360px] sm:h-[420px] w-full max-w-[260px] mx-auto bg-[#0a0814]'
                  : activeTarget === 'playerBar'
                  ? 'h-28 sm:h-32 w-full bg-[#0c0a1a]'
                  : 'h-[240px] sm:h-[280px] w-full bg-[#07060c]'
              }`}
              style={{
                boxShadow: configDraft.enabled
                  ? '0 10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)'
                  : undefined
              }}
              title="Haz clic y arrastra con el ratón para desplazar la imagen"
            >
              {/* The Background Image Under Inspection */}
              {configDraft.imageUrl ? (
                <>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={configDraft.imageUrl}
                      alt="Previsualización de encuadre"
                      className="w-full h-full object-cover transition-transform duration-75"
                      style={{
                        transform: `scale(${configDraft.scale})`,
                        objectPosition: `${configDraft.positionX}% ${configDraft.positionY}%`,
                        opacity: configDraft.opacity,
                        filter: configDraft.blur > 0 ? `blur(${configDraft.blur}px)` : undefined
                      }}
                    />
                  </div>

                  {/* Dark Contrast Overlay: Crucial to preserve text/icon contrast */}
                  <div
                    className="absolute inset-0 bg-[#090714] pointer-events-none transition-opacity"
                    style={{ opacity: configDraft.overlayOpacity }}
                  />

                  {/* Subtle edge vignette */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-500 bg-[#0d0a1c]">
                  <ImageIcon size={32} className="opacity-30 mb-2" />
                  <span className="text-xs font-semibold text-slate-400">Sin imagen asignada</span>
                  <span className="text-[10px] text-slate-600 mt-0.5">
                    Sube una foto o escoge un fondo cyberpunk de la galería
                  </span>
                </div>
              )}

              {/* Composition Rule of Thirds Guide (Optional) */}
              {showGridGuide && configDraft.imageUrl && (
                <div className="absolute inset-0 pointer-events-none border border-cyan-400/20 z-10">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-cyan-400/20" />
                    <div className="border-r border-b border-cyan-400/20" />
                    <div className="border-b border-cyan-400/20" />
                    <div className="border-r border-b border-cyan-400/20" />
                    <div className="border-r border-b border-cyan-400/20" />
                    <div className="border-b border-cyan-400/20" />
                    <div className="border-r border-cyan-400/20" />
                    <div className="border-r border-cyan-400/20" />
                    <div />
                  </div>
                </div>
              )}

              {/* Realistic Mock UI Overlay: Tests real-world contrast with icons and text */}
              {activeTarget === 'sidebar' ? (
                <div className="relative z-20 flex-1 flex flex-col justify-between p-3.5 pointer-events-none">
                  {/* Mock Sidebar Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold">
                      PHO
                    </div>
                    <div>
                      <span className="text-xs font-black text-white tracking-wide block">PHOROCKET</span>
                      <span className="text-[9px] text-[var(--accent-primary)] font-semibold block">V2.0 HUD</span>
                    </div>
                  </div>

                  {/* Mock Nav Items */}
                  <div className="space-y-1.5 py-2">
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[var(--accent-primary)]/25 text-white border border-[var(--accent-primary)]/40 text-xs font-bold">
                      <Home size={14} className="text-[var(--accent-primary)]" />
                      <span>Inicio</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-300 text-xs font-medium">
                      <Compass size={14} />
                      <span>Explorar</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-300 text-xs font-medium">
                      <Library size={14} />
                      <span>Biblioteca</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-300 text-xs font-medium">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span>Legal WAV</span>
                    </div>
                  </div>

                  {/* Mock Sidebar Footer */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Audio DSP Activo</span>
                    <span className="text-emerald-400 font-bold">96kHz / 32b</span>
                  </div>
                </div>
              ) : activeTarget === 'playerBar' ? (
                <div className="relative z-20 flex-1 flex items-center justify-between px-4 py-2 pointer-events-none">
                  {/* Mock Player Track Info */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-white text-[10px] font-bold">
                      SONG
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block">Cyber Overdrive</span>
                      <span className="text-[10px] text-slate-300 block">Phorocket Sound Lab</span>
                    </div>
                  </div>

                  {/* Mock Transport */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white">
                        <Play size={12} fill="white" />
                      </div>
                      <SkipForward size={14} className="text-slate-300" />
                    </div>
                    <div className="w-36 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-[var(--accent-primary)]" />
                    </div>
                  </div>

                  {/* Mock Volume */}
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Volume2 size={15} />
                    <div className="w-16 h-1 bg-white/20 rounded-full">
                      <div className="w-3/4 h-full bg-white" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Mock Main Module View */
                <div className="relative z-20 flex-1 flex flex-col justify-between p-3.5 pointer-events-none">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-[var(--accent-primary)]/80 flex items-center justify-center text-[10px] font-bold text-white">
                        M
                      </div>
                      <span className="text-xs font-bold text-white">Módulo Central (Vistas de Contenido)</span>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-300 bg-white/10 px-2 py-0.5 rounded-full border border-cyan-400/30">
                      Capa Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 py-3">
                    <div className="h-20 rounded-xl bg-black/40 border border-white/15 p-2 flex flex-col justify-between shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-[var(--accent-primary)]/50" />
                      <div>
                        <div className="w-14 h-1.5 bg-white/90 rounded-full mb-1" />
                        <div className="w-9 h-1 bg-white/40 rounded-full" />
                      </div>
                    </div>
                    <div className="h-20 rounded-xl bg-black/40 border border-white/15 p-2 flex flex-col justify-between shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/50" />
                      <div>
                        <div className="w-16 h-1.5 bg-white/90 rounded-full mb-1" />
                        <div className="w-10 h-1 bg-white/40 rounded-full" />
                      </div>
                    </div>
                    <div className="h-20 rounded-xl bg-black/40 border border-white/15 p-2 flex flex-col justify-between shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-pink-500/50" />
                      <div>
                        <div className="w-12 h-1.5 bg-white/90 rounded-full mb-1" />
                        <div className="w-8 h-1 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
                    <span>Área Principal de Navegación</span>
                    <span className="text-emerald-400 font-semibold">100% Contraste Protegido</span>
                  </div>
                </div>
              )}

              {/* Drag Indicator Overlay */}
              <div className="absolute bottom-1 right-2 z-20 pointer-events-none bg-black/60 px-2 py-0.5 rounded-md text-[9px] text-slate-300 flex items-center gap-1">
                <Move size={10} />
                Arrastra para reubicar
              </div>
            </div>

            {/* Quick Position Readout */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Posición actual: <strong>X: {configDraft.positionX}% · Y: {configDraft.positionY}%</strong></span>
              <span>Zoom: <strong>{configDraft.scale.toFixed(2)}x</strong></span>
            </div>
          </div>

          {/* Right Column: Controls & Configuration Tabs (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Mode & Source Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('adjust')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'adjust'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders size={14} />
                Ajuste de Encuadre & Contraste
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'presets'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={14} />
                Galería Cyberpunk
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload size={14} />
                Subir Imagen / URL
              </button>
            </div>

            {/* TAB 1: ADJUSTMENT SLIDERS */}
            {activeTab === 'adjust' && (
              <div className="space-y-4">
                {/* Active / Enabled Toggle */}
                <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Activar fondo en {isSidebar ? 'Barra Lateral' : 'Barra de Reproductor'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Permite visualizar la imagen personalizada detrás de los elementos.
                    </span>
                  </div>
                  <button
                    onClick={() => setConfigDraft((prev) => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      configDraft.enabled ? 'bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)]' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        configDraft.enabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 1. Zoom / Scale */}
                <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ZoomIn size={14} className="text-purple-400" />
                      Escala / Zoom de la Imagen
                    </span>
                    <span className="font-mono text-purple-300 font-bold">{configDraft.scale.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setConfigDraft((prev) => ({
                          ...prev,
                          scale: Math.max(1.0, parseFloat((prev.scale - 0.1).toFixed(2)))
                        }))
                      }
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                      title="Reducir zoom"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      value={configDraft.scale}
                      onChange={(e) =>
                        setConfigDraft((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                      }
                      className="flex-1 h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                    />
                    <button
                      onClick={() =>
                        setConfigDraft((prev) => ({
                          ...prev,
                          scale: Math.min(2.5, parseFloat((prev.scale + 0.1).toFixed(2)))
                        }))
                      }
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                      title="Aumentar zoom"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. Position X & Y Horizontal/Vertical */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Position X */}
                  <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Posición Horizontal (X)</span>
                      <button
                        onClick={() => setConfigDraft((prev) => ({ ...prev, positionX: 50 }))}
                        className="text-[10px] text-purple-400 hover:underline"
                      >
                        Centrar
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={configDraft.positionX}
                        onChange={(e) =>
                          setConfigDraft((prev) => ({ ...prev, positionX: parseInt(e.target.value, 10) }))
                        }
                        className="flex-1 h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                      />
                      <span className="w-10 text-right font-mono text-xs text-slate-300">
                        {configDraft.positionX}%
                      </span>
                    </div>
                  </div>

                  {/* Position Y */}
                  <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Posición Vertical (Y)</span>
                      <button
                        onClick={() => setConfigDraft((prev) => ({ ...prev, positionY: 50 }))}
                        className="text-[10px] text-purple-400 hover:underline"
                      >
                        Centrar
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={configDraft.positionY}
                        onChange={(e) =>
                          setConfigDraft((prev) => ({ ...prev, positionY: parseInt(e.target.value, 10) }))
                        }
                        className="flex-1 h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                      />
                      <span className="w-10 text-right font-mono text-xs text-slate-300">
                        {configDraft.positionY}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Opacity and Dark Contrast Overlay */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Image Opacity */}
                  <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Opacidad de la Imagen</span>
                      <span className="font-mono text-xs text-slate-300">
                        {Math.round(configDraft.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={configDraft.opacity}
                      onChange={(e) =>
                        setConfigDraft((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Controla la intensidad luminosa de la imagen cargada.
                    </span>
                  </div>

                  {/* Dark Contrast Overlay (Anti-Transparencia) */}
                  <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Capa Oscura de Contraste</span>
                      <span className="font-mono text-xs text-slate-300">
                        {Math.round(configDraft.overlayOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={0.95}
                      step={0.05}
                      value={configDraft.overlayOpacity}
                      onChange={(e) =>
                        setConfigDraft((prev) => ({ ...prev, overlayOpacity: parseFloat(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Oscurece el fondo para evitar que los textos o iconos pierdan legibilidad.
                    </span>
                  </div>
                </div>

                {/* 4. Blur Softening */}
                <div className="p-3.5 rounded-2xl bg-[#141126] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Desenfoque Artístico (Blur)</span>
                    <span className="font-mono text-xs text-slate-300">{configDraft.blur} px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={configDraft.blur}
                    onChange={(e) =>
                      setConfigDraft((prev) => ({ ...prev, blur: parseInt(e.target.value, 10) }))
                    }
                    className="w-full h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Difumina bordes agresivos para un acabado cinemático de cristal esmerilado.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: PRESET CYBER GALLERY */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Selecciona cualquiera de estos fondos optimizados en alta definición para tu {isSidebar ? 'Barra Lateral' : 'Barra de Reproductor'}:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BACKDROP_PRESETS.map((preset) => {
                    const isSelected = configDraft.imageUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.url, preset.name)}
                        className={`group relative rounded-2xl overflow-hidden border text-left transition-all h-28 flex flex-col justify-end p-2.5 ${
                          isSelected
                            ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/50 shadow-lg'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="relative z-10">
                          <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider block">
                            {preset.tag}
                          </span>
                          <span className="text-xs font-bold text-white block truncate drop-shadow">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white">
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: LOCAL UPLOAD & URL */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                {/* Upload Local File Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-[var(--accent-primary)]/60 bg-black/30 hover:bg-purple-950/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <span className="text-sm font-bold text-white">Haz clic para subir imagen</span>
                  <span className="text-xs text-slate-400 max-w-sm">
                    Formatos admitidos: PNG, JPG, WebP, SVG. Resolución sugerida:{' '}
                    <strong className="text-white">
                      {isSidebar ? '1080 × 1920 px (Vertical)' : '1920 × 400 px (Ultra-ancho)'}
                    </strong>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Paste Direct URL */}
                <form onSubmit={handleApplyUrl} className="space-y-2">
                  <span className="text-xs font-bold text-white block">O introduce una URL directa de imagen</span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://ejemplo.com/tu-fondo-cyberpunk.jpg"
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors disabled:opacity-40"
                    >
                      Cargar URL
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-[#110d24]/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFraming}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Restablecer posición, escala y filtros"
            >
              <RotateCcw size={14} />
              Centrar & Restablecer
            </button>
            {configDraft.imageUrl && (
              <button
                onClick={handleRemoveImage}
                className="px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Quitar fondo actual"
              >
                <Trash2 size={14} />
                Quitar Imagen
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeBackdropModal}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-black tracking-wide shadow-[0_0_20px_var(--accent-glow)] flex items-center gap-2 transition-all active:scale-95"
            >
              <Check size={16} />
              Guardar y Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  RotateCcw,
  Check,
  Flame,
  Sun,
  Eye,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const QUICK_NEON_SWATCHES = [
  { name: 'Cian Neón', hex: '#00f0ff' },
  { name: 'Violeta Pulso', hex: '#a855f7' },
  { name: 'Rosa Neón', hex: '#f43f5e' },
  { name: 'Verde Matrix', hex: '#10b981' },
  { name: 'Oro Solar', hex: '#f59e0b' },
  { name: 'Azul Eléctrico', hex: '#3b82f6' },
  { name: 'Carmesí Drive', hex: '#ef4444' },
  { name: 'Verde Lima', hex: '#84cc16' },
  { name: 'Blanco Puro', hex: '#ffffff' },
  { name: 'Magenta Puro', hex: '#d946ef' }
];

const BACKGROUND_PRESETS = [
  { name: 'Obsidiana Phorocket', hex: '#07060c', label: 'Predeterminado' },
  { name: 'Púrpura Medianoche', hex: '#0b0816', label: 'Ciberpunk Profundo' },
  { name: 'Azul Espacial', hex: '#070b14', label: 'Hiperespacio' },
  { name: 'Abismo Absoluto', hex: '#020204', label: 'OLED Puro' }
];

export const SystemColorModal: React.FC = () => {
  const {
    isColorModalOpen,
    setIsColorModalOpen,
    customColors,
    updateCustomColors,
    artworkVisualConfig,
    setArtworkVisualConfig,
    thunderConfig,
    setThunderConfig,
    showToast,
    resetAllToDefaults
  } = useMusic();

  const [localPrimary, setLocalPrimary] = useState(customColors.accentPrimary);
  const [localSecondary, setLocalSecondary] = useState(customColors.accentSecondary);
  const [localBg, setLocalBg] = useState(customColors.bgMain);

  if (!isColorModalOpen) return null;

  const handleApplyPrimary = (hex: string) => {
    setLocalPrimary(hex);
    updateCustomColors({ accentPrimary: hex, isCustomActive: true });
  };

  const handleApplySecondary = (hex: string) => {
    setLocalSecondary(hex);
    updateCustomColors({ accentSecondary: hex, isCustomActive: true });
  };

  const handleApplyBackground = (hex: string) => {
    setLocalBg(hex);
    updateCustomColors({
      bgMain: hex,
      bgSurface: hex,
      bgElevated: hex,
      isCustomActive: true
    });
  };

  const handleReset = () => {
    updateCustomColors({
      accentPrimary: '#a855f7',
      accentSecondary: '#06b6d4',
      bgMain: '#07060c',
      bgSurface: '#0d0b18',
      bgElevated: '#141126',
      glowIntensity: 1.0,
      isCustomActive: false
    });
    setLocalPrimary('#a855f7');
    setLocalSecondary('#06b6d4');
    setLocalBg('#07060c');
    showToast('Colores restablecidos a los valores predeterminados de fábrica');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none overflow-y-auto"
      onClick={() => setIsColorModalOpen(false)}
      role="dialog"
      aria-label="Personalización de Colores del Sistema"
    >
      <div
        className="w-full max-w-2xl bg-[#0d0a1c] border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg transition-colors"
              style={{
                backgroundColor: `${customColors.accentPrimary}25`,
                borderColor: `${customColors.accentPrimary}60`,
                color: customColors.accentPrimary
              }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Personalizar Colores del Sistema
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  Cualquier Color
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cambia los colores principales de toda la aplicación en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsColorModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar modal de colores"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live System Preview Badge */}
        <div
          className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
          style={{
            backgroundColor: `${customColors.accentPrimary}12`,
            borderColor: `${customColors.accentPrimary}40`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
              style={{
                backgroundColor: customColors.accentPrimary,
                boxShadow: `0 0 15px ${customColors.accentPrimary}80`
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Vista Previa del Sistema Activo</span>
              <span className="text-[11px] text-slate-300">
                Primario: <span className="font-mono font-bold" style={{ color: customColors.accentPrimary }}>{customColors.accentPrimary}</span> · Secundario: <span className="font-mono font-bold" style={{ color: customColors.accentSecondary }}>{customColors.accentSecondary}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow transition-transform active:scale-95"
              style={{
                backgroundColor: customColors.accentPrimary,
                boxShadow: `0 0 12px ${customColors.accentPrimary}60`
              }}
            >
              Botón Demo
            </button>
            <div
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold border"
              style={{
                borderColor: customColors.accentSecondary,
                color: customColors.accentSecondary,
                backgroundColor: `${customColors.accentSecondary}20`
              }}
            >
              Acento
            </div>
          </div>
        </div>

        {/* 1. Primary Accent Color Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">
                1. Color Primario (Acento Principal)
              </span>
              <span className="text-[11px] text-slate-400">
                Afecta botones de reproducción, bordes activos, pestañas y halos principales.
              </span>
            </div>

            {/* Native Picker + Hex Input */}
            <div className="flex items-center gap-2 bg-[#141126] p-1.5 rounded-xl border border-white/10">
              <input
                type="color"
                value={customColors.accentPrimary}
                onChange={(e) => handleApplyPrimary(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                title="Abrir selector de color nativo para elegir cualquier color"
              />
              <input
                type="text"
                value={localPrimary}
                onChange={(e) => {
                  setLocalPrimary(e.target.value);
                  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(e.target.value)) {
                    handleApplyPrimary(e.target.value);
                  }
                }}
                className="w-20 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-white font-semibold"
                placeholder="#a855f7"
              />
            </div>
          </div>

          {/* Quick Swatches for Primary */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
              Paletas Rápidas Cyberpunk:
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {QUICK_NEON_SWATCHES.map((sw) => {
                const isSelected = customColors.accentPrimary.toLowerCase() === sw.hex.toLowerCase();
                return (
                  <button
                    key={`prim-${sw.hex}`}
                    onClick={() => handleApplyPrimary(sw.hex)}
                    className={`h-8 rounded-xl border transition-all flex items-center justify-center relative ${
                      isSelected
                        ? 'border-white scale-110 shadow-lg ring-2 ring-white/50'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                  >
                    {isSelected && <Check size={14} className="text-black drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Secondary Accent Color Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">
                2. Color Secundario (Neón Complementario)
              </span>
              <span className="text-[11px] text-slate-400">
                Afecta gradientes dobles, visualizadores en barras alternas y detalles secundarios.
              </span>
            </div>

            {/* Native Picker + Hex Input */}
            <div className="flex items-center gap-2 bg-[#141126] p-1.5 rounded-xl border border-white/10">
              <input
                type="color"
                value={customColors.accentSecondary}
                onChange={(e) => handleApplySecondary(e.target.value)}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                title="Elegir cualquier color secundario"
              />
              <input
                type="text"
                value={localSecondary}
                onChange={(e) => {
                  setLocalSecondary(e.target.value);
                  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(e.target.value)) {
                    handleApplySecondary(e.target.value);
                  }
                }}
                className="w-20 px-2 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-white font-semibold"
                placeholder="#06b6d4"
              />
            </div>
          </div>

          {/* Quick Swatches for Secondary */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
              Paletas Rápidas Secundarias:
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {QUICK_NEON_SWATCHES.map((sw) => {
                const isSelected = customColors.accentSecondary.toLowerCase() === sw.hex.toLowerCase();
                return (
                  <button
                    key={`sec-${sw.hex}`}
                    onClick={() => handleApplySecondary(sw.hex)}
                    className={`h-8 rounded-xl border transition-all flex items-center justify-center relative ${
                      isSelected
                        ? 'border-white scale-110 shadow-lg ring-2 ring-white/50'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                  >
                    {isSelected && <Check size={14} className="text-black drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Glow Intensity & Background Tones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Glow Intensity */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Intensidad del Brillo Neón:</span>
              <span className="font-mono" style={{ color: customColors.accentPrimary }}>
                {customColors.glowIntensity.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.1}
              value={customColors.glowIntensity}
              onChange={(e) => updateCustomColors({ glowIntensity: parseFloat(e.target.value) })}
              className="w-full accent-[var(--accent-primary)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.2x Sutil</span>
              <span>1.0x Equilibrado</span>
              <span>2.0x Neón Extremo</span>
            </div>
          </div>

          {/* Background Tone (Any Custom Color or Preset) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Tono de Fondo del Sistema (Cualquier Color):</span>
                <span className="text-[10px] text-slate-400">Color base de las superficies</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColors.bgMain}
                  onChange={(e) => handleApplyBackground(e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                  title="Elegir cualquier color de fondo"
                />
                <input
                  type="text"
                  value={localBg}
                  onChange={(e) => {
                    setLocalBg(e.target.value);
                    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(e.target.value)) {
                      handleApplyBackground(e.target.value);
                    }
                  }}
                  className="w-20 px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-center text-white"
                  placeholder="#07060c"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.hex}
                  onClick={() => {
                    setLocalBg(bg.hex);
                    handleApplyBackground(bg.hex);
                  }}
                  className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    customColors.bgMain === bg.hex
                      ? 'border-white bg-white/10 text-white font-semibold'
                      : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span className="truncate text-[11px]">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Marco Giratorio & Efecto de Carátula (Cuadrado con aristas circulares) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">
                3. Marco Giratorio & Resplandor de la Carátula
              </span>
              <span className="text-[11px] text-slate-400">
                Figura geométrica cuadrada con esquinas curvas que gira en el mismo punto detrás de la música.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={artworkVisualConfig.glowColor}
                onChange={(e) => setArtworkVisualConfig({ glowColor: e.target.value })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                title="Elegir cualquier color para el marco giratorio"
              />
              <span className="text-xs font-mono font-semibold text-white">{artworkVisualConfig.glowColor}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Muestras:</span>
            {['#a855f7', '#00f0ff', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map((hex) => (
              <button
                key={`sq-${hex}`}
                onClick={() => setArtworkVisualConfig({ glowColor: hex })}
                className="w-6 h-6 rounded-lg border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: hex }}
              />
            ))}
            <button
              onClick={() => setArtworkVisualConfig({ glowColor: customColors.accentPrimary })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white ml-auto"
            >
              Usar color primario
            </button>
          </div>
        </div>

        {/* 5. Color del Ambiente Climático */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">
                4. Color de los Ambientes Reactivos (Lluvia, Estática, Nieve)
              </span>
              <span className="text-[11px] text-slate-400">
                Color de las partículas y relámpagos climáticos del fondo.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={thunderConfig.color}
                onChange={(e) => setThunderConfig({ color: e.target.value })}
                className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                title="Elegir cualquier color para el ambiente"
              />
              <span className="text-xs font-mono font-semibold text-white">{thunderConfig.color}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Muestras:</span>
            {['#00f0ff', '#a855f7', '#ef4444', '#10b981', '#f59e0b', '#ffffff'].map((hex) => (
              <button
                key={`amb-${hex}`}
                onClick={() => setThunderConfig({ color: hex })}
                className="w-6 h-6 rounded-lg border border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: hex }}
              />
            ))}
            <button
              onClick={() => setThunderConfig({ color: customColors.accentSecondary })}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white ml-auto"
            >
              Usar color secundario
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all border border-transparent hover:border-rose-500/30"
          >
            <RotateCcw size={14} />
            <span>Restablecer Fábrica</span>
          </button>

          <button
            onClick={() => {
              setIsColorModalOpen(false);
              showToast('¡Colores del sistema guardados y aplicados!');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
            style={{
              backgroundColor: customColors.accentPrimary,
              boxShadow: `0 0 20px ${customColors.accentPrimary}60`
            }}
          >
            <CheckCircle2 size={16} />
            <span>Listo, Aplicar Colores</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Sliders, RotateCcw, Cpu, Moon } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { EqualizerBands } from '../../types/music';
import { EqualizerPresetManager } from './EqualizerPresetManager';

export const AudioControlsModal: React.FC = () => {
  const {
    isAudioSettingsOpen,
    setIsAudioSettingsOpen,
    setEqualizerPreset,
    activeEqualizerBands,
    setCustomEqualizerBands,
    stereoBalance,
    setStereoBalance,
    sleepTimerMinutes,
    setSleepTimer,
    showToast
  } = useMusic();

  if (!isAudioSettingsOpen) return null;

  const handleBandChange = (band: keyof EqualizerBands, val: number) => {
    const updated: EqualizerBands = { ...activeEqualizerBands, [band]: val };
    setCustomEqualizerBands(updated);
  };

  const handleReset = () => {
    setEqualizerPreset('flat');
    setStereoBalance(0);
    setSleepTimer(null);
    showToast('Valores acústicos restablecidos a Flat (neutro)');
  };

  const sleepOptions = [
    { label: 'Desactivado', val: null },
    { label: '15 min', val: 15 },
    { label: '30 min', val: 30 },
    { label: '45 min', val: 45 },
    { label: '60 min', val: 60 }
  ];

  const bandKeys: (keyof EqualizerBands)[] = ['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'];

  // SVG Frequency Curve helper for the active 5 bands
  const renderSpectrumCurve = () => {
    const width = 420;
    const height = 50;
    const paddingX = 35;
    const step = (width - paddingX * 2) / (bandKeys.length - 1);

    const points = bandKeys.map((k, i) => {
      const x = paddingX + i * step;
      const val = activeEqualizerBands[k] ?? 0; // range -12 to +12
      const y = height / 2 - (val / 12) * (height / 2 - 6);
      return { x, y: Math.max(4, Math.min(height - 4, y)) };
    });

    const pathD = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = points[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
      <div className="w-full h-14 bg-black/40 rounded-xl overflow-hidden border border-white/5 relative flex items-center justify-center mb-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
          <defs>
            <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Zero dB guideline */}
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          {/* Filled Area */}
          <path d={areaD} fill="url(#eqGradient)" />
          {/* Curve Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_var(--accent-primary)]"
          />
          {/* Control points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#ffffff"
              stroke="var(--accent-primary)"
              strokeWidth="2"
            />
          ))}
        </svg>
        <span className="absolute right-3 top-1 text-[9px] font-mono text-slate-500">Curva DSP</span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={() => setIsAudioSettingsOpen(false)}
      role="dialog"
      aria-label="Ajustes de audio y ecualizador"
    >
      <div
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0e0c1a] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 sticky top-0 bg-[#0e0c1a]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-[var(--accent-primary)] shadow-inner">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                <span>Ecualizador Paramétrico & DSP</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Cascada 5 bandas Web Audio en tiempo real con perfiles personalizados
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAudioSettingsOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Cerrar ajustes"
          >
            <X size={20} />
          </button>
        </div>

        {/* 5-Band Interactive Visual Equalizer */}
        <div className="p-4 rounded-2xl bg-[#141026] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200">Ajuste de frecuencias (5 Bandas)</span>
            <span className="text-[11px] text-slate-400 font-mono">Rango ±12 dB</span>
          </div>

          {/* Real-time spectrum response curve */}
          {renderSpectrumCurve()}

          {/* 5-Band Sliders */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-32 px-1 sm:px-3">
            {bandKeys.map((band) => {
              const val = activeEqualizerBands[band] ?? 0;
              return (
                <div key={band} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-slate-300 font-medium">
                    {val > 0 ? `+${val}` : val} dB
                  </span>
                  <div className="relative w-4 sm:w-5 h-24 flex items-center justify-center">
                    <div className="w-2 h-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="w-full bg-[var(--accent-primary)] rounded-full transition-all"
                        style={{
                          height: `${Math.max(10, ((val + 12) / 24) * 100)}%`
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      value={val}
                      onChange={(e) => handleBandChange(band, parseInt(e.target.value, 10))}
                      className="absolute inset-0 opacity-0 cursor-pointer h-full"
                      style={{ writingMode: 'vertical-lr' as unknown as undefined }}
                      aria-label={`Banda ${band}`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">{band}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Manager: Factory Profiles & Custom Frequency Profiles */}
        <div>
          <span className="text-xs font-semibold text-slate-200 block mb-2">
            Gestor de Perfiles Acústicos
          </span>
          <EqualizerPresetManager
            currentBands={activeEqualizerBands}
            onApplyBands={(bands, id) => {
              setEqualizerPreset(id);
            }}
          />
        </div>

        {/* Stereo Channel Balance (DSP Panning) */}
        <div className="p-3.5 rounded-2xl bg-[#141026] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-200">
            <span className="font-semibold">Balance de canales estéreo (DSP Panning)</span>
            <span className="font-mono tabular-nums text-slate-400">
              {stereoBalance === 0
                ? 'Centro (L=R)'
                : stereoBalance < 0
                ? `L +${Math.round(Math.abs(stereoBalance) * 100)}%`
                : `R +${Math.round(stereoBalance * 100)}%`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400">L</span>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={stereoBalance}
              onChange={(e) => setStereoBalance(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/10 accent-[var(--accent-primary)] rounded-full cursor-pointer"
              aria-label="Balance estéreo"
            />
            <span className="text-[11px] font-semibold text-slate-400">R</span>
          </div>
        </div>

        {/* Sleep Timer */}
        <div className="p-3.5 rounded-2xl bg-[#141026] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Moon size={15} className="text-purple-400" />
              <span>Temporizador de apagado suave</span>
            </div>
            <span className="text-[11px] text-[var(--accent-primary)] font-medium">
              {sleepTimerMinutes ? `${sleepTimerMinutes} min activo` : 'Inactivo'}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            {sleepOptions.map((opt) => {
              const active = sleepTimerMinutes === opt.val;
              return (
                <button
                  key={opt.label}
                  onClick={() => setSleepTimer(opt.val)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine Specs Info */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
          <Cpu size={18} className="text-[var(--accent-primary)] shrink-0" />
          <div>
            <p className="text-slate-200 font-medium">Motor de Audio: Web Audio API Lossless 5-Band Filter Chain</p>
            <p className="mt-0.5">Muestreo 44.1 kHz · Analyser FFT 128 · Latencia DSP &lt; 10ms · Panning Binaural</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1.5 rounded-xl hover:bg-white/5"
          >
            <RotateCcw size={14} />
            <span>Restablecer todo a Flat</span>
          </button>

          <button
            onClick={() => setIsAudioSettingsOpen(false)}
            className="py-2 px-5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold shadow-md transition-all"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

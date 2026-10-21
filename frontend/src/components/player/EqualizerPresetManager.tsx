import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  Sparkles,
  X,
  FileJson,
  Layers,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { EqualizerBands, EqualizerProfile } from '../../types/music';

interface EqualizerPresetManagerProps {
  currentBands: EqualizerBands;
  onApplyBands: (bands: EqualizerBands, profileId: string) => void;
}

const COLOR_TAGS = [
  { label: 'Violeta Neón', value: '#a855f7' },
  { label: 'Cian Cíber', value: '#06b6d4' },
  { label: 'Magenta Flux', value: '#ec4899' },
  { label: 'Ámbar Solar', value: '#f59e0b' },
  { label: 'Esmeralda', value: '#10b981' },
  { label: 'Rojo Carmesí', value: '#ef4444' }
];

export const EqualizerPresetManager: React.FC<EqualizerPresetManagerProps> = ({
  currentBands,
  onApplyBands
}) => {
  const {
    equalizerPreset,
    equalizerProfiles,
    saveCustomEqualizerProfile,
    updateCustomEqualizerProfile,
    deleteCustomEqualizerProfile,
    resetEqualizerToDefaults,
    importEqualizerProfiles,
    showToast
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'factory' | 'custom'>('factory');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [newProfileColor, setNewProfileColor] = useState(COLOR_TAGS[0].value);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Import / Export modal
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const factoryProfiles = equalizerProfiles.filter((p) => !p.isCustom);
  const customProfiles = equalizerProfiles.filter((p) => p.isCustom);

  // Find active profile
  const activeProfile = equalizerProfiles.find((p) => p.id === equalizerPreset);

  // Check if current bands differ from active profile's saved bands
  const isModified = activeProfile
    ? Object.keys(currentBands).some(
        (b) => currentBands[b as keyof EqualizerBands] !== activeProfile.bands[b as keyof EqualizerBands]
      )
    : false;

  const handleStartSave = () => {
    setIsSavingNew(true);
    setNewProfileName(`Perfil Personalizado ${customProfiles.length + 1}`);
    setNewProfileDesc('');
    setNewProfileColor(COLOR_TAGS[customProfiles.length % COLOR_TAGS.length].value);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      showToast('Por favor introduce un nombre para el perfil');
      return;
    }

    const created = saveCustomEqualizerProfile(
      newProfileName.trim(),
      currentBands,
      newProfileDesc.trim() || undefined,
      newProfileColor
    );

    setIsSavingNew(false);
    setActiveTab('custom');
    onApplyBands(created.bands, created.id);
  };

  const handleUpdateCurrentProfile = () => {
    if (!activeProfile || !activeProfile.isCustom) return;
    updateCustomEqualizerProfile(activeProfile.id, {
      bands: { ...currentBands }
    });
  };

  const handleDeleteProfile = (id: string, name: string) => {
    deleteCustomEqualizerProfile(id);
    setDeleteConfirmId(null);
  };

  const handleExportJson = () => {
    if (customProfiles.length === 0) {
      showToast('No tienes perfiles personalizados para exportar');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customProfiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phorocket-eq-presets-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Archivo JSON de presets descargado');
  };

  const handleCopyJsonToClipboard = () => {
    if (customProfiles.length === 0) {
      showToast('No tienes perfiles personalizados para copiar');
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(customProfiles, null, 2));
    showToast('Perfiles copiados al portapapeles en formato JSON');
  };

  const handleImportJson = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Pega un JSON válido con perfiles de ecualizador');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const count = importEqualizerProfiles(items);
      if (count > 0) {
        setIsImportExportOpen(false);
        setImportJsonText('');
        setActiveTab('custom');
      } else {
        setImportError('No se encontraron perfiles compatibles en el JSON');
      }
    } catch {
      setImportError('El texto proporcionado no es un JSON válido');
    }
  };

  // Mini frequency visualizer path helper
  const renderMiniEqCurve = (bands: EqualizerBands, strokeColor = 'var(--accent-primary)') => {
    const bandKeys: (keyof EqualizerBands)[] = ['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'];
    const width = 80;
    const height = 28;
    const paddingX = 6;
    const step = (width - paddingX * 2) / (bandKeys.length - 1);

    const points = bandKeys.map((k, i) => {
      const x = paddingX + i * step;
      const val = bands[k] ?? 0; // range -12 to +12
      // invert y (12dB = top, -12dB = bottom)
      const y = height / 2 - (val / 12) * (height / 2 - 4);
      return { x, y: Math.max(3, Math.min(height - 3, y)) };
    });

    // Create smooth SVG curve path
    const pathD = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = points[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');

    return (
      <svg width={width} height={height} className="shrink-0 overflow-visible opacity-90">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="2 2"
          strokeWidth="1"
        />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="2" fill={strokeColor} />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Tab Switcher & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('factory')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'factory'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fábrica ({factoryProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Mis Perfiles</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                customProfiles.length > 0 ? 'bg-purple-600/40 text-purple-200' : 'bg-white/10 text-slate-400'
              }`}
            >
              {customProfiles.length}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleStartSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm"
            title="Guardar ecualización actual como perfil personalizado"
          >
            <Plus size={14} className="text-[var(--accent-primary)]" />
            <span className="hidden sm:inline">Guardar Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportExportOpen(true)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
            title="Importar / Exportar perfiles JSON"
            aria-label="Importar o exportar perfiles"
          >
            <Layers size={15} />
          </button>
        </div>
      </div>

      {/* Notice if active profile has unsaved modifications */}
      {isModified && activeProfile && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>
              Curva modificada sobre <strong>"{activeProfile.name}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeProfile.isCustom && (
              <button
                type="button"
                onClick={handleUpdateCurrentProfile}
                className="px-2.5 py-1 rounded-xl bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400 transition-colors shadow-sm"
              >
                Actualizar
              </button>
            )}
            <button
              type="button"
              onClick={handleStartSave}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 font-semibold text-[11px] transition-colors"
            >
              Guardar como nuevo
            </button>
          </div>
        </div>
      )}

      {/* Inline Save New Profile Form */}
      {isSavingNew && (
        <form
          onSubmit={handleConfirmSave}
          className="p-4 rounded-2xl bg-[#141026] border border-purple-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Save size={14} className="text-[var(--accent-primary)]" />
              <span>Guardar nuevo perfil de frecuencias</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSavingNew(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">Nombre del perfil</label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                maxLength={40}
                required
                autoFocus
                placeholder="Ej. Bass Boost Gaming, Voces Sala..."
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Descripción / Notas (opcional)
              </label>
              <input
                type="text"
                value={newProfileDesc}
                onChange={(e) => setNewProfileDesc(e.target.value)}
                maxLength={80}
                placeholder="Ej. Realce dinámico para auriculares de estudio"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1.5">Color distintivo</label>
              <div className="flex items-center gap-2">
                {COLOR_TAGS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewProfileColor(c.value)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newProfileColor === c.value ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Valores actuales:</span>
              <span className="font-mono text-purple-300 font-medium">
                {currentBands['60Hz']} / {currentBands['250Hz']} / {currentBands['1kHz']} / {currentBands['4kHz']} /{' '}
                {currentBands['12kHz']} dB
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSavingNew(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md"
              >
                Guardar Perfil
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {(activeTab === 'factory' ? factoryProfiles : customProfiles).map((p) => {
          const active = equalizerPreset === p.id;
          const isDeleting = deleteConfirmId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onApplyBands(p.bands, p.id)}
              className={`relative group p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                active
                  ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-md'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15'
              }`}
              style={
                active
                  ? {
                      backgroundColor: 'var(--selection-bg)',
                      borderColor: 'var(--border-accent)'
                    }
                  : undefined
              }
            >
              {/* Header: Title, Color pill, Mini visual curve & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.colorTag || '#a855f7' }}
                    />
                    <span className="text-xs font-bold text-white truncate block">{p.name}</span>
                    {active && <Check size={13} className="text-[var(--accent-primary)] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                    {p.description || 'Perfil personalizado'}
                  </p>
                </div>

                {/* Mini EQ response preview */}
                <div className="shrink-0 pointer-events-none">
                  {renderMiniEqCurve(p.bands, p.colorTag || (active ? 'var(--accent-primary)' : '#8b5cf6'))}
                </div>
              </div>

              {/* Band values footer & Action buttons */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px]">
                <span className="font-mono text-slate-500 tabular-nums">
                  {p.bands['60Hz'] > 0 ? `+${p.bands['60Hz']}` : p.bands['60Hz']} /{' '}
                  {p.bands['250Hz'] > 0 ? `+${p.bands['250Hz']}` : p.bands['250Hz']} /{' '}
                  {p.bands['1kHz'] > 0 ? `+${p.bands['1kHz']}` : p.bands['1kHz']} /{' '}
                  {p.bands['4kHz'] > 0 ? `+${p.bands['4kHz']}` : p.bands['4kHz']} /{' '}
                  {p.bands['12kHz'] > 0 ? `+${p.bands['12kHz']}` : p.bands['12kHz']} dB
                </span>

                {/* Custom Preset Actions */}
                {p.isCustom ? (
                  <div className="flex items-center gap-1">
                    {isDeleting ? (
                      <div
                        className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] text-red-200">¿Borrar?</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProfile(p.id, p.name);
                          }}
                          className="text-red-400 hover:text-white font-bold px-1"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="text-slate-400 hover:text-white px-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(p.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Eliminar este perfil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">
                    Calibrado
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {activeTab === 'custom' && customProfiles.length === 0 && (
          <div className="col-span-full py-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 space-y-2">
            <Sliders size={24} className="mx-auto text-slate-500" />
            <p className="text-xs font-semibold text-slate-300">No tienes perfiles personalizados aún</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Ajusta los controles de frecuencia arriba y presiona "Guardar Perfil" para crear tu primera curva personalizada.
            </p>
            <button
              type="button"
              onClick={handleStartSave}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Guardar ajuste actual</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Import / Export Dialog */}
      {isImportExportOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsImportExportOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#120f24] border border-white/20 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileJson size={17} className="text-[var(--accent-primary)]" />
                <span>Gestor de Perfiles & Exportación JSON</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImportExportOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            {/* Export Section */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-slate-200 block">
                Exportar mis perfiles ({customProfiles.length})
              </span>
              <p className="text-[11px] text-slate-400">
                Guarda tus curvas personalizadas para compartirlas con otros usuarios o guardarlas de respaldo.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={customProfiles.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-bold transition-colors disabled:opacity-40"
                >
                  <Download size={14} />
                  <span>Descargar .json</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyJsonToClipboard}
                  disabled={customProfiles.length === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  <Layers size={14} />
                  <span>Copiar JSON</span>
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="text-xs font-semibold text-slate-200 block">Importar perfiles desde JSON</span>
              <p className="text-[11px] text-slate-400">Pega un bloque JSON con perfiles de ecualizador exportados:</p>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[ { "name": "Mi Perfil", "bands": { "60Hz": 6, ... } } ]'
                rows={3}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none"
              />
              {importError && <p className="text-[11px] text-red-400">{importError}</p>}
              <button
                type="button"
                onClick={handleImportJson}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md"
              >
                <Upload size={14} />
                <span>Importar e incorporar</span>
              </button>
            </div>

            {/* Danger Zone: Reset */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500">¿Restablecer presets de fábrica?</span>
              {isResetConfirmOpen ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      resetEqualizerToDefaults();
                      setIsResetConfirmOpen(false);
                      setIsImportExportOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 transition-colors"
                  >
                    Confirmar Restablecimiento
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-2 py-1 rounded-xl text-slate-400 hover:text-white text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors text-[11px]"
                >
                  <RotateCcw size={13} />
                  <span>Restablecer todo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

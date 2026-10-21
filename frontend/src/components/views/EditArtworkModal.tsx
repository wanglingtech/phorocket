import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
  Camera
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

// Curated Cyberpunk Album Art Presets
const CYBERPUNK_COVER_PRESETS = [
  {
    name: 'Neon Grid Runner',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #00e5ff 100%)',
    bg: '#0f0826',
    accent: '#00f0ff',
    iconText: 'NEON'
  },
  {
    name: 'Cyber Matrix Core',
    gradient: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
    bg: '#041d14',
    accent: '#10b981',
    iconText: 'CORE'
  },
  {
    name: 'Crimson Overdrive',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)',
    bg: '#25080c',
    accent: '#ef4444',
    iconText: 'OVER'
  },
  {
    name: 'Solar Flare 2088',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    bg: '#271704',
    accent: '#f59e0b',
    iconText: 'SOLAR'
  },
  {
    name: 'Plasma Violet Void',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)',
    bg: '#140c2e',
    accent: '#c084fc',
    iconText: 'VOID'
  },
  {
    name: 'Magenta Hyperdrive',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)',
    bg: '#260815',
    accent: '#fb7185',
    iconText: 'FLUX'
  },
  {
    name: 'Deep Blue Glitch',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e1b4b 100%)',
    bg: '#070f2b',
    accent: '#60a5fa',
    iconText: 'SYNTH'
  },
  {
    name: 'Emerald Pulsar',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    bg: '#052317',
    accent: '#34d399',
    iconText: 'PULSE'
  }
];

export const EditArtworkModal: React.FC = () => {
  const { artworkModalTrack, closeArtworkModal, editTrackMetadata, showToast } = useMusic();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!artworkModalTrack) return null;

  const currentPreviewImage = selectedImage ?? (selectedGradient ? null : artworkModalTrack.coverImage);
  const currentPreviewGradient = selectedGradient ?? artworkModalTrack.coverGradient;

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP, GIF)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setSelectedGradient(null);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      showToast('Error al leer el archivo de imagen');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Apply URL directly
  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedImage(urlInput.trim());
    setSelectedGradient(null);
    showToast('Imagen cargada desde URL para previsualización');
  };

  // Save changes to track
  const handleSave = () => {
    const updates: Partial<Track> = {};
    if (selectedImage !== null) {
      updates.coverImage = selectedImage;
    }
    if (selectedGradient !== null) {
      updates.coverGradient = selectedGradient;
      // If user chose a preset gradient explicitly, clear cover image so gradient shows
      if (!selectedImage) {
        updates.coverImage = undefined;
      }
    }

    editTrackMetadata(artworkModalTrack.id, updates);
    showToast(`Carátula de "${artworkModalTrack.title}" actualizada`);
    closeArtworkModal();
  };

  // Reset to default
  const handleResetToDefault = () => {
    setSelectedImage('');
    setSelectedGradient(null);
    editTrackMetadata(artworkModalTrack.id, {
      coverImage: undefined
    });
    showToast('Carátula restablecida al diseño original');
    closeArtworkModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={closeArtworkModal}
      role="dialog"
      aria-label="Personalizar carátula e imagen de la pista"
    >
      <div
        className="w-full max-w-xl bg-[#0e0a1c] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-purple-950/80 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[var(--accent-primary)]">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Personalizar Carátula de Pista
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {artworkModalTrack.title} — {artworkModalTrack.artist}
              </p>
            </div>
          </div>
          <button
            onClick={closeArtworkModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Live Preview Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-xl shadow-purple-950/60 group">
              {currentPreviewImage ? (
                <img
                  src={currentPreviewImage}
                  alt="Previsualización de carátula"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center text-white p-2 relative"
                  style={{ background: currentPreviewGradient }}
                >
                  <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center mb-1 bg-black/20">
                    <span className="text-[10px] font-bold tracking-wider">PHO</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                    {artworkModalTrack.genre}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 border border-[var(--accent-primary)]/40 rounded-2xl pointer-events-none" />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-primary)] block mb-1">
                Previsualización en tiempo real
              </span>
              <h4 className="text-sm font-semibold text-white truncate">{artworkModalTrack.title}</h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{artworkModalTrack.album}</p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                  Formato: 1:1 Cuadrado
                </span>
                {artworkModalTrack.coverImage && (
                  <button
                    onClick={handleResetToDefault}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={10} />
                    <span>Quitar carátula personalizada</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-[#151128] rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Subir Archivo</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'presets'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Estilos Cyberpunk</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'url'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon size={14} />
              <span>Enlace URL</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[var(--accent-primary)] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 hover:bg-purple-500/5 group text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 group-hover:bg-[var(--accent-primary)]/20 text-slate-300 group-hover:text-[var(--accent-primary)] flex items-center justify-center mb-3 transition-colors">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-semibold text-white">
                  Haz clic para seleccionar una imagen de tu dispositivo
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos admitidos: PNG, JPG, WebP, GIF o SVG (máximo 8 MB)
                </p>
                {isProcessing && (
                  <span className="mt-3 text-xs text-[var(--accent-primary)] animate-pulse font-medium">
                    Procesando imagen...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Cyberpunk Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block">
                Selecciona una estética vectorial neón preconfigurada para esta pista:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CYBERPUNK_COVER_PRESETS.map((preset) => {
                  const isSelected = selectedGradient === preset.gradient;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedGradient(preset.gradient);
                        setSelectedImage(null);
                      }}
                      className={`relative p-3 rounded-2xl border text-left transition-all overflow-hidden flex flex-col items-center justify-center gap-2 group ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-purple-500/20 ring-2 ring-[var(--accent-primary)] shadow-lg'
                          : 'border-white/10 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-[11px] shadow-inner"
                        style={{ background: preset.gradient }}
                      >
                        {preset.iconText}
                      </div>
                      <span className="text-[11px] font-medium text-slate-200 text-center leading-tight">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL directa de la imagen (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/caratula-album.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold hover:brightness-110 transition-all shrink-0"
                  >
                    Cargar
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                La imagen debe ser accesible públicamente mediante protocolo HTTPS.
              </p>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={closeArtworkModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={selectedImage === null && selectedGradient === null}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] hover:brightness-110 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-950/60 flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Guardar Carátula</span>
          </button>
        </div>
      </div>
    </div>
  );
};

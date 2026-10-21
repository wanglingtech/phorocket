import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Tag,
  Save,
  RotateCcw,
  Sparkles,
  Music2,
  Disc,
  User,
  Plus,
  Check,
  Hash,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';

// Curated genre presets tailored for the cyberpunk & music ecosystem
const CURATED_GENRE_PRESETS = [
  'Cyberpunk',
  'Synthwave',
  'Darkwave',
  'Darksynth',
  'Industrial',
  'Ambient Void',
  'Techno',
  'EBM',
  'Glitch',
  'Electro',
  'Lo-Fi',
  'Retrowave',
  'Chiptune',
  'Future Bass',
  'Vaporwave',
  'Drum & Bass',
  'Phonk',
  'Bass Music'
];

export const EditMetadataModal: React.FC = () => {
  const {
    editingMetadataTrack,
    closeEditMetadataModal,
    editTrackMetadata,
    tracks,
    showToast
  } = useMusic();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'genres'>('general');

  // Load track info when editingMetadataTrack changes
  useEffect(() => {
    if (editingMetadataTrack) {
      setTitle(editingMetadataTrack.title || '');
      setArtist(editingMetadataTrack.artist || '');
      setAlbum(editingMetadataTrack.album || '');
      setBpm(editingMetadataTrack.bpm ? String(editingMetadataTrack.bpm) : '');

      // Parse existing genre into tags list
      if (editingMetadataTrack.genre) {
        const parsed = editingMetadataTrack.genre
          .split(/[/,·|]/)
          .map((g) => g.trim())
          .filter(Boolean);
        setTags(parsed.length > 0 ? parsed : [editingMetadataTrack.genre]);
      } else {
        setTags(['Cyberpunk']);
      }
      setNewTagInput('');
      setActiveTab('general');
    }
  }, [editingMetadataTrack]);

  // Existing artists and albums in library for quick autocomplete
  const libraryArtists = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.artist) set.add(t.artist);
    });
    return Array.from(set).slice(0, 8);
  }, [tracks]);

  const libraryAlbums = useMemo(() => {
    const set = new Set<string>();
    tracks.forEach((t) => {
      if (t.album && t.album !== 'Biblioteca del Dispositivo') set.add(t.album);
    });
    return Array.from(set).slice(0, 6);
  }, [tracks]);

  if (!editingMetadataTrack) return null;

  // Track if any modifications were made
  const hasChanges =
    title !== editingMetadataTrack.title ||
    artist !== editingMetadataTrack.artist ||
    album !== editingMetadataTrack.album ||
    bpm !== (editingMetadataTrack.bpm ? String(editingMetadataTrack.bpm) : '') ||
    tags.join(', ') !== editingMetadataTrack.genre;

  // Handlers for tags
  const handleAddTag = (tagToAdd?: string) => {
    const rawTag = (tagToAdd ?? newTagInput).trim();
    if (!rawTag) return;

    // Split if user pasted comma separated tags
    const splitTags = rawTag
      .split(/[,/|]/)
      .map((t) => t.trim())
      .filter(Boolean);

    setTags((prev) => {
      const next = [...prev];
      splitTags.forEach((t) => {
        if (!next.some((existing) => existing.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      });
      return next;
    });

    if (!tagToAdd) {
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleTogglePresetTag = (preset: string) => {
    const exists = tags.some((t) => t.toLowerCase() === preset.toLowerCase());
    if (exists) {
      handleRemoveTag(preset);
    } else {
      handleAddTag(preset);
    }
  };

  const handleKeyDownTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Capitalize title helper
  const handleFormatTitleCase = () => {
    const formatted = title
      .toLowerCase()
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');
    setTitle(formatted);
  };

  // Reset to original track values
  const handleReset = () => {
    setTitle(editingMetadataTrack.title);
    setArtist(editingMetadataTrack.artist);
    setAlbum(editingMetadataTrack.album);
    setBpm(editingMetadataTrack.bpm ? String(editingMetadataTrack.bpm) : '');
    if (editingMetadataTrack.genre) {
      const parsed = editingMetadataTrack.genre
        .split(/[/,·|]/)
        .map((g) => g.trim())
        .filter(Boolean);
      setTags(parsed.length > 0 ? parsed : [editingMetadataTrack.genre]);
    } else {
      setTags(['Cyberpunk']);
    }
    showToast('Campos restablecidos a los metadatos originales');
  };

  // Save changes
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    const cleanAlbum = album.trim();

    if (!cleanTitle) {
      showToast('El título de la canción no puede estar vacío');
      return;
    }

    if (!cleanArtist) {
      showToast('El nombre del artista no puede estar vacío');
      return;
    }

    const finalGenre = tags.length > 0 ? tags.join(' / ') : 'Cyberpunk';
    const parsedBpm = bpm ? parseInt(bpm, 10) : undefined;

    const updates: Partial<Track> = {
      title: cleanTitle,
      artist: cleanArtist,
      album: cleanAlbum || 'Biblioteca del Dispositivo',
      genre: finalGenre,
      bpm: Number.isNaN(parsedBpm) ? undefined : parsedBpm
    };

    editTrackMetadata(editingMetadataTrack.id, updates);
    showToast(`Metadatos de "${cleanTitle}" guardados en tu biblioteca`);
    closeEditMetadataModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={closeEditMetadataModal}
      role="dialog"
      aria-label="Editor de metadatos de audio"
    >
      <div
        className="relative w-full max-w-xl bg-[#0e0c1b] border border-white/15 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cyberpunk Top Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-[var(--accent-primary)] to-fuchsia-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-[#120f24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] shadow-sm">
              <Tag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-white">
                  Editar Metadatos de la Pista
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden xs:inline">
                  Biblioteca
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Actualiza el título, artista y etiquetas de género en el estado local
              </p>
            </div>
          </div>

          <button
            onClick={closeEditMetadataModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 shrink-0 border-b border-white/5 bg-[#100e20]">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-[var(--accent-primary)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music2 size={14} />
            <span>Información Principal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('genres')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'genres'
                ? 'border-[var(--accent-primary)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag size={14} />
            <span>Etiquetas de Género</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
              {tags.length}
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Live Preview Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#141026] border border-white/10 relative overflow-hidden group">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Previsualización en Tiempo Real
              </span>
              {hasChanges && (
                <span className="text-[10px] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/30 animate-pulse">
                  Cambios pendientes
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              {/* Artwork thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-white/15 relative shadow-md">
                {editingMetadataTrack.coverImage ? (
                  <img
                    src={editingMetadataTrack.coverImage}
                    alt={title || editingMetadataTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-bold"
                    style={{ background: editingMetadataTrack.coverGradient }}
                  >
                    PHO
                  </div>
                )}
              </div>

              {/* Title & Artist & Album details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-white truncate">
                  {title || <span className="text-slate-500 italic">Sin título</span>}
                </h4>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {artist || <span className="text-slate-500 italic">Artista desconocido</span>}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {album || 'Biblioteca del Dispositivo'}
                </p>

                {/* Genre Tags Preview */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.length > 0 ? (
                    tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Sin etiquetas</span>
                  )}
                  {tags.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-mono self-center">
                      +{tags.length - 4} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'general' ? (
            /* General Information Form */
            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Music2 size={13} className="text-[var(--accent-primary)]" />
                    <span>Título de la Pista</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFormatTitleCase}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors underline decoration-dotted"
                    title="Formatear en mayúsculas/minúsculas correctas"
                  >
                    Formato Tipo Título
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Neon Overdrive"
                  className="w-full bg-[#131024] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  required
                />
              </div>

              {/* Artist Field */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-[var(--accent-primary)]" />
                  <span>Nombre del Artista</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ej. DataStrider Net"
                  className="w-full bg-[#131024] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                  required
                />

                {/* Library Artists Quick Pick */}
                {libraryArtists.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] text-slate-500 shrink-0">Sugerencias:</span>
                    {libraryArtists.map((art) => (
                      <button
                        key={art}
                        type="button"
                        onClick={() => setArtist(art)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                          artist === art
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {art}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Album Field */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                  <Disc size={13} className="text-[var(--accent-primary)]" />
                  <span>Álbum o Colección</span>
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Ej. Cybernetic Pulse (2026)"
                  className="w-full bg-[#131024] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />

                {/* Library Albums Quick Pick */}
                {libraryAlbums.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[10px] text-slate-500 shrink-0">Álbumes:</span>
                    {libraryAlbums.map((alb) => (
                      <button
                        key={alb}
                        type="button"
                        onClick={() => setAlbum(alb)}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all whitespace-nowrap shrink-0 ${
                          album === alb
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {alb}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced info: BPM */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <Activity size={13} className="text-[var(--accent-primary)]" />
                    <span>Tempo (BPM)</span>
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    placeholder="Ej. 128"
                    className="w-full bg-[#131024] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                    <Layers size={13} className="text-[var(--accent-primary)]" />
                    <span>Origen de Pista</span>
                  </label>
                  <div className="w-full bg-[#131024]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-400 capitalize flex items-center justify-between">
                    <span>
                      {editingMetadataTrack.source === 'local_imported'
                        ? 'Archivo Local'
                        : editingMetadataTrack.source === 'legal_curated'
                        ? 'Catálogo Legal'
                        : 'Audio Sintetizado'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {editingMetadataTrack.fileSize || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Genre Tags Management Form */
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Tag size={13} className="text-[var(--accent-primary)]" />
                    <span>Etiquetas Asignadas ({tags.length})</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Haz clic en ✕ para eliminar
                  </span>
                </div>

                {/* Active Tag Chips Box */}
                <div className="min-h-[52px] p-2.5 rounded-2xl bg-[#131024] border border-white/10 flex flex-wrap items-center gap-1.5">
                  {tags.length === 0 ? (
                    <span className="text-xs text-slate-500 italic p-1">
                      No hay etiquetas asignadas. Añade una abajo o selecciona de la lista.
                    </span>
                  ) : (
                    tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[var(--accent-primary)]/20 text-white border border-[var(--accent-primary)]/40 shadow-sm animate-in zoom-in-95 duration-100"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400 transition-colors p-0.5 rounded-md hover:bg-white/10"
                          title={`Eliminar etiqueta ${t}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Add Custom Tag Input */}
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5 flex items-center gap-1.5">
                  <Plus size={13} className="text-[var(--accent-primary)]" />
                  <span>Añadir Nueva Etiqueta Personalizada</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleKeyDownTagInput}
                      placeholder="Ej. Cyberpunk, Dark Electro, Synth..."
                      className="w-full bg-[#131024] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    disabled={!newTagInput.trim()}
                    className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Plus size={14} />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

              {/* Curated Genre Cloud */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>Etiquetas Populares Ciberpunk y Electrónica</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  {CURATED_GENRE_PRESETS.map((preset) => {
                    const isSelected = tags.some((t) => t.toLowerCase() === preset.toLowerCase());
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleTogglePresetTag(preset)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[var(--accent-primary)] text-white shadow-sm border border-[var(--accent-primary)] font-semibold'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                        }`}
                      >
                        {isSelected ? <Check size={12} className="text-white" /> : <Plus size={12} className="text-slate-400" />}
                        <span>{preset}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#120f24] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges}
            className="py-2 px-3 sm:px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
            title="Restablecer valores"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeEditMetadataModal}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-purple-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/60 flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Guardar en Biblioteca</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

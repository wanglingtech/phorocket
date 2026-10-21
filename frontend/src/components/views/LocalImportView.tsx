import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderOpen,
  FileAudio,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Play,
  Shield,
  X,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Track } from '../../types/music';
import { formatTime } from '../../utils/formatters';

export const LocalImportView: React.FC = () => {
  const {
    tracks,
    importLocalFiles,
    deleteLocalTrack,
    editTrackMetadata,
    playTrack,
    currentTrack,
    isPlaying,
    openArtworkModal
  } = useMusic();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Metadata editor modal
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editAlbum, setEditAlbum] = useState('');
  const [editCover, setEditCover] = useState<string | undefined>(undefined);

  const localTracks = tracks.filter((t) => t.source === 'local_imported');

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    await importLocalFiles(files);
    setIsProcessing(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessing(true);
      await importLocalFiles(e.dataTransfer.files);
      setIsProcessing(false);
    }
  };

  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditArtist(track.artist);
    setEditAlbum(track.album);
    setEditCover(track.coverImage);
  };

  const saveEditedMetadata = () => {
    if (!editingTrack) return;
    editTrackMetadata(editingTrack.id, {
      title: editTitle.trim() || editingTrack.title,
      artist: editArtist.trim() || editingTrack.artist,
      album: editAlbum.trim() || editingTrack.album,
      coverImage: editCover
    });
    setEditingTrack(null);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditCover(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
          Importación de Archivos Locales
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Añade tu música personal desde tu dispositivo para reproducirla con el motor y visualizador de Phorocket.
        </p>
      </div>

      {/* Privacy & Browser Permission Notice */}
      <div className="p-4 rounded-2xl bg-[#0f0c1e] border border-white/5 flex items-start gap-3.5 text-xs text-slate-400">
        <Shield size={20} className="text-purple-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-200 block">Privacidad del Dispositivo y Seguridad:</span>
          Los archivos seleccionados se procesan localmente en tu navegador sin subirse a ningún servidor externo. Phorocket respeta las políticas del sistema y solo accede a los archivos que tú elijas conscientemente.
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-8 md:p-12 rounded-3xl border-2 border-dashed text-center transition-all flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
            : 'border-white/15 bg-[#100d20] hover:border-white/30'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent-primary)]">
          <UploadCloud size={32} />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">
            Arrastra y suelta tus archivos de audio aquí
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formatos admitidos: MP3, WAV, FLAC, OGG, AAC, M4A
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Individual / Multiple Files selector */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.flac,.ogg,.aac,.m4a"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="py-2.5 px-5 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <FileAudio size={16} />
            <span>Seleccionar Archivos</span>
          </button>

          {/* Folder selector */}
          <input
            ref={folderInputRef}
            type="file"
            multiple
            // @ts-expect-error webkitdirectory is standard for folder picker
            webkitdirectory="true"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors"
          >
            <FolderOpen size={16} />
            <span>Importar Carpeta Completa</span>
          </button>
        </div>

        {isProcessing && (
          <div className="text-xs text-[var(--accent-primary)] font-semibold animate-pulse mt-2">
            Procesando y validando metadatos de audio...
          </div>
        )}
      </div>

      {/* Imported Tracks Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Archivos Importados en Esta Sesión ({localTracks.length})
            </h3>
          </div>
        </div>

        {localTracks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0f0c1d] border border-white/5 text-slate-500 text-xs">
            Aún no has importado archivos locales en esta sesión.
          </div>
        ) : (
          <div className="space-y-2">
            {localTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  className="p-3 rounded-2xl bg-[#110e24] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => playTrack(track, localTracks)}
                      className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative border border-white/10 cursor-pointer"
                    >
                      {track.coverImage ? (
                        <img src={track.coverImage} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: track.coverGradient }}
                        >
                          PHO
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <span className={`text-xs font-semibold truncate block ${isCurrent ? 'text-[var(--accent-primary)]' : 'text-white'}`}>
                        {track.title}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {track.artist} · {track.album}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="text-purple-400">Sesión Local</span>
                        <span>·</span>
                        <span>{track.fileSize || 'Audio decodificado'}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{formatTime(track.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(track)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Editar metadatos y carátula"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => deleteLocalTrack(track.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="Quitar de la biblioteca"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metadata Edit Modal */}
      {editingTrack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-label="Editar metadatos de pista"
        >
          <div className="w-full max-w-md bg-[#120f26] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Editar Metadatos</h3>
              <button
                onClick={() => setEditingTrack(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                {editCover ? (
                  <img src={editCover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: editingTrack.coverGradient }}>
                    PHO
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5"
                >
                  <ImageIcon size={14} />
                  <span>Cambiar carátula</span>
                </button>
                <span className="text-[10px] text-slate-500 block mt-1">JPG, PNG o WebP</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título de la pista</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#181432] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Artista</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full bg-[#181432] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Álbum</label>
                <input
                  type="text"
                  value={editAlbum}
                  onChange={(e) => setEditAlbum(e.target.value)}
                  className="w-full bg-[#181432] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              <button
                onClick={() => setEditingTrack(null)}
                className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={saveEditedMetadata}
                className="py-2 px-5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-semibold shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

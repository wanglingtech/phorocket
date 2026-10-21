import React, { useState, useMemo } from 'react';
import {
  Download,
  Play,
  Heart,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';

export const LegalDiscoveryView: React.FC = () => {
  const {
    tracks,
    playTrack,
    currentTrack,
    toggleFavorite,
    isFavorite,
    downloadLegalTrack
  } = useMusic();

  const [licenseFilter, setLicenseFilter] = useState<'all' | 'cc0' | 'cc_by' | 'commercial'>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const legalCatalog = useMemo(() => {
    return tracks.filter((t) => {
      if (t.source !== 'legal_curated') return false;

      if (licenseFilter === 'cc0' && !t.license.type.includes('CC0')) return false;
      if (licenseFilter === 'cc_by' && !t.license.type.includes('CC-BY')) return false;
      if (licenseFilter === 'commercial' && !t.license.allowCommercial) return false;

      if (genreFilter !== 'all' && t.genre !== genreFilter) return false;

      return true;
    });
  }, [tracks, licenseFilter, genreFilter]);

  const genres = ['all', 'Synthwave', 'Cyber Electro', 'Ambient Void', 'Dark Techno', 'Lo-Fi Cyber'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-16 select-none max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="p-5 sm:p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0d2218] via-[#091710] to-[#070d14] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2.5 sm:space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>Catálogo Abierto & Licencias Verificadas</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            Descubrimiento Musical Legal
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Música con licencias abiertas oficiales (Dominio Público CC0, Creative Commons CC-BY 4.0, Open Audio). Descarga legalmente los archivos de audio junto con su certificado de atribución para tus transmisiones, videojuegos o proyectos comerciales.
          </p>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Genre Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* License Filter */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          {[
            { id: 'all', label: 'Todas las Obras' },
            { id: 'cc0', label: 'Dominio Público (CC0)' },
            { id: 'cc_by', label: 'Creative Commons (CC-BY)' },
            { id: 'commercial', label: 'Uso Comercial Permitido' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setLicenseFilter(f.id as typeof licenseFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                licenseFilter === f.id
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Genre Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 self-start sm:self-auto">
          <span>Estilo:</span>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-[#120f24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g === 'all' ? 'Todos los géneros' : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Tracks Grid (Responsive: 1 column on tablet with sidebar open so cards don't squish, 2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {legalCatalog.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          const fav = isFavorite(track.id);

          return (
            <div
              key={track.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#110e22] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                {/* Artwork */}
                <div
                  onClick={() => playTrack(track, legalCatalog)}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 relative border border-white/10 cursor-pointer shadow-md"
                >
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: track.coverGradient }}
                  >
                    PHO
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>

                {/* Track Details (All single line or cleanly wrapped with truncate) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase truncate">
                      {track.license.type}
                    </span>
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className={`p-1 rounded-lg shrink-0 transition-colors ${
                        fav ? 'text-rose-500' : 'text-slate-400 hover:text-white'
                      }`}
                      aria-label="Favorito"
                    >
                      <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <h3
                    onClick={() => playTrack(track, legalCatalog)}
                    className={`text-sm sm:text-base font-bold truncate cursor-pointer mt-0.5 ${
                      isCurrent ? 'text-[var(--accent-primary)]' : 'text-white'
                    }`}
                  >
                    {track.title}
                  </h3>

                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Por {track.license.author} · {track.album}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 text-[10px] text-slate-400">
                    <span className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {track.genre}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{formatTime(track.duration)}</span>
                    {track.bpm && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-purple-300">{track.bpm} BPM</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* License Terms & Download Bar */}
              <div className="mt-3.5 pt-3 border-t border-white/5 space-y-2.5">
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {track.license.termsSummary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 size={12} />
                      <span>{track.license.allowCommercial ? 'Comercial OK' : 'No comercial'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>{track.license.attributionRequired ? 'Atribución req.' : 'Sin atribución'}</span>
                    </span>
                  </div>

                  {/* Legal Download Button */}
                  <button
                    onClick={() => downloadLegalTrack(track)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                    title="Descargar archivo WAV y certificado de licencia"
                  >
                    <Download size={14} />
                    <span>Descarga Legal</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

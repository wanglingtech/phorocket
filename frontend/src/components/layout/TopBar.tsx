import React, { useState } from 'react';
import { Search, Palette, PanelLeft, Disc3, Zap, ZapOff, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { PhorocketLogo } from '../brand/PhorocketLogo';

export const TopBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentTrack,
    isPlaying,
    lowResourceMode,
    setLowResourceMode,
    setIsColorModalOpen,
    setIsAudioSettingsOpen,
    toggleSidebar,
    isSidebarOpen,
    openBackdropModal
  } = useMusic();

  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      setActiveView('search');
    }
  };

  return (
    <header className="h-16 w-full max-w-full px-2.5 sm:px-5 lg:px-6 flex items-center justify-between gap-1.5 sm:gap-4 lg:gap-6 border-b border-white/5 bg-[#0a0814]/80 backdrop-blur-xl z-20 shrink-0 select-none overflow-hidden">
      {/* Zone 1: Sidebar Toggle & Brand Wordmark */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none"
          title={isSidebarOpen ? 'Ocultar menú lateral' : 'Abrir menú lateral'}
          aria-label="Alternar barra lateral"
        >
          <PanelLeft size={19} className={isSidebarOpen ? 'text-[var(--accent-primary)]' : 'text-slate-400'} />
        </button>

        <button
          onClick={() => setActiveView('home')}
          className="md:hidden focus:outline-none flex items-center"
          title="Phorocket Inicio"
        >
          {/* On small mobile: show compact isotipo; on sm+ show horizontal logo */}
          <span className="sm:hidden">
            <PhorocketLogo variant="isotipo" size="sm" />
          </span>
          <span className="hidden sm:inline-block">
            <PhorocketLogo variant="horizontal" size="sm" />
          </span>
        </button>

        {/* Brand tag visible only on large screens to prevent squashing search on laptop/tablet */}
        <span className="hidden xl:inline font-display font-semibold text-xs tracking-wider text-slate-400 uppercase">
          Cyberpunk Audio Platform
        </span>
      </div>

      {/* Zone 2: Fast Search Bar (Fluid min-w-0 so it adapts smoothly to any phone width without pushing items out) */}
      <div className="flex-1 min-w-0 max-w-md mx-1 sm:mx-2">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            size={14}
            className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar música, artistas..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            onFocus={() => {
              if (activeView !== 'search') setActiveView('search');
            }}
            className="w-full bg-[#131024]/80 border border-white/10 rounded-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all truncate"
          />
        </form>
      </div>

      {/* Zone 3: Quick Primary Actions (Clean responsive hierarchy so items never get cut off on mobile) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Now Playing Direct Access Pill */}
        {currentTrack && (
          <button
            onClick={() => setActiveView('now-playing')}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all text-xs font-semibold shrink-0 ${
              activeView === 'now-playing'
                ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] text-white shadow-md'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Ir a sesión Reproduciendo Ahora"
            aria-label="Reproduciendo Ahora"
          >
            <Disc3
              size={15}
              className={`shrink-0 ${
                isPlaying
                  ? 'text-[var(--accent-primary)] animate-spin-squircle'
                  : 'text-slate-400'
              }`}
            />
            <span className="hidden lg:inline max-w-[110px] truncate text-slate-200">
              {currentTrack.title}
            </span>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping shrink-0" />
            )}
          </button>
        )}

        {/* Low Resource Mode Toggle - hidden on extra small mobile screens to prevent overflow */}
        <button
          onClick={() => setLowResourceMode(!lowResourceMode)}
          className={`hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
            lowResourceMode
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title={
            lowResourceMode
              ? 'Modo Ahorro Activo: Efectos pesados pausados'
              : 'Modo Ahorro: Optimizar consumo de recursos'
          }
          aria-label="Modo de ahorro de recursos"
        >
          {lowResourceMode ? <ZapOff size={15} className="text-amber-400 shrink-0" /> : <Zap size={15} className="shrink-0" />}
          <span className="hidden md:inline">
            {lowResourceMode ? 'Ahorro: ON' : 'Ahorro'}
          </span>
        </button>

        {/* System Colors (Visible on lg+) */}
        <button
          onClick={() => setIsColorModalOpen(true)}
          className="hidden lg:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors focus:outline-none items-center gap-1 shrink-0"
          title="Personalizar colores del sistema"
          aria-label="Personalizar colores"
        >
          <Palette size={16} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-medium text-slate-300">Colores</span>
        </button>

        {/* Equalizer (Visible on xl+) */}
        <button
          onClick={() => setIsAudioSettingsOpen(true)}
          className="hidden xl:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors focus:outline-none items-center gap-1 shrink-0"
          title="Ecualizador de audio paramétrico"
          aria-label="Ecualizador"
        >
          <SlidersHorizontal size={16} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-medium text-slate-300">DSP</span>
        </button>

        {/* Modules Backdrop Shortcut (Visible on 2xl+) */}
        <button
          onClick={() => openBackdropModal('mainModule')}
          className="hidden 2xl:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors focus:outline-none items-center gap-1 shrink-0"
          title="Personalizar imagen de fondo de los módulos"
          aria-label="Fondo de módulos"
        >
          <ImageIcon size={16} className="text-[var(--accent-primary)]" />
          <span className="text-xs font-medium text-slate-300">Fondo</span>
        </button>
      </div>
    </header>
  );
};

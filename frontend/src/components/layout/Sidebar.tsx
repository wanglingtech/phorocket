import React, { useState } from 'react';
import {
  Home,
  Search,
  Library,
  Scale,
  FolderOpen,
  Heart,
  History,
  Plus,
  Watch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Music2,
  Globe,
  X,
  Disc3,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { PhorocketLogo } from '../brand/PhorocketLogo';
import { ViewId } from '../../types/music';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    createPlaylist,
    setIsWatchModalOpen,
    setIsLogoModalOpen,
    setIsColorModalOpen,
    isPlaying,
    isSidebarOpen,
    setIsSidebarOpen,
    customBackdrops,
    openBackdropModal
  } = useMusic();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: { id: ViewId; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'now-playing', label: 'Reproduciendo Ahora', icon: Disc3 },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Biblioteca', icon: Library },
    { id: 'legal', label: 'Música Legal', icon: Scale },
    { id: 'import', label: 'Archivos Locales', icon: FolderOpen },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'integrations', label: 'Adaptadores Oficiales', icon: Globe },
    { id: 'history', label: 'Historial', icon: History }
  ];

  const handleSelectNav = (view: ViewId) => {
    setSelectedPlaylistId(null);
    setActiveView(view);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActiveView('playlist-detail');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCreateNewPlaylist = () => {
    const newId = createPlaylist(`Mi Lista Cyberpunk ${playlists.length + 1}`);
    setSelectedPlaylistId(newId);
    setActiveView('playlist-detail');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Brand & Collapse Header */}
      <div
        className={`flex items-center ${
          isCollapsed
            ? 'flex-col justify-center gap-1.5 py-2.5 px-2 h-auto min-h-16'
            : 'justify-between p-4 h-16'
        } border-b border-white/5 shrink-0`}
      >
        <button
          onClick={() => handleSelectNav('home')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg flex items-center justify-center min-w-0"
          title="Phorocket - Inicio"
        >
          {isCollapsed ? (
            <PhorocketLogo variant="isotipo" size="sm" />
          ) : (
            <PhorocketLogo variant="horizontal" size="md" />
          )}
        </button>

        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-1'}`}>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar menú"
            aria-label="Cerrar barra lateral"
          >
            <X size={18} />
          </button>

          {/* Collapse button on desktop/tablet */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none items-center justify-center"
            title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-1.5 py-3' : 'px-3 py-4'} space-y-5 no-scrollbar`}>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedPlaylistId;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-start px-3 py-2.5 gap-3.5'
                } rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-500/15 text-white font-semibold shadow-inner border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--selection-bg)',
                        borderColor: 'var(--border-accent)',
                        color: '#ffffff'
                      }
                    : undefined
                }
                title={item.label}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${
                    isActive ? 'text-[var(--accent-primary)]' : 'text-slate-400'
                  } ${item.id === 'now-playing' && isPlaying ? 'animate-spin-squircle text-[var(--accent-primary)]' : ''}`}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.id === 'now-playing' && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping ml-1" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Playlists & Collections */}
        <div className="pt-2 border-t border-white/5">
          <div className={`flex items-center ${isCollapsed ? 'justify-center px-1 mb-1.5' : 'justify-between px-3 mb-2'}`}>
            {!isCollapsed && (
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Playlists
              </span>
            )}
            <button
              onClick={handleCreateNewPlaylist}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Crear nueva lista"
              aria-label="Crear nueva playlist"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {playlists.map((pl) => {
              const isSelected = selectedPlaylistId === pl.id;

              return (
                <button
                  key={pl.id}
                  onClick={() => handleSelectPlaylist(pl.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2 text-left'
                  } rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'text-white font-semibold bg-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={pl.name}
                >
                  <div
                    className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-[10px] text-white"
                    style={{ background: pl.coverGradient }}
                  >
                    <Music2 size={10} />
                  </div>
                  {!isCollapsed && <span className="truncate">{pl.name}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experimental Smartwatch & Brand shortcuts */}
        <div className="pt-2 border-t border-white/5 space-y-1">
          <button
            onClick={() => {
              setIsWatchModalOpen(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3 py-2'
            } rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors`}
            title="Simulador Smartwatch Companion"
          >
            <Watch size={18} className="text-amber-400/80 shrink-0" />
            {!isCollapsed && <span className="truncate">Smartwatch Mode</span>}
          </button>

          <button
            onClick={() => {
              setIsColorModalOpen(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3 py-2'
            } rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors`}
            title="Personalizar los colores de todo el sistema a cualquier color"
          >
            <Palette size={18} className="text-[var(--accent-primary)] shrink-0" />
            {!isCollapsed && <span className="truncate">Colores del Sistema</span>}
          </button>

          <button
            onClick={() => {
              setIsLogoModalOpen(true);
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3 py-2'
            } rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors`}
            title="Identidad y Variantes de Marca"
          >
            <Sparkles size={18} className="text-[var(--accent-primary)] shrink-0" />
            {!isCollapsed && <span className="truncate">Marca Phorocket</span>}
          </button>
        </div>
      </div>

      {/* Footer Settings & Backdrop Customizer */}
      <div
        className={`border-t border-white/5 shrink-0 flex ${
          isCollapsed ? 'flex-col items-center gap-2 p-2' : 'flex-row items-center gap-1.5 p-3'
        }`}
      >
        <button
          onClick={() => handleSelectNav('settings')}
          className={`${
            isCollapsed
              ? 'w-10 h-10 p-0 flex items-center justify-center'
              : 'flex-1 flex items-center gap-3.5 px-3 py-2.5'
          } rounded-xl text-sm font-medium transition-all min-w-0 ${
            activeView === 'settings'
              ? 'bg-purple-500/15 text-white font-semibold border border-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          style={
            activeView === 'settings'
              ? {
                  backgroundColor: 'var(--selection-bg)',
                  borderColor: 'var(--border-accent)',
                  color: '#ffffff'
                }
              : undefined
          }
          title="Configuración"
          aria-label="Abrir Configuración"
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="truncate">Configuración</span>}
        </button>

        <button
          onClick={() => openBackdropModal('sidebar')}
          className={`${
            isCollapsed
              ? 'w-10 h-10 p-0 flex items-center justify-center'
              : 'p-2.5'
          } rounded-xl transition-all shrink-0 border ${
            customBackdrops.sidebar.enabled && customBackdrops.sidebar.imageUrl
              ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 shadow-[0_0_10px_var(--accent-glow)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
          }`}
          title="Personalizar imagen de fondo y encuadre del Sidebar"
          aria-label="Fondo personalizado de barra lateral"
        >
          <ImageIcon size={18} />
        </button>
      </div>
    </>
  );

  const backdropLayer = customBackdrops.sidebar.enabled && customBackdrops.sidebar.imageUrl && (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <img
        src={customBackdrops.sidebar.imageUrl}
        alt="Fondo de Barra Lateral"
        className="w-full h-full object-cover transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${customBackdrops.sidebar.scale})`,
          objectPosition: `${customBackdrops.sidebar.positionX}% ${customBackdrops.sidebar.positionY}%`,
          opacity: customBackdrops.sidebar.opacity,
          filter: customBackdrops.sidebar.blur > 0 ? `blur(${customBackdrops.sidebar.blur}px)` : undefined
        }}
      />
      {/* Dark contrast overlay to preserve 100% crisp text & icon legibility */}
      <div
        className="absolute inset-0 bg-[#0a0814] transition-opacity"
        style={{ opacity: customBackdrops.sidebar.overlayOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
    </div>
  );

  return (
    <>
      {/* 1. Desktop Docked Sidebar */}
      <aside
        className={`relative overflow-hidden ${
          isSidebarOpen ? 'hidden md:flex' : 'hidden'
        } flex-col border-r border-white/5 bg-[#0a0814]/95 backdrop-blur-xl transition-all duration-300 z-30 shrink-0 select-none ${
          isCollapsed ? 'w-20' : 'w-56 lg:w-64'
        }`}
        aria-label="Navegación principal de escritorio"
      >
        {backdropLayer}
        <div className="relative z-10 flex flex-col h-full w-full">
          {sidebarContent}
        </div>
      </aside>

      {/* 2. Mobile Slide-Over Drawer when toggled open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside
            className="relative overflow-hidden w-72 max-w-[85vw] h-full flex flex-col bg-[#0d091a] border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
            aria-label="Navegación lateral móvil"
          >
            {backdropLayer}
            <div className="relative z-10 flex flex-col h-full w-full">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { Home, Search, Settings, Disc3, Sparkles } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { ViewId } from '../../types/music';

export const MobileNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedPlaylistId,
    isPlaying,
    isAIAssistantOpen,
    toggleAIAssistant
  } = useMusic();

  const handleNav = (view: ViewId) => {
    setSelectedPlaylistId(null);
    setActiveView(view);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0c0a18]/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-around px-1 pb-safe select-none"
      aria-label="Navegación móvil inferior"
    >
      {/* 1. Inicio */}
      <button
        onClick={() => handleNav('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-colors ${
          activeView === 'home' && !isAIAssistantOpen
            ? 'text-[var(--accent-primary)] font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Inicio"
      >
        <Home
          size={19}
          className={activeView === 'home' && !isAIAssistantOpen ? 'scale-110 transition-transform' : ''}
        />
        <span className="text-[10px] mt-1 tracking-tight truncate">Inicio</span>
      </button>

      {/* 2. Buscar */}
      <button
        onClick={() => handleNav('search')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-colors ${
          activeView === 'search' && !isAIAssistantOpen
            ? 'text-[var(--accent-primary)] font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Buscar"
      >
        <Search
          size={19}
          className={activeView === 'search' && !isAIAssistantOpen ? 'scale-110 transition-transform' : ''}
        />
        <span className="text-[10px] mt-1 tracking-tight truncate">Buscar</span>
      </button>

      {/* 3. Player (concise label so it never truncates) */}
      <button
        onClick={() => handleNav('now-playing')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-colors ${
          activeView === 'now-playing' && !isAIAssistantOpen
            ? 'text-[var(--accent-primary)] font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Reproductor"
      >
        <Disc3
          size={19}
          className={`${
            activeView === 'now-playing' ? 'scale-110 transition-transform' : ''
          } ${isPlaying ? 'animate-spin-squircle text-[var(--accent-primary)]' : ''}`}
        />
        <span className="text-[10px] mt-1 tracking-tight truncate">Player</span>
      </button>

      {/* 4. Aura AI Assistant Direct Nav */}
      <button
        onClick={toggleAIAssistant}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-colors relative ${
          isAIAssistantOpen
            ? 'text-cyan-400 font-semibold'
            : 'text-slate-400 hover:text-cyan-300'
        }`}
        aria-label="Aura Asistente IA"
      >
        <div className="relative">
          <Sparkles
            size={19}
            className={
              isAIAssistantOpen
                ? 'scale-110 text-cyan-400 animate-pulse'
                : 'text-indigo-400 hover:scale-105 transition-transform'
            }
          />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 border border-black animate-ping" />
        </div>
        <span className="text-[10px] mt-1 tracking-tight truncate font-display">Aura AI</span>
      </button>

      {/* 5. Ajustes */}
      <button
        onClick={() => handleNav('settings')}
        className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-colors ${
          activeView === 'settings' && !isAIAssistantOpen
            ? 'text-[var(--accent-primary)] font-semibold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Ajustes"
      >
        <Settings
          size={19}
          className={activeView === 'settings' && !isAIAssistantOpen ? 'scale-110 transition-transform' : ''}
        />
        <span className="text-[10px] mt-1 tracking-tight truncate">Ajustes</span>
      </button>
    </nav>
  );
};

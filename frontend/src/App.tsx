import React, { useEffect } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullscreenPlayer } from './components/player/FullscreenPlayer';
import { QueueDrawer } from './components/player/QueueDrawer';
import { AudioControlsModal } from './components/player/AudioControlsModal';
import { SmartwatchCompanionModal } from './components/views/SmartwatchCompanionModal';
import { LogoShowcaseModal } from './components/brand/LogoShowcaseModal';
import { EditArtworkModal } from './components/views/EditArtworkModal';
import { SpotifyExportModal } from './components/views/SpotifyExportModal';
import { EditMetadataModal } from './components/views/EditMetadataModal';
import { LyricPanel } from './components/player/LyricPanel';
import { SystemColorModal } from './components/views/SystemColorModal';
import { CustomBackdropModal } from './components/views/CustomBackdropModal';

// Views
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { LibraryView } from './components/views/LibraryView';
import { LegalDiscoveryView } from './components/views/LegalDiscoveryView';
import { LocalImportView } from './components/views/LocalImportView';
import { FavoritesView } from './components/views/FavoritesView';
import { PlaylistDetailView } from './components/views/PlaylistDetailView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { ExternalIntegrationsView } from './components/views/ExternalIntegrationsView';
import { NowPlayingView } from './components/views/NowPlayingView';
import { FloatingAIAssistant } from './components/ai/FloatingAIAssistant';

const MainAppContent: React.FC = () => {
  const {
    activeView,
    toastMessage,
    togglePlayPause,
    seekTo,
    currentTime,
    volume,
    setVolume,
    toggleMute,
    currentTrack,
    toggleFavorite,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    setIsQueueOpen,
    setIsAudioSettingsOpen,
    setIsLogoModalOpen,
    setIsWatchModalOpen,
    setIsColorModalOpen,
    isLyricPanelOpen,
    openLyricPanel,
    closeLyricPanel,
    closeArtworkModal,
    closeSpotifyModal,
    customColors,
    componentCustomization,
    customBackdrops
  } = useMusic();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyL':
          if (currentTrack) {
            toggleFavorite(currentTrack.id);
          }
          break;
        case 'KeyY':
          e.preventDefault();
          if (isLyricPanelOpen) {
            closeLyricPanel();
          } else {
            openLyricPanel();
          }
          break;
        case 'KeyF':
          setIsFullscreenPlayerOpen(!isFullscreenPlayerOpen);
          break;
        case 'Escape':
          setIsFullscreenPlayerOpen(false);
          setIsQueueOpen(false);
          setIsAudioSettingsOpen(false);
          setIsLogoModalOpen(false);
          setIsWatchModalOpen(false);
          setIsColorModalOpen(false);
          closeLyricPanel();
          closeArtworkModal();
          closeSpotifyModal();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlayPause,
    seekTo,
    currentTime,
    volume,
    setVolume,
    toggleMute,
    currentTrack,
    toggleFavorite,
    isFullscreenPlayerOpen,
    setIsFullscreenPlayerOpen,
    setIsQueueOpen,
    setIsAudioSettingsOpen,
    setIsLogoModalOpen,
    setIsWatchModalOpen,
    isLyricPanelOpen,
    openLyricPanel,
    closeLyricPanel,
    closeArtworkModal,
    closeSpotifyModal
  ]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07060c] text-slate-100 overflow-hidden font-sans relative">
      {/* Optional CRT Scanlines Layer */}
      {customColors.crtScanlines && (
        <div
          className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]"
          style={{ opacity: customColors.scanlineOpacity }}
          aria-hidden="true"
        />
      )}

      {/* Cyber Grid Background VFX */}
      {componentCustomization.backgroundVfx === 'cyber-grid' && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-15 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom"
          aria-hidden="true"
        />
      )}

      {/* Upper area: Sidebar + Main Area */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Central Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#07060c] overflow-hidden relative">
          {/* Custom Backdrop Image Layer for Modules / Central Viewport */}
          {customBackdrops.mainModule?.enabled && customBackdrops.mainModule?.imageUrl && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <img
                src={customBackdrops.mainModule.imageUrl}
                alt="Fondo de Módulos"
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${customBackdrops.mainModule.scale})`,
                  objectPosition: `${customBackdrops.mainModule.positionX}% ${customBackdrops.mainModule.positionY}%`,
                  opacity: customBackdrops.mainModule.opacity,
                  filter: customBackdrops.mainModule.blur > 0 ? `blur(${customBackdrops.mainModule.blur}px)` : undefined
                }}
              />
              {/* Dark contrast overlay layer */}
              <div
                className="absolute inset-0 bg-[#07060c] transition-opacity"
                style={{ opacity: customBackdrops.mainModule.overlayOpacity }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
            </div>
          )}

          <TopBar />

          {/* Scrollable View Area with bottom padding for mobile mini-player & desktop player bar */}
          <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 sm:py-6 pb-36 md:pb-28 relative z-10">
            <div className="max-w-7xl mx-auto">
              {activeView === 'home' && <HomeView />}
              {activeView === 'search' && <SearchView />}
              {activeView === 'library' && <LibraryView />}
              {activeView === 'legal' && <LegalDiscoveryView />}
              {activeView === 'import' && <LocalImportView />}
              {activeView === 'favorites' && <FavoritesView />}
              {activeView === 'playlist-detail' && <PlaylistDetailView />}
              {activeView === 'history' && <HistoryView />}
              {activeView === 'settings' && <SettingsView />}
              {activeView === 'integrations' && <ExternalIntegrationsView />}
              {activeView === 'now-playing' && <NowPlayingView />}
            </div>
          </main>
        </div>
      </div>

      {/* Desktop Persistent Bottom Player */}
      <PlayerBar />

      {/* Mobile Persistent Floating Mini Player */}
      <MiniPlayer />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav />

      {/* Overlays and Modals */}
      <FloatingAIAssistant />
      <FullscreenPlayer />
      <QueueDrawer />
      <AudioControlsModal />
      <SmartwatchCompanionModal />
      <LogoShowcaseModal />
      <EditArtworkModal />
      <EditMetadataModal />
      <SpotifyExportModal />
      <LyricPanel />
      <SystemColorModal />
      <CustomBackdropModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-26 left-1/2 -translate-x-1/2 z-50 bg-[#161326]/95 border border-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl shadow-purple-950/80 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xl flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <MainAppContent />
    </MusicProvider>
  );
}

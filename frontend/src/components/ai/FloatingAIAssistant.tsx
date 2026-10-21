import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Settings,
  Bot,
  Play,
  Volume2,
  Shuffle,
  CloudRain,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Disc3,
  Activity,
  Layers,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { formatTime } from '../../utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionData?: {
    type: string;
    trackTitle?: string;
    trackArtist?: string;
    trackImage?: string;
    trackGradient?: string;
    ambientType?: string;
    visualizerMode?: string;
    volume?: number;
    color?: string;
  };
}

export const FloatingAIAssistant: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    setThunderConfig,
    setVisualizerMode,
    setArtworkVisualConfig,
    showToast,
    setActiveView,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    toggleAIAssistant
  } = useMusic();

  const isOpen = isAIAssistantOpen;
  const setIsOpen = setIsAIAssistantOpen;
  const [showSettings, setShowSettings] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API Key & Model Configuration State (persisted in localStorage)
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('phorocket_user_gemini_api_key') || '';
  });
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [activeModel, setActiveModel] = useState<string>(() => {
    return localStorage.getItem('phorocket_user_gemini_model') || 'gemini-3.8-flash';
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'untested' | 'error' | 'testing'>('untested');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Messages History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy Aura, tu asistente musical inteligente. Puedes pedirme reproducir canciones, cambiar efectos de ambiente, ajustar el volumen o recomendarte música según tu estado de ánimo.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !showSettings) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showSettings]);

  // Save API Key & Model to localStorage
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('phorocket_user_gemini_api_key', apiKey.trim());
      localStorage.setItem('phorocket_user_gemini_model', activeModel);
      setConnectionStatus('untested');
      showToast('API Key guardada localmente.');
      testConnection(apiKey.trim(), activeModel);
    }
  };

  // Remove / Clear API Key as requested by user
  const handleRemoveApiKey = () => {
    setApiKey('');
    localStorage.removeItem('phorocket_user_gemini_api_key');
    setConnectionStatus('untested');
    setStatusMessage('');
    showToast('API Key eliminada.');
  };

  // Test API Key connection
  const testConnection = async (testKey?: string, testMod?: string) => {
    const keyToUse = testKey || apiKey;
    setConnectionStatus('testing');
    setStatusMessage('Comprobando conexión con la API...');

    try {
      const res = await fetch('/api/ai/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse
        },
        body: JSON.stringify({
          apiKey: keyToUse,
          model: testMod || activeModel
        })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setConnectionStatus('connected');
        setStatusMessage(`Conexión exitosa con el modelo ${data.model}`);
        showToast(`IA conectada: ${data.model}`);
      } else {
        setConnectionStatus('error');
        setStatusMessage(data.error || 'Error al conectar.');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(err.message || 'Error de conexión.');
    }
  };

  // Fallback intelligent natural language matcher when no API key is available
  const executeLocalFallback = (prompt: string): { reply: string; action: any } => {
    const lower = prompt.toLowerCase();

    // 1. Play / Reproducir specific song
    if (lower.includes('reproduce') || lower.includes('pon ') || lower.includes('toca ') || lower.includes('play')) {
      const matched = tracks.find(
        (t) =>
          lower.includes(t.title.toLowerCase()) ||
          lower.includes(t.artist.toLowerCase()) ||
          lower.includes(t.genre.toLowerCase())
      );

      if (matched) {
        return {
          reply: `Iniciando reproducción de "${matched.title}" de ${matched.artist}.`,
          action: {
            type: 'PLAY_TRACK',
            trackId: matched.id,
            trackTitle: matched.title
          }
        };
      } else {
        // Pick random track
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        return {
          reply: `No encontré ese título exacto, pero aquí tienes una excelente pista de la biblioteca: "${randomTrack.title}".`,
          action: {
            type: 'PLAY_TRACK',
            trackId: randomTrack.id,
            trackTitle: randomTrack.title
          }
        };
      }
    }

    // 2. Playback controls
    if (lower.includes('pausa') || lower.includes('para')) {
      return {
        reply: 'Pausando la música.',
        action: { type: 'TOGGLE_PLAY' }
      };
    }
    if (lower.includes('reanuda') || lower.includes('continua') || lower.includes('sigue')) {
      return {
        reply: 'Reanudando la sesión de audio.',
        action: { type: 'TOGGLE_PLAY' }
      };
    }
    if (lower.includes('siguiente') || lower.includes('avanza') || lower.includes('next')) {
      return {
        reply: 'Saltando a la siguiente canción en la cola.',
        action: { type: 'NEXT_TRACK' }
      };
    }
    if (lower.includes('anterior') || lower.includes('regresa') || lower.includes('prev')) {
      return {
        reply: 'Volviendo a la canción anterior.',
        action: { type: 'PREV_TRACK' }
      };
    }

    // 3. Volume
    if (lower.includes('volumen') || lower.includes('sube') || lower.includes('baja')) {
      let newVol = 0.8;
      if (lower.includes('sube') || lower.includes('alto')) newVol = Math.min(1, volume + 0.2);
      else if (lower.includes('baja') || lower.includes('bajo')) newVol = Math.max(0.1, volume - 0.2);
      else if (lower.includes('50') || lower.includes('mitad')) newVol = 0.5;
      else if (lower.includes('100') || lower.includes('máximo')) newVol = 1.0;
      return {
        reply: `Ajustando el nivel de volumen al ${Math.round(newVol * 100)}%.`,
        action: { type: 'SET_VOLUME', volume: newVol }
      };
    }

    // 4. Ambient & Visuals
    if (lower.includes('trueno') || lower.includes('rayo')) {
      return {
        reply: 'Ambiente climático cambiado a truenos y rayos reactivos.',
        action: { type: 'SET_AMBIENT', ambientType: 'thunder' }
      };
    }
    if (lower.includes('lluvia')) {
      return {
        reply: 'Ambiente cambiado a lluvia cyberpunk relajante.',
        action: { type: 'SET_AMBIENT', ambientType: 'rain' }
      };
    }
    if (lower.includes('nieve')) {
      return {
        reply: 'Ambiente de nieve de neón activado.',
        action: { type: 'SET_AMBIENT', ambientType: 'snow' }
      };
    }
    if (lower.includes('estatica') || lower.includes('crt')) {
      return {
        reply: 'Efecto de estática CRT activado.',
        action: { type: 'SET_AMBIENT', ambientType: 'static' }
      };
    }

    // 5. Recommendations
    if (lower.includes('recomiend') || lower.includes('sugiere') || lower.includes('que escucho')) {
      const rec = tracks[Math.floor(Math.random() * tracks.length)];
      return {
        reply: `Te recomiendo "${rec.title}" de ${rec.artist} (${rec.genre}). ¡Te va a encantar!`,
        action: {
          type: 'PLAY_TRACK',
          trackId: rec.id,
          trackTitle: rec.title
        }
      };
    }

    // 6. Generic response
    return {
      reply: 'Comando procesado en modo local. Puedes ingresar tu propia API Key de Gemini en los ajustes de Aura para habilitar razonamiento completo.',
      action: { type: 'NONE' }
    };
  };

  // Execute AI action on the audio player
  const applyAction = (action: any) => {
    if (!action || action.type === 'NONE') return;

    switch (action.type) {
      case 'PLAY_TRACK':
        if (action.trackId) {
          const target = tracks.find((t) => t.id === action.trackId);
          if (target) {
            playTrack(target);
            showToast(`Reproduciendo: ${target.title}`);
          }
        }
        break;

      case 'TOGGLE_PLAY':
        togglePlayPause();
        showToast(isPlaying ? 'Pausado' : 'Reproduciendo');
        break;

      case 'NEXT_TRACK':
        nextTrack();
        break;

      case 'PREV_TRACK':
        prevTrack();
        break;

      case 'SET_VOLUME':
        if (typeof action.volume === 'number') {
          setVolume(action.volume);
          showToast(`Volumen: ${Math.round(action.volume * 100)}%`);
        }
        break;

      case 'SET_SHUFFLE':
        toggleShuffle();
        break;

      case 'SET_REPEAT':
        cycleRepeat();
        break;

      case 'SET_AMBIENT':
        if (action.ambientType) {
          setThunderConfig({ type: action.ambientType, enabled: true });
          showToast(`Ambiente: ${action.ambientType}`);
        }
        break;

      case 'SET_VISUALIZER':
        if (action.visualizerMode) {
          setVisualizerMode(action.visualizerMode);
          showToast(`Visualizador: ${action.visualizerMode}`);
        }
        break;

      case 'CUSTOMIZE_THEME':
        if (action.color) {
          setArtworkVisualConfig({ glowColor: action.color });
          setThunderConfig({ color: action.color });
          showToast(`Color de aura actualizado a ${action.color}`);
        }
        break;

      case 'SEARCH':
        if (action.searchQuery) {
          setActiveView('search');
        }
        break;

      default:
        break;
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Catalog summary to provide context for AI
      const catalogSummary = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        album: t.album,
        bpm: t.bpm
      }));

      const playbackState = {
        isPlaying,
        currentTrackTitle: currentTrack?.title || 'Ninguna',
        volume,
        isShuffle,
        repeatMode
      };

      // Call backend AI endpoint
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          prompt: text,
          catalog: catalogSummary,
          playbackState,
          model: activeModel,
          apiKey: apiKey || undefined
        })
      });

      let replyText = '';
      let actionObj: any = null;

      if (response.ok) {
        const json = await response.json();
        replyText = json.data?.reply || 'Comando completado.';
        actionObj = json.data?.action;
        if (json.model) {
          setActiveModel(json.model);
        }
      } else {
        // Fallback to local heuristic parser if API is not yet configured or returned 401
        const fallback = executeLocalFallback(text);
        replyText = fallback.reply;
        actionObj = fallback.action;
      }

      // Execute action on player
      if (actionObj) {
        applyAction(actionObj);
      }

      // Find track info if played
      let actionData: any = undefined;
      if (actionObj?.type === 'PLAY_TRACK' && actionObj.trackId) {
        const trk = tracks.find((t) => t.id === actionObj.trackId);
        if (trk) {
          actionData = {
            type: 'PLAY_TRACK',
            trackTitle: trk.title,
            trackArtist: trk.artist,
            trackImage: trk.coverImage,
            trackGradient: trk.coverGradient
          };
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionData
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Network error in AI command, using local heuristic fallback:', err);
      const fallback = executeLocalFallback(text);
      applyAction(fallback.action);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '▶ Reproduce Neon Orbit',
    '⚡ Pon algo de Synthwave',
    '🌩 Activa ambiente de truenos',
    '🔊 Sube el volumen al 80%',
    '🎲 Modo aleatorio',
    '🎧 Recomiéndame algo para programar'
  ];

  const floatingBottomClass = currentTrack ? 'bottom-40 sm:bottom-24' : 'bottom-24 sm:bottom-24';

  return (
    <>
      {/* ===================================================================== */}
      {/* 1. FLOATING LAUNCHER BUTTON (Elevated safely above mobile mini-player)*/}
      {/* ===================================================================== */}
      <div className={`fixed ${floatingBottomClass} right-3 sm:right-6 z-40 select-none transition-all duration-300`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 focus:outline-none ${
            isOpen
              ? 'bg-[#18142e] border-2 border-[var(--accent-primary)] text-white scale-95'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white hover:scale-105 active:scale-95'
          }`}
          style={{
            boxShadow: '0 0 25px -3px var(--accent-glow)'
          }}
          title="Abrir Aura AI: Asistente musical y control por voz/comandos"
          aria-label="Asistente de inteligencia artificial"
        >
          {/* Animated pulsing halo ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 opacity-40 blur-md group-hover:opacity-80 transition-opacity animate-pulse pointer-events-none" />

          {/* Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles size={20} className="animate-spin-squircle text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
          </div>

          {/* Model Name Pill on Floating Button */}
          <div className="hidden sm:flex flex-col items-start leading-none pr-1">
            <span className="text-[11px] font-bold tracking-wider font-display">AURA AI</span>
            <span className="text-[9px] font-mono text-cyan-200 opacity-90 truncate max-w-[100px]">
              {activeModel}
            </span>
          </div>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. CHAT & COMMAND DRAWER MODAL                                        */}
      {/* ===================================================================== */}
      {isOpen && (
        <div
          className="fixed bottom-20 sm:bottom-28 right-2 sm:right-6 z-50 w-[96vw] sm:w-[420px] max-w-full h-[540px] max-h-[78vh] bg-[#0c0919]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 select-none"
          role="dialog"
          aria-label="Ventana de comando de IA"
        >
          {/* Header Bar */}
          <header className="px-4 py-3 border-b border-white/10 bg-[#120e24]/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] to-cyan-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Bot size={18} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white font-display">Aura AI</h3>
                  {/* Model Tag prominently shown as requested */}
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 border border-cyan-400/30 truncate max-w-[130px]">
                    {activeModel}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Co-piloto musical en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Settings / API Key Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-xl transition-colors ${
                  showSettings
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Configuración de API Key y Modelos"
                aria-label="Configuración de IA"
              >
                <Settings size={17} />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Cerrar ventana"
                aria-label="Cerrar asistente"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* =================================================================== */}
          {/* TAB A: SETTINGS & API KEY CONFIGURATION (Custom key + Clear key)    */}
          {/* =================================================================== */}
          {showSettings ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Key size={14} className="text-[var(--accent-primary)]" />
                  <span>Configuración de API & Modelos</span>
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-[11px] text-[var(--accent-primary)] hover:underline font-semibold"
                >
                  Volver al Chat
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : connectionStatus === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                {connectionStatus === 'connected' ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : connectionStatus === 'error' ? (
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Bot size={16} className="text-slate-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {connectionStatus === 'connected'
                      ? 'Conexión verificada y lista'
                      : connectionStatus === 'error'
                      ? 'Error en la conexión'
                      : 'Listo para conectar'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {statusMessage ||
                      'Cada usuario puede colocar su propia API Key de Gemini o removerla en cualquier momento.'}
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Tu API Key de Gemini:
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    placeholder="Pega tu clave (AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#130f24] border border-white/10 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--accent-primary)] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-white transition-colors"
                    title={showKeyPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showKeyPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  La clave se almacena únicamente en tu navegador local y se envía de forma segura a través del backend (/api/ai/command).
                </p>
              </div>

              {/* Model Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Modelo de Inteligencia Artificial:
                </label>
                <select
                  value={activeModel}
                  onChange={(e) => {
                    setActiveModel(e.target.value);
                    localStorage.setItem('phorocket_user_gemini_model', e.target.value);
                  }}
                  className="w-full bg-[#130f24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado · Rápido y fluido)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Razonamiento complejo)</option>
                  <option value="gemini-flash-latest">gemini-flash-latest (Última versión)</option>
                </select>
              </div>

              {/* Actions: Save, Test, and Remove Key */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSaveApiKey}
                    className="py-2 px-3 rounded-xl bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-98"
                  >
                    Guardar y Conectar
                  </button>

                  <button
                    onClick={() => testConnection()}
                    disabled={connectionStatus === 'testing'}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs transition-all active:scale-98"
                  >
                    {connectionStatus === 'testing' ? 'Probando...' : 'Probar Conexión'}
                  </button>
                </div>

                {/* Quitar API Key button as specifically requested */}
                {apiKey && (
                  <button
                    onClick={handleRemoveApiKey}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    title="Eliminar la clave guardada y volver al modo básico"
                  >
                    <Trash2 size={13} />
                    <span>Quitar / Desconectar API Key</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* TAB B: CONVERSATION & NATURAL LANGUAGE COMMAND STREAM               */
            /* =================================================================== */
            <>
              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-[var(--accent-primary)] text-white shadow-md rounded-br-none'
                            : 'bg-[#151128] border border-white/10 text-slate-200 shadow-sm rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Interactive Playback Confirmation Card */}
                        {msg.actionData?.type === 'PLAY_TRACK' && msg.actionData.trackTitle && (
                          <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/15 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/15">
                              {msg.actionData.trackImage ? (
                                <img src={msg.actionData.trackImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white"
                                  style={{ background: msg.actionData.trackGradient || '#a855f7' }}
                                >
                                  PHO
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-bold text-white truncate block">
                                {msg.actionData.trackTitle}
                              </span>
                              <span className="text-[9px] text-slate-400 truncate block">
                                {msg.actionData.trackArtist}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const trk = tracks.find((t) => t.title === msg.actionData?.trackTitle);
                                if (trk) playTrack(trk);
                              }}
                              className="p-1.5 rounded-lg bg-[var(--accent-primary)] text-white hover:brightness-110 active:scale-95 transition-all shrink-0"
                              title="Reproducir de nuevo"
                            >
                              <Play size={12} fill="currentColor" />
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-slate-500 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#151128] border border-white/10 text-xs text-slate-400 w-fit">
                    <Sparkles size={14} className="text-[var(--accent-primary)] animate-spin" />
                    <span className="font-mono text-[11px]">Aura está pensando...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className="px-3 py-2 border-t border-white/5 bg-[#0e0a1f]/80 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white whitespace-nowrap transition-all shrink-0 active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-white/10 bg-[#120e26] flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Pide una canción, volumen, ambiente o recomendación..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[#1a1532] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--accent-primary)]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2.5 rounded-2xl bg-[var(--accent-primary)] hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md active:scale-95 transition-all shrink-0"
                  title="Enviar comando"
                  aria-label="Enviar"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

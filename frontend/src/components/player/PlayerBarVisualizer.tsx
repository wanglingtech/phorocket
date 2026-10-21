import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { Activity, Radio, BarChart3, Waves, Sparkles, Maximize2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

export type PlayerBarVizMode = 'bars' | 'wave' | 'peak' | 'matrix';

interface PlayerBarVisualizerProps {
  isPlaying: boolean;
  className?: string;
  onOpenFullscreen?: () => void;
}

export const PlayerBarVisualizer: React.FC<PlayerBarVisualizerProps> = ({
  isPlaying,
  className = '',
  onOpenFullscreen
}) => {
  const { setIsFullscreenPlayerOpen } = useMusic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [vizMode, setVizMode] = useState<PlayerBarVizMode>('bars');
  const [accentColor, setAccentColor] = useState('#a855f7');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [liveDb, setLiveDb] = useState<number>(-36);

  // Peak history for gravity falloff on bars
  const peaksRef = useRef<number[]>(new Array(24).fill(0));
  const peakSpeedRef = useRef<number[]>(new Array(24).fill(0));
  // Smoothed bar heights
  const smoothedBarsRef = useRef<number[]>(new Array(24).fill(0));

  // Sync colors from CSS variables
  useEffect(() => {
    const updateColors = () => {
      const computed = getComputedStyle(document.documentElement);
      const prim = computed.getPropertyValue('--accent-primary').trim();
      const sec = computed.getPropertyValue('--accent-secondary').trim();
      if (prim) setAccentColor(prim);
      if (sec) setSecondaryColor(sec);
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });
    return () => observer.disconnect();
  }, []);

  const cycleMode = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const modes: PlayerBarVizMode[] = ['bars', 'wave', 'peak', 'matrix'];
    setVizMode((curr) => {
      const nextIdx = (modes.indexOf(curr) + 1) % modes.length;
      return modes[nextIdx];
    });
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);
    let idlePhase = 0;
    let lastDbUpdate = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const hasAudio = isPlaying && audioEngine.getVisualizerData(freqData, timeData);

      if (!hasAudio) {
        // Idle standby mode: subtle breathing cyber wave
        idlePhase += 0.035;
        for (let i = 0; i < 64; i++) {
          freqData[i] = Math.max(
            0,
            Math.floor(Math.sin(idlePhase + i * 0.2) * 22 + Math.cos(idlePhase * 0.7 + i * 0.1) * 12 + 18)
          );
          timeData[i] = Math.floor(Math.sin(idlePhase * 1.2 + i * 0.15) * 25 + 128);
        }
      }

      // Calculate approximate RMS / dB for tactical HUD reading
      let sum = 0;
      for (let i = 0; i < 32; i++) {
        sum += freqData[i];
      }
      const avg = sum / 32;
      const calcDb = hasAudio ? Math.min(0, Math.floor((avg / 255) * 48 - 48)) : -48;
      const now = performance.now();
      if (now - lastDbUpdate > 120) {
        setLiveDb(calcDb);
        lastDbUpdate = now;
      }

      // Render based on selected visualizer mode
      if (vizMode === 'bars') {
        renderBars(ctx, width, height, freqData, dpr, hasAudio);
      } else if (vizMode === 'wave') {
        renderWave(ctx, width, height, timeData, dpr, hasAudio);
      } else if (vizMode === 'peak') {
        renderPeak(ctx, width, height, freqData, dpr, hasAudio);
      } else if (vizMode === 'matrix') {
        renderMatrix(ctx, width, height, freqData, dpr, hasAudio);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    // Sub-renderer: Spectrum Bars with gravity falloff
    const renderBars = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      freq: Uint8Array,
      dpr: number,
      active: boolean
    ) => {
      const barCount = 18;
      const barGap = 2 * dpr;
      const totalGaps = (barCount - 1) * barGap;
      const barWidth = Math.max(2, (w - totalGaps - 8 * dpr) / barCount);
      const startX = 4 * dpr;

      // Create vertical gradient
      const grad = c.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, accentColor);
      grad.addColorStop(0.65, secondaryColor);
      grad.addColorStop(1, '#ec4899'); // Neon Pink peak

      const peaks = peaksRef.current;
      const peakSpeed = peakSpeedRef.current;
      const smoothed = smoothedBarsRef.current;

      for (let i = 0; i < barCount; i++) {
        // Sample frequencies non-linearly to favor bass and mids
        const binIndex = Math.min(63, Math.floor(Math.pow(i / barCount, 1.35) * 44) + 1);
        const rawValue = freq[binIndex] || 0;
        const targetHeight = Math.max(3 * dpr, (rawValue / 255) * (h - 6 * dpr));

        // Smooth interpolation
        smoothed[i] = smoothed[i] * 0.65 + targetHeight * 0.35;
        const currentH = smoothed[i];

        // Peak decay physics
        if (currentH >= peaks[i]) {
          peaks[i] = currentH;
          peakSpeed[i] = 0;
        } else {
          peakSpeed[i] += 0.35 * dpr; // Gravity
          peaks[i] = Math.max(0, peaks[i] - peakSpeed[i]);
        }

        const x = startX + i * (barWidth + barGap);
        const y = h - currentH - 2 * dpr;

        // Draw Bar
        c.fillStyle = grad;
        c.beginPath();
        // Segmented or rounded style
        const radius = Math.min(barWidth / 2, 2 * dpr);
        c.roundRect(x, y, barWidth, currentH, [radius, radius, 1, 1]);
        c.fill();

        // Neon Glow highlight on active peaks
        if (active && rawValue > 160) {
          c.save();
          c.shadowColor = accentColor;
          c.shadowBlur = 6 * dpr;
          c.fillStyle = 'rgba(255, 255, 255, 0.4)';
          c.fillRect(x, y, barWidth, Math.min(currentH, 3 * dpr));
          c.restore();
        }

        // Floating Peak Cap
        if (peaks[i] > 3 * dpr) {
          const peakY = Math.max(2 * dpr, h - peaks[i] - 2 * dpr);
          c.fillStyle = active && rawValue > 200 ? '#f43f5e' : '#ffffff';
          c.fillRect(x, peakY, barWidth, 1.5 * dpr);
        }
      }
    };

    // Sub-renderer: Neon Oscilloscope Waveform
    const renderWave = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      time: Uint8Array,
      dpr: number,
      active: boolean
    ) => {
      const sliceWidth = w / 48;
      const centerY = h / 2;

      // Subtle center grid reference line
      c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      c.lineWidth = 1 * dpr;
      c.setLineDash([3 * dpr, 3 * dpr]);
      c.beginPath();
      c.moveTo(0, centerY);
      c.lineTo(w, centerY);
      c.stroke();
      c.setLineDash([]);

      // Glow beam
      c.save();
      c.shadowColor = accentColor;
      c.shadowBlur = (active ? 10 : 4) * dpr;
      c.lineWidth = 2 * dpr;
      c.strokeStyle = secondaryColor;
      c.beginPath();

      for (let i = 0; i < 48; i++) {
        const v = (time[i] - 128) / 128; // -1 to 1
        const y = centerY + v * (h * 0.42);
        const x = i * sliceWidth;

        if (i === 0) {
          c.moveTo(x, y);
        } else {
          // Smooth curve using bezier midpoints
          c.lineTo(x, y);
        }
      }
      c.stroke();

      // Top Phosphor Core Line
      c.shadowBlur = 0;
      c.lineWidth = 1 * dpr;
      c.strokeStyle = '#ffffff';
      c.stroke();
      c.restore();
    };

    // Sub-renderer: Dual Stereo Peak VU Meter
    const renderPeak = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      freq: Uint8Array,
      dpr: number,
      active: boolean
    ) => {
      // Simulate Left and Right channels by separating lower and upper spectrum
      let leftSum = 0;
      let rightSum = 0;
      for (let i = 0; i < 20; i++) leftSum += freq[i];
      for (let i = 16; i < 36; i++) rightSum += freq[i];

      const leftLevel = active ? Math.min(1, (leftSum / 20 / 255) * 1.25) : 0.08;
      const rightLevel = active ? Math.min(1, (rightSum / 20 / 255) * 1.2) : 0.06;

      const channels = [
        { label: 'L', level: leftLevel, y: h * 0.28 },
        { label: 'R', level: rightLevel, y: h * 0.68 }
      ];

      const segmentCount = 14;
      const segWidth = (w - 24 * dpr) / segmentCount;
      const segHeight = 5 * dpr;

      channels.forEach((ch) => {
        // Label
        c.fillStyle = 'rgba(255, 255, 255, 0.4)';
        c.font = `bold ${8 * dpr}px monospace`;
        c.fillText(ch.label, 3 * dpr, ch.y + 4.5 * dpr);

        const activeSegments = Math.round(ch.level * segmentCount);

        for (let i = 0; i < segmentCount; i++) {
          const x = 14 * dpr + i * segWidth;
          const isLit = i < activeSegments;

          // Color gradient across meter: Cyan -> Purple -> Crimson peak
          let segColor = 'rgba(255, 255, 255, 0.08)';
          if (isLit) {
            if (i > segmentCount - 3) {
              segColor = '#f43f5e'; // Crimson clip
            } else if (i > segmentCount - 6) {
              segColor = '#ec4899'; // Hot pink
            } else if (i > segmentCount - 9) {
              segColor = accentColor; // Purple
            } else {
              segColor = secondaryColor; // Cyan
            }
          }

          c.fillStyle = segColor;
          c.fillRect(x, ch.y, segWidth - 1.5 * dpr, segHeight);

          if (isLit && i === segmentCount - 1) {
            // Peak flash
            c.save();
            c.shadowColor = '#f43f5e';
            c.shadowBlur = 8 * dpr;
            c.fillStyle = '#ff2056';
            c.fillRect(x, ch.y, segWidth - 1.5 * dpr, segHeight);
            c.restore();
          }
        }
      });
    };

    // Sub-renderer: Digital Matrix Equalizer Grid
    const renderMatrix = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      freq: Uint8Array,
      dpr: number,
      active: boolean
    ) => {
      const cols = 14;
      const rows = 6;
      const cellGap = 1.8 * dpr;
      const cellW = (w - (cols - 1) * cellGap - 6 * dpr) / cols;
      const cellH = (h - (rows - 1) * cellGap - 6 * dpr) / rows;

      for (let col = 0; col < cols; col++) {
        const binIndex = Math.min(63, Math.floor(col * 3.2));
        const intensity = active ? freq[binIndex] / 255 : 0.15;
        const litRows = Math.round(intensity * rows);

        for (let row = 0; row < rows; row++) {
          // Row 0 is at top, but higher intensity lights up from bottom (rows - 1)
          const fromBottom = rows - 1 - row;
          const isLit = fromBottom < litRows;

          const x = 3 * dpr + col * (cellW + cellGap);
          const y = 3 * dpr + row * (cellH + cellGap);

          if (isLit) {
            if (row === 0) {
              c.fillStyle = '#f43f5e'; // Top clip red
            } else if (row === 1) {
              c.fillStyle = '#ec4899'; // Pink
            } else {
              c.fillStyle = accentColor;
            }
          } else {
            c.fillStyle = 'rgba(255, 255, 255, 0.05)';
          }

          c.fillRect(x, y, cellW, cellH);
        }
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, vizMode, accentColor, secondaryColor]);

  const modeIcon =
    vizMode === 'bars' ? (
      <BarChart3 size={11} className="text-[var(--accent-primary)]" />
    ) : vizMode === 'wave' ? (
      <Waves size={11} className="text-cyan-400" />
    ) : vizMode === 'peak' ? (
      <Radio size={11} className="text-pink-400" />
    ) : (
      <Sparkles size={11} className="text-purple-300" />
    );

  const modeName =
    vizMode === 'bars' ? 'SPECTRUM' : vizMode === 'wave' ? 'OSCILLO' : vizMode === 'peak' ? 'VU-METER' : 'MATRIX';

  return (
    <div
      ref={containerRef}
      onClick={cycleMode}
      className={`relative group h-10 w-28 xl:w-32 shrink-0 rounded-xl bg-[#090714]/90 border border-white/10 hover:border-[var(--accent-primary)]/60 px-1 py-0.5 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] backdrop-blur-md ${className}`}
      title={`Visualizador de audio en tiempo real [Modo: ${modeName}]. Clic para alternar.`}
      role="button"
      aria-label={`Visualizador en tiempo real modo ${modeName}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycleMode();
        }
      }}
    >
      {/* Tactical Cyberpunk Corner Brackets */}
      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-white/25 pointer-events-none group-hover:border-[var(--accent-primary)] transition-colors" />
      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-white/25 pointer-events-none group-hover:border-[var(--accent-primary)] transition-colors" />
      <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-white/25 pointer-events-none group-hover:border-[var(--accent-primary)] transition-colors" />
      <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-white/25 pointer-events-none group-hover:border-[var(--accent-primary)] transition-colors" />

      {/* Top Micro-HUD status header */}
      <div className="w-full flex items-center justify-between px-1 pt-0.5 text-[8px] font-mono leading-none tracking-tight text-slate-400 pointer-events-none z-10">
        <div className="flex items-center gap-1">
          {modeIcon}
          <span className="font-bold text-white/90">{modeName}</span>
        </div>
        <div className="flex items-center gap-1">
          {isPlaying ? (
            <span className="text-[7.5px] font-semibold text-[var(--accent-primary)] animate-pulse">
              {liveDb}dB
            </span>
          ) : (
            <span className="text-[7px] text-slate-500 uppercase">STBY</span>
          )}
        </div>
      </div>

      {/* Real-time Web Audio Canvas */}
      <div className="w-full flex-1 relative min-h-[22px]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />
      </div>

      {/* Hover Expand Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 pointer-events-none z-20">
        <span className="text-[9px] font-mono text-white/90 font-bold bg-black/70 px-1.5 py-0.5 rounded border border-white/20">
          CAMBIAR
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenFullscreen) onOpenFullscreen();
            else setIsFullscreenPlayerOpen(true);
          }}
          className="pointer-events-auto p-1 rounded-md bg-[var(--accent-primary)]/80 hover:bg-[var(--accent-primary)] text-white shadow-sm transition-all"
          title="Ampliar visualizador a pantalla completa"
        >
          <Maximize2 size={10} />
        </button>
      </div>
    </div>
  );
};

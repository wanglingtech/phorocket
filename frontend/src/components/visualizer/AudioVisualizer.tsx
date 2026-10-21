import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { VisualizerMode } from '../../types/music';
import { D3CyberAudioVisualizer } from './D3CyberAudioVisualizer';

interface AudioVisualizerProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  className?: string;
  height?: number;
  sensitivity?: number;
  reducedMotion?: boolean;
}

// Internal Canvas-based visualizer for standard modes
const CanvasAudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mode,
  isPlaying,
  className = '',
  height = 120,
  sensitivity = 1.0,
  reducedMotion = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [accentColor, setAccentColor] = useState('#a855f7');
  const [secondaryColor, setSecondaryColor] = useState('#c084fc');

  // Sync with CSS variable
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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqData = new Uint8Array(64);
    const timeData = new Uint8Array(64);

    // Particle state for 'particles' mode
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas.width || 300),
      y: Math.random() * (canvas.height || 100),
      radius: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.7 + 0.3
    }));

    let idlePhase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (reducedMotion) {
        // Simple static level indicator
        ctx.fillStyle = accentColor;
        ctx.fillRect(width * 0.1, h * 0.48, width * 0.8, 3);
        return;
      }

      const hasAudio = isPlaying && audioEngine.getVisualizerData(freqData, timeData);

      // If no active real audio, create subtle ambient idle wave
      if (!hasAudio) {
        idlePhase += 0.03;
        for (let i = 0; i < 64; i++) {
          freqData[i] = Math.floor(Math.sin(idlePhase + i * 0.15) * 16 + 24);
          timeData[i] = Math.floor(Math.sin(idlePhase * 1.5 + i * 0.2) * 20 + 128);
        }
      }

      switch (mode) {
        case 'bars': {
          const barCount = 32;
          const barWidth = (width / barCount) * 0.7;
          const barGap = (width / barCount) * 0.3;

          for (let i = 0; i < barCount; i++) {
            const rawVal = freqData[i % freqData.length] || 0;
            const barHeight = Math.max(3, (rawVal / 255) * h * 0.88 * sensitivity);
            const x = i * (barWidth + barGap) + barGap / 2;
            const y = h - barHeight;

            // Bar gradient
            const grad = ctx.createLinearGradient(0, y, 0, h);
            grad.addColorStop(0, secondaryColor);
            grad.addColorStop(1, accentColor);

            ctx.fillStyle = grad;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Floating peak cap
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, Math.max(0, y - 3), barWidth, 1.5);
          }
          break;
        }

        case 'wave': {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = accentColor;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 10;

          const sliceWidth = width / timeData.length;
          let x = 0;

          for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * h) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.stroke();
          break;
        }

        case 'circle': {
          const centerX = width / 2;
          const centerY = h / 2;
          const baseRadius = Math.min(centerX, centerY) * 0.45;
          const points = 48;

          ctx.beginPath();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 12;

          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const val = freqData[i % freqData.length] / 255.0;
            const r = baseRadius + val * baseRadius * 0.75 * sensitivity;
            const px = centerX + Math.cos(angle) * r;
            const py = centerY + Math.sin(angle) * r;

            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.stroke();

          // Inner ring
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
        }

        case 'spectrum': {
          ctx.beginPath();
          const grad = ctx.createLinearGradient(0, 0, width, 0);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, secondaryColor);

          ctx.fillStyle = grad;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 14;

          ctx.moveTo(0, h);
          const step = width / (freqData.length - 1);
          for (let i = 0; i < freqData.length; i++) {
            const val = freqData[i] / 255.0;
            const y = h - val * h * 0.85 * sensitivity;
            ctx.lineTo(i * step, y);
          }
          ctx.lineTo(width, h);
          ctx.closePath();
          ctx.globalAlpha = 0.45;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.stroke();
          break;
        }

        case 'particles': {
          // Average bass energy
          const bassEnergy = ((freqData[0] + freqData[1] + freqData[2]) / 3 / 255) * sensitivity;

          particles.forEach((p) => {
            p.x += p.speedX * (1 + bassEnergy * 2);
            p.y += p.speedY * (1 + bassEnergy * 2);

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            const radius = p.radius + bassEnergy * 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.globalAlpha = Math.min(1, p.alpha + bassEnergy * 0.4);
            ctx.shadowColor = secondaryColor;
            ctx.shadowBlur = 8;
            ctx.fill();
          });
          ctx.globalAlpha = 1.0;
          break;
        }

        case 'minimal': {
          // Clean subtle horizontal line with dynamic center thickness
          const midEnergy = (freqData[8] / 255) * sensitivity;
          ctx.fillStyle = accentColor;
          ctx.fillRect(width * 0.15, h / 2 - 1, width * 0.7, 2);

          const pulseWidth = width * 0.4 * (0.3 + midEnergy * 0.7);
          ctx.fillStyle = secondaryColor;
          ctx.shadowColor = accentColor;
          ctx.shadowBlur = 10;
          ctx.fillRect((width - pulseWidth) / 2, h / 2 - 2, pulseWidth, 4);
          break;
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, isPlaying, sensitivity, reducedMotion, accentColor, secondaryColor]);

  // Handle ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = (height || rect.height) * (window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [height]);

  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        className="w-full block"
        aria-label="Visualizador reactivo de audio Phorocket"
      />
    </div>
  );
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = (props) => {
  if (props.mode === 'd3-cyberpunk' || props.mode === 'd3-radial-hud') {
    return (
      <D3CyberAudioVisualizer
        isPlaying={props.isPlaying}
        className={props.className}
        height={props.height}
        sensitivity={props.sensitivity}
        initialSubStyle={props.mode === 'd3-radial-hud' ? 'radar-hud' : 'spectral-ribbon'}
        showControls={(props.height || 120) > 160}
        interactive={(props.height || 120) > 160}
      />
    );
  }

  return <CanvasAudioVisualizer {...props} />;
};


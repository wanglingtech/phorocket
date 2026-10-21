import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Radio,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  Volume2,
  Zap,
  Cpu
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export type D3VisualizerSubStyle =
  | 'radar-hud'
  | 'spectral-ribbon'
  | 'constellation'
  | 'hex-matrix';

interface D3CyberAudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
  height?: number;
  sensitivity?: number;
  initialSubStyle?: D3VisualizerSubStyle;
  showControls?: boolean;
  interactive?: boolean;
  onStyleChange?: (style: D3VisualizerSubStyle) => void;
}

export const D3CyberAudioVisualizer: React.FC<D3CyberAudioVisualizerProps> = ({
  isPlaying,
  className = '',
  height = 260,
  sensitivity = 1.0,
  initialSubStyle = 'radar-hud',
  showControls = true,
  interactive = true,
  onStyleChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [subStyle, setSubStyle] = useState<D3VisualizerSubStyle>(initialSubStyle);
  const [currentSensitivity, setCurrentSensitivity] = useState(sensitivity);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);

  // Audio metrics for cyberpunk HUD readout
  const [metrics, setMetrics] = useState({
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    peakDb: -60,
    beatDetected: false
  });

  const [themeColors, setThemeColors] = useState({
    primary: '#a855f7',
    secondary: '#00e5ff',
    glow: 'rgba(168, 85, 247, 0.4)'
  });

  // Track subStyle prop changes
  useEffect(() => {
    if (initialSubStyle) {
      setSubStyle(initialSubStyle);
    }
  }, [initialSubStyle]);

  // Sync colors from document root CSS variables
  useEffect(() => {
    const updateColors = () => {
      const computed = getComputedStyle(document.documentElement);
      const prim = computed.getPropertyValue('--accent-primary').trim() || '#a855f7';
      const sec = computed.getPropertyValue('--accent-secondary').trim() || '#00e5ff';
      const glw = computed.getPropertyValue('--accent-glow').trim() || 'rgba(168, 85, 247, 0.4)';
      setThemeColors({ primary: prim, secondary: sec, glow: glw });
    };

    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });
    return () => observer.disconnect();
  }, []);

  const handleSubStyleChange = (s: D3VisualizerSubStyle) => {
    setSubStyle(s);
    if (onStyleChange) onStyleChange(s);
  };

  // Main D3 Rendering Loop
  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const svg = d3.select(svgEl);

    // Audio frequency buffers
    const bufferLength = 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    let idlePhase = 0;
    let rotationAngle = 0;
    let beatCooldown = 0;
    let shockwaveRadius = 0;
    let shockwaveOpacity = 0;

    // Constellation particle node coordinates
    const particleCount = 48;
    const particles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      baseRadius: Math.random() * 2.5 + 1.2,
      angle: (i / particleCount) * Math.PI * 2,
      distRatio: 0.25 + (i % 5) * 0.14,
      speed: (Math.random() * 0.008 + 0.003) * (i % 2 === 0 ? 1 : -1)
    }));

    const render = () => {
      const width = container.clientWidth || 600;
      const h = isFullscreen ? window.innerHeight - 80 : height;

      svg.attr('width', width).attr('height', h);

      const cx = width / 2;
      const cy = h / 2;
      const maxRadius = Math.min(cx, cy) * 0.88;

      const hasAudio = isPlaying && audioEngine.getVisualizerData(freqData, timeData);

      // Procedural synthetic audio fallback for idle aesthetic
      if (!hasAudio) {
        idlePhase += 0.025;
        for (let i = 0; i < bufferLength; i++) {
          const wave1 = Math.sin(idlePhase * 1.2 + i * 0.12) * 28;
          const wave2 = Math.cos(idlePhase * 0.8 + i * 0.08) * 16;
          freqData[i] = Math.max(0, Math.min(255, Math.floor(wave1 + wave2 + 35)));
          timeData[i] = Math.floor(Math.sin(idlePhase * 1.5 + i * 0.15) * 35 + 128);
        }
      }

      // Compute acoustic metrics
      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;
      let peak = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = freqData[i];
        if (val > peak) peak = val;
        if (i < 16) bassSum += val;
        else if (i < 64) midSum += val;
        else trebleSum += val;
      }

      const bassAvg = bassSum / 16 / 255;
      const midAvg = midSum / 48 / 255;
      const trebleAvg = trebleSum / 64 / 255;
      const peakDbValue = peak > 0 ? Math.round(20 * Math.log10(peak / 255)) : -60;

      // Beat detection trigger
      let beatTriggered = false;
      if (bassAvg > 0.65 && beatCooldown <= 0) {
        beatTriggered = true;
        beatCooldown = 14;
        shockwaveRadius = maxRadius * 0.25;
        shockwaveOpacity = 0.9;
      }
      if (beatCooldown > 0) beatCooldown--;

      if (shockwaveOpacity > 0.02) {
        shockwaveRadius += 3.5 * currentSensitivity;
        shockwaveOpacity *= 0.91;
      } else {
        shockwaveOpacity = 0;
      }

      // Periodically update HUD state (throttled)
      if (Math.random() < 0.15) {
        setMetrics({
          bassLevel: Math.round(bassAvg * 100),
          midLevel: Math.round(midAvg * 100),
          trebleLevel: Math.round(trebleAvg * 100),
          peakDb: peakDbValue,
          beatDetected: beatTriggered
        });
      }

      rotationAngle += 0.008 + bassAvg * 0.015;

      // Clear dynamic SVG group
      let g = svg.select<SVGGElement>('g.visualizer-root');
      if (g.empty()) {
        g = svg.append('g').attr('class', 'visualizer-root');
      }
      g.selectAll('*').remove();

      // Ensure defs for filters and gradients
      let defs = svg.select<SVGDefsElement>('defs');
      if (defs.empty()) {
        defs = svg.append('defs');
      }
      defs.selectAll('*').remove();

      // Neon Glow Filter
      const filter = defs
        .append('filter')
        .attr('id', 'cyber-neon-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      // Gradients
      const linearGrad = defs
        .append('linearGradient')
        .attr('id', 'cyber-linear-grad')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
      linearGrad.append('stop').attr('offset', '0%').attr('stop-color', themeColors.primary).attr('stop-opacity', '0.1');
      linearGrad.append('stop').attr('offset', '70%').attr('stop-color', themeColors.secondary).attr('stop-opacity', '0.6');
      linearGrad.append('stop').attr('offset', '100%').attr('stop-color', '#ffffff').attr('stop-opacity', '0.95');

      const radialGrad = defs
        .append('radialGradient')
        .attr('id', 'cyber-radial-grad')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      radialGrad.append('stop').attr('offset', '0%').attr('stop-color', themeColors.primary).attr('stop-opacity', '0.45');
      radialGrad.append('stop').attr('offset', '60%').attr('stop-color', themeColors.secondary).attr('stop-opacity', '0.2');
      radialGrad.append('stop').attr('offset', '100%').attr('stop-color', 'transparent').attr('stop-opacity', '0');

      // Draw background cyber glow circle at center
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', maxRadius * (0.6 + bassAvg * 0.25))
        .attr('fill', 'url(#cyber-radial-grad)');

      // Draw Shockwave if active
      if (shockwaveOpacity > 0.05) {
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', shockwaveRadius)
          .attr('fill', 'none')
          .attr('stroke', themeColors.secondary)
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', shockwaveOpacity)
          .attr('filter', 'url(#cyber-neon-glow)');
      }

      // ==========================================
      // STYLE 1: RADAR HUD (Cyberpunk Polar Analyzer)
      // ==========================================
      if (subStyle === 'radar-hud') {
        // Radar range rings
        const ringSteps = [0.25, 0.5, 0.75, 1.0];
        ringSteps.forEach((step, idx) => {
          const r = maxRadius * step;
          g.append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', r)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.08)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', idx === 3 ? '4 4' : '2 6');

          // Ring labels
          if (width > 360) {
            g.append('text')
              .attr('x', cx + r + 4)
              .attr('y', cy - 4)
              .attr('fill', 'rgba(255, 255, 255, 0.35)')
              .attr('font-size', '8px')
              .attr('font-family', 'monospace')
              .text(`${Math.round(step * 100)}%`);
          }
        });

        // Crosshairs / Axis Lines
        g.append('line')
          .attr('x1', cx - maxRadius * 1.05)
          .attr('y1', cy)
          .attr('x2', cx + maxRadius * 1.05)
          .attr('y2', cy)
          .attr('stroke', 'rgba(255, 255, 255, 0.12)')
          .attr('stroke-dasharray', '3 3');

        g.append('line')
          .attr('x1', cx)
          .attr('y1', cy - maxRadius * 1.05)
          .attr('x2', cx)
          .attr('y2', cy + maxRadius * 1.05)
          .attr('stroke', 'rgba(255, 255, 255, 0.12)')
          .attr('stroke-dasharray', '3 3');

        // Rotating azimuth sweep laser
        const sweepLength = maxRadius * 1.02;
        const sweepX = cx + Math.cos(rotationAngle) * sweepLength;
        const sweepY = cy + Math.sin(rotationAngle) * sweepLength;

        g.append('line')
          .attr('x1', cx)
          .attr('y1', cy)
          .attr('x2', sweepX)
          .attr('y2', sweepY)
          .attr('stroke', themeColors.secondary)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.8)
          .attr('filter', 'url(#cyber-neon-glow)');

        // Sweep cone arc
        const arcGen = d3
          .arc()
          .innerRadius(0)
          .outerRadius(maxRadius)
          .startAngle(rotationAngle - 0.45)
          .endAngle(rotationAngle);

        g.append('path')
          .attr('transform', `translate(${cx}, ${cy})`)
          .attr('d', arcGen as any)
          .attr('fill', themeColors.secondary)
          .attr('fill-opacity', 0.08);

        // Radial frequency bars (64 sectors)
        const barCount = 64;
        const innerR = maxRadius * 0.32;
        const angleStep = (Math.PI * 2) / barCount;

        for (let i = 0; i < barCount; i++) {
          const val = freqData[i % bufferLength] || 0;
          const normalized = (val / 255) * currentSensitivity;
          const barHeight = Math.max(3, normalized * (maxRadius - innerR) * 0.95);

          const barAngle = i * angleStep;
          const x1 = cx + Math.cos(barAngle) * innerR;
          const y1 = cy + Math.sin(barAngle) * innerR;
          const x2 = cx + Math.cos(barAngle) * (innerR + barHeight);
          const y2 = cy + Math.sin(barAngle) * (innerR + barHeight);

          // Color interpolate based on frequency
          const strokeColor = i < 16 ? themeColors.primary : i < 40 ? themeColors.secondary : '#ec4899';

          g.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', strokeColor)
            .attr('stroke-width', Math.max(1.8, (maxRadius / barCount) * 1.1))
            .attr('stroke-linecap', 'round')
            .attr('stroke-opacity', 0.85 + normalized * 0.15)
            .attr('filter', normalized > 0.6 ? 'url(#cyber-neon-glow)' : null);

          // Floating neon cap tip
          if (normalized > 0.35) {
            const tipX = cx + Math.cos(barAngle) * (innerR + barHeight + 3);
            const tipY = cy + Math.sin(barAngle) * (innerR + barHeight + 3);
            g.append('circle')
              .attr('cx', tipX)
              .attr('cy', tipY)
              .attr('r', 1.8)
              .attr('fill', '#ffffff')
              .attr('opacity', 0.9);
          }
        }

        // Center Cyber Reticle
        const coreR = maxRadius * 0.22 * (1 + bassAvg * 0.2);
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', coreR)
          .attr('fill', 'rgba(12, 10, 24, 0.9)')
          .attr('stroke', themeColors.primary)
          .attr('stroke-width', 2)
          .attr('filter', 'url(#cyber-neon-glow)');

        // Inner spinning reticle ticks
        const tickCount = 8;
        for (let t = 0; t < tickCount; t++) {
          const a = -rotationAngle * 1.5 + (t * Math.PI * 2) / tickCount;
          g.append('line')
            .attr('x1', cx + Math.cos(a) * (coreR - 6))
            .attr('y1', cy + Math.sin(a) * (coreR - 6))
            .attr('x2', cx + Math.cos(a) * coreR)
            .attr('y2', cy + Math.sin(a) * coreR)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);
        }

        // Core central pulse dot
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 4.5 + bassAvg * 6)
          .attr('fill', themeColors.secondary)
          .attr('filter', 'url(#cyber-neon-glow)');
      }

      // ==========================================
      // STYLE 2: SPECTRAL NEON RIBBON (Fluid D3 Curves)
      // ==========================================
      else if (subStyle === 'spectral-ribbon') {
        const sliceCount = 64;
        const sliceWidth = width / (sliceCount - 1);

        // Grid lines horizontal
        const hLines = [0.25, 0.5, 0.75];
        hLines.forEach((pos) => {
          g.append('line')
            .attr('x1', 10)
            .attr('y1', h * pos)
            .attr('x2', width - 10)
            .attr('y2', h * pos)
            .attr('stroke', 'rgba(255, 255, 255, 0.06)')
            .attr('stroke-dasharray', '4 4');
        });

        // Compute points for upper and lower mirrored ribbons
        const upperPoints: [number, number][] = [];
        const lowerPoints: [number, number][] = [];
        const harmonicPoints: [number, number][] = [];

        for (let i = 0; i < sliceCount; i++) {
          const x = i * sliceWidth;
          const freqVal = (freqData[i % bufferLength] / 255) * currentSensitivity;
          const timeVal = (timeData[i % bufferLength] - 128) / 128;

          // Upper waveform
          const yUp = cy - (freqVal * (h * 0.42) + timeVal * 15);
          upperPoints.push([x, Math.max(12, yUp)]);

          // Lower waveform (mirrored with slight harmonic shift)
          const yDown = cy + (freqVal * (h * 0.42) - timeVal * 15);
          lowerPoints.push([x, Math.min(h - 12, yDown)]);

          // High frequency harmonic ribbon
          const yHarm = cy - (Math.sin(i * 0.4 + idlePhase * 2) * trebleAvg * (h * 0.25));
          harmonicPoints.push([x, yHarm]);
        }

        const lineGenerator = d3
          .line<[number, number]>()
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3.curveBasis);

        // Area fill between waveforms
        const areaGenerator = d3
          .area<[number, number]>()
          .x((d) => d[0])
          .y0(cy)
          .y1((d) => d[1])
          .curve(d3.curveBasis);

        // Top Area
        g.append('path')
          .datum(upperPoints)
          .attr('d', areaGenerator as any)
          .attr('fill', 'url(#cyber-linear-grad)')
          .attr('opacity', 0.6);

        // Bottom Area
        const areaBottom = d3
          .area<[number, number]>()
          .x((d) => d[0])
          .y0(cy)
          .y1((d) => d[1])
          .curve(d3.curveBasis);

        g.append('path')
          .datum(lowerPoints)
          .attr('d', areaBottom as any)
          .attr('fill', themeColors.primary)
          .attr('opacity', 0.25);

        // Harmonic secondary wave
        g.append('path')
          .datum(harmonicPoints)
          .attr('d', lineGenerator as any)
          .attr('fill', 'none')
          .attr('stroke', '#f43f5e')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-dasharray', '6 3');

        // Main upper neon stroke
        g.append('path')
          .datum(upperPoints)
          .attr('d', lineGenerator as any)
          .attr('fill', 'none')
          .attr('stroke', themeColors.secondary)
          .attr('stroke-width', 2.8)
          .attr('filter', 'url(#cyber-neon-glow)');

        // Main lower neon stroke
        g.append('path')
          .datum(lowerPoints)
          .attr('d', lineGenerator as any)
          .attr('fill', 'none')
          .attr('stroke', themeColors.primary)
          .attr('stroke-width', 2.2)
          .attr('filter', 'url(#cyber-neon-glow)');

        // Center equilibrium laser line
        g.append('line')
          .attr('x1', 0)
          .attr('y1', cy)
          .attr('x2', width)
          .attr('y2', cy)
          .attr('stroke', 'rgba(255, 255, 255, 0.25)')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '2 4');

        // Peak tracking nodes on high spikes
        upperPoints.forEach(([px, py], idx) => {
          if (idx % 6 === 0) {
            g.append('circle')
              .attr('cx', px)
              .attr('cy', py)
              .attr('r', 2.5)
              .attr('fill', '#ffffff')
              .attr('stroke', themeColors.secondary)
              .attr('stroke-width', 1.5);
          }
        });
      }

      // ==========================================
      // STYLE 3: CONSTELLATION WARP (D3 Node Web)
      // ==========================================
      else if (subStyle === 'constellation') {
        const activeNodes: { x: number; y: number; r: number; val: number; id: number }[] = [];

        particles.forEach((p, idx) => {
          p.angle += p.speed * (1 + bassAvg * 1.5);
          const binVal = (freqData[(idx * 2) % bufferLength] / 255) * currentSensitivity;
          const dynamicDist = maxRadius * (p.distRatio + binVal * 0.35);

          const px = cx + Math.cos(p.angle) * dynamicDist;
          const py = cy + Math.sin(p.angle) * dynamicDist;
          const pr = p.baseRadius * (1 + binVal * 2.2);

          activeNodes.push({ x: px, y: py, r: pr, val: binVal, id: idx });
        });

        // Draw dynamic links between nearby nodes using D3 distance calculation
        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const n1 = activeNodes[i];
            const n2 = activeNodes[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const maxLinkDist = maxRadius * 0.45;
            if (dist < maxLinkDist) {
              const linkOpacity = (1 - dist / maxLinkDist) * (0.2 + (n1.val + n2.val) * 0.4);
              g.append('line')
                .attr('x1', n1.x)
                .attr('y1', n1.y)
                .attr('x2', n2.x)
                .attr('y2', n2.y)
                .attr('stroke', n1.val > 0.5 ? themeColors.secondary : themeColors.primary)
                .attr('stroke-width', Math.max(0.6, 2 * linkOpacity))
                .attr('stroke-opacity', linkOpacity);
            }
          }
        }

        // Draw particle nodes
        activeNodes.forEach((node) => {
          g.append('circle')
            .attr('cx', node.x)
            .attr('cy', node.y)
            .attr('r', node.r)
            .attr('fill', node.val > 0.6 ? '#ffffff' : themeColors.secondary)
            .attr('stroke', themeColors.primary)
            .attr('stroke-width', 1.2)
            .attr('filter', node.val > 0.4 ? 'url(#cyber-neon-glow)' : null);
        });

        // Central gravitational anchor
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 12 + bassAvg * 16)
          .attr('fill', themeColors.primary)
          .attr('fill-opacity', 0.25)
          .attr('stroke', themeColors.secondary)
          .attr('stroke-width', 2)
          .attr('filter', 'url(#cyber-neon-glow)');
      }

      // ==========================================
      // STYLE 4: HEXAGONAL CYBER MATRIX
      // ==========================================
      else if (subStyle === 'hex-matrix') {
        const hexRadius = Math.max(14, Math.min(26, width / 28));
        const hexHeight = hexRadius * Math.sqrt(3);
        const cols = Math.floor(width / (hexRadius * 1.6)) - 1;
        const rows = Math.floor(h / hexHeight) - 1;

        const startX = (width - cols * hexRadius * 1.5) / 2;
        const startY = (h - rows * hexHeight) / 2;

        const generateHexPath = (centerX: number, centerY: number, r: number) => {
          let points: string[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = centerX + r * Math.cos(angle);
            const hy = centerY + r * Math.sin(angle);
            points.push(`${hx},${hy}`);
          }
          return `M ${points.join(' L ')} Z`;
        };

        let cellIndex = 0;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            cellIndex++;
            const xOffset = c * hexRadius * 1.5 + startX;
            const yOffset = r * hexHeight + (c % 2 === 1 ? hexHeight / 2 : 0) + startY;

            // Distance from center determines audio frequency mapping
            const distFromCenter = Math.sqrt((xOffset - cx) ** 2 + (yOffset - cy) ** 2);
            const normDist = Math.min(1, distFromCenter / (maxRadius * 1.1));
            const binIndex = Math.floor(normDist * (bufferLength - 1));

            const rawVal = freqData[binIndex] || 0;
            const energy = (rawVal / 255) * currentSensitivity;

            const scale = Math.max(0.4, 0.75 + energy * 0.45);
            const currentR = hexRadius * 0.85 * scale;

            const isHighEnergy = energy > 0.55;
            const fillColor = isHighEnergy
              ? themeColors.secondary
              : energy > 0.25
              ? themeColors.primary
              : 'rgba(255, 255, 255, 0.04)';
            const fillOpacity = energy > 0.1 ? Math.min(0.95, energy * 1.2) : 0.06;

            g.append('path')
              .attr('d', generateHexPath(xOffset, yOffset, currentR))
              .attr('fill', fillColor)
              .attr('fill-opacity', fillOpacity)
              .attr('stroke', isHighEnergy ? '#ffffff' : 'rgba(255, 255, 255, 0.12)')
              .attr('stroke-width', isHighEnergy ? 1.5 : 0.8)
              .attr('filter', isHighEnergy ? 'url(#cyber-neon-glow)' : null);
          }
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
  }, [subStyle, currentSensitivity, isPlaying, isFullscreen, height, themeColors]);

  const subStyles: { id: D3VisualizerSubStyle; label: string; icon: React.ReactNode }[] = [
    { id: 'radar-hud', label: 'Radar Polar HUD', icon: <Radio size={14} /> },
    { id: 'spectral-ribbon', label: 'Cintas Espectrales D3', icon: <Activity size={14} /> },
    { id: 'constellation', label: 'Red Cuántica', icon: <Sparkles size={14} /> },
    { id: 'hex-matrix', label: 'Matriz Hexagonal', icon: <Layers size={14} /> }
  ];

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden bg-[#070511] border border-white/10 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 p-6 flex flex-col justify-between' : ''
      } ${className}`}
      style={{
        boxShadow: `0 0 35px -8px ${themeColors.glow}`
      }}
    >
      {/* Top Cyberpunk Telemetry HUD Header */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 bg-[#0a0818]/90 border-b border-white/10 backdrop-blur-md z-10 select-none">
          {/* SubStyle Switcher */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            {subStyles.map((s) => {
              const active = subStyle === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSubStyleChange(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[var(--accent-primary)] text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  style={
                    active
                      ? {
                          boxShadow: `0 0 14px ${themeColors.glow}`
                        }
                      : undefined
                  }
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick HUD Metrics & Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Peak & Energy Badges */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                BASS: {metrics.bassLevel}%
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                PEAK: {metrics.peakDb} dB
              </span>
            </div>

            {/* Sensitivity Slider */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
              <Sliders size={12} className="text-slate-400" />
              <span className="text-[10px] font-mono text-slate-300">
                {currentSensitivity.toFixed(1)}x
              </span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={currentSensitivity}
                onChange={(e) => setCurrentSensitivity(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/20 accent-[var(--accent-primary)] rounded-full cursor-pointer"
                title="Sensibilidad del analizador DSP"
              />
            </div>

            {/* Fullscreen Button */}
            {interactive && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* SVG Canvas for D3 */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full block"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : `${height}px` }}
        />

        {/* Ambient Corner HUD Markers */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-white/30 pointer-events-none flex flex-col">
          <span>SYS.DSP::D3_SVG_ENGINE</span>
          <span>SR: 44.1kHz | FFT: 128</span>
        </div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/30 pointer-events-none flex flex-col items-end">
          <span>CYBER_ANALYZER_V2</span>
          <span>LATENCY: &lt;4ms</span>
        </div>

        {/* Beat Pulse Indicator */}
        {metrics.beatDetected && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono text-rose-300 font-bold animate-ping pointer-events-none">
            BEAT PULSE
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#080614]/80 border-t border-white/5 text-[10px] font-mono text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[var(--accent-primary)]">
              <Zap size={11} />
              <span>D3 IMMERSIVE DSP</span>
            </span>
            <span className="hidden sm:inline">MOTOR VECTORIAL ESCALABLE</span>
          </div>

          <div className="flex items-center gap-3">
            <span>MID: {metrics.midLevel}%</span>
            <span>HIGH: {metrics.trebleLevel}%</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'
              }`}
              title={isPlaying ? 'Audio activo' : 'Audio en pausa'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

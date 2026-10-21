import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { useMusic } from '../../context/MusicContext';
import { AmbientEffectType } from '../../types/music';

interface ThunderBackgroundProps {
  className?: string;
  intensityMultiplier?: number;
}

interface LightningBolt {
  segments: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[];
  branches: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[];
  life: number;
  maxLife: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  thickness: number;
}

interface RainRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swingAngle: number;
  swingSpeed: number;
  alpha: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
}

const MATRIX_CHARS = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || hex === 'currentColor') return `rgba(0, 240, 255, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 240, 255, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ThunderBackground: React.FC<ThunderBackgroundProps> = ({
  className = '',
  intensityMultiplier = 1
}) => {
  const { isPlaying, thunderConfig, lowResourceMode } = useMusic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // References for effects
  const boltsRef = useRef<LightningBolt[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const rainDropsRef = useRef<RainDrop[]>([]);
  const rainRipplesRef = useRef<RainRipple[]>([]);
  const snowFlakesRef = useRef<Snowflake[]>([]);
  const embersRef = useRef<Ember[]>([]);
  const matrixColsRef = useRef<MatrixColumn[]>([]);

  const flashAlphaRef = useRef<number>(0);
  const lastStrikeTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // If disabled or in Low Resource Mode, halt processing immediately and free GPU/CPU
    if (!thunderConfig.enabled || lowResourceMode) {
      ctx.clearRect(0, 0, width, height);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
      };
    }

    const activeType: AmbientEffectType = thunderConfig.type || 'rain';
    const activeColor = thunderConfig.color || '#00f0ff';
    const intensity = (thunderConfig.intensity || 1.0) * intensityMultiplier;
    const glow = thunderConfig.glow || 1.2;

    // Initialize particle systems
    const initParticles = () => {
      // Rain
      const dropCount = Math.floor(80 * intensity);
      rainDropsRef.current = Array.from({ length: dropCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 14 + Math.random() * 20,
        speed: 12 + Math.random() * 14,
        alpha: 0.35 + Math.random() * 0.45,
        thickness: 0.8 + Math.random() * 1.2
      }));
      rainRipplesRef.current = [];

      // Snow
      const snowCount = Math.floor(65 * intensity);
      snowFlakesRef.current = Array.from({ length: snowCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2.8,
        speedY: 0.8 + Math.random() * 1.8,
        speedX: (Math.random() - 0.5) * 0.6,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: 0.02 + Math.random() * 0.03,
        alpha: 0.4 + Math.random() * 0.5
      }));

      // Embers
      const emberCount = Math.floor(45 * intensity);
      embersRef.current = Array.from({ length: emberCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.2 - Math.random() * 2.2,
        size: 1.5 + Math.random() * 3,
        alpha: 0.4 + Math.random() * 0.5,
        maxLife: 60 + Math.random() * 70,
        life: Math.random() * 80
      }));

      // Matrix
      const colSpacing = 28;
      const totalCols = Math.ceil(width / colSpacing);
      matrixColsRef.current = Array.from({ length: totalCols }, (_, i) => {
        const len = Math.floor(8 + Math.random() * 16);
        return {
          x: i * colSpacing + 6,
          y: Math.random() * -height,
          speed: 2.5 + Math.random() * 4,
          length: len,
          chars: Array.from({ length: len }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)])
        };
      });
    };

    initParticles();

    // Recursive lightning branch generator
    const generateBolt = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displacement: number,
      depth: number,
      maxDepth: number,
      color: string,
      segments: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[],
      branches: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[]
    ) => {
      if (depth >= maxDepth) {
        segments.push({
          x1,
          y1,
          x2,
          y2,
          alpha: 1,
          width: Math.max(1.2, (maxDepth - depth + 1) * 1.5)
        });
        return;
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

      generateBolt(x1, y1, midX, midY, displacement * 0.55, depth + 1, maxDepth, color, segments, branches);
      generateBolt(midX, midY, x2, y2, displacement * 0.55, depth + 1, maxDepth, color, segments, branches);

      if (Math.random() < 0.45 && depth < maxDepth - 1) {
        const branchLength = (Math.random() * 80 + 30) * (depth / maxDepth + 0.5);
        const branchAngle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.4;
        const bx2 = midX + Math.cos(branchAngle) * branchLength;
        const by2 = midY + Math.sin(branchAngle) * branchLength;

        branches.push({
          x1: midX,
          y1: midY,
          x2: bx2,
          y2: by2,
          alpha: 0.8,
          width: Math.max(0.8, (maxDepth - depth) * 0.8)
        });

        if (Math.random() < 0.6) {
          sparksRef.current.push({
            x: midX,
            y: midY,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 1,
            maxLife: 20 + Math.random() * 20,
            size: Math.random() * 2.5 + 1,
            color
          });
        }
      }
    };

    const triggerStrike = (boost = 1) => {
      const now = performance.now();
      lastStrikeTimeRef.current = now;

      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.15);
      const endX = startX + (Math.random() - 0.5) * (width * 0.7);
      const endY = height * (0.6 + Math.random() * 0.4);

      const segments: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[] = [];
      const branches: { x1: number; y1: number; x2: number; y2: number; alpha: number; width: number }[] = [];

      generateBolt(
        startX,
        startY,
        endX,
        endY,
        Math.min(width, height) * 0.28,
        0,
        5,
        activeColor,
        segments,
        branches
      );

      const boltLife = Math.floor(14 + Math.random() * 12);
      boltsRef.current.push({
        segments,
        branches,
        life: boltLife,
        maxLife: boltLife,
        color: activeColor
      });

      flashAlphaRef.current = Math.min(0.35, 0.18 * intensity * boost);

      for (let i = 0; i < 18; i++) {
        sparksRef.current.push({
          x: endX + (Math.random() - 0.5) * 20,
          y: endY,
          vx: (Math.random() - 0.5) * 8,
          vy: -Math.random() * 7 - 1,
          life: 1,
          maxLife: 25 + Math.random() * 25,
          size: Math.random() * 3 + 1,
          color: activeColor
        });
      }
    };

    let prevBassAvg = 0;
    let audioEnergy = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark radial cyberpunk background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.35,
        50,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, 'rgba(18, 12, 35, 0.4)');
      bgGrad.addColorStop(0.7, 'rgba(8, 6, 16, 0.7)');
      bgGrad.addColorStop(1, 'rgba(4, 3, 9, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Audio analysis
      if (isPlaying && thunderConfig.enabled) {
        const freqArray = new Uint8Array(64);
        const timeArray = new Uint8Array(64);
        const hasAudioData = audioEngine.getVisualizerData(freqArray, timeArray);

        if (hasAudioData) {
          const bassBins = Array.from(freqArray.slice(0, 10));
          const bassAvg = bassBins.reduce((a: number, b: number) => a + b, 0) / (bassBins.length || 1);
          audioEnergy = bassAvg / 255;

          const threshold = 175;
          const isSpike = bassAvg > threshold && bassAvg - prevBassAvg > 18;
          const timeSinceLastStrike = performance.now() - lastStrikeTimeRef.current;

          if (activeType === 'thunder' || activeType === 'rain') {
            if ((isSpike && timeSinceLastStrike > 400) || (bassAvg > 215 && timeSinceLastStrike > 750)) {
              triggerStrike(bassAvg / 200);
            } else if (timeSinceLastStrike > 2600 && Math.random() < 0.04) {
              triggerStrike(0.8);
            }
          }
          prevBassAvg = bassAvg;
        } else {
          audioEnergy = 0.3;
          const timeSinceLastStrike = performance.now() - lastStrikeTimeRef.current;
          if (timeSinceLastStrike > 2000 && Math.random() < 0.05) {
            triggerStrike(1);
          }
        }
      } else {
        audioEnergy = 0.1;
      }

      // If ambient is disabled, just draw background
      if (!thunderConfig.enabled) {
        animationFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      // ============================================
      // 1. LLUVIA (RAIN)
      // ============================================
      if (activeType === 'rain') {
        ctx.save();
        ctx.strokeStyle = activeColor;
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 6 * glow;
        ctx.lineCap = 'round';

        const slant = 3.5;
        const currentDrops = rainDropsRef.current;

        for (let i = 0; i < currentDrops.length; i++) {
          const d = currentDrops[i];
          ctx.beginPath();
          ctx.globalAlpha = d.alpha * (0.6 + audioEnergy * 0.4);
          ctx.lineWidth = d.thickness * intensity;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + slant, d.y + d.len);
          ctx.stroke();

          // Advance
          d.y += d.speed * (1 + audioEnergy * 0.35);
          d.x += slant * 0.6;

          // When hit bottom, create splash ripple
          if (d.y > height - 10) {
            if (rainRipplesRef.current.length < 35 && Math.random() < 0.4) {
              rainRipplesRef.current.push({
                x: d.x,
                y: height - Math.random() * 12,
                radius: 1,
                maxRadius: 10 + Math.random() * 12,
                alpha: 0.6
              });
            }
            d.y = -d.len - Math.random() * 40;
            d.x = Math.random() * width;
          }
          if (d.x > width) {
            d.x = 0;
          }
        }

        // Render ripples
        for (let r = rainRipplesRef.current.length - 1; r >= 0; r--) {
          const rp = rainRipplesRef.current[r];
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.radius * 2, rp.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.globalAlpha = rp.alpha;
          ctx.lineWidth = 1;
          ctx.stroke();

          rp.radius += 0.8;
          rp.alpha -= 0.04;
          if (rp.alpha <= 0 || rp.radius >= rp.maxRadius) {
            rainRipplesRef.current.splice(r, 1);
          }
        }
        ctx.restore();
      }

      // ============================================
      // 2. ESTÁTICA (TV NOISE / SCANLINES)
      // ============================================
      if (activeType === 'static') {
        ctx.save();
        // TV noise speckles
        const noiseCount = Math.floor(180 * intensity * (1 + audioEnergy * 0.6));
        for (let i = 0; i < noiseCount; i++) {
          const nx = Math.random() * width;
          const ny = Math.random() * height;
          const nsize = Math.random() * 2.5 + 1;
          const isWhite = Math.random() > 0.45;
          ctx.fillStyle = isWhite ? '#ffffff' : activeColor;
          ctx.globalAlpha = Math.random() * 0.35 + (audioEnergy * 0.15);
          ctx.fillRect(nx, ny, nsize, nsize);
        }

        // Horizontal scanlines
        const scanlineGap = 6;
        ctx.fillStyle = hexToRgba(activeColor, 0.04 + audioEnergy * 0.04);
        for (let y = 0; y < height; y += scanlineGap) {
          ctx.fillRect(0, y, width, 1.5);
        }

        // Intermittent glitch band
        if (Math.random() < 0.25 || audioEnergy > 0.6) {
          const bandY = Math.random() * height;
          const bandHeight = Math.random() * 18 + 4;
          ctx.fillStyle = hexToRgba(activeColor, 0.12 * intensity);
          ctx.fillRect(0, bandY, width, bandHeight);
        }
        ctx.restore();
      }

      // ============================================
      // 3. NIEVE (SNOW)
      // ============================================
      if (activeType === 'snow') {
        ctx.save();
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 10 * glow;

        for (let i = 0; i < snowFlakesRef.current.length; i++) {
          const sf = snowFlakesRef.current[i];
          sf.swingAngle += sf.swingSpeed;
          sf.x += sf.speedX + Math.sin(sf.swingAngle) * 0.8;
          sf.y += sf.speedY * (1 + audioEnergy * 0.5);

          if (sf.y > height) {
            sf.y = -sf.radius * 2;
            sf.x = Math.random() * width;
          }
          if (sf.x < 0) sf.x = width;
          if (sf.x > width) sf.x = 0;

          // Radial snowflake glow
          const grad = ctx.createRadialGradient(sf.x, sf.y, 0, sf.x, sf.y, sf.radius * 2);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, activeColor);
          grad.addColorStop(1, hexToRgba(activeColor, 0));

          ctx.fillStyle = grad;
          ctx.globalAlpha = sf.alpha * (0.7 + audioEnergy * 0.3);
          ctx.beginPath();
          ctx.arc(sf.x, sf.y, sf.radius * (1 + audioEnergy * 0.25), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ============================================
      // 4. CENIZAS DE NEÓN (CYBER EMBERS)
      // ============================================
      if (activeType === 'embers') {
        ctx.save();
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 14 * glow;

        for (let i = 0; i < embersRef.current.length; i++) {
          const em = embersRef.current[i];
          em.x += em.vx + (Math.random() - 0.5) * 0.5;
          em.y += em.vy * (1 + audioEnergy * 0.7);
          em.life += 1;

          if (em.life > em.maxLife || em.y < -10) {
            em.x = Math.random() * width;
            em.y = height + 10;
            em.life = 0;
            em.vx = (Math.random() - 0.5) * 2;
            em.vy = -1.5 - Math.random() * 2.5;
          }

          const progress = 1 - em.life / em.maxLife;
          ctx.beginPath();
          ctx.arc(em.x, em.y, em.size * (0.8 + audioEnergy * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = Math.random() > 0.4 ? '#ffffff' : activeColor;
          ctx.globalAlpha = em.alpha * progress;
          ctx.fill();
        }
        ctx.restore();
      }

      // ============================================
      // 5. MATRIZ DIGITAL (MATRIX RAIN)
      // ============================================
      if (activeType === 'matrix') {
        ctx.save();
        ctx.font = '13px monospace';
        ctx.shadowColor = activeColor;

        for (let i = 0; i < matrixColsRef.current.length; i++) {
          const col = matrixColsRef.current[i];
          col.y += col.speed * (1 + audioEnergy * 0.6);

          for (let c = 0; c < col.length; c++) {
            const charY = col.y - c * 16;
            if (charY < 0 || charY > height) continue;

            // Head character is bright white
            if (c === 0) {
              ctx.shadowBlur = 12 * glow;
              ctx.fillStyle = '#ffffff';
              ctx.globalAlpha = 0.95;
            } else {
              ctx.shadowBlur = 4;
              ctx.fillStyle = activeColor;
              const alphaRatio = (col.length - c) / col.length;
              ctx.globalAlpha = alphaRatio * 0.65;
            }

            // Randomize character occasionally
            if (Math.random() < 0.05) {
              col.chars[c] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            }

            ctx.fillText(col.chars[c] || '0', col.x, charY);
          }

          if (col.y - col.length * 16 > height) {
            col.y = -Math.random() * 100;
            col.speed = 2.5 + Math.random() * 4;
          }
        }
        ctx.restore();
      }

      // ============================================
      // 6. THUNDER BOLTS & FLASHES (Lightning & Rain)
      // ============================================
      if (flashAlphaRef.current > 0.005) {
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = flashAlphaRef.current * 0.45;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        flashAlphaRef.current *= 0.82;
      }

      // Render lightning bolts (active in 'thunder' and occasionally in 'rain')
      for (let b = boltsRef.current.length - 1; b >= 0; b--) {
        const bolt = boltsRef.current[b];
        const progress = bolt.life / bolt.maxLife;
        const flicker = Math.random() > 0.15 ? 1 : 0.4;
        const alpha = progress * flicker;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 22 * glow;
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = alpha * 0.75;

        ctx.beginPath();
        for (const seg of bolt.segments) {
          ctx.lineWidth = seg.width * 2.2 * intensity;
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        ctx.beginPath();
        for (const br of bolt.branches) {
          ctx.lineWidth = br.width * 1.5 * intensity;
          ctx.moveTo(br.x1, br.y1);
          ctx.lineTo(br.x2, br.y2);
        }
        ctx.stroke();

        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.95;

        ctx.beginPath();
        for (const seg of bolt.segments) {
          ctx.lineWidth = Math.max(0.8, seg.width * 0.8);
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        ctx.restore();

        bolt.life -= 1;
        if (bolt.life <= 0) {
          boltsRef.current.splice(b, 1);
        }
      }

      // Electric ground sparks
      for (let s = sparksRef.current.length - 1; s >= 0; s--) {
        const spark = sparksRef.current[s];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vy += 0.22;
        spark.vx *= 0.96;
        spark.life -= 1 / spark.maxLife;

        if (spark.life <= 0) {
          sparksRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = Math.random() > 0.4 ? '#ffffff' : spark.color;
        ctx.globalAlpha = spark.life;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, thunderConfig, intensityMultiplier, lowResourceMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full z-0 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

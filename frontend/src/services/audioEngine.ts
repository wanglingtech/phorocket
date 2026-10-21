/**
 * Phorocket Web Audio Engine
 * Handles procedural cyberpunk audio synthesis, real audio file decoding,
 * AnalyserNode frequency extraction for visualizers, and WAV file export.
 */

import { Track } from '../types/music';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private filter60: BiquadFilterNode | null = null;
  private filter250: BiquadFilterNode | null = null;
  private filter1k: BiquadFilterNode | null = null;
  private filter4k: BiquadFilterNode | null = null;
  private filter12k: BiquadFilterNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;

  // Synthesizer scheduler state
  private isSynthesizing = false;
  private synthIntervalId: number | null = null;
  private currentStep = 0;
  private tempoBpm = 124;
  private activeVoices: { stop: () => void }[] = [];
  private playbackRate = 1.0;

  // Sleep timer
  private sleepTimerTimeoutId: number | null = null;

  // Track playback time tracking
  private playbackStartTime = 0;
  private pausedAtTime = 0;
  private currentTrackDuration = 180;
  private isCurrentlyPlaying = false;

  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onTrackEndedCallback: (() => void) | null = null;
  private timeUpdateIntervalId: number | null = null;

  private currentTrack: Track | null = null;
  private volumeLevel = 0.85;

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;

      const gain = this.ctx.createGain();
      gain.gain.value = this.volumeLevel;
      this.masterGain = gain;

      // 5-Band Lossless Parametric Equalizer Nodes
      this.filter60 = this.ctx.createBiquadFilter();
      this.filter60.type = 'lowshelf';
      this.filter60.frequency.value = 60;
      this.filter60.gain.value = 0;

      this.filter250 = this.ctx.createBiquadFilter();
      this.filter250.type = 'peaking';
      this.filter250.frequency.value = 250;
      this.filter250.Q.value = 1.0;
      this.filter250.gain.value = 0;

      this.filter1k = this.ctx.createBiquadFilter();
      this.filter1k.type = 'peaking';
      this.filter1k.frequency.value = 1000;
      this.filter1k.Q.value = 1.0;
      this.filter1k.gain.value = 0;

      this.filter4k = this.ctx.createBiquadFilter();
      this.filter4k.type = 'peaking';
      this.filter4k.frequency.value = 4000;
      this.filter4k.Q.value = 1.0;
      this.filter4k.gain.value = 0;

      this.filter12k = this.ctx.createBiquadFilter();
      this.filter12k.type = 'highshelf';
      this.filter12k.frequency.value = 12000;
      this.filter12k.gain.value = 0;

      // Backward compatible references
      this.bassFilter = this.filter60;
      this.midFilter = this.filter1k;
      this.trebleFilter = this.filter12k;

      // Stereo Panner
      if (typeof this.ctx.createStereoPanner === 'function') {
        this.stereoPanner = this.ctx.createStereoPanner();
      }

      // Audio Graph:
      // [Source] -> filter60 -> filter250 -> filter1k -> filter4k -> filter12k -> analyser -> (stereoPanner) -> masterGain -> destination
      this.filter60.connect(this.filter250);
      this.filter250.connect(this.filter1k);
      this.filter1k.connect(this.filter4k);
      this.filter4k.connect(this.filter12k);
      this.filter12k.connect(this.analyser);

      if (this.stereoPanner) {
        this.analyser.connect(this.stereoPanner);
        this.stereoPanner.connect(gain);
      } else {
        this.analyser.connect(gain);
      }
      gain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setCallbacks(onTimeUpdate: (time: number) => void, onTrackEnded: () => void) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onTrackEndedCallback = onTrackEnded;
  }

  public async playTrack(track: Track, startFrom = 0) {
    this.ensureContext();
    if (!this.ctx) return;

    this.stopCurrent();
    this.currentTrack = track;
    this.currentTrackDuration = track.duration || 180;
    this.pausedAtTime = startFrom;
    this.playbackStartTime = this.ctx.currentTime - startFrom;
    this.isCurrentlyPlaying = true;

    if (track.audioUrl) {
      // Real audio element source (e.g. from local file import or remote asset)
      this.playAudioUrl(track.audioUrl, startFrom);
    } else {
      // Procedural Cyberpunk Web Audio synth
      this.startCyberSynth(track, startFrom);
    }

    this.startTimeTicker();
  }

  private playAudioUrl(url: string, startFrom: number) {
    if (!this.ctx || !this.bassFilter) return;

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.mediaSource = this.ctx.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.bassFilter);

      this.audioElement.addEventListener('ended', () => {
        this.stopCurrent();
        if (this.onTrackEndedCallback) {
          this.onTrackEndedCallback();
        }
      });
    }

    this.audioElement.src = url;
    this.audioElement.currentTime = startFrom;
    this.audioElement.playbackRate = this.playbackRate;
    this.audioElement.play().catch(() => {
      // Fallback to synth if browser blocks media element decoding
      if (this.currentTrack) {
        this.startCyberSynth(this.currentTrack, startFrom);
      }
    });
  }

  private startCyberSynth(track: Track, _startFrom: number) {
    if (!this.ctx || !this.bassFilter) return;
    this.isSynthesizing = true;
    this.currentStep = 0;

    const style = track.synthStyle || 'cyber_arpeggio';
    this.tempoBpm = (track.bpm || (style === 'ambient_void' ? 84 : style === 'techno_drive' ? 134 : 120)) * this.playbackRate;

    // Scale notes by style (Cyberpunk minor/dorian modes)
    const scales: Record<string, number[]> = {
      cyber_arpeggio: [130.81, 155.56, 174.61, 196.0, 233.08, 261.63, 311.13, 349.23], // C minor
      neon_bass: [110.0, 130.81, 146.83, 164.81, 196.0, 220.0, 261.63], // A minor
      ambient_void: [98.0, 123.47, 146.83, 174.61, 196.0, 246.94], // G minor
      lofi_pulse: [146.83, 164.81, 174.61, 220.0, 261.63, 293.66], // D minor
      techno_drive: [123.47, 138.59, 155.56, 185.0, 207.65, 246.94] // B minor
    };
    const scale = scales[style] || scales.cyber_arpeggio;

    const stepIntervalMs = (60 / this.tempoBpm / 4) * 1000; // 16th notes

    this.synthIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.isSynthesizing || !this.bassFilter) return;
      const now = this.ctx.currentTime;
      const step = this.currentStep % 16;

      // 1. Kick on steps 0, 4, 8, 12 (4-on-the-floor)
      if (step % 4 === 0 && style !== 'ambient_void') {
        this.triggerKick(now);
      }

      // 2. Snare / Clap on steps 4, 12
      if ((step === 4 || step === 12) && style !== 'ambient_void') {
        this.triggerSnare(now);
      }

      // 3. Hi-hat on every 8th note
      if (step % 2 === 0) {
        this.triggerHiHat(now, step % 4 === 2);
      }

      // 4. Bassline
      if (step % 2 === 0 || style === 'techno_drive') {
        const bassFreq = scale[step % 4] / 2;
        this.triggerBass(now, bassFreq, style);
      }

      // 5. Arpeggio / Lead
      if (step % 2 === 1 || style === 'cyber_arpeggio') {
        const noteIndex = (step * 3 + Math.floor(this.currentStep / 16)) % scale.length;
        const noteFreq = scale[noteIndex] * 2;
        this.triggerLead(now, noteFreq, style);
      }

      this.currentStep++;
    }, stepIntervalMs);
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.bassFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.14);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.bassFilter);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.bassFilter) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.bassFilter);

    noise.start(time);
    noise.stop(time + 0.14);
  }

  private triggerHiHat(time: number, isOpen: boolean) {
    if (!this.ctx || !this.bassFilter) return;
    const duration = isOpen ? 0.08 : 0.03;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.18 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.bassFilter);

    source.start(time);
    source.stop(time + duration + 0.01);
  }

  private triggerBass(time: number, freq: number, style: string) {
    if (!this.ctx || !this.bassFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = style === 'neon_bass' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    const dur = 0.22;
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.bassFilter);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private triggerLead(time: number, freq: number, _style: string) {
    if (!this.ctx || !this.bassFilter) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.006, time); // Subtle detune for lush cyberpunk width

    const dur = 0.18;
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.bassFilter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
  }

  private startTimeTicker() {
    if (this.timeUpdateIntervalId) {
      clearInterval(this.timeUpdateIntervalId);
    }

    this.timeUpdateIntervalId = window.setInterval(() => {
      if (!this.isCurrentlyPlaying || !this.ctx) return;
      const elapsed = this.ctx.currentTime - this.playbackStartTime;
      const currentSeconds = Math.min(this.currentTrackDuration, Math.max(0, elapsed));

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(currentSeconds);
      }

      if (currentSeconds >= this.currentTrackDuration) {
        this.stopCurrent();
        if (this.onTrackEndedCallback) {
          this.onTrackEndedCallback();
        }
      }
    }, 250);
  }

  public pause() {
    if (!this.ctx) return;
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.stopSynth();
    this.isCurrentlyPlaying = false;
    this.pausedAtTime = this.ctx.currentTime - this.playbackStartTime;

    if (this.timeUpdateIntervalId) {
      clearInterval(this.timeUpdateIntervalId);
      this.timeUpdateIntervalId = null;
    }
  }

  public resume() {
    this.ensureContext();
    if (!this.currentTrack || !this.ctx) return;

    this.playbackStartTime = this.ctx.currentTime - this.pausedAtTime;
    this.isCurrentlyPlaying = true;

    if (this.currentTrack.audioUrl && this.audioElement) {
      this.audioElement.currentTime = this.pausedAtTime;
      this.audioElement.play().catch(() => {});
    } else {
      this.startCyberSynth(this.currentTrack, this.pausedAtTime);
    }

    this.startTimeTicker();
  }

  public seek(seconds: number) {
    if (!this.ctx) return;
    const clamped = Math.max(0, Math.min(this.currentTrackDuration, seconds));
    this.pausedAtTime = clamped;
    this.playbackStartTime = this.ctx.currentTime - clamped;

    if (this.audioElement) {
      this.audioElement.currentTime = clamped;
    }

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(clamped);
    }
  }

  public setVolume(val: number) {
    this.volumeLevel = Math.max(0, Math.min(1, val));
    if (this.masterGain && 'gain' in this.masterGain) {
      (this.masterGain as GainNode).gain.value = this.volumeLevel;
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volumeLevel;
    }
  }

  public set5BandEqualizer(bands: {
    '60Hz'?: number;
    '250Hz'?: number;
    '1kHz'?: number;
    '4kHz'?: number;
    '12kHz'?: number;
  }) {
    if (this.filter60 && bands['60Hz'] !== undefined) this.filter60.gain.value = bands['60Hz'];
    if (this.filter250 && bands['250Hz'] !== undefined) this.filter250.gain.value = bands['250Hz'];
    if (this.filter1k && bands['1kHz'] !== undefined) this.filter1k.gain.value = bands['1kHz'];
    if (this.filter4k && bands['4kHz'] !== undefined) this.filter4k.gain.value = bands['4kHz'];
    if (this.filter12k && bands['12kHz'] !== undefined) this.filter12k.gain.value = bands['12kHz'];
  }

  public setEqualizer(preset: string) {
    switch (preset) {
      case 'cyber_bass':
        this.set5BandEqualizer({ '60Hz': 7, '250Hz': 4, '1kHz': 0, '4kHz': 1, '12kHz': 2 });
        break;
      case 'neon_treble':
        this.set5BandEqualizer({ '60Hz': 1, '250Hz': 0, '1kHz': 2, '4kHz': 5, '12kHz': 7 });
        break;
      case 'vocal_boost':
        this.set5BandEqualizer({ '60Hz': -2, '250Hz': 1, '1kHz': 5, '4kHz': 4, '12kHz': 1 });
        break;
      case 'electronic':
        this.set5BandEqualizer({ '60Hz': 6, '250Hz': 3, '1kHz': -2, '4kHz': 4, '12kHz': 6 });
        break;
      case 'lofi_warmth':
        this.set5BandEqualizer({ '60Hz': 4, '250Hz': 3, '1kHz': 1, '4kHz': -2, '12kHz': -4 });
        break;
      case 'gaming_atmos':
        this.set5BandEqualizer({ '60Hz': 5, '250Hz': -1, '1kHz': 1, '4kHz': 5, '12kHz': 4 });
        break;
      case 'acoustic_pure':
        this.set5BandEqualizer({ '60Hz': 2, '250Hz': 1, '1kHz': 3, '4kHz': 2, '12kHz': 3 });
        break;
      case 'flat':
      default:
        this.set5BandEqualizer({ '60Hz': 0, '250Hz': 0, '1kHz': 0, '4kHz': 0, '12kHz': 0 });
        break;
    }
  }

  public setCustomEqualizerBands(bassDb: number, midDb: number, trebleDb: number) {
    if (this.filter60) this.filter60.gain.value = bassDb;
    if (this.filter250) this.filter250.gain.value = bassDb * 0.7;
    if (this.filter1k) this.filter1k.gain.value = midDb;
    if (this.filter4k) this.filter4k.gain.value = trebleDb * 0.7;
    if (this.filter12k) this.filter12k.gain.value = trebleDb;
  }

  public setStereoPan(pan: number) {
    if (this.stereoPanner) {
      // Pan value clamped between -1.0 (Full Left) and +1.0 (Full Right)
      const clamped = Math.max(-1, Math.min(1, pan));
      this.stereoPanner.pan.setValueAtTime(clamped, this.ctx ? this.ctx.currentTime : 0);
    }
  }

  public setPlaybackSpeed(rate: number) {
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.audioElement) {
      this.audioElement.playbackRate = this.playbackRate;
    }
    // Update synth tempo if playing synth
    if (this.isSynthesizing && this.currentTrack) {
      const startFrom = this.ctx ? this.ctx.currentTime - this.playbackStartTime : 0;
      this.stopSynth();
      this.startCyberSynth(this.currentTrack, startFrom);
    }
  }

  public startSleepTimer(minutes: number, onTimerFinished: () => void) {
    this.cancelSleepTimer();
    this.sleepTimerTimeoutId = window.setTimeout(() => {
      // Smooth fade out
      this.fadeOutAndPause(onTimerFinished);
    }, minutes * 60 * 1000);
  }

  public cancelSleepTimer() {
    if (this.sleepTimerTimeoutId) {
      clearTimeout(this.sleepTimerTimeoutId);
      this.sleepTimerTimeoutId = null;
    }
  }

  private fadeOutAndPause(onComplete: () => void) {
    if (!this.masterGain || !this.ctx) {
      this.pause();
      onComplete();
      return;
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.volumeLevel, now);
    this.masterGain.gain.linearRampToValueAtTime(0.001, now + 2.5);

    setTimeout(() => {
      this.pause();
      if (this.masterGain) {
        this.masterGain.gain.value = this.volumeLevel;
      }
      onComplete();
    }, 2600);
  }

  public getVisualizerData(freqArray: Uint8Array, timeArray: Uint8Array): boolean {
    if (!this.analyser || !this.isCurrentlyPlaying) {
      // Return false if idle, filled with 0s or subtle ambient idle
      return false;
    }
    (this.analyser as any).getByteFrequencyData(freqArray);
    (this.analyser as any).getByteTimeDomainData(timeArray);
    return true;
  }

  private stopSynth() {
    this.isSynthesizing = false;
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    this.activeVoices.forEach((v) => {
      try {
        v.stop();
      } catch {
        // ignore
      }
    });
    this.activeVoices = [];
  }

  public stopCurrent() {
    this.isCurrentlyPlaying = false;
    this.stopSynth();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.timeUpdateIntervalId) {
      clearInterval(this.timeUpdateIntervalId);
      this.timeUpdateIntervalId = null;
    }
  }

  /**
   * Generates a downloadable WAV file for procedural legal tracks
   */
  public generateWavFileBlob(track: Track): Blob {
    const sampleRate = 44100;
    const duration = Math.min(track.duration || 60, 60); // 60s sample render for quick instant download
    const totalSamples = sampleRate * duration;
    const buffer = new Float32Array(totalSamples);

    const freq = 130.81;
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      // Synthesize cyber loop into buffer
      const kick = Math.sin(2 * Math.PI * (120 * Math.exp(-t % 0.5 * 15)) * (t % 0.5)) * Math.exp(-t % 0.5 * 8);
      const lead = Math.sin(2 * Math.PI * (freq * (1 + ((Math.floor(t * 4) % 6) * 0.2))) * t) * 0.3;
      buffer[i] = Math.max(-1, Math.min(1, kick * 0.4 + lead * 0.3));
    }

    // Convert Float32 to 16-bit PCM WAV
    const wavBuffer = new ArrayBuffer(44 + totalSamples * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + totalSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, totalSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }
}

export const audioEngine = new AudioEngine();

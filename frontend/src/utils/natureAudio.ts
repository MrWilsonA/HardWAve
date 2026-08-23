/**
 * Dynamic Procedural Web Audio Nature Ambience & Weather Engine
 * - Day Mode: Gentle Breeze, Forest Birdsong, Leaf Rustle
 * - Night Mode: Calming Meadow Crickets, Night Wind, Distant Ocean Wave Laps
 * - Rain Weather Mode: Relaxing Rain Patter, Water Droplets, Thunder Ambience
 * - Dynamic Speed Wind: Air resistance rush when buggy accelerates
 * - Balanced, soothing acoustic levels with anti-clipping gain safety
 */

export class NatureAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private birdGain: GainNode | null = null;
  private cricketGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private isRunning: boolean = false;
  private isNight: boolean = false;
  private isRaining: boolean = false;
  private birdTimer: NodeJS.Timeout | null = null;
  private rainDropTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Ambience Gain (Comfortable, non-overpowering default level)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);

      // 1. Wind Breeze Generator (Filtered Pink Noise with LFO)
      this.setupWindGenerator();

      // 2. Night Crickets Generator (Bandpass Resonant Pulse)
      this.setupCricketGenerator();

      // 3. Day Birdsong Generator
      this.setupBirdGenerator();

      // 4. Procedural Rain Weather Generator
      this.setupRainGenerator();

      this.isRunning = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  /* ── 1. Gentle Wind Breeze Generator ── */
  private setupWindGenerator() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    filter.Q.value = 1.0;

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.22;

    whiteNoise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    whiteNoise.start();
  }

  /* ── 2. Night Crickets Generator ── */
  private setupCricketGenerator() {
    if (!this.ctx || !this.masterGain) return;

    this.cricketGain = this.ctx.createGain();
    this.cricketGain.gain.value = 0.0;
    this.cricketGain.connect(this.masterGain);

    [4450, 4850].forEach((freq, idx) => {
      if (!this.ctx || !this.cricketGain) return;

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const tremolo = this.ctx.createOscillator();
      tremolo.type = "square";
      tremolo.frequency.value = 22 + idx * 4;

      const tremoloGain = this.ctx.createGain();
      tremoloGain.gain.value = 0.022;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 14;

      osc.connect(filter);
      filter.connect(tremoloGain);
      tremoloGain.connect(this.cricketGain);

      osc.start();
    });
  }

  /* ── 3. Day Birdsong Generator ── */
  private setupBirdGenerator() {
    if (!this.ctx || !this.masterGain) return;

    this.birdGain = this.ctx.createGain();
    this.birdGain.gain.value = 0.18;
    this.birdGain.connect(this.masterGain);

    this.scheduleNextBirdChirp();
  }

  private scheduleNextBirdChirp() {
    if (this.birdTimer) clearTimeout(this.birdTimer);

    const nextInterval = 3000 + Math.random() * 5000;

    this.birdTimer = setTimeout(() => {
      if (!this.isNight && !this.isRaining && this.isRunning && this.ctx && this.birdGain) {
        this.playBirdChirp();
      }
      this.scheduleNextBirdChirp();
    }, nextInterval);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.birdGain || this.ctx.state !== "running") return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 2300 + Math.random() * 1100;
    osc.type = "sine";

    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.28);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.birdGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /* ── 4. Procedural Rain Weather Generator ── */
  private setupRainGenerator() {
    if (!this.ctx || !this.masterGain) return;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;
    this.rainGain.connect(this.masterGain);

    // Continuous Rain Patter Noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    rainSource.connect(filter);
    filter.connect(this.rainGain);
    rainSource.start();

    // Schedule random water droplet pings when raining
    this.scheduleRainDrops();
  }

  private scheduleRainDrops() {
    if (this.rainDropTimer) clearTimeout(this.rainDropTimer);

    const nextInterval = 400 + Math.random() * 700;

    this.rainDropTimer = setTimeout(() => {
      if (this.isRaining && this.isRunning && this.ctx && this.rainGain) {
        this.playWaterDrop();
      }
      this.scheduleRainDrops();
    }, nextInterval);
  }

  private playWaterDrop() {
    if (!this.ctx || !this.rainGain || this.ctx.state !== "running") return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 1200 + Math.random() * 800;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.rainGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /* ── Update Day/Night, Rain & Speed Dynamics ── */
  public update(isNight: boolean, speed: number = 0, isRaining: boolean = false) {
    this.isNight = isNight;
    this.isRaining = isRaining;
    if (!this.ctx) return;

    // Rain Gain
    const targetRainGain = isRaining ? 0.38 : 0.0;
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(targetRainGain, this.ctx.currentTime, 1.2);
    }

    // Crickets & Birds
    const targetCricketGain = isNight && !isRaining ? 0.25 : 0.0;
    const targetBirdGain = !isNight && !isRaining ? 0.18 : 0.0;

    if (this.cricketGain) {
      this.cricketGain.gain.setTargetAtTime(targetCricketGain, this.ctx.currentTime, 1.2);
    }
    if (this.birdGain) {
      this.birdGain.gain.setTargetAtTime(targetBirdGain, this.ctx.currentTime, 1.2);
    }

    // Dynamic wind swell based on driving speed & weather
    if (this.windGain) {
      const baseWind = isRaining ? 0.32 : isNight ? 0.18 : 0.22;
      const speedFactor = Math.min(0.3, (Math.abs(speed) / 14) * 0.25);
      this.windGain.gain.setTargetAtTime(baseWind + speedFactor, this.ctx.currentTime, 0.4);
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.1);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public destroy() {
    if (this.birdTimer) clearTimeout(this.birdTimer);
    if (this.rainDropTimer) clearTimeout(this.rainDropTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isRunning = false;
  }
}

// Global Singleton Instance
export const natureAudio = typeof window !== "undefined" ? new NatureAudioEngine() : null;

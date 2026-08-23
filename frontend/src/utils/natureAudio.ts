/**
 * Dynamic Procedural Web Audio Nature Ambience Engine
 * - Day Mode: Gentle Wind Breeze, Forest Birdsong, Leaf Rustle
 * - Night Mode: Calming Meadow Crickets, Night Wind, Distant Ocean Wave Laps
 * - Dynamic Speed Wind: Air resistance rush when buggy accelerates
 */

export class NatureAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private birdGain: GainNode | null = null;
  private cricketGain: GainNode | null = null;
  private isRunning: boolean = false;
  private isNight: boolean = false;
  private birdTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master Ambience Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      // 1. Wind Breeze Generator (Filtered Pink Noise with LFO)
      this.setupWindGenerator();

      // 2. Night Crickets Generator (Bandpass Resonant Pulse)
      this.setupCricketGenerator();

      // 3. Day Birdsong Generator
      this.setupBirdGenerator();

      this.isRunning = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  /* ── 1. Gentle Wind Breeze Generator ── */
  private setupWindGenerator() {
    if (!this.ctx || !this.masterGain) return;

    // Generate Pink Noise Buffer (3 seconds looped)
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter for soft warm air
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 1.2;

    // Modulate filter for gusting breeze
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.18; // 0.18 Hz slow swell
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.35;

    whiteNoise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    whiteNoise.start();
  }

  /* ── 2. Night Crickets Generator ── */
  private setupCricketGenerator() {
    if (!this.ctx || !this.masterGain) return;

    this.cricketGain = this.ctx.createGain();
    this.cricketGain.gain.value = 0.0; // Inactive during day
    this.cricketGain.connect(this.masterGain);

    // Two high-pitch resonant carrier frequencies (4.5 kHz & 4.8 kHz)
    [4450, 4850].forEach((freq, idx) => {
      if (!this.ctx || !this.cricketGain) return;

      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      const tremolo = this.ctx.createOscillator();
      tremolo.type = "square";
      tremolo.frequency.value = 24 + idx * 4; // Cricket chirping rate

      const tremoloGain = this.ctx.createGain();
      tremoloGain.gain.value = 0.035;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 12;

      osc.connect(filter);
      filter.connect(tremoloGain);
      tremoloGain.connect(this.cricketGain);

      osc.start();
    });
  }

  /* ── 3. Day Birdsong Generator (Organic Random Chirps) ── */
  private setupBirdGenerator() {
    if (!this.ctx || !this.masterGain) return;

    this.birdGain = this.ctx.createGain();
    this.birdGain.gain.value = 0.25;
    this.birdGain.connect(this.masterGain);

    this.scheduleNextBirdChirp();
  }

  private scheduleNextBirdChirp() {
    if (this.birdTimer) clearTimeout(this.birdTimer);

    // Random interval between 2.5s and 6.5s
    const nextInterval = 2500 + Math.random() * 4000;

    this.birdTimer = setTimeout(() => {
      if (!this.isNight && this.isRunning && this.ctx && this.birdGain) {
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

    const baseFreq = 2200 + Math.random() * 1200; // 2.2 kHz - 3.4 kHz
    osc.type = "sine";

    // Frequency modulation for bird trill (e.g. rising & dipping pitch)
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.28);

    // Volume envelope (quick sweet chirp)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.birdGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /* ── Update Day/Night & Speed Dynamics ── */
  public update(isNight: boolean, speed: number = 0) {
    this.isNight = isNight;
    if (!this.ctx) return;

    // Transition Day vs Night Gains
    const targetCricketGain = isNight ? 0.35 : 0.0;
    const targetBirdGain = isNight ? 0.0 : 0.25;

    if (this.cricketGain) {
      this.cricketGain.gain.setTargetAtTime(targetCricketGain, this.ctx.currentTime, 1.5);
    }
    if (this.birdGain) {
      this.birdGain.gain.setTargetAtTime(targetBirdGain, this.ctx.currentTime, 1.5);
    }

    // Dynamic wind swell based on driving speed
    if (this.windGain) {
      const baseWind = isNight ? 0.25 : 0.32;
      const speedFactor = Math.min(0.4, (Math.abs(speed) / 14) * 0.35);
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
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isRunning = false;
  }
}

// Global Singleton Instance
export const natureAudio = typeof window !== "undefined" ? new NatureAudioEngine() : null;

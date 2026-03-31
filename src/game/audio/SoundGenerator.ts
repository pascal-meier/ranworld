export class SoundGenerator {
  private static instance: SoundGenerator;
  private ctx: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): SoundGenerator {
    if (!SoundGenerator.instance) {
      SoundGenerator.instance = new SoundGenerator();
    }
    return SoundGenerator.instance;
  }

  public init(externalCtx?: AudioContext): void {
    if (externalCtx) {
      this.ctx = externalCtx;
    } else if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
        this.init();
    }
    return this.ctx!;
  }

  public generateClickBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.1;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        const freq = 800 * Math.exp(-10 * t);
        const amp = 0.1 * Math.exp(-20 * t);
        data[i] = Math.sin(2 * Math.PI * freq * t) * amp;
    }
    return buffer;
  }

  public generateConfirmBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        const freq = t < 0.05 ? 400 : 800;
        const amp = 0.08 * Math.exp(-10 * t);
        data[i] = (t % (1/freq) < 1/(2*freq) ? 1 : -1) * amp; // Square wave
    }
    return buffer;
  }

  public generateHitBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.15;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        // noise
        const noise = (Math.random() * 2 - 1) * 0.2 * Math.exp(-30 * t);
        // low thump
        const freq = 100 * Math.exp(-10 * t);
        const thump = (2 * (t * freq - Math.floor(t * freq + 0.5))) * 0.15 * Math.exp(-15 * t); // Sawtooth
        data[i] = noise + thump;
    }
    return buffer;
  }

  public generateMissBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.3;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        const freq = 400 * Math.exp(-3 * t);
        const amp = 0.05 * (1 - t/duration);
        data[i] = Math.sin(2 * Math.PI * freq * t) * amp;
    }
    return buffer;
  }

  public generateBlockBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.1;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        const freq = 1200 * Math.exp(-5 * t);
        const amp = 0.12 * Math.exp(-25 * t);
        // Triangle wave
        data[i] = (Math.abs((t * freq % 1) * 4 - 2) - 1) * amp;
    }
    return buffer;
  }

  public generateCritBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    const hit = this.generateHitBuffer();
    const hitData = hit.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        let val = 0;
        if (i < hitData.length) val += hitData[i];
        
        const freq = 1200 * Math.exp(-8 * t);
        const amp = 0.15 * Math.exp(-10 * t);
        val += Math.sin(2 * Math.PI * freq * t) * amp;
        data[i] = val;
    }
    return buffer;
  }

  public generateRewardBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 0.6;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const notes = [440, 554.37, 659.25, 880];

    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        let val = 0;
        notes.forEach((freq, ni) => {
            const startTime = ni * 0.1;
            if (t >= startTime && t < startTime + 0.3) {
                const nt = t - startTime;
                val += Math.sin(2 * Math.PI * freq * nt) * 0.06 * Math.exp(-10 * nt);
            }
        });
        data[i] = val;
    }
    return buffer;
  }

  public generateAmbientBuffer(): AudioBuffer {
    const ctx = this.getCtx();
    const duration = 20.0; // Longer loop for cinematic feel
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // G-Minor/Pentatonic palette
    const G1 = 48.999;
    const G2 = 97.999;
    const Bb2 = 116.54;
    const D3 = 146.83;
    const F3 = 174.61;

    let lastNoise = 0;
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        
        // --- 1. Brownian Noise (Minimized to a soft whisper) ---
        const white = (Math.random() * 2 - 1);
        lastNoise = (lastNoise + (0.02 * white)) / 1.02;
        const noise = lastNoise * 0.08;

        // --- 2. Foundation Drone (Root G1) ---
        const breathableBase = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * t);
        const foundation = Math.sin(2 * Math.PI * G1 * t) * (0.15 * breathableBase);

        // --- 3. Melodic Shifting Pad (G2, Bb2, D3, F3) ---
        // Each tone has its own slow LFO for a "shifting chord" feel
        const voice1 = Math.sin(2 * Math.PI * G2 * t) * (0.08 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t)));
        const voice2 = Math.sin(2 * Math.PI * Bb2 * t) * (0.06 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.06 * t + 1)));
        const voice3 = Math.sin(2 * Math.PI * D3 * t) * (0.04 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.04 * t + 2)));
        const voice4 = Math.sin(2 * Math.PI * F3 * t) * (0.03 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.03 * t + 3)));

        // --- 4. Sub-harmonic richness ---
        const sub = Math.sin(2 * Math.PI * (G1 * 2 / 3) * t) * 0.02; // A fifth below the root

        // --- 5. Seamless Windowing (2s Linear Crossfade) ---
        const window = t < 2.0 ? t / 2.0 : (t > duration - 2.0 ? (duration - t) / 2.0 : 1.0);

        data[i] = (noise + foundation + sub + voice1 + voice2 + voice3 + voice4) * 0.25 * window;
    }
    return buffer;
  }
}

export const soundGenerator = SoundGenerator.getInstance();

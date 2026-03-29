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

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
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
    const duration = 15.0; // Long loop to avoid obvious repetition
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastNoise = 0;
    for (let i = 0; i < buffer.length; i++) {
        const t = i / ctx.sampleRate;
        
        // --- 1. Brownian Noise (Low-pass filtered white noise) ---
        const white = (Math.random() * 2 - 1);
        lastNoise = (lastNoise + (0.02 * white)) / 1.02; // Simple integrator
        const noise = lastNoise * 0.3;

        // --- 2. Living Drone (Additive Sines with LFO) ---
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.08 * t); // 0.08Hz Breathe
        const baseFreq = 45;
        const foundation = Math.sin(2 * Math.PI * baseFreq * t) * (0.08 * lfo);
        const harmonic1 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.04;
        const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 2.1 * t + 1) * 0.03;

        // --- 3. Seamless Windowing ---
        const window = t < 0.1 ? t / 0.1 : (t > duration - 0.1 ? (duration - t) / 0.1 : 1.0);

        data[i] = (noise + foundation + harmonic1 + harmonic2) * 0.15 * window;
    }
    return buffer;
  }
}

export const soundGenerator = SoundGenerator.getInstance();

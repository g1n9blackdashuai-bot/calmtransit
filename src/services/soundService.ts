
class SoundService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;

  private init() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.3; // Low volume by default
    this.masterGain.connect(this.audioCtx.destination);
  }

  private resume() {
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startAmbient() {
    this.init();
    this.resume();
    if (!this.audioCtx || !this.masterGain || this.ambientSource) return;

    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    this.ambientSource = this.audioCtx.createBufferSource();
    this.ambientSource.buffer = buffer;
    this.ambientSource.loop = true;

    const biquadFilter = this.audioCtx.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
    biquadFilter.Q.setValueAtTime(1, this.audioCtx.currentTime);

    // Subtle wind oscillation
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.value = 0.1; // Slow gusts
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(biquadFilter.frequency);
    lfo.start();

    this.ambientGain = this.audioCtx.createGain();
    this.ambientGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 2);

    this.ambientSource.connect(biquadFilter);
    biquadFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.ambientSource.start();
  }

  stopAmbient() {
    if (this.ambientGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 1);
      setTimeout(() => {
        if (this.ambientSource) {
          this.ambientSource.stop();
          this.ambientSource.disconnect();
          this.ambientSource = null;
        }
        if (this.ambientGain) {
          this.ambientGain.disconnect();
          this.ambientGain = null;
        }
      }, 1100);
    }
  }

  // Soft water tap / gentle droplet click
  playTap() {
    this.init();
    this.resume();
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // Gentle upward frequency sweep characteristic of a delicate water droplet poof
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Soft cascading triple-water-droplet arpeggio instead of the old metallic bowl sound
  playChime() {
    this.init();
    this.resume();
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    
    // Play 3 beautifully staggered gentle water drops cascading
    const delays = [0.0, 0.15, 0.30];
    const dropConfigs = [
      { startFreq: 680, endFreq: 1450, volume: 0.05, duration: 0.2 },
      { startFreq: 780, endFreq: 1650, volume: 0.04, duration: 0.2 },
      { startFreq: 880, endFreq: 1850, volume: 0.03, duration: 0.2 }
    ];

    dropConfigs.forEach((config, i) => {
      const dropTime = now + delays[i];
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(config.startFreq, dropTime);
      osc.frequency.exponentialRampToValueAtTime(config.endFreq, dropTime + 0.06);

      gain.gain.setValueAtTime(config.volume, dropTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dropTime + config.duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(dropTime);
      osc.stop(dropTime + config.duration + 0.05);
    });
  }

  // Pure, delicate high-pitch water droplet
  playDrop() {
    this.init();
    this.resume();
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // Pure fast upward sweep 650Hz to 1600Hz for high realism droplet sound
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Refined Zen Wooden Fish sound - now sounding like a resonant watery woodblock or deep cave pool droplet
  playMuyu() {
    this.init();
    this.resume();
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;

    // Body resonance: deep water drip hollow container sound
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.2);

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.linearRampToValueAtTime(0.04, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Tip stroke: watery ripple trigger
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(580, now);
    osc2.frequency.exponentialRampToValueAtTime(1350, now + 0.08);

    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, now);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(filter);
    gain2.connect(filter);

    filter.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now);
    osc2.stop(now + 0.15);
  }
}

export const sounds = new SoundService();

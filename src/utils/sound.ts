class SoundManager {
  private ctx: AudioContext | null = null;
  private buzzerOscillator: OscillatorNode | null = null;
  private buzzerGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext is initialized lazily upon first user interaction
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopBuzzer();
    }
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio errors ignored gracefully
    }
  }

  public playBuzzer(active: boolean) {
    if (!this.enabled) {
      this.stopBuzzer();
      return;
    }
    try {
      this.init();
      if (!this.ctx) return;

      if (active) {
        if (!this.buzzerOscillator) {
          this.buzzerOscillator = this.ctx.createOscillator();
          this.buzzerGain = this.ctx.createGain();
          this.buzzerOscillator.type = 'square';
          this.buzzerOscillator.frequency.setValueAtTime(440, this.ctx.currentTime); // Concert A
          this.buzzerGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          this.buzzerOscillator.connect(this.buzzerGain);
          this.buzzerGain.connect(this.ctx.destination);
          this.buzzerOscillator.start();
        }
      } else {
        this.stopBuzzer();
      }
    } catch {
      // Silent fail
    }
  }

  public stopBuzzer() {
    if (this.buzzerOscillator) {
      try {
        this.buzzerOscillator.stop();
        this.buzzerOscillator.disconnect();
      } catch {
        // Ignored
      }
      this.buzzerOscillator = null;
    }
    if (this.buzzerGain) {
      try {
        this.buzzerGain.disconnect();
      } catch {
        // Ignored
      }
      this.buzzerGain = null;
    }
  }
}

export const sound = new SoundManager();

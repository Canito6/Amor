// Web Audio API Sound Synthesizer Utility

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isSoundEnabled() {
    return localStorage.getItem('soundEnabled') !== 'false';
  }

  playPop() {
    if (!this.isSoundEnabled()) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Web Audio error playing pop:', e);
    }
  }

  playChime() {
    if (!this.isSoundEnabled()) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      freqs.forEach((f, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.04);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + index * 0.04 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.04 + 0.35);
        
        osc.start(now + index * 0.04);
        osc.stop(now + index * 0.04 + 0.35);
      });
    } catch (e) {
      console.warn('Web Audio error playing chime:', e);
    }
  }

  playSparkle() {
    if (!this.isSoundEnabled()) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C Major scale ascending
      notes.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + i * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
        
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.2);
      });
    } catch (e) {
      console.warn('Web Audio error playing sparkle:', e);
    }
  }
}

export const sounds = new SoundEffects();

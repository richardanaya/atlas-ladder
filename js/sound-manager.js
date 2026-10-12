/**
 * Short cues synthesized with WebAudio. No audio files.
 * Kinds: correct, incorrect, complete, level.
 */
export class SoundManager {
  constructor(store) {
    this.store = store;
    this.ctx = null;
  }

  get muted() {
    return this.store.muted;
  }

  toggle() {
    const next = !this.store.muted;
    this.store.setMuted(next);
    return next;
  }

  _context() {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  play(kind) {
    if (this.muted) return;
    const ctx = this._context();
    if (!ctx) return;
    if (kind === 'correct') this._chime(ctx, [523.25, 659.25], 0.11);
    else if (kind === 'incorrect') this._buzz(ctx);
    else if (kind === 'complete') this._chime(ctx, [392, 523.25, 659.25, 783.99], 0.13);
    else if (kind === 'level') this._chime(ctx, [523.25, 659.25, 783.99, 1046.5], 0.15);
  }

  _tone(ctx, freq, when, duration, type, peak) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + duration + 0.02);
  }

  _chime(ctx, freqs, step) {
    const start = ctx.currentTime + 0.01;
    freqs.forEach((freq, index) => {
      this._tone(ctx, freq, start + index * step, 0.22, 'sine', 0.07);
    });
  }

  _buzz(ctx) {
    const start = ctx.currentTime + 0.01;
    this._tone(ctx, 196, start, 0.18, 'triangle', 0.05);
    this._tone(ctx, 146.8, start + 0.04, 0.2, 'square', 0.02);
  }
}

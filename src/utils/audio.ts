/**
 * Web Audio API synthesizer for Mosque Digital Signage & Adzan/Iqomah Chimes.
 * No external MP3 downloads required; works reliably offline and on Smart TVs.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play pleasant Islamic digital bell chime for Adzan entrance
 */
export function playAdzanChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pleasant 3-tone harmonic chime (F4, A4, C5)
    const freqs = [349.23, 440.00, 523.25, 698.46];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.25);

      gain.gain.setValueAtTime(0.001, now + idx * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.25 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.25);
      osc.stop(now + idx * 0.25 + 2.0);
    });
  } catch (err) {
    console.warn('Audio playback not permitted yet (requires user gesture):', err);
  }
}

/**
 * Play Iqomah alert tone (two gentle pulses)
 */
export function playIqomahAlert(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.4, 0.8].forEach((timeOffset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now + timeOffset); // D5

      gain.gain.setValueAtTime(0.001, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.2, now + timeOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.4);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Subtle tick sound for the last 5 seconds of countdown
 */
export function playCountdownTick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // silent fail
  }
}

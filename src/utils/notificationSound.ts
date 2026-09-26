// Simple Web Audio API Synthesizer for Push Notification Chimes
// Fully self-contained, no external audio files required, fails gracefully if AudioContext is not permitted.

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Play an official Central Bank update push notification chime (pleasant 2-tone harmonic chime)
  playCblAlertChime(severity: 'info' | 'warning' | 'critical' | 'success' = 'info') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary oscillator (pleasant sine wave)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      gainNode.connect(ctx.destination);

      if (severity === 'critical' || severity === 'warning') {
        // High attention alert chime (F5 -> A5 -> C6)
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(698.46, now); // F5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28); // C6

        osc2.frequency.setValueAtTime(349.23, now);
        osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.28);
      } else {
        // Soft Banking chime (E5 -> G#5 -> B5)
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.10); // G#5
        osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.22); // B5

        osc2.frequency.setValueAtTime(440.0, now);
        osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.22);
      }

      // Envelope
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gainNode);
      osc2.connect(gainNode);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.75);
      osc2.stop(now + 0.75);
    } catch {
      // Ignore any audio context permission errors
    }
  }
}

export const notificationSoundService = new NotificationSoundService();

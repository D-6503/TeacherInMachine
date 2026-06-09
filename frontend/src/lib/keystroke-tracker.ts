export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  delta: number;
  type: 'keydown' | 'paste' | 'delete';
}

export class KeystrokeTracker {
  private events: KeystrokeEvent[] = [];
  private lastTime: number = Date.now();

  track(key: string, type: KeystrokeEvent['type'] = 'keydown'): void {
    const now = Date.now();
    const delta = now - this.lastTime;
    this.events.push({ key, timestamp: now, delta, type });
    this.lastTime = now;
  }

  trackPaste(pastedLength: number): void {
    const now = Date.now();
    this.events.push({
      key: `paste:${pastedLength}`,
      timestamp: now,
      delta: pastedLength,
      type: 'paste',
    });
    this.lastTime = now;
  }

  trackDelete(): void {
    const now = Date.now();
    const delta = now - this.lastTime;
    this.events.push({ key: 'delete', timestamp: now, delta, type: 'delete' });
    this.lastTime = now;
  }

  computeWPM(finalText: string): number {
    if (this.events.length < 2) return 0;
    const first = this.events[0].timestamp;
    const last = this.events[this.events.length - 1].timestamp;
    const durationMinutes = (last - first) / 1000 / 60;
    if (durationMinutes <= 0) return 0;
    const words = finalText.trim().split(/\s+/).filter(Boolean).length;
    return Math.round(words / durationMinutes);
  }

  hasPaste(): boolean {
    return this.events.some((e) => e.type === 'paste');
  }

  getEvents(): KeystrokeEvent[] {
    return [...this.events];
  }

  getCount(): number {
    return this.events.filter((e) => e.type === 'keydown').length;
  }

  reset(): void {
    this.events = [];
    this.lastTime = Date.now();
  }

  /**
   * Detects suspiciously fast typing bursts (> 200 WPM sustained for > 5 chars).
   * Returns true if anomaly found.
   */
  detectBurst(threshold = 200): boolean {
    const keydowns = this.events.filter((e) => e.type === 'keydown');
    if (keydowns.length < 5) return false;

    for (let i = 4; i < keydowns.length; i++) {
      const window = keydowns.slice(i - 4, i + 1);
      const elapsed = (window[window.length - 1].timestamp - window[0].timestamp) / 1000 / 60;
      if (elapsed <= 0) continue;
      const wpm = 5 / elapsed; // 5 chars ≈ 1 word
      if (wpm > threshold) return true;
    }
    return false;
  }
}

// ─── React hook wrapper ───────────────────────────────────────────────────────
import { useRef } from 'react';

export function useKeystrokeTracker() {
  const trackerRef = useRef<KeystrokeTracker>(new KeystrokeTracker());

  const recordKey = (key: string, type: KeystrokeEvent['type'] = 'keydown') => {
    trackerRef.current.track(key, type);
  };

  const recordPaste = (pastedText = '') => {
    trackerRef.current.trackPaste(pastedText.length);
  };

  const reset = () => {
    trackerRef.current.reset();
  };

  const getStats = () => {
    const tracker = trackerRef.current;
    return {
      keystrokes: tracker.getEvents(),
      wpm: undefined as number | undefined,
      pasteDetected: tracker.hasPaste(),
      keystrokeCount: tracker.getCount(),
    };
  };

  return { recordKey, recordPaste, reset, getStats };
}

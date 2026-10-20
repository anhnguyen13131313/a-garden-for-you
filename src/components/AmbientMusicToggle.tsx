import { useEffect, useRef, useState } from 'react';
import { IconMusicOff, IconMusicOn } from './BotanicalIcons';

// Dreamy celesta / music-box arpeggio progression: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
const LULLABY_NOTES_HZ = [
  // Fmaj7 (F4, A4, C5, E5)
  349.23, 440.0, 523.25, 659.25,
  // Em7 (E4, G4, B4, D5)
  329.63, 392.0, 493.88, 587.33,
  // Dm7 (D4, F4, A4, C5)
  293.66, 349.23, 440.0, 523.25,
  // Cmaj7 (C4, E4, G4, B4)
  261.63, 329.63, 392.0, 493.88,
] as const;

/**
 * Unobtrusive top-right floating ambient music toggle.
 * OFF by default — never autoplays. Synthesizes a soft celesta music-box lullaby
 * via Web Audio API with zero external audio asset overhead.
 */
export function AmbientMusicToggle() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const noteIndexRef = useRef<number>(0);

  function stopArpeggioLoop() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function playCelestaNote(ctx: AudioContext, freq: number) {
    if (ctx.state !== 'running') return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const overtoneGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, now);

    // Gentle music-box bell envelope (peak 0.035 gain)
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);

    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(0.008, now + 0.02);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 1.5);
    overtone.stop(now + 0.7);
  }

  function startArpeggioLoop(ctx: AudioContext) {
    stopArpeggioLoop();
    playCelestaNote(
      ctx,
      LULLABY_NOTES_HZ[noteIndexRef.current % LULLABY_NOTES_HZ.length],
    );
    noteIndexRef.current += 1;

    timerRef.current = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      playCelestaNote(
        ctx,
        LULLABY_NOTES_HZ[noteIndexRef.current % LULLABY_NOTES_HZ.length],
      );
      noteIndexRef.current += 1;
    }, 620);
  }

  function handleToggleMusic() {
    if (isPlaying) {
      stopArpeggioLoop();
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        void audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    void ctx.resume().then(() => {
      startArpeggioLoop(ctx);
      setIsPlaying(true);
    });
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (document.visibilityState === 'hidden') {
        if (ctx.state === 'running') {
          void ctx.suspend();
        }
      } else if (isPlaying && ctx.state === 'suspended') {
        void ctx.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopArpeggioLoop();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  return (
    <button
      type="button"
      className="ambient-music-toggle"
      data-playing={isPlaying ? 'true' : 'false'}
      aria-pressed={isPlaying}
      aria-label={
        isPlaying ? 'Tắt nhạc nền khu vườn' : 'Bật nhạc nền dịu nhẹ'
      }
      onClick={handleToggleMusic}
    >
      <span className="ambient-music-toggle__icon" aria-hidden="true">
        {isPlaying ? <IconMusicOn size={17} /> : <IconMusicOff size={17} />}
      </span>
      <span className="ambient-music-toggle__label">
        {isPlaying ? 'Nhạc dịu' : 'Nhạc tắt'}
      </span>
    </button>
  );
}


import { useEffect, useState } from 'react';
import { IconHeart, IconReplay } from '../components/BotanicalIcons';
import { FlowerArt } from '../components/FlowerArt';
import { SceneShell } from '../components/SceneShell';
import { gardenContent as copy } from '../content/gardenContent';
import {
  gardenState,
  replayExperience,
  requestFinaleBloom,
  subscribeFinaleStage,
  type FinaleBloomStage,
} from '../motion/gardenStore';

export function FinaleScene() {
  const [finaleStage, setFinaleStage] = useState<FinaleBloomStage>(
    gardenState.finaleStage,
  );

  useEffect(() => {
    setFinaleStage(gardenState.finaleStage);
    return subscribeFinaleStage((nextStage) => {
      setFinaleStage(nextStage);
    });
  }, []);

  function handleTriggerFinale() {
    requestFinaleBloom();
  }

  function handleReplay() {
    replayExperience();
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    document.getElementById('invitation')?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  const isHeartBloomed = finaleStage === 'blooming' || finaleStage === 'heart';

  return (
    <SceneShell
      id="finale"
      eyebrow={copy.finale.eyebrow}
      className="scene--finale"
      ornament={<div className="finale-twilight-halo" aria-hidden="true" />}
    >
      <div className="finale-layout" data-finale-stage={finaleStage}>
        {/* Beat 01 — The Pause */}
        <p className="finale-pause-whisper" data-finale-intro="pause">
          Khu vườn khẽ lắng lại trong ánh chiều dịu...
        </p>

        {/* Beat 02 — The Final Interaction */}
        <div className="finale-trigger-wrap" data-finale-intro="trigger">
          <button
            type="button"
            className="finale-trigger-btn"
            data-active={isHeartBloomed ? 'true' : 'false'}
            aria-expanded={isHeartBloomed}
            onClick={handleTriggerFinale}
          >
            <IconHeart size={18} />
            <span>Anh còn một điều muốn nói...</span>
          </button>
        </div>

        {/* Beat 03 & Beat 04 — The Bloom & The Heart */}
        <div
          className="finale-heart-stage"
          data-finale-intro="heart"
          data-finale-stage={finaleStage}
          aria-hidden="true"
        >
          <svg
            className="finale-heart-svg"
            viewBox="0 0 240 210"
            fill="none"
          >
            <defs>
              <radialGradient id="finale-heart-glow" cx="50%" cy="46%" r="54%">
                <stop offset="0%" stopColor="rgba(255, 232, 240, 0.85)" />
                <stop offset="55%" stopColor="rgba(244, 174, 198, 0.38)" />
                <stop offset="100%" stopColor="rgba(244, 174, 198, 0)" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="104" r="92" fill="url(#finale-heart-glow)" />
            <path
              className="finale-heart-svg__path"
              d="M120 176 C120 176, 42 128, 42 74 C42 46, 65 28, 90 28 C106 28, 115 37, 120 48 C125 37, 134 28, 150 28 C175 28, 198 46, 198 74 C198 128, 120 176, 120 176 Z"
              stroke="rgba(182, 54, 102, 0.58)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255, 224, 236, 0.28)"
            />
            <g className="finale-heart-svg__petals" fill="#d94b7d">
              <circle cx="120" cy="46" r="4.5" fill="#ffcf70" />
              <circle cx="90" cy="28" r="5" />
              <circle cx="150" cy="28" r="5" />
              <circle cx="54" cy="48" r="4.5" fill="#f082a8" />
              <circle cx="186" cy="48" r="4.5" fill="#f082a8" />
              <circle cx="43" cy="82" r="5" />
              <circle cx="197" cy="82" r="5" />
              <circle cx="64" cy="120" r="4.5" fill="#f082a8" />
              <circle cx="176" cy="120" r="4.5" fill="#f082a8" />
              <circle cx="92" cy="150" r="4.5" />
              <circle cx="148" cy="150" r="4.5" />
              <circle cx="120" cy="176" r="5.5" fill="#ffcf70" />
            </g>
          </svg>

          <div className="finale-flowers">
            <FlowerArt
              size="small"
              variant="bud"
              className="flower-art--finale-fallback"
            />
            <FlowerArt
              variant="bloom"
              className="flower-art--finale-fallback"
            />
            <FlowerArt
              size="small"
              variant="bloom"
              className="flower-art--finale-fallback"
            />
          </div>
        </div>

        {/* Beat 05 — The Love Message */}
        <div
          className="finale-love-card"
          data-finale-intro="card"
          data-finale-stage={finaleStage}
        >
          <h2 className="scene__heading scene__heading--finale">
            {copy.finale.title}
          </h2>
          <p className="finale-love-card__en">Happy Women&apos;s Day, My Love.</p>
          <p className="finale-love-card__vi-highlight">
            Anh yêu em nhiều lắm. ❤️
          </p>
          <p className="scene__copy finale-love-card__message">
            {copy.finale.message}
          </p>
          <p className="finale-signature">{copy.finale.signature}</p>
        </div>

        {/* Beat 06 — The Ending */}
        <div className="finale-ending" data-finale-intro="replay">
          <button
            type="button"
            className="finale-replay-btn"
            onClick={handleReplay}
          >
            <IconReplay size={18} />
            <span>Ngắm khu vườn một lần nữa 🌷</span>
          </button>
        </div>
      </div>
    </SceneShell>
  );
}

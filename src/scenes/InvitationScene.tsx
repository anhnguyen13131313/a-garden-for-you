import { useEffect, useState } from 'react';
import { FlowerArt } from '../components/FlowerArt';
import { SceneShell } from '../components/SceneShell';
import { gardenContent as copy } from '../content/gardenContent';
import {
  gardenState,
  requestHeroBloom,
  subscribeHeroBloomStage,
  type HeroBloomStage,
} from '../motion/gardenStore';

export function InvitationScene() {
  const [bloomStage, setBloomStage] = useState<HeroBloomStage>(gardenState.bloomStage);

  useEffect(() => {
    setBloomStage(gardenState.bloomStage);
    return subscribeHeroBloomStage((nextStage) => {
      setBloomStage(nextStage);
    });
  }, []);

  function handleBloomTrigger() {
    const previousUserTriggered = gardenState.userTriggeredBloom;
    requestHeroBloom();

    if (!gardenState.userTriggeredBloom && !previousUserTriggered) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('first-bloom')?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }

  return (
    <SceneShell
      id="invitation"
      className="scene--hero"
      ornament={<div className="hero-orb hero-orb--one" aria-hidden="true" />}
    >
      <div className="hero-layout" data-bloom-stage={bloomStage}>
        <header className="hero-header">
          <h1 className="scene__heading scene__heading--hero" data-hero-intro="heading">
            {copy.heroTitle}
          </h1>
          <p className="scene__copy" data-hero-intro="copy">
            {copy.heroSubtitle}
          </p>
          <p className="scene__date-note" data-hero-intro="tag">
            <span>{copy.heroEyebrow}</span>
            <span aria-hidden="true"> · </span>
            <span>A little garden, just for you</span>
          </p>
        </header>

        <div className="hero-botanical-stage" data-hero-intro="trigger">
          <button
            type="button"
            className="flower-trigger"
            data-bloom-stage={bloomStage}
            onClick={handleBloomTrigger}
            aria-label={`${copy.invitationHint} — mở bông hoa đầu tiên`}
          >
            <span className="flower-trigger__focal-window" aria-hidden="true">
              <span className="flower-trigger__dew-ring" />
              <span className="flower-trigger__dew-ring flower-trigger__dew-ring--outer" />
              <FlowerArt
                variant={bloomStage === 'bud' ? 'bud' : 'bloom'}
                stage={bloomStage}
                className="flower-art--hero-fallback"
              />
            </span>
            <span className="flower-trigger__pill">
              <span>{copy.invitationHint}</span>
              <span className="flower-trigger__icon" aria-hidden="true">
                ↗
              </span>
            </span>
          </button>
        </div>

        <p className="scroll-hint" data-hero-intro="scroll">
          Vuốt xuống để khám phá <span aria-hidden="true">↓</span>
        </p>
      </div>
    </SceneShell>
  );
}

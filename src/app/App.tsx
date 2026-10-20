import { lazy, Suspense, useEffect, useMemo, useRef } from 'react';
import { AmbientMusicToggle } from '../components/AmbientMusicToggle';
import { GardenLoadingVeil } from '../components/GardenLoadingVeil';
import { PetalField } from '../components/PetalField';
import { getInitialQuality } from '../lib/performance';
import { markCanvasReady } from '../motion/gardenStore';
import { useHeroBloomTimeline } from '../motion/useHeroBloomTimeline';
import { FinaleScene } from '../scenes/FinaleScene';
import { FirstBloomScene } from '../scenes/FirstBloomScene';
import { GardenScene } from '../scenes/GardenScene';
import { InvitationScene } from '../scenes/InvitationScene';
import { MemoryFlowersScene } from '../scenes/MemoryFlowersScene';
import { WishScene } from '../scenes/WishScene';

const LazyGardenCanvas = lazy(() => import('../three/GardenCanvas'));

/** Entrypoint: functional 2D fallback; progressive 3D Garden enhances Scenes 01–06. */
export default function App() {
  const appRef = useRef<HTMLDivElement | null>(null);
  const quality = useMemo(() => getInitialQuality(), []);
  const { petalCount, tier, webglSupported } = quality;

  useHeroBloomTimeline(appRef);

  const showWebGLStage = webglSupported && tier !== 'static';

  useEffect(() => {
    if (!showWebGLStage) {
      markCanvasReady();
    }
  }, [showWebGLStage]);

  return (
    <div
      ref={appRef}
      className={`garden-app ${!showWebGLStage ? 'garden-app--webgl-fallback' : ''}`.trim()}
      data-quality={tier}
    >
      <a className="skip-link" href="#memories">
        Bỏ qua hiệu ứng, đến lời nhắn
      </a>
      <GardenLoadingVeil />
      <AmbientMusicToggle />
      {showWebGLStage ? (
        <Suspense fallback={null}>
          <LazyGardenCanvas quality={quality} />
        </Suspense>
      ) : null}
      <PetalField count={Math.min(petalCount, 12)} />
      <main>
        <InvitationScene />
        <FirstBloomScene />
        <GardenScene />
        <MemoryFlowersScene />
        <WishScene />
        <FinaleScene />
      </main>
      <footer className="site-footer">Made with love · October 20, 2026 🌷</footer>
    </div>
  );
}

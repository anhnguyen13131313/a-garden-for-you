import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { createFramePacingGuard, getInitialQuality, SceneQuality } from '../lib/performance';
import { markCanvasReady } from '../motion/gardenStore';
import { HeroCameraRig } from './HeroCameraRig';
import { HeroDewParticles } from './HeroDewParticles';
import { LivingGardenField } from './LivingGardenField';
import { ProceduralHeroFlower } from './ProceduralHeroFlower';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

export interface GardenCanvasProps {
  quality?: SceneQuality;
}

interface FramePacingMonitorProps {
  onDowngrade: () => void;
}

function FramePacingMonitor({ onDowngrade }: FramePacingMonitorProps) {
  const recordDelta = useMemo(() => createFramePacingGuard(onDowngrade), [onDowngrade]);

  useFrame((_, delta) => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    recordDelta(delta);
  });

  return null;
}

export function GardenCanvas({ quality: propQuality }: GardenCanvasProps) {
  const initialQuality = useMemo(() => propQuality ?? getInitialQuality(), [propQuality]);
  const [currentDprCap, setCurrentDprCap] = useState<number>(initialQuality.dprCap);

  const handleDowngrade = useCallback(() => {
    setCurrentDprCap((prev) => Math.max(1, Number((prev * 0.75).toFixed(2))));
  }, []);

  useEffect(() => {
    if (!initialQuality.webglSupported || initialQuality.tier === 'static') {
      markCanvasReady();
    }
  }, [initialQuality.tier, initialQuality.webglSupported]);

  if (!initialQuality.webglSupported || initialQuality.tier === 'static') {
    return null;
  }

  return (
    <WebGLErrorBoundary fallback={null}>
      <div className="garden-canvas-stage" aria-hidden="true">
        <Canvas
          dpr={[1, currentDprCap]}
          gl={{
            alpha: true,
            antialias: initialQuality.tier !== 'low',
            powerPreference: 'high-performance',
          }}
          camera={{
            fov: 38,
            near: 0.1,
            far: 30,
            position: [0, 0.4, 4.9],
          }}
          onCreated={() => {
            markCanvasReady();
          }}
        >
          <fog attach="fog" args={['#fae8ee', 4.8, 13.5]} />
          <Suspense fallback={null}>
            <FramePacingMonitor onDowngrade={handleDowngrade} />
            <HeroCameraRig />
            <ProceduralHeroFlower quality={initialQuality} />
            <LivingGardenField quality={initialQuality} />
            <HeroDewParticles quality={initialQuality} />
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}

export default GardenCanvas;

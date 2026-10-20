/**
 * Progressive quality heuristics and WebGL capability detection.
 * Prioritizes portrait smartphone stability (320px-430px) and battery/thermal safety.
 */
export type QualityTier = 'static' | 'low' | 'medium' | 'high';

export interface SceneQuality {
  tier: QualityTier;
  dprCap: number;
  petalCount: number;
  /** Total procedural flowers in the Living Garden field (foreground + midground + background) */
  gardenFlowerCount: number;
  /** Ambient foliage/leaf clusters in the Living Garden */
  gardenFoliageCount: number;
  heroPetalDetail: 'low' | 'medium' | 'high';
  bloom: boolean;
  webglSupported: boolean;
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let cachedWebGLSupport: boolean | null = null;

/** Safely probes whether WebGL is available and can create a rendering context. */
export function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { powerPreference: 'high-performance' }) ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cachedWebGLSupport = Boolean(gl);
    return cachedWebGLSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}

export function getInitialQuality(): SceneQuality {
  if (typeof window === 'undefined') {
    return {
      tier: 'static',
      dprCap: 1,
      petalCount: 0,
      gardenFlowerCount: 0,
      gardenFoliageCount: 0,
      heroPetalDetail: 'low',
      bloom: false,
      webglSupported: false,
    };
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webglSupported = isWebGLAvailable();

  if (reduce || !webglSupported) {
    return {
      tier: 'static',
      dprCap: 1,
      petalCount: 0,
      gardenFlowerCount: 0,
      gardenFoliageCount: 0,
      heroPetalDetail: 'low',
      bloom: false,
      webglSupported,
    };
  }

  const nav = navigator as NavigatorWithHints;
  const memory = nav.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const lowPower =
    Boolean(nav.connection?.saveData) ||
    (typeof memory === 'number' && memory <= 2) ||
    (typeof cores === 'number' && cores <= 2);

  if (lowPower) {
    return {
      tier: 'low',
      dprCap: 1,
      petalCount: 12,
      gardenFlowerCount: 16,
      gardenFoliageCount: 20,
      heroPetalDetail: 'low',
      bloom: false,
      webglSupported: true,
    };
  }

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (isMobile) {
    return {
      tier: 'medium',
      dprCap: 1.5,
      petalCount: 22,
      gardenFlowerCount: 28,
      gardenFoliageCount: 36,
      heroPetalDetail: 'medium',
      bloom: false,
      webglSupported: true,
    };
  }

  return {
    tier: 'high',
    dprCap: 2,
    petalCount: 34,
    gardenFlowerCount: 44,
    gardenFoliageCount: 54,
    heroPetalDetail: 'high',
    bloom: true,
    webglSupported: true,
  };
}

/**
 * Lightweight frame-time sliding monitor for use inside R3F useFrame.
 * Avoids React state updates; invokes `onDowngrade` at most once if sustained frame drops occur.
 */
export function createFramePacingGuard(onDowngrade: () => void) {
  let slowFrames = 0;
  let downgraded = false;
  let warmupFrames = 25;

  return function recordDelta(deltaSeconds: number) {
    if (downgraded) return;
    if (warmupFrames > 0) {
      warmupFrames -= 1;
      return;
    }
    // Ignore tab-switch spikes (> 200ms)
    if (deltaSeconds > 0.2) return;

    if (deltaSeconds > 0.031) {
      slowFrames += 1;
      if (slowFrames >= 42) {
        downgraded = true;
        onDowngrade();
      }
    } else if (slowFrames > 0) {
      slowFrames -= 0.5;
    }
  };
}

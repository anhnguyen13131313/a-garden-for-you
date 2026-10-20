/**
 * Shared mutable animation & interaction store for Phases 2–5
 * (Scene 01 Invitation -> Scene 02 First Bloom -> Scene 03 The Living Garden
 *  -> Scene 04 Five Little Flowers -> Scene 05 Through Every Season -> Scene 06 Grand Finale).
 *
 * Read directly inside R3F `useFrame` and updated by GSAP timelines / DOM events
 * without triggering per-frame React re-renders.
 */

import type { MemoryFlower } from '../content/gardenContent';

export type HeroBloomStage = 'bud' | 'blooming' | 'bloomed';

export type FinaleBloomStage = 'calm' | 'blooming' | 'heart';

export type BotanicalFlowerArchetype = 'rose' | 'peony' | 'blossom' | 'bud';

export type GardenDepthLayer = 'foreground' | 'midground' | 'background';

export type MemoryFlowerId = MemoryFlower['id'];

/**
 * Reusable interactive flower contract so the 5 signature memory flowers in the garden
 * respond to touch in Scene 03 & Scene 04 and connect directly to canonical love messages.
 */
export interface InteractiveFlowerNode {
  id: string;
  /** Link to one of the 5 canonical memory flowers ('little-things' | 'funny-moment' | ...) */
  memoryId: MemoryFlowerId;
  archetype: BotanicalFlowerArchetype;
  layer: GardenDepthLayer;
  /** World-space anchor position [x, y, z] */
  position: [number, number, number];
  /** Distinct botanical petal hue for this signature flower */
  colorHex: string;
  /** Current touch bend/ripple impulse (0..1, decays smoothly in useFrame) */
  touchImpulse: number;
  /** Extra bloom boost when touched or highlighted (0..0.35) */
  bloomBoost: number;
  /** Soft highlight glow intensity (0..1) */
  highlight: number;
  /** Whether the visitor has discovered/opened this flower's message */
  discovered: boolean;
}

export interface GardenTouchRipple {
  /** Normalized screen coords (-1..1) where user last tapped/touched in the garden */
  ndcX: number;
  ndcY: number;
  /** World-space approximated touch point on the garden plane */
  worldX: number;
  worldY: number;
  worldZ: number;
  /** Strength of the ripple (0..1, decays over ~1.4s) */
  strength: number;
  /** Timestamp or sequence counter for discrete touch reactions */
  nonce: number;
}

export interface MemoryDiscoverySnapshot {
  activeMemoryId: MemoryFlowerId | null;
  discoveredMemoryIds: readonly MemoryFlowerId[];
  sixYearMomentActive: boolean;
}

export interface GardenMutableState {
  /** 0.08 = delicate closed bud, 1.0 = fully unfurled rose in full bloom */
  bloomProgress: number;
  /** 0.0 = Scene 01 (Invitation), 1.0 = Scene 02 (First Bloom) transition progress */
  sceneTransition: number;
  /** 0.0 = Scene 02 (First Bloom), 1.0 = Scene 03 (Your Own Garden) reveal & camera pullback */
  gardenRevealProgress: number;
  /** 0.0 = Scene 03 (Your Own Garden), 1.0 = Scene 04 (Five Little Flowers) constellation focus */
  memoriesFocusProgress: number;
  /** 0.0 = inside Scenes 01–04, 1.0 = scrolled past Scene 04 into Scene 05 (#wish) */
  postGardenProgress: number;
  /** 0.0 = before Scene 05, 1.0 = Scene 05 (#wish) golden-hour sunset atmosphere */
  sunsetProgress: number;
  /** 0.0 = before Scene 06, 1.0 = Scene 06 (#finale) twilight calm framing */
  finaleProgress: number;
  /** True after visitor taps "Anh còn một điều muốn nói..." in Scene 06 */
  finaleBloomActive: boolean;
  /** 0.0 -> 1.0 progress of the swirling petal heart formation in Scene 06 */
  finaleHeartProgress: number;
  /** Discrete stage of Scene 06 finale ('calm' | 'blooming' | 'heart') */
  finaleStage: FinaleBloomStage;
  /** True once the 3D WebGL canvas has rendered or fallback mode is active */
  canvasReady: boolean;
  /** Overall page scroll progress (0..1) */
  scrollProgress: number;
  /** 0.0 = pearlescent morning mist, 1.0 = warm golden-rose bloom radiance */
  lightWarmth: number;
  /** Transient impulse (0..1) when user taps a flower to release luminous pollen/dew motes */
  particleBurst: number;
  /** Normalized pointer/touch tilt (-1..1) for subtle portrait parallax */
  pointerX: number;
  pointerY: number;
  /** Discrete stage for accessible UI feedback */
  bloomStage: HeroBloomStage;
  /** Whether the user has explicitly triggered the bloom via touch/click */
  userTriggeredBloom: boolean;
  /** Touch ripple state for interactive garden flowers */
  touchRipple: GardenTouchRipple;
  /** Registry of the 5 signature interactive memory flowers in the Living Garden */
  interactiveFlowers: InteractiveFlowerNode[];
  /** Currently touched/highlighted special flower ID (if any) */
  lastTouchedFlowerId: string | null;
  /** Currently open signature flower message ID in Scene 04 (null when sheet closed) */
  activeMemoryId: MemoryFlowerId | null;
  /** Ordered list of unique memory flower IDs discovered by the visitor (0..5) */
  discoveredMemoryIds: MemoryFlowerId[];
  /** True while the botanical letter bottom sheet is open (calms background wind) */
  isReadingMemory: boolean;
  /** True while the third flower ('six-years' — 6 Years Together) is active */
  sixYearMomentActive: boolean;
}

/**
 * 5 Signature Memory Flowers arranged in a balanced portrait constellation in the midground:
 * - Flower 01 ('little-things'): Upper-left sculpted heritage rose
 * - Flower 02 ('funny-moment'): Upper-right ruffled sakura peony
 * - Flower 03 ('six-years'): Centerpiece golden-heart rose (anchored by ProceduralHeroFlower)
 * - Flower 04 ('wishes'): Lower-left golden-star companion blossom
 * - Flower 05 ('one-more-thing'): Lower-right velvet damask peony
 */
export const INITIAL_INTERACTIVE_FLOWERS: InteractiveFlowerNode[] = [
  {
    id: 'special-flower-01',
    memoryId: 'little-things',
    archetype: 'rose',
    layer: 'midground',
    position: [-0.82, 0.14, -0.68],
    colorHex: '#e46088',
    touchImpulse: 0,
    bloomBoost: 0,
    highlight: 0,
    discovered: false,
  },
  {
    id: 'special-flower-02',
    memoryId: 'funny-moment',
    archetype: 'peony',
    layer: 'midground',
    position: [0.84, 0.12, -0.74],
    colorHex: '#f398b4',
    touchImpulse: 0,
    bloomBoost: 0,
    highlight: 0,
    discovered: false,
  },
  {
    id: 'special-flower-03',
    memoryId: 'six-years',
    archetype: 'rose',
    layer: 'midground',
    position: [0.0, 0.04, -0.25],
    colorHex: '#c43662',
    touchImpulse: 0,
    bloomBoost: 0,
    highlight: 0,
    discovered: false,
  },
  {
    id: 'special-flower-04',
    memoryId: 'wishes',
    archetype: 'blossom',
    layer: 'midground',
    position: [-0.62, -0.22, -0.18],
    colorHex: '#fff1db',
    touchImpulse: 0,
    bloomBoost: 0,
    highlight: 0,
    discovered: false,
  },
  {
    id: 'special-flower-05',
    memoryId: 'one-more-thing',
    archetype: 'peony',
    layer: 'midground',
    position: [0.64, -0.20, -0.22],
    colorHex: '#d95882',
    touchImpulse: 0,
    bloomBoost: 0,
    highlight: 0,
    discovered: false,
  },
];

export const gardenState: GardenMutableState = {
  bloomProgress: 0.08,
  sceneTransition: 0,
  gardenRevealProgress: 0,
  memoriesFocusProgress: 0,
  postGardenProgress: 0,
  sunsetProgress: 0,
  finaleProgress: 0,
  finaleBloomActive: false,
  finaleHeartProgress: 0,
  finaleStage: 'calm',
  canvasReady: false,
  scrollProgress: 0,
  lightWarmth: 0.1,
  particleBurst: 0,
  pointerX: 0,
  pointerY: 0,
  bloomStage: 'bud',
  userTriggeredBloom: false,
  touchRipple: {
    ndcX: 0,
    ndcY: 0,
    worldX: 0,
    worldY: 0,
    worldZ: -0.6,
    strength: 0,
    nonce: 0,
  },
  interactiveFlowers: INITIAL_INTERACTIVE_FLOWERS.map((f) => ({ ...f })),
  lastTouchedFlowerId: null,
  activeMemoryId: null,
  discoveredMemoryIds: [],
  isReadingMemory: false,
  sixYearMomentActive: false,
};

type StageListener = (stage: HeroBloomStage) => void;
type FinaleStageListener = (stage: FinaleBloomStage) => void;
type CanvasReadyListener = (ready: boolean) => void;
type ActionHandler = () => void;
type FlowerTouchListener = (flower: InteractiveFlowerNode) => void;
type MemoryStateListener = (snapshot: MemoryDiscoverySnapshot) => void;

const stageListeners = new Set<StageListener>();
const finaleStageListeners = new Set<FinaleStageListener>();
const canvasReadyListeners = new Set<CanvasReadyListener>();
const flowerTouchListeners = new Set<FlowerTouchListener>();
const memoryStateListeners = new Set<MemoryStateListener>();
let registeredBloomHandler: ActionHandler | null = null;
let registeredFinaleHandler: ActionHandler | null = null;
let registeredReplayHandler: ActionHandler | null = null;

function notifyMemoryListeners(): void {
  const snapshot: MemoryDiscoverySnapshot = {
    activeMemoryId: gardenState.activeMemoryId,
    discoveredMemoryIds: [...gardenState.discoveredMemoryIds],
    sixYearMomentActive: gardenState.sixYearMomentActive,
  };
  memoryStateListeners.forEach((listener) => listener(snapshot));
}

export function setHeroBloomStage(stage: HeroBloomStage): void {
  if (gardenState.bloomStage === stage) return;
  gardenState.bloomStage = stage;
  stageListeners.forEach((listener) => listener(stage));
}

export function subscribeHeroBloomStage(listener: StageListener): () => void {
  stageListeners.add(listener);
  return () => {
    stageListeners.delete(listener);
  };
}

export function registerHeroBloomTrigger(handler: ActionHandler | null): void {
  registeredBloomHandler = handler;
}

/**
 * Invoked when the visitor taps the 3D flower bud or the DOM invitation trigger.
 */
export function requestHeroBloom(): void {
  if (registeredBloomHandler) {
    registeredBloomHandler();
  }
}

export function setFinaleStage(stage: FinaleBloomStage): void {
  if (gardenState.finaleStage === stage) return;
  gardenState.finaleStage = stage;
  finaleStageListeners.forEach((listener) => listener(stage));
}

export function subscribeFinaleStage(listener: FinaleStageListener): () => void {
  finaleStageListeners.add(listener);
  return () => {
    finaleStageListeners.delete(listener);
  };
}

export function registerFinaleBloomTrigger(handler: ActionHandler | null): void {
  registeredFinaleHandler = handler;
}

/**
 * Invoked when the visitor taps "Anh còn một điều muốn nói..." in Scene 06.
 */
export function requestFinaleBloom(): void {
  if (registeredFinaleHandler) {
    registeredFinaleHandler();
  } else {
    gardenState.finaleBloomActive = true;
    gardenState.finaleHeartProgress = 1;
    setFinaleStage('heart');
  }
}

export function registerReplayHandler(handler: ActionHandler | null): void {
  registeredReplayHandler = handler;
}

/**
 * Replays the garden experience from the beginning without reloading the website.
 */
export function replayExperience(): void {
  closeMemoryFlower();
  if (registeredReplayHandler) {
    registeredReplayHandler();
  } else {
    gardenState.finaleBloomActive = false;
    gardenState.finaleHeartProgress = 0;
    setFinaleStage('calm');
  }
}

export function markCanvasReady(): void {
  if (gardenState.canvasReady) return;
  gardenState.canvasReady = true;
  canvasReadyListeners.forEach((listener) => listener(true));
}

export function subscribeCanvasReady(listener: CanvasReadyListener): () => void {
  canvasReadyListeners.add(listener);
  return () => {
    canvasReadyListeners.delete(listener);
  };
}

/**
 * Opens a specific signature memory flower (1 of 5), triggering its 3D bloom boost,
 * marking it discovered, calming background wind, and activating the Six-Year golden moment if 'six-years'.
 */
export function openMemoryFlower(memoryId: MemoryFlowerId): InteractiveFlowerNode | null {
  let targetNode: InteractiveFlowerNode | null = null;

  for (let i = 0; i < gardenState.interactiveFlowers.length; i++) {
    const node = gardenState.interactiveFlowers[i];
    if (node.memoryId === memoryId) {
      node.discovered = true;
      node.touchImpulse = 1.0;
      node.bloomBoost = 0.35;
      node.highlight = 1.0;
      targetNode = node;
    } else {
      // Gently settle other flowers so only the selected flower blooms into focus
      node.highlight = Math.min(node.highlight, 0.15);
    }
  }

  if (!gardenState.discoveredMemoryIds.includes(memoryId)) {
    gardenState.discoveredMemoryIds = [...gardenState.discoveredMemoryIds, memoryId];
  }

  gardenState.activeMemoryId = memoryId;
  gardenState.isReadingMemory = true;
  gardenState.sixYearMomentActive = memoryId === 'six-years';

  if (targetNode) {
    gardenState.lastTouchedFlowerId = targetNode.id;
    gardenState.touchRipple.worldX = targetNode.position[0];
    gardenState.touchRipple.worldY = targetNode.position[1];
    gardenState.touchRipple.worldZ = targetNode.position[2];
    gardenState.touchRipple.ndcX = Math.max(-1, Math.min(1, targetNode.position[0] / 1.15));
    gardenState.touchRipple.ndcY = Math.max(-1, Math.min(1, targetNode.position[1] / 0.85));
    gardenState.touchRipple.strength = 1.0;
    gardenState.touchRipple.nonce += 1;
    gardenState.particleBurst = Math.max(
      gardenState.particleBurst,
      memoryId === 'six-years' ? 1.0 : 0.65,
    );
    flowerTouchListeners.forEach((listener) => listener(targetNode!));
  }

  notifyMemoryListeners();
  return targetNode;
}

/**
 * Closes the currently open botanical memory letter sheet and returns the garden to normal motion.
 */
export function closeMemoryFlower(): void {
  if (
    gardenState.activeMemoryId === null &&
    !gardenState.isReadingMemory &&
    !gardenState.sixYearMomentActive
  ) {
    return;
  }
  gardenState.activeMemoryId = null;
  gardenState.isReadingMemory = false;
  gardenState.sixYearMomentActive = false;
  notifyMemoryListeners();
}

export function subscribeMemoryState(listener: MemoryStateListener): () => void {
  memoryStateListeners.add(listener);
  return () => {
    memoryStateListeners.delete(listener);
  };
}

/**
 * Triggers a localized botanical touch reaction in the 3D garden at normalized screen coordinates.
 * Activates at most the single closest flower within radius so one tap never activates multiple flowers.
 */
export function triggerGardenTouchRipple(ndcX: number, ndcY: number): InteractiveFlowerNode | null {
  const worldX = ndcX * 1.45;
  const worldY = ndcY * 0.95;
  const worldZ = -0.55 - (1 - ndcY) * 0.45;

  gardenState.touchRipple.ndcX = ndcX;
  gardenState.touchRipple.ndcY = ndcY;
  gardenState.touchRipple.worldX = worldX;
  gardenState.touchRipple.worldY = worldY;
  gardenState.touchRipple.worldZ = worldZ;
  gardenState.touchRipple.strength = 1.0;
  gardenState.touchRipple.nonce += 1;
  gardenState.particleBurst = Math.max(gardenState.particleBurst, 0.55);

  let closestFlower: InteractiveFlowerNode | null = null;
  let closestDistSq = Infinity;

  for (let i = 0; i < gardenState.interactiveFlowers.length; i++) {
    const node = gardenState.interactiveFlowers[i];
    const dx = node.position[0] - worldX;
    const dy = node.position[1] - worldY;
    const dz = (node.position[2] - worldZ) * 0.4;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < 1.25 && distSq < closestDistSq) {
      closestDistSq = distSq;
      closestFlower = node;
    }
  }

  // Apply touch boost to the single closest signature flower so one tap never activates multiple flowers
  if (closestFlower) {
    closestFlower.touchImpulse = 1.0;
    closestFlower.bloomBoost = 0.32;
    closestFlower.highlight = 1.0;
    gardenState.lastTouchedFlowerId = closestFlower.id;
    flowerTouchListeners.forEach((listener) => listener(closestFlower!));
  }

  return closestFlower;
}

export function subscribeGardenFlowerTouch(listener: FlowerTouchListener): () => void {
  flowerTouchListeners.add(listener);
  return () => {
    flowerTouchListeners.delete(listener);
  };
}

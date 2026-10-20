import { useEffect, useMemo, useRef } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneQuality } from '../lib/performance';
import {
  BotanicalFlowerArchetype,
  GardenDepthLayer,
  gardenState,
  MemoryFlowerId,
  openMemoryFlower,
  triggerGardenTouchRipple,
} from '../motion/gardenStore';
import {
  createBotanicalLeafGeometry,
  createCompanionBlossomGeometry,
  createGardenStemWithLeavesGeometry,
  createPeonyCrownGeometry,
  createRoseCrownGeometry,
  createSlenderRosebudGeometry,
} from './flowerGeometry';
import {
  createGardenInstancedFoliageMaterial,
  createGardenInstancedPetalMaterial,
} from './flowerMaterial';

interface LivingGardenFieldProps {
  quality: SceneQuality;
}

interface FlowerInstanceSeed {
  id: string;
  archetype: BotanicalFlowerArchetype;
  layer: GardenDepthLayer;
  position: [number, number, number];
  rotation: [number, number, number];
  baseScale: number;
  colorHex: string;
  phase: number;
  revealDelay: number;
  /** Index into gardenState.interactiveFlowers if this is one of the 5 signature flowers */
  interactiveIndex: number | null;
}

interface FoliageInstanceSeed {
  position: [number, number, number];
  rotation: [number, number, number];
  baseScale: number;
  colorHex: string;
  phase: number;
  revealDelay: number;
}

const PALETTE_HEX = [
  '#d45279', // rich heritage rose
  '#f2a2b8', // soft peony blush
  '#fff3e8', // creamy star-blossom ivory
  '#c94870', // deep damask rose
  '#f4b5a8', // warm coral-peach blush
] as const;

const FOLIAGE_HEX = [
  '#5d8c6a',
  '#4f7d5d',
  '#689976',
  '#558462',
] as const;

const dummyObj = new THREE.Object3D();
const tempColor = new THREE.Color();
const highlightColor = new THREE.Color('#fff2d6');
const haloGoldColor = new THREE.Color('#ffe094');
const haloBlushColor = new THREE.Color('#ffd6e4');

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function LivingGardenField({ quality }: LivingGardenFieldProps) {
  const roseMeshRef = useRef<THREE.InstancedMesh>(null);
  const peonyMeshRef = useRef<THREE.InstancedMesh>(null);
  const blossomMeshRef = useRef<THREE.InstancedMesh>(null);
  const budMeshRef = useRef<THREE.InstancedMesh>(null);
  const stemMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);
  const haloMeshRef = useRef<THREE.InstancedMesh>(null);

  const smoothedRef = useRef({
    reveal: 0,
    memoriesFocus: 0,
    postGarden: 0,
    sunset: 0,
    finale: 0,
    finaleHeart: 0,
    warmth: 0.2,
    windScale: 1.0,
    sixYearGlow: 0.0,
  });

  // Build merged single-draw-call geometries and instanced shader materials
  const resources = useMemo(() => {
    const roseGeo = createRoseCrownGeometry();
    const peonyGeo = createPeonyCrownGeometry();
    const blossomGeo = createCompanionBlossomGeometry();
    const budGeo = createSlenderRosebudGeometry();
    const stemGeo = createGardenStemWithLeavesGeometry();
    const leafGeo = createBotanicalLeafGeometry();

    const haloGeo = new THREE.TorusGeometry(0.28, 0.0085, 8, 36);
    const hitSphereGeo = new THREE.SphereGeometry(0.36, 10, 10);

    const petalMat = createGardenInstancedPetalMaterial();
    const foliageMat = createGardenInstancedFoliageMaterial();
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return {
      roseGeo,
      peonyGeo,
      blossomGeo,
      budGeo,
      stemGeo,
      leafGeo,
      haloGeo,
      hitSphereGeo,
      petalMat,
      foliageMat,
      haloMat,
    };
  }, []);

  useEffect(() => {
    return () => {
      resources.roseGeo.dispose();
      resources.peonyGeo.dispose();
      resources.blossomGeo.dispose();
      resources.budGeo.dispose();
      resources.stemGeo.dispose();
      resources.leafGeo.dispose();
      resources.haloGeo.dispose();
      resources.hitSphereGeo.dispose();
      resources.petalMat.dispose();
      resources.foliageMat.dispose();
      resources.haloMat.dispose();
    };
  }, [resources]);

  // Pre-compute multi-layered botanical garden layout (Foreground + Midground + Background)
  const {
    allFlowers,
    roseSeeds,
    peonySeeds,
    blossomSeeds,
    budSeeds,
    foliageSeeds,
  } = useMemo(() => {
    const totalFlowers = Math.max(0, quality.gardenFlowerCount);
    const totalFoliage = Math.max(0, quality.gardenFoliageCount);

    const flowers: FlowerInstanceSeed[] = [];

    if (totalFlowers > 0) {
      // 1. Place the 4 peripheral signature memory flowers (indices 0, 1, 3, 4;
      // index 2 at [0, 0.04, -0.25] is anchored by the centerpiece ProceduralHeroFlower)
      const specialIndices = [0, 1, 3, 4];

      specialIndices.forEach((interactiveIdx, slot) => {
        const node = gardenState.interactiveFlowers[interactiveIdx];
        if (!node) return;
        flowers.push({
          id: node.id,
          archetype: node.archetype,
          layer: node.layer,
          position: [...node.position],
          rotation: [
            0.34 + slot * 0.03,
            (node.position[0] < 0 ? 0.26 : -0.26) + (slot - 1.5) * 0.1,
            (node.position[0] < 0 ? -0.05 : 0.05),
          ],
          baseScale: node.archetype === 'peony' ? 0.45 : 0.42,
          colorHex: node.colorHex,
          phase: slot * 1.7 + 0.5,
          revealDelay: 0.06 + slot * 0.05,
          interactiveIndex: interactiveIdx,
        });
      });

      const remainingCount = Math.max(0, totalFlowers - flowers.length);
      const fgCount = Math.max(2, Math.round(remainingCount * 0.18));
      const mgCount = Math.max(4, Math.round(remainingCount * 0.44));
      const bgCount = Math.max(4, remainingCount - fgCount - mgCount);

      // 2. Foreground framing layer (z: +0.85 .. +1.45, lower left/right portrait edges)
      for (let i = 0; i < fgCount; i++) {
        const s1 = pseudoRandom(i * 11 + 3);
        const s2 = pseudoRandom(i * 17 + 7);
        const s3 = pseudoRandom(i * 23 + 13);
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (0.88 + s1 * 0.65);
        const z = 0.85 + s2 * 0.6;
        const y = -0.78 + s3 * 0.32;
        const archetypes: BotanicalFlowerArchetype[] = ['rose', 'peony', 'bud', 'blossom'];
        const archetype = archetypes[i % archetypes.length];

        flowers.push({
          id: `fg-flower-${i}`,
          archetype,
          layer: 'foreground',
          position: [x, y, z],
          rotation: [0.32 + s1 * 0.14, side * -0.35 + (s2 - 0.5) * 0.5, side * -0.1],
          baseScale: 0.29 + s3 * 0.08,
          colorHex: PALETTE_HEX[(i + 1) % PALETTE_HEX.length],
          phase: i * 1.3 + s1 * 3.0,
          revealDelay: 0.04 + s2 * 0.2,
          interactiveIndex: null,
        });
      }

      // 3. Midground botanical field (z: -0.15 .. -2.25) with clear breathing halo around all 5 signature flowers
      for (let i = 0; i < mgCount; i++) {
        const s1 = pseudoRandom(i * 31 + 19);
        const s2 = pseudoRandom(i * 37 + 29);
        const s3 = pseudoRandom(i * 43 + 41);

        let x = (s1 - 0.5) * 3.6;
        const z = -0.25 - s2 * 2.0;

        for (let k = 0; k < gardenState.interactiveFlowers.length; k++) {
          const sig = gardenState.interactiveFlowers[k];
          const dx = x - sig.position[0];
          const dz = z - sig.position[2];
          if (dx * dx + dz * dz < 0.16) {
            x += dx >= 0 ? 0.38 : -0.38;
          }
        }

        const slopeY = (-z - 0.2) * 0.2;
        const y = -0.36 + slopeY + (s3 - 0.5) * 0.22;

        const archetypes: BotanicalFlowerArchetype[] = ['rose', 'peony', 'blossom', 'bud', 'rose', 'blossom'];
        const archetype = archetypes[i % archetypes.length];

        flowers.push({
          id: `mg-flower-${i}`,
          archetype,
          layer: 'midground',
          position: [x, y, z],
          rotation: [
            0.34 + (s1 - 0.5) * 0.16,
            (s2 - 0.5) * 1.4,
            (s3 - 0.5) * 0.16,
          ],
          baseScale: 0.24 + s3 * 0.09,
          colorHex: PALETTE_HEX[i % PALETTE_HEX.length],
          phase: i * 0.95 + s2 * 4.0,
          revealDelay: 0.12 + s2 * 0.35,
          interactiveIndex: null,
        });
      }

      // 4. Background sunlit slope (z: -2.4 .. -6.4, rising up y: +0.05 .. +0.82)
      for (let i = 0; i < bgCount; i++) {
        const s1 = pseudoRandom(i * 53 + 61);
        const s2 = pseudoRandom(i * 59 + 71);
        const s3 = pseudoRandom(i * 67 + 83);

        const x = (s1 - 0.5) * 5.6;
        const z = -2.4 - s2 * 4.0;
        const y = 0.05 + (-z - 2.4) * 0.18 + (s3 - 0.5) * 0.18;

        const archetypes: BotanicalFlowerArchetype[] = ['rose', 'peony', 'blossom', 'bud'];
        const archetype = archetypes[(i + 2) % archetypes.length];

        flowers.push({
          id: `bg-flower-${i}`,
          archetype,
          layer: 'background',
          position: [x, y, z],
          rotation: [0.36 + s1 * 0.12, (s2 - 0.5) * 1.2, (s3 - 0.5) * 0.14],
          baseScale: 0.24 + s3 * 0.1,
          colorHex: PALETTE_HEX[(i + 2) % PALETTE_HEX.length],
          phase: i * 1.15 + s1 * 5.0,
          revealDelay: 0.26 + s2 * 0.42,
          interactiveIndex: null,
        });
      }
    }

    // 5. Lush ambient foliage clusters across all 3 depth layers
    const foliage: FoliageInstanceSeed[] = [];
    for (let i = 0; i < totalFoliage; i++) {
      const s1 = pseudoRandom(i * 73 + 17);
      const s2 = pseudoRandom(i * 79 + 31);
      const s3 = pseudoRandom(i * 89 + 47);

      const isForeground = i < totalFoliage * 0.24;
      const side = i % 2 === 0 ? -1 : 1;
      const x = isForeground
        ? side * (0.68 + s1 * 0.85)
        : (s1 - 0.5) * 4.6;
      const z = isForeground
        ? 0.85 + s2 * 0.6
        : -0.2 - s2 * 5.2;
      const y = isForeground
        ? -0.86 + s3 * 0.32
        : -0.62 + Math.max(0, -z) * 0.14 + (s3 - 0.5) * 0.24;

      foliage.push({
        position: [x, y, z],
        rotation: [0.42 + s1 * 0.45, (s2 - 0.5) * Math.PI * 2, (s3 - 0.5) * 0.4],
        baseScale: 0.65 + s3 * 0.55,
        colorHex: FOLIAGE_HEX[i % FOLIAGE_HEX.length],
        phase: i * 0.8 + s1 * 3.0,
        revealDelay: s2 * 0.45,
      });
    }

    return {
      allFlowers: flowers,
      roseSeeds: flowers.filter((f) => f.archetype === 'rose'),
      peonySeeds: flowers.filter((f) => f.archetype === 'peony'),
      blossomSeeds: flowers.filter((f) => f.archetype === 'blossom'),
      budSeeds: flowers.filter((f) => f.archetype === 'bud'),
      foliageSeeds: foliage,
    };
  }, [quality.gardenFlowerCount, quality.gardenFoliageCount]);

  // Initialize static instance colors once when seeds change
  useEffect(() => {
    const initColors = (
      mesh: THREE.InstancedMesh | null,
      seeds: Array<{ colorHex: string }>,
    ) => {
      if (!mesh || seeds.length === 0) return;
      for (let i = 0; i < seeds.length; i++) {
        tempColor.set(seeds[i].colorHex);
        mesh.setColorAt(i, tempColor);
      }
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    };

    initColors(roseMeshRef.current, roseSeeds);
    initColors(peonyMeshRef.current, peonySeeds);
    initColors(blossomMeshRef.current, blossomSeeds);
    initColors(budMeshRef.current, budSeeds);

    if (stemMeshRef.current && allFlowers.length > 0) {
      for (let i = 0; i < allFlowers.length; i++) {
        tempColor.set(FOLIAGE_HEX[i % FOLIAGE_HEX.length]);
        stemMeshRef.current.setColorAt(i, tempColor);
      }
      if (stemMeshRef.current.instanceColor) {
        stemMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    initColors(foliageMeshRef.current, foliageSeeds);
  }, [allFlowers, roseSeeds, peonySeeds, blossomSeeds, budSeeds, foliageSeeds]);

  useFrame((state, delta) => {
    if (allFlowers.length === 0) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    const dt = Math.min(delta, 0.1);
    const elapsed = state.clock.elapsedTime;
    const s = smoothedRef.current;

    s.reveal = THREE.MathUtils.damp(s.reveal, gardenState.gardenRevealProgress, 3.4, dt);
    s.memoriesFocus = THREE.MathUtils.damp(
      s.memoriesFocus,
      gardenState.memoriesFocusProgress,
      3.4,
      dt,
    );
    s.postGarden = THREE.MathUtils.damp(s.postGarden, gardenState.postGardenProgress, 4.0, dt);
    s.sunset = THREE.MathUtils.damp(s.sunset, gardenState.sunsetProgress, 3.4, dt);
    s.finale = THREE.MathUtils.damp(s.finale, gardenState.finaleProgress, 3.4, dt);
    s.finaleHeart = THREE.MathUtils.damp(s.finaleHeart, gardenState.finaleHeartProgress, 3.2, dt);
    s.warmth = THREE.MathUtils.damp(s.warmth, gardenState.lightWarmth, 3.5, dt);

    // Calmed wind during reading (0.4), Scene 05 sunset (0.45), Scene 06 Beat 01 pause (0.35), and Finale Heart (0.65)
    let targetWind = 1.0 - s.sunset * 0.55;
    if (s.finale > 0.1) {
      targetWind = THREE.MathUtils.lerp(0.35, 0.65, s.finaleHeart);
    }
    if (gardenState.isReadingMemory) {
      targetWind = Math.min(targetWind, 0.4);
    }
    s.windScale = THREE.MathUtils.damp(s.windScale, targetWind, 3.5, dt);

    s.sixYearGlow = THREE.MathUtils.damp(
      s.sixYearGlow,
      gardenState.sixYearMomentActive ? 1.0 : 0.0,
      3.2,
      dt,
    );

    // Decay global touchRipple strength smoothly (~1.4s)
    if (gardenState.touchRipple.strength > 0) {
      gardenState.touchRipple.strength = Math.max(
        0,
        gardenState.touchRipple.strength - dt * 0.72,
      );
    }

    // Decay individual interactive flower impulses in place (keep active flower highlighted while open)
    for (let i = 0; i < gardenState.interactiveFlowers.length; i++) {
      const node = gardenState.interactiveFlowers[i];
      const isSelected = gardenState.activeMemoryId === node.memoryId;
      if (node.touchImpulse > 0) {
        node.touchImpulse = Math.max(0, node.touchImpulse - dt * 0.85);
      }
      if (node.bloomBoost > (isSelected ? 0.28 : 0)) {
        node.bloomBoost = Math.max(isSelected ? 0.28 : 0, node.bloomBoost - dt * 0.22);
      }
      if (node.highlight > (isSelected ? 0.85 : 0)) {
        node.highlight = Math.max(isSelected ? 0.85 : 0, node.highlight - dt * 0.6);
      }
    }

    // Keep the Living Garden visible (0.94..1.0) through Scene 03, Scene 04, Scene 05 (#wish), and Scene 06 (#finale)
    const revealVisibility = THREE.MathUtils.smoothstep(s.reveal, 0.01, 0.22);
    const combinedFade = revealVisibility * (1 - s.postGarden * 0.05);
    const effectiveWarmth = Math.min(
      1.4,
      s.warmth + s.sunset * 0.35 + s.sixYearGlow * 0.4 + s.finaleHeart * 0.38,
    );

    // Update shared instanced material uniforms
    const { petalMat, foliageMat, haloMat } = resources;
    petalMat.uniforms.uTime.value = elapsed;
    petalMat.uniforms.uGardenReveal.value = s.reveal;
    petalMat.uniforms.uWarmth.value = effectiveWarmth;
    petalMat.uniforms.uWindScale.value = s.windScale;
    petalMat.uniforms.uFade.value = combinedFade;
    petalMat.uniforms.uTouchWorldPos.value.set(
      gardenState.touchRipple.worldX,
      gardenState.touchRipple.worldY,
      gardenState.touchRipple.worldZ,
    );
    petalMat.uniforms.uTouchStrength.value = gardenState.touchRipple.strength;

    foliageMat.uniforms.uTime.value = elapsed;
    foliageMat.uniforms.uGardenReveal.value = s.reveal;
    foliageMat.uniforms.uWarmth.value = effectiveWarmth;
    foliageMat.uniforms.uWindScale.value = s.windScale;
    foliageMat.uniforms.uFade.value = combinedFade;
    foliageMat.uniforms.uTouchWorldPos.value.set(
      gardenState.touchRipple.worldX,
      gardenState.touchRipple.worldY,
      gardenState.touchRipple.worldZ,
    );
    foliageMat.uniforms.uTouchStrength.value = gardenState.touchRipple.strength;

    const finaleCollectiveBloom =
      (gardenState.finaleBloomActive ? 0.08 : 0) + s.finaleHeart * 0.14;

    const updateArchetypeInstances = (
      mesh: THREE.InstancedMesh | null,
      seeds: FlowerInstanceSeed[],
    ) => {
      if (!mesh || seeds.length === 0) return;
      let colorChanged = false;

      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i];
        const localReveal = THREE.MathUtils.smoothstep(
          s.reveal,
          seed.revealDelay,
          Math.min(1, seed.revealDelay + 0.52),
        );

        let touchImpulse = 0;
        let bloomBoost = 0;
        let highlight = 0;
        if (seed.interactiveIndex !== null) {
          const interactiveNode = gardenState.interactiveFlowers[seed.interactiveIndex];
          if (interactiveNode) {
            touchImpulse = interactiveNode.touchImpulse;
            bloomBoost = interactiveNode.bloomBoost;
            highlight = interactiveNode.highlight;
          }
        }

        const riseY = (1 - localReveal) * -0.42;
        const breezeSway =
          Math.sin(elapsed * 1.2 + seed.phase) * 0.032 * s.windScale * localReveal;
        const signatureFocusScale =
          seed.interactiveIndex !== null ? 1 + s.memoriesFocus * 0.14 : 1;
        const scale =
          seed.baseScale *
          signatureFocusScale *
          (0.18 + 0.82 * localReveal) *
          (1 +
            bloomBoost * 0.45 +
            finaleCollectiveBloom +
            Math.sin(elapsed * 1.5 + seed.phase) * 0.014 * s.windScale);

        dummyObj.position.set(
          seed.position[0] + breezeSway * 0.4,
          seed.position[1] + riseY,
          seed.position[2],
        );
        dummyObj.rotation.set(
          seed.rotation[0] + touchImpulse * 0.22,
          seed.rotation[1] + breezeSway,
          seed.rotation[2] + Math.cos(elapsed * 1.0 + seed.phase) * 0.028 * s.windScale,
        );
        dummyObj.scale.setScalar(scale);
        dummyObj.updateMatrix();
        mesh.setMatrixAt(i, dummyObj.matrix);

        if (seed.interactiveIndex !== null) {
          tempColor
            .set(seed.colorHex)
            .lerp(
              highlightColor,
              Math.min(1, highlight * 0.55 + s.sixYearGlow * 0.22 + s.finaleHeart * 0.3),
            );
          mesh.setColorAt(i, tempColor);
          colorChanged = true;
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (colorChanged && mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    };

    updateArchetypeInstances(roseMeshRef.current, roseSeeds);
    updateArchetypeInstances(peonyMeshRef.current, peonySeeds);
    updateArchetypeInstances(blossomMeshRef.current, blossomSeeds);
    updateArchetypeInstances(budMeshRef.current, budSeeds);

    // Update stems aligned with each flower head
    if (stemMeshRef.current) {
      for (let i = 0; i < allFlowers.length; i++) {
        const seed = allFlowers[i];
        const localReveal = THREE.MathUtils.smoothstep(
          s.reveal,
          seed.revealDelay,
          Math.min(1, seed.revealDelay + 0.52),
        );
        let touchImpulse = 0;
        if (seed.interactiveIndex !== null) {
          const node = gardenState.interactiveFlowers[seed.interactiveIndex];
          if (node) touchImpulse = node.touchImpulse;
        }

        const riseY = (1 - localReveal) * -0.42;
        const breezeSway =
          Math.sin(elapsed * 1.2 + seed.phase) * 0.032 * s.windScale * localReveal;
        const stemScale = seed.baseScale * (0.25 + 0.75 * localReveal);

        dummyObj.position.set(
          seed.position[0] + breezeSway * 0.4,
          seed.position[1] + riseY,
          seed.position[2],
        );
        dummyObj.rotation.set(
          seed.rotation[0] * 0.25 + touchImpulse * 0.1,
          seed.rotation[1] + breezeSway,
          seed.rotation[2] * 0.45,
        );
        dummyObj.scale.set(stemScale, Math.max(0.68, stemScale * 0.88), stemScale);
        dummyObj.updateMatrix();
        stemMeshRef.current.setMatrixAt(i, dummyObj.matrix);
      }
      stemMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update ambient foliage leaves
    if (foliageMeshRef.current && foliageSeeds.length > 0) {
      for (let i = 0; i < foliageSeeds.length; i++) {
        const f = foliageSeeds[i];
        const localReveal = THREE.MathUtils.smoothstep(
          s.reveal,
          f.revealDelay,
          Math.min(1, f.revealDelay + 0.5),
        );
        const riseY = (1 - localReveal) * -0.35;
        const leafScale = f.baseScale * (0.15 + 0.85 * localReveal);

        dummyObj.position.set(f.position[0], f.position[1] + riseY, f.position[2]);
        dummyObj.rotation.set(
          f.rotation[0] + Math.sin(elapsed * 1.3 + f.phase) * 0.038 * s.windScale,
          f.rotation[1],
          f.rotation[2],
        );
        dummyObj.scale.setScalar(leafScale);
        dummyObj.updateMatrix();
        foliageMeshRef.current.setMatrixAt(i, dummyObj.matrix);
      }
      foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update 5 Signature Halo Rings (visible primarily in Scene 04, gently softening in Scene 05/06)
    if (haloMeshRef.current) {
      const scene4HaloFade = 1 - s.postGarden * 0.72;
      haloMat.opacity =
        THREE.MathUtils.smoothstep(s.memoriesFocus, 0.08, 0.65) * 0.68 * scene4HaloFade;

      for (let i = 0; i < gardenState.interactiveFlowers.length; i++) {
        const node = gardenState.interactiveFlowers[i];
        const isCenter = i === 2;
        const isActive = gardenState.activeMemoryId === node.memoryId;
        const pulse =
          1 +
          Math.sin(elapsed * 2.2 + i * 1.3) * 0.07 +
          node.highlight * 0.18 +
          (isActive ? 0.14 : 0);
        const ringScale = (isCenter ? 1.18 : 0.92) * pulse * (0.4 + 0.6 * s.memoriesFocus);

        dummyObj.position.set(
          node.position[0],
          node.position[1] + (isCenter ? 0.02 : 0.04),
          node.position[2] + 0.05,
        );
        dummyObj.rotation.set(0.38, 0, elapsed * 0.25 + i);
        dummyObj.scale.setScalar(ringScale);
        dummyObj.updateMatrix();
        haloMeshRef.current.setMatrixAt(i, dummyObj.matrix);

        if (node.discovered || isCenter || isActive) {
          tempColor.copy(haloGoldColor);
        } else {
          tempColor.set(node.colorHex).lerp(haloBlushColor, 0.55);
        }
        haloMeshRef.current.setColorAt(i, tempColor);
      }
      haloMeshRef.current.instanceMatrix.needsUpdate = true;
      if (haloMeshRef.current.instanceColor) {
        haloMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  const handleSignatureFlowerClick = (
    event: ThreeEvent<MouseEvent>,
    memoryId: MemoryFlowerId,
    pos: [number, number, number],
  ) => {
    event.stopPropagation();
    if (gardenState.memoriesFocusProgress > 0.35 && gardenState.postGardenProgress < 0.35) {
      openMemoryFlower(memoryId);
    } else {
      triggerGardenTouchRipple(
        Math.max(-1, Math.min(1, pos[0] / 1.45)),
        Math.max(-1, Math.min(1, pos[1] / 0.95)),
      );
    }
  };

  if (allFlowers.length === 0) return null;

  return (
    <group name="living-garden-field">
      {roseSeeds.length > 0 && (
        <instancedMesh
          ref={roseMeshRef}
          args={[resources.roseGeo, resources.petalMat, roseSeeds.length]}
          frustumCulled={false}
          name="garden-roses-instanced"
        />
      )}
      {peonySeeds.length > 0 && (
        <instancedMesh
          ref={peonyMeshRef}
          args={[resources.peonyGeo, resources.petalMat, peonySeeds.length]}
          frustumCulled={false}
          name="garden-peonies-instanced"
        />
      )}
      {blossomSeeds.length > 0 && (
        <instancedMesh
          ref={blossomMeshRef}
          args={[resources.blossomGeo, resources.petalMat, blossomSeeds.length]}
          frustumCulled={false}
          name="garden-blossoms-instanced"
        />
      )}
      {budSeeds.length > 0 && (
        <instancedMesh
          ref={budMeshRef}
          args={[resources.budGeo, resources.petalMat, budSeeds.length]}
          frustumCulled={false}
          name="garden-buds-instanced"
        />
      )}
      <instancedMesh
        ref={stemMeshRef}
        args={[resources.stemGeo, resources.foliageMat, allFlowers.length]}
        frustumCulled={false}
        name="garden-stems-instanced"
      />
      {foliageSeeds.length > 0 && (
        <instancedMesh
          ref={foliageMeshRef}
          args={[resources.leafGeo, resources.foliageMat, foliageSeeds.length]}
          frustumCulled={false}
          name="garden-foliage-instanced"
        />
      )}

      {/* 5 Luminous 3D Signature Flower Halos */}
      <instancedMesh
        ref={haloMeshRef}
        args={[
          resources.haloGeo,
          resources.haloMat,
          gardenState.interactiveFlowers.length,
        ]}
        frustumCulled={false}
        name="garden-signature-halos"
      />

      {/* 5 Raycast Hit Spheres for Direct 3D Tap on Signature Memory Flowers */}
      {gardenState.interactiveFlowers.map((node) => (
        <mesh
          key={node.id}
          geometry={resources.hitSphereGeo}
          position={node.position}
          onClick={(e) => handleSignatureFlowerClick(e, node.memoryId, node.position)}
          visible={false}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

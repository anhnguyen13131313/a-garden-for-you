import { useEffect, useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneQuality } from '../lib/performance';
import {
  gardenState,
  openMemoryFlower,
  requestFinaleBloom,
  requestHeroBloom,
  triggerGardenTouchRipple,
} from '../motion/gardenStore';
import {
  createBotanicalLeafGeometry,
  createCurvedStemGeometry,
  createSculptedPetalGeometry,
  createSepalGeometry,
  createStamenCrownGeometry,
} from './flowerGeometry';
import {
  createFoliageMaterial,
  createPetalShaderMaterial,
  createStamenMaterial,
} from './flowerMaterial';

interface ProceduralHeroFlowerProps {
  quality: SceneQuality;
}

interface PetalSpec {
  id: number;
  whorlIndex: number;
  ringNormalized: number;
  azimuth: number;
  radius: number;
  yOffset: number;
  closedTilt: number;
  openTilt: number;
  openStart: number;
  openEnd: number;
  scaleX: number;
  scaleY: number;
}

const GOLDEN_ANGLE = 137.50776 * (Math.PI / 180);
const HERO_BASE_SCALE = 0.56;

const WHORL_DEFINITIONS = [
  // Whorl 0: Inner heart (5 petals) — tightly furled cone around the stamen cushion
  { count: 5, openStart: 0.62, openEnd: 1.0, closedTilt: -0.26, openTilt: 0.42, radius: 0.036, yOffset: 0.055, scaleX: 0.62, scaleY: 0.68 },
  // Whorl 1: Inner-mid (6 petals)
  { count: 6, openStart: 0.26, openEnd: 0.86, closedTilt: -0.21, openTilt: 0.64, radius: 0.062, yOffset: 0.042, scaleX: 0.75, scaleY: 0.79 },
  // Whorl 2: Mid cup (7 petals)
  { count: 7, openStart: 0.14, openEnd: 0.78, closedTilt: -0.15, openTilt: 0.84, radius: 0.092, yOffset: 0.028, scaleX: 0.88, scaleY: 0.90 },
  // Whorl 3: Outer cup (8 petals)
  { count: 8, openStart: 0.05, openEnd: 0.68, closedTilt: -0.09, openTilt: 1.02, radius: 0.122, yOffset: 0.014, scaleX: 0.98, scaleY: 0.98 },
  // Whorl 4: Outer guard petals (8 petals) — max openTilt ~1.16 rad for a cupped rose silhouette
  { count: 8, openStart: 0.0, openEnd: 0.56, closedTilt: -0.03, openTilt: 1.16, radius: 0.152, yOffset: 0.0, scaleX: 1.08, scaleY: 1.04 },
] as const;

export function ProceduralHeroFlower({ quality }: ProceduralHeroFlowerProps) {
  const rootGroupRef = useRef<THREE.Group>(null);
  const flowerHeadRef = useRef<THREE.Group>(null);
  const stamenMeshRef = useRef<THREE.Mesh>(null);
  const petalGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const sepalGroupRefs = useRef<(THREE.Group | null)[]>([]);

  const smoothedState = useRef({
    bloom: gardenState.bloomProgress,
    warmth: gardenState.lightWarmth,
    transition: gardenState.sceneTransition,
    gardenReveal: gardenState.gardenRevealProgress,
    memoriesFocus: gardenState.memoriesFocusProgress,
    sunset: gardenState.sunsetProgress,
    finale: gardenState.finaleProgress,
    finaleHeart: gardenState.finaleHeartProgress,
    windScale: 1.0,
    sixYearGlow: 0.0,
    pointerX: 0,
    pointerY: 0,
    fade: 1,
  });

  // Build geometries scaled by quality.heroPetalDetail
  const geometries = useMemo(() => {
    const segU = quality.heroPetalDetail === 'high' ? 22 : quality.heroPetalDetail === 'medium' ? 16 : 12;
    const segV = quality.heroPetalDetail === 'high' ? 26 : quality.heroPetalDetail === 'medium' ? 20 : 14;

    const innerPetalGeo = createSculptedPetalGeometry({
      width: 0.64,
      length: 0.84,
      cupDepth: 0.18,
      sCurve: 0.05,
      ruffleAmp: 0.018,
      ruffleFreq: 4.0,
      tipCurl: 0.075,
      asymmetryPhase: 0.2,
      segmentsU: segU,
      segmentsV: segV,
    });

    const midPetalGeo = createSculptedPetalGeometry({
      width: 0.74,
      length: 0.92,
      cupDepth: 0.16,
      sCurve: 0.065,
      ruffleAmp: 0.025,
      ruffleFreq: 4.8,
      tipCurl: 0.095,
      asymmetryPhase: 1.1,
      segmentsU: segU,
      segmentsV: segV,
    });

    const outerPetalGeo = createSculptedPetalGeometry({
      width: 0.82,
      length: 0.96,
      cupDepth: 0.14,
      sCurve: 0.075,
      ruffleAmp: 0.032,
      ruffleFreq: 5.5,
      tipCurl: 0.115,
      asymmetryPhase: 2.3,
      segmentsU: segU,
      segmentsV: segV,
    });

    const sepalGeo = createSepalGeometry();
    const stemGeo = createCurvedStemGeometry();
    const leafGeo = createBotanicalLeafGeometry();
    const stamenGeo = createStamenCrownGeometry(quality.heroPetalDetail === 'low' ? 20 : 28);
    const receptacleGeo = new THREE.SphereGeometry(0.14, 16, 12);
    receptacleGeo.scale(1.05, 0.88, 1.05);
    const hitSphereGeo = new THREE.SphereGeometry(0.88, 12, 12);

    return {
      innerPetalGeo,
      midPetalGeo,
      outerPetalGeo,
      sepalGeo,
      stemGeo,
      leafGeo,
      stamenGeo,
      receptacleGeo,
      hitSphereGeo,
    };
  }, [quality.heroPetalDetail]);

  // 5 shared whorl shader materials + foliage + stamen materials
  const materials = useMemo(() => {
    const whorlMaterials = WHORL_DEFINITIONS.map((_, idx) =>
      createPetalShaderMaterial(idx / (WHORL_DEFINITIONS.length - 1)),
    );
    const foliageMat = createFoliageMaterial();
    const stamenMat = createStamenMaterial();
    return { whorlMaterials, foliageMat, stamenMat };
  }, []);

  // Assemble 26–34 petals using Fibonacci Golden Angle phyllotaxis across the 5 whorls
  const petalSpecs = useMemo<PetalSpec[]>(() => {
    const specs: PetalSpec[] = [];
    let globalIndex = 0;

    WHORL_DEFINITIONS.forEach((whorl, whorlIndex) => {
      let count: number = whorl.count;
      if (quality.heroPetalDetail === 'low' && whorlIndex >= 1) {
        count = Math.max(5, whorl.count - 2);
      } else if (quality.heroPetalDetail === 'medium' && whorlIndex >= 3) {
        count = whorl.count - 2;
      }

      const ringNormalized = whorlIndex / (WHORL_DEFINITIONS.length - 1);

      for (let i = 0; i < count; i++) {
        const azimuth = globalIndex * GOLDEN_ANGLE;
        const jitter = ((globalIndex % 3) - 1) * 0.018;
        specs.push({
          id: globalIndex,
          whorlIndex,
          ringNormalized,
          azimuth,
          radius: whorl.radius + (i / count) * 0.014,
          yOffset: whorl.yOffset - (i / count) * 0.005,
          closedTilt: whorl.closedTilt + jitter * 0.7,
          openTilt: whorl.openTilt + jitter,
          openStart: whorl.openStart,
          openEnd: whorl.openEnd,
          scaleX: whorl.scaleX,
          scaleY: whorl.scaleY,
        });
        globalIndex += 1;
      }
    });

    return specs;
  }, [quality.heroPetalDetail]);

  // Clean up all geometries and materials on unmount
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geo) => geo.dispose());
      materials.whorlMaterials.forEach((mat) => mat.dispose());
      materials.foliageMat.dispose();
      materials.stamenMat.dispose();
    };
  }, [geometries, materials]);

  useFrame((state, delta) => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    const dt = Math.min(delta, 0.1);
    const elapsed = state.clock.elapsedTime;
    const s = smoothedState.current;

    s.bloom = THREE.MathUtils.damp(s.bloom, gardenState.bloomProgress, 4.2, dt);
    s.warmth = THREE.MathUtils.damp(s.warmth, gardenState.lightWarmth, 3.8, dt);
    s.transition = THREE.MathUtils.damp(s.transition, gardenState.sceneTransition, 3.6, dt);
    s.gardenReveal = THREE.MathUtils.damp(s.gardenReveal, gardenState.gardenRevealProgress, 3.6, dt);
    s.memoriesFocus = THREE.MathUtils.damp(s.memoriesFocus, gardenState.memoriesFocusProgress, 3.6, dt);
    s.sunset = THREE.MathUtils.damp(s.sunset, gardenState.sunsetProgress, 3.4, dt);
    s.finale = THREE.MathUtils.damp(s.finale, gardenState.finaleProgress, 3.4, dt);
    s.finaleHeart = THREE.MathUtils.damp(s.finaleHeart, gardenState.finaleHeartProgress, 3.2, dt);

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
    s.pointerX = THREE.MathUtils.damp(s.pointerX, gardenState.pointerX, 4.0, dt);
    s.pointerY = THREE.MathUtils.damp(s.pointerY, gardenState.pointerY, 4.0, dt);

    // Keep Hero Flower alive & visible through Scene 05 (#wish) and Scene 06 (#finale)
    s.fade = THREE.MathUtils.damp(s.fade, 0.98, 5.0, dt);

    // Check interactive boost on centerpiece flower ('special-flower-03' / 'six-years') + Finale bloom
    const centerNode = gardenState.interactiveFlowers[2];
    const touchImpulse = centerNode ? centerNode.touchImpulse : 0;
    const finaleBoost = (gardenState.finaleBloomActive ? 0.06 : 0) + s.finaleHeart * 0.08;
    const effectiveBloom = Math.min(
      1.14,
      s.bloom + (centerNode ? centerNode.bloomBoost * 0.35 : 0) + s.sixYearGlow * 0.08 + finaleBoost,
    );
    const effectiveWarmth = Math.min(
      1.4,
      s.warmth + touchImpulse * 0.25 + s.sunset * 0.32 + s.sixYearGlow * 0.45 + s.finaleHeart * 0.38,
    );

    // Update shader uniforms across all 5 whorl materials
    for (let i = 0; i < materials.whorlMaterials.length; i++) {
      const mat = materials.whorlMaterials[i];
      mat.uniforms.uTime.value = elapsed;
      mat.uniforms.uBloom.value = effectiveBloom;
      mat.uniforms.uWarmth.value = effectiveWarmth;
      mat.uniforms.uWindScale.value = s.windScale;
      mat.uniforms.uFade.value = s.fade;
    }

    materials.foliageMat.opacity = s.fade;
    materials.stamenMat.opacity = s.fade;
    materials.stamenMat.emissiveIntensity =
      0.32 + s.warmth * 0.45 + s.bloom * 0.22 + s.sunset * 0.25 + s.sixYearGlow * 0.55 + s.finaleHeart * 0.45;

    // Animate individual petal hinge tilts per whorl window
    for (let i = 0; i < petalSpecs.length; i++) {
      const group = petalGroupRefs.current[i];
      if (!group) continue;
      const spec = petalSpecs[i];

      const localProgress = THREE.MathUtils.smoothstep(effectiveBloom, spec.openStart, spec.openEnd);
      const breathe =
        Math.sin(elapsed * 1.25 + spec.id * 0.45) *
        0.015 *
        s.windScale *
        (0.35 + 0.65 * localProgress);
      const targetTilt =
        THREE.MathUtils.lerp(spec.closedTilt, spec.openTilt, localProgress) +
        breathe +
        s.sixYearGlow * 0.04 +
        s.finaleHeart * 0.05;

      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetTilt, 6.0, dt);
    }

    // Animate 5 calyx sepals: tightly cradling the closed bud (-0.18 rad), folding down (1.62 rad) as it blooms
    for (let i = 0; i < 5; i++) {
      const sepalGroup = sepalGroupRefs.current[i];
      if (!sepalGroup) continue;
      const sepalOpen = THREE.MathUtils.smoothstep(effectiveBloom, 0.04, 0.54);
      const targetSepalTilt = THREE.MathUtils.lerp(-0.18, 1.62, sepalOpen);
      sepalGroup.rotation.x = THREE.MathUtils.damp(sepalGroup.rotation.x, targetSepalTilt, 5.5, dt);
    }

    // Stamen crown subtle expansion as inner heart petals open
    if (stamenMeshRef.current) {
      const stamenReveal = THREE.MathUtils.smoothstep(effectiveBloom, 0.35, 0.95);
      const stamenScale = 0.76 + 0.24 * stamenReveal + s.sixYearGlow * 0.08 + s.finaleHeart * 0.08;
      stamenMeshRef.current.scale.setScalar(stamenScale);
      stamenMeshRef.current.rotation.y = elapsed * 0.06 * s.windScale;
    }

    // Overall flower poise and Scene 03–06 centerpiece settlement ([0, 0.04, -0.25])
    if (rootGroupRef.current && flowerHeadRef.current) {
      const breathScale =
        HERO_BASE_SCALE *
        (1 +
          Math.sin(elapsed * 1.35) * 0.012 * s.windScale +
          s.bloom * 0.05 -
          s.gardenReveal * 0.04 +
          s.sixYearGlow * 0.07 +
          s.finaleHeart * 0.08);
      rootGroupRef.current.scale.setScalar(breathScale);

      const scene12PosY = THREE.MathUtils.lerp(-0.18, 0.06, s.transition);
      const gardenPosY = THREE.MathUtils.lerp(scene12PosY, -0.06, s.gardenReveal);
      rootGroupRef.current.position.y = THREE.MathUtils.lerp(
        gardenPosY,
        -0.14,
        s.finale * 0.65,
      );
      rootGroupRef.current.position.z = THREE.MathUtils.lerp(0.0, -0.25, s.gardenReveal);

      const targetRotY =
        Math.sin(elapsed * 0.45) * 0.1 * s.windScale +
        s.transition * 0.32 * (1 - s.gardenReveal * 0.45) +
        s.pointerX * 0.2 * s.windScale;
      const targetRotX =
        THREE.MathUtils.lerp(0.14, 0.42, s.transition) -
        s.gardenReveal * 0.08 -
        s.pointerY * 0.12 * s.windScale +
        touchImpulse * 0.14 +
        Math.cos(elapsed * 0.6) * 0.025 * s.windScale;

      flowerHeadRef.current.rotation.y = THREE.MathUtils.damp(
        flowerHeadRef.current.rotation.y,
        targetRotY,
        4.0,
        dt,
      );
      flowerHeadRef.current.rotation.x = THREE.MathUtils.damp(
        flowerHeadRef.current.rotation.x,
        targetRotX,
        4.0,
        dt,
      );
    }
  });

  const handleFlowerClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (gardenState.finaleProgress > 0.45) {
      requestFinaleBloom();
      return;
    }
    if (gardenState.memoriesFocusProgress > 0.35 && gardenState.postGardenProgress < 0.35) {
      openMemoryFlower('six-years');
      return;
    }
    requestHeroBloom();
    if (gardenState.gardenRevealProgress > 0.25) {
      triggerGardenTouchRipple(0, 0.04);
    }
  };

  return (
    <group ref={rootGroupRef} scale={HERO_BASE_SCALE} name="procedural-hero-flower">
      <group ref={flowerHeadRef} position={[0, 0.1, 0]}>
        {/* Invisible interactive bounding sphere around the flower head */}
        <mesh geometry={geometries.hitSphereGeo} onClick={handleFlowerClick} visible={false}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Receptacle base */}
        <mesh
          geometry={geometries.receptacleGeo}
          material={materials.foliageMat}
          position={[0, -0.04, 0]}
        />

        {/* Golden stamen crown */}
        <mesh
          ref={stamenMeshRef}
          geometry={geometries.stamenGeo}
          material={materials.stamenMat}
          position={[0, 0.025, 0]}
        />

        {/* 5 Calyx Sepals */}
        {[0, 1, 2, 3, 4].map((index) => {
          const angle = (index / 5) * Math.PI * 2 + 0.32;
          const r = 0.135;
          return (
            <group
              key={`sepal-${index}`}
              position={[Math.cos(angle) * r, -0.015, Math.sin(angle) * r]}
              rotation={[0, -angle + Math.PI * 0.5, 0]}
            >
              <group
                ref={(el) => {
                  sepalGroupRefs.current[index] = el;
                }}
                rotation={[-0.18, 0, 0]}
              >
                <mesh geometry={geometries.sepalGeo} material={materials.foliageMat} />
              </group>
            </group>
          );
        })}

        {/* Layered Fibonacci Phyllotaxis Petals across 5 Whorls */}
        {petalSpecs.map((spec, idx) => {
          const x = Math.cos(spec.azimuth) * spec.radius;
          const z = Math.sin(spec.azimuth) * spec.radius;
          const petalGeo =
            spec.whorlIndex <= 1
              ? geometries.innerPetalGeo
              : spec.whorlIndex <= 3
                ? geometries.midPetalGeo
                : geometries.outerPetalGeo;
          const petalMat = materials.whorlMaterials[spec.whorlIndex];

          return (
            <group
              key={`petal-${spec.id}`}
              position={[x, spec.yOffset, z]}
              rotation={[0, -spec.azimuth + Math.PI * 0.5, 0]}
            >
              <group
                ref={(el) => {
                  petalGroupRefs.current[idx] = el;
                }}
                rotation={[spec.closedTilt, 0, 0]}
                scale={[spec.scaleX, spec.scaleY, 1]}
              >
                <mesh geometry={petalGeo} material={petalMat} />
              </group>
            </group>
          );
        })}

        {/* Curved Botanical Stem */}
        <mesh
          geometry={geometries.stemGeo}
          material={materials.foliageMat}
          position={[0, -0.05, 0]}
        />

        {/* 3 Botanical Rose Leaves along the Stem */}
        <group position={[-0.05, -0.58, 0.04]} rotation={[0.55, -0.75, 0.42]} scale={0.88}>
          <mesh geometry={geometries.leafGeo} material={materials.foliageMat} />
        </group>
        <group position={[0.07, -1.06, -0.02]} rotation={[0.62, 1.15, -0.38]} scale={0.98}>
          <mesh geometry={geometries.leafGeo} material={materials.foliageMat} />
        </group>
        <group position={[-0.03, -1.58, 0.03]} rotation={[0.58, -1.25, 0.35]} scale={0.82}>
          <mesh geometry={geometries.leafGeo} material={materials.foliageMat} />
        </group>
      </group>
    </group>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneQuality } from '../lib/performance';
import { gardenState } from '../motion/gardenStore';

interface HeroDewParticlesProps {
  quality: SceneQuality;
}

interface ParticleSeed {
  angle: number;
  baseRadius: number;
  baseY: number;
  speed: number;
  phase: number;
  scale: number;
  isPetalFleck: boolean;
  colorMix: number;
  heartX: number;
  heartY: number;
  heartZ: number;
}

const dummyObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const heartTargetColor = new THREE.Color();
const COLOR_PEARL = new THREE.Color('#fff5f7');
const COLOR_BLUSH = new THREE.Color('#f7b5c8');
const COLOR_GOLD = new THREE.Color('#ffe09e');
const COLOR_SUNSET = new THREE.Color('#ffbe8f');
const COLOR_HEART_ROSE = new THREE.Color('#ff7aa2');
const COLOR_HEART_BLUSH = new THREE.Color('#ffb8d0');
const COLOR_HEART_GOLD = new THREE.Color('#ffe29e');

export function HeroDewParticles({ quality }: HeroDewParticlesProps) {
  const count = Math.max(0, quality.petalCount);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const burstEnvelopeRef = useRef(0);
  const sixYearGlowRef = useRef(0);
  const sunsetRef = useRef(0);
  const heartProgressRef = useRef(0);

  // Pre-allocate particle seeds + parametric 3D Heart target coordinates
  const seeds = useMemo<ParticleSeed[]>(() => {
    const list: ParticleSeed[] = [];
    const goldenAngle = 137.50776 * (Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const norm = (i + 0.5) / Math.max(1, count);
      const t = (i / Math.max(1, count)) * Math.PI * 2;
      const phase = i * 1.17;

      // Classic parametric 3D heart curve scaled for mobile portrait focal window
      const heartX = 16 * Math.pow(Math.sin(t), 3) * 0.042;
      const heartY =
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)) *
          0.042 +
        0.46;
      const heartZ = -0.05 + Math.sin(t * 2 + phase) * 0.08;

      list.push({
        angle: i * goldenAngle,
        baseRadius: 0.42 + Math.sqrt(norm) * 1.35,
        baseY: (norm - 0.45) * 2.2,
        speed: 0.28 + (i % 5) * 0.08,
        phase,
        scale: 0.017 + (i % 4) * 0.007,
        isPetalFleck: i % 3 === 0,
        colorMix: (i % 7) / 6,
        heartX,
        heartY,
        heartZ,
      });
    }
    return list;
  }, [count]);

  const { geometry, material } = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(1, 1);
    geo.scale(1, 1.35, 0.45);

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    const dt = Math.min(delta, 0.1);
    const elapsed = state.clock.elapsedTime;
    const bloom = gardenState.bloomProgress;
    const warmth = gardenState.lightWarmth;
    const gardenReveal = gardenState.gardenRevealProgress;
    const calmFactor = gardenState.isReadingMemory ? 0.45 : 1.0;

    sixYearGlowRef.current = THREE.MathUtils.damp(
      sixYearGlowRef.current,
      gardenState.sixYearMomentActive ? 1.0 : 0.0,
      3.0,
      dt,
    );
    sunsetRef.current = THREE.MathUtils.damp(
      sunsetRef.current,
      gardenState.sunsetProgress,
      3.2,
      dt,
    );
    heartProgressRef.current = THREE.MathUtils.damp(
      heartProgressRef.current,
      gardenState.finaleHeartProgress,
      3.4,
      dt,
    );

    const sixYearGlow = sixYearGlowRef.current;
    const sunset = sunsetRef.current;
    const heartProg = heartProgressRef.current;

    if (gardenState.particleBurst > burstEnvelopeRef.current) {
      burstEnvelopeRef.current = THREE.MathUtils.damp(
        burstEnvelopeRef.current,
        gardenState.particleBurst,
        8.0,
        dt,
      );
    } else {
      burstEnvelopeRef.current = THREE.MathUtils.damp(burstEnvelopeRef.current, 0, 1.8, dt);
    }
    gardenState.particleBurst = Math.max(0, gardenState.particleBurst - dt * 0.65);

    const burst = burstEnvelopeRef.current;
    material.opacity = Math.min(
      0.96,
      0.45 +
        bloom * 0.25 +
        burst * 0.22 +
        gardenReveal * 0.08 +
        sunset * 0.14 +
        sixYearGlow * 0.16 +
        heartProg * 0.24,
    );

    const heartBreath = 1 + Math.sin(elapsed * 2.4) * 0.045;

    for (let i = 0; i < count; i++) {
      const seed = seeds[i];
      const orbitAngle =
        seed.angle +
        elapsed * seed.speed * calmFactor * (0.65 + bloom * 0.45) +
        burst * 1.65;

      // Garden orbit coordinates (Scenes 01–05)
      const gardenSpread = 1 + gardenReveal * 0.95 - sixYearGlow * 0.22 - sunset * 0.18;
      const radialBreath =
        seed.baseRadius * (0.76 + bloom * 0.34 + burst * 0.45) * gardenSpread +
        Math.sin(elapsed * 0.9 + seed.phase) * 0.12 * calmFactor;

      const driftY =
        ((seed.baseY + elapsed * seed.speed * 0.35 * calmFactor + burst * 0.55 + 1.2) % 2.6) - 1.1;

      const orbitX = Math.cos(orbitAngle) * radialBreath + gardenState.pointerX * 0.1;
      const orbitZ = Math.sin(orbitAngle) * radialBreath - gardenReveal * 0.85 * (1 - sunset * 0.35);
      const orbitY =
        driftY + 0.15 + gardenState.pointerY * 0.06 + sixYearGlow * 0.12 + sunset * 0.08;

      // Beat 04 — Swirling 3D Heart Formation (finaleHeartProgress: 0 -> 1)
      const swirlPhase = Math.sin(heartProg * Math.PI);
      const swirlAngle = seed.angle + heartProg * Math.PI * 2.2 + elapsed * 1.1;
      const swirlRadius = 0.55 * swirlPhase;

      const targetHeartX =
        seed.heartX * heartBreath +
        Math.sin(elapsed * 1.8 + seed.phase) * 0.016 +
        gardenState.pointerX * 0.06;
      const targetHeartY =
        seed.heartY * heartBreath +
        Math.cos(elapsed * 1.6 + seed.phase) * 0.016 +
        gardenState.pointerY * 0.04;
      const targetHeartZ = seed.heartZ + Math.sin(elapsed * 1.4 + seed.phase) * 0.02;

      const x =
        THREE.MathUtils.lerp(orbitX, targetHeartX, heartProg) +
        Math.cos(swirlAngle) * swirlRadius * 0.35;
      const y =
        THREE.MathUtils.lerp(orbitY, targetHeartY, heartProg) +
        swirlPhase * 0.18;
      const z =
        THREE.MathUtils.lerp(orbitZ, targetHeartZ, heartProg) +
        Math.sin(swirlAngle) * swirlRadius * 0.35;

      dummyObject.position.set(x, y, z);
      dummyObject.rotation.set(
        elapsed * 0.7 * calmFactor + seed.phase,
        orbitAngle + heartProg * 1.5,
        Math.sin(elapsed + seed.phase) * 0.5,
      );

      const pulse =
        0.75 +
        0.35 * Math.sin(elapsed * 2.1 + seed.phase) +
        burst * 0.4 +
        sixYearGlow * 0.3 +
        heartProg * 0.45;
      const s =
        seed.scale *
        pulse *
        (0.85 + bloom * 0.25 + gardenReveal * 0.15) *
        (1 + heartProg * 0.55);

      if (seed.isPetalFleck || heartProg > 0.25) {
        dummyObject.scale.set(s * 1.45, s * 1.75, s * 0.48);
      } else {
        dummyObject.scale.setScalar(s);
      }

      dummyObject.updateMatrix();
      mesh.setMatrixAt(i, dummyObject.matrix);

      // Tint transitions: morning pearl/blush -> golden-hour sunset -> luminous rose-gold heart
      tempColor.copy(COLOR_PEARL).lerp(COLOR_BLUSH, seed.colorMix);
      tempColor.lerp(COLOR_SUNSET, sunset * 0.58);
      tempColor.lerp(
        COLOR_GOLD,
        Math.min(1, warmth * 0.65 + burst * 0.35 + sixYearGlow * 0.65),
      );

      if (heartProg > 0.01) {
        heartTargetColor
          .copy(COLOR_HEART_ROSE)
          .lerp(COLOR_HEART_BLUSH, seed.colorMix)
          .lerp(COLOR_HEART_GOLD, (i % 3 === 0 ? 0.65 : 0.25));
        tempColor.lerp(heartTargetColor, heartProg * 0.9);
      }

      mesh.setColorAt(i, tempColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
      name="hero-dew-particles"
    />
  );
}

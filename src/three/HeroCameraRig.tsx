import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gardenState } from '../motion/gardenStore';

const KEY_COLOR_MIST = new THREE.Color('#fff0f5');
const KEY_COLOR_WARM = new THREE.Color('#ffe6c8');
const KEY_COLOR_GOLDEN_HOUR = new THREE.Color('#ffd89b');
const KEY_COLOR_SUNSET = new THREE.Color('#ffbe8f');
const RIM_COLOR_ROSE = new THREE.Color('#f598b6');
const RIM_COLOR_GOLD = new THREE.Color('#ffd29d');
const RIM_COLOR_SUNSET = new THREE.Color('#ff9e7d');
const CORE_COLOR_WARM = new THREE.Color('#ffcb7d');
const CORE_COLOR_HEART = new THREE.Color('#ffe29e');

const lookAtTarget = new THREE.Vector3();
const tempLightColor = new THREE.Color();

export function HeroCameraRig() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const corePointLightRef = useRef<THREE.PointLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  const rigState = useRef({
    camX: 0,
    camY: 0.4,
    camZ: 4.9,
    lookX: 0,
    lookY: 0.04,
    lookZ: 0,
    sixYearGlow: 0,
    sunset: 0,
    finale: 0,
    finaleHeart: 0,
  });

  useFrame((state, delta) => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    const dt = Math.min(delta, 0.1);
    const { camera, size, clock } = state;
    const elapsed = clock.elapsedTime;
    const aspect = size.width / Math.max(1, size.height);

    // Portrait compensation for 320px–430px smartphone viewports (aspect ~ 0.42–0.56)
    const isPortrait = aspect < 0.78;
    const portraitZoomOut = isPortrait
      ? THREE.MathUtils.clamp((0.74 - aspect) * 2.4, 0, 1.05)
      : 0;
    const portraitYOffset = isPortrait ? -0.1 : -0.02;

    const transition = THREE.MathUtils.clamp(gardenState.sceneTransition, 0, 1);
    const gardenReveal = THREE.MathUtils.clamp(gardenState.gardenRevealProgress, 0, 1);
    const memoriesFocus = THREE.MathUtils.clamp(gardenState.memoriesFocusProgress, 0, 1);
    const sunsetTarget = THREE.MathUtils.clamp(gardenState.sunsetProgress, 0, 1);
    const finaleTarget = THREE.MathUtils.clamp(gardenState.finaleProgress, 0, 1);
    const finaleHeartTarget = THREE.MathUtils.clamp(gardenState.finaleHeartProgress, 0, 1);
    const bloom = THREE.MathUtils.clamp(gardenState.bloomProgress, 0, 1);
    const warmth = THREE.MathUtils.clamp(gardenState.lightWarmth, 0, 1);
    const calmFactor = gardenState.isReadingMemory ? 0.35 : 1.0;

    const r = rigState.current;
    r.sixYearGlow = THREE.MathUtils.damp(
      r.sixYearGlow,
      gardenState.sixYearMomentActive ? 1.0 : 0.0,
      3.0,
      dt,
    );
    r.sunset = THREE.MathUtils.damp(r.sunset, sunsetTarget, 3.2, dt);
    r.finale = THREE.MathUtils.damp(r.finale, finaleTarget, 3.2, dt);
    r.finaleHeart = THREE.MathUtils.damp(r.finaleHeart, finaleHeartTarget, 2.8, dt);

    // Scene 01 (transition = 0): Intimate portrait framing of poised bud
    // Scene 02 (transition = 1, gardenReveal = 0): Elevated 3/4 view looking into the cupped rose bowl
    // Scene 03 (gardenReveal = 1, memoriesFocus = 0): Wide panoramic pullback across the Living Garden
    // Scene 04 (memoriesFocus = 1): Poised constellation framing of the 5 Signature Memory Flowers
    // Scene 05 (sunset = 1): Dreamy golden-hour sunset drift across the glowing garden
    // Scene 06 (finale = 1, finaleHeart = 0 -> 1): Centered twilight framing lifting into the Swirling 3D Petal Heart
    const scene12Z = THREE.MathUtils.lerp(4.65, 4.45, transition);
    const scene3Z = THREE.MathUtils.lerp(scene12Z, 5.75, gardenReveal);
    const scene4Z = THREE.MathUtils.lerp(scene3Z, 5.2, memoriesFocus);
    const scene5Z = THREE.MathUtils.lerp(scene4Z, 5.35, r.sunset);
    const scene6Z = THREE.MathUtils.lerp(scene5Z, 4.88 - r.finaleHeart * 0.15, r.finale);
    const baseZ = scene6Z - r.sixYearGlow * 0.42 + portraitZoomOut;

    const scene12Y = THREE.MathUtils.lerp(0.32, 1.48, transition);
    const scene3Y = THREE.MathUtils.lerp(scene12Y, 1.72, gardenReveal);
    const scene4Y = THREE.MathUtils.lerp(scene3Y, 1.45, memoriesFocus);
    const scene5Y = THREE.MathUtils.lerp(scene4Y, 1.36, r.sunset);
    const scene6Y = THREE.MathUtils.lerp(scene5Y, 1.18 - r.finaleHeart * 0.08, r.finale);
    const baseY = scene6Y - r.sixYearGlow * 0.16;

    const gardenGlideX =
      Math.sin(elapsed * 0.24) *
      (0.14 * gardenReveal * (1 - memoriesFocus * 0.45) + 0.08 * r.sunset) *
      (1 - r.finale * 0.75) *
      calmFactor;
    const scene12X = THREE.MathUtils.lerp(0.0, 0.22, transition);
    const baseX =
      THREE.MathUtils.lerp(scene12X, gardenGlideX, gardenReveal) *
        (1 - r.sixYearGlow * 0.7) *
        (1 - r.finale * 0.85) +
      gardenState.pointerX * (0.14 + gardenReveal * 0.08) * calmFactor;

    const scene12LookY = THREE.MathUtils.lerp(
      -0.14 + portraitYOffset * 0.5,
      0.04 + portraitYOffset * 0.4,
      transition,
    );
    const scene3LookY = THREE.MathUtils.lerp(
      scene12LookY,
      -0.18 + portraitYOffset * 0.3,
      gardenReveal,
    );
    const scene4LookY = THREE.MathUtils.lerp(
      scene3LookY,
      -0.06 + portraitYOffset * 0.25,
      memoriesFocus,
    );
    const scene5LookY = THREE.MathUtils.lerp(scene4LookY, -0.02 + portraitYOffset * 0.2, r.sunset);
    const scene6LookY = THREE.MathUtils.lerp(
      scene5LookY,
      0.04 + r.finaleHeart * 0.16,
      r.finale,
    );
    const targetLookY =
      THREE.MathUtils.lerp(scene6LookY, 0.02, r.sixYearGlow * 0.65) +
      gardenState.pointerY * 0.06 * calmFactor;

    const targetLookX = gardenState.pointerX * (0.05 + gardenReveal * 0.05) * calmFactor;
    const scene3LookZ = THREE.MathUtils.lerp(0.0, -0.82, gardenReveal);
    const scene4LookZ = THREE.MathUtils.lerp(scene3LookZ, -0.45, memoriesFocus);
    const scene6LookZ = THREE.MathUtils.lerp(scene4LookZ, -0.22, r.finale);
    const targetLookZ = THREE.MathUtils.lerp(scene6LookZ, -0.25, r.sixYearGlow * 0.75);

    r.camX = THREE.MathUtils.damp(r.camX, baseX, 3.4, dt);
    r.camY = THREE.MathUtils.damp(r.camY, baseY, 3.4, dt);
    r.camZ = THREE.MathUtils.damp(r.camZ, baseZ, 3.4, dt);
    r.lookX = THREE.MathUtils.damp(r.lookX, targetLookX, 4.0, dt);
    r.lookY = THREE.MathUtils.damp(r.lookY, targetLookY, 4.0, dt);
    r.lookZ = THREE.MathUtils.damp(r.lookZ, targetLookZ, 3.8, dt);

    camera.position.set(r.camX, r.camY, r.camZ);
    lookAtTarget.set(r.lookX, r.lookY, r.lookZ);
    camera.lookAt(lookAtTarget);

    // Warm Golden-Hour & Sunset/Finale Lighting Transitions (full warm presence through Scene 05 & 06)
    const goldenBoost = Math.max(r.sixYearGlow, r.finaleHeart * 0.85);

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity =
        0.78 + warmth * 0.26 + gardenReveal * 0.12 + r.sunset * 0.14 + goldenBoost * 0.18;
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity =
        1.35 + warmth * 0.52 + gardenReveal * 0.18 + r.sunset * 0.28 + goldenBoost * 0.45;
      tempLightColor
        .copy(KEY_COLOR_MIST)
        .lerp(KEY_COLOR_WARM, Math.min(1, warmth + gardenReveal * 0.25))
        .lerp(KEY_COLOR_SUNSET, r.sunset * 0.78)
        .lerp(KEY_COLOR_GOLDEN_HOUR, goldenBoost * 0.72);
      keyLightRef.current.color.copy(tempLightColor);
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity =
        0.95 + bloom * 0.58 + r.sunset * 0.35 + goldenBoost * 0.45;
      tempLightColor
        .copy(RIM_COLOR_ROSE)
        .lerp(RIM_COLOR_GOLD, Math.min(1, warmth * 0.75 + goldenBoost * 0.5))
        .lerp(RIM_COLOR_SUNSET, r.sunset * 0.72);
      rimLightRef.current.color.copy(tempLightColor);
    }

    if (corePointLightRef.current) {
      corePointLightRef.current.intensity =
        0.35 + bloom * 1.25 + warmth * 0.55 + r.sunset * 0.45 + goldenBoost * 1.05;
      tempLightColor.copy(CORE_COLOR_WARM).lerp(CORE_COLOR_HEART, r.finaleHeart * 0.75);
      corePointLightRef.current.color.copy(tempLightColor);
    }
  });

  return (
    <group name="hero-camera-and-lighting-rig">
      <ambientLight ref={ambientLightRef} color="#fdebf0" intensity={0.82} />
      <directionalLight
        ref={keyLightRef}
        position={[2.4, 4.2, 3.2]}
        color="#ffe6c8"
        intensity={1.38}
      />
      <directionalLight
        ref={rimLightRef}
        position={[-2.6, 2.2, -2.4]}
        color="#ffd29d"
        intensity={0.98}
      />
      <pointLight
        ref={corePointLightRef}
        position={[0, 0.22, 0.1]}
        color="#ffcb7d"
        intensity={0.48}
        distance={3.8}
        decay={2}
      />
    </group>
  );
}

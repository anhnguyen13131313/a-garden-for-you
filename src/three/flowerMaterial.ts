import * as THREE from 'three';

export interface PetalShaderUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uTime: THREE.IUniform<number>;
  uBloom: THREE.IUniform<number>;
  uRingNormalized: THREE.IUniform<number>;
  uWarmth: THREE.IUniform<number>;
  uWindScale: THREE.IUniform<number>;
  uFade: THREE.IUniform<number>;
  uColorBase: THREE.IUniform<THREE.Color>;
  uColorMid: THREE.IUniform<THREE.Color>;
  uColorTip: THREE.IUniform<THREE.Color>;
  uColorGolden: THREE.IUniform<THREE.Color>;
  uLightDir: THREE.IUniform<THREE.Vector3>;
}

export interface GardenInstancedShaderUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uTime: THREE.IUniform<number>;
  uGardenReveal: THREE.IUniform<number>;
  uWarmth: THREE.IUniform<number>;
  uWindScale: THREE.IUniform<number>;
  uFade: THREE.IUniform<number>;
  uTouchWorldPos: THREE.IUniform<THREE.Vector3>;
  uTouchStrength: THREE.IUniform<number>;
  uColorCore: THREE.IUniform<THREE.Color>;
  uColorTip: THREE.IUniform<THREE.Color>;
  uColorGolden: THREE.IUniform<THREE.Color>;
  uFogColor: THREE.IUniform<THREE.Color>;
  uLightDir: THREE.IUniform<THREE.Vector3>;
}

const PETAL_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBloom;
  uniform float uRingNormalized;
  uniform float uWarmth;
  uniform float uWindScale;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying float vRing;

  void main() {
    vUv = uv;
    vRing = uRingNormalized;

    vec3 pos = position;
    vec3 norm = normal;

    // Outer whorls (uRingNormalized ~ 1.0) peel open earlier than inner heart whorls (~ 0.0)
    float whorlOpenStart = mix(0.42, 0.0, uRingNormalized);
    float whorlOpenEnd = mix(0.98, 0.58, uRingNormalized);
    float localOpen = smoothstep(whorlOpenStart, whorlOpenEnd, uBloom);

    // Closed bud state: taper lateral width slightly near base/mid and curl upper petal inward
    // into a slender, overlapping goblet/teardrop rosebud with delicately rolled upper lips.
    float closedState = 1.0 - localOpen;
    float gobletLateralTaper = 1.0 - closedState * (0.22 * (1.0 - uRingNormalized * 0.4) * (1.0 - uv.y * 0.35));
    pos.x *= gobletLateralTaper;

    // Gentle inward embrace in the mid-body + soft outward lip roll at the very upper edge (uv.y > 0.78)
    float midInwardCurl = closedState * (0.28 + 0.18 * (1.0 - uRingNormalized)) * sin(uv.y * 2.35);
    float lipRoll = closedState * 0.09 * smoothstep(0.74, 1.0, uv.y);
    float openReflex = localOpen * (0.10 + 0.15 * uRingNormalized) * pow(uv.y, 2.1);

    float bendAngle = -midInwardCurl + lipRoll + openReflex;

    // Rotate longitudinal coordinates (y, z) around local X to curl/unfurl smoothly
    float c = cos(bendAngle);
    float s = sin(bendAngle);
    float newY = pos.y * c - pos.z * s;
    float newZ = pos.y * s + pos.z * c;
    pos.y = newY;
    pos.z = newZ;

    float normY = norm.y * c - norm.z * s;
    float normZ = norm.y * s + norm.z * c;
    norm.y = normY;
    norm.z = normZ;

    // Organic gentle breeze micro-sway along upper petal margin (calmed by uWindScale while reading)
    float swayPhase = uTime * 1.3 + uRingNormalized * 4.2 + uv.x * 2.5;
    float sway = sin(swayPhase) * 0.014 * uWindScale * pow(uv.y, 1.8) * (0.35 + 0.65 * localOpen);
    pos.z += sway;
    pos.x += cos(swayPhase * 0.8) * 0.006 * uWindScale * uv.y;

    vLocalPos = pos;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * norm);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const PETAL_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBloom;
  uniform float uRingNormalized;
  uniform float uWarmth;
  uniform float uFade;
  uniform vec3 uColorBase;
  uniform vec3 uColorMid;
  uniform vec3 uColorTip;
  uniform vec3 uColorGolden;
  uniform vec3 uLightDir;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying float vRing;

  void main() {
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) {
      N = -N;
    }
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uLightDir);

    // 1. Rich dusty-rose core (#9e2e54) transitioning through soft blush (#ea96b1) to ivory-pink margins (#fff5f8)
    float radialCenter = abs(vUv.x - 0.5) * 2.0;
    float baseToMid = smoothstep(0.0, 0.58, vUv.y);
    float midToTip = smoothstep(0.42, 0.94, vUv.y);

    vec3 petalAlbedo = mix(uColorBase, uColorMid, baseToMid);
    petalAlbedo = mix(petalAlbedo, uColorTip, midToTip * (0.78 + 0.22 * radialCenter));

    // Inner heart whorls retain a richer romantic rose depth; outer petals catch morning ivory
    petalAlbedo = mix(petalAlbedo, uColorBase, (1.0 - vRing) * 0.42 * (1.0 - vUv.y * 0.6));

    // 2. Subtle procedural silk micro-venation for macro Scene 02 close-ups
    float fanCoord = (vUv.x - 0.5) * (1.4 + vUv.y * 2.5);
    float primaryVeins = sin(fanCoord * 40.0 - vUv.y * 9.0) * 0.5 + 0.5;
    float fineSilk = sin(fanCoord * 110.0 + vUv.y * 22.0) * 0.5 + 0.5;
    float veinPattern = smoothstep(0.25, 0.95, primaryVeins) * 0.032 + fineSilk * 0.014;
    float veinMask = smoothstep(0.08, 0.88, vUv.y) * (1.0 - radialCenter * 0.35);
    petalAlbedo = mix(petalAlbedo, uColorTip, veinPattern * veinMask);

    // 3. Deep inter-petal ambient occlusion in the basal claw and nested inner whorls
    float ao = mix(0.34, 1.0, smoothstep(0.0, 0.64, vUv.y)) * mix(0.62, 1.0, vRing);

    // 4. Soft wrap diffuse lighting — shadows are tinted warm rose-umber, never flat or plastic
    float wrap = 0.46;
    float nDotL = dot(N, L);
    float wrapDiffuse = clamp((nDotL + wrap) / (1.0 + wrap), 0.0, 1.0);
    vec3 warmShadowTint = vec3(0.58, 0.24, 0.36);
    vec3 diffuseLit = mix(petalAlbedo * warmShadowTint, petalAlbedo, wrapDiffuse) * ao;

    // 5. View-dependent Fresnel velvet sheen along grazing petal edges
    float fresnel = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.85);
    vec3 velvetSheenColor = mix(uColorTip, uColorGolden, clamp(uWarmth * 0.52, 0.0, 1.0));
    vec3 velvetSheen = velvetSheenColor * fresnel * (0.28 + 0.22 * uBloom) * (0.55 + 0.45 * ao);

    // 6. Subsurface scattering (SSS) translucency at thin margins & warm golden core
    float thinness = smoothstep(0.28, 0.98, vUv.y) * 0.65 + pow(radialCenter, 1.6) * 0.35;
    float backLight = pow(clamp(dot(V, -L) * 0.5 + 0.5, 0.0, 1.0), 2.0);
    float coreRadiant = exp(-vUv.y * 2.8) * (1.0 - vRing * 0.55) * (0.35 + 0.65 * uBloom);
    float sssFactor = (thinness * (0.34 + 0.66 * backLight) + coreRadiant) * (0.42 + 0.65 * uWarmth);
    vec3 sssColor = mix(vec3(0.98, 0.72, 0.79), uColorGolden, clamp(0.48 + 0.42 * uWarmth, 0.0, 1.0));

    // 7. Delicate silk specular highlight on upper petal curvature (avoiding plastic shine)
    vec3 H = normalize(L + V);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 32.0) * 0.095 * (0.5 + 0.5 * uWarmth) * ao;

    vec3 finalColor = diffuseLit + velvetSheen + sssColor * sssFactor * 0.38 + uColorTip * spec;

    gl_FragColor = vec4(finalColor, uFade);
  }
`;

export function createPetalShaderMaterial(ringNormalized: number): THREE.ShaderMaterial {
  const uniforms: PetalShaderUniforms = {
    uTime: { value: 0 },
    uBloom: { value: 0.08 },
    uRingNormalized: { value: ringNormalized },
    uWarmth: { value: 0.1 },
    uWindScale: { value: 1.0 },
    uFade: { value: 1.0 },
    uColorBase: { value: new THREE.Color('#9e2e54') },
    uColorMid: { value: new THREE.Color('#ea96b1') },
    uColorTip: { value: new THREE.Color('#fff5f8') },
    uColorGolden: { value: new THREE.Color('#ffe0a3') },
    uLightDir: { value: new THREE.Vector3(0.45, 0.82, 0.55).normalize() },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: PETAL_VERTEX_SHADER,
    fragmentShader: PETAL_FRAGMENT_SHADER,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: true,
  });
}

const GARDEN_INSTANCED_PETAL_VERTEX = /* glsl */ `
  attribute float aRing;

  uniform float uTime;
  uniform float uGardenReveal;
  uniform float uWarmth;
  uniform float uWindScale;
  uniform vec3 uTouchWorldPos;
  uniform float uTouchStrength;

  varying vec2 vUv;
  varying float vRing;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec3 vInstanceTint;
  varying float vTouchGlow;

  void main() {
    vUv = uv;
    vRing = aRing;

    #ifdef USE_INSTANCING_COLOR
      vInstanceTint = instanceColor;
    #else
      vInstanceTint = vec3(0.96, 0.72, 0.79);
    #endif

    #ifdef USE_INSTANCING
      mat4 instMat = instanceMatrix;
    #else
      mat4 instMat = mat4(1.0);
    #endif

    // Extract instance anchor world position from instanceMatrix column 3
    vec3 anchorWorld = (modelMatrix * vec4(instMat[3].xyz, 1.0)).xyz;

    // Staggered bloom reveal based on radial distance from center
    float distFromCenter = length(anchorWorld.xz);
    float revealWindowStart = clamp(distFromCenter * 0.11, 0.0, 0.45);
    float localReveal = smoothstep(revealWindowStart, min(1.0, revealWindowStart + 0.55), uGardenReveal);

    vec3 pos = position;
    vec3 norm = normal;

    // Petals (vRing > 0.05) unfurl as localReveal progresses from bud to full garden bloom
    if (aRing > 0.05) {
      float budWrap = (1.0 - localReveal) * (0.35 + 0.2 * (1.0 - aRing));
      float openSway = localReveal * 0.12 * aRing;
      float bend = (-budWrap + openSway) * pow(uv.y, 1.4);
      float c = cos(bend);
      float s = sin(bend);
      float ny = pos.y * c - pos.z * s;
      float nz = pos.y * s + pos.z * c;
      pos.y = ny;
      pos.z = nz;

      float nny = norm.y * c - norm.z * s;
      float nnz = norm.y * s + norm.z * c;
      norm.y = nny;
      norm.z = nnz;
    }

    vec4 worldPos4 = modelMatrix * instMat * vec4(pos, 1.0);
    vec3 worldPos = worldPos4.xyz;

    // Gentle rolling wind wave across the garden field (damped by uWindScale when reading a memory)
    float windPhase = uTime * 1.35 + anchorWorld.x * 1.35 + anchorWorld.z * 0.95;
    float petalFlex = 0.35 + 0.65 * uv.y;
    worldPos.x += sin(windPhase) * 0.026 * uWindScale * petalFlex * localReveal;
    worldPos.z += cos(windPhase * 0.85) * 0.018 * uWindScale * petalFlex * localReveal;

    // Localized touch ripple interaction: nearby flowers bend softly and glow
    vec3 toFlower = anchorWorld - uTouchWorldPos;
    toFlower.z *= 0.55;
    float touchDist = length(toFlower);
    float touchInfluence = smoothstep(1.35, 0.0, touchDist) * uTouchStrength;
    vec2 pushDir = length(toFlower.xy) > 0.001 ? normalize(toFlower.xy) : vec2(0.0, 1.0);
    worldPos.xy += pushDir * touchInfluence * 0.08 * petalFlex;
    worldPos.y += touchInfluence * 0.045 * uv.y;

    vTouchGlow = touchInfluence;
    vWorldPos = worldPos;
    vWorldNormal = normalize(mat3(modelMatrix) * mat3(instMat) * norm);
    vViewDir = normalize(cameraPosition - worldPos);

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const GARDEN_INSTANCED_PETAL_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uGardenReveal;
  uniform float uWarmth;
  uniform float uFade;
  uniform vec3 uColorCore;
  uniform vec3 uColorTip;
  uniform vec3 uColorGolden;
  uniform vec3 uFogColor;
  uniform vec3 uLightDir;

  varying vec2 vUv;
  varying float vRing;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec3 vInstanceTint;
  varying float vTouchGlow;

  void main() {
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) {
      N = -N;
    }
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uLightDir);

    // Golden stamen button/cushion at the heart (vRing < 0.05)
    if (vRing < 0.05) {
      float nDotL = clamp(dot(N, L) * 0.6 + 0.4, 0.0, 1.0);
      vec3 stamenCol = mix(vec3(0.88, 0.58, 0.22), uColorGolden, nDotL);
      stamenCol += uColorGolden * (0.28 + vTouchGlow * 0.38 + uWarmth * 0.16);
      float depthFactor = smoothstep(-1.4, -6.2, vWorldPos.z);
      stamenCol = mix(stamenCol, uFogColor, depthFactor * 0.65);
      gl_FragColor = vec4(stamenCol, uFade);
      return;
    }

    // Rich botanical gradient per petal using instance color + deep core claw AO
    float baseToMid = smoothstep(0.0, 0.55, vUv.y);
    float midToTip = smoothstep(0.45, 0.96, vUv.y);

    vec3 deepClaw = mix(uColorCore, vInstanceTint * 0.72, 0.45);
    vec3 albedo = mix(deepClaw, vInstanceTint, baseToMid);
    albedo = mix(albedo, uColorTip, midToTip * 0.78);

    // Ambient occlusion in basal claw and inner whorls
    float ao = mix(0.46, 1.0, smoothstep(0.0, 0.56, vUv.y)) * mix(0.74, 1.0, vRing);

    // Soft wrap diffuse lighting with warm golden-hour sunlight lift
    float wrap = 0.55;
    float wrapDiffuse = clamp((dot(N, L) + wrap) / (1.0 + wrap), 0.0, 1.0);
    vec3 shadowTint = vec3(0.70, 0.38, 0.48);
    vec3 lit = mix(albedo * shadowTint, albedo, wrapDiffuse) * ao;

    // Velvet rim & warm subsurface scattering
    float fresnel = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.6);
    float backLight = pow(clamp(dot(V, -L) * 0.5 + 0.5, 0.0, 1.0), 2.0);
    vec3 rimAndSss = mix(uColorTip, uColorGolden, clamp(0.42 + uWarmth * 0.35, 0.0, 1.0)) *
      (fresnel * (0.26 + uWarmth * 0.12) + backLight * (0.18 + uWarmth * 0.1) * vUv.y);

    // Interactive touch highlight
    vec3 touchRadiance = mix(uColorTip, uColorGolden, 0.58) * vTouchGlow * 0.36;

    vec3 color = lit + rimAndSss + touchRadiance;

    // Atmospheric distance haze blending distant background flowers softly into #fae8ee
    float depthHaze = smoothstep(-1.4, -6.2, vWorldPos.z);
    color = mix(color, uFogColor, depthHaze * 0.68);

    gl_FragColor = vec4(color, uFade);
  }
`;

export function createGardenInstancedPetalMaterial(): THREE.ShaderMaterial {
  const uniforms: GardenInstancedShaderUniforms = {
    uTime: { value: 0 },
    uGardenReveal: { value: 0 },
    uWarmth: { value: 0.25 },
    uWindScale: { value: 1.0 },
    uFade: { value: 1 },
    uTouchWorldPos: { value: new THREE.Vector3(0, 0, -0.6) },
    uTouchStrength: { value: 0 },
    uColorCore: { value: new THREE.Color('#9e2e54') },
    uColorTip: { value: new THREE.Color('#fff5f8') },
    uColorGolden: { value: new THREE.Color('#ffe09e') },
    uFogColor: { value: new THREE.Color('#fae8ee') },
    uLightDir: { value: new THREE.Vector3(0.45, 0.82, 0.55).normalize() },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: GARDEN_INSTANCED_PETAL_VERTEX,
    fragmentShader: GARDEN_INSTANCED_PETAL_FRAGMENT,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: true,
  });
}

const GARDEN_INSTANCED_FOLIAGE_VERTEX = /* glsl */ `
  attribute float aRing;

  uniform float uTime;
  uniform float uGardenReveal;
  uniform float uWindScale;
  uniform vec3 uTouchWorldPos;
  uniform float uTouchStrength;

  varying vec2 vUv;
  varying float vRing;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vInstanceTint;

  void main() {
    vUv = uv;
    vRing = aRing;

    #ifdef USE_INSTANCING_COLOR
      vInstanceTint = instanceColor;
    #else
      vInstanceTint = vec3(0.32, 0.48, 0.36);
    #endif

    #ifdef USE_INSTANCING
      mat4 instMat = instanceMatrix;
    #else
      mat4 instMat = mat4(1.0);
    #endif

    vec3 anchorWorld = (modelMatrix * vec4(instMat[3].xyz, 1.0)).xyz;
    vec4 worldPos4 = modelMatrix * instMat * vec4(position, 1.0);
    vec3 worldPos = worldPos4.xyz;

    // Gentle wind sway across stems and leaf blades (damped when reading memory)
    float windPhase = uTime * 1.35 + anchorWorld.x * 1.35 + anchorWorld.z * 0.95;
    float flex = clamp((worldPos.y - (anchorWorld.y - 1.4)) / 1.5, 0.0, 1.0);
    worldPos.x += sin(windPhase) * 0.024 * uWindScale * flex * uGardenReveal;
    worldPos.z += cos(windPhase * 0.85) * 0.016 * uWindScale * flex * uGardenReveal;

    // Touch bend on nearby stems/leaves
    vec3 toNode = anchorWorld - uTouchWorldPos;
    toNode.z *= 0.55;
    float touchInfluence = smoothstep(1.35, 0.0, length(toNode)) * uTouchStrength;
    vec2 pushDir = length(toNode.xy) > 0.001 ? normalize(toNode.xy) : vec2(0.0, 1.0);
    worldPos.xy += pushDir * touchInfluence * 0.06 * flex;

    vWorldPos = worldPos;
    vWorldNormal = normalize(mat3(modelMatrix) * mat3(instMat) * normal);

    gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
  }
`;

const GARDEN_INSTANCED_FOLIAGE_FRAGMENT = /* glsl */ `
  uniform float uFade;
  uniform float uWarmth;
  uniform vec3 uFogColor;
  uniform vec3 uLightDir;

  varying vec2 vUv;
  varying float vRing;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec3 vInstanceTint;

  void main() {
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) {
      N = -N;
    }
    vec3 L = normalize(uLightDir);

    vec3 baseSage = mix(vInstanceTint * 0.96, vec3(0.44, 0.66, 0.50), 0.48);
    vec3 tipSage = mix(vInstanceTint * 1.22, vec3(0.68, 0.85, 0.68), 0.48 + uWarmth * 0.18);
    vec3 leafAlbedo = mix(baseSage, tipSage, smoothstep(0.0, 0.9, vUv.y) * vRing);

    float wrapDiffuse = clamp((dot(N, L) + 0.6) / 1.6, 0.0, 1.0);
    vec3 shadowGreen = vec3(0.64, 0.78, 0.66);
    vec3 color = mix(leafAlbedo * shadowGreen, leafAlbedo, wrapDiffuse);

    // Distance mist blend into #fae8ee
    float depthHaze = smoothstep(-0.9, -5.6, vWorldPos.z);
    color = mix(color, uFogColor, depthHaze * 0.74);

    gl_FragColor = vec4(color, uFade * 0.88);
  }
`;

export function createGardenInstancedFoliageMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGardenReveal: { value: 0 },
      uWarmth: { value: 0.25 },
      uWindScale: { value: 1.0 },
      uFade: { value: 1 },
      uTouchWorldPos: { value: new THREE.Vector3(0, 0, -0.6) },
      uTouchStrength: { value: 0 },
      uFogColor: { value: new THREE.Color('#fae8ee') },
      uLightDir: { value: new THREE.Vector3(0.45, 0.82, 0.55).normalize() },
    },
    vertexShader: GARDEN_INSTANCED_FOLIAGE_VERTEX,
    fragmentShader: GARDEN_INSTANCED_FOLIAGE_FRAGMENT,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: true,
  });
}

/**
 * Botanical sage-emerald material for the hero flower stem, receptacle, calyx sepals, and rose leaves.
 */
export function createFoliageMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#649672'),
    emissive: new THREE.Color('#3b6447'),
    emissiveIntensity: 0.36,
    roughness: 0.56,
    metalness: 0.04,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
  });
}

/**
 * Warm honey-gold material for the inner stamen crown and pollen anthers.
 */
export function createStamenMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f6c667'),
    emissive: new THREE.Color('#f5b342'),
    emissiveIntensity: 0.35,
    roughness: 0.42,
    metalness: 0.08,
    transparent: true,
    opacity: 1,
  });
}

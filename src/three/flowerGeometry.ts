import * as THREE from 'three';

export interface PetalGeometryOptions {
  width: number;
  length: number;
  cupDepth: number;
  sCurve: number;
  ruffleAmp: number;
  ruffleFreq: number;
  tipCurl: number;
  asymmetryPhase?: number;
  segmentsU?: number;
  segmentsV?: number;
}

/**
 * Generates an organic sculpted rose/peony petal BufferGeometry.
 * - u in [0..1] runs laterally across the petal width (centered at X = 0)
 * - v in [0..1] runs longitudinally from the basal hinge (0) to the upper margin tip (1)
 */
export function createSculptedPetalGeometry(
  options?: Partial<PetalGeometryOptions>,
): THREE.BufferGeometry {
  const {
    width = 0.74,
    length = 0.92,
    cupDepth = 0.16,
    sCurve = 0.065,
    ruffleAmp = 0.024,
    ruffleFreq = 4.5,
    tipCurl = 0.095,
    asymmetryPhase = 0.35,
    segmentsU = 20,
    segmentsV = 24,
  } = options ?? {};

  const cols = segmentsU + 1;
  const rows = segmentsV + 1;
  const vertexCount = cols * rows;

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const petalUvs = new Float32Array(vertexCount * 2);
  const ringAttr = new Float32Array(vertexCount);
  const indices: number[] = [];

  let posIdx = 0;
  let uvIdx = 0;
  let ringIdx = 0;

  for (let iv = 0; iv <= segmentsV; iv++) {
    const v = iv / segmentsV;

    // Broad, velvety obovate rose-petal contour: narrow claw at base, wide upper belly,
    // and a wide, rounded dome top edge (never collapsing to 0 at v=1 so there are no triangular points).
    const baseExpand = Math.pow(v, 0.48);
    const bellyProfile = Math.sin(v * Math.PI * 0.68) * 0.72 + 0.34 * baseExpand;
    const halfWidth = 0.5 * width * bellyProfile;

    // Gentle longitudinal spine so the middle never balloons outward when closed in a bud,
    // paired with a soft outward lip roll near the top edge (v > 0.72).
    const spineZ =
      Math.sin(v * Math.PI * 0.92) * sCurve -
      Math.pow(Math.max(0, v - 0.72) / 0.28, 2.0) * tipCurl;

    for (let iu = 0; iu <= segmentsU; iu++) {
      const u = iu / segmentsU;
      const s = (u - 0.5) * 2; // [-1..1]

      // Subtle harmonic asymmetry across u so each petal margin feels hand-sculpted
      const harmonicAsym =
        1 + 0.028 * Math.sin(u * Math.PI * 3 + asymmetryPhase) * Math.sin(v * Math.PI);

      // Smoothly arched dome silhouette along the upper margin (highest at center s=0, curving down at edges |s|=1)
      const domeArchY = 1 - 0.24 * Math.pow(Math.abs(s), 2.1) * Math.pow(v, 1.5);
      const softHeartCleft = 1 - 0.015 * Math.pow(v, 4) * Math.exp(-s * s * 14);

      const x = s * halfWidth * harmonicAsym;
      const y = v * length * domeArchY * softHeartCleft;

      // Lateral cupping: cradles the lower/mid petal and flattens gracefully at the rolled lip
      const longitudinalCup = Math.sin(v * Math.PI * 0.88) * (1 - 0.28 * Math.pow(v, 2));
      const lateralBowl = (1 - s * s) * cupDepth * longitudinalCup;

      // Organic upper-margin wave
      const marginMask = Math.pow(v, 2.4) * (0.28 + 0.72 * s * s);
      const ruffle =
        Math.sin(u * Math.PI * ruffleFreq + asymmetryPhase) * ruffleAmp * marginMask +
        Math.cos(s * Math.PI * 2.0 + asymmetryPhase * 0.5) * (ruffleAmp * 0.35) * Math.pow(v, 3);

      const z = spineZ + lateralBowl + ruffle;

      positions[posIdx++] = x;
      positions[posIdx++] = y;
      positions[posIdx++] = z;

      uvs[uvIdx] = u;
      uvs[uvIdx + 1] = v;
      petalUvs[uvIdx] = u;
      petalUvs[uvIdx + 1] = v;
      uvIdx += 2;

      ringAttr[ringIdx++] = 0.5;
    }
  }

  for (let iv = 0; iv < segmentsV; iv++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('aPetalUv', new THREE.BufferAttribute(petalUvs, 2));
  geometry.setAttribute('aRing', new THREE.BufferAttribute(ringAttr, 1));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Pointed organic green calyx sepal with a recurved acuminate tip.
 */
export function createSepalGeometry(): THREE.BufferGeometry {
  const segmentsU = 10;
  const segmentsV = 14;
  const cols = segmentsU + 1;
  const vertexCount = cols * (segmentsV + 1);

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  const width = 0.22;
  const length = 0.52;

  let p = 0;
  let t = 0;

  for (let iv = 0; iv <= segmentsV; iv++) {
    const v = iv / segmentsV;
    const taper = Math.sin(v * Math.PI * 0.85) * Math.pow(1 - v, 0.58) + 0.18 * (1 - v);
    const recurveZ = Math.sin(v * Math.PI) * 0.06 - Math.pow(v, 2.5) * 0.13;

    for (let iu = 0; iu <= segmentsU; iu++) {
      const u = iu / segmentsU;
      const s = (u - 0.5) * 2;

      const x = s * width * 0.5 * taper;
      const y = v * length;
      const cup = (1 - s * s) * 0.04 * (1 - v * 0.6);
      const z = recurveZ + cup;

      positions[p++] = x;
      positions[p++] = y;
      positions[p++] = z;

      uvs[t++] = u;
      uvs[t++] = v;
    }
  }

  for (let iv = 0; iv < segmentsV; iv++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Graceful S-curved stem along a CubicBezierCurve3 from flower receptacle deep into the garden bed.
 */
export function createCurvedStemGeometry(): THREE.BufferGeometry {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.03, 0),
    new THREE.Vector3(-0.07, -0.85, 0.05),
    new THREE.Vector3(0.09, -2.05, -0.04),
    new THREE.Vector3(-0.03, -3.45, 0.02),
  );
  const geometry = new THREE.TubeGeometry(curve, 36, 0.038, 10, false);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Botanical rose leaf geometry with central midrib V-fold, arched blade, and serrated margin.
 */
export function createBotanicalLeafGeometry(): THREE.BufferGeometry {
  const segmentsU = 12;
  const segmentsV = 16;
  const cols = segmentsU + 1;
  const vertexCount = cols * (segmentsV + 1);

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices: number[] = [];

  const width = 0.34;
  const length = 0.64;

  let p = 0;
  let t = 0;

  for (let iv = 0; iv <= segmentsV; iv++) {
    const v = iv / segmentsV;
    const envelope = Math.sin(v * Math.PI) * Math.pow(1 - v * 0.25, 0.6);
    const serration = 1 + 0.05 * Math.sin(v * Math.PI * 11) * Math.sin(v * Math.PI);
    const archZ = -Math.pow(v, 1.7) * 0.16 + Math.sin(v * Math.PI) * 0.045;

    for (let iu = 0; iu <= segmentsU; iu++) {
      const u = iu / segmentsU;
      const s = (u - 0.5) * 2;

      const x = s * (width * 0.5) * envelope * serration;
      const y = v * length;
      const midribFold = Math.abs(s) * 0.035 * Math.sin(v * Math.PI);
      const z = archZ + midribFold;

      positions[p++] = x;
      positions[p++] = y;
      positions[p++] = z;

      uvs[t++] = u;
      uvs[t++] = v;
    }
  }

  for (let iv = 0; iv < segmentsV; iv++) {
    for (let iu = 0; iu < segmentsU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Low-profile central carpel cushion surrounded by short curved filaments (0.065..0.098)
 * and soft rounded golden pollen-pillow anthers (radialSides = 6).
 */
export function createStamenCrownGeometry(stamenCount = 28): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // 1. Central low-profile velvety carpel cushion dome at the flower heart
  const domeRings = 5;
  const domeSides = 12;
  const domeRadius = 0.052;
  const domeHeight = 0.036;

  for (let ir = 0; ir <= domeRings; ir++) {
    const v = ir / domeRings;
    const phi = v * Math.PI * 0.5;
    const r = Math.sin(phi) * domeRadius;
    const y = Math.cos(phi) * domeHeight + 0.008;

    for (let is = 0; is <= domeSides; is++) {
      const u = is / domeSides;
      const theta = u * Math.PI * 2;
      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
      uvs.push(u, 1 - v * 0.5);
    }
  }

  const domeCols = domeSides + 1;
  for (let ir = 0; ir < domeRings; ir++) {
    for (let is = 0; is < domeSides; is++) {
      const a = ir * domeCols + is;
      const b = a + 1;
      const c = a + domeCols;
      const d = c + 1;
      indices.push(a, c, d, a, d, b);
    }
  }

  // 2. Short, gently curved filaments with soft pillowy pollen anthers
  const goldenAngle = 137.50776 * (Math.PI / 180);
  const heightSteps = 6;
  const radialSides = 6;

  for (let i = 0; i < stamenCount; i++) {
    const t = i / Math.max(1, stamenCount - 1);
    const angle = i * goldenAngle;
    const baseRadius = 0.044 + 0.068 * Math.sqrt(t);
    const height = 0.065 + 0.033 * t; // 0.065 .. 0.098
    const outCurve = 0.024 + 0.032 * t;

    const baseVertexOffset = positions.length / 3;

    for (let iv = 0; iv <= heightSteps; iv++) {
      const v = iv / heightSteps;
      // Soft rounded golden pollen pillow at tip (v > 0.68)
      const isAnther = v > 0.68;
      const antherPhase = isAnther ? Math.sin(((v - 0.68) / 0.32) * Math.PI) : 0;
      const radius = isAnther
        ? 0.0045 + 0.0115 * antherPhase
        : 0.0042 * (1 - v * 0.25);

      // Gentle inward-then-outward botanical curve around the carpel cushion
      const rCenter =
        baseRadius + Math.sin(v * Math.PI * 0.75) * outCurve - Math.pow(v, 2.4) * 0.012;
      const cx = Math.cos(angle) * rCenter;
      const cz = Math.sin(angle) * rCenter;
      const cy = v * height + 0.012;

      for (let ir = 0; ir <= radialSides; ir++) {
        const u = ir / radialSides;
        const theta = u * Math.PI * 2;
        const nx = Math.cos(theta);
        const nz = Math.sin(theta);
        const rx = radius * (isAnther ? 1.18 : 1.0);
        const rz = radius * (isAnther ? 0.88 : 1.0);

        positions.push(cx + nx * rx, cy, cz + nz * rz);
        uvs.push(u, v);
      }
    }

    const ringCols = radialSides + 1;
    for (let iv = 0; iv < heightSteps; iv++) {
      for (let ir = 0; ir < radialSides; ir++) {
        const a = baseVertexOffset + iv * ringCols + ir;
        const b = a + 1;
        const c = a + ringCols;
        const d = c + 1;
        indices.push(a, b, d, a, d, c);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

interface MergedPartSpec {
  geo: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  ring: number;
}

/**
 * Merges multiple transformed BufferGeometries into a single indexed BufferGeometry
 * with `position`, `normal`, `uv`, and `aRing` (0..1 whorl depth) attributes.
 */
function mergePartsWithRing(parts: MergedPartSpec[]): THREE.BufferGeometry {
  let totalVertices = 0;
  let totalIndices = 0;

  for (let i = 0; i < parts.length; i++) {
    const pos = parts[i].geo.getAttribute('position');
    const idx = parts[i].geo.getIndex();
    totalVertices += pos.count;
    totalIndices += idx ? idx.count : pos.count;
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = new Float32Array(totalVertices * 2);
  const rings = new Float32Array(totalVertices);
  const indices = new Uint32Array(totalIndices);

  const tempVec = new THREE.Vector3();
  const tempNorm = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  let vOffset = 0;
  let iOffset = 0;

  for (let p = 0; p < parts.length; p++) {
    const { geo, matrix, ring } = parts[p];
    if (!geo.getAttribute('normal')) {
      geo.computeVertexNormals();
    }

    const posAttr = geo.getAttribute('position');
    const normAttr = geo.getAttribute('normal');
    const uvAttr = geo.getAttribute('uv');
    const idxAttr = geo.getIndex();

    normalMatrix.getNormalMatrix(matrix);

    for (let iv = 0; iv < posAttr.count; iv++) {
      tempVec.fromBufferAttribute(posAttr, iv).applyMatrix4(matrix);
      const outV = (vOffset + iv) * 3;
      positions[outV] = tempVec.x;
      positions[outV + 1] = tempVec.y;
      positions[outV + 2] = tempVec.z;

      if (normAttr) {
        tempNorm.fromBufferAttribute(normAttr, iv).applyMatrix3(normalMatrix).normalize();
        normals[outV] = tempNorm.x;
        normals[outV + 1] = tempNorm.y;
        normals[outV + 2] = tempNorm.z;
      }

      const outUv = (vOffset + iv) * 2;
      if (uvAttr) {
        uvs[outUv] = uvAttr.getX(iv);
        uvs[outUv + 1] = uvAttr.getY(iv);
      } else {
        uvs[outUv] = 0.5;
        uvs[outUv + 1] = Math.max(0, Math.min(1, (tempVec.y + 0.1) * 1.4));
      }

      rings[vOffset + iv] = ring;
    }

    if (idxAttr) {
      for (let ii = 0; ii < idxAttr.count; ii++) {
        indices[iOffset + ii] = idxAttr.getX(ii) + vOffset;
      }
      iOffset += idxAttr.count;
    } else {
      for (let ii = 0; ii < posAttr.count; ii++) {
        indices[iOffset + ii] = vOffset + ii;
      }
      iOffset += posAttr.count;
    }

    vOffset += posAttr.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  merged.setAttribute('aRing', new THREE.BufferAttribute(rings, 1));
  return merged;
}

/**
 * 1. Classic spiral-whorl cupped heritage rose head (18 sculpted petals across 3 whorls + golden center).
 */
export function createRoseCrownGeometry(): THREE.BufferGeometry {
  const innerPetal = createSculptedPetalGeometry({
    width: 0.58,
    length: 0.72,
    cupDepth: 0.2,
    sCurve: 0.05,
    ruffleAmp: 0.018,
    tipCurl: 0.07,
    segmentsU: 10,
    segmentsV: 12,
  });
  const midPetal = createSculptedPetalGeometry({
    width: 0.72,
    length: 0.84,
    cupDepth: 0.17,
    sCurve: 0.065,
    ruffleAmp: 0.024,
    tipCurl: 0.095,
    segmentsU: 10,
    segmentsV: 12,
  });
  const outerPetal = createSculptedPetalGeometry({
    width: 0.82,
    length: 0.9,
    cupDepth: 0.14,
    sCurve: 0.075,
    ruffleAmp: 0.03,
    tipCurl: 0.11,
    segmentsU: 10,
    segmentsV: 12,
  });
  const centerDome = new THREE.SphereGeometry(0.085, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65);

  const whorls = [
    { count: 5, radius: 0.048, y: 0.04, tilt: 0.36, scale: 0.72, ring: 0.15, geo: innerPetal },
    { count: 6, radius: 0.092, y: 0.02, tilt: 0.68, scale: 0.88, ring: 0.55, geo: midPetal },
    { count: 7, radius: 0.138, y: 0.0, tilt: 0.98, scale: 1.0, ring: 0.95, geo: outerPetal },
  ];

  const parts: MergedPartSpec[] = [];
  const goldenAngle = 137.50776 * (Math.PI / 180);
  const dummy = new THREE.Object3D();
  const pivot = new THREE.Object3D();
  dummy.add(pivot);

  // Heart stamen cushion
  dummy.position.set(0, 0.03, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.scale.set(1, 0.65, 1);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: centerDome, matrix: dummy.matrixWorld.clone(), ring: 0.0 });

  let idx = 0;
  for (let w = 0; w < whorls.length; w++) {
    const spec = whorls[w];
    for (let i = 0; i < spec.count; i++) {
      const azimuth = idx * goldenAngle;
      dummy.position.set(Math.cos(azimuth) * spec.radius, spec.y, Math.sin(azimuth) * spec.radius);
      dummy.rotation.set(0, -azimuth + Math.PI * 0.5, 0);
      dummy.scale.setScalar(1);

      pivot.position.set(0, 0, 0);
      pivot.rotation.set(spec.tilt + ((idx % 3) - 1) * 0.03, 0, 0);
      pivot.scale.set(spec.scale, spec.scale, 1);
      dummy.updateMatrixWorld(true);

      parts.push({
        geo: spec.geo,
        matrix: pivot.matrixWorld.clone(),
        ring: spec.ring,
      });
      idx += 1;
    }
  }

  const merged = mergePartsWithRing(parts);
  innerPetal.dispose();
  midPetal.dispose();
  outerPetal.dispose();
  centerDome.dispose();
  return merged;
}

/**
 * 2. Lush, full, globular ruffled peony bowl (22 broad scalloped petals with upright ruffled inner petals).
 */
export function createPeonyCrownGeometry(): THREE.BufferGeometry {
  const innerRufflePetal = createSculptedPetalGeometry({
    width: 0.62,
    length: 0.74,
    cupDepth: 0.22,
    sCurve: 0.04,
    ruffleAmp: 0.048,
    ruffleFreq: 7.5,
    tipCurl: 0.05,
    segmentsU: 10,
    segmentsV: 12,
  });
  const outerGuardPetal = createSculptedPetalGeometry({
    width: 0.92,
    length: 0.88,
    cupDepth: 0.24,
    sCurve: 0.06,
    ruffleAmp: 0.038,
    ruffleFreq: 6.0,
    tipCurl: 0.08,
    segmentsU: 10,
    segmentsV: 12,
  });
  const centerDome = new THREE.SphereGeometry(0.09, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);

  const whorls = [
    { count: 5, radius: 0.045, y: 0.045, tilt: 0.28, scaleX: 0.74, scaleY: 0.78, ring: 0.12, geo: innerRufflePetal },
    { count: 5, radius: 0.082, y: 0.032, tilt: 0.52, scaleX: 0.86, scaleY: 0.86, ring: 0.38, geo: innerRufflePetal },
    { count: 6, radius: 0.125, y: 0.016, tilt: 0.78, scaleX: 0.96, scaleY: 0.94, ring: 0.68, geo: outerGuardPetal },
    { count: 6, radius: 0.168, y: 0.0, tilt: 1.04, scaleX: 1.08, scaleY: 1.0, ring: 0.96, geo: outerGuardPetal },
  ];

  const parts: MergedPartSpec[] = [];
  const goldenAngle = 137.50776 * (Math.PI / 180);
  const dummy = new THREE.Object3D();
  const pivot = new THREE.Object3D();
  dummy.add(pivot);

  dummy.position.set(0, 0.035, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.scale.set(1.1, 0.6, 1.1);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: centerDome, matrix: dummy.matrixWorld.clone(), ring: 0.0 });

  let idx = 0;
  for (let w = 0; w < whorls.length; w++) {
    const spec = whorls[w];
    for (let i = 0; i < spec.count; i++) {
      const azimuth = idx * goldenAngle + w * 0.2;
      dummy.position.set(Math.cos(azimuth) * spec.radius, spec.y, Math.sin(azimuth) * spec.radius);
      dummy.rotation.set(0, -azimuth + Math.PI * 0.5, 0);
      dummy.scale.setScalar(1);

      pivot.position.set(0, 0, 0);
      pivot.rotation.set(spec.tilt + ((idx % 2) - 0.5) * 0.04, 0, ((idx % 3) - 1) * 0.05);
      pivot.scale.set(spec.scaleX, spec.scaleY, 1);
      dummy.updateMatrixWorld(true);

      parts.push({
        geo: spec.geo,
        matrix: pivot.matrixWorld.clone(),
        ring: spec.ring,
      });
      idx += 1;
    }
  }

  const merged = mergePartsWithRing(parts);
  innerRufflePetal.dispose();
  outerGuardPetal.dispose();
  centerDome.dispose();
  return merged;
}

/**
 * 3. Delicate 6-petal open star-cup companion flower (anemone/cosmos silhouette) with a warm golden stamen button.
 */
export function createCompanionBlossomGeometry(): THREE.BufferGeometry {
  const blossomPetal = createSculptedPetalGeometry({
    width: 0.56,
    length: 0.82,
    cupDepth: 0.11,
    sCurve: 0.04,
    ruffleAmp: 0.016,
    ruffleFreq: 3.5,
    tipCurl: 0.06,
    segmentsU: 9,
    segmentsV: 11,
  });
  const goldenButton = new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65);

  const parts: MergedPartSpec[] = [];
  const dummy = new THREE.Object3D();
  const pivot = new THREE.Object3D();
  dummy.add(pivot);

  // Prominent golden stamen pillow at the heart (ring = 0.0)
  dummy.position.set(0, 0.02, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.scale.set(1.15, 0.62, 1.15);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: goldenButton, matrix: dummy.matrixWorld.clone(), ring: 0.0 });

  // 6 open star-cup petals in two alternating 3-petal rings
  for (let i = 0; i < 6; i++) {
    const isOuter = i % 2 === 1;
    const angle = (i / 6) * Math.PI * 2 + (isOuter ? 0.04 : 0);
    const radius = isOuter ? 0.095 : 0.078;
    const tilt = isOuter ? 1.12 : 0.98;

    dummy.position.set(Math.cos(angle) * radius, isOuter ? 0.0 : 0.012, Math.sin(angle) * radius);
    dummy.rotation.set(0, -angle + Math.PI * 0.5, 0);
    dummy.scale.setScalar(1);

    pivot.position.set(0, 0, 0);
    pivot.rotation.set(tilt, 0, 0);
    pivot.scale.set(isOuter ? 1.04 : 0.96, 1.0, 1.0);
    dummy.updateMatrixWorld(true);

    parts.push({
      geo: blossomPetal,
      matrix: pivot.matrixWorld.clone(),
      ring: isOuter ? 0.92 : 0.72,
    });
  }

  const merged = mergePartsWithRing(parts);
  blossomPetal.dispose();
  goldenButton.dispose();
  return merged;
}

/**
 * 4. Graceful tapered rosebud with enclosing spiral petals and cupped calyx base.
 */
export function createSlenderRosebudGeometry(): THREE.BufferGeometry {
  const budPetal = createSculptedPetalGeometry({
    width: 0.54,
    length: 0.78,
    cupDepth: 0.19,
    sCurve: 0.04,
    ruffleAmp: 0.012,
    ruffleFreq: 3.0,
    tipCurl: 0.075,
    segmentsU: 9,
    segmentsV: 12,
  });

  const parts: MergedPartSpec[] = [];
  const goldenAngle = 137.50776 * (Math.PI / 180);
  const dummy = new THREE.Object3D();
  const pivot = new THREE.Object3D();
  dummy.add(pivot);

  const budCount = 8;
  for (let i = 0; i < budCount; i++) {
    const t = i / (budCount - 1);
    const azimuth = i * goldenAngle;
    const radius = 0.032 + t * 0.065;
    // Negative/upward tilt so petals wrap into a slender tapered goblet bud
    const tilt = -0.18 + t * 0.34;
    const scale = 0.68 + t * 0.28;

    dummy.position.set(Math.cos(azimuth) * radius, (1 - t) * 0.04, Math.sin(azimuth) * radius);
    dummy.rotation.set(0, -azimuth + Math.PI * 0.5, 0);
    dummy.scale.setScalar(1);

    pivot.position.set(0, 0, 0);
    pivot.rotation.set(tilt, 0, 0);
    pivot.scale.set(scale, scale * 1.05, 1);
    dummy.updateMatrixWorld(true);

    parts.push({
      geo: budPetal,
      matrix: pivot.matrixWorld.clone(),
      ring: 0.15 + t * 0.75,
    });
  }

  const merged = mergePartsWithRing(parts);
  budPetal.dispose();
  return merged;
}

/**
 * 5. Slender curved stem with fuller calyx receptacle cup and 3 arched botanical leaves
 * merged into a single geometry for instancing.
 * Origin (0,0,0) sits right inside the flower crown base; stem extends down to y = -3.6
 * so no flower stem ever appears floating or disconnected in wide garden views.
 */
export function createGardenStemWithLeavesGeometry(): THREE.BufferGeometry {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.03, 0),
    new THREE.Vector3(-0.03, -0.24, 0.02),
    new THREE.Vector3(0.03, -0.52, -0.02),
    new THREE.Vector3(-0.01, -0.78, 0.01),
  );
  const stemGeo = new THREE.TubeGeometry(curve, 14, 0.022, 7, false);
  const leafGeo = createBotanicalLeafGeometry();
  const calyxCupGeo = new THREE.CylinderGeometry(0.13, 0.034, 0.16, 8, 1, false);

  const parts: MergedPartSpec[] = [];
  const dummy = new THREE.Object3D();

  // Stem (ring = 0.2)
  dummy.position.set(0, 0, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.scale.setScalar(1);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: stemGeo, matrix: dummy.matrixWorld.clone(), ring: 0.2 });

  // Fuller Receptacle / Calyx cup right under flower head (ring = 0.35)
  dummy.position.set(0, -0.02, 0);
  dummy.rotation.set(0, 0, 0);
  dummy.scale.setScalar(1);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: calyxCupGeo, matrix: dummy.matrixWorld.clone(), ring: 0.35 });

  // Upper leaf (ring = 0.8)
  dummy.position.set(-0.03, -0.22, 0.02);
  dummy.rotation.set(0.56, -0.78, 0.38);
  dummy.scale.setScalar(0.76);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: leafGeo, matrix: dummy.matrixWorld.clone(), ring: 0.8 });

  // Mid leaf (ring = 0.9)
  dummy.position.set(0.04, -0.44, -0.01);
  dummy.rotation.set(0.62, 1.22, -0.35);
  dummy.scale.setScalar(0.84);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: leafGeo, matrix: dummy.matrixWorld.clone(), ring: 0.9 });

  // Lower leaf (ring = 0.96)
  dummy.position.set(-0.02, -0.64, 0.02);
  dummy.rotation.set(0.58, -1.35, 0.32);
  dummy.scale.setScalar(0.78);
  dummy.updateMatrixWorld(true);
  parts.push({ geo: leafGeo, matrix: dummy.matrixWorld.clone(), ring: 0.96 });

  const merged = mergePartsWithRing(parts);
  stemGeo.dispose();
  leafGeo.dispose();
  calyxCupGeo.dispose();
  return merged;
}

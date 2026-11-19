import {
  SCENE_META,
  clamp01,
  clampSceneIndex,
  getMorphScatterImpulse,
  type SceneStageName,
} from "@/lib/stage-controller";

export type ParticleColorIndex = 0 | 1 | 2;

// Cosmic 3-color palette: 65% Pure White, 20% Light Orange (#FB923C), 15% Electric Sky Blue (#38BDF8)
export const COSMIC_PALETTE_RGB: readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
] = [
  [255, 255, 255], // 0: Pure White (65%)
  [251, 146, 60],  // 1: Light Orange #FB923C (20%)
  [56, 189, 248],  // 2: Electric Sky Blue #38BDF8 (15%)
] as const;

export const DESKTOP_PARTICLE_COUNT = 2600;
export const MOBILE_PARTICLE_COUNT = 1100;
export const AMBIENT_STAR_COUNT = 280;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SpaceParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  /** 5 distinct 3D point-cloud targets: [rocket, satellite, globe, gyroscope, astronaut] */
  targets: [Vec3, Vec3, Vec3, Vec3, Vec3];
  /** Deterministic swirl/scatter direction vector during continuous scroll transitions */
  scatterDir: Vec3;
  colorIdx: ParticleColorIndex;
  radius: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
}

export interface AmbientStar {
  nx: number;
  ny: number;
  depth: number;
  radius: number;
  alpha: number;
  colorIdx: ParticleColorIndex;
  driftVx: number;
  driftVy: number;
}

export interface SceneAnchorConfig {
  stage: SceneStageName;
  anchorX: number;
  anchorY: number;
  scale: number;
}

export interface ProjectedPoint {
  screenX: number;
  screenY: number;
  perspective: number;
  depthNorm: number;
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getParticleBudget(viewportWidth: number): number {
  return viewportWidth < 768 ? MOBILE_PARTICLE_COUNT : DESKTOP_PARTICLE_COUNT;
}

/**
 * Deterministic 65% Pure White / 20% Light Orange / 15% Electric Sky Blue assignment.
 */
export function pickCosmicColorIndex(randVal: number): ParticleColorIndex {
  if (randVal < 0.65) return 0;
  if (randVal < 0.85) return 1;
  return 2;
}

/**
 * Scene 0: Volumetric 3D Rocket tilted diagonally up-right
 * (curved ogive nose cone, cylindrical hull, circular porthole ring, 4 swept tail fins,
 * flared engine bell, and luminous thruster exhaust plume).
 */
export function sampleRocketPoint(rand: () => number): Vec3 {
  const part = rand();
  let lx = 0;
  let ly = 0;
  let lz = 0;

  if (part < 0.44) {
    const u = rand(); // 0 = aft, 1 = nose tip
    ly = -145 + u * 340;
    let rad: number;
    if (u > 0.56) {
      const t = (u - 0.56) / 0.44;
      rad = 68 * Math.pow(1 - t * t, 0.58);
    } else if (u < 0.14) {
      const t = u / 0.14;
      rad = 44 + 24 * t;
    } else {
      const mid = (u - 0.14) / 0.42;
      rad = 68 + Math.sin(mid * Math.PI) * 10;
    }
    const angle = rand() * Math.PI * 2;
    const shell = 0.88 + rand() * 0.15;
    lx = Math.cos(angle) * rad * shell;
    lz = Math.sin(angle) * rad * shell;
  } else if (part < 0.58) {
    // Prominent circular viewport / porthole ring on the rocket body
    const angle = rand() * Math.PI * 2;
    const ringR = rand() < 0.65 ? 30 + (rand() - 0.5) * 6 : Math.sqrt(rand()) * 27;
    lx = Math.cos(angle) * ringR;
    ly = 24 + Math.sin(angle) * ringR;
    lz = 72 + (rand() - 0.5) * 8;
  } else if (part < 0.8) {
    // 4 sculpted swept tail fins
    const finIdx = Math.floor(rand() * 4);
    const finAngle = (finIdx * Math.PI) / 2 + Math.PI / 4;
    const u = rand();
    const v = rand();
    const span = 50 + u * 84;
    const finY = -75 - u * 85 + (v - 0.5) * (1 - u * 0.55) * 72;
    const thick = (rand() - 0.5) * 9;
    lx = Math.cos(finAngle) * span - Math.sin(finAngle) * thick;
    lz = Math.sin(finAngle) * span + Math.cos(finAngle) * thick;
    ly = finY;
  } else if (part < 0.9) {
    // Flared rocket engine bell
    const u = rand();
    ly = -145 - u * 36;
    const rad = 34 + u * 16;
    const angle = rand() * Math.PI * 2;
    lx = Math.cos(angle) * rad;
    lz = Math.sin(angle) * rad;
  } else {
    // Soft luminous thruster exhaust plume
    const u = rand();
    const spread = 16 + u * 44;
    const angle = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * spread;
    lx = Math.cos(angle) * rr;
    lz = Math.sin(angle) * rr;
    ly = -182 - u * 78;
  }

  // Invert local Y so nose cone points UP (negative screen Y) and exhaust trails DOWN
  const sy = -ly;

  // Rotate rocket diagonally in 3D space (~34 deg tilt pointing up-right)
  const tiltZ = 0.58;
  const tiltX = 0.22;
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);
  const rx = lx * cosZ - sy * sinZ;
  const ry = lx * sinZ + sy * cosZ;

  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const fy = ry * cosX - lz * sinX;
  const fz = ry * sinX + lz * cosX;

  return { x: rx, y: fy, z: fz };
}

/**
 * Scene 1: 3D Orbiting Satellite (octagonal core bus, twin wide solar array wings
 * with crisp photovoltaic grid ribs, parabolic dish antenna + feed horn, and orbital ring).
 */
export function sampleSatellitePoint(rand: () => number): Vec3 {
  const part = rand();
  let x = 0;
  let y = 0;
  let z = 0;

  if (part < 0.24) {
    const face = Math.floor(rand() * 8);
    const angle = (face / 8) * Math.PI * 2 + (rand() - 0.5) * 0.22;
    const height = (rand() - 0.5) * 112;
    const rad = rand() < 0.85 ? 42 + (rand() - 0.5) * 3 : Math.sqrt(rand()) * 40;
    x = Math.cos(angle) * rad;
    y = height;
    z = Math.sin(angle) * rad;
  } else if (part < 0.72) {
    const side = rand() < 0.5 ? -1 : 1;
    const panelStart = 64;
    const panelLen = 176;
    const panelHalfH = 44;
    const gridChoice = rand();
    let u = rand();
    let v = rand();
    if (gridChoice < 0.35) {
      const edge = Math.floor(rand() * 4);
      if (edge === 0) v = 0;
      else if (edge === 1) v = 1;
      else if (edge === 2) u = 0;
      else u = 1;
    } else if (gridChoice < 0.65) {
      if (rand() < 0.6) {
        u = Math.floor(rand() * 7) / 6;
      } else {
        v = Math.floor(rand() * 4) / 3;
      }
    }
    x = side * (panelStart + u * panelLen);
    y = (v - 0.5) * 2 * panelHalfH;
    z = (rand() - 0.5) * 4;
  } else if (part < 0.87) {
    if (rand() < 0.16) {
      x = (rand() - 0.5) * 4;
      z = (rand() - 0.5) * 4;
      y = -62 - rand() * 46;
    } else {
      const angle = rand() * Math.PI * 2;
      const r = rand() < 0.35 ? 48 + (rand() - 0.5) * 3 : Math.sqrt(rand()) * 48;
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      y = -62 - (r * r) / 52;
    }
  } else {
    const theta = rand() * Math.PI * 2;
    const ringR = 232 + (rand() - 0.5) * 5;
    x = Math.cos(theta) * ringR;
    z = Math.sin(theta) * ringR;
    y = (rand() - 0.5) * 4;
  }

  const tiltZ = -0.32;
  const tiltX = 0.28;
  const rx = x * Math.cos(tiltZ) - y * Math.sin(tiltZ);
  const ry = x * Math.sin(tiltZ) + y * Math.cos(tiltZ);
  const fy = ry * Math.cos(tiltX) - z * Math.sin(tiltX);
  const fz = ry * Math.sin(tiltX) + z * Math.cos(tiltX);

  return { x: rx, y: fy, z: fz };
}

/**
 * Scene 2: 3D Rotating Geodesic Globe (dense latitude/longitude rings + Fibonacci sphere surface).
 */
export function sampleGlobePoint(
  index: number,
  total: number,
  rand: () => number
): Vec3 {
  const radius = 196;
  const mode = rand();

  if (mode < 0.38) {
    const latSteps = [-65, -45, -22, 0, 22, 45, 65];
    const latDeg = latSteps[Math.floor(rand() * latSteps.length)];
    const lat = (latDeg * Math.PI) / 180;
    const lon = rand() * Math.PI * 2;
    const r = radius + (rand() - 0.5) * 4;
    return {
      x: r * Math.cos(lat) * Math.cos(lon),
      y: r * Math.sin(lat),
      z: r * Math.cos(lat) * Math.sin(lon),
    };
  }

  if (mode < 0.68) {
    const meridianCount = 14;
    const lon =
      (Math.floor(rand() * meridianCount) / meridianCount) * Math.PI * 2;
    const lat = (rand() - 0.5) * Math.PI;
    const r = radius + (rand() - 0.5) * 4;
    return {
      x: r * Math.cos(lat) * Math.cos(lon),
      y: r * Math.sin(lat),
      z: r * Math.cos(lat) * Math.sin(lon),
    };
  }

  const phi = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const jitter = radius + (rand() - 0.5) * 10;
  return {
    x: jitter * Math.sin(phi) * Math.cos(theta),
    y: jitter * Math.cos(phi),
    z: jitter * Math.sin(phi) * Math.sin(theta),
  };
}

/**
 * Scene 3: 3D Gyroscope / Interlocking Orbital Rings particle sculpture
 * (3 mutually tilted gimbal rings + precision axle pins + luminous central core sphere).
 */
export function sampleGyroscopePoint(rand: () => number): Vec3 {
  const part = rand();

  const sampleTorusRing = (
    majorR: number,
    minorR: number,
    tiltX: number,
    tiltZ: number
  ): Vec3 => {
    const theta = rand() * Math.PI * 2;
    const phi = rand() * Math.PI * 2;
    const r = majorR + Math.cos(phi) * minorR;
    const lx = Math.cos(theta) * r;
    const ly = Math.sin(phi) * minorR;
    const lz = Math.sin(theta) * r;

    // Tilt around X then Z
    const y1 = ly * Math.cos(tiltX) - lz * Math.sin(tiltX);
    const z1 = ly * Math.sin(tiltX) + lz * Math.cos(tiltX);
    const x2 = lx * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    const y2 = lx * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    return { x: x2, y: y2, z: z1 };
  };

  if (part < 0.3) {
    // Outer gimbal ring
    return sampleTorusRing(218, 9, 0.42, 0.25);
  }
  if (part < 0.58) {
    // Middle interlocking gimbal ring
    return sampleTorusRing(172, 8.5, -0.82, 0.58);
  }
  if (part < 0.82) {
    // Inner fast-precessing orbital ring
    return sampleTorusRing(126, 7.5, 1.18, -0.52);
  }
  if (part < 0.9) {
    // Precision cardinal gimbal axle pins linking outer to inner rings
    const axis = Math.floor(rand() * 3);
    const sign = rand() < 0.5 ? -1 : 1;
    const span = 62 + rand() * 155;
    const j1 = (rand() - 0.5) * 6;
    const j2 = (rand() - 0.5) * 6;
    if (axis === 0) return { x: sign * span, y: j1, z: j2 };
    if (axis === 1) return { x: j1, y: sign * span, z: j2 };
    return { x: j1, y: j2, z: sign * span };
  }

  // Luminous central gyroscope core sphere
  const u = rand() * 2 - 1;
  const theta = rand() * Math.PI * 2;
  const root = Math.sqrt(1 - u * u);
  const rad = rand() < 0.72 ? 48 + (rand() - 0.5) * 4 : Math.cbrt(rand()) * 44;
  return {
    x: rad * root * Math.cos(theta),
    y: rad * u,
    z: rad * root * Math.sin(theta),
  };
}

/**
 * Scene 4: 3D Full-Body Waving Astronaut standing upright in center
 * (helmet + dark visor cavity, backpack PLSS, torso suit, raised waving left arm,
 * relaxed right arm, separated legs & moon boots).
 */
export function sampleAstronautPoint(rand: () => number): Vec3 {
  const part = rand();

  if (part < 0.27) {
    if (rand() < 0.28) {
      const angle = rand() * Math.PI * 2;
      const vx = Math.cos(angle) * 34;
      const vy = -132 + Math.sin(angle) * 24;
      const vz = 44 + Math.cos(angle * 2) * 3;
      return { x: vx, y: vy, z: vz };
    }
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const root = Math.sqrt(1 - u * u);
    const rad = 52 + (rand() - 0.5) * 3.5;
    const x = rad * root * Math.cos(theta);
    const y = -134 + rad * u;
    const z = rad * root * Math.sin(theta);
    if (z > 30 && Math.abs(x) < 28 && y > -152 && y < -114) {
      return { x: x * 1.04, y, z: -Math.abs(z) };
    }
    return { x, y, z };
  }

  if (part < 0.48) {
    const t = rand();
    const y = -76 + t * 114;
    const widthX = 50 - Math.abs(t - 0.35) * 10;
    const depthZ = 30 - Math.abs(t - 0.35) * 4;
    const angle = rand() * Math.PI * 2;
    const shell = 0.9 + rand() * 0.1;
    return {
      x: Math.cos(angle) * widthX * shell,
      y,
      z: Math.sin(angle) * depthZ * shell,
    };
  }

  if (part < 0.56) {
    const sx = rand() < 0.5 ? -44 : 44;
    const edge = rand() < 0.5;
    return {
      x: edge ? sx + (rand() - 0.5) * 6 : (rand() - 0.5) * 88,
      y: -74 + rand() * 98,
      z: -34 - rand() * 28,
    };
  }

  if (part < 0.7) {
    const t = rand();
    let cx: number;
    let cy: number;
    if (t < 0.48) {
      const k = t / 0.48;
      cx = -52 - k * 52;
      cy = -56 - k * 28;
    } else {
      const k = (t - 0.48) / 0.52;
      cx = -104 - k * 18;
      cy = -84 - k * 78;
    }
    const angle = rand() * Math.PI * 2;
    const armR = t > 0.85 ? 19 : 14;
    return {
      x: cx + Math.cos(angle) * armR,
      y: cy + Math.sin(angle) * armR * 0.55,
      z: Math.sin(angle) * armR + 10,
    };
  }

  if (part < 0.79) {
    const t = rand();
    const cx = 54 + t * 44;
    const cy = -56 + t * 96;
    const angle = rand() * Math.PI * 2;
    const armR = t > 0.85 ? 17 : 13;
    return {
      x: cx + Math.cos(angle) * armR,
      y: cy + Math.sin(angle) * armR * 0.5,
      z: Math.sin(angle) * armR + 6,
    };
  }

  const legSide = rand() < 0.5 ? -1 : 1;
  const t = rand();
  const y = 42 + t * 152;
  const cx = legSide * (28 + t * 18);
  const angle = rand() * Math.PI * 2;
  const isBoot = t > 0.82;
  const legR = isBoot ? 21 : 16;
  return {
    x: cx + Math.cos(angle) * legR,
    y,
    z: Math.sin(angle) * legR + (isBoot ? 14 : 0),
  };
}

export function createSpaceParticles(
  count: number,
  seed = 202605
): SpaceParticle[] {
  const rand = createSeededRandom(seed);
  const particles: SpaceParticle[] = [];

  for (let i = 0; i < count; i++) {
    const rocket = sampleRocketPoint(rand);
    const satellite = sampleSatellitePoint(rand);
    const globe = sampleGlobePoint(i, count, rand);
    const gyroscope = sampleGyroscopePoint(rand);
    const astronaut = sampleAstronautPoint(rand);

    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const root = Math.sqrt(1 - u * u);
    const scatterMag = 140 + rand() * 220;

    particles.push({
      x: rocket.x,
      y: rocket.y,
      z: rocket.z,
      vx: 0,
      vy: 0,
      vz: 0,
      targets: [rocket, satellite, globe, gyroscope, astronaut],
      scatterDir: {
        x: root * Math.cos(theta) * scatterMag,
        y: u * scatterMag,
        z: root * Math.sin(theta) * scatterMag,
      },
      colorIdx: pickCosmicColorIndex(rand()),
      radius: 0.78 + rand() * 1.32,
      baseAlpha: 0.48 + rand() * 0.52,
      phase: rand() * Math.PI * 2,
      twinkleSpeed: 0.9 + rand() * 1.9,
    });
  }

  return particles;
}

export function createAmbientStars(
  count = AMBIENT_STAR_COUNT,
  seed = 90017
): AmbientStar[] {
  const rand = createSeededRandom(seed);
  const stars: AmbientStar[] = [];

  for (let i = 0; i < count; i++) {
    const colorRoll = rand();
    // Mostly white background stardust with subtle orange & sky sparkles
    const colorIdx: ParticleColorIndex =
      colorRoll < 0.72 ? 0 : colorRoll < 0.87 ? 1 : 2;
    stars.push({
      nx: rand(),
      ny: rand(),
      depth: 0.2 + rand() * 0.85,
      radius: 0.55 + rand() * 1.15,
      alpha: 0.14 + rand() * 0.48,
      colorIdx,
      driftVx: (rand() - 0.5) * 0.008,
      driftVy: -0.004 - rand() * 0.01,
    });
  }

  return stars;
}

export function getSceneAnchorConfig(
  sceneIndex: number,
  isMobile: boolean
): SceneAnchorConfig {
  const idx = Math.max(0, Math.min(4, Math.round(sceneIndex)));
  const stage = SCENE_META[idx]?.stage ?? "rocket";

  if (idx === 0) {
    return {
      stage,
      anchorX: isMobile ? 0.5 : 0.72,
      anchorY: isMobile ? 0.66 : 0.54,
      scale: isMobile ? 0.72 : 1.08,
    };
  }
  if (idx === 1) {
    return {
      stage,
      anchorX: isMobile ? 0.5 : 0.3,
      anchorY: isMobile ? 0.66 : 0.56,
      scale: isMobile ? 0.72 : 1.05,
    };
  }
  if (idx === 2) {
    return {
      stage,
      anchorX: isMobile ? 0.5 : 0.73,
      anchorY: isMobile ? 0.66 : 0.54,
      scale: isMobile ? 0.72 : 1.32,
    };
  }
  if (idx === 3) {
    // Rotating 3D Gyroscope centered cleanly behind/above the 3-column workflow
    return {
      stage,
      anchorX: isMobile ? 0.5 : 0.7,
      anchorY: isMobile ? 0.66 : 0.48,
      scale: isMobile ? 0.72 : 1.06,
    };
  }
  return {
    stage,
    anchorX: 0.5,
    anchorY: isMobile ? 0.66 : 0.53,
    scale: isMobile ? 0.72 : 1.2,
  };
}

/**
 * Smoothly steps each particle toward the locked active scene's 3D formation
 * using critically-damped spring physics (vx = (vx + (tx - x) * 0.042) * 0.80)
 * plus a gentle tangential swirl impulse during transitions (~850ms settling time).
 */
export function stepMorphParticles(
  particles: SpaceParticle[],
  targetScene: number,
  transitionProgress: number,
  timeSec: number,
  dt: number,
  isStatic = false
): void {
  const sceneIdx = clampSceneIndex(targetScene);
  const scatter = isStatic ? 0 : getMorphScatterImpulse(transitionProgress);

  // Gentle tangential swirl impulse during transitions
  const swirlAngle = scatter * 0.65;
  const cosS = Math.cos(swirlAngle);
  const sinS = Math.sin(swirlAngle);

  // Critically-damped spring physics: vx = (vx + (tx - x) * 0.042) * 0.80
  const springK = 0.042;
  const damping = 0.8;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const target = p.targets[sceneIdx];

    const rotatedX = target.x * cosS - target.z * sinS;
    const rotatedZ = target.x * sinS + target.z * cosS;

    const breathe = isStatic ? 0 : Math.sin(timeSec * 1.15 + p.phase) * 1.8;
    const goalX = rotatedX + p.scatterDir.x * scatter * 0.45 + breathe;
    const goalY = target.y + p.scatterDir.y * scatter * 0.40 + breathe * 0.6;
    const goalZ = rotatedZ + p.scatterDir.z * scatter * 0.45;

    if (isStatic) {
      p.x = target.x;
      p.y = target.y;
      p.z = target.z;
      p.vx = 0;
      p.vy = 0;
      p.vz = 0;
    } else {
      p.vx = (p.vx + (goalX - p.x) * springK) * damping;
      p.vy = (p.vy + (goalY - p.y) * springK) * damping;
      p.vz = (p.vz + (goalZ - p.z) * springK) * damping;

      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
    }
  }
}

export function projectPoint3D(
  x: number,
  y: number,
  z: number,
  rotY: number,
  rotX: number,
  originX: number,
  originY: number,
  viewportScale: number
): ProjectedPoint {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  const focalLength = 760;
  const cameraZ = 680;
  const perspective = focalLength / Math.max(150, cameraZ + z2);

  return {
    screenX: originX + x1 * viewportScale * perspective,
    screenY: originY + y1 * viewportScale * perspective,
    perspective,
    depthNorm: clamp01((260 - z2) / 520),
  };
}

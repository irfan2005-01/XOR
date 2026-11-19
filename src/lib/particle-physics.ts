export interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIndex: 0 | 1 | 2;
  baseR: number;
  baseG: number;
  baseB: number;
  baseAlpha: number;
  phase: number;
  driftSpeed: number;
  driftAmp: number;
  heat: number; // 0 = resting state, 1 = energized during hover
}

export interface PointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export const LOGICAL_SIZE = 420;
export const CENTER = LOGICAL_SIZE / 2;

// Sharp geometric "X" geometry dimensions in logical canvas units
export const X_HALF_HEIGHT = 124;
export const X_SLOPE = 0.88;
export const X_STROKE_HALF_WIDTH = 24;

// Generous hover interaction radius & slow, fluid zero-gravity physics (in seconds)
export const INTERACT_RADIUS = 145;
export const STIFFNESS = 6.2; // s^-2 — unhurried, weightless spring return
export const DAMPING = 4.2; // s^-1 — silky fluid drag (zeta ~ 0.84, zero harsh bounce)
export const REPEL_STRENGTH = 2200; // px/s^2 — lush, expressive parting around pointer
export const SWIRL_STRENGTH = 620; // px/s^2 — graceful orbital curl during hover
export const WAKE_COUPLING = 0.18; // pointer velocity wake transfer
export const MAX_SPEED = 190; // px/s — serene speed ceiling so sweeps never snap
export const PARTICLE_COUNT = 2600;

// Petroleum & Brick Rose palette micro-particles
export const PARTICLE_PALETTE = [
  [239, 231, 228], // #EFE7E4 Ivory Sand
  [181, 146, 137], // #B59289 Sand
  [188, 128, 106], // #BC806A Brick Rose
] as const;

export function isPointInGeometricX(
  x: number,
  y: number,
  tolerance: number = 0.01
): boolean {
  const dx = x - CENTER;
  const dy = y - CENTER;
  if (Math.abs(dy) > X_HALF_HEIGHT + tolerance) {
    return false;
  }
  const distLeg1 = Math.abs(dx - X_SLOPE * dy);
  const distLeg2 = Math.abs(dx + X_SLOPE * dy);
  return (
    distLeg1 <= X_STROKE_HALF_WIDTH + tolerance ||
    distLeg2 <= X_STROKE_HALF_WIDTH + tolerance
  );
}

export function createParticles(count: number = PARTICLE_COUNT): Particle[] {
  const particles: Particle[] = [];

  // Deterministic pseudo-random generator for crisp, balanced geometric distribution
  let seed = 4219;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const legSign = i % 2 === 0 ? 1 : -1;
    let dy: number;
    let offset: number;

    // 24% of particles hug the diagonal edges and flat end caps for a razor-sharp "X"
    if (i < count * 0.2) {
      dy = (rand() * 2 - 1) * X_HALF_HEIGHT;
      const side = rand() < 0.5 ? -1 : 1;
      offset = side * (X_STROKE_HALF_WIDTH - rand() * 2.2);
    } else if (i < count * 0.24) {
      const capSide = rand() < 0.5 ? -1 : 1;
      dy = capSide * (X_HALF_HEIGHT - rand() * 2.2);
      offset = (rand() * 2 - 1) * X_STROKE_HALF_WIDTH;
    } else {
      dy = (rand() * 2 - 1) * X_HALF_HEIGHT;
      offset = (rand() * 2 - 1) * X_STROKE_HALF_WIDTH;
    }

    const homeX = CENTER + legSign * X_SLOPE * dy + offset;
    const homeY = CENTER + dy;

    const colorRoll = rand();
    const colorIndex: 0 | 1 | 2 =
      colorRoll < 0.54 ? 0 : colorRoll < 0.82 ? 1 : 2;
    const baseColor = PARTICLE_PALETTE[colorIndex];

    // Crisp fine micro-particles (0.55px - 1.25px) for high-density texture
    const radius = 0.55 + rand() * 0.7;
    const baseAlpha = 0.52 + rand() * 0.44;

    particles.push({
      homeX,
      homeY,
      x: homeX,
      y: homeY,
      vx: 0,
      vy: 0,
      radius,
      colorIndex,
      baseR: baseColor[0],
      baseG: baseColor[1],
      baseB: baseColor[2],
      baseAlpha,
      phase: rand() * Math.PI * 2,
      driftSpeed: 0.12 + rand() * 0.18,
      driftAmp: 0.75 + rand() * 1.15,
      heat: 0,
    });
  }

  return particles;
}

export function stepParticleField(
  particles: Particle[],
  pointer: PointerState,
  timeSec: number,
  rawDt: number
): void {
  // Clamp dt so tab-switching or frame hitches never explode physics
  const dt = Math.max(0.001, Math.min(rawDt, 0.04));
  const interactSq = INTERACT_RADIUS * INTERACT_RADIUS;
  const drag = Math.exp(-DAMPING * dt);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Gentle living micro-drift around home position
    const driftX = Math.cos(timeSec * p.driftSpeed + p.phase) * p.driftAmp;
    const driftY = Math.sin(timeSec * p.driftSpeed * 0.85 + p.phase) * p.driftAmp;
    const targetX = p.homeX + driftX;
    const targetY = p.homeY + driftY;

    let displaced = false;
    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < interactSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const proximity = 1 - dist / INTERACT_RADIUS;
        const nx = dx / dist;
        const ny = dy / dist;

        // Smooth radial parting + subtle tangential swirl
        const radialAccel = proximity * proximity * REPEL_STRENGTH;
        const swirlAccel = proximity * SWIRL_STRENGTH;

        p.vx += (nx * radialAccel - ny * swirlAccel) * dt;
        p.vy += (ny * radialAccel + nx * swirlAccel) * dt;

        // Subtle fluid wake carried from pointer motion
        p.vx += pointer.vx * proximity * WAKE_COUPLING * dt;
        p.vy += pointer.vy * proximity * WAKE_COUPLING * dt;

        p.heat = Math.min(1, p.heat + proximity * dt * 3.5);
        displaced = true;
      }
    }

    // Soft, unhurried spring return back to home coordinate
    p.vx += (targetX - p.x) * STIFFNESS * dt;
    p.vy += (targetY - p.y) * STIFFNESS * dt;

    // Frame-rate-independent fluid damping
    p.vx *= drag;
    p.vy *= drag;

    // Soft speed ceiling so fast cursor sweeps feel silky, never twitchy
    const speedSq = p.vx * p.vx + p.vy * p.vy;
    if (speedSq > MAX_SPEED * MAX_SPEED) {
      const scale = MAX_SPEED / Math.sqrt(speedSq);
      p.vx *= scale;
      p.vy *= scale;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Smoothly relax energized glow back to resting opacity
    if (!displaced && p.heat > 0) {
      const homeDist = Math.hypot(p.x - targetX, p.y - targetY);
      const targetHeat = Math.min(1, homeDist / 45);
      p.heat += (targetHeat - p.heat) * Math.min(1, dt * 3.2);
      if (p.heat < 0.01) p.heat = 0;
    }
  }
}

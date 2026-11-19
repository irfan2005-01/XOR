import test from "node:test";
import assert from "node:assert/strict";
import {
  CENTER,
  INTERACT_RADIUS,
  MAX_SPEED,
  PARTICLE_COUNT,
  PARTICLE_PALETTE,
  X_HALF_HEIGHT,
  X_SLOPE,
  createParticles,
  isPointInGeometricX,
  stepParticleField,
  type PointerState,
} from "./particle-physics";

test("createParticles generates ~2600 brand-colored micro-particles forming a sharp geometric X", () => {
  assert.equal(PARTICLE_COUNT, 2600);
  const particles = createParticles();
  assert.equal(particles.length, PARTICLE_COUNT);

  const colorCounts = [0, 0, 0];
  let q1Count = 0; // top-left arm
  let q2Count = 0; // top-right arm
  let q3Count = 0; // bottom-left arm
  let q4Count = 0; // bottom-right arm

  for (const p of particles) {
    assert.ok(
      isPointInGeometricX(p.homeX, p.homeY),
      `particle (${p.homeX.toFixed(1)}, ${p.homeY.toFixed(1)}) outside geometric X bounds`
    );
    assert.ok(p.radius >= 0.5 && p.radius <= 1.35, `particle radius ${p.radius} should be micro`);
    assert.ok(p.driftSpeed <= 0.45, `ambient driftSpeed ${p.driftSpeed} should be calm`);

    const paletteColor = PARTICLE_PALETTE[p.colorIndex];
    assert.equal(p.baseR, paletteColor[0]);
    assert.equal(p.baseG, paletteColor[1]);
    assert.equal(p.baseB, paletteColor[2]);
    colorCounts[p.colorIndex] += 1;

    if (p.homeX < CENTER - 30 && p.homeY < CENTER - 30) q1Count += 1;
    if (p.homeX > CENTER + 30 && p.homeY < CENTER - 30) q2Count += 1;
    if (p.homeX < CENTER - 30 && p.homeY > CENTER + 30) q3Count += 1;
    if (p.homeX > CENTER + 30 && p.homeY > CENTER + 30) q4Count += 1;
  }

  // All three brand colors (#EFE7E4, #B59289, #BC806A) are represented
  assert.ok(colorCounts[0] > 300, "expected Ivory Sand (#EFE7E4) particles");
  assert.ok(colorCounts[1] > 150, "expected Sand (#B59289) particles");
  assert.ok(colorCounts[2] > 100, "expected Brick Rose (#BC806A) particles");

  // All four arms of the X are well populated, while open side wedges remain empty
  assert.ok(q1Count > 80 && q2Count > 80 && q3Count > 80 && q4Count > 80);
  assert.equal(isPointInGeometricX(CENTER + X_SLOPE * X_HALF_HEIGHT + 50, CENTER), false);
  assert.equal(isPointInGeometricX(CENTER, CENTER - X_HALF_HEIGHT + 10), false);
});

test("hovering physics smoothly repels and swirls X particles within generous radius", () => {
  const particles = createParticles(240);
  const target = particles.reduce(
    (best, curr) => (curr.homeX > best.homeX ? curr : best),
    particles[0]
  );

  const pointer: PointerState = {
    x: target.homeX - 20,
    y: target.homeY,
    vx: 120,
    vy: 0,
    active: true,
  };

  for (let i = 0; i < 24; i++) {
    stepParticleField(particles, pointer, i / 60, 1 / 60);
  }

  const displacement = Math.hypot(target.x - target.homeX, target.y - target.homeY);
  const speed = Math.hypot(target.vx, target.vy);

  assert.ok(displacement > 8, `expected noticeable hover displacement, got ${displacement}`);
  assert.ok(speed <= MAX_SPEED + 0.01, `speed ${speed} exceeded MAX_SPEED`);
  assert.ok(target.heat > 0.1, "hovered particle should gain luminous heat");

  const farParticle = particles.find(
    (p) => Math.hypot(p.homeX - pointer.x, p.homeY - pointer.y) > INTERACT_RADIUS + 20
  );
  if (farParticle) {
    const farDist = Math.hypot(farParticle.x - farParticle.homeX, farParticle.y - farParticle.homeY);
    assert.ok(farDist < 5, `far particle should only gently drift, got ${farDist}`);
  }
});

test("spring return is unhurried and frame-rate independent (60Hz vs 120Hz)", () => {
  const particles60 = createParticles(80);
  const particles120 = createParticles(80);

  const pointer: PointerState = {
    x: CENTER,
    y: CENTER,
    vx: 0,
    vy: 0,
    active: true,
  };

  for (let i = 0; i < 18; i++) {
    stepParticleField(particles60, pointer, i / 60, 1 / 60);
  }
  for (let i = 0; i < 36; i++) {
    stepParticleField(particles120, pointer, i / 120, 1 / 120);
  }

  const idle: PointerState = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
  for (let i = 0; i < 15; i++) {
    stepParticleField(particles60, idle, 0.3 + i / 60, 1 / 60);
  }
  for (let i = 0; i < 30; i++) {
    stepParticleField(particles120, idle, 0.3 + i / 120, 1 / 120);
  }

  const maxDisp60 = Math.max(...particles60.map((p) => Math.hypot(p.x - p.homeX, p.y - p.homeY)));
  const maxDisp120 = Math.max(...particles120.map((p) => Math.hypot(p.x - p.homeX, p.y - p.homeY)));

  assert.ok(maxDisp60 > 4, `expected slow unhurried return after 0.25s, got ${maxDisp60}`);
  assert.ok(
    Math.abs(maxDisp60 - maxDisp120) < 3.5,
    `60Hz (${maxDisp60.toFixed(2)}) and 120Hz (${maxDisp120.toFixed(2)}) should match closely`
  );
});

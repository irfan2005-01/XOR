import test from "node:test";
import assert from "node:assert/strict";
import {
  AMBIENT_STAR_COUNT,
  COSMIC_PALETTE_RGB,
  DESKTOP_PARTICLE_COUNT,
  MOBILE_PARTICLE_COUNT,
  createAmbientStars,
  createSpaceParticles,
  getParticleBudget,
  getSceneAnchorConfig,
  projectPoint3D,
  stepMorphParticles,
} from "./particle-physics";

test("cosmic particle palette matches 65% white, 20% light orange, 15% electric sky blue", () => {
  assert.deepEqual(COSMIC_PALETTE_RGB[0], [255, 255, 255]);
  assert.deepEqual(COSMIC_PALETTE_RGB[1], [251, 146, 60]);
  assert.deepEqual(COSMIC_PALETTE_RGB[2], [56, 189, 248]);
  assert.equal(getParticleBudget(1440), DESKTOP_PARTICLE_COUNT);
  assert.equal(getParticleBudget(390), MOBILE_PARTICLE_COUNT);
  assert.equal(AMBIENT_STAR_COUNT, 280);

  const particles = createSpaceParticles(2000);
  const counts = [0, 0, 0];
  for (const p of particles) counts[p.colorIdx]++;
  const whiteRatio = counts[0] / particles.length;
  const orangeRatio = counts[1] / particles.length;
  const skyRatio = counts[2] / particles.length;

  assert.ok(Math.abs(whiteRatio - 0.65) < 0.04, `white ratio=${whiteRatio}`);
  assert.ok(Math.abs(orangeRatio - 0.2) < 0.04, `orange ratio=${orangeRatio}`);
  assert.ok(Math.abs(skyRatio - 0.15) < 0.04, `sky ratio=${skyRatio}`);
});

test("createSpaceParticles builds 5 finite 3D silhouettes (Rocket, Satellite, Globe, Gyroscope, Astronaut)", () => {
  const particles = createSpaceParticles(200);
  assert.equal(particles.length, 200);

  for (const p of particles) {
    assert.equal(p.targets.length, 5);
    for (const target of p.targets) {
      assert.equal(Number.isFinite(target.x), true);
      assert.equal(Number.isFinite(target.y), true);
      assert.equal(Number.isFinite(target.z), true);
    }
  }
});

test("createAmbientStars builds 280 background stars across normalized viewport", () => {
  const stars = createAmbientStars();
  assert.equal(stars.length, AMBIENT_STAR_COUNT);
  for (const star of stars) {
    assert.ok(star.nx >= 0 && star.nx <= 1);
    assert.ok(star.ny >= 0 && star.ny <= 1);
    assert.ok(star.alpha > 0 && star.alpha <= 1);
  }
});

test("getSceneAnchorConfig maps all 5 discrete scenes cleanly", () => {
  assert.equal(getSceneAnchorConfig(0, false).stage, "rocket");
  assert.equal(getSceneAnchorConfig(1, false).stage, "satellite");
  assert.equal(getSceneAnchorConfig(2, false).stage, "globe");
  assert.equal(getSceneAnchorConfig(3, false).stage, "gyroscope");
  assert.equal(getSceneAnchorConfig(4, false).stage, "astronaut");
});

test("stepMorphParticles smoothly disperses mid-transition and settles onto target formation within ~900ms", () => {
  const particles = createSpaceParticles(80);
  const initialDist = particles.reduce(
    (sum, p) =>
      sum +
      Math.hypot(
        p.x - p.targets[4].x,
        p.y - p.targets[4].y,
        p.z - p.targets[4].z
      ),
    0
  );

  // Simulate 54 frames (~900ms at 60fps) morphing from Rocket (0) to Astronaut (4)
  for (let frame = 0; frame < 54; frame++) {
    const progress = Math.min(1, frame / 54);
    stepMorphParticles(particles, 4, progress, frame / 60, 1 / 60, false);
  }
  // Extra 30 frames of post-scatter glide
  for (let frame = 54; frame < 84; frame++) {
    stepMorphParticles(particles, 4, 1, frame / 60, 1 / 60, false);
  }

  const settledDist = particles.reduce(
    (sum, p) =>
      sum +
      Math.hypot(
        p.x - p.targets[4].x,
        p.y - p.targets[4].y,
        p.z - p.targets[4].z
      ),
    0
  );

  assert.ok(
    settledDist < initialDist * 0.15,
    `expected balanced smooth reassembly onto Astronaut (${settledDist} vs ${initialDist})`
  );
});

test("projectPoint3D scales closer Z points larger than farther Z points", () => {
  const near = projectPoint3D(60, 0, -140, 0, 0, 720, 450, 1);
  const far = projectPoint3D(60, 0, 140, 0, 0, 720, 450, 1);
  assert.ok(near.perspective > far.perspective);
  assert.ok(near.depthNorm > far.depthNorm);
});

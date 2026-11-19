import test from "node:test";
import assert from "node:assert/strict";
import {
  PARTICLE_MORPH_DURATION_MS,
  PARTICLE_MORPH_LERP_60FPS,
  SCENE_COUNT,
  SCENE_LOCK_MS,
  SCENE_META,
  canAcceptSceneTransition,
  clampSceneIndex,
  getMorphLerpFactor,
  getMorphScatterImpulse,
  getMorphTransitionProgress,
  resolveKeyboardStep,
  resolveTouchSwipeStep,
  resolveWheelStep,
  stepSceneIndex,
} from "./stage-controller";

test("discrete stage controller defines 5 scenes and balanced morph parameters", () => {
  assert.equal(SCENE_COUNT, 5);
  assert.ok(SCENE_LOCK_MS >= 600 && SCENE_LOCK_MS <= 750);
  assert.ok(
    PARTICLE_MORPH_DURATION_MS >= 850 && PARTICLE_MORPH_DURATION_MS <= 950
  );
  assert.equal(PARTICLE_MORPH_LERP_60FPS, 0.055);
  assert.deepEqual(
    SCENE_META.map((s) => s.stage),
    ["rocket", "satellite", "globe", "gyroscope", "astronaut"]
  );
});

test("stepSceneIndex and clampSceneIndex lock cleanly within [0, 4]", () => {
  assert.equal(clampSceneIndex(-3), 0);
  assert.equal(clampSceneIndex(9), 4);
  assert.equal(stepSceneIndex(0, -1), 0);
  assert.equal(stepSceneIndex(0, 1), 1);
  assert.equal(stepSceneIndex(3, 1), 4);
  assert.equal(stepSceneIndex(4, 1), 4);
  assert.equal(stepSceneIndex(2, -1), 1);
  assert.equal(stepSceneIndex(2, 0), 2);
});

test("canAcceptSceneTransition enforces transition lock window", () => {
  assert.equal(canAcceptSceneTransition(1000, 500, 680), false);
  assert.equal(canAcceptSceneTransition(1180, 500, 680), true);
  assert.equal(canAcceptSceneTransition(1500, 500, 680), true);
});

test("resolveWheelStep and resolveTouchSwipeStep filter jitter and map directions cleanly", () => {
  assert.equal(resolveWheelStep(10), 0);
  assert.equal(resolveWheelStep(-12), 0);
  assert.equal(resolveWheelStep(45), 1);
  assert.equal(resolveWheelStep(-45), -1);

  assert.equal(resolveTouchSwipeStep(400, 380), 0);
  assert.equal(resolveTouchSwipeStep(400, 320), 1); // swipe up -> next scene
  assert.equal(resolveTouchSwipeStep(320, 400), -1); // swipe down -> prev scene
});

test("resolveKeyboardStep supports Up/Down/Page/Space/Home/End navigation", () => {
  assert.deepEqual(resolveKeyboardStep("ArrowDown"), { type: "delta", delta: 1 });
  assert.deepEqual(resolveKeyboardStep("PageDown"), { type: "delta", delta: 1 });
  assert.deepEqual(resolveKeyboardStep(" "), { type: "delta", delta: 1 });
  assert.deepEqual(resolveKeyboardStep("ArrowUp"), { type: "delta", delta: -1 });
  assert.deepEqual(resolveKeyboardStep("PageUp"), { type: "delta", delta: -1 });
  assert.deepEqual(resolveKeyboardStep("Home"), { type: "index", index: 0 });
  assert.deepEqual(resolveKeyboardStep("End"), { type: "index", index: 4 });
  assert.equal(resolveKeyboardStep("a"), null);
});

test("morph transition curve uses sin(progress * PI) scatter impulse and 0.055 60fps lerp", () => {
  assert.equal(getMorphTransitionProgress(0), 0);
  assert.equal(getMorphTransitionProgress(450, 900), 0.5);
  assert.equal(getMorphTransitionProgress(1200, 900), 1);

  assert.ok(Math.abs(getMorphScatterImpulse(0)) < 1e-6);
  assert.ok(Math.abs(getMorphScatterImpulse(0.5) - 1) < 1e-6);
  assert.ok(Math.abs(getMorphScatterImpulse(1)) < 1e-6);

  assert.ok(
    Math.abs(getMorphLerpFactor(1 / 60) - PARTICLE_MORPH_LERP_60FPS) < 1e-6
  );
  assert.ok(getMorphLerpFactor(1 / 30) > PARTICLE_MORPH_LERP_60FPS);
  assert.ok(getMorphLerpFactor(1 / 120) < PARTICLE_MORPH_LERP_60FPS);
});

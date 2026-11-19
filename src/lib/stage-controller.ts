export const SCENE_COUNT = 5;
export const SCENE_LOCK_MS = 680;
export const PARTICLE_MORPH_DURATION_MS = 900;
export const PARTICLE_MORPH_LERP_60FPS = 0.055;
export const WHEEL_DELTA_THRESHOLD = 28;
export const TOUCH_SWIPE_THRESHOLD = 42;

export const SCENE_META = [
  { index: 0, id: "hero", stage: "rocket", label: "Hero" },
  { index: 1, id: "mission", stage: "satellite", label: "Mission" },
  { index: 2, id: "pillars", stage: "globe", label: "Area of Focus" },
  { index: 3, id: "workflow", stage: "gyroscope", label: "How XOR Works" },
  { index: 4, id: "announce", stage: "astronaut", label: "Upcoming Drop" },
] as const;

export type SceneStageName = (typeof SCENE_META)[number]["stage"];

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function clampSceneIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(SCENE_COUNT - 1, Math.round(index)));
}

/**
 * Advances or rewinds the discrete scene index by +1 / -1 while clamping to [0, SCENE_COUNT - 1].
 */
export function stepSceneIndex(current: number, delta: number): number {
  if (!Number.isFinite(delta) || delta === 0) {
    return clampSceneIndex(current);
  }
  const direction = delta > 0 ? 1 : -1;
  return clampSceneIndex(clampSceneIndex(current) + direction);
}

/**
 * Enforces the discrete step transition lock window so momentum scroll/trackpad
 * flicks advance exactly one scene per gesture.
 */
export function canAcceptSceneTransition(
  nowMs: number,
  lastTransitionMs: number,
  lockMs = SCENE_LOCK_MS
): boolean {
  if (!Number.isFinite(nowMs) || !Number.isFinite(lastTransitionMs)) {
    return true;
  }
  return nowMs - lastTransitionMs >= lockMs;
}

/**
 * Maps a wheel deltaY to a discrete scene step (-1, 0, or +1).
 */
export function resolveWheelStep(
  deltaY: number,
  threshold = WHEEL_DELTA_THRESHOLD
): -1 | 0 | 1 {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < threshold) {
    return 0;
  }
  return deltaY > 0 ? 1 : -1;
}

/**
 * Maps a vertical touch swipe (startY -> endY) to a discrete scene step (-1, 0, or +1).
 * Swiping upward (startY - endY > threshold) advances to the next scene (+1).
 */
export function resolveTouchSwipeStep(
  startY: number,
  endY: number,
  threshold = TOUCH_SWIPE_THRESHOLD
): -1 | 0 | 1 {
  const dy = startY - endY;
  if (!Number.isFinite(dy) || Math.abs(dy) < threshold) {
    return 0;
  }
  return dy > 0 ? 1 : -1;
}

export type KeyboardSceneAction =
  | { type: "delta"; delta: -1 | 1 }
  | { type: "index"; index: number }
  | null;

/**
 * Maps keyboard navigation keys to discrete scene steps.
 */
export function resolveKeyboardStep(key: string): KeyboardSceneAction {
  switch (key) {
    case "ArrowDown":
    case "PageDown":
    case " ":
      return { type: "delta", delta: 1 };
    case "ArrowUp":
    case "PageUp":
      return { type: "delta", delta: -1 };
    case "Home":
      return { type: "index", index: 0 };
    case "End":
      return { type: "index", index: SCENE_COUNT - 1 };
    default:
      return null;
  }
}

/**
 * Normalized morph progress [0, 1] over the balanced ~900ms particle transition window.
 */
export function getMorphTransitionProgress(
  elapsedMs: number,
  durationMs = PARTICLE_MORPH_DURATION_MS
): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 1;
  return clamp01(elapsedMs / durationMs);
}

/**
 * Gentle bell-curve mid-transition radial scatter impulse: sin(progress * Math.PI).
 * Peaks cleanly at 0.5 and settles to 0 at 0.0 and 1.0.
 */
export function getMorphScatterImpulse(progress: number): number {
  const p = clamp01(progress);
  return Math.sin(p * Math.PI);
}

/**
 * Frame-rate-independent per-frame lerp factor anchored to ~0.055 at 60fps
 * (~850-950ms smooth settling time without snapping abruptly or dragging).
 */
export function getMorphLerpFactor(
  dtSec: number,
  baseLerp60Fps = PARTICLE_MORPH_LERP_60FPS
): number {
  const safeDt = Number.isFinite(dtSec) && dtSec > 0 ? dtSec : 1 / 60;
  const frameScale = Math.min(3.5, Math.max(0.45, safeDt * 60));
  return 1 - Math.pow(1 - baseLerp60Fps, frameScale);
}

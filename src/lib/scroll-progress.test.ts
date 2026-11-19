import test from "node:test";
import assert from "node:assert/strict";
import { calculateScrollDepth } from "./scroll-progress";

test("calculateScrollDepth returns 0 at top of page or non-scrollable page", () => {
  assert.equal(calculateScrollDepth(0, 3000, 900), 0);
  assert.equal(calculateScrollDepth(0, 900, 900), 0);
  assert.equal(calculateScrollDepth(-20, 3000, 900), 0);
});

test("calculateScrollDepth returns proportional depth and clamps to 1 at bottom", () => {
  assert.equal(calculateScrollDepth(1050, 3000, 900), 0.5);
  assert.equal(calculateScrollDepth(2100, 3000, 900), 1);
  assert.equal(calculateScrollDepth(2500, 3000, 900), 1);
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computePassBarcodeBars,
  formatIssueDate,
  generateUniqueMemberId,
} from "./member-id";

describe("member-id helpers", () => {
  it("generates a formatted XOR-26-XXXX member ID", () => {
    const id = generateUniqueMemberId([]);
    assert.match(id, /^XOR-26-\d{4}$/);
  });

  it("avoids collisions with existing IDs", () => {
    let calls = 0;
    const deterministicRandom = () => {
      calls += 1;
      // First 2 calls produce 1000, third produces 1001
      return calls <= 2 ? 0 : 1 / 9000;
    };

    const id = generateUniqueMemberId(["XOR-26-1000"], deterministicRandom);
    assert.equal(id, "XOR-26-1001");
  });

  it("formats ISO timestamps into pass date strings", () => {
    assert.equal(formatIssueDate("2026-11-18T10:15:00.000Z"), "18 NOV 2026");
    assert.equal(formatIssueDate("2026-01-05T00:00:00.000Z"), "05 JAN 2026");
  });

  it("produces deterministic barcode width patterns", () => {
    const a = computePassBarcodeBars("XOR-26-4821");
    const b = computePassBarcodeBars("xor-26-4821");
    const c = computePassBarcodeBars("XOR-26-9999");

    assert.deepEqual(a, b);
    assert.notDeepEqual(a, c);
    assert.ok(a.length > 10);
    assert.ok(a.every((w) => w >= 1 && w <= 3));
  });
});

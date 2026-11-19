import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countUnreadBroadcasts } from "./broadcast-unread";

describe("countUnreadBroadcasts", () => {
  it("returns 0 when there are no broadcasts", () => {
    assert.equal(countUnreadBroadcasts([], null), 0);
    assert.equal(countUnreadBroadcasts([], "2026-11-18T10:00:00.000Z"), 0);
  });

  it("counts all broadcasts when xor_last_seen_broadcast has not been set", () => {
    const timestamps = [
      "2026-11-18T08:00:00.000Z",
      "2026-11-18T09:30:00.000Z",
    ];
    assert.equal(countUnreadBroadcasts(timestamps, null), 2);
  });

  it("counts only broadcasts strictly newer than lastSeenIso", () => {
    const timestamps = [
      "2026-11-18T08:00:00.000Z",
      "2026-11-18T09:30:00.000Z",
      "2026-11-18T10:15:00.000Z",
    ];
    assert.equal(
      countUnreadBroadcasts(timestamps, "2026-11-18T09:30:00.000Z"),
      1
    );
    assert.equal(
      countUnreadBroadcasts(timestamps, "2026-11-18T10:15:00.000Z"),
      0
    );
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getMemberInitials, isAllowedAvatarFile } from "./avatar-upload";
import { buildQrMatrix } from "./qr-matrix";

describe("avatar-upload & qr-matrix helpers", () => {
  it("validates allowed image MIME types and extensions", () => {
    assert.equal(isAllowedAvatarFile({ type: "image/jpeg", name: "me.jpg" }), true);
    assert.equal(isAllowedAvatarFile({ type: "image/png", name: "me.png" }), true);
    assert.equal(isAllowedAvatarFile({ type: "image/webp", name: "me.webp" }), true);
    assert.equal(isAllowedAvatarFile({ type: "", name: "photo.JPG" }), true);
    assert.equal(isAllowedAvatarFile({ type: "image/gif", name: "anim.gif" }), false);
    assert.equal(isAllowedAvatarFile({ type: "application/pdf", name: "doc.pdf" }), false);
  });

  it("extracts monogram initials for legacy accounts without photos", () => {
    assert.equal(getMemberInitials("Zainab Fatima"), "ZF");
    assert.equal(getMemberInitials("Ayaan"), "AY");
    assert.equal(getMemberInitials("  "), "XR");
  });

  it("builds a square scannable QR matrix for XOR-26-XXXX IDs", () => {
    const matrix = buildQrMatrix("XOR-26-4821");
    assert.ok(matrix.size >= 21);
    // Top-left 7x7 finder pattern corner must be dark at (0,0) and light at (1,1)
    assert.equal(matrix.isDark(0, 0), true);
    assert.equal(matrix.isDark(1, 1), false);
    assert.equal(matrix.isDark(6, 6), true);
  });
});

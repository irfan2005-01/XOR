import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  APPWRITE_ENDPOINT,
  DEFAULT_APPWRITE_ENDPOINT,
  normalizeAppwriteEndpoint,
} from "./appwrite";

describe("normalizeAppwriteEndpoint", () => {
  it("preserves a plain Appwrite endpoint URL", () => {
    assert.equal(
      normalizeAppwriteEndpoint("https://sgp.cloud.appwrite.io/v1"),
      "https://sgp.cloud.appwrite.io/v1"
    );
  });

  it("strips Markdown [url](url) link syntax and surrounding quotes", () => {
    assert.equal(
      normalizeAppwriteEndpoint(
        "[https://sgp.cloud.appwrite.io/v1](https://sgp.cloud.appwrite.io/v1)"
      ),
      "https://sgp.cloud.appwrite.io/v1"
    );
    assert.equal(
      normalizeAppwriteEndpoint(
        '"[Appwrite](https://sgp.cloud.appwrite.io/v1)"'
      ),
      "https://sgp.cloud.appwrite.io/v1"
    );
    assert.equal(
      normalizeAppwriteEndpoint("<https://sgp.cloud.appwrite.io/v1>"),
      "https://sgp.cloud.appwrite.io/v1"
    );
  });

  it("falls back to default endpoint when empty or invalid", () => {
    assert.equal(normalizeAppwriteEndpoint(""), DEFAULT_APPWRITE_ENDPOINT);
    assert.equal(normalizeAppwriteEndpoint(undefined), DEFAULT_APPWRITE_ENDPOINT);
    assert.equal(normalizeAppwriteEndpoint("not-a-valid-url"), DEFAULT_APPWRITE_ENDPOINT);
  });

  it("initializes APPWRITE_ENDPOINT as a valid plain URL", () => {
    assert.equal(APPWRITE_ENDPOINT, "https://sgp.cloud.appwrite.io/v1");
    assert.doesNotThrow(() => new URL(APPWRITE_ENDPOINT));
  });
});

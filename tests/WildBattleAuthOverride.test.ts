import { afterEach, describe, expect, test } from "vitest";
import {
  battlePersistentIdOverride,
  getPersistentID,
  getPlayToken,
} from "../src/client/Auth";

function setHash(hash: string): void {
  window.location.hash = hash;
}

const UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("battlePersistentIdOverride — embedded Hexah battle pid", () => {
  afterEach(() => {
    setHash("");
  });

  test("returns the pid from #hexPid when it is a valid uuid", () => {
    setHash(`#hexPid=${UUID}`);
    expect(battlePersistentIdOverride()).toBe(UUID);
  });

  test("returns the pid when combined with other hash params", () => {
    setHash(`#foo=1&hexPid=${UUID}&bar=2`);
    expect(battlePersistentIdOverride()).toBe(UUID);
  });

  test("returns null when no hexPid is present", () => {
    setHash("#modal=settings");
    expect(battlePersistentIdOverride()).toBeNull();
    setHash("");
    expect(battlePersistentIdOverride()).toBeNull();
  });

  test("returns null for a malformed (non-uuid) pid", () => {
    setHash("#hexPid=not-a-uuid");
    expect(battlePersistentIdOverride()).toBeNull();
    setHash("#hexPid=12345");
    expect(battlePersistentIdOverride()).toBeNull();
  });

  test("getPersistentID returns the override without touching auth", () => {
    setHash(`#hexPid=${UUID}`);
    expect(getPersistentID()).toBe(UUID);
  });

  test("getPlayToken resolves to the override (no external auth needed)", async () => {
    setHash(`#hexPid=${UUID}`);
    await expect(getPlayToken()).resolves.toBe(UUID);
  });
});

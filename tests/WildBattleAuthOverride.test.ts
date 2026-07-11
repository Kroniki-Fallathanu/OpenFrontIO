import { afterEach, describe, expect, test } from "vitest";
import {
  battlePersistentIdOverride,
  battlePlayerNameOverride,
  getPersistentID,
  getPlayToken,
  sanitizeBattlePlayerName,
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

describe("battlePlayerNameOverride — embedded Hexah character name", () => {
  afterEach(() => {
    setHash("");
  });

  test("returns the name from #hexName, also next to hexPid", () => {
    setHash(`#hexPid=${UUID}&hexName=Thoran`);
    expect(battlePlayerNameOverride()).toBe("Thoran");
  });

  test("decodes url-encoded names", () => {
    setHash("#hexName=Stary%20Wilk");
    expect(battlePlayerNameOverride()).toBe("Stary Wilk");
  });

  test("returns null when no hexName is present", () => {
    setHash(`#hexPid=${UUID}`);
    expect(battlePlayerNameOverride()).toBeNull();
  });

  test("transliterates Polish diacritics instead of rejecting the name", () => {
    expect(sanitizeBattlePlayerName("Radogost Żmij")).toBe("Radogost Zmij");
    expect(sanitizeBattlePlayerName("Łucja")).toBe("Lucja");
  });

  test("strips disallowed characters and collapses whitespace", () => {
    expect(sanitizeBattlePlayerName("  Tho<ran>!  z Gór  ")).toBe(
      "Thoran z Gor",
    );
  });

  test("clamps names longer than the username limit", () => {
    expect(sanitizeBattlePlayerName("A".repeat(40))).toBe("A".repeat(27));
  });

  test("returns null when nothing valid remains", () => {
    expect(sanitizeBattlePlayerName("!!")).toBeNull();
    expect(sanitizeBattlePlayerName("ab")).toBeNull();
  });
});

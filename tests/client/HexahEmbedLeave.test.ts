/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientEnv } from "../../src/client/ClientEnv";
import { isHexahEmbedded, leaveGame } from "../../src/client/HexahEmbed";

// Leaving an embedded Hexah battle. The exit button used to navigate the
// iframe to this game's own home page, which dropped the player into the
// OpenFront lobby list while the host RPG still held the screen. Embedded,
// the exit asks the host to take over instead; standalone it still goes to
// the menu.

function embed(): void {
  document.documentElement.classList.add("hexah-embedded");
}

// homeHref() reads the deployment's site host, so the standalone case needs
// the bootstrap config every page carries.
function setBootstrapConfig(): void {
  (window as never as { BOOTSTRAP_CONFIG: unknown }).BOOTSTRAP_CONFIG = {
    gameEnv: "prod",
    numWorkers: 1,
    turnstileSiteKey: "x",
    jwtAudience: "openfront.io",
    instanceId: "d",
    gitCommit: "t",
  };
  ClientEnv.reset();
}

afterEach(() => {
  document.documentElement.classList.remove("hexah-embedded");
  delete (window as never as { BOOTSTRAP_CONFIG?: unknown }).BOOTSTRAP_CONFIG;
  ClientEnv.reset();
  vi.restoreAllMocks();
});

describe("leaving an embedded battle", () => {
  it("is not embedded without the stamp on <html>", () => {
    expect(isHexahEmbedded()).toBe(false);
  });

  it("asks the host to close the battle instead of navigating", () => {
    embed();
    const parent = { postMessage: vi.fn() };
    // jsdom has window.parent === window; an embed has a different one.
    vi.spyOn(window, "parent", "get").mockReturnValue(parent as never);

    leaveGame();

    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: "hexah:leave-battle" },
      "*",
    );
    expect(window.location.href).not.toContain("openfront");
  });

  it("goes to the menu when the page is not embedded", () => {
    setBootstrapConfig();
    const parent = { postMessage: vi.fn() };
    vi.spyOn(window, "parent", "get").mockReturnValue(parent as never);
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      get href() {
        return "";
      },
      set href(value: string) {
        assign(value);
      },
      host: "openfront.io",
    } as never);

    leaveGame();

    expect(parent.postMessage).not.toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith("/");
  });
});

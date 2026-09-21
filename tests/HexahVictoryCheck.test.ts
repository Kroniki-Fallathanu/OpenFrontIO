import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HexahVictoryCheck } from "../src/client/HexahVictoryCheck";
import { SendWinnerEvent } from "../src/client/Transport";
import { EventBus } from "../src/core/EventBus";
import { GameUpdateType } from "../src/core/game/GameUpdates";

/**
 * The host page (Hexah) asks the embedded battle whether it is already won.
 * The bridge answers from the running simulation and never invents a winner:
 * the only result it can publish is one the simulation already declared.
 */

interface FakePlayer {
  tiles: number;
  alive: boolean;
}

function playerView({ tiles, alive }: FakePlayer) {
  return { numTilesOwned: () => tiles, isAlive: () => alive };
}

function fakeGame({
  me = { tiles: 900, alive: true } as FakePlayer | null,
  opponents = [{ tiles: 100, alive: true }] as FakePlayer[],
  landTiles = 1000,
  fallout = 0,
  required = 80,
} = {}) {
  // The same object identity in both accessors: the bridge tells opponents
  // apart from the player by identity, as the real view does.
  const mine = me === null ? null : playerView(me);
  const others = opponents.map(playerView);
  const all = mine === null ? others : [mine, ...others];
  return {
    myPlayer: () => mine,
    players: () => all,
    numLandTiles: () => landTiles,
    numTilesWithFallout: () => fallout,
    elapsedGameSeconds: () => 0,
    config: () => ({ percentageTilesOwnedToWin: () => required }),
  };
}

/** Sends a request as the host page would and returns what came back. */
function ask(check: HexahVictoryCheck): any {
  const replies: any[] = [];
  const source = { postMessage: (data: any) => replies.push(data) };
  window.dispatchEvent(
    new MessageEvent("message", {
      data: { type: "hexah:victory-check" },
      origin: "https://hexah.example",
      source: source as unknown as Window,
    }),
  );
  return replies[0];
}

describe("HexahVictoryCheck", () => {
  let eventBus: EventBus;
  let sent: SendWinnerEvent[];
  let installed: HexahVictoryCheck[];

  /** Installed bridges are disposed even when an assertion throws first. */
  function bridge(game: unknown): HexahVictoryCheck {
    const check = new HexahVictoryCheck(game as any, eventBus);
    check.install();
    installed.push(check);
    return check;
  }

  afterEach(() => {
    installed.forEach((check) => check.dispose());
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    installed = [];
    eventBus = new EventBus();
    sent = [];
    eventBus.on(SendWinnerEvent, (e) => sent.push(e));
    // The bridge only listens inside an iframe.
    vi.spyOn(window, "parent", "get").mockReturnValue({} as Window);
  });

  it("stays silent outside an iframe", () => {
    vi.spyOn(window, "parent", "get").mockReturnValue(window);
    expect(ask(bridge(fakeGame()))).toBeUndefined();
  });

  it("reports how much land the player holds and what victory needs", () => {
    const reply = ask(bridge(fakeGame({ me: { tiles: 644, alive: true } })));
    expect(reply).toMatchObject({
      type: "hexah:victory-check:result",
      met: false,
      finished: false,
      reported: false,
      ownedPercent: 64.4,
      requiredPercent: 80,
      alive: true,
    });
  });

  it("sees victory when the player is over the land threshold", () => {
    expect(ask(bridge(fakeGame({ me: { tiles: 810, alive: true } }))).met).toBe(
      true,
    );
  });

  it("sees victory when no opponent is left alive", () => {
    const check = bridge(
      fakeGame({
        me: { tiles: 300, alive: true },
        opponents: [{ tiles: 0, alive: false }],
      }),
    );
    expect(ask(check).met).toBe(true);
  });

  it("a dead player has not won, whatever the map says", () => {
    const check = bridge(
      fakeGame({
        me: { tiles: 0, alive: false },
        opponents: [{ tiles: 0, alive: false }],
      }),
    );
    expect(ask(check)).toMatchObject({ met: false, alive: false });
  });

  it("publishes a declared winner again so a lost result can reach the host", () => {
    const check = bridge(fakeGame());
    check.rememberWin({
      type: GameUpdateType.Win,
      winner: ["player", "client-A"],
      allPlayersStats: {},
    } as any);

    const reply = ask(check);
    expect(reply).toMatchObject({ finished: true, reported: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].winner).toEqual(["player", "client-A"]);
  });

  it("never publishes a winner the simulation did not declare", () => {
    const check = bridge(
      fakeGame({ me: { tiles: 1000, alive: true }, opponents: [] }),
    );
    expect(ask(check)).toMatchObject({ met: true, reported: false });
    expect(sent).toHaveLength(0);
  });

  it("ignores messages that are not a victory check", () => {
    bridge(fakeGame());
    const replies: any[] = [];
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "something-else" },
        source: {
          postMessage: (d: any) => replies.push(d),
        } as unknown as Window,
      }),
    );
    expect(replies).toHaveLength(0);
  });

  it("stops answering once disposed", () => {
    const check = bridge(fakeGame());
    check.dispose();
    expect(ask(check)).toBeUndefined();
  });
});

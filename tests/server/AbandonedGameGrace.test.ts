import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/core/Schemas", async () => {
  const actual = (await vi.importActual("../../src/core/Schemas")) as any;
  return {
    ...actual,
    GameStartInfoSchema: {
      safeParse: (data: any) => ({ success: true, data: data }),
    },
    ServerPrestartMessageSchema: {
      safeParse: (data: any) => ({ success: true, data: data }),
    },
  };
});

import { GamePhase, GameServer } from "../../src/server/GameServer";
import { ServerEnv } from "../../src/server/ServerEnv";
import { makeGame, startGame } from "../util/GameServerHarness";

/**
 * A game with nobody connected is finished and pruned. The window used to be a
 * hard-coded 20 seconds after the last ping, which is fine for a public lobby
 * nobody joined — but a Hexah wild battle has exactly one human, so a brief
 * connection loss killed a live battle: the player's browser reconnected and
 * the worker answered "Game not found" (close 1002). The window is now
 * configurable so a deployment can give a disconnected player time to return.
 */
describe("abandoned game grace period", () => {
  let mockLogger: any;

  function startedGame(): GameServer {
    const game = makeGame({ id: "grace-game", log: mockLogger });
    game.setStartsAt(Date.now());
    startGame(game);
    return game;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-17T08:00:00Z"));
    mockLogger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("defaults to the vanilla 20 second window", () => {
    vi.stubEnv("ABANDONED_GAME_GRACE_MS", "");
    expect(ServerEnv.abandonedGameGraceMs()).toBe(20_000);

    const game = startedGame();
    vi.setSystemTime(Date.now() + 61_000);

    expect(game.phase()).toBe(GamePhase.Finished);
  });

  it("keeps the game alive while the configured grace period lasts", () => {
    vi.stubEnv("ABANDONED_GAME_GRACE_MS", "300000");
    const game = startedGame();

    vi.setSystemTime(Date.now() + 4 * 60_000);
    expect(game.phase()).toBe(GamePhase.Active);

    vi.setSystemTime(Date.now() + 2 * 60_000);
    expect(game.phase()).toBe(GamePhase.Finished);
  });

  it("falls back to the default for a missing or nonsense value", () => {
    for (const value of ["", "abc", "0", "-5"]) {
      vi.stubEnv("ABANDONED_GAME_GRACE_MS", value);
      expect(ServerEnv.abandonedGameGraceMs()).toBe(20_000);
    }
  });
});

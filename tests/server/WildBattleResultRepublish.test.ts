import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/server/WildBattleWebhook", () => ({
  emitWildBattleResult: vi.fn(),
}));

import { GameType } from "../../src/core/game/Game";
import { GameServer } from "../../src/server/GameServer";
import { emitWildBattleResult } from "../../src/server/WildBattleWebhook";

/**
 * A Hexah battle only learns its outcome from the result webhook. When that
 * send is lost the player sits in front of a finished game, so the embedded
 * client can report the settled winner again and ask for the result to go
 * out once more. Nothing is recomputed: the archived record is resent.
 */

function gameWithSettledWinner(): any {
  const logger: any = {
    child: vi.fn().mockReturnThis(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const game = new GameServer("battle123", logger, Date.now(), {
    gameType: GameType.Private,
  } as any) as any;
  game.winner = {
    type: "winner",
    winner: ["player", "client-A"],
    allPlayersStats: {},
  };
  game.lastGameRecord = { info: { gameID: "battle123" } };
  return game;
}

function client(): any {
  return { clientID: "client-A", ip: "127.0.0.1", reportedWinner: null };
}

describe("republishing a settled wild battle result", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T08:00:00Z"));
    vi.mocked(emitWildBattleResult).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends the archived result again when the winner is reported once more", () => {
    const game = gameWithSettledWinner();

    game.handleWinner(client(), {
      type: "winner",
      winner: ["player", "client-A"],
      allPlayersStats: {},
    });

    expect(emitWildBattleResult).toHaveBeenCalledTimes(1);
    expect(emitWildBattleResult).toHaveBeenCalledWith({
      info: { gameID: "battle123" },
    });
  });

  it("will not be used to hammer the host", () => {
    const game = gameWithSettledWinner();
    const message = {
      type: "winner",
      winner: ["player", "client-A"],
      allPlayersStats: {},
    };

    game.handleWinner(client(), message);
    game.handleWinner(client(), message);
    vi.setSystemTime(Date.now() + 30_000);
    game.handleWinner(client(), message);

    expect(emitWildBattleResult).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + 61_000);
    game.handleWinner(client(), message);
    expect(emitWildBattleResult).toHaveBeenCalledTimes(2);
  });

  it("has nothing to resend before the game is archived", () => {
    const game = gameWithSettledWinner();
    game.lastGameRecord = null;

    game.handleWinner(client(), {
      type: "winner",
      winner: ["player", "client-A"],
      allPlayersStats: {},
    });

    expect(emitWildBattleResult).not.toHaveBeenCalled();
  });

  it("ignores a client the game kicked or desynced", () => {
    const game = gameWithSettledWinner();
    game.outOfSyncClients = new Set(["client-A"]);

    game.handleWinner(client(), {
      type: "winner",
      winner: ["player", "client-A"],
      allPlayersStats: {},
    });

    expect(emitWildBattleResult).not.toHaveBeenCalled();
  });
});

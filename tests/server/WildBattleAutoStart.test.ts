import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameType } from "../../src/core/game/Game";
import { GameServer } from "../../src/server/GameServer";

// Internally created games (Hexah wild battles) have no host lobby UI, so the
// server must start them itself the moment the creator connects — otherwise
// the embedded player is stuck on "Waiting for players" forever.

const CREATOR_PID = "123e4567-e89b-12d3-a456-426614174000";

function mockLogger(): any {
  const logger = {
    child: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  logger.child.mockReturnValue(logger);
  return logger;
}

function mockClient(persistentID: string, clientID: string): any {
  return {
    clientID,
    persistentID,
    claims: null,
    role: null,
    flares: undefined,
    ip: "127.0.0.1",
    username: "Thoran",
    clanTag: null,
    ws: {
      send: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn(),
      readyState: 1,
    },
    cosmetics: undefined,
    publicId: undefined,
    friends: [],
    lastPing: Date.now(),
    hashes: new Map(),
    reportedWinner: null,
  };
}

function newGame(creatorPersistentID?: string): GameServer {
  return new GameServer(
    "testgame1",
    mockLogger(),
    Date.now(),
    { gameType: GameType.Private, startDelay: 0 } as any,
    creatorPersistentID,
  );
}

describe("WildBattleAutoStart — start gry S2S po dołączeniu twórcy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ustawia startsAt gdy twórca dołącza do gry z auto-startem", () => {
    const game = newGame(CREATOR_PID);
    game.enableAutoStartOnCreatorJoin();

    expect(game.joinClient(mockClient(CREATOR_PID, "creator1"))).toBe("joined");
    expect((game as any).startsAt).toBeDefined();
    expect((game as any).startsAt).toBeLessThanOrEqual(Date.now());
  });

  it("nie startuje bez włączonego auto-startu (zwykłe prywatne lobby)", () => {
    const game = newGame(CREATOR_PID);

    expect(game.joinClient(mockClient(CREATOR_PID, "creator1"))).toBe("joined");
    expect((game as any).startsAt).toBeUndefined();
  });

  it("nie startuje gdy dołącza ktoś inny niż twórca", () => {
    const game = newGame(CREATOR_PID);
    game.enableAutoStartOnCreatorJoin();

    expect(
      game.joinClient(
        mockClient("ffffffff-ffff-4fff-8fff-ffffffffffff", "other1"),
      ),
    ).toBe("joined");
    expect((game as any).startsAt).toBeUndefined();
  });

  it("nie nadpisuje już ustawionego startsAt", () => {
    const game = newGame(CREATOR_PID);
    game.enableAutoStartOnCreatorJoin();
    const explicit = Date.now() + 60_000;
    game.setStartsAt(explicit);

    game.joinClient(mockClient(CREATOR_PID, "creator1"));
    expect((game as any).startsAt).toBe(explicit);
  });
});

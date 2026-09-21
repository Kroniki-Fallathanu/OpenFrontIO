import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeClient, makeGame } from "../util/GameServerHarness";

/**
 * A challenge waits for its host. The spawn phase runs from the start of the
 * game, so a challenge that started when its creator joined left everyone
 * invited looking at a map they could no longer spawn on — they had at most
 * the spawn phase to find the lobby and click join.
 *
 * Auto-start therefore belongs to solo battles only, and the host starts a
 * challenge itself once the others are in.
 */

describe("challenge waits for the host", () => {
  const CREATOR = "123e4567-e89b-12d3-a456-426614174000";

  const client = (persistentID: string, clientID: string) =>
    makeClient({ persistentID, clientID });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("a solo battle still starts the moment its creator joins", () => {
    const game = makeGame({
      config: { startDelay: 0 },
      creatorPersistentID: CREATOR,
    });
    game.enableAutoStartOnCreatorJoin();

    expect(game.joinClient(client(CREATOR, "creator1"))).toBe("joined");

    expect(game.startsAtMs()).toBeDefined();
  });

  it("a challenge stays in the lobby when its creator joins", () => {
    // No enableAutoStartOnCreatorJoin: that is what the worker withholds from
    // a challenge created server-to-server.
    const game = makeGame({
      config: { startDelay: 0 },
      creatorPersistentID: CREATOR,
    });

    expect(game.joinClient(client(CREATOR, "creator1"))).toBe("joined");

    expect(game.startsAtMs()).toBeUndefined();
    expect(game.hasStarted()).toBe(false);
  });

  it("the invited players can still join a waiting challenge", () => {
    const game = makeGame({
      config: { startDelay: 0 },
      creatorPersistentID: CREATOR,
    });
    game.joinClient(client(CREATOR, "creator1"));

    expect(
      game.joinClient(client("ffffffff-ffff-4fff-8fff-ffffffffffff", "guest1")),
    ).toBe("joined");
    expect(game.startsAtMs()).toBeUndefined();
  });

  it("the host's start schedules it, and a repeat leaves the schedule alone", () => {
    const game = makeGame({
      config: { startDelay: 0 },
      creatorPersistentID: CREATOR,
    });
    game.joinClient(client(CREATOR, "creator1"));

    game.setStartsAt(1_000);
    expect(game.startsAtMs()).toBe(1_000);
    // The worker route answers a repeat without touching the schedule; the
    // value only ever changes when the route decides to set it.
    expect(game.gameInfo().startsAt).toBe(1_000);
  });
});

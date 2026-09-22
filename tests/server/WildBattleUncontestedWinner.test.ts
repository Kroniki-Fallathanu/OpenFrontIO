import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameType } from "../../src/core/game/Game";
import { PartialGameRecord, Winner } from "../../src/core/Schemas";
import { Client } from "../../src/server/Client";
import {
  cid,
  makeClient,
  makeGame,
  mockWsOf,
  startGame,
} from "../util/GameServerHarness";

/**
 * An embedded Hexah battle learns its outcome only from the archived record,
 * and the fork's own win screen is hidden inside the iframe — so a game that
 * ends winnerless tells the host RPG the battle was interrupted, and the
 * player who took the whole map is credited with nothing.
 *
 * The hole: the winner's own client drops right after voting (the case the
 * player reported — the map was theirs, the timer ran out, the connection
 * died). The re-tally on a shrinking electorate counts only votes from IPs
 * still connected, so their vote stops counting the moment they leave.
 *
 * At the end of the game there is nobody left to overrule, so a vote nobody
 * contradicted decides. Two candidates stay unresolved, and public games
 * keep the majority rule.
 */
describe("uncontested winner vote at the end of a private battle", () => {
  const WINNER = cid("winner");
  const LOSER = cid("loser");
  let archive: ReturnType<
    typeof vi.fn<(r: PartialGameRecord) => Promise<void>>
  >;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
    archive = vi.fn(async () => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function battle(gameType: GameType) {
    const game = makeGame({ config: { gameType }, deps: { archive } });
    const winner = makeClient({ clientID: WINNER, ip: "1.1.1.1" });
    const loser = makeClient({ clientID: LOSER, ip: "2.2.2.2" });
    game.joinClient(winner);
    game.joinClient(loser);
    startGame(game);
    return { game, winner, loser };
  }

  const vote = (client: Client, winner: Winner) =>
    mockWsOf(client).emit({ type: "winner", winner, allPlayersStats: {} });
  const disconnect = (client: Client) => mockWsOf(client).trigger("close");
  const archivedWinners = () =>
    archive.mock.calls.map(([record]) => record.info.winner);

  it("credits the win when the winner votes and then drops", async () => {
    const { game, winner, loser } = battle(GameType.Private);
    await vote(winner, ["player", WINNER]);
    // The winner's own connection dies: the re-tally ignores their vote,
    // because the IP behind it is gone.
    await disconnect(winner);
    expect(archive).not.toHaveBeenCalled();

    await disconnect(loser);
    await game.end();

    expect(archivedWinners()).toEqual([["player", WINNER]]);
  });

  it("leaves a contested vote unresolved", async () => {
    // Both still connected, each backing itself: no majority while the game
    // runs, and two candidates at the end, so nothing is adopted.
    const { game, winner, loser } = battle(GameType.Private);
    await vote(winner, ["player", WINNER]);
    await vote(loser, ["player", LOSER]);
    await game.end();

    expect(archivedWinners()).toEqual([undefined]);
  });

  it("stays winnerless when nobody voted", async () => {
    const { game } = battle(GameType.Private);
    await game.end();

    expect(archivedWinners()).toEqual([undefined]);
  });

  it("holds a public game to the majority rule", async () => {
    const { game, winner } = battle(GameType.Public);
    await vote(winner, ["player", WINNER]);
    await game.end();

    expect(archivedWinners()).toEqual([undefined]);
  });
});

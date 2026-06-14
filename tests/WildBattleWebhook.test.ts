import { createHmac } from "crypto";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { GameRecord } from "../src/core/Schemas";
import { emitWildBattleResult } from "../src/server/WildBattleWebhook";

function fakeRecord(): GameRecord {
  // Only the fields emitWildBattleResult reads need to be present.
  return {
    info: {
      gameID: "battle123",
      winner: ["player", "client-A"],
      num_turns: 42,
      players: [
        { clientID: "client-A", persistentID: "pid-A", username: "Anon" },
        { clientID: "client-B", persistentID: "pid-B", username: "Bot" },
      ],
    },
  } as unknown as GameRecord;
}

describe("emitWildBattleResult", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("no-op gdy brak RESULT_WEBHOOK_* (vanilla)", () => {
    vi.stubEnv("RESULT_WEBHOOK_URL", "");
    vi.stubEnv("RESULT_WEBHOOK_SECRET", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    emitWildBattleResult(fakeRecord());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("POST z podpisem HMAC-SHA256 nad surowym ciałem, gdy env ustawione", async () => {
    const secret = "topsecret";
    vi.stubEnv("RESULT_WEBHOOK_URL", "http://hexah:1337/api/hex-map-wilds/result");
    vi.stubEnv("RESULT_WEBHOOK_SECRET", secret);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(fakeRecord());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("http://hexah:1337/api/hex-map-wilds/result");
    expect(opts.method).toBe("POST");

    const body = opts.body as string;
    const parsed = JSON.parse(body);
    expect(parsed.battleId).toBe("battle123");
    expect(parsed.winner).toEqual(["player", "client-A"]);
    expect(parsed.numTurns).toBe(42);
    expect(parsed.players).toHaveLength(2);

    const expectedSig = createHmac("sha256", secret).update(body).digest("hex");
    expect(opts.headers["X-Wild-Signature"]).toBe(expectedSig);
  });
});

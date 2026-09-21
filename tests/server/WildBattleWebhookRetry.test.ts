import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emitWildBattleResult } from "../../src/server/WildBattleWebhook";

/**
 * The result webhook is the only way a Hexah battle learns its outcome. It
 * used to be sent once, so a receiver that happened to be restarting lost the
 * result for good and the player was left in front of a finished battle.
 */

function record(): any {
  return {
    info: {
      gameID: "battle123",
      winner: ["player", "client-A"],
      num_turns: 42,
      players: [
        { clientID: "client-A", persistentID: "pid-1", username: "Gracz" },
      ],
    },
  };
}

/** Lets the retry timers and the promise chain run to the end. */
async function drain(): Promise<void> {
  for (let i = 0; i < 8; i++) {
    await vi.advanceTimersByTimeAsync(30_000);
  }
}

describe("wild battle result webhook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv(
      "RESULT_WEBHOOK_URL",
      "http://hexah.internal/api/hex-map-wilds/result",
    );
    vi.stubEnv("RESULT_WEBHOOK_SECRET", "sekret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sends once when the receiver takes it", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }) as any);
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(record());
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as any[];
    expect(url).toContain("/api/hex-map-wilds/result");
    expect(init.headers["X-Wild-Signature"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps trying while the receiver is down", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(record());
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("stops once the receiver finally takes it", async () => {
    let call = 0;
    const fetchMock = vi.fn(async () => {
      call++;
      return { ok: call >= 2, status: call >= 2 ? 200 : 503 } as any;
    });
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(record());
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not repeat a payload the receiver rejected", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 401 }) as any);
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(record());
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does nothing without webhook configuration", async () => {
    vi.stubEnv("RESULT_WEBHOOK_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    emitWildBattleResult(record());
    await drain();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

import { createHmac } from "crypto";
import { GameRecord } from "../core/Schemas";
import { logger } from "./Logger";
import { ServerEnv } from "./ServerEnv";

const log = logger.child({ component: "WildBattleWebhook" });

/**
 * Server→server result webhook for the Hexah „Dzikie Ziemie" PvE battles.
 *
 * On game end, POSTs the outcome (battleId = gameID, winner, per-player
 * persistentID) to Strapi, signed with HMAC-SHA256 over the raw body so the
 * receiver can trust it (results are never accepted from the browser). No-op
 * unless RESULT_WEBHOOK_URL and RESULT_WEBHOOK_SECRET are both set, so vanilla
 * deployments are unaffected. Fire-and-forget: never throws into the game loop.
 *
 * A failed send is retried a few times with a growing delay. Without it a
 * receiver that happens to be restarting loses the outcome for good, and the
 * player is left in front of a battle that never ends. The receiver keys on
 * the game id and ignores repeats, so a retry that arrives late is harmless.
 */

const SEND_ATTEMPTS = 4;
const RETRY_DELAY_MS = 5_000;
export function emitWildBattleResult(record: GameRecord): void {
  const url = ServerEnv.resultWebhookUrl();
  const secret = ServerEnv.resultWebhookSecret();
  if (!url || !secret) return;

  const info = record.info;
  const payload = {
    battleId: info.gameID,
    winner: info.winner ?? null,
    numTurns: info.num_turns,
    players: info.players.map((p) => ({
      clientID: p.clientID,
      persistentID: p.persistentID,
      username: p.username,
    })),
  };

  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  void send(url, signature, body, info.gameID);
}

async function send(
  url: string,
  signature: string,
  body: string,
  gameID: string,
): Promise<void> {
  for (let attempt = 1; attempt <= SEND_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Wild-Signature": signature,
        },
        body,
      });
      if (res.ok) {
        return;
      }
      // A rejected payload stays rejected, so only a server-side or rate
      // limit failure is worth sending again.
      log.warn(`Wild result webhook ${gameID} -> ${res.status}`);
      if (res.status < 500 && res.status !== 429) {
        return;
      }
    } catch (e) {
      log.error("Wild result webhook failed", {
        gameID,
        attempt,
        error: e instanceof Error ? e.message : String(e),
      });
    }
    if (attempt < SEND_ATTEMPTS) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS * attempt),
      );
    }
  }
}

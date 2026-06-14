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
 */
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

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Wild-Signature": signature,
    },
    body,
  })
    .then((res) => {
      if (!res.ok) {
        log.warn(`Wild result webhook ${info.gameID} -> ${res.status}`);
      }
    })
    .catch((e) => {
      log.error("Wild result webhook failed", {
        gameID: info.gameID,
        error: e instanceof Error ? e.message : String(e),
      });
    });
}

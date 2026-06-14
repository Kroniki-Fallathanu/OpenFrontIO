# Hexah „Dzikie Ziemie" integration

This fork can host instanced PvE battles for the Hexah RPG. The integration is
**network-only** (S2S API + result webhook + iframe embed) and is **off by
default** — every hook is a no-op until the env vars below are set, so vanilla
deployments are unaffected.

## Flow

1. A player steps onto a „Dzikie ziemie" hex in Hexah. Hexah Strapi calls
   `POST /w{N}/api/create_game/{battleId}` on this server with the
   `X-Internal-Key` header (no player JWT) and `X-Creator-Persistent-Id` (a
   per-battle, single-use id) plus a `GameConfig` body.
2. The Hexah client opens this game in an iframe at
   `https://<domain>/game/{battleId}#hexPid=<persistentID>`. The `#hexPid` hash
   is read by the client and used as the join token, so the embedded player is
   recognized as the game's creator (see `src/client/Auth.ts`).
3. When the game ends, the server POSTs the outcome (HMAC-signed) to
   `RESULT_WEBHOOK_URL`. Hexah verifies the signature and resolves the battle
   (win → rewards, loss → consequences).

## Env vars (this server)

| Var                     | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `INTERNAL_API_KEY`      | Authorizes S2S `create_game` (`X-Internal-Key`). Must match the Hexah value. |
| `RESULT_WEBHOOK_URL`    | Hexah endpoint the game-end result is POSTed to.                             |
| `RESULT_WEBHOOK_SECRET` | HMAC-SHA256 secret signing the result body. Must match the Hexah value.      |

Each is empty by default (feature off). They live in this server's runtime env
(the live counterpart of `example.env`).

### Prerequisites (self-hosted Hexah setup)

- `EXTERNAL_API_DISABLED=true` — no `openfront-api` service.
- `GAME_ENV=dev` — lets the server accept a raw persistentID as the join token
  (the embedded player presents the per-battle id rather than a JWT).
- `NUM_WORKERS` — must equal `OPENFRONT_NUM_WORKERS` on the Hexah side, so the
  worker-routing hash (`simpleHash(battleId) % workers`) agrees on both ends.

## Matching values across the two systems

- `INTERNAL_API_KEY` — this server (verifies) ↔ Hexah Strapi (sends).
- `RESULT_WEBHOOK_SECRET` — this server (signs) ↔ Hexah Strapi (verifies).
- `NUM_WORKERS` (here) = `OPENFRONT_NUM_WORKERS` (Hexah).

## Code touchpoints

- `src/server/ServerEnv.ts` — `internalApiKey()`, `resultWebhookUrl()`,
  `resultWebhookSecret()`.
- `src/server/Worker.ts` — `create_game` internal-key bypass.
- `src/server/WildBattleWebhook.ts` — result emitter (HMAC).
- `src/client/Auth.ts` — `battlePersistentIdOverride()` (the `#hexPid` join id).

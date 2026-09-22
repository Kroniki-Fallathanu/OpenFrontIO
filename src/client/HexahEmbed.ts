import { homeHref } from "./Utils";

/**
 * Embedded Hexah „Dzikie Ziemie" battles: this game runs inside an iframe on
 * the host RPG's page, which draws its own chrome around it and owns the
 * battle lifecycle.
 *
 * Leaving is the part that cannot be decided here. Navigating the iframe to
 * the OpenFront home page leaves the player stranded in a lobby list they
 * never asked for, still inside the host's battle overlay. So the embed asks
 * the host to take the screen back and the host decides where the player
 * lands (its own arena).
 */

// Posted to the host window when the player leaves the battle. Carries
// nothing: the host knows which battle it opened.
export const LEAVE_BATTLE_MESSAGE = "hexah:leave-battle";

// True inside an embedded Hexah battle (html.hexah-embedded is stamped by
// index.html before first paint whenever #hexPid is present). The host RPG
// owns the battle lifecycle there — leaving mid-game goes through its own
// surrender flow, so the fork's exit-to-lobby buttons must not render.
export function isHexahEmbedded(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("hexah-embedded");
}

/**
 * Where "leave the game" goes. Standalone: the menu, as always. Embedded:
 * a message to the host, which closes the battle overlay.
 *
 * The message goes to any embedder ("*") because the host origin is not
 * known here — it carries no data, and only a window that already embeds
 * this game can receive it.
 */
export function leaveGame(): void {
  if (isHexahEmbedded() && window.parent !== window) {
    window.parent.postMessage({ type: LEAVE_BATTLE_MESSAGE }, "*");
    return;
  }
  window.location.href = homeHref();
}

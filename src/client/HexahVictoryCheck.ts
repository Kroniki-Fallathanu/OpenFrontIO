import { EventBus } from "../core/EventBus";
import { WinUpdate } from "../core/game/GameUpdates";
import { SendWinnerEvent } from "./Transport";
import { GameView } from "./view";

/**
 * Bridge for embedded Hexah battles: the host page asks whether the battle is
 * already won, and this answers from the running simulation.
 *
 * Why the host cannot answer it alone: the simulation runs in the browser, so
 * Hexah's server knows nothing about tiles held. It only learns the outcome
 * from this server's signed webhook. A result can get lost on the way (a
 * deploy restarting the receiver, a dropped request), and the player is then
 * stuck in front of a finished game that the host still shows as running.
 *
 * The bridge never invents a winner. It reports the numbers, and when the
 * simulation has already declared a winner it asks the server to publish that
 * same result again. Everything a player could gain still has to pass the
 * server's own winner handling and the signed webhook.
 */

const REQUEST_TYPE = "hexah:victory-check";
const RESPONSE_TYPE = "hexah:victory-check:result";

interface VictoryCheckReport {
  /** The simulation has declared a winner. */
  finished: boolean;
  /** This player meets the victory conditions right now. */
  met: boolean;
  /** The declared result was sent to the server again. */
  reported: boolean;
  ownedPercent: number | null;
  requiredPercent: number | null;
  alive: boolean;
}

export class HexahVictoryCheck {
  private recordedWin: WinUpdate | null = null;
  private readonly onMessage = (event: MessageEvent) => this.handle(event);

  constructor(
    private readonly game: GameView,
    private readonly eventBus: EventBus,
  ) {}

  /** Starts listening. No-op outside an iframe: nobody can ask from there. */
  install(): void {
    if (window.parent === window) {
      return;
    }
    window.addEventListener("message", this.onMessage);
  }

  dispose(): void {
    window.removeEventListener("message", this.onMessage);
  }

  /** The win the simulation declared, kept so it can be published again. */
  rememberWin(update: WinUpdate): void {
    this.recordedWin = update;
  }

  private handle(event: MessageEvent): void {
    const data = event.data;
    if (
      typeof data !== "object" ||
      data === null ||
      (data as { type?: unknown }).type !== REQUEST_TYPE
    ) {
      return;
    }
    const source = event.source as Window | null;
    if (source === null) {
      return;
    }
    // The reply goes back to the asking window only, at its own origin, and
    // carries nothing the asker did not already have.
    source.postMessage({ type: RESPONSE_TYPE, ...this.report() }, event.origin);
  }

  private report(): VictoryCheckReport {
    const myPlayer = this.game.myPlayer();
    const requiredPercent = this.game.config().percentageTilesOwnedToWin();
    const landTiles =
      this.game.numLandTiles() - this.game.numTilesWithFallout();
    const ownedPercent =
      myPlayer === null || landTiles <= 0
        ? null
        : (myPlayer.numTilesOwned() / landTiles) * 100;
    const alive = myPlayer?.isAlive() ?? false;
    const opponentsAlive = this.game
      .players()
      .filter((player) => player !== myPlayer && player.isAlive()).length;
    // The same two conditions the simulation uses for an embedded battle:
    // more land than the threshold, or nobody left to fight.
    const met =
      alive &&
      ((ownedPercent !== null && ownedPercent > requiredPercent) ||
        opponentsAlive === 0);
    return {
      finished: this.recordedWin !== null,
      met,
      reported: this.republishRecordedWin(),
      ownedPercent,
      requiredPercent,
      alive,
    };
  }

  /** Re-sends the declared winner so the server publishes the result again. */
  private republishRecordedWin(): boolean {
    const win = this.recordedWin;
    if (win?.winner === undefined) {
      return false;
    }
    this.eventBus.emit(new SendWinnerEvent(win.winner, win.allPlayersStats));
    return true;
  }
}

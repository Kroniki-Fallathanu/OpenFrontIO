import { GameEvent } from "../EventBus";
import {
  ColoredTeams,
  Execution,
  Game,
  GameMode,
  GameType,
  Player,
  PlayerType,
  RankedType,
  Team,
} from "../game/Game";

export class WinEvent implements GameEvent {
  constructor(public readonly winner: Player) {}
}

export class WinCheckExecution implements Execution {
  private active = true;

  private mg: Game | null = null;

  // Hard time limit (in seconds) to force a winner before the server's
  // maxGameDuration hard kill. 170mins (10 mins before 3hrs)
  private static readonly HARD_TIME_LIMIT_SECONDS = 170 * 60;

  constructor() {}

  init(mg: Game, ticks: number) {
    this.mg = mg;
  }

  tick(ticks: number) {
    if (ticks % 10 !== 0) {
      return;
    }
    if (this.mg === null) throw new Error("Not initialized");

    if (this.mg.config().gameConfig().gameMode === GameMode.FFA) {
      this.checkWinnerFFA();
    } else {
      this.checkWinnerTeam();
    }
  }

  checkWinnerFFA(): void {
    if (this.mg === null) throw new Error("Not initialized");
    const sorted = this.mg
      .players()
      .sort((a, b) => b.numTilesOwned() - a.numTilesOwned());
    if (sorted.length === 0) {
      return;
    }

    // Embedded Hexah battles (Singleplayer/Private) end on "last player
    // standing", not only on the territory threshold. In a solo battle the
    // player can wipe out every tribe/bot yet hold well under
    // percentageTilesOwnedToWin of the raw land — without this the game runs
    // to the timer and the win never registers. Symmetric with the loss case:
    //  - sole survivor  → that player wins (human clears the map → victory),
    //  - all humans dead → current leader (a bot) wins → players' loss.
    // Public games keep the upstream territory/timer conditions only.
    if (this.mg.config().gameConfig().gameType !== GameType.Public) {
      if (this.allHumansEliminated()) {
        this.mg.setWinner(sorted[0], this.mg.stats().stats());
        console.log(
          `all human players eliminated, ${sorted[0].name()} has won the game`,
        );
        this.active = false;
        return;
      }
      if (sorted.length === 1 && this.mg.allPlayers().length > 1) {
        this.mg.setWinner(sorted[0], this.mg.stats().stats());
        console.log(`${sorted[0].name()} is the last player standing and won`);
        this.active = false;
        return;
      }
    }

    if (this.mg.config().gameConfig().rankedType === RankedType.OneVOne) {
      const humans = sorted.filter(
        (p) => p.type() === PlayerType.Human && !p.isDisconnected(),
      );
      if (humans.length === 1) {
        this.mg.setWinner(humans[0], this.mg.stats().stats());
        console.log(`${humans[0].name()} has won the game`);
        this.active = false;
        return;
      }
    }

    const max = sorted[0];
    const timeElapsed = this.mg.elapsedGameSeconds();
    const numTilesWithoutFallout =
      this.mg.numLandTiles() - this.mg.numTilesWithFallout();
    if (
      (max.numTilesOwned() / numTilesWithoutFallout) * 100 >
        this.mg.config().percentageTilesOwnedToWin() ||
      (this.mg.config().gameConfig().maxTimerValue !== undefined &&
        timeElapsed - this.mg.config().gameConfig().maxTimerValue! * 60 >= 0) ||
      timeElapsed >= WinCheckExecution.HARD_TIME_LIMIT_SECONDS
    ) {
      this.mg.setWinner(max, this.mg.stats().stats());
      console.log(`${max.name()} has won the game`);
      this.active = false;
    }
  }

  private allHumansEliminated(): boolean {
    if (this.mg === null) throw new Error("Not initialized");
    // allPlayers() — players() hides dead players, which would make a lobby
    // with every human dead look like a lobby that never had humans at all.
    const humans = this.mg
      .allPlayers()
      .filter((p) => p.type() === PlayerType.Human);
    return humans.length > 0 && humans.every((p) => !p.isAlive());
  }

  checkWinnerTeam(): void {
    if (this.mg === null) throw new Error("Not initialized");
    const teamToTiles = new Map<Team, number>();
    for (const player of this.mg.players()) {
      const team = player.team();
      // Sanity check, team should not be null here
      if (team === null) continue;
      teamToTiles.set(
        team,
        (teamToTiles.get(team) ?? 0) + player.numTilesOwned(),
      );
    }
    const sorted = Array.from(teamToTiles.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    if (sorted.length === 0) {
      return;
    }
    const max = sorted[0];
    const timeElapsed = this.mg.elapsedGameSeconds();
    const numTilesWithoutFallout =
      this.mg.numLandTiles() - this.mg.numTilesWithFallout();
    const percentage = (max[1] / numTilesWithoutFallout) * 100;
    if (
      percentage > this.mg.config().percentageTilesOwnedToWin() ||
      (this.mg.config().gameConfig().maxTimerValue !== undefined &&
        timeElapsed - this.mg.config().gameConfig().maxTimerValue! * 60 >= 0) ||
      timeElapsed >= WinCheckExecution.HARD_TIME_LIMIT_SECONDS
    ) {
      if (max[0] === ColoredTeams.Bot) return;
      this.mg.setWinner(max[0], this.mg.stats().stats());
      console.log(`${max[0]} has won the game`);
      this.active = false;
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}

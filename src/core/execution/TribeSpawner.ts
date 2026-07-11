import { Game, PlayerInfo, PlayerType } from "../game/Game";
import { PseudoRandom } from "../PseudoRandom";
import { GameID } from "../Schemas";
import { simpleHash } from "../Util";
import { SpawnExecution } from "./SpawnExecution";
import { fantasyBandName } from "./utils/FantasyNames";

export class TribeSpawner {
  private random: PseudoRandom;

  constructor(
    private gs: Game,
    private gameID: GameID,
  ) {
    // Use a different seed than createGameRunner (which uses simpleHash(gameID))
    // to avoid tribe IDs colliding with nation/human IDs from the same PRNG sequence.
    this.random = new PseudoRandom(simpleHash(gameID) + 2);
  }

  spawnTribes(numTribes: number): SpawnExecution[] {
    const tribes: SpawnExecution[] = [];
    for (let i = 0; i < numTribes; i++) {
      tribes.push(this.spawnTribe(this.randomTribeName()));
    }
    return tribes;
  }

  spawnTribe(tribeName: string): SpawnExecution {
    return new SpawnExecution(
      this.gameID,
      new PlayerInfo(tribeName, PlayerType.Bot, null, this.random.nextID()),
    );
  }

  private randomTribeName(): string {
    // Hexah fork: bots roam the Wild Lands as fantasy bands instead of the
    // upstream historical civilisations.
    return fantasyBandName(this.random);
  }
}

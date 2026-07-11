import {
  FANTASY_BAND_KINDS,
  FANTASY_GENITIVES,
  fantasyBandName,
  fantasyTribeName,
  toFantasyTribes,
} from "../src/core/execution/utils/FantasyNames";
import { Cell, Nation, PlayerInfo, PlayerType } from "../src/core/game/Game";
import { PseudoRandom } from "../src/core/PseudoRandom";

function makeNations(count: number, random: PseudoRandom): Nation[] {
  const nations: Nation[] = [];
  for (let i = 0; i < count; i++) {
    nations.push(
      new Nation(
        new Cell(i, i * 2),
        new PlayerInfo(
          `Manifest${i}`,
          PlayerType.Nation,
          null,
          random.nextID(),
        ),
      ),
    );
  }
  return nations;
}

describe("FantasyNames", () => {
  test("fantasyBandName combines a band kind with a genitive phrase", () => {
    const random = new PseudoRandom(7);
    for (let i = 0; i < 50; i++) {
      const name = fantasyBandName(random);
      const kind = FANTASY_BAND_KINDS.find((k) => name.startsWith(`${k} `));
      expect(kind).toBeDefined();
      expect(FANTASY_GENITIVES).toContain(name.slice(kind!.length + 1));
    }
  });

  test("fantasyTribeName avoids used names and numbers the overflow", () => {
    const random = new PseudoRandom(3);
    const used = new Set<string>();
    // Exhaust every distinct phrase, then one more.
    for (let i = 0; i < FANTASY_GENITIVES.length + 1; i++) {
      const name = fantasyTribeName(random, used);
      expect(name.startsWith("Plemię ")).toBe(true);
      expect(used.has(name)).toBe(false);
      used.add(name);
    }
    expect(used.size).toBe(FANTASY_GENITIVES.length + 1);
  });

  test("toFantasyTribes renames nations but keeps spawn cells and ids", () => {
    const random = new PseudoRandom(11);
    const original = makeNations(8, random);
    const renamed = toFantasyTribes(original, random);

    expect(renamed).toHaveLength(8);
    const names = renamed.map((n) => n.playerInfo.name);
    expect(new Set(names).size).toBe(8);
    for (let i = 0; i < renamed.length; i++) {
      expect(names[i].startsWith("Plemię ")).toBe(true);
      expect(renamed[i].spawnCell).toBe(original[i].spawnCell);
      expect(renamed[i].playerInfo.id).toBe(original[i].playerInfo.id);
      expect(renamed[i].playerInfo.playerType).toBe(PlayerType.Nation);
    }
  });

  test("renaming is deterministic for the same PRNG seed", () => {
    const namesA = toFantasyTribes(
      makeNations(5, new PseudoRandom(42)),
      new PseudoRandom(42),
    ).map((n) => n.playerInfo.name);
    const namesB = toFantasyTribes(
      makeNations(5, new PseudoRandom(42)),
      new PseudoRandom(42),
    ).map((n) => n.playerInfo.name);
    expect(namesA).toEqual(namesB);
  });
});

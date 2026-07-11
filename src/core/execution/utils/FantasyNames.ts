import { Nation, PlayerInfo } from "../../game/Game";
import { PseudoRandom } from "../../PseudoRandom";

/**
 * Polish dark-fantasy opponent names for the Hexah deployment („Dzikie
 * Ziemie"). Every instance of this fork is the fantasy reskin, so the names
 * are not gated by any flag — client and server run the same build, which
 * keeps name generation deterministic across the lockstep simulation.
 *
 * Grammar: each name is `<kind> <genitive phrase>` — the genitive phrase
 * never has to agree with the head noun, so every combination reads
 * correctly in Polish.
 */

/** Band kinds for bots — the rabble roaming the Wild Lands. */
export const FANTASY_BAND_KINDS = [
  "Horda",
  "Wataha",
  "Banda",
  "Zgraja",
  "Sfora",
  "Kult",
  "Krąg",
  "Bractwo",
  "Klan",
  "Ród",
  "Kompania",
  "Czereda",
  "Hufiec",
  "Chorągiew",
  "Gromada",
  "Drużyna",
] as const;

export const FANTASY_GENITIVES = [
  "Wilczego Kła",
  "Krwawego Księżyca",
  "Czarnego Kruka",
  "Żelaznej Pięści",
  "Złamanej Włóczni",
  "Szarej Mgły",
  "Kruczego Cienia",
  "Ognistej Grzywy",
  "Zimnej Gwiazdy",
  "Węża Głębin",
  "Białego Jelenia",
  "Dzikiego Gonu",
  "Kamiennego Serca",
  "Północnego Wichru",
  "Spalonej Ziemi",
  "Gorzkiej Wody",
  "Wiecznego Głodu",
  "Rdzawego Topora",
  "Pękniętej Tarczy",
  "Nocnej Trwogi",
  "Bagiennego Ognia",
  "Starego Dębu",
  "Wysokiej Turni",
  "Głuchego Boru",
  "Czerwonego Świtu",
  "Ostatniego Tchu",
  "Wroniego Pióra",
  "Księżycowej Blizny",
  "Słonych Wydm",
  "Martwej Rzeki",
  "Śpiącego Wulkanu",
  "Zwęglonych Kości",
  "Sczerniałego Srebra",
  "Wygasłego Ogniska",
  "Krzywego Rogu",
  "Lodowej Szczeliny",
  "Popielnej Drogi",
  "Trzech Mogił",
  "Siedmiu Wiatrów",
  "Złotego Kła",
  "Niedźwiedziej Łapy",
  "Rysiego Oka",
  "Żmijowego Języka",
  "Turzego Rogu",
  "Jastrzębiego Szponu",
  "Sowiego Krzyku",
  "Borsuczej Nory",
  "Żubrzego Grzbietu",
  "Cisowego Łuku",
  "Dębowej Maczugi",
  "Krzemiennego Grotu",
  "Smolnej Pochodni",
  "Mglistych Rozstajów",
  "Wywróconych Kamieni",
  "Zapomnianych Imion",
  "Utraconych Ziem",
  "Gasnących Gwiazd",
  "Wschodzącej Łuny",
  "Podziemnych Źródeł",
  "Grzmiącej Przełęczy",
] as const;

/** Random band name for a bot, e.g. „Wataha Wilczego Kła". */
export function fantasyBandName(random: PseudoRandom): string {
  const kind = FANTASY_BAND_KINDS[random.nextInt(0, FANTASY_BAND_KINDS.length)];
  const genitive =
    FANTASY_GENITIVES[random.nextInt(0, FANTASY_GENITIVES.length)];
  return `${kind} ${genitive}`;
}

/** Unique tribe name for a nation, e.g. „Plemię Czerwonego Świtu". */
export function fantasyTribeName(
  random: PseudoRandom,
  usedNames: ReadonlySet<string>,
): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const name = `Plemię ${FANTASY_GENITIVES[random.nextInt(0, FANTASY_GENITIVES.length)]}`;
    if (!usedNames.has(name)) {
      return name;
    }
  }
  // More tribes than distinct phrases — number the overflow.
  const base = `Plemię ${FANTASY_GENITIVES[random.nextInt(0, FANTASY_GENITIVES.length)]}`;
  let counter = 2;
  while (usedNames.has(`${base} ${counter}`)) {
    counter++;
  }
  return `${base} ${counter}`;
}

/**
 * Renames nations to fantasy tribes while keeping their spawn cells and
 * player ids. Applied after `createNationsForGame` so the upstream
 * manifest/pool selection logic (and its tests) stay untouched.
 */
export function toFantasyTribes(
  nations: Nation[],
  random: PseudoRandom,
): Nation[] {
  const usedNames = new Set<string>();
  return nations.map((nation) => {
    const name = fantasyTribeName(random, usedNames);
    usedNames.add(name);
    return new Nation(
      nation.spawnCell,
      new PlayerInfo(
        name,
        nation.playerInfo.playerType,
        nation.playerInfo.clientID,
        nation.playerInfo.id,
      ),
    );
  });
}

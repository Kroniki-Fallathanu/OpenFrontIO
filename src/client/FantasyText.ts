import { ClientEnv } from "./ClientEnv";

/**
 * Polish dark-fantasy reskin of unit/structure names and build descriptions.
 *
 * Applied as an overlay on top of the active locale (gated by FANTASY_THEME)
 * so the reskin reads consistently in Polish regardless of the player's
 * language, WITHOUT touching the Crowdin-managed translation files. Only the
 * keys present here are overridden; everything else resolves normally.
 */
const FANTASY_TEXT_PL: Readonly<Record<string, string>> = {
  // Names
  "unit_type.city": "Twierdza",
  "unit_type.port": "Przystań",
  "unit_type.factory": "Kuźnia",
  "unit_type.defense_post": "Strażnica",
  "unit_type.sam_launcher": "Wieża łucznicza",
  "unit_type.missile_silo": "Wieża maga",
  "unit_type.warship": "Galeon",
  "unit_type.atom_bomb": "Kula ognia",
  "unit_type.hydrogen_bomb": "Kataklizm",
  "unit_type.mirv": "Deszcz meteorów",
  // Build descriptions
  "build_menu.desc.city": "Zwiększa liczbę poddanych",
  "build_menu.desc.port": "Wysyła kupieckie korabie po złoto",
  "build_menu.desc.factory": "Buduje szlaki i wysyła karawany",
  "build_menu.desc.defense_post": "Wzmacnia obronę pobliskich rubieży",
  "build_menu.desc.sam_launcher": "Odpiera nadlatujące zaklęcia",
  "build_menu.desc.missile_silo": "Stąd ciska się niszczycielskie zaklęcia",
  "build_menu.desc.warship": "Przejmuje korabie, topi łodzie i statki",
  "build_menu.desc.atom_bomb": "Niewielki wybuch ognia",
  "build_menu.desc.hydrogen_bomb": "Potężny kataklizm",
  "build_menu.desc.mirv": "Ogromny wybuch, dosięga tylko wybranego gracza",
};

/**
 * Returns the fantasy override for a translation key when FANTASY_THEME is on,
 * otherwise undefined (caller falls back to normal translation resolution).
 */
export function fantasyTextOverride(key: string): string | undefined {
  if (!ClientEnv.fantasyTheme()) return undefined;
  return FANTASY_TEXT_PL[key];
}

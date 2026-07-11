/**
 * HUD icons for structures under the fantasy theme.
 *
 * The on-map StructurePass swaps its glyph atlas for
 * `atlases/icon-atlas-fantasy.png` (keep/anchor/anvil/shield/crossed-arrows/
 * wizard-hat); these standalone crops of the same glyphs keep the HTML HUD
 * (unit bar, player panels) consistent with what the player sees on the map.
 */

import { assetUrl } from "../../core/AssetUrls";
import { UnitType } from "../../core/game/Game";
import { ClientEnv } from "../ClientEnv";

const FANTASY_STRUCTURE_ICONS: Partial<Record<UnitType, string>> = {
  [UnitType.City]: assetUrl("images/fantasy/FantasyCityIcon.png"),
  [UnitType.Port]: assetUrl("images/fantasy/FantasyPortIcon.png"),
  [UnitType.Factory]: assetUrl("images/fantasy/FantasyFactoryIcon.png"),
  [UnitType.DefensePost]: assetUrl("images/fantasy/FantasyDefensePostIcon.png"),
  [UnitType.SAMLauncher]: assetUrl("images/fantasy/FantasySamLauncherIcon.png"),
  [UnitType.MissileSilo]: assetUrl("images/fantasy/FantasyMissileSiloIcon.png"),
};

/**
 * Icon URL for a structure in HUD components — the fantasy glyph (same as the
 * on-map atlas) when the fantasy theme is active, the given default otherwise.
 */
export function structureHudIcon(
  unitType: UnitType,
  defaultIcon: string,
): string {
  if (!ClientEnv.fantasyTheme()) {
    return defaultIcon;
  }
  return FANTASY_STRUCTURE_ICONS[unitType] ?? defaultIcon;
}

/**
 * GPU-ready color utilities.
 *
 * Terrain RGBA: Uint8Array(w × h × 4) — one RGBA pixel per tile, computed
 * from the terrain color rules applied to the raw terrain byte layout.
 *
 * Player palette is NOT built here — consumers provide a pre-built
 * Float32Array(PALETTE_SIZE × 2 × 4) to the GPURenderer constructor.
 */

/** Must cover 12-bit smallID range (0-4095). */
const PALETTE_SIZE = 4096;

export function getPaletteSize(): number {
  return PALETTE_SIZE;
}

// ---------- Terrain ----------

/**
 * Compute a static RGBA8 texture from raw terrain bytes.
 * The single source of truth for terrain colors.
 *
 * Terrain byte layout per tile:
 *   bit 7: isLand
 *   bit 6: isShoreline
 *   bit 5: isOcean  (water only)
 *   bits 0-4: magnitude (0-31)
 */
/**
 * Encode one terrain byte → RGBA, writing into `out[offset..offset+3]`.
 * When `fantasy` is set, uses a darker, muted dark-fantasy palette (deep
 * teal water, mossy land, weathered-stone peaks) instead of the bright
 * default terrain colors.
 */
export function encodeTerrainTile(
  tb: number,
  out: Uint8Array,
  offset: number,
  fantasy = false,
): void {
  const isLand = (tb & 0x80) !== 0;
  const isShoreline = (tb & 0x40) !== 0;
  const magnitude = tb & 0x1f;

  let r: number, g: number, b: number;

  if (fantasy) {
    if (isLand && isShoreline) {
      // Shore (weathered sand)
      r = 150;
      g = 132;
      b = 96;
    } else if (isLand) {
      if (magnitude < 10) {
        // Plains (moss green)
        r = 74;
        g = 110 - magnitude;
        b = 58;
      } else if (magnitude < 20) {
        // Highland (olive/umber)
        r = 96 + magnitude;
        g = 92 + magnitude;
        b = 60 + magnitude;
      } else {
        // Mountain (cold stone)
        const v = Math.min(190, 150 + Math.floor(magnitude / 2));
        r = v;
        g = v;
        b = Math.min(210, v + 18);
      }
    } else if (isShoreline) {
      // Shoreline water (dim teal)
      r = 38;
      g = 92;
      b = 110;
    } else {
      // Deep water (abyssal navy-teal)
      const m = Math.min(magnitude, 10);
      const off = 11 - m;
      r = Math.max(0, 14 + off);
      g = Math.max(0, 46 + off);
      b = Math.max(0, 70 + off);
    }
  } else if (isLand && isShoreline) {
    // Shore (sand)
    r = 204;
    g = 203;
    b = 158;
  } else if (isLand) {
    if (magnitude < 10) {
      // Plains
      r = 190;
      g = 220 - 2 * magnitude;
      b = 138;
    } else if (magnitude < 20) {
      // Highland
      r = 200 + 2 * magnitude;
      g = 183 + 2 * magnitude;
      b = 138 + 2 * magnitude;
    } else {
      // Mountain
      const v = Math.min(255, 230 + Math.floor(magnitude / 2));
      r = v;
      g = v;
      b = v;
    }
  } else if (isShoreline) {
    // Shoreline water
    r = 100;
    g = 143;
    b = 255;
  } else {
    // Deep water
    const m = Math.min(magnitude, 10);
    const off = 11 - m;
    r = Math.max(0, 70 - 10 + off);
    g = Math.max(0, 132 - 10 + off);
    b = Math.max(0, 180 - 10 + off);
  }

  out[offset] = r;
  out[offset + 1] = g;
  out[offset + 2] = b;
  out[offset + 3] = 255;
}

export function buildTerrainRGBA(
  terrainBytes: Uint8Array,
  w: number,
  h: number,
  fantasy = false,
): Uint8Array {
  const pixels = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    encodeTerrainTile(terrainBytes[i], pixels, i * 4, fantasy);
  }
  return pixels;
}

import { describe, expect, it } from "vitest";
import type { GlyphTables } from "../src/client/render/gl/passes/name-pass/AtlasData";
import { layoutString } from "../src/client/render/gl/passes/name-pass/TextLayout";
import {
  CHAR_RANGE,
  MAX_CHARS,
} from "../src/client/render/gl/passes/name-pass/Types";

function makeGlyphTables(): GlyphTables {
  const advance = new Float32Array(CHAR_RANGE).fill(10);
  const xOffset = new Float32Array(CHAR_RANGE);
  const visW = new Float32Array(CHAR_RANGE).fill(8);
  return { advance, xOffset, visW };
}

describe("layoutString — char code encoding", () => {
  const glyph = makeGlyphTables();
  const kernTable = new Int8Array(CHAR_RANGE * CHAR_RANGE);
  const charCodes = new Uint16Array(MAX_CHARS);
  const cursors = new Float32Array(MAX_CHARS);

  it("keeps Latin Extended-A codepoints intact (Polish diacritics)", () => {
    layoutString("Plemię Słońca", glyph, kernTable, charCodes, cursors);
    const decoded = Array.from(charCodes.slice(0, 13))
      .map((c) => String.fromCharCode(c))
      .join("");
    // A Uint8 store used to fold "ł" (U+0142) onto "B" (66) and drop "ę".
    expect(decoded).toBe("Plemię Słońca");
  });

  it("codepoints beyond the glyph tables fall back to '?', not an aliased glyph", () => {
    layoutString("aあb", glyph, kernTable, charCodes, cursors);
    expect(charCodes[0]).toBe("a".charCodeAt(0));
    expect(charCodes[1]).toBe("?".charCodeAt(0));
    expect(charCodes[2]).toBe("b".charCodeAt(0));
  });

  it("zero-pads the buffer past the string end", () => {
    layoutString("ab", glyph, kernTable, charCodes, cursors);
    expect(charCodes[2]).toBe(0);
    expect(charCodes[MAX_CHARS - 1]).toBe(0);
  });
});

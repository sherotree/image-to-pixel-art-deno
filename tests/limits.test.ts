import { assertEquals } from '@std/assert';
import {
  clampBlockSize,
  DEFAULT_BLOCK_SIZE,
  MAX_BLOCK_SIZE,
  MAX_FILE_BYTES,
  parseOptionalDimension,
  validateImageFile,
  validateNaturalSize,
} from '../src/limits.ts';
import { sampleSkyColorAt } from '../src/sample.ts';
import { defaultControls, paletteByName } from '../src/controls.ts';

Deno.test('clampBlockSize clamps and rounds', () => {
  assertEquals(clampBlockSize(0), 1);
  assertEquals(clampBlockSize(999), MAX_BLOCK_SIZE);
  assertEquals(clampBlockSize(7.6), 8);
  assertEquals(clampBlockSize(Number.NaN), DEFAULT_BLOCK_SIZE);
});

Deno.test('parseOptionalDimension accepts empty and valid values', () => {
  assertEquals(parseOptionalDimension(''), null);
  assertEquals(parseOptionalDimension('  '), null);
  assertEquals(parseOptionalDimension('128'), 128);
  assertEquals(parseOptionalDimension('0'), null);
  assertEquals(parseOptionalDimension('99999'), 4096);
});

Deno.test('validateImageFile rejects empty and oversized files', () => {
  const empty = new File([], 'empty.png', { type: 'image/png' });
  const badEmpty = validateImageFile(empty);
  assertEquals(badEmpty.ok, false);

  const big = new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'big.png', {
    type: 'image/png',
  });
  const badBig = validateImageFile(big);
  assertEquals(badBig.ok, false);

  const ok = new File([new Uint8Array([1, 2, 3])], 'ok.png', { type: 'image/png' });
  assertEquals(validateImageFile(ok).ok, true);
});

Deno.test('validateNaturalSize enforces edge limit', () => {
  assertEquals(validateNaturalSize(100, 80).ok, true);
  assertEquals(validateNaturalSize(5000, 100).ok, false);
  assertEquals(validateNaturalSize(0, 10).ok, false);
});

Deno.test('sampleSkyColorAt stays within RGB range', () => {
  for (const t of [0, 0.3, 0.55, 0.8, 1]) {
    const [r, g, b] = sampleSkyColorAt(t);
    assertEquals(r >= 0 && r <= 255, true);
    assertEquals(g >= 0 && g <= 255, true);
    assertEquals(b >= 0 && b <= 255, true);
  }
});

Deno.test('defaultControls and paletteByName resolve Pixelit Default', () => {
  const c = defaultControls();
  assertEquals(c.blockSize, DEFAULT_BLOCK_SIZE);
  assertEquals(c.usePalette, true);
  const named = paletteByName('Pixelit Default');
  assertEquals(Boolean(named && named.colors.length > 0), true);
  assertEquals(c.palette.length > 0, true);
});

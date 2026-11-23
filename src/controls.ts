import { PALETTES, type NamedPalette, type RGB } from 'image-to-pixel-art/browser';
import {
  clampBlockSize,
  DEFAULT_BLOCK_SIZE,
  parseOptionalDimension,
} from './limits.ts';

export interface EditorControls {
  blockSize: number;
  grayscale: boolean;
  usePalette: boolean;
  palette: RGB[];
  paletteName: string;
  maxWidth: number | null;
  maxHeight: number | null;
}

export function listPalettes(): NamedPalette[] {
  return [...PALETTES];
}

export function paletteByName(name: string): NamedPalette | undefined {
  return PALETTES.find((p) => p.name === name);
}

export function readControlsFromForm(form: HTMLFormElement): EditorControls {
  const data = new FormData(form);
  const blockRaw = Number(data.get('blockSize'));
  const grayscale = data.get('grayscale') === 'on';
  const usePalette = data.get('usePalette') === 'on';
  const paletteName = String(data.get('palette') ?? 'Pixelit Default');
  const named = paletteByName(paletteName) ?? PALETTES[PALETTES.length - 1];
  const palette = named?.colors ?? [];

  return {
    blockSize: clampBlockSize(blockRaw || DEFAULT_BLOCK_SIZE),
    grayscale,
    usePalette,
    palette,
    paletteName: named?.name ?? paletteName,
    maxWidth: parseOptionalDimension(String(data.get('maxWidth') ?? '')),
    maxHeight: parseOptionalDimension(String(data.get('maxHeight') ?? '')),
  };
}

export function defaultControls(): EditorControls {
  const named = paletteByName('Pixelit Default') ?? PALETTES[0];
  return {
    blockSize: DEFAULT_BLOCK_SIZE,
    grayscale: false,
    usePalette: true,
    palette: named?.colors ?? [],
    paletteName: named?.name ?? 'Pixelit Default',
    maxWidth: null,
    maxHeight: null,
  };
}

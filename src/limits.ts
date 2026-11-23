/** Client-side limits for Image to Pixel Art (no server upload). */

export const MAX_FILE_BYTES = 12 * 1024 * 1024; // 12 MiB
export const MAX_IMAGE_EDGE = 4096;
export const MIN_BLOCK_SIZE = 1;
export const MAX_BLOCK_SIZE = 50;
export const DEFAULT_BLOCK_SIZE = 8;
export const ACCEPTED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

export function clampBlockSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BLOCK_SIZE;
  return Math.min(MAX_BLOCK_SIZE, Math.max(MIN_BLOCK_SIZE, Math.round(value)));
}

export function parseOptionalDimension(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(MAX_IMAGE_EDGE, Math.round(n));
}

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file || !(file instanceof File)) {
    return { ok: false, error: 'Choose an image file to continue.' };
  }
  if (file.size <= 0) {
    return { ok: false, error: 'That file is empty.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `Image is too large (max ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))} MB).`,
    };
  }
  const type = (file.type || '').toLowerCase();
  if (type && !ACCEPTED_MIME.has(type) && !type.startsWith('image/')) {
    return { ok: false, error: 'Use a PNG, JPEG, WebP, GIF, or BMP image.' };
  }
  if (!type && !/\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name)) {
    return { ok: false, error: 'Use a PNG, JPEG, WebP, GIF, or BMP image.' };
  }
  return { ok: true };
}

export function validateNaturalSize(
  width: number,
  height: number,
): { ok: true } | { ok: false; error: string } {
  if (!width || !height) {
    return { ok: false, error: 'Could not read image dimensions.' };
  }
  if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE) {
    return {
      ok: false,
      error: `Image is too large (max ${MAX_IMAGE_EDGE}×${MAX_IMAGE_EDGE} px).`,
    };
  }
  return { ok: true };
}

/**
 * Programmatic sample image (no external photo URL).
 * Draws a small landscape scene suitable for pixelation demos.
 */

export interface SampleDrawOptions {
  width?: number;
  height?: number;
}

/** Draw a sample scene onto a canvas and return a PNG data URL. */
export function createSampleDataUrl(
  canvas: HTMLCanvasElement,
  options: SampleDrawOptions = {},
): string {
  const width = options.width ?? 480;
  const height = options.height ?? 320;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.7);
  sky.addColorStop(0, '#1b3a5c');
  sky.addColorStop(0.55, '#4f8fbf');
  sky.addColorStop(1, '#f2c46d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Sun
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.28, Math.min(width, height) * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe08a';
  ctx.fill();

  // Hills
  ctx.fillStyle = '#2f6b4f';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.62);
  ctx.quadraticCurveTo(width * 0.25, height * 0.48, width * 0.5, height * 0.6);
  ctx.quadraticCurveTo(width * 0.75, height * 0.72, width, height * 0.55);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1f4d38';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.74);
  ctx.quadraticCurveTo(width * 0.35, height * 0.66, width * 0.7, height * 0.78);
  ctx.quadraticCurveTo(width * 0.88, height * 0.84, width, height * 0.76);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Simple house
  const hx = width * 0.18;
  const hy = height * 0.58;
  const hw = width * 0.16;
  const hh = height * 0.16;
  ctx.fillStyle = '#d9c4a5';
  ctx.fillRect(hx, hy, hw, hh);
  ctx.fillStyle = '#8b3a2e';
  ctx.beginPath();
  ctx.moveTo(hx - hw * 0.08, hy);
  ctx.lineTo(hx + hw / 2, hy - hh * 0.55);
  ctx.lineTo(hx + hw + hw * 0.08, hy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3d2a1f';
  ctx.fillRect(hx + hw * 0.38, hy + hh * 0.35, hw * 0.24, hh * 0.65);

  // Tree
  const tx = width * 0.58;
  const ty = height * 0.62;
  ctx.fillStyle = '#5a3a24';
  ctx.fillRect(tx - 4, ty, 8, height * 0.12);
  ctx.fillStyle = '#2d6a3e';
  ctx.beginPath();
  ctx.arc(tx, ty - 6, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f8a52';
  ctx.beginPath();
  ctx.arc(tx + 10, ty + 2, 14, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

/** Pure helper used in Deno tests (no DOM): sample scene color at a point. */
export function sampleSkyColorAt(yNorm: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, yNorm));
  // Approximate sky gradient endpoints for regression checks
  if (t < 0.55) {
    const u = t / 0.55;
    return mixRgb([27, 58, 92], [79, 143, 191], u);
  }
  const u = (t - 0.55) / 0.45;
  return mixRgb([79, 143, 191], [242, 196, 109], u);
}

function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

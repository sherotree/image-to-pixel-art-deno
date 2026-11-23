/**
 * Build static assets for Deno Deploy (and local `deno task start`).
 * Bundles the browser entry so clients never fetch `jsr:` at runtime.
 */
import { ensureDir } from '@std/fs/ensure-dir';
import { copy } from '@std/fs/copy';
import { dirname, fromFileUrl, join } from '@std/path';

const root = join(dirname(fromFileUrl(import.meta.url)), '..');
const dist = join(root, 'dist');

try {
  await Deno.remove(dist, { recursive: true });
} catch {
  // first build
}
await ensureDir(dist);

const bundle = new Deno.Command(Deno.execPath(), {
  args: [
    'bundle',
    '--platform=browser',
    '--minify',
    '--min-dep-age=0',
    '--outdir',
    dist,
    join(root, 'index.html'),
  ],
  cwd: root,
  stdout: 'inherit',
  stderr: 'inherit',
});

const result = await bundle.output();
if (!result.success) {
  Deno.exit(result.code || 1);
}

// Favicon is not part of the HTML module graph — copy into dist.
await copy(join(root, 'public', 'favicon.svg'), join(dist, 'favicon.svg'), {
  overwrite: true,
});

console.log('Build complete → dist/');

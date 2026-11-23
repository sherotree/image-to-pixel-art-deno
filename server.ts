/**
 * Local static file server for `dist/` (after `deno task build`).
 * Deno Deploy serves `dist/` as a static site — this server is for local use.
 */
import { serveDir } from '@std/http/file-server';

const port = Number(Deno.env.get('PORT') ?? '8000');
const root = 'dist';

try {
  await Deno.stat(root);
} catch {
  console.error(`Missing ${root}/. Run: deno task build`);
  Deno.exit(1);
}

console.log(`Image to Pixel Art → http://127.0.0.1:${port}`);

Deno.serve({ port }, (req) =>
  serveDir(req, {
    fsRoot: root,
    urlRoot: '',
    quiet: true,
  })
);

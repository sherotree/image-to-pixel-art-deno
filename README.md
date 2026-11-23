# Image to Pixel Art (Deno)

**Web tool:** [Image to Pixel Art](https://www.uwarp.design/image-to-pixel-art) — free hosted browser editor for converting images to pixel art.

Standalone Deno app that provides the same client-side conversion flow, powered by [`jsr:@sherotree/image-to-pixel-art@0.1.0`](https://jsr.io/@sherotree/image-to-pixel-art@0.1.0). Upload, drop, sample scene, block size, palette presets, grayscale, optional max dimensions, before/after preview, and PNG download — all in the browser. **Images are never uploaded to a server.**

## Features

- Local file upload / drag-and-drop
- Programmatic sample scene (no external photo URL)
- Before / after preview
- Block size, grayscale, built-in palettes, optional max width/height
- Reset + PNG download
- Accessible status messages and client-side size limits

## Quick start (local)

Requires [Deno](https://deno.com) 2.4+ (`deno bundle` for the browser build).

```bash
deno task build   # bundles JSR library into dist/ (no jsr: imports in the browser)
deno task start   # serves dist/ at http://127.0.0.1:8000
# or
deno task dev
```

Other checks:

```bash
deno task check
deno task lint
deno task test
deno task ci
```

## How the browser avoids `jsr:` at runtime

Source TypeScript imports `jsr:@sherotree/image-to-pixel-art` during **build**.  
`deno task build` runs `deno bundle --platform=browser` on `index.html`, producing self-contained assets under `dist/`. The served page loads only those static files.

## Deno Deploy notes (important)

Official status (Oct 9, 2026): Deno announced the team is joining Cloudflare. **Deno Deploy will continue operating for six months before shutting down** ([Deno is joining Cloudflare](https://deno.com/blog/cloudflare)). Docs banner: *[Deno Deploy will be sunset in April 2027](https://docs.deno.com/deploy/).*

Impact for this repo:

- The app is a **portable static site** (`deno.json` → `deploy.runtime.type: "static"`, `cwd: ./dist`).
- You can still run it locally forever with `deno task build && deno task start`.
- Hosting on Deno Deploy may remain possible until the sunset window ends, but **new account / dashboard sign-in may already be unreliable** as the service winds down. Do not treat Deploy as a long-term host.
- This project does **not** require Deno Deploy to be useful; any static file host that serves `dist/` works.
- We are **not** switching platforms in this repo and are **not** using paid alternatives here.

If you still have Deploy access before sunset:

1. Open [console.deno.com](https://console.deno.com)
2. Create an app linked to this GitHub repo
3. Build uses `deno task build`; runtime is **static** from `./dist` (SPA mode on)

## Library

- JSR: https://jsr.io/@sherotree/image-to-pixel-art@0.1.0  
- Source: https://github.com/sherotree/image-to-pixel-art  

## License

MIT. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

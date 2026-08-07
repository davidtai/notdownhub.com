# notdownhub.com

The marketing site for **notdownhub** — the source that gets served at
`notdownhub.com`.

It's a static, framework-free page: Vite + TypeScript + Tailwind CSS v4. The
only runtime JavaScript is a small theme toggle and a scroll-reveal observer,
so it builds to plain HTML/CSS/JS that any static host can serve. It's
mobile-first and works down to a 360px viewport; the page never scrolls
sideways (wide content such as the terminal snippets scrolls inside its own
block).

## Develop

```bash
npm install
npm run dev        # start the dev server (default http://localhost:5173)
```

Edit `index.html` (content and structure), `src/style.css` (design system and
components), and `src/main.ts` (theme toggle, reveal, year). The brand mark
lives in `public/logo.svg`; the favicon is a small-size-tuned derivation in
`public/favicon.svg`. Both are single-color and use `currentColor`, so they
theme with the page.

## Build

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the built dist/ locally
npm run typecheck  # type-check without emitting
```

Static output lands in `dist/` (gitignored).

## Deploy

`dist/` is a self-contained static bundle — HTML, hashed CSS/JS, and the SVG
assets. Deploy it to any static host; there is no server component.

1. Build: `npm install && npm run build`.
2. Publish the contents of `dist/` to your static host of choice — an
   object-store + CDN bucket, a static-site platform, or a plain web server
   serving the directory.
3. Point the apex domain **notdownhub.com** (and, if you like, `www`) at that
   host. Serve `index.html` for `/` and let the host fall back to it for
   unknown paths (this is a single-page marketing site, so a catch-all to
   `index.html` is fine).
4. Serve over HTTPS. Nothing here needs any environment variables, secrets, or
   build-time configuration.

### Notes

- Fonts (Space Grotesk, IBM Plex Sans, IBM Plex Mono) load from Google Fonts at
  runtime. To make the page fully self-hosted, download the font files, drop
  them in `public/`, and replace the `<link>` in `index.html` with a local
  `@font-face` block in `src/style.css`.
- Theme is three-way (light / system / dark). The choice is stored in
  `localStorage` under the key `theme`; `system` follows the OS via
  `matchMedia`. The resolved theme is applied before first paint by a tiny
  inline script in `<head>` to avoid a flash, and `<meta name="theme-color">`
  is set per color scheme.
- Design: distinctive "altitude" direction — the product floats (balloons keep
  the computer up) while the incumbents' status pages go orange. Display type
  is Space Grotesk, body is IBM Plex Sans, and commands/labels use IBM Plex
  Mono. Two accents: a warm coral (the balloons, links, CTAs) and a cool teal
  (the "operational" signal).

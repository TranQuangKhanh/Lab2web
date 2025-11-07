# mini-jsx-framework (jsx-without-react)

This repo contains a small Vite-based demo app (mini JSX framework). This project now builds a static `dist/` output that can be hosted on many static hosts (Netlify, Cloudflare Pages, GitHub Pages, Surge) or on a Node host (Render) using the included `server.js`.

Quick checks (locally):

```powershell
cd jsx-without-react
# remove any local node_modules to simulate CI
rm -Recurse -Force node_modules -ErrorAction SilentlyContinue
# install exactly from lockfile
npm ci
# build static site
npm run build
# serve locally to verify (optional)
npx serve dist -p 8080
```

Deploy options (recommended):

- Netlify (recommended):

  - Root directory: `jsx-without-react`
  - Build command: `npm ci && npm run build`
  - Publish directory: `dist`
  - Netlify will use `netlify.toml` routing for SPA

- Cloudflare Pages:

  - Root directory: `jsx-without-react`
  - Build command: `npm ci && npm run build`
  - Build output directory: `dist`

- GitHub Pages (public repo):

  - Add the `gh-pages` package and deploy, or upload `dist/` to `gh-pages` branch (not included automatically)

- Surge (quick test):
  - `npm ci && npm run build && npx surge ./dist`

If you want me to push a small `gh-pages` deploy script or add a GitHub Action to publish automatically, I can add that next.

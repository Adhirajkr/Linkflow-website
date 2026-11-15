# LinkFlow website

Cinematic 3D marketing site. One fixed WebGL canvas; the laptop and phone fly between scenes as you scroll.
No framework, no runtime dependencies (custom ~170-line WebGL2 renderer). Falls back to static art without WebGL2.

## Run locally
    node build.mjs            # needs esbuild (npm i -D esbuild, then change the import in build.mjs to 'esbuild')
    npx serve dist            # or just open dist/index.html

## Publish
Upload `dist/index.html` (single file) to any static host: GitHub Pages, Netlify, Cloudflare Pages, Vercel.
On GitHub Pages: put it in a repo as `index.html`, Settings > Pages > deploy from branch.

## Downloads
Every download button opens the GitHub project: https://github.com/Adhirajkr/Linkflow
To change it, edit `js/config/downloadConfig.js` (GITHUB_OWNER / GITHUB_REPO), run `node build.mjs`, re-upload.

## Structure
- `index.src.html` page + copy · `css/styles.css` design tokens and layout
- `js/scene/` 3D stage (devices, effects) · `js/gl/` renderer · `js/demos/` one file per feature animation
- `js/ui/` nav, FAQ, tabs, colour wheel, downloads · `js/config/` site + download settings

Pending (needs your input): minimum system requirements, real social preview image, site URL (`siteConfig.js`).

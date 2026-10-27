# Elias Coleshill — engineering portfolio

An Astro static site with Home, a filterable project gallery, About, and twelve individual case studies. Includes locally hosted imagery/fonts, keyboard-accessible photo galleries, an illustrative weather-engine diagram, two compressed CAD viewers and the RI3D video.

## Run locally

Use **Node 24** and **pnpm 11**. Astro requires Node `>=22.23.4`; the project was built with Node 24.22.1 and pnpm 11.25.0.

From **this folder** (the one containing `package.json`):

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the Local URL printed by Astro, normally **http://127.0.0.1:4321/**. The dev server updates as source files change.

Production build and verification:

```sh
pnpm build
pnpm verify
pnpm preview --port 4322
```

Preview the production build at the Local URL printed by the last command. `dist/` is the complete static output. The Astro wrapper disables telemetry for these project commands, so it does not need to write Astro preferences outside the workspace.

## What to edit

| File/folder | Purpose |
| --- | --- |
| `src/data/projects.ts` | Project order, copy, contributions, status, images, related projects and media. First three entries are featured. |
| `src/data/site.ts` | Name, contact links and shared URL helper. |
| `src/pages/index.astro` | Homepage introduction and section layout. |
| `src/pages/about.astro` | Biography, degree information, timeline and outdoor photos. |
| `src/pages/projects/[slug].astro` | Shared case-study page layout. |
| `src/styles/global.css` | Palette, typography, layout and responsive styles. |
| `src/scripts/client.ts` | Filters, menu, lightbox, video and CAD interaction. |
| `public/media/` | Optimized image copies. Original media was preserved separately. |
| `public/models/` | The two compressed, web-ready GLB assemblies. |
| `public/vendor/` | Locally served mesh decoder and its license. |
| `public/files/Elias_Coleshill_Resume.pdf` | Separate corrected **review draft**, not the original supplied résumé. |
| `LAUNCH-CHECKLIST.md` | Items to review before publishing. |

Use `href()` from `site.ts` for internal URLs so pages work at both a custom domain and a GitHub repository subpath. Cards and project pages share the same data. When adding a project, provide a unique slug and a related-project list; extend the artifact verifier's expected project count if the collection size changes.

## Media preparation

Normal build/run commands do not need Python, STEP originals or a CAD application. The optimized media, models and PDF are already present.

For future image updates, install Pillow in your Python environment, add the source filename/key mapping in `scripts/prepare-media.py`, then run:

```sh
python scripts/prepare-media.py "Portfolio Content"
```

This creates 640- and 1400-pixel WebP variants, strips copied metadata, and writes `src/data/media.json`. It never changes the originals.

The original media lives in `Portfolio Content/` beside the website source and is excluded from Git. The script reads those files and writes optimized web copies under `public/media/`; it never changes the originals.

### CAD

```sh
node scripts/convert-cad.cjs "Portfolio Content"
node scripts/optimize-cad.mjs
```

The first command tessellates the STEP assemblies with OpenCascade via `occt-import-js`. The second preserves a higher detail budget, joins compatible render primitives and applies Meshopt compression. Generated uncompressed GLBs are archived under the ignored `Portfolio Content/Generated CAD/` directory, inside this project and outside the deployed site. Original STEP files are untouched.

The current exact file sizes, conversion settings and triangle counts are recorded in `src/data/models-web.json`. RI3D was retessellated at 0.35 mm tolerance and now retains about 3.16 million triangles, roughly 4.7 times its first web export. Baker Bot retains its existing approximately 1.54-million-triangle geometry with revised materials; a finer full STEP conversion was stopped after extended processing. Both use the new shading and material presentation.

For quick material-only revisions without another STEP tessellation, use `node scripts/restyle-cad.mjs baker-bot` (or `ri3d`). This preserves existing geometry and updates the web manifest's size.

Source hashes and conversion parameters are recorded in `src/data/models.json`; optimized file sizes/counts are in `models-web.json`. The web copies are for exploration, not manufacturing. Rotation/zoom/reset and keyboard interaction are provided; the geometry is not rigged to animate robot joints.

The viewer and optional Google effects add-on are loaded when an assembly enters the viewport, with an Explore 3D button and retry fallback. The presentation uses satin-metal / matte-polymer materials, lower exposure, filmic tone mapping, contact shading and edge smoothing. Materials are visualization choices, not a claim about every physical part's finish. The viewer rotates at four degrees per second, pauses for inspection or when offscreen, and starts stationary when the visitor requests reduced motion. Pause / Resume and Reset controls are available.

The Meshopt decoder is served from this site. If updating that dependency, refresh `public/vendor/meshopt_decoder.js` from `meshoptimizer/meshopt_decoder.cjs` and preserve its license.

### Public reference media

FIO uses the official public company logo. Combat robotics temporarily uses credited photographs of other teams from the 2026 BotBrawl Summer Classic and the official **BBRL Season 2 Week 3 Highlights** video by BotBrawl Canada. The card and project page clearly identify these as competition reference media. The teams remain in the design phase.

See `MEDIA-CREDITS.md` and `src/data/reference-media.json` for the source links and creators. To regenerate web copies, run `python scripts/prepare-reference-media.py`. Original downloads are stored in the ignored `Portfolio Content/Reference Media/` directory. The personal-image preparation script preserves these reference entries when updating its manifest.

### Video

The RI3D button loads a `youtube-nocookie.com` iframe only when selected, with a direct YouTube link always available. YouTube oEmbed and the in-browser player verified the supplied video as **“REBUILT Ri3D Robot Reveal (Houdini), WEFIRST”**, by **Western Engineering FIRST**. Playback is still subject to YouTube's future availability and visitor network settings.

### Résumé

The supplied résumé remains unchanged. A separate two-page review copy incorporates confirmed corrections and supplies the local site's working download. It is visibly marked as a review draft. **Review and replace/approve it before sending applications or deploying.**

`scripts/build-resume.py` is the editable source for that review copy. Regeneration needs ReportLab and the Windows Arial fonts used in the script; it is not part of the normal website build or GitHub workflow.

## GitHub Pages deployment

Use **this folder's contents as the repository root**—including `.github/`, `src/`, `public/`, `package.json` and `pnpm-lock.yaml`. Do not commit the surrounding workspace, source STEP files, `node_modules/`, or raw CAD archive. `.gitignore` excludes build/dependency directories and STEP originals.

1. Create the repository on the intended GitHub account and push this project to its `main` branch.
2. In repository **Settings → Pages**, select **GitHub Actions** as the build/deployment source.
3. Run the **Deploy portfolio to GitHub Pages** workflow, or push a change to `main`.
4. The workflow installs locked dependencies, builds, runs the artifact verifier and publishes `dist/`.

The workflow reads `origin` and `base_path` from GitHub's Configure Pages action. This supports either `https://EColeshill8.github.io/REPOSITORY/`, an account site, or a configured custom domain without hard-coding a repository name.

For a local subpath build in PowerShell:

```powershell
$env:SITE_URL = 'https://ecoleshill8.github.io'
$env:BASE_PATH = '/portfolio-test'
pnpm build
pnpm verify
Remove-Item Env:SITE_URL
Remove-Item Env:BASE_PATH
```

Rebuild without those variables to return to the root-domain configuration. Ordinary local builds use `https://eliascoleshill.ca` as the intended canonical origin; the domain has not been purchased or configured by this task.

### Custom domain

After purchasing `eliascoleshill.ca`, verify ownership in GitHub's account Pages settings, add the domain in the repository's Pages settings, and configure the registrar's DNS records using GitHub's current instructions. Set up the apex/`www` relationship and enable HTTPS once available, then rerun the workflow so canonical/share URLs use the configured domain.

Official instructions: [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), [domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages), [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

The source repository is [EColeshill8/Engineering-Portfolio](https://github.com/EColeshill8/Engineering-Portfolio), deployed through GitHub Actions at [the GitHub Pages address](https://ecoleshill8.github.io/Engineering-Portfolio/). Domain purchase and custom-domain configuration remain separate owner steps.

## Verification

`pnpm verify` checks all generated HTML pages, internal file/fragment references, image variants, metadata, case-study count, the WEC correction, and both compressed GLB containers. It runs after the production build and in CI.

The browser checks covered desktop/mobile layout bounds, category filtering, mobile navigation, lightbox open/Escape/focus restoration, both models loading real geometry, model keyboard/reset controls, the weather-diagram keyboard interaction and the actual RI3D video player. See `VERIFICATION.md` for final results and limits.

The large viewer/effects JavaScript chunks are intentional and requested only when an assembly comes into view or Explore 3D is selected. They are not an initial homepage download.

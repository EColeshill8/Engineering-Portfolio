# Elias Coleshill — engineering portfolio

An Astro static site with Home, a filterable project gallery, About, and twelve individual case studies. Includes locally hosted imagery/fonts, keyboard-accessible galleries, a firmware-based weather-light simulator, three compressed CAD viewers, and project videos.

Read [portfolio-implementation-handbook.md](portfolio-implementation-handbook.md) for Elias’s current copy preferences, contribution boundaries, editing locations and media workflow. The existing Baker Bot writing is the style reference and should be preserved unless Elias requests edits.

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
| `public/models/` | Three compressed GLBs, including the animated head. |
| `src/scripts/cad-viewer.ts` | Three.js lighting, camera, model loading, rotation and scroll animation. |
| `public/videos/` | Silent, web-ready project clips; source metadata is in `src/data/videos.json`. |
| `public/vendor/` | Locally served mesh decoder and its license. |
| `public/files/Elias_Coleshill_Resume.pdf` | Current résumé supplied and approved for the live portfolio on October 30, 2026. |
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

Conversion is optional and needs the original files. Install the native converter using Python 3.12 (use the same interpreter for conversion):

```sh
python -m pip install --target .tools/cad-native --no-deps cadquery-ocp-novtk==7.8.1.1.post1
```

```sh
pnpm convert:cad
```

This uses native OpenCascade for Baker Bot and `occt-import-js` for RI3D, then prepares all three web models. The WASM Baker Bot conversion proved too slow at the new precision; the native fallback succeeded. Uncompressed GLBs are archived under the ignored `Portfolio Content/Generated CAD/` directory. Source files remain untouched. Full conversion can take a long time; normal builds do not perform conversion.

The current sizes, conversion settings and triangle counts are recorded in `src/data/models-web.json`. The November studio pipeline uses 0.20 mm tolerance for RI3D, 0.18 mm for Baker Bot, and 0.16 rad angular deflection. It retains the tessellation without triangle simplification, apart from degenerate-face cleanup. Feature lines use a 35-degree crease threshold, so internal triangulation is hidden. Each original part remains identifiable. The three 1.5 mm RI3D hopper walls and named polycarbonate parts use transparent materials; opaque panels and mechanisms retain separate finishes.

The head uses `Portfolio Content/Head Assembly Exxxploded.glb`, which contains assembled positions and 71 named parts. `scripts/prepare-cad.mjs` authors a reversible `Head explode` animation from those parts, guided by the supplied exploded PNG. The offsets are an explanatory layout, not a simulated disassembly process. Rebuild just the head with `node scripts/prepare-cad.mjs baker-head-exploded`. `headOffset()` is the place to adjust component travel.

For material/edge changes without retessellation, rerun `node scripts/prepare-cad.mjs baker-bot` (or `ri3d`); it can read the archived raw GLB. The older `optimize-cad.mjs` / `restyle-cad.mjs` scripts predate the studio pipeline and should not be used on the new assets.

Source hashes and conversion parameters are recorded in `src/data/models.json`; prepared asset metadata is in `models-web.json`. The web copies are for exploration. The head animation separates assembly components; it does not animate working joints.

`src/scripts/cad-viewer.ts` loads Three.js when an assembly enters the viewport. It uses antialiasing, 1.5–2× pixel density, neutral tone mapping, a warm key light, softer cool fill/rim lights, subdued reflections and grounding shadows. Feature edges can be toggled. Materials are visualization choices. Rotation starts automatically at six degrees per second, pauses while inspecting, and resumes after 1.6 seconds. Manual pause persists. Offscreen/hidden viewers stop rendering; reduced-motion visitors start stationary and use the head slider instead of scroll animation. Arrow keys rotate, +/− zoom, and Home resets. Click/focus enables wheel zoom; scrolling beside the head scrubs the explosion. Still posters and a retry button remain available after failure.

The Meshopt decoder is bundled locally from Three.js. `scripts/test-cad.mjs` loads the actual GLBs through the browser's GLTFLoader implementation and checks surface normals, geometry counts, feature lines, panel transparency, animation endpoints and reversal. It also checks rotation/scroll state rules. This is not a GPU or real-browser visual test.

### Public reference media

FIO uses the official public company logo. Combat robotics uses the official BotBrawl logo as its neutral cover, with credited photographs of other teams from the 2026 Summer Classic and the official **BBRL Season 2 Week 3 Highlights** video by BotBrawl Canada further down the page. The page clearly identifies these as competition reference media. The teams remain in the design phase.

See `MEDIA-CREDITS.md` and `src/data/reference-media.json` for the source links and creators. To regenerate web copies, run `python scripts/prepare-reference-media.py`. Original downloads are stored in the ignored `Portfolio Content/Reference Media/` directory. The personal-image preparation script preserves these reference entries when updating its manifest.

### Video

The Baker Bot case study prominently features the original 37-second jaw/eyelid bench test. Its upright H.264 web copy is approximately 1.7 MB, with audio removed and a poster fallback. It loops silently while visible, pauses offscreen or in a background tab, and respects reduced-motion preferences. Visitors can pause/resume with the labelled button or native video controls, or open the MP4 directly. It demonstrates the head subsystem, not completed AI-driven whole-robot motion.

RI3D also includes the supplied 22-second prototype test clip. Regenerate it with `python scripts/prepare-ri3d-video.py --ffmpeg PATH_TO_FFMPEG`. This produces a silent, progressive MP4, poster variants and review frames while preserving the existing Baker Bot video manifest.

To regenerate the Baker Bot clip and its poster, make FFmpeg available on PATH (or supply `--ffmpeg` with its executable path), install Pillow, then run:

```sh
python scripts/prepare-project-video.py
```

Alternatively, install the isolated helper with `python -m pip install --target .tools/python imageio-ffmpeg==0.6.0`; the script discovers its bundled FFmpeg automatically. `.tools/` and generated review frames are ignored by Git. The script preserves the original video, corrects its rotation, strips audio/private metadata, creates a progressive MP4 and poster variants, and records sizes/hashes in `src/data/videos.json`. These tools are only needed to regenerate media, not for normal builds or deployment.

The RI3D button loads a `youtube-nocookie.com` iframe only when selected, with a direct YouTube link always available. YouTube oEmbed and the in-browser player verified the supplied video as **“REBUILT Ri3D Robot Reveal (Houdini), WEFIRST”**, by **Western Engineering FIRST**. Playback is still subject to YouTube's future availability and visitor network settings.

### Weather-light simulator

`src/lib/weather-engine.mjs` contains the public display calculations, and `src/scripts/weather-demo.ts` handles inputs and playback. `WeatherSimulator.astro` supplies the controls. The preview starts from a clear 12/18/14/8°C feels-like forecast with 20% cloud cover and runs at 4× playback speed, which visitors can change. Colour and scheduling tests live in `scripts/test-weather.mjs`; controlled interaction tests are in `scripts/test-interactions.mjs`. Screen glow/random effects are labelled approximations. The local firmware ZIP contains private configuration and must remain outside the public repository.

### Résumé

The live résumé is the two-page PDF supplied on October 29, 2026. It is copied into `public/files/` without modifying the source document, so every résumé link on the site continues to use the same stable URL.

`scripts/build-resume.py` remains available only for generating a separate historical review draft under the ignored `Portfolio Content/Generated Resume/` folder. It does not overwrite the approved live résumé. Regeneration needs ReportLab and the Windows Arial fonts used in the script; it is not part of the normal website build or GitHub workflow.

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

Rebuild without those variables to return to the root-domain configuration. Ordinary local builds use `https://eliascoleshill.ca` as the canonical origin.

### Custom domain

`eliascoleshill.ca` is registered through Porkbun, verified with GitHub, and assigned to this repository. Its four root A records point to GitHub Pages; `www` is a CNAME to `ecoleshill8.github.io`. Keep the GitHub ownership-verification TXT record in DNS. HTTPS enforcement is enabled for the primary domain.

When changing the custom domain in the future, update GitHub's Pages settings and the registrar's DNS records, verify certificate availability before enabling HTTPS, and rerun the workflow so root paths and canonical/share URLs use the configured domain. GitHub issues certificates for the apex and `www` hostnames; provisioning can finish at different times.

Official instructions: [custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site), [domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages), [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

The source repository is [EColeshill8/Engineering-Portfolio](https://github.com/EColeshill8/Engineering-Portfolio), deployed through GitHub Actions at [eliascoleshill.ca](https://eliascoleshill.ca/). Pushes to `main` continue to build, verify and publish the site automatically.

## Verification

`pnpm verify` checks generated HTML, internal file/fragment references, image variants, metadata, case-study count, the WEC correction, all three compressed GLB containers, MP4 integrity/streaming layout and project disclosures. It also tests motion behaviour and the weather simulator’s firmware reference values, rain filtering, cloud dimming and schedule. It runs after the production build and in CI.

The browser checks covered desktop/mobile layout bounds, category filtering, mobile navigation, lightbox open/Escape/focus restoration, both models loading real geometry, model keyboard/reset controls, the weather-diagram keyboard interaction and the actual RI3D video player. See `VERIFICATION.md` for final results and limits.

The large viewer/effects JavaScript chunks are intentional and requested only when an assembly comes into view or Explore 3D is selected. They are not an initial homepage download.

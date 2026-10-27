# Implementation verification

Checked locally on 24 October 2026 with Node 24.22.1, pnpm 11.25.0 and Astro 7.4.2.

## Build and generated files

- Production build completed successfully.
- `pnpm verify` passed: **16 HTML pages, 12 case studies, 455 local references, 27 source images and two compressed GLB models**.
- A separate build with `SITE_URL=https://ecoleshill8.github.io` and `BASE_PATH=/portfolio-test` passed the same artifact checks. The final local build was restored to `/`.
- HTTP checks against the production preview returned 200 for Home, Projects, About, all twelve project routes, both models, the decoder, résumé, sitemap and robots file. An unknown route returned 404.
- Metadata, a single H1 per page, image alternative text, unique IDs, local file/fragment links, responsive image variants, the corrected WEC result and model container/compression metadata passed the artifact verifier.
- All 27 supplied images were preserved as originals and prepared separately into 54 WebP files. Image preparation does not overwrite source media.

## Browser checks

The in-app browser was used for real page and media interactions, including the production build.

| Check | Result |
| --- | --- |
| Desktop, 1366 × 900 | Home layout bounds and loaded image dimensions checked; no horizontal overflow in the checked layout. |
| Mobile, 390 × 844 | Home, Baker Bot, RI3D, Weather Lights and About layout bounds checked; no horizontal overflow in those views. |
| Tablet, 768 × 1024 | About layout bounds checked; no horizontal overflow. |
| Project filtering | Robotics selected, correct five-card subset and count displayed; pressed state updated. |
| Mobile navigation | Menu opened, exposed links, and closed after navigation; expanded state updated. |
| Photo galleries | Open/close, next image, Escape dismissal, caption/count updates and focus restoration checked. |
| Baker Bot CAD | Actual compressed geometry loaded, canvas present, keyboard rotation accepted and reset control used. |
| RI3D CAD | Actual compressed geometry loaded at mobile width and in production; canvas/control state checked. Loaded poster correctly hides. |
| Weather architecture diagram | Keyboard activation updated the transition state, pressed state and explanation. |
| RI3D video | Correct YouTube title/author confirmed through oEmbed; embedded player loaded and played the reveal video. |

The model integration initially exposed a missing decoder configuration. It was corrected by explicitly configuring the locally hosted Meshopt decoder before loading the assemblies; subsequent browser loads succeeded. A renderer animation-frame warning occurred during browser testing, but the geometry loaded and controls became available.

## CAD conversion

Both original STEP assemblies were tessellated locally using OpenCascade, simplified and compressed. No native CAD export remains outstanding.

| Model | Web file | Triangles after optimization |
| --- | --- | --- |
| RI3D | 4,141,932 bytes (about 4.0 MiB) | 668,425 |
| Baker Bot | 9,036,124 bytes (about 8.6 MiB) | 1,539,582 |

Source hashes, conversion parameters and original/optimized counts are recorded in the data manifests. The model files are viewing copies and do not animate robot joints.

## Résumé

A separate corrected **two-page review draft** was generated from confirmed interview facts. Both rendered pages were inspected and the text extracted for checking. It is visibly marked for review before publication; the original supplied résumé was preserved.

## Limits and launch checks

- Browser screenshot capture was unavailable. Layout dimensions, DOM/accessibility state, image loads and interactions were checked, but a screenshot-based visual review was not possible. Review the actual site on your own phone and laptop before applications.
- This is not a full accessibility certification, device-lab test or performance audit. Fullscreen behavior, adverse-network retries and every browser/assistive-technology combination were not exhaustively tested. The code includes static posters, error/retry states and direct media links.
- GitHub Actions, public DNS, custom-domain routing and HTTPS have not been exercised against a real repository/domain. Deployment preparation and local subpath output were verified; account and domain steps remain yours.
- YouTube availability can change. External profile links use the confirmed public URLs; authenticated account ownership was not checked.
- Review the case-study wording/statuses and the résumé before publishing. Optional new photos/clips are listed in `LAUNCH-CHECKLIST.md`.

The working preview is local to this computer. Run commands are in `README.md`.

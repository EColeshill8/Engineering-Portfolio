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

## CAD and public-media update — 27 October 2026

The follow-up replaces the bright CAD presentation with lower exposure, filmic tone mapping, a contrasting studio background, tuned satin-metal / matte-polymer visualization materials, screen-space contact shading and antialiasing. RI3D was retessellated at 0.35 mm tolerance and optimized to about 3.16 million triangles. Baker Bot retains its existing 1.54-million-triangle mesh with the new material treatment; the finer STEP conversion was stopped after extended processing. Original STEP assemblies remain unchanged.

Both viewers load when visible, rotate at four degrees per second, and provide Pause / Resume and Reset controls. Interaction pauses the turntable, and offscreen/background viewers stop rotating. The reduced-motion preference is read before starting rotation and listened to for changes; preference emulation was unavailable in the browser tooling.

Browser checks and screenshots confirmed the revised geometry/material presentation, successful model loading, default rotation state, Pause / Resume state changes, reset and keyboard inspection. The optional shading add-on loaded without browser errors in the checked views. Screenshot capture, unavailable during the initial implementation, worked for this follow-up.

The FIO card and project page now use the official public company logo with its source link. Combat robotics uses the official BotBrawl logo as its neutral cover, three credited 2026 Summer Classic photographs and the official **BBRL Season 2 Week 3 Highlights** video. The logo replaced the initial NV reference cover so thumbnails cannot imply ownership of another team’s robot. YouTube oEmbed verified the title/publisher; the actual embedded player loaded and played. Gallery next-image/Escape controls, count/caption updates, photographer credits and focus restoration passed. Checked mobile media layouts had no horizontal overflow.

The artifact verifier now also checks all 33 image sources, the revised CAD detail/material budgets, absence of raw CAD exports in the deployed models directory, FIO attribution, and combat reference disclosures/credits/video. See `MEDIA-CREDITS.md` for the original image/video sources. All code, raw CAD archives and reference originals are kept inside the permanent portfolio project; raw assets remain ignored by Git.

## New project media — 27 October 2026

Added the supplied Baker Bot head-motion test and saw-axe clutch sketch. The original files remain unchanged in the ignored content folder. The head test is corrected to upright 480 × 854 orientation, encoded as a silent 37.10-second H.264 MP4 (1,716,195 bytes), and accompanied by a still poster. FFmpeg decoded the entire prepared clip without errors. Its MP4 metadata precedes the media payload for progressive playback; the verifier checks the container, byte count and SHA-256 against the manifest.

Production builds passed at `/` and `/Engineering-Portfolio`, including the new base-aware video/poster URLs. Final artifact verification passed for 16 HTML pages, 12 case studies, 477 local references, 35 image sources, one MP4 and two compressed GLB models.

Browser checks confirmed actual muted autoplay, movement, a restart through the 37-second loop boundary, keyboard pause/resume, persistence of manual pause after scrolling away and back, automatic offscreen pause and automatic resumption. Desktop 1280 × 900 and mobile 390 × 844 views were inspected with screenshots and no horizontal overflow. The concept sketch loaded at 1400 × 1867 in the mobile gallery dialog with its design-study caption; the combat cover remains the BotBrawl logo.

Playback regression tests execute the actual client code with simulated media, preference and visibility events. They passed reduced-motion startup/change behavior, explicit play under reduced motion, manual pause persistence, viewport/background pause/resume, rejected autoplay and failed-source fallback. Reduced-motion OS/browser emulation and actual network-failure emulation were unavailable; those paths were tested with these controlled events rather than claimed as browser checks.

# Implementation verification

## Head explosion correction — 4 November 2026

Replaced broad name-based offsets with explicit source-hash-protected assignments for all 71 part instances, using the supplied exploded CAD image as the layout reference. Servo components stay in rigid groups. The jaw bracket is separated above the motor, gears are offset from the side supports, inserts withdraw from their host holes, and bolts/axles have individual placements. Rebuilt the animation with staged axis-aligned moves, including a small front-shell clearance lift and a gear clearance path. Tightened the vertical stack and raised the front shell to better match the supplied image. Full Baker Bot and RI3D models/materials are unchanged by this correction.

Triangle-level BVH checks pass at 201 poses: no newly intersecting component pairs during sampled motion and no intersections between separated components at the endpoint. Existing source CAD contacts are recorded as a baseline during the assembled stages; rigid servo groups are intentionally retained. Additional tests verify stage ordering, intact servo groups, bracket/gear/insert clearances, and restoration of assembled bounds. Offline assembled/intermediate/final renders were compared to the reference. These checks do not constitute a physical disassembly simulation or GPU/browser rendering verification.

Scroll now follows by default even when rotation is paused or reduced motion is enabled. Reduced motion directly samples the user-controlled scroll position. Slider use no longer traps visitors in manual mode: the next page scroll resumes following without a button. Controlled tests execute the actual handler for these scenarios. The sticky scroll track remains present under reduced motion; its previous collapse was one cause of the disabled-looking behaviour.

## CAD studio and head animation — 4 November 2026

Replaced the Google viewer integration with a lazy-loaded Three.js studio: neutral tone mapping, antialiasing at 1.5–2× pixel density, a defined warm key light, cool fill/rim lights, low-intensity reflections, grounding shadows and a darker backdrop. Offline feature-edge geometry omits triangulation. The Edges button toggles outlines. All models start rotating while visible, pause during inspection and resume after 1.6 seconds; explicit manual pause and reduced motion remain respected. Rendering stops offscreen or in a hidden tab. Keyboard orbit/zoom/reset and native fullscreen controls are present.

Retessellated RI3D at 0.20 mm / 0.16 rad: approximately 6.96 million triangles, three identified 1.5 mm clear hopper walls. The finer WASM conversion of Baker Bot was too slow; native OpenCascade 7.8.1 completed the 0.18 mm / 0.16 rad export, preserving component identities and colours. Its web derivative has approximately 5.85 million triangles and five transparent polycarbonate panels. Original STEP and GLB sources are unchanged; raw and diagnostic exports remain ignored and outside `public/`.

The supplied head GLB still contains assembled positions. Authored a 71-part `Head explode` animation from its named components and the supplied exploded PNG. The prepared model retains about 188,000 non-degenerate triangles and is approximately 1.1 MB. Its sticky viewer scrubs with page scroll, reverses back to the assembled position and offers a manual slider plus Follow scroll. Reduced-motion visitors use the slider. The separate full Baker Bot assembly remains. The case-study content in `src/data/projects.ts` is unchanged; only the head viewer's new operational note was updated.

Automated CAD checks use the same GLTFLoader/Meshopt decoder as the viewer to load the actual assets, checking triangle counts, normals, feature lines, clear panels and animation reversal. Head bounds change from roughly 0.160 × 0.212 × 0.174 m to 0.514 × 0.432 × 0.464 m. Pure motion tests check initial rotation, temporary drag/wheel/keyboard holds, delayed resumption, manual pause, visibility and reduced motion. Controlled bootstrap tests execute the actual page loading code and pass visible-only loading, retry, context failure, timeout and disposal of a late result. These are not real browser/GPU tests.

The geometry/layout of assembled, halfway and exploded head states was inspected in an offline render. The in-app browser host was unavailable. Windows Computer Use then stopped because it could not determine the current browser URL confidently; no further browser input was attempted. Actual GPU shading, responsive page rendering, touch/fullscreen interaction and device frame rates could not be visually verified during this update. A browser/device visual review remains useful.

Production builds and the full automated suite pass at both `/` and `/Engineering-Portfolio`; the final output is restored to `/`. Artifact verification covers 16 HTML pages, 12 case studies, 535 local references, 54 image sources, two progressive MP4s and three compressed GLBs. The renderer remains lazy-loaded; its larger Three.js chunk is not part of the initial page script.

## Portfolio expansion — 3 November 2026

Reworked the eleven other case studies, Home and About copy using Elias’s edited Baker Bot writing as the reference: direct subtitles/captions, more explanation of mechanisms, control decisions, testing and limitations, and a natural first-person voice. An exact source-block comparison against commit `d424d91` confirmed the original Baker Bot content is unchanged apart from the new model reference. Its existing model heading/note and shared footer wording are preserved as well. Added the current implementation handbook and linked it from the original local handoff.

Inspected all seventeen new photographs in contact sheets and added optimized 640/1400 WebP copies. RI3D has eight horizontal-gallery items and the supplied 22.3-second test video, encoded as a silent 720 × 1280 progressive H.264 clip (5,387,840 bytes). Three video sample frames were inspected. About has a nine-photo cycling gallery with pause/play, keyboard and touch navigation, visibility handling and reduced-motion support. The personal 1 lb saw-axe and WE FIRST’s 3 lb program now have distinct attribution; the clutch CAD/sketch belong to the personal project. No confidential FIO media or firmware credentials are deployed.

The head STEP converted at 0.15 mm tolerance: 71 parts, 141,267 original triangles and 131,299 optimized triangles, in a 719,184-byte Meshopt GLB. Both the head viewer and exploded PNG sit inside “Designing the Head”; the full Baker Bot viewer remains separate. Bounding-box analysis and an offline three-view geometry render confirmed the supplied STEP contains the assembled head (approximately 160 × 174 × 211 mm), so the viewer is labelled “Interactive head CAD.” The static PNG shows the exploded layout. A genuinely exploded 3D view requires an export that preserves the separated part positions.

The weather simulator ports the supplied temperature/sky palettes, HSV interpolation, quadratic cloud brightness, rain check, channel scaling and scheduler. Gold-reference tests pass at the 9°C discontinuity, cloud extremes, 60% daytime-rain boundary, mode transitions and day-cycle reset. Random effects and screen glow are labelled browser approximations; the preview does not call a weather API. The source archive and its private configuration remain ignored.

Production builds and artifact verification pass at both `/` and `/Engineering-Portfolio`: 16 HTML pages, 12 case studies, 538 local references, 54 image sources, two progressive MP4s and three compressed GLBs. Controlled DOM-event tests execute the actual new handlers and pass forecast changes, rain-fallback status, manual/reduced-motion pause, hidden-tab/viewport behaviour, gallery keyboard navigation and slideshow pause. Local HTTP checks returned 200 for the updated routes, head GLB and RI3D MP4.

Visual browser verification is limited in this session. The in-app browser host was unavailable; the Windows browser helper then stopped because it could not confidently determine Chrome’s current URL. No further browser input was attempted. Source images, optimized images, video sample frames and an offline CAD render were inspected, but responsive page rendering and actual browser playback were not re-verified. Those limits are not represented as passing browser checks.

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

## Résumé replacement — 30 October 2026

Replaced the prior generated review draft with the supplied October 29, 2026 résumé while preserving the source PDF. A corrected source revision supplied October 30 was then installed, with WEC Junior Design listed as sixth place and Weather Lights described as a prototype-board build. Both Letter-sized pages were rendered at 150 DPI and visually inspected; no clipping, overlap, broken glyphs or missing page content was found. The live filename remains `public/files/Elias_Coleshill_Resume.pdf`, so existing About-page and footer links require no URL change. The historical résumé generator now writes only to the ignored generated-media folder and cannot overwrite the approved live document.

# Portfolio implementation handbook

Updated 3 November 2026. This is the current guide to Elias’s portfolio preferences and the implementation. Read it before changing copy or adding media. The original planning handoff and interview remain useful factual sources; the latest direct answers take precedence.

## Writing and factual detail

- Use Elias’s edited Baker Bot page as the voice reference. Preserve its existing wording unless he explicitly asks for edits. Do not correct its grammar or shorten it as part of a general site refresh.
- Write in the first person, with natural Canadian spelling. Explain what the problem was, what Elias actually did, why a design choice helped, how it was tested and what still needs work.
- Longer technical descriptions are welcome when they add real information: mechanisms, interfaces, control logic, materials, tolerances, failure modes and iterations. Avoid padding a short project to a word target.
- Subtitles identify the device or task directly. Captions describe the visible object, activity or test. Avoid inspirational slogans, vague lessons, filler and phrases such as “things worth building,” “the curiosity stayed,” or “time well spent.”
- Keep the tone approachable. Prefer “I added guiding wedges because the balls were jamming” to formal project-report language or generic claims about innovation.
- Distinguish intended behaviour, CAD work, prototypes, tested subsystems and a complete integrated result. Keep limitations useful and specific.
- Keep original/base-design credits and contribution boundaries. Do not turn a team robot into a solo build or a contemplated redesign into an implemented feature.

## Current content boundaries

- Baker Bot: Elias leads the 12-person project and independently developed the head. His personal code contribution is head movement/bench testing. Preserve the current hardware/software status in his own copy.
- Combat robotics has TWO stories on ONE page: WE FIRST’s two 3 lb team robots (Marc leads the combat project; Elias runs the club and mentors the teams) and Elias’s independent 1 lb / 454 g saw-axe. The clutch sketches and CAD belong to the personal robot.
- The personal saw-axe has a CAD layout and a 3D printed clutch that worked in early testing. A complete combat robot and realistic-energy engagement have not been demonstrated. CAD masses of about 85 g and 164 g are estimates of different assemblies, not measured full-robot masses. Use the supplied project brief as context, not as instructions.
- Weather lights: solo prototype-board build, printed enclosure, installed under the bed. The new firmware is more recent evidence for display rules than the interview. Avoid hard-coding a single wake time: the supplied time/sleep code contains different targets in different paths. No quantified reliability or phone-use improvement was measured.
- FIO: public company logo and text descriptions only. No internal photographs, CAD, drawings, reports or reconstructed proprietary visuals. Contractor implemented the highlighted PLC/robot teaching changes with Elias assisting. Savings are approximate recollections; do not add them into a precise published metric.
- WEC: Senior 2025 second place; Junior 2024 sixth place. Minibot yaw drift and 6502 servo jitter remain acknowledged limitations. Credit Ben Eater, KitBot and collaborators.
- Both exact degree titles, graduation in 2029 and May–August 2027 co-op availability remain current. Sunstangs is an affiliation.

## Media and interactions

- Keep source files untouched in `Portfolio Content/`. It is intentionally ignored by Git. Optimize web copies into `public/media`, `public/videos` and `public/models` with the provided scripts.
- Inspect every new image before captioning it. Use location details only when supplied; do not infer dates, named routes, people or performance from an image alone.
- Baker Bot’s exploded head image and interactive head model belong INSIDE “Designing the Head.” Keep the separate full Baker Bot viewer as well. Each model needs unique IDs, its own controls and a poster fallback.
- A STEP with exploded part positions creates a rotatable exploded model; it does not automatically provide an assemble/explode animation. Do not advertise an animation that was not supplied or authored.
- The November head STEP named “Exploded” converts to bounds of roughly 160 × 211 × 174 mm, consistent with the assembled head. It is presented as “Interactive head CAD,” next to the actual exploded PNG. A future export must retain separated component positions before that viewer is labelled exploded. Check the file geometry rather than trusting its name.
- RI3D build photos use a horizontal, swipeable gallery with previous/next controls, keyboard navigation and click-to-expand. The About page’s trips/hobbies gallery cycles while visible, with pause/play and reduced-motion support.
- Preserve original portrait framing with contain-fit images when cropping would hide hardware or people. Keep controls and captions legible on mobile.
- Pause offscreen/tab-hidden animations. Respect manual pause and reduced motion. Galleries and model failures should leave usable still images and content.
- Keep third-party BotBrawl media explicitly credited and labelled as competition references. The neutral BotBrawl logo remains the combat project thumbnail.

## Weather simulator implementation

- `src/lib/weather-engine.mjs` ports public display calculations from `HSVColor.cpp`, `ColorEngine.cpp` and `main.cpp` in the supplied archive. `src/scripts/weather-demo.ts` handles inputs, playback and visibility. `WeatherSimulator.astro` supplies accessible controls.
- Use the four feels-like temperatures, the HSV gradient including the deliberate change at 9°C, cloud brightness `1 − 0.5 × (cloudPercent / 100)²`, weather-code groups and the green-channel factor of 0.95.
- Automatic playback follows 30-second forecast stages, 20-second temperature / 10-second weather mode intervals and two-second smoothstep transitions. The device runs for 20 minutes; the browser preview can repeat for exploration.
- Rain/drizzle needs a qualifying 7 a.m.–7 p.m. hourly forecast with at least 60% precipitation probability; otherwise choose the cloud-based weather code. The simulator inputs represent that check, not a live API request.
- Screen glow and random effects are approximations and are labelled as such. The strip is three-channel RGB; it does not have independent addressable-pixel animations. The source’s sunbeam helper has `repeatEffect=false`, so do not claim it repeats every weather cycle.
- The firmware archive includes `include/secrets.h`. NEVER publish the archive, credentials, exact private coordinates, PlatformIO build caches or an extracted source tree. Only the necessary non-secret display rules belong in this repository.

## Files and normal workflow

- Permanent repository: `C:\Users\encol\Documents\Important Items\Elias Portfolio`. Do not move final code or repositories back under the Codex workspace.
- Project copy: `src/data/projects.ts`. Home: `src/pages/index.astro`. About: `src/pages/about.astro`. Shared layout/footer: `src/layouts/Layout.astro`.
- Model chrome and default notes: `src/components/ModelViewer.astro`; live loaded-model instructions: `src/scripts/client.ts`. Avoid changing Baker Bot’s existing copy through shared defaults.
- Add image keys in `scripts/prepare-media.py`, then run `python scripts/prepare-media.py "Portfolio Content"`. It creates 640/1400 WebP variants without upscaling or modifying originals.
- Convert only the new head: `node scripts/convert-cad.cjs "Portfolio Content" baker-head-exploded`, then `node scripts/optimize-cad.mjs baker-head-exploded`. The other models need not be rebuilt.
- Run `pnpm build` and `pnpm verify`. The verifier should check working media/structure and substantive disclosures, not demand exact editable prose.
- Preview responsive layouts, horizontal galleries, pause controls, weather inputs, model loading/failure and keyboard access. State any browser-verification limit accurately.
- Commit only intended changes, push `main`, and confirm the Pages workflow completes. Deployment is authorized when Elias asks to upload the finished update.
- Live site: https://eliascoleshill.ca/ — GitHub repository: https://github.com/EColeshill8/Engineering-Portfolio.

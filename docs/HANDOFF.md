# Handoff

State of the work as of 3 September 2026, written so a session on another machine can continue without the chat history.

## What exists

**Props package (`props/`).** 23 models in the gallery. Hand-built in the original review session (Fable 5.1): Xbox controller, MacBook Pro 14, the Santa Monica house at "2401" with its stairs and gate, the Santa Monica apartment building, six palm species with wind. Generated through the tool: diner coffee mug, Fiat Mobi twice (Sonnet 5 in 12 min, Fable 5.1 in 39 min), Honda Fit (Fable, 11 min), Fire Station No. 2 (Opus 5, 11 min from Street View screenshots), a vintage typewriter and a favela house the user built. Scenes: the Santa Monica home interior and garage (hand-composed), a retired couple's version of the same house with a furniture workshop (pipeline, Opus, 22 min), the Ocean Park street between 5th and 6th (pipeline, Opus, 27 min), and the 200 block of Hollister Avenue at 239 (hand-composed with the street layer, plus the generated fire station).

**Environments package (`environments/`).** `env build "<prompt>"` with links and places: research (links via Wikidata and Wikipedia, places via Nominatim and Overpass, elevation via USGS 3DEP), a composing session on the subscription following `.claude/skills/environment/SKILL.md`, verification, a manifest in `envs/<id>/`. MCP tools `build_environment`, `environment_status`, `fetch_map`. The street survey step is documented with `envs/hollister-239/street.md` as the worked example; a session does not yet write the sheet from photos automatically.

**Runtime features added along the way.** Progress and ETA per build (stderr, `dist/<id>.status.json`, history-based estimates, heartbeat, overrun reporting). Per-model animation hook (`api.onTick`) with a Wind toggle. Weather: dusk or June gloom (`world.setWeather`, Sky buttons, `still.js --sky=gloom`). Gallery: sidebar with filter, zoom buttons, drag to pan (shift or right drag, WASD), provenance line. Embedded props via `C.prop(def, x, z, rot, { length, face, shell })` with their own material slots and self-frame measuring.

## Lessons that changed the code

- People before things: a household or street sheet decides placement; write it first. Traces of use (a puzzle left out, a bin at the kerb) are what make a place read as lived in.
- Every session's own "what reads and what does not" notes found real bugs: map data not loadable in the browser, embedded props measured in world space, helpers bound to the wrong group, flat prisms in one tonal range, geocoder landing mid-block. All fixed in the catalog, which is how the next scene benefits.
- The ground must be one elevation field shared by roads, buildings and placements; a fitted plane hides roads. Long roads must be subdivided to hug it. Roads ride 15 cm above it.
- Thin objects vanish from a diorama camera; windows and porches matter more than facade texture; parked cars and trees change a street more than anything else.
- The catalog once lacked `K.concrete`, and every apron and step silently rendered in Three's default unlit white. Undefined materials fail quietly; the validator now runs each model's ticks but does not yet check for missing materials.

## Known gaps and suggested next steps

1. Gloom mode: the nine street wall tones were tuned for dusk and read candy-coloured under flat light; desaturate them by about a third when gloom is on.
2. Survey automation: give the environment session photos and have it write `street.md` and the lot table itself (format in `envs/hollister-239/street.md`).
3. Validator: fail on meshes with undefined materials; fail on parts outside the map disc.
4. Placement by intent for interiors (anchors and clearances) instead of hand-typed metres; a stair helper so a house can be one model; a top-down plan still for checking placement.
5. People: `C.person` exists; a few figures per scene anchor scale.
6. Parks and cities: the skill says what to do for now; nothing is built.
7. Nominatim intersections: the geocoder tries variants and reports when it could not resolve the corner; `env map "239 Hollister Avenue, Santa Monica"` resolves the address exactly.

## Where things are

- Gallery artifact (review surface): https://claude.ai/code/artifact/4d0d68f4-d71c-4266-ad60-76669961e660, published from `props/dist/artifact.html`.
- Per-environment docs: `environments/envs/<id>/scenario.md` or `street.md`, `manifest.json`, `map.json`.
- Run history for ETAs: `props/dist/.timings.json` and `environments/dist/.timings.json` (not committed; estimates start from defaults on a new machine).
- Reference photos are not committed (`props/refs/` is ignored); the fire station and Hollister models carry the measurements in their comments.
- `node_modules` is not committed: run `npm install` inside `props/` first. The environments package has no dependencies of its own; it requires the props package next to it (or `TWO_FORKS_PROPS`).

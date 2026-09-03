# Two Forks Environments

One prompt in, a composed environment out: a home interior from a building and its links, or a street from a map location, in the same Firewatch-dusk style as the props gallery. Built to be called by a larger city-generation process as much as by hand.

```
node bin/env.js build "build a Santa Monica home" --url https://... 
node bin/env.js build "build a street at 4th Street & Hollister Avenue, Santa Monica"
node bin/env.js map "4th Street & Hollister Avenue, Santa Monica"     # map data only
node bin/env.js status <id>
node bin/env.js list
```

## What happens

1. **Research.** Links are resolved the way the props tool does (Wikidata and Wikipedia give dimensions and a photo). A place, given with `--place` or found in the prompt after "at", "near" or "on", is geocoded and its building footprints and roads pulled from OpenStreetMap into local metres (`lib/map.js`), saved as `envs/<id>/map.json`.
2. **Compose.** A Claude Code session on your subscription follows `.claude/skills/environment/SKILL.md`: a household or street sheet first, then a plan, then scene models placed from the props catalog, validated and rendered, with `node props/bin/prop.js build` for anything the catalog lacks. It runs from the parent folder and may only write to `props/models/` and `envs/<id>/`.
3. **Verify.** This process validates every model the session listed, exports GLB and OBJ, renders stills, rebuilds the gallery and writes `envs/<id>/manifest.json`.

Progress with ETA goes to stderr, `dist/<id>.build.log` and `dist/<id>.status.json`. Model for the session defaults to Opus; `--model` overrides.

## Layout

```
lib/env.js       the pipeline
lib/map.js       geocoding and OpenStreetMap footprints and roads
lib/prompt.js    the session prompts
bin/env.js       CLI
mcp/server.js    MCP tools build_environment, environment_status, fetch_map
envs/<id>/       request.json, research.json, map.json, scenario.md, manifest.json
```

The props package (`../props`, or `TWO_FORKS_PROPS`) supplies the runtime, catalog, validator, gallery and the model files. Scenes land there so they render beside the props.

## Reference environment

`envs/santa-monica-house/` holds the hand-composed reference: the household, the plan, the results and the findings that shaped the recipe. Its models are `santa-monica-home` and `santa-monica-garage` in the props gallery.

## Pipeline runs so far

| Environment | Request | Model | Time | Result |
|---|---|---|---|---|
| `santa-monica-house` | hand-composed reference in the review session | Fable 5.1 (interactive) | untimed | 2 scenes, 8,936 and 4,916 tris |
| `retired-couple-home` | "build a Santa Monica home interior for the existing house model ... a retired couple who rent the garage level as a workshop to a furniture maker" | Opus 5 | 22 min, 24 turns | 2 scenes, 10,752 and 4,848 tris, household sheet, plan, window sill markers on the cut walls |
| `ocean-park-4th-hollister` | "build a street at 4th Street & Hollister Avenue, Santa Monica" | Opus 5 | 27 min, 59 turns | 1 scene, 19,404 tris, 53 real footprints, three streets and two alleys, house and apartments models embedded on two lots |

| `hollister-239` | "what are we missing" against four Street View captures at 239 Hollister Ave | Fable 5.1 (interactive) plus Opus for the fire station prop | untimed | 1 scene, 95,714 tris: real grade from USGS, every footprint dressed by type, the fire station on its lot, kerbs parked out, real tree species, poles and lines, markings, fences, furniture. Street sheet in `envs/hollister-239/street.md` |

Each `envs/<id>/scenario.md` ends with the session's own judgement of what reads and what does not.

**Lessons the runs taught, and what changed because of them**

- The gallery page cannot read `map.json`, so the first street session inlined the data by hand. The pipeline now also writes `props/models/_data/<id>-map.js`, a module a model can load in Node and in the browser, and the gallery includes it.
- `C.prop` measured embedded models from their world bounding box, so a prop placed at a street's bearing came out 15% small. It now measures in the prop's own frame.
- Helpers such as `facade`, `eave` and `railing` were bound to the scene root, so an embedded building's windows landed loose at scene scale. Every embedded prop now gets its own bound api.
- Fifty-one flat prisms in one tonal range read as a single mass. `mapScene` now puts gable roofs on house-type footprints, uses nine wall tones and four roof tones, and darker sidewalks.
- Nominatim resolves "A & B" to a point on one street, not the intersection. The geocoder now tries variants and prefers a result naming both streets, and reports when it could not.
- Still missing, by the sessions' own account: figures for scale, roof shapes from OSM beyond gables, small dressing that survives the diorama camera, and a stair helper so a house can be one model.

## Not built yet

Parks and cities. The skill says what to do with them for now: a park as a map scene with trees and no buildings inside its polygon; a city as a set of street environments the caller tiles.

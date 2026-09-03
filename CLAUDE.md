# Two Forks: low-poly worlds in a Firewatch-dusk style

Two packages, one repo. Read `docs/HANDOFF.md` first for the state of the work and the lessons so far.

- `props/` builds single objects from one prompt (photos, links, Wikidata optional) into a validated model in a shared style: an Xbox controller, a MacBook, a house, cars, six palm species, a fire station. Style runtime, furniture and street catalog, validator with GLB/OBJ export, gallery, CLI, MCP server.
- `environments/` composes places from those pieces: home interiors from a household sheet, streets from a mapped location with real footprints, roads and USGS grade, dressed from a street sheet written off Street View captures. CLI and MCP server, meant to be driven by a larger city-generation process.

## Conventions that matter

- Models are code: `props/models/<id>.js` exports one def with `id, name, kind, units, scale, camera, colorways, notes, build(api)`. Only the helper API in `props/runtime/API.md` is used inside `build`. Flat normals, 5 to 12 segments, real units. Kinds: prop, vehicle, building, scene. Budgets in `props/runtime/style.js`.
- The style is fixed by `props/runtime/style.js` (palette, lights, sky, ridges, camera fit, weather) and `props/runtime/catalog.js` (furniture, street layer, map scene builder, palms, trees). Change the style there, never per model.
- The loop for any model: `node props/tools/validate.js <id> --export`, then `node props/tools/still.js <id>` and look at `props/dist/<id>.png` once, one fix pass, `node props/tools/build-gallery.js`. Don't build a screenshot loop; one look, one fix.
- Generated models carry provenance in `props/models/<id>.meta.json`. Scenes read map data from `props/models/_data/<id>-map.js` (Node `require` and browser global) so the gallery, which cannot fetch files, still works.
- Model policy for generation: props on claude-sonnet-5, buildings on claude-opus-5, vehicles on claude-fable-5-1 (`--model` overrides; `auto` is the default). Generation runs through the `claude` CLI on the subscription login by default (`PROP_BACKEND=api` uses the Anthropic SDK).
- Review surface: the gallery artifact at https://claude.ai/code/artifact/4d0d68f4-d71c-4266-ad60-76669961e660 is published from `props/dist/artifact.html`. From a new session, publish with that URL as `url` to update it rather than creating a new one.
- Work is staged and committed to `main`; commit only when asked.

## Quick start

```
cd props && npm install && npm run validate -- --export && npm run gallery && open gallery/index.html
node environments/bin/env.js build "build a street at 4th Street & Hollister Avenue, Santa Monica"
```

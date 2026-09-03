# Two Forks Props

Low-poly 3D props in a Firewatch-dusk style, built as code. The style is a fixed runtime; each prop is a short build script against a helper API, so anything built here lands in the same world with the same light, palette and framing.

The first four models came out of a review session: an Xbox controller, a MacBook Pro 14, a Santa Monica house with its side stairs and gate, and a Santa Monica apartment building. They double as fixtures for the validator.

## Quick start

```
npm install
npm run validate -- --export    # builds every model in Node, checks the contract, writes dist/*.glb and *.obj
npm run gallery                 # gallery/index.html (local), dist/gallery.html (single file), dist/artifact.html
npm run still -- controller     # dist/controller.png from the home camera, via headless Chrome
open gallery/index.html
```

Ask for a new prop from the command line. By default this runs through the `claude` CLI on your Claude subscription login; set `ANTHROPIC_API_KEY` (or `PROP_BACKEND=api`) to use the API instead:

```
node bin/prop.js build "vintage typewriter" --desc "1950s Olivetti Lettera 22, closed case" --ref refs/typewriter.jpg
```

That writes `models/vintage-typewriter.js`, validates it with one repair round, exports GLB and OBJ, rebuilds the gallery and renders a still.

## Layout

```
runtime/style.js     the style: palette, materials, sky, ridges, lights, camera, helper API
runtime/API.md       helper API reference
models/*.js          one file per prop; the contract is described in the skill
gallery/template.html   the review page; build-gallery fills in the scripts
tools/validate.js    contract checks and GLB/OBJ export, no display needed
tools/still.js       headless Chrome still of a model
tools/build-gallery.js
lib/generate.js      request -> Claude -> model file -> validate -> export -> still
bin/prop.js          CLI
mcp/server.js        MCP server exposing build_prop, validate_prop, list_props, render_still, build_gallery
.claude/skills/prop  the recipe and style rules, used by Claude Code sessions and by lib/prompt.js
```

## The contract

A model file registers one object with `id`, `name`, `kind` (`prop`, `vehicle`, `building`), `units`, optional `scale`, a `camera` block, `colorways` (a named set or an array), `notes`, and `build(api)`. The validator fails a model that throws, exceeds its triangle budget, has a non-finite bounding box or declares no colorway, and warns about framing that will clip or look small.

## Backends

- `claude-code` (default): shells out to `claude -p` with the skill as the system prompt, so it uses whatever login the CLI has, which is your subscription. Reference photos are read from disk by the session. Works from inside another Claude Code session too.
- `api`: the Anthropic SDK with `ANTHROPIC_API_KEY`. Photos are sent inline. Chosen automatically when the key is set. Override with `PROP_BACKEND`, pick the model with `PROP_MODEL`, point at a different CLI with `CLAUDE_BIN`.

## Scenes and the catalog

`runtime/catalog.js` holds about fifty furniture and fixture items plus a floor-plan builder, so a model of kind `scene` can compose an interior from a plan and a list of placements. The first experiment is the inside of the Santa Monica house, two levels, composed from a household sheet: see `../environments/envs/santa-monica-house/scenario.md` for the people, the plan, the results and what a home-environment tool would need. The `environments` package next to this one turns that process into a pipeline. Scenes can embed generated props at real size, which is how the garage gets its car.

## Animation

Models can animate: `api.onTick(fn)` runs `fn(t, dt, wind)` every frame for the active model, and the gallery has a Wind toggle next to Auto-turn. The six palm species use it: a jointed trunk bends toward the wind under a gusting envelope and every frond flutters. Ticks are exercised headlessly by the validator.

## Model policy

`--model` names a Claude; without it, or with `--model auto`, the tool picks by kind: props on Sonnet, buildings on Opus, vehicles on Fable. The choice is logged and stored in the provenance sidecar.

## Provenance

Every generated model gets a sidecar `models/<id>.meta.json` recording which Claude model built it (taken from the session's own init event, not the flag), the backend, elapsed seconds, attempts, turns, references and links, and the request. Pick the model with `--model claude-opus-5` (CLI), `model` (MCP) or `PROP_MODEL`. The gallery shows the provenance under the title; `prop list` prints it per model.

## Gallery

`gallery/index.html` lists models in a sticky sidebar grouped by kind, with a filter box for large sets and arrow-key navigation. The viewport is a fixed height with zoom in, zoom out and reset buttons; scroll and drag still work. `#<id>` in the URL opens a model directly.

## Progress and ETA

Every build logs its stage, elapsed time and an ETA to stderr, to `dist/<id>.build.log`, and as JSON to `dist/<id>.status.json`. The ETA starts from default stage times and switches to medians of your own past runs (kept in `dist/.timings.json`) after two builds. `prop status <id>` reads it; the MCP tool `build_status` returns the same. `build_prop` with `wait: false` starts a build in the background and returns a job id to poll.

## Links in requests

URLs in the name, description or `--url` are resolved before the build. Wikidata items and Wikipedia articles yield the label, description, real dimensions, the type (which sets `kind` if you gave none) and the Commons photo, downloaded into `refs/` as a reference image. Direct image links are downloaded too. Any other link is handed to the session, which can use WebFetch and WebSearch and download photos it finds with `tools/fetch-ref.js`. The API backend has no web tools, so only the pre-resolved sources help there.

## Three ways in

- **Claude Code**: type `/prop vintage typewriter` in this repo. The skill carries the recipe.
- **CLI**: `node bin/prop.js build ...` as above.
- **MCP**: `.mcp.json` registers the server for this repo. From another project: `claude mcp add two-forks-props -- node /path/to/two-forks-props/mcp/server.js`. Any MCP-capable agent can then call `build_prop`.

## Publishing the gallery

`dist/artifact.html` is a fragment ready for the Artifact tool. It loads three.js from cdnjs and inlines everything else, so it needs no other files.

## Limits

Hard-surface subjects work well. Organic subjects do not suit primitives; the skill says so and points to Blender. Exports carry flat colours per part, no UV layout, no rig; parts intersect rather than merge, which is fine for engines and wrong for 3D printing.

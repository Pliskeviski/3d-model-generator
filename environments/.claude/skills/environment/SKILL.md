---
name: environment
description: Compose a lived-in environment in the Two Forks style from one request: a home interior from a building and links, a street or block from a map location, later parks and cities. Use when asked to build an environment, interior, street, block or neighbourhood, or by the environment pipeline (bin/env.js).
---

# Composing an environment

An environment is one or more scene models (`kind: 'scene'`) built from a plan and catalog placements, plus a scenario document that explains who is there and why things are where they are. The style, materials, camera and validation are fixed by the runtime. You compose; you do not invent new rendering.

Your working directory is the parent folder holding `props/` and `environments/`. Read first: `props/runtime/API.md` (helper and catalog API), `props/models/santa-monica-home.js` (a complete home scene), `environments/envs/santa-monica-house/scenario.md` (the reference process and its findings).

## Always

1. **People before things.** Write `environments/envs/<id>/scenario.md` first: who lives or works here, income, work, hobbies, relationships, pets, habits. Then the traces those habits leave. This sheet decides the inventory; write it before placing anything.
2. **Plan in real metres.** Rooms as rectangles, walls as segments with door gaps, +z toward the street or camera. Write the plan into the doc as a text sketch and as comments in the model.
3. **Place from the sheet.** Every object should be explainable by a line in the scenario. Keep 0.8 m clear in front of doors, drawers and appliances; nothing inside a door swing; nothing overlapping.
4. **Validate, still, one fix.** `node props/tools/validate.js <id> --export`, then `node props/tools/still.js <id>` and Read `props/dist/<id>.png` once. Fix clipping, scale and read, validate again, stop.
5. **Manifest.** Write `environments/envs/<id>/manifest.json`: `{ "models": [ids], "docs": [paths], "subject": "what this environment is", "notes": "one paragraph on what reads and what does not" }`. The pipeline verifies every model listed.

## Home

- Exterior: use an existing building model if the request names one (its id in `props/models/`), else build it with `node props/bin/prop.js build "<name>" --kind building --url <link> --id <id>-exterior` and read its dimensions from the file.
- Levels: one scene per level (`<id>-home`, `<id>-garage`, ...) until there is a stair helper. Interior clear space is the exterior minus 0.25 m walls. Fit the plan to the real window positions.
- Walls at 0.8 to 0.85 m, camera `homePhi` about 0.6, `baseMin` about 26, scale 1.5 for metres.
- Catalog first; for a missing object either compose it from `api.box` and `api.cyl` inline or build it with `node props/bin/prop.js build` and embed it with `C.prop(def, x, z, rot, { length })`. Embedded props keep their own colours; state which axis their front is.

## Street or block

- The pipeline gives you `environments/envs/<id>/map.json`: buildings as polygons with heights, roads with widths, in metres with x east and z south. Read it and describe the place in the scenario doc: what kind of street, who lives and works on it, what time of day it is in this world (dusk). The same data is a module at `props/models/_data/<id>-map.js`; load it in the model with `var MAP = (typeof module !== 'undefined' && module.exports) ? require('./_data/<id>-map.js') : window.PROP_DATA['<id>-map'];` rather than inlining JSON.
- Build the base with `C.mapScene(map, { trees: 'palm'|'tree', skip: [ids] })`. Choose a scale so the diorama is 30 to 40 world units across: `scale = 36 / (2 * map.radius)`. Set `budget: 40000` on the model for a street.
- Subject: if the request names a building (address, link, existing model), find its footprint in the map (address tags or the footprint nearest the geocoded centre), skip it in `mapScene`, and embed the detailed model there with `C.prop(def, cx, cz, yaw, { length })`, rotated to face its road.
- Dress it from the catalog: parked cars along kerbs (`C.parkedCar`), lamps, a few figures of life such as bins by driveways or a bike against a wall. Keep the count modest; the base already carries most triangles.
- Camera: `pivotY` near 0, `homePhi` 0.55 to 0.65, `fitW` about 40, `baseMin` about 30.

## Street survey

When the request comes with street-level photos (Street View captures), write `environments/envs/<id>/street.md` before building, the way a home gets a household sheet: per street the markings, pole and lamp rhythm, parking density and grade; per lot the building style, fence type, trees with species, yard planting and furniture; and the landmarks to build as props with `node props/bin/prop.js build --ref <photo>`. See `environments/envs/hollister-239/street.md`. Put the per-lot choices in a lot table (ground, fence, tree, steps, mailbox, bins, drive side) and pass them to `C.yard(building, road, edge, { choices })`; unknown lots fall back to defaults by type. Then place from the sheet with the street layer of the catalog: `C.tree` (ficus, pine, coral, bottlebrush, magnolia), `C.utilityPole` and `C.powerLines`, `C.cobraLamp`, `C.hydrant`, `C.sign`, `C.curbBins`, `C.mailbox`, `C.fence` (slat, plywood, board, picket, block, chain), `C.hedge`, `C.grassTufts`, `C.frontSteps`, `C.drivewayApron`, `C.roadDetail` (kerbs, double yellow, painted names, crosswalks, manholes, red kerbs), `C.fillKerbs` (parked cars), `C.dressFootprint` (windows, balconies, soft-storey parking, porches by type) with `C.streetEdge` to find each building's street face. `map.json` carries `elevation` per road vertex and building and a fitted `ground` plane when the USGS service answered; `C.mapScene` uses them.

## Park, city

Not built yet. Treat a park as a street-type map scene with `trees: 'tree'` and no buildings inside the park polygon, and say in the manifest notes what helper is missing. A city is a set of street environments; produce one and describe the tiling.

## Do not

Do not modify `props/runtime/`, other models, or the tools. Do not run commands other than the props tools and `node props/bin/prop.js build`. Model files go in `props/models/`; everything else you write goes under `environments/envs/<id>/`. Do not leave placeholder or dummy lines in model files.

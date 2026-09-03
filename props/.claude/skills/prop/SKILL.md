---
name: prop
description: Build a low-poly 3D prop in the Two Forks (Firewatch dusk) style from a name, a description or reference photos. Use whenever someone asks for a 3D model, prop or building in this style, or to add a model to the gallery.
---

# Building a Two Forks prop

A prop is a small JavaScript file in `models/` that builds geometry against the helper API in `runtime/API.md`. The style is fixed by the runtime: sky, ridges, lights, palette, camera framing and materials. You only write geometry, so the result matches the gallery by construction.

## Fit check first

This recipe is strong for hard-surface subjects: electronics, furniture, vehicles, buildings, tools, packaging, props. It is weak for organic subjects: people, animals, plants, cloth. If the subject is organic, say so and offer a Blender route instead of forcing primitives.

## The recipe, in order

1. **Reference.** With photos: read proportions off them in real units and note them. Without: use the real object's known dimensions. Write them as a comment block at the top of the model file.
2. **Block-out plan.** Before any geometry, list every form as one line: what it is, how it is constructed, its measurements. Construction methods are: extrude a silhouette (things with a characteristic outline), lathe a profile (round things), stack primitives (mechanical detail), displace vertices (bends, droops, sloped tops). Windows, eaves and railings have helpers.
3. **Build.** Write `build(api)` following the plan. Keep segment counts between 5 and 12. Use real units and set `scale` on the model to bring it near 18 to 30 world units wide. Centre the model on the origin in x and z; recentre with `api.group.children` if a lot is asymmetric.
4. **Validate.** Run `npm run validate -- <id> --export`. Fix every error. Read every warning; most are framing problems that will show in the still.
5. **One look.** Run `npm run still -- <id>` and open `dist/<id>.png`. Check clipping at the frame edges, scale, that the subject reads at a glance, and that nothing glares. Make one fix pass, then stop. Don't loop on screenshots.
6. **Gallery.** `npm run gallery` rebuilds `gallery/index.html`, `dist/gallery.html` and `dist/artifact.html`. Publish `dist/artifact.html` with the Artifact tool to share it.

## Style rules

- Every mesh has flat normals. Use `api.box`, `api.cyl`, `api.cone`, `api.torus`, `api.disc`, `api.extrude`, `api.lathe`; they already flatten.
- Materials come from `api.M`. `M.face` and `M.shell` follow the colorway; the rest are fixed style. Make new ones with `api.mat(hex)` only when nothing fits.
- Choose the colorway set by subject: `props` for objects, `stucco` or `creamStucco` for buildings, or supply your own three entries with `face` and `shell`.
- One warm lit detail per model is welcome: a lit window pane, a glowing button, a screen. Use `M.lit` or `api.canvasMaterial`.
- No textures beyond canvas-drawn ones, no per-model lights, no shader code, no external files.
- Budgets: props about 3,500 triangles, vehicles 6,000, buildings 12,000. Window grids and railings add up fast; count before adding a second row of detail.
- Leave out everything that is not the subject: cars, people, trees, neighbours, street furniture, unless asked.

## Camera block

`camera: { pivotY, fitW, baseMin, homePhi, homeYaw, tilt }` in world units after `scale`.

- `pivotY`: the height the camera looks at, usually mid-height of the mass.
- `fitW`: the widest extent to keep in frame, including any base pad.
- `baseMin`: minimum camera distance. Raise it if the still shows clipping at the bottom.
- `homePhi`: camera elevation in radians. 0.18 to 0.24 reads like a street photo, 0.3 like a product shot.
- `tilt`: extra upward tilt in radians that drops the model in the frame to show more sky. 0.03 to 0.12.

## Scenes

A scene is a model of kind `scene` that composes an interior: floors and cut walls from a plan, then catalog items placed by `(x, z, rotation)`. Get the catalog with `var C = TwoForksCatalog.init(api)` (in Node: `require('../runtime/catalog.js')`). See `runtime/API.md` for the item list and `models/santa-monica-home.js` for a complete example. Start from a household sheet: who lives there decides the inventory and the traces of use; write it down in `docs/` before placing anything. Keep walls at 0.8 to 0.95 m and the camera at `homePhi` about 0.6. Embed another model at real size with `C.prop(def, x, z, rot, { length })`. Budget 24,000 triangles.

## Output contract

The file registers exactly one model whose `id` matches the file name. It must contain: `id`, `name`, `kind`, `units`, optional `scale`, `camera`, `colorways`, `notes` (one sentence on how it is built), and `build(api)`. Copy the wrapper line from `models/controller.js` so the file works in both the browser and Node.

# Helper API for `build(api)`

The runtime hands `build` one `api` object. Positions are in the model's own units; the model's `scale` maps them to world units. Y is up. The camera starts on the +z side, so +z is the front.

## Geometry (all return flat-shaded BufferGeometry)

| Call | Makes |
|---|---|
| `api.box(w, h, d)` | Box centred on the origin |
| `api.cyl(rTop, rBottom, h, seg=8)` | Cylinder or truncated cone along y |
| `api.cone(r, h, seg=5, open=false)` | Cone along y, base at −h/2 |
| `api.torus(r, tube, radialSeg=6, tubularSeg=10)` | Ring in the xy plane |
| `api.disc(r, seg=10)` | Flat circle facing +z |
| `api.plane(w, h)` | Flat quad facing +z, smooth normals |
| `api.shape()` | A new `THREE.Shape` to draw a silhouette with `moveTo`, `lineTo`, `quadraticCurveTo` |
| `api.roundedRect(w, d, r)` | A Shape: rounded rectangle centred on the origin |
| `api.extrude(shape, opts)` | Extruded along +z; `opts` are three's ExtrudeGeometry options (`depth`, `bevelEnabled`, `bevelThickness`, `bevelSize`, `bevelSegments`, `curveSegments`, `steps`). Material index 0 is the caps, 1 the sides |
| `api.lathe([[r, y], ...], seg=8)` | Revolve a profile around y |
| `api.displace(geo, fn)` | Calls `fn(x, y, z)` per vertex; return `[x, y, z]` to move it or `null` to keep it. Recomputes flat normals |

## Placing

- `api.part(geo, mat, x, y, z, rx, ry, rz, parent)` adds a mesh and returns it. `mat` can be an array for extrusions (`[M.face, M.shell]`). `parent` defaults to the model group.
- `api.sub(x, y, z, rx, ry, rz, parent)` makes a sub-group, for hinged or repeated assemblies.
- `api.group` is the model's root group. Its children can be shifted to recentre a model.

## Materials: `api.M`

`face`, `shell` follow the colorway. Fixed: `trim`, `dark`, `keys`, `stickTop`, `cream` (emissive), `a b x y` (face buttons), `glass` (dark plum), `lit` (warm emissive), `tile` (clay red), `roof` (built-up roof), `roofDark`, `pad` (concrete), `concrete` (lighter), `curb` (red), `grass` (dry), `door`, `groove`.

`api.mat(hex, emissiveHex)` makes another Lambert material. `api.canvasMaterial(w, h, draw(ctx, w, h), fallbackHex)` makes an unlit textured material from a canvas you draw; in Node it falls back to a flat colour.

## Architecture helpers

- `api.facade(L, W)` returns `{ slab, win }` bound to a block of length L (x) and width W (z) centred on the origin.
  - `slab(w, h, t, mat, face, u, yCentre, standoff, rx)` places a box flush on a face. `face` is `'+z'`, `'-z'`, `'+x'` or `'-x'`; `u` runs along the face; `standoff` is how far it stands off the wall; `rx` tilts it (for hoods).
  - `win(face, u, sill, w, h, rail)` places a trimmed window with sill, glass and optional meeting rail.
- `api.eave(len, wid, y, overhang, thick, tails)` puts a slab with a dark roof deck and a tile visor on four edges at height y; `tails` adds rafter tails every 0.9 units.
- `api.railing(x0, x1, z, y0, h, barPitch, thick, postEvery, midRail)` builds a bar fence along x at depth z.

## Utilities

`api.rand(seed)` gives a deterministic random generator. `api.THREE` is three.js r128. `api.PALETTE` has the six style colours.

## Catalog: `TwoForksCatalog.init(api)` returns `C`

Interior pieces in metres, placed as `C.item(x, z, rotation, options)` with the item's front along +z. `C.K` holds the shared materials (wood, fabric, linen, metal, leaf, rug colours).

- Plan: `C.floor(x0, z0, x1, z1, mat)`, `C.walls(segments, doors, { h, t, mat })` where segments are `[x0, z0, x1, z1]` and doors `{ x, z, w, axis: 'x'|'z', leaf, swing }`, `C.garageFront(x0, x1, z, bays, h, parent)`, `C.prop(def, x, z, rot, { length, yaw })` to embed another model scaled to a real length.
- Living: `sofa`, `armchair`, `beanbag`, `rug(x, z, rot, w, d, mat)`, `coffeeTable`, `sideTable`, `bookshelf`, `cubeShelf({ turntable })`, `floorLamp`, `plant({ size, leaves, seed, y })`, `dogBed`, `dogBowls`, `skateboard({ upright })`.
- Dining and kitchen: `diningTable`, `chair`, `stool`, `counter(x, z, rot, length)`, `sink`, `stove`, `fridge`, `fruitBowl(x, z, y)`, `mug(x, z, y, mat)`, `laptop(x, z, rot, y)`, `papers(x, z, rot, y)`.
- Bedroom: `bed({ w, l, blanket })`, `nightstand`, `dresser`, `wardrobe({ w })`, `bench`, `laundryBasket`, `shoes`, `backpack`, `legoBins`, `legoBuild(x, z, y)`, `toyBox`.
- Bath: `toilet`, `vanity`, `bathtub`.
- Studio and office: `desk({ w, d })`, `officeChair`, `monitor(x, z, rot, y, { w })`, `speaker(x, z, rot, y)`, `midiKeyboard(x, z, rot, y)`, `headphones(x, z, y)`, `micStand`.
- Entry: `shoeBench`, `coatRack`, `consoleTable`.
- Garage: `car({ color })`, `bike({ color, size })`, `surfboard({ len, mat, stripe, tilt })`, `workbench`, `shelvingUnit`, `ladder`, `washer({ dryer })`, `waterHeater`, `utilitySink`, `bins`, `boxes`, `cooler`.
- Streets: `footprint(polygon, height, { tone, roof, gable })`, `gableRoof(polygon, height)`, `road(polyline, width, { sidewalk, centreLine })`, `palm(x, z, options)`, `streetTree`, `streetLamp`, `parkedCar`, `mapScene(map, { trees, skip, roofs })`.
- Palms: `palm(x, z, { species: 'date'|'canary'|'fan'|'queen'|'coconut'|'pygmy', h, detail: 'low'|'high', skirt, fruit, lean, curve, seed, wind: { strength, dir } | false, leaf, trunk })`. Six species presets; the trunk is a chain of ring joints so wind bends it and every frond flutters about its base. Street palms use `detail: 'low'` (about 350 triangles).

## Animation

`api.onTick(fn)` registers `fn(t, dt, wind)` to run every frame while the model is active; `wind` is the world's `{ on, strength }` and the gallery's Wind button toggles it. The validator calls every tick twice headlessly, so animation code is exercised without a display. Keep ticks cheap: set rotations, do not rebuild geometry.

## Street layer

Placed in map metres, x east, z south. `tree(x, z, { species: 'ficus'|'pine'|'coral'|'bottlebrush'|'magnolia', h, seed, wind })`; `utilityPole(x, z, rot, { h, transformer })` returns a group whose `userData.top` feeds `powerLines([tops], { sag, wires })`; `cobraLamp(x, z, rot)`; `hydrant(x, z)`; `sign(x, z, rot, { kind: 'stop'|'parking'|'street' })`; `curbBins(x, z, rot)`; `mailbox`; `flagpole`; `fence(x0, z0, x1, z1, { style, h })`; `hedge(x0, z0, x1, z1, { h })`; `grassTufts(x0, z0, x1, z1, { n })`; `frontSteps(x, z, rot, { steps, w, rail })`; `drivewayApron(x, z, rot, { w, d })`; `roadDetail(polyline, width, { names: [{ text, at, across, flip }], crosswalks: [at], manholes: [at], redCurbs: [{ at, side, len }] })`; `fillKerbs(polyline, width, { spacing, density, gaps, seed })`; `dressFootprint(building, { type, streetEdge, inward, lit })`; `streetEdge(polygon, polyline)`; `isClockwise(polygon)`. `road()` and `mapScene()` accept per-vertex `elevation` and a fitted `ground` plane from the map layer and build the grade.

# Scenario: inside the Santa Monica house

An experiment in composing a lived-in interior for a building we only had the outside of. Everything below is fictional. The house is the two-storey stucco box over four garage doors at "2401", modelled earlier from a street photo: 12.6 m wide, 9 m deep, garage level at street grade, the home on the upper floor, entered from the side path behind the gate at the top of the stairs.

## 1. Who lives here

**The Okafor-Vance household**, four members including the dog. They bought the house in 2012, before prices ran away, on two ordinary salaries. It is comfortable, a little worn, and full.

| | | |
|---|---|---|
| **Nora Vance**, 44 | Senior sound designer at a mid-size game studio in Playa Vista. Works from home Tuesdays and Thursdays in the small back-corner room she turned into a studio. Runs the Ocean Park loop at six in the morning. Collects vinyl, about 700 records, mostly seventies soul and film scores. Keeps fourteen houseplants alive. | ~$165k |
| **Daniel Okafor-Vance**, 46 | Physics teacher at Santa Monica High. Surfs Bay Street at dawn on weekends, keeps two boards and a wetsuit in the garage. Cooks on cast iron and owns too many spices. Rides a commuter bike to school; the family shares one car, a 2016 Honda Fit. Restores old skateboards with his son on the garage workbench. | ~$88k |
| **Milo**, 11 | Sixth grade. Skateboards, one working deck and one in pieces. Builds Lego architecture sets on every flat surface. Reads comics in a beanbag. Wants a bunk for the dog. | |
| **Biscuit**, 9 | Terrier mix from the Santa Monica shelter. Sleeps in a bed by the record shelf in the living room, has a leash hook in the entry and bowls by the kitchen wall. | |

Household income about $253k before tax. Married since 2010. Nora's mother June visits from Portland twice a year and sleeps on the pull-out sofa, which is why the sofa is a big one.

**Taste, and what it puts in the rooms.** Mid-century walnut pieces inherited from Nora's parents (dining table, dresser), IKEA basics, a blue sofa bought in 2019, a rust armchair from a thrift store on Lincoln. Plants everywhere. Cast iron on the stove. Records in a cube shelf with the turntable on top. Nothing matches and everything is used.

**Daily life, and where it leaves traces.** Shoes by the door and a bike helmet on the bench. Milo's skateboard leaning by the entry opening. A record on the platter. Lab reports and a laptop on the dining table, Daniel grading. A Lego build half done on Milo's desk, backpack on the floor by his bed. Running shoes by the main bedroom door. Laundry baskets in the bathroom and bedroom. Headphones on Nora's desk. The wetsuit and boards in the garage, the second skateboard in pieces on Milo's floor.

## 2. The plan

Coordinates in metres, origin at the centre of the footprint, +z toward the street (front). Interior clear space 12.1 by 8.5 m. The front door is on the right side wall, reached by the exterior path, so there is no interior stair; the garage is a separate level below.

### Upper floor, the home

```
 z=-4.25 ─────────────────────────────────────────────────── back
        │ MAIN BEDROOM     │ BATH    │ MILO           │ STUDIO   │
        │ 3.65 x 4.25      │ 2.2x3.05│ 3.6 x 3.05     │ 2.65x2.65│
        │                  ├─────────┴───────────────┬┤          │
        │                  │ HALL 5.8 x 1.2          ││ ENTRY   ◄│ front door
 z=0    ├──────────────────┴──┐ ▒▒ ┌───────────────┐ ▒▒ ┌───────┤
        │ KITCHEN + DINING     open   LIVING ROOM                │
        │ 6.05 x 4.25                 6.05 x 4.25                │
 z=4.25 ───────────────────────────────────────────────────── street
       x=-6.05                x=0                          x=6.05
```

- **Living room** (right front, 25.7 m²): under the big three-pane window and the right window. Blue three-seat sofa facing the TV wall, walnut TV console, coffee table, rust armchair by the right window, cube shelf of records with the turntable along the right wall, tall bookshelf, floor lamp, two plants, Biscuit's bed, the skateboard leaning by the entry opening.
- **Kitchen and dining** (left front, 25.7 m²): open to the living room. L-shaped run under the two small front windows: cabinets, sink under the middle window, range with the skillet, fridge at the left wall. Walnut dining table with four chairs in the middle, laptop and lab reports on it. Dog bowls on a mat by the hall wall. Fruit bowl and a small plant on the counter.
- **Hall**: a runner rug. Doors to the main bedroom, bathroom and Milo's room; opening to the entry.
- **Entry** (right, 4.2 m²): front door on the side wall, doormat, shoe bench with three pairs and the helmet on top, coat rack in the corner, door into the studio.
- **Main bedroom** (left back, 15.5 m²): queen bed with the head on the left wall, plum blanket, two nightstands with lamps and a book, walnut dresser on the hall wall, wardrobe on the right wall, bench with folded clothes at the foot of the bed, laundry basket, plant, running shoes by the door.
- **Bathroom** (6.7 m²): tub with shower riser along the back wall, toilet on the left wall, vanity on the right wall, bath mat, laundry basket by the door.
- **Milo's room** (11 m²): single bed with the head on the back wall, desk and chair on the right wall with a lamp and the Lego build, three stacked Lego bins by the door, low bookshelf of comics on the back wall, rug, beanbag, toy box, backpack on the floor, the disassembled skateboard.
- **Studio** (7 m²): desk on the back wall with two monitors, two studio speakers, MIDI keyboard and headphones, office chair, mic on a stand, narrow shelf on the right wall, plant, rug.

### Garage level

One open space behind the four doors, 12.1 by 8.5 m, concrete floor.

- **Bay 1** (left): three bikes along the left wall, the two surfboards leaning on the back wall.
- **Bay 2**: the family hatchback, nose to the door. The generated Honda Fit model when present, else the catalog car.
- **Bay 3**: workbench on the back wall with the toolbox and a stool, metal shelving with bins, a cooler, Milo's bike near the door.
- **Bay 4** (right): washer and dryer on the right wall, water heater in the back corner, utility sink, laundry basket, stacked boxes, two recycling bins by the door, a ladder leaning on the right wall.

## 3. How it is built

The interior reuses the prop runtime and adds two things:

- `props/runtime/catalog.js`, a furniture and fixture catalog: about fifty items, each a small assembly of boxes and cylinders in the house style, placed by `(x, z, rotation)` with the item's front along +z. Plus a floor-plan builder: floors per room, walls from segments with door gaps, door frames and swung leaves.
- Scene models (`props/models/santa-monica-home.js`, `props/models/santa-monica-garage.js`) that are just a plan and a list of placements. A scene is a model of kind `scene`, so it goes through the same validator, gallery and exporter.

Walls are cut at 0.95 m, dollhouse style, so rooms read from a raised camera. Furniture keeps full height.

## 4. Results

| | Home level | Garage level |
|---|---|---|
| Rooms | 7 plus hall and entry | 1 open space, 4 bays |
| Placements | 71 catalog calls | 22 catalog calls plus the embedded car |
| Triangles | 8,936 | 4,916 with the Honda Fit embedded |
| Parts | 400 meshes | 197 meshes |
| Stills | `props/dist/santa-monica-home.png` | `props/dist/santa-monica-garage.png` |

Both validate clean and export to GLB and OBJ. Open `props/gallery/index.html#santa-monica-home` to turn them.

## 5. Judging the work

**What reads at a glance.** Every room is identifiable from the home camera without labels: kitchen run with the range and the fruit bowl, dining table with the laptop and papers, blue sofa on the red rug facing the TV, the lit floor lamp, the dog in its bed, records along the right wall, the plum bed with both lamps lit, the tub with its riser, Milo's blue bed and stacked Lego bins, the studio desk with monitors and speakers, the coat rack and shoe bench by the open front door. The persona traces landed: laptop and papers on the table, skateboard by the entry opening, running shoes by the bedroom door, baskets in bath and bedroom, the Lego build on the desk.

**What does not read well.**
- *Thin things vanish.* Bikes, the mic stand, the ladder and the shower riser are lines from this height. Low-poly scenes seen from above need chunkier proxies: thicker tubes, or a wheel disc instead of a torus.
- *Windows are gone.* The cutaway keeps walls at 0.8 m and the windows sit above that, so the interior has no visible relationship to the front elevation it was designed around. A scene needs window markers on the cut wall (a sill strip or low frame) so the plan reads against the exterior.
- *Warm light flattens whites.* The dusk key light turns cream cabinets and the fridge peach and pushes the tile floor toward the wood. Interiors want a cooler fill or a slightly desaturated palette for whites.
- *No sky.* The dollhouse angle looks down past the horizon, so the backdrop is dark ground and the pine ring. The style survives through palette and lighting, but the sunset that carries the props gallery is absent. A lower camera would restore it at the cost of occlusion from the near walls.
- *Scale has no anchor.* Without a person in the scene the eye guesses scale from the sofa. One or two low-poly figures would fix it.
- *Two scenes instead of one house.* There is no interior stair, so the levels are separate models. Real composition wants one building with levels you can peel.

**Embedding the generated car taught two rules.** Embedded props must get their own face and shell materials, or they take the scene's colorway; the first render put a stucco-coloured Honda Fit in the garage. And every prop needs a declared front: the Fit came in facing the back wall because the scene assumed one convention and the generated model used another. The catalog's `prop()` now gives embedded models their own slots with colour overrides, and the doc for a prop should state which axis is its front.

**What I got wrong the first time.** The camera was too far and too high, leaving the house small in a field of dark ground; fixed by bringing the minimum distance in and lowering the walls to 0.8 m. I also left a placeholder line in the model while sketching and had to remove it.

## 6. What a home-environment tool needs

The experiment suggests a pipeline in five layers, only the first of which is creative:

1. **Household → inventory.** A persona sheet (people, income, work, hobbies, pets, habits) turned into a room-by-room list of objects *and traces* (what is out because someone just used it). This step decided almost everything about the result and it is pure text, so it is the cheapest place to spend the model's attention.
2. **Plan.** Rooms as rectangles, walls as segments, doors and windows as openings with swing. Deterministic builder, already in `runtime/catalog.js`. The exterior and interior must come from the same plan so windows line up; today the interior was fitted to a hand-made exterior.
3. **Placement by intent, not coordinates.** I placed seventy items by hand-typed metres and checked collisions in my head. A tool needs a solver: "sofa against the wall opposite the TV wall", "nightstand each side of the bed", "keep 0.8 m clear in front of doors and drawers". Anchors and clearances, resolved to coordinates, with collision and door-swing checks in the validator.
4. **Catalog with a fallback.** About fifty items covered this house. Missing items should fall back to `prop build` with the model policy (simple props on Sonnet, complex on Opus, vehicles on Fable) and be embedded at real size, as the garage does with the generated car.
5. **Review loop.** Validate, still, one look, one fix. It caught the framing here. It should also render a top-down plan view for checking placement, which is easier to judge than the three-quarter view.

For streets and cities the same layers repeat one level up: a block persona (who lives on this street), lots as the plan, buildings placed by intent, and the props gallery as the catalog.

# Scenario: Hollister Avenue, Ocean Park

A block of Ocean Park, Santa Monica, composed from OpenStreetMap footprints and dressed from the catalog.
The street layout, the buildings and the roads are real and come from `map.json`. **Everyone in section 2 is
invented**, and so is every object placed in section 5; they exist to decide what goes where.

## 1. The place, and one honest correction

The request asked for **4th Street & Hollister Avenue**. The geocoder resolved "Hollister Avenue" to the
midpoint of OSM way 13444810, which is the stretch of Hollister **between 5th and 6th**, and pulled a 110 m
disc around that point: 53 buildings, 17 road segments. 4th Street is the west end of that same way, at
u = −136 m in the street frame below — one block beyond the edge of the disc. So this diorama is the block
*east* of the corner that was asked for, looking west toward it. The camera faces down Hollister toward 4th,
the beach and the sunset; everything from 4th westward is off the disc and is not modelled.

What the map actually holds, once you turn it so Hollister lies flat:

- **Hollister Avenue**, 8 m kerb to kerb, one lane each way, parking both sides, 1.6 m walks. It runs
  ENE–WSW, bearing −38.8° in the map frame; the whole scene is built in a street frame rotated by that
  angle, so u runs along Hollister and v runs across it.
- **5th Street** crosses at u = −30.8, **6th Street** at u = +72.1. Both are the same 8 m residential
  section. Two 4 m service alleys run behind the blocks at the north and south edges of the disc.
- **53 buildings**, tagged 3.0 to 11.9 m tall. Twenty-two are `apartments`, sixteen `house`, twelve
  `residential`, one `retail` (at the far northwest corner, 107 m out). That mix is the neighbourhood in one
  line: 1900s–1920s beach bungalows on 30 m lots with 1950s–60s stucco apartment blocks dropped between them.
- The north side of the block is dense and continuous; the **south side between 5th and 6th is nearly empty
  in OSM** — one small 3.7 m structure at u = +37 and nothing else. Either the mapper never traced it, or
  those lots really are garages and back yards off the alley. Either way the diorama has an open near side,
  which is where the camera looks over.

The ocean is about 600 m west, straight down Hollister. It is **dusk on a Tuesday in early September**,
about 19:40: sun already behind the water, bins out at the kerbs for Wednesday collection, every car home.

## 2. Who lives on this block

**North side — the far row from the camera.**

| | | |
|---|---|---|
| **Teo Adrián**, 66, and **Marisol Cruz**, 62 | The stucco box over four garage doors, mid-block (OSM 440296171). Bought it in 1989 on one city salary. Teo retired out of Santa Monica's water division and rebuilds outboard motors in the second garage bay; Marisol cuts hair at a two-chair shop on Main Street four days a week. Two of the four bays are rented to neighbours at $180 a month, which is why there is never a car in the driveway and always two at the kerb. | ~$74k pension and shop |
| **Bev Larkin**, 79 | The 1911 bungalow next door west (OSM 440296221), hers since 1971. Widowed in 2004. Clips the boxwood hedge along her front walk herself, badly, twice a year. Her Buick has not moved since the eye appointment in July. | fixed income |
| **The Sotelo brothers**, 24 and 27 | Unit 6 of the eight-unit courtyard building at the east end (OSM 440296310), the zigzag footprint around a paved court. Both work mornings — one at a coffee bar on Main, one framing houses in Mar Vista — and surf Bay Street after. Boards live against the court wall because the unit has no storage. | ~$41k each |

**South side — the near row.**

| | | |
|---|---|---|
| **Kelsey Ohara**, 34, and **Dev Raman**, 36 | Second-floor rear of the 1962 stucco block west of 5th (OSM 439420816), twelve units, rent-controlled, $2,150 for a one-bedroom they could never re-rent at. Kelsey teaches third grade at the school two blocks north; Dev mixes dialogue at a post house in Culver City and rides to the Expo Line rather than pay to park there. Their bikes are on the rail by the entry because the bike room floods. | ~$149k |

**The block's shared habits, and the traces they leave.** Bins go out Tuesday after dinner and stand at the
kerb overnight — the Adrián-Cruz pair at the mouth of the garage run, the flats' pair at the driveway. The
block parks out by seven: three cars along each kerb of Hollister and two more round the corner on 5th,
all of them facing the way they drove in. Somebody's kid skates the block until it is properly dark and
leaves the deck on the verge. A surfboard leans in the courtyard, still wet. Bev's hedge and the flats'
low front wall are the only two things on the block anybody edges or paints.

## 3. The plan

Street frame in metres: **u** along Hollister, +u east toward 6th; **v** across it, +v to the south side,
which is the side the camera stands on. Origin on the Hollister centreline at the map centre. The model
converts (u, v) back to map coordinates with a −38.8° rotation, so everything below is also what is written
in the model file.

```
   u:  -136        -72         -30.8        0          +37        +72
        │           │            │          │           │          │
       4th St    OHARA/RAMAN    5th St                            6th St
      (off disc)   FLATS ▓▓ (embedded `apartments`, u -70..-49, v 12..22)
                       wall ▒▒▒▒▒   bins▪
 v=+5.6 ───────────────── sidewalk ──────────────────────────────────────
 v=+2.9        ▄▄ east ▄▄        ▄▄ east ▄▄        ▄▄ east ▄▄
 v= 0   ══════════════════ HOLLISTER AVENUE ═════════════════════════════
 v=-2.9              ▄▄ west ▄▄        ▄▄ west ▄▄        ▄▄ west ▄▄
 v=-5.6 ───────────────── sidewalk ──────────────────────────────────────
 v=-9                  ▒hedge▒     ▪bins   ▫board          ▌surf
 v=-12          BEV LARKIN     ADRIÁN-CRUZ HOUSE ▓▓        SOTELO COURT
 v=-21          bungalow       (embedded `house`, u -17..+2)  (zigzag, OSM)
```

- **Roads.** Hollister, 5th, 6th and two alleys, drawn from the OSM polylines clipped to a 118 m disc so
  they stop at the edge of the ground slab instead of running 400 m off it. 8 m carriageway, 1.6 m walks,
  fan palms and lamps on the verges every 14 m.
- **Buildings.** All 53 footprints extruded to their tagged heights, except the two lots that carry
  detailed models.
- **The Adrián-Cruz house** (OSM 440296171, 16.6 × 8.7 m in the street frame): the existing `house`
  model, front to the street at u = −7.7, v = −16.0, 19.5 m across including its driveway pad. Its front
  is +z, so it faces +v, straight at the camera.
- **The Ohara-Raman flats** (OSM 439420816, 27.7 × 10.6 m): the existing `apartments` model at
  u = −59.1, v = +16.8, scaled to 26 m so its 12 m depth matches the lot, turned 180° so its two street
  entrances face Hollister. It is on the camera's side of the street, so what reads from the home view is
  its back window wall, eave and penthouse.

Clearances: no car within 3 m of an intersection mouth, no bin or hedge within 4 m of a palm, nothing on
the carriageway, nothing inside another footprint.

## 4. Inventory, and the line that puts it there

| Placed | Where (u, v) | Because |
|---|---|---|
| `house` model | −7.7, −16.0 | Teo and Marisol's four-bay house, the hero of the block |
| `apartments` model | −59.1, +16.8 | Kelsey and Dev's rent-controlled block |
| 3 cars, south kerb, facing east | +6, +34, −22 at v +2.9 | the block parks out by seven; right-hand traffic, so the south kerb faces east |
| 3 cars, north kerb, facing west | −12, +18, +46 at v −2.9 | same, the other way; the one at −12 is the nephew who rents a garage bay and still parks outside it |
| 2 cars on 5th Street | ±2.9 either side of u −30.8 | the overflow round the corner; Bev's Buick is the one facing south |
| Bins, Adrián-Cruz | +2.0, −4.4 | Tuesday night, out at the kerb by the garage run |
| Bins, the flats | −50, +4.4 | twelve units, one pair, always at the driveway mouth |
| Bike | −51, +11.0 | Dev's commuter, at the rail by the entry because the bike room floods |
| Surfboard | +28.5, −10.5 | a Sotelo board against the courtyard wall, still wet |
| Skateboard | −9.0, −6.2 | left on the verge outside the drive |
| Boxwood hedge, 3 lengths | −58 to −50 at v −9.6 | Bev's, clipped badly twice a year |
| Low stucco wall | −71 to −54 at v +9.2 | the flats' front wall, painted over twice this year |
| 2 yard palms, 2 street trees | −62/−40 and +20/−20 | the trees the block planted itself, off the verge line |

## 5. How it is built

One model, `props/models/ocean-park-4th-hollister-street.js`, kind `scene`, budget 40,000, scale 0.164 so
the 220 m disc is 36 world units across. It holds:

1. The pruned map as a literal — the browser gallery cannot read `map.json`, and the style rules forbid
   external files, so the 53 polygons and the five drivable ways are inlined, footways dropped (`mapScene`
   skips them anyway) and the ways clipped to 118 m.
2. `C.mapScene(map, { trees: 'palm', skip: [...], ground: M.face })` for the base: ground, roads with
   sidewalk bands, extruded footprints, palms and lamps.
3. Two `C.prop` embeds and about twenty catalog placements, all written in street coordinates and
   converted to map coordinates by the model.

Two things had to be worked around, and they are worth writing down because they will bite the next street:

- **`C.prop` measures the embedded model after the placement rotation.** It takes a world-space bounding
  box, so a model dropped in at 38.8° measures 15% wider than it is and comes out 15% small. The fix is to
  place it into an unrotated holder group and rotate the holder afterwards.
- **`api.eave`, `api.railing` and `api.facade` add their meshes to the model root, not to the group the
  embedded prop is building into.** They were bound before `C.prop` swapped in its own `part`. Left alone,
  `house`'s stair gate and all ninety of `apartments`' windows land loose at the scene origin at 1:1 metres.
  The fix is to adopt whatever appeared at the root during the embed into the prop's inner group. A
  consequence: those adopted parts keep the *scene's* `M.shell`, not the prop's, so the scene colorways are
  cream stucco tones and the ground gets `M.face`.

## 6. What reads and what does not

19,404 triangles of a 40,000 budget, 39.9 × 42.5 world units. Judged from the one look at
`props/dist/ocean-park-4th-hollister-street.png`.

**Reads.** The place is legible as a street grid at a glance: Hollister runs across the middle of the frame
with 5th and 6th crossing it, the carriageways and their pale sidewalk bands hold their shape at 0.164
scale, and the palm line marks both verges. The two embedded models do the job they were put there for —
they are the only two objects in the frame with windows, and the eye goes to them: the flats' red tile eave
and window grid at the west end, the house's shed roof, side gate and lit pane at the centre. The parked
cars are the thing that makes the road read as a road rather than a black ribbon; six specks of colour on
the asphalt do more for scale than anything else placed.

**Does not read.**
- *Flat tops.* Fifty-one buildings are prisms with flat roofs, all drawn from the same five-tone wall
  palette, so the block reads as one mauve mass rather than as separate houses. Ocean Park is nearly all
  gables and hips; the map has no roof shape. A `mapScene` option to hip or gable any footprint under, say,
  8 m — and a wider tonal spread — would fix the whole neighbourhood at once, and matters more than any
  amount of dressing.
- *The sidewalks are the loudest thing in the frame.* `C.road`'s sidewalk band is `K.floorTile`, which under
  the dusk key is brighter than every building and every roof. The grid reads beautifully because of it,
  but the graphic weight is in the pavement, which is not where it belongs.
- *Small dressing disappears.* The skateboard, the bike, the bins, the hedge and the surfboard are 0.1–0.2
  world units and are not visible at the home camera. They are correct and they are all justified by the
  sheet, but street dressing has to be chosen for silhouette at 0.16 scale — bins in a row, a van, a
  dumpster — not for the story.
- *No people, again.* Same finding as the house interior, and worse outdoors: nothing in the frame is
  person-sized except the cars.
- *The near side is empty because OSM says so.* The bottom third of the frame is bare ground: the south
  side of the block between 5th and 6th has one traced structure. Truthful, but it costs the composition
  its foreground, and no amount of camera work hides it.
- *The ground took two goes.* Driving the ground plane off `M.face` is right — it makes the vacant lots and
  verges a colorway choice — but the first pass used a dry-lawn olive that the warm dusk key pushed to
  bright orange across a 242 m slab, and it swallowed the whole scene. The colorways are now dark earth
  tones, and the buildings sit on top of them instead of drowning.
- *4th Street is not in the frame.* The disc is centred a block east of the corner that was asked for.

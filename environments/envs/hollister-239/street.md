# Street sheet: Hollister Avenue at 239, Ocean Park

A survey of one block from four Street View captures (September 2025, marine layer), used to place what OpenStreetMap does not know. Coordinates are the map frame: metres, x east, z south, origin at 239. Hollister runs south-west to north-east through the origin; the ocean is down the hill to the south-west.

## The street itself

- Two lanes, 8 m kerb to kerb, parking both sides, nose to tail. Double yellow centre line. "Hollister Ave" painted on the asphalt in each direction. Crosswalk bars at 3rd Street. One manhole near the centre. STOP painted at the 3rd Street approach.
- Kerbs are concrete with a gutter; a red no-parking kerb runs the length of the fire station apron. Driveway aprons cut through the kerb at every house and at the station.
- Grade: the street falls toward the ocean. Elevation from USGS gives the actual slope; the scene tilts to it.
- Sidewalks on both sides with a planted parkway strip: grasses, succulents, mulch, a few young trees in cut-outs.
- Overhead lines on wooden poles along the north-west side, roughly every 35 m, with crossarms; a transformer on one. Cobra-head streetlights on tapered metal poles, alternating sides, about every 45 m.

## Trees, the real ones

- Parkway trees every 10 to 15 m: round dense crowns 7 to 9 m tall, ficus and carrotwood.
- At 239 itself: a huge Aleppo pine, trunk leaning toward the street, umbrella crown over the sidewalk and the parked cars, about 13 m.
- In front of the beige apartment block opposite: a coral tree, spreading, red flowers.
- Bottlebrush in the bungalow yards. A few Mexican fan palms behind the lots to the south-west, visible above the roofs, and a queen palm by the white apartment block.

## Buildings, by type and where they stand

- **239** (subject): small white stucco house, single storey, hidden behind the pine. Driveway on the right with a trash bin, a low planted strip, front steps.
- **Grey craftsman bungalow** next door to the south-west: horizontal siding, porch with a gable, black metal handrails on the steps, planted parkway, a black slat fence and a bare plywood fence on the property line.
- **Green craftsman** beyond it: gable, bay windows, white trim.
- **White three-storey apartment block** further south-west with a queen palm.
- **Beige stucco apartments** opposite, three storeys, balconies with railings on every floor facing the street, soft-storey parking underneath, a coral tree in the parkway, an orange-stained board fence at the lot line, a yellow Jeep in the driveway.
- **Fire Station No. 2** opposite, north-east of the apartments: red brick, three glass roll-up doors with yellow frames, lettering band, flagpole, a bench, a red kerb, a gated parking lot with a rolling gate and a hedge on its west side.
- **Yellow two-storey house** beside the station: gable roof, shingle, yellow trim.
- **White modern stucco houses** on the south-east side toward 4th: flat roofs, dark horizontal slat fences, plywood hoarding on one.

## Furniture and traces

- Yellow hydrant on the station side. Stop sign at 3rd. Parking signs on poles. Blue recycling and black trash bins at kerbs on collection day. A mailbox by the bungalow. A bench by the station.
- Cars: SUVs and hatchbacks, a Prius, an Audi wagon, a Fiat 500, a Jeep. Every kerb space taken.

## Lot table, as the scene reads it

Buildings that face Hollister are sorted along each side and anchored on 239 (north-west side) and the fire station (south-east side). Each known lot gets explicit choices; everything else falls back to defaults by type.

| Lot | ground | fence at sidewalk | yard tree | steps | mailbox | bins at kerb | drive |
|---|---|---|---|---|---|---|---|
| White apartments, 3 to the SW | gravel | hedge | none (queen palm placed by hand) | | | | |
| Green craftsman | lawn | hedge | bottlebrush | yes | yes | | |
| Grey craftsman bungalow | dry grasses | none | none | yes | yes | yes | right |
| 239 | gravel | none | none (the pine is placed by hand) | | | yes | left |
| Modern white house | gravel | dark slat | none | | | | |
| House behind hoarding | concrete | plywood | none | | | | |
| Beige apartments (opposite) | gravel | orange board | none (coral tree by hand) | | | yes | right |
| Yellow two-storey house | lawn | picket | bottlebrush | yes | yes | | |

## What a survey step would automate

Given screenshots like these, a session should fill this sheet: per lot the building style, fence type, trees and their species, and street furniture; per street the markings, poles and lamp rhythm; and the landmarks to build as props. The sheet then drives placement the way the household sheet drives an interior.

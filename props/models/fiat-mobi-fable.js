// Fiat Mobi (2016-) A-segment city hatchback, Betim, Brazil. Units are centimetres, shown at 0.075 scale.
// Reference: refs/fiat-mobi-fable-wikidata.jpg (Wikimedia Commons, dark blue Mobi in a showroom, front 3/4)
// and Wikidata Q23837806.
//   length 356.6, width 163.3, height 149.0            (trusted, Wikidata)
//   wheelbase ~230.5, front overhang ~66, rear ~60      (front axle z +112, rear axle z -118.5)
//   tyre 175/65 R14: radius ~29, width ~17.5, track ~142 (wheel centres x +-71)
//   ground clearance ~21, beltline ~90, hood leading edge ~72, cowl ~90, roof crown 148
//   from the photo: tall boxy greenhouse with a strongly raked windshield and slight tumblehome,
//   short high hood, teardrop headlights wrapping the front corners either side of a slim grille
//   with a round badge, big dark lower intake with fog-lamp recesses, black plastic lower lip,
//   flat flanks with black door handles, small steel wheels with grey hubcaps, near-vertical hatch
//   with tall vertical taillights.
//
// Block-out plan:
//   lower body    - extrude a side-profile silhouette (bumper, hood, beltline plateau, tail, sill with
//                   two wheel-arch notches) across the width, bevelled; rotated so the sweep is x;
//                   vertices displaced to taper the nose and tail in plan (rounded corners)
//   cabin         - second, narrower side-profile extrude (windshield, roof, hatch glass) with a
//                   10 cm bevel for the rounded roof edge; displaced for tumblehome (sides lean in)
//   side glass    - one extruded quad silhouette per side on the leaning cabin face, plus a dark
//                   B-pillar strip; windshield and rear window are tilted thin boxes
//   wheels x4     - dark tyre cylinder (12 sides), grey rim (8), trim hub (6), axis along x;
//                   dark liner boxes inside the body close the arch tunnels
//   front end     - wrapped headlight boxes (M.lit, the one warm detail), grille slot, red badge,
//                   dark lower intake, fog recesses with trim discs, dark lower lip
//   rear end      - tilted taillight boxes, cream plate, dark bumper; antenna at the roof front
//   trim          - mirrors on stalks, door handles, three door-seam strips per side
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'fiat-mobi-fable',
  name: 'Fiat Mobi (Fable 5.1)',
  kind: 'vehicle',
  units: 'cm',
  scale: 0.075,
  camera: { pivotY: 5.5, fitW: 30, baseMin: 38, homePhi: 0.22, homeYaw: -0.5, tilt: 0.06 },
  colorways: 'props',
  notes: 'Lower body and cabin are two bevelled side-profile extrusions swept across the width (arches notched into the sill), with vertex displacement for the plan taper of the nose and the tumblehome of the cabin; glass, wheels, lights and bumpers are boxes and low-sided cylinders.',
  build: function (api) {
    var M = api.M, part = api.part, PI = Math.PI;
    var RIM = api.mat(0xBDB6AE);
    var FRONT_AXLE = 112, REAR_AXLE = -118.5, TRACK = 71, LEAN = 0.131; // cabin lean angle, atan(0.10 * 79 / 60)

    // sweep helper: profile drawn as (shape-x = -world z, shape-y = height), extruded along the width,
    // centred, then rotated so the extrude axis becomes world x
    function sweep(shape, depth, bevelT, bevelS, segs) {
      var g = api.extrude(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevelT, bevelSize: bevelS, bevelSegments: segs, curveSegments: 3, steps: 1 });
      g.translate(0, 0, -depth / 2);
      g.rotateY(PI / 2);
      return g;
    }

    // ---- lower body: 162 wide at the door panels, nose and tail tapered in plan
    var b = api.shape();
    b.moveTo(-170, 21);
    b.quadraticCurveTo(-180, 30, -178, 46);          // front bumper bulge
    b.lineTo(-177, 58);
    b.quadraticCurveTo(-175, 68, -168, 72);          // upper bumper to hood leading edge
    b.quadraticCurveTo(-118, 82, -64, 90);           // hood up to the cowl
    b.lineTo(172, 90);                               // beltline plateau under the cabin
    b.quadraticCurveTo(178, 88, 178, 70);            // tail top round
    b.lineTo(178, 52);
    b.quadraticCurveTo(182, 38, 176, 25);            // rear bumper bulge
    b.lineTo(170, 21);
    b.lineTo(152.5, 21);
    b.quadraticCurveTo(152.5, 61, 118.5, 63);        // rear wheel arch
    b.quadraticCurveTo(84.5, 61, 84.5, 21);
    b.lineTo(-78, 21);
    b.quadraticCurveTo(-78, 61, -112, 63);           // front wheel arch
    b.quadraticCurveTo(-146, 61, -146, 21);
    b.lineTo(-170, 21);
    var body = sweep(b, 154, 4, 3, 2);
    api.displace(body, function (x, y, z) {
      var f = 1, t;
      if (z > 90) { t = (z - 90) / 90; f -= 0.22 * t * t; }
      else if (z < -128) { t = (-128 - z) / 52; f -= 0.10 * t * t; }
      return f === 1 ? null : [x * f, y, z];
    });
    part(body, [M.face, M.shell], 0, 0, 0);

    // ---- cabin: 158 wide at the door tops, leaning in 10% by the roof; 10 cm bevel rounds the roof edge
    var c = api.shape();
    c.moveTo(-62, 84);
    c.lineTo(-18, 136);                              // windshield / A-pillar
    c.quadraticCurveTo(-13, 142, -2, 143);
    c.lineTo(128, 143);                              // roof
    c.quadraticCurveTo(162, 140, 168, 108);          // hatch glass
    c.lineTo(166, 82);
    var cabin = sweep(c, 138, 10, 4, 2);
    api.displace(cabin, function (x, y, z) {
      var t = Math.min(1, Math.max(0, (y - 88) / 60));
      return t ? [x * (1 - 0.10 * t), y, z] : null;
    });
    part(cabin, [M.face, M.shell], 0, 0, 0);

    // ---- glass: windshield and rear window are tilted slabs offset off the cabin's mid surface
    part(api.box(124, 48, 2.5), M.glass, 0, 115.4, 43.4, -0.72, 0, 0);
    part(api.box(112, 33, 2.5), M.glass, 0, 123.4, -165.3, 0.50, 0, 0);

    // side glass: one silhouette per side (front door, rear door and quarter light), centred on
    // (shape-x 48, y 114) so it can be placed on the leaning door-top plane; B-pillar strip on top
    var gs = api.shape();
    gs.moveTo(-98, -20); gs.lineTo(-64, 19); gs.lineTo(98, 19); gs.lineTo(106, -2); gs.lineTo(104, -20); gs.lineTo(-98, -20);
    var glass = api.extrude(gs, { depth: 1.6, bevelEnabled: false, steps: 1 });
    glass.translate(0, 0, -0.8);
    glass.rotateY(PI / 2);
    [1, -1].forEach(function (side) {
      var gx = side * 76.5;
      part(side > 0 ? glass : glass.clone(), M.glass, gx, 114, -48, 0, 0, side * LEAN);
      part(api.box(1.6, 40, 8), M.dark, side * 77.4, 114, -4, 0, 0, side * LEAN);
    });

    // ---- wheels: tyre, rim, hub with axis along x; dark liners close the arch tunnels
    function wheel(x, z) {
      part(api.cyl(29, 29, 17.5, 12), M.dark, x, 29, z, 0, 0, PI / 2);
      part(api.cyl(17, 17, 18.5, 8), RIM, x, 29, z, 0, 0, PI / 2);
      part(api.cyl(5.5, 5.5, 19.5, 6), M.trim, x, 29, z, 0, 0, PI / 2);
    }
    [FRONT_AXLE, REAR_AXLE].forEach(function (z) {
      wheel(TRACK, z); wheel(-TRACK, z);
      part(api.box(124, 40, 64), M.dark, 0, 41, z);
    });

    // ---- front end. The swept mid section stands 3 cm proud of the profile, so the nose face at
    // headlight height is near z 177 and leans back about 0.7 rad; the bumper bulge reaches z 181.
    [1, -1].forEach(function (side) {
      part(api.box(26, 10, 5), M.lit, side * 50, 68, 176.6, -0.7, 0, 0);      // headlight on the nose
      part(api.box(5, 8, 12), M.lit, side * 69.3, 66, 166, 0, -side * 0.33, 0); // its wrap round the corner
      part(api.box(16, 11, 4), M.dark, side * 50, 35, 180.5);                 // fog-lamp recess
      part(api.disc(3.5, 8), M.trim, side * 50, 35, 182.7);
    });
    part(api.box(52, 7, 4), M.dark, 0, 65.8, 178.4, -0.7, 0, 0);              // grille slot
    part(api.cyl(4.5, 4.5, 1.6, 8), M.b, 0, 67.5, 180.4, 0.86, 0, 0);         // badge
    part(api.box(66, 14, 4), M.dark, 0, 37, 181);                             // lower intake
    part(api.box(122, 7, 10), M.dark, 0, 20, 176);                            // lower lip

    // ---- rear end (rear face near z -181 at bumper height, -179 up at the hatch)
    [1, -1].forEach(function (side) { part(api.box(14, 34, 4), M.b, side * 62, 74, -181, 0.12, 0, 0); });
    part(api.box(34, 12, 1.5), M.cream, 0, 52, -182.2);                       // plate
    part(api.box(130, 10, 8), M.dark, 0, 25, -179);                           // rear bumper
    part(api.cyl(0.7, 0.7, 16, 6), M.dark, 0, 152, -6);                        // antenna

    // ---- side trim: mirrors on stalks, door handles, door seams
    [1, -1].forEach(function (side) {
      part(api.box(7, 2.5, 5), M.dark, side * 80.5, 97, 52);
      part(api.box(11, 8, 8), M.dark, side * 87, 100, 50);
      part(api.box(9, 2.5, 2), M.dark, side * 82.2, 78, 0);
      part(api.box(9, 2.5, 2), M.dark, side * 82.2, 78, -80);
      [62, -6, -78].forEach(function (z) { part(api.box(1.2, 66, 1.4), M.dark, side * 81.3, 56, z); });
    });
  }
});

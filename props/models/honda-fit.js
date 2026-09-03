// Honda Fit, third generation (GK, 2015-2020) five-door hatchback, US spec, stock, in dark blue.
// Units are centimetres, shown at 0.075 scale.
// Reference: refs/honda-fit-wikipedia.jpg (Wikimedia Commons) shows a fourth-generation Jazz, so it was
// used only for the general tall-hatchback proportions; the third-generation numbers below are the
// published Honda specs (Wikidata Q1135125 / Honda spec sheet).
//   length 406.5, width 169.5, height 152.5, wheelbase 253   (trusted, spec sheet)
//   front overhang ~85, rear ~68                               (front axle z +118, rear axle z -135)
//   tyre 185/60 R15: radius ~30, width ~19; rim radius ~19; track ~147 (wheel centres x +-72)
//   ground clearance ~16, hood leading edge ~76, cowl ~97, beltline ~100 rising to ~108 at the rear
//   quarter, roof crown ~152, A-pillar base at z +84 (cab-forward), roof ends at z -160, hatch glass
//   about 59 degrees from horizontal under a roof spoiler
//   third-gen cues: very raked windshield with a small quarter light at the A-pillar base, tall
//   greenhouse with a kicked-up rear quarter window, swept-back headlights either side of a chrome
//   grille bar carrying the H badge, big trapezoidal lower intake with fog-lamp recesses, one crease
//   rising along the flanks into corner-wrapping taillights, upright hatch, stubby rear mast antenna
//
// Block-out plan:
//   lower body    - extrude a side-profile silhouette (bumper, short hood, beltline plateau rising to
//                   the tail, rear bumper, sill with two wheel-arch notches) across the width, bevelled,
//                   rotated so the sweep is x; vertices displaced to taper the nose and tail in plan
//   cabin         - second, narrower side-profile extrude (raked windshield, roof, upright hatch glass)
//                   with a 10 cm bevel for the rounded roof edge; displaced for tumblehome
//   glass         - windshield and rear window are tilted thin boxes; side glass is one extruded
//                   silhouette per side (quarter light, two doors, kicked-up rear quarter) placed on
//                   the leaning cabin face, with dark B- and C-pillar strips
//   wheels x4     - dark tyre cylinder (12 sides), grey alloy rim (8), trim hub (6), axis along x;
//                   dark liner boxes close the arch tunnels
//   front end     - nose headlight slabs plus fender wrap pieces (M.lit, the one warm detail), chrome
//                   grille bar with round badge, dark upper grille, lower intake, fog recesses, lip
//   rear end      - corner taillight boxes plus flank wraps, chrome hatch garnish, cream plate, dark
//                   valance, roof spoiler with brake light, mast antenna leaning back
//   trim          - crease strip, three door seams, two handles and a door mirror per side, cowl vent
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'honda-fit',
  name: 'Honda Fit',
  kind: 'vehicle',
  units: 'cm',
  scale: 0.075,
  camera: { pivotY: 5.7, fitW: 32, baseMin: 44, homePhi: 0.22, homeYaw: -0.55, tilt: 0.05 },
  colorways: [
    { id: 'aegean', name: 'Aegean blue', sw: '#25467E', face: 0x25467E, shell: 0x1A3260 },
    { id: 'steel', name: 'Modern steel', sw: '#6E6F73', face: 0x6E6F73, shell: 0x4C4D52 },
    { id: 'milano', name: 'Milano red', sw: '#B7302C', face: 0xB7302C, shell: 0x88231F }
  ],
  notes: 'Lower body and cabin are two bevelled side-profile extrusions swept across the width (wheel arches notched into the sill) with vertex displacement for the plan taper of nose and tail and the tumblehome of the greenhouse; glass, wheels, lights, spoiler and trim are boxes and low-sided cylinders.',
  build: function (api) {
    var M = api.M, part = api.part, PI = Math.PI;
    var RIM = api.mat(0xBDB6AE), CHROME = api.mat(0xD9D4CC);
    var FRONT_AXLE = 118, REAR_AXLE = -135, TRACK = 72, LEAN = 0.16; // cabin lean, atan(0.10 * 81 / 50)

    // sweep helper: profile drawn as (shape-x = -world z, shape-y = height), extruded along the width,
    // centred, then rotated so the extrude axis becomes world x
    function sweep(shape, depth, bevelT, bevelS, segs) {
      var g = api.extrude(shape, { depth: depth, bevelEnabled: true, bevelThickness: bevelT, bevelSize: bevelS, bevelSegments: segs, curveSegments: 3, steps: 1 });
      g.translate(0, 0, -depth / 2);
      g.rotateY(PI / 2);
      return g;
    }

    // ---- lower body: 169 wide at the door panels, nose and tail tapered in plan
    var b = api.shape();
    b.moveTo(-192, 16);
    b.quadraticCurveTo(-204, 26, -203, 44);          // front bumper bulge
    b.lineTo(-202, 58);
    b.quadraticCurveTo(-200, 70, -190, 76);          // nose up to the hood leading edge
    b.quadraticCurveTo(-140, 88, -84, 97);           // short hood rising to the cowl
    b.lineTo(150, 100);                              // beltline plateau under the cabin
    b.lineTo(188, 107);                              // rising into the rear quarter
    b.quadraticCurveTo(203, 107, 203, 86);           // tail top round
    b.lineTo(203, 55);
    b.quadraticCurveTo(207, 40, 200, 22);            // rear bumper bulge
    b.lineTo(192, 16);
    b.lineTo(171, 16);
    b.quadraticCurveTo(171, 62, 135, 66);            // rear wheel arch
    b.quadraticCurveTo(99, 62, 99, 16);
    b.lineTo(-82, 16);
    b.quadraticCurveTo(-82, 62, -118, 66);           // front wheel arch
    b.quadraticCurveTo(-154, 62, -154, 16);
    b.lineTo(-192, 16);
    var body = sweep(b, 161, 4, 3, 2);
    api.displace(body, function (x, y, z) {
      var f = 1, t;
      if (z > 120) { t = (z - 120) / 86; f -= 0.20 * t * t; }
      else if (z < -140) { t = (-140 - z) / 66; f -= 0.08 * t * t; }
      return f === 1 ? null : [x * f, y, z];
    });
    part(body, [M.face, M.shell], 0, 0, 0);

    // ---- cabin: 162 wide at the door tops, leaning in 10% by the roof; 10 cm bevel rounds the roof edge
    var c = api.shape();
    c.moveTo(-84, 86);
    c.lineTo(-84, 97);                               // cowl
    c.lineTo(-8, 146);                               // raked windshield / A-pillar
    c.quadraticCurveTo(0, 148, 12, 148);             // roof front round
    c.lineTo(158, 148);                              // roof
    c.quadraticCurveTo(170, 147, 174, 140);          // roof rear round
    c.lineTo(192, 110);                              // hatch glass
    c.lineTo(194, 100);
    c.lineTo(191, 86);
    var cabin = sweep(c, 142, 10, 4, 2);
    api.displace(cabin, function (x, y, z) {
      var t = Math.min(1, Math.max(0, (y - 97) / 50));
      return t ? [x * (1 - 0.10 * t), y, z] : null;
    });
    part(cabin, [M.face, M.shell], 0, 0, 0);

    // ---- glass: windshield and rear window are tilted slabs offset off the cabin's mid surface
    part(api.box(128, 80, 2.5), M.glass, 0, 126.5, 49.3, -1.0, 0, 0);
    part(api.box(112, 30, 2.5), M.glass, 0, 128.1, -188.1, 0.54, 0, 0);

    // side glass: one silhouette per side (quarter light, front door, rear door, kicked-up rear
    // quarter), centred on (shape-x 40, y 120) so it sits on the leaning door-top plane
    var gs = api.shape();
    gs.moveTo(-110, -20); gs.lineTo(-50, 20); gs.lineTo(120, 20); gs.lineTo(138, -4); gs.lineTo(134, -12); gs.lineTo(70, -18); gs.lineTo(-110, -20);
    var glass = api.extrude(gs, { depth: 1.6, bevelEnabled: false, steps: 1 });
    glass.translate(0, 0, -0.8);
    glass.rotateY(PI / 2);
    [1, -1].forEach(function (side) {
      part(side > 0 ? glass : glass.clone(), M.glass, side * 78.6, 120, -40, 0, 0, side * LEAN);
      part(api.box(1.6, 40, 9), M.dark, side * 79.2, 120, -22, 0, 0, side * LEAN);   // B-pillar
      part(api.box(1.6, 36, 5), M.dark, side * 79.2, 121, -98, 0, 0, side * LEAN);   // rear door edge
    });

    // ---- wheels: tyre, alloy rim, hub with axis along x; dark liners close the arch tunnels
    function wheel(x, z) {
      part(api.cyl(30, 30, 19, 12), M.dark, x, 30, z, 0, 0, PI / 2);
      part(api.cyl(19, 19, 20, 8), RIM, x, 30, z, 0, 0, PI / 2);
      part(api.cyl(5, 5, 21, 6), M.trim, x, 30, z, 0, 0, PI / 2);
    }
    [FRONT_AXLE, REAR_AXLE].forEach(function (z) {
      wheel(TRACK, z); wheel(-TRACK, z);
      part(api.box(124, 44, 70), M.dark, 0, 42, z);
    });

    // ---- front end. The swept mid section stands 3 cm proud of the profile: the nose face at headlight
    // height is near z 194 leaning back about 0.5 rad, the bumper bulge reaches z 206.
    [1, -1].forEach(function (side) {
      part(api.box(32, 9, 5), M.lit, side * 42, 75, 195, -0.5, 0, 0);            // headlight on the nose
      part(api.box(5, 8, 20), M.lit, side * 75.5, 78, 181, 0, -side * 0.3, 0);   // its sweep back along the fender
      part(api.box(16, 10, 4), M.dark, side * 54, 34, 205);                      // fog-lamp recess
      part(api.disc(3.5, 8), M.trim, side * 54, 34, 207.2);
    });
    part(api.box(50, 3.5, 3), CHROME, 0, 72, 199.5, -0.5, 0, 0);                // chrome grille bar
    part(api.cyl(5, 5, 2, 8), CHROME, 0, 72, 201.5, 1.07, 0, 0);                // H badge
    part(api.box(46, 7, 3), M.dark, 0, 65, 202, -0.5, 0, 0);                    // upper grille
    part(api.box(84, 16, 4), M.dark, 0, 40, 205.5);                              // lower intake
    part(api.box(126, 6, 10), M.dark, 0, 18.5, 199);                             // lower lip

    // ---- rear end (rear face near z -206 at taillight height; flanks taper to x 78 at the corners)
    [1, -1].forEach(function (side) {
      part(api.box(18, 34, 4), M.b, side * 60, 82, -206);                         // corner taillight
      part(api.box(4, 32, 14), M.b, side * 80, 82, -196, 0, side * 0.17, 0);     // its wrap onto the flank
    });
    part(api.box(64, 3, 2), CHROME, 0, 96, -207);                                // hatch garnish
    part(api.box(32, 16, 1.5), M.cream, 0, 66, -207.5);                          // plate
    part(api.box(140, 10, 8), M.dark, 0, 21, -200);                              // rear valance
    part(api.box(118, 4, 28), M.shell, 0, 148, -166, -0.2, 0, 0);                // roof spoiler over the glass
    part(api.box(20, 2.5, 2), M.b, 0, 144.5, -180.5);                            // high-mount brake light
    part(api.cyl(0.7, 0.7, 14, 6), M.dark, 0, 158, -133.5, -0.5, 0, 0);          // mast antenna leaning back

    // ---- side trim: mirrors on the doors, handles above the crease, crease strip, door seams
    [1, -1].forEach(function (side) {
      part(api.box(6, 2.5, 5), M.dark, side * 87, 100, 52);                      // mirror stalk
      part(api.box(11, 8, 7), M.dark, side * 93, 103, 50);                       // mirror head
      part(api.box(11, 3, 2.2), M.dark, side * 85.6, 92, -8);                    // front door handle
      part(api.box(11, 3, 2.2), M.dark, side * 85.6, 92, -96);                   // rear door handle
      part(api.box(1.4, 2, 232), M.face, side * 85.2, 81, -20, 0.07, 0, 0);      // crease rising to the tail
      [60, -20].forEach(function (z) { part(api.box(1.2, 72, 1.4), M.dark, side * 85.1, 60, z); });
      part(api.box(1.2, 70, 1.4), M.dark, side * 85.1, 60, -98);
    });
    part(api.box(118, 2.5, 7), M.dark, 0, 100.5, 88, -0.3, 0, 0);               // cowl vent
  }
});

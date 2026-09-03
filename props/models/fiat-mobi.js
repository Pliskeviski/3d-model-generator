// Fiat Mobi (2016-) city hatchback, Brazilian A-segment. Units are centimetres, shown at 0.075 scale.
// Reference: refs/fiat-mobi-wikidata.jpg (Wikimedia Commons) + Wikidata Q23837806.
//   length 356.6, width 163.3, height 149.0 (trusted, from Wikidata)
//   wheelbase ~235, front/rear overhang ~60.8 each (estimated: typical A-segment split of the length)
//   wheel radius ~28, tire width ~17, track ~140 (estimated from photo proportions)
//   beltline (window sill) ~88 high, roof peak ~138-144, hood top ~72
//   tall narrow greenhouse, short blunt nose with wraparound headlights either side of a small
//   grille, boxy high-shoulder flanks, stubby rounded tail with a nearly-vertical hatch
//
// Block-out plan:
//   body shell     - extrude a side-profile silhouette (nose, hood, windshield rake, roof, hatch,
//                     rear bumper, then the underbody sill with two wheel-arch notches cut in),
//                     bevelled, swept across the car's width and rotated 90 degrees about y so the
//                     sweep becomes the width axis (same technique as the typewriter's hump)
//   glass          - flat boxes: two side windows per side plus a B-pillar strip, and a tilted
//                     windshield + tilted rear hatch glass, all standing off the body a touch
//   wheels x4      - stack primitives: a dark tire cylinder plus a lighter rim cylinder, axis
//                     rotated to run along x, at the four wheelbase/track corners
//   bumpers/grille - stacked boxes/cylinders: front and rear lower valances, a grille insert,
//                     round fog lights, wraparound headlight boxes (lit) and taillight boxes
//   mirrors/antenna- small boxes for the door mirrors, a thin cylinder for the roof antenna
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'fiat-mobi',
  name: 'Fiat Mobi',
  kind: 'vehicle',
  units: 'cm',
  scale: 0.075,
  camera: { pivotY: 5, fitW: 30, baseMin: 38, homePhi: 0.22, homeYaw: -0.5, tilt: 0.06 },
  colorways: 'props',
  notes: 'Body is one side-profile silhouette (with wheel-arch notches cut into the sill) extruded across the width and rotated 90 degrees; glass, wheels, lights and bumpers are boxes and low-sided cylinders stacked on top.',
  build: function (api) {
    var M = api.M, part = api.part;
    var W = 163.3, RIM = api.mat(0xC7C7C7);

    // body: side profile in (shape-x = -world_z, shape-y = height), extruded across the width (z)
    // then rotated so the sweep direction becomes world x (see typewriter hump for the same trick)
    var s = api.shape();
    s.moveTo(-178, 12);
    s.quadraticCurveTo(-183, 20, -179, 30);
    s.quadraticCurveTo(-175, 43, -168, 58);
    s.lineTo(-98, 72);
    s.quadraticCurveTo(-78, 108, -56, 136);
    s.quadraticCurveTo(10, 144, 90, 138);
    s.quadraticCurveTo(122, 126, 136, 96);
    s.quadraticCurveTo(145, 70, 162, 33);
    s.quadraticCurveTo(181, 19, 178, 12);
    s.lineTo(156, 12);
    s.quadraticCurveTo(156, 58, 117.5, 62);
    s.quadraticCurveTo(79, 58, 79, 12);
    s.lineTo(-79, 12);
    s.quadraticCurveTo(-79, 58, -117.5, 62);
    s.quadraticCurveTo(-156, 58, -156, 12);
    s.lineTo(-178, 12);
    var body = api.extrude(s, { depth: W, bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.1, bevelSegments: 1, curveSegments: 3, steps: 1 });
    body.translate(0, 0, -W / 2);
    part(body, [M.face, M.shell], 0, 0, 0, 0, Math.PI / 2, 0);

    // glass: two side windows and a B-pillar per side, plus tilted windshield and hatch glass
    [1, -1].forEach(function (side) {
      var x = side * (W / 2 + 1);
      part(api.box(2, 44, 90), M.glass, x, 110, 55);
      part(api.box(2, 38, 88), M.glass, x, 106, -48);
      part(api.box(2.4, 42, 6), M.dark, x, 108, 6);
      part(api.box(3, 5, 9), M.trim, side * (W / 2 + 5), 102, 90);
    });
    part(api.box(120, 76, 3), M.glass, 0, 105, 78, -0.58, 0, 0);
    part(api.box(100, 62, 3), M.glass, 0, 118, -114, 0.83, 0, 0);

    // wheels: dark tire + light rim cylinders, axis rotated to run along x
    function wheel(x, z) {
      part(api.cyl(28, 28, 17, 10), M.dark, x, 28, z, 0, 0, Math.PI / 2);
      part(api.cyl(16, 16, 17.3, 8), RIM, x, 28, z, 0, 0, Math.PI / 2);
    }
    [1, -1].forEach(function (side) { wheel(side * 70, 117.5); wheel(side * 70, -117.5); });

    // front end: grille, fog lights, wraparound headlights (the one warm lit detail), bumper valance
    part(api.box(66, 10, 3), M.dark, 0, 46, 177);
    part(api.box(150, 15, 4), M.dark, 0, 19, 174);
    [1, -1].forEach(function (side) {
      part(api.cyl(3, 3, 3, 8), M.dark, side * 54, 19, 176.5, Math.PI / 2, 0, 0);
      part(api.box(28, 10, 4), M.lit, side * 58, 52, 176, 0, side * -0.25, 0);
    });

    // rear end: bumper valance and taillights
    part(api.box(146, 13, 4), M.dark, 0, 18, -173);
    [1, -1].forEach(function (side) { part(api.box(24, 9, 4), M.b, side * 58, 72, -175); });

    // roof antenna
    part(api.cyl(0.6, 0.6, 13, 6), M.dark, -20, 148, 78);
  }
});

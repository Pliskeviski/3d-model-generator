// Vintage portable typewriter (Underwood/Royal-style, 1930s). Units are centimetres, shown at 0.85 scale.
// No reference photos; dimensions are typical for a portable typewriter of the era:
//   footprint 30 x 30 cm, base 2.5 cm tall, rear housing ("hump") rising to 13 cm
//   open keyboard deck at the front, flanked by two raised side cheeks 9 cm tall
//   platen (paper roller) 4.4 cm diameter x 24 cm long, with 2.6 cm radius end knobs
//   40 round keys in 4 stepped rows of 10, ~1.9 cm keycap diameter, stems taller toward the back
//
// Block-out plan:
//   base plate        - box, full footprint 30w x 2.5h x 30d
//   rear hump         - extrude a 4-point side-profile trapezoid (flat top at 13cm, sloped front face),
//                        drawn depth x height and swept across the hump's own width
//   keyboard deck     - box, thin open tray between the cheeks, keys sit on top of it
//   side cheeks (x2)  - boxes flanking the deck, stepping down from the hump height
//   ribbon spools(x2) - disc + hub cylinders recessed on top of each cheek
//   platen + knobs    - cylinder roller across the hump top, two larger end-knob cylinders
//   paper bail        - thin rod cylinder plus two small roller pegs, in front of the platen
//   type-bar ring     - a small flat torus mounted on the hump's front face above the keys
//   keys (x40)        - cylinders in 4 rows of 10, stems get taller row by row toward the back
//   space bar         - a long low box in front of the front key row
//   carriage lever    - a one-sided box arm off the left knob with a small round tip;
//                        the whole group is recentred in x afterward to balance it
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'vintage-typewriter-model-claude-opus-5',
  name: 'Vintage Typewriter',
  kind: 'prop',
  units: 'cm',
  scale: 0.85,
  camera: { pivotY: 7, fitW: 30, baseMin: 44, homePhi: 0.32, homeYaw: -0.4, tilt: 0.05 },
  colorways: 'props',
  notes: 'Base, deck and cheeks are stacked boxes; the rear housing is one extruded side-profile trapezoid swept across its width; platen, knobs, spools and keys are cylinders, with a torus for the type-bar ring.',
  build: function (api) {
    var M = api.M, part = api.part;

    var BASE_H = 2.5, HUMP_TOP = 13, DECK_TOP = 3.9;

    // base plate, full footprint
    part(api.box(30, BASE_H, 30), M.shell, 0, BASE_H / 2, 0);

    // rear hump: side-profile trapezoid (x = -world_z, y = height) extruded across its own width,
    // then rotated 90 degrees about y so the extrusion length becomes world x (width)
    var hs = api.shape();
    hs.moveTo(13, BASE_H);
    hs.lineTo(13, HUMP_TOP);
    hs.lineTo(-1, HUMP_TOP);
    hs.lineTo(-3, BASE_H);
    hs.lineTo(13, BASE_H);
    var hump = api.extrude(hs, { depth: 26, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 1, curveSegments: 1, steps: 1 });
    hump.translate(0, 0, -13);
    part(hump, [M.shell, M.face], 0, 0, 0, 0, Math.PI / 2, 0);

    // keyboard deck and flanking cheeks
    part(api.box(22, 1.4, 10.5), M.dark, 0, DECK_TOP - 0.7, 8.25);
    [-1, 1].forEach(function (side) {
      part(api.box(3, 6.5, 10.5), M.face, side * 12.5, BASE_H + 3.25, 8.25);
      part(api.cyl(1.3, 1.3, 0.5, 10), M.trim, side * 12.5, 9.25, 6);
      part(api.cyl(0.5, 0.5, 0.5, 6), M.dark, side * 12.5, 9.6, 6);
    });

    // platen and end knobs, sitting on the flat top of the hump
    part(api.cyl(2.2, 2.2, 24, 10), M.dark, 0, 15.25, 0.5, 0, 0, Math.PI / 2);
    [-1, 1].forEach(function (side) {
      part(api.cyl(2.6, 2.6, 1.6, 10), M.trim, side * 13.2, 15.25, 0.5, 0, 0, Math.PI / 2);
    });

    // paper bail: thin rod with two small roller pegs, in front of the platen
    part(api.cyl(0.18, 0.18, 22, 6), M.trim, 0, 16.4, 2.0, 0, 0, Math.PI / 2);
    [-1, 1].forEach(function (side) { part(api.cyl(0.4, 0.4, 0.7, 6), M.dark, side * 10, 16.4, 2.0); });

    // type-bar guide ring, mounted against the hump's front face above the keys
    part(api.torus(3.0, 0.3, 6, 10), M.trim, 0, 7.5, 2, Math.PI / 2, 0, 0);

    // keys: 4 rows of 10, stems taller toward the back row
    var rows = [
      { z: 12.5, h: 4.0, off: 0 },
      { z: 10.0, h: 4.8, off: 0.6 },
      { z: 7.5, h: 5.6, off: 1.2 },
      { z: 5.0, h: 6.4, off: 1.8 }
    ];
    rows.forEach(function (row) {
      for (var i = 0; i < 10; i++) {
        var x = -9 + i * 2 + row.off;
        part(api.cyl(0.95, 0.55, row.h, 8), M.keys, x, DECK_TOP + row.h / 2, row.z);
      }
    });

    // space bar, in front of the shortest (front) key row
    part(api.box(20, 1, 2.2), M.keys, 0, DECK_TOP + 2, 14);

    // carriage return lever off the left knob: a one-sided arm, so the group is recentred after
    part(api.box(4, 0.5, 0.7), M.trim, -16, 16.6, 0.5, 0, 0, 0.5);
    part(api.cyl(0.5, 0.5, 0.6, 6), M.dark, -18, 16.6, 0.5);

    var SHIFT_X = 1.75;
    api.group.children.forEach(function (c) { c.position.x += SHIFT_X; });
  }
});

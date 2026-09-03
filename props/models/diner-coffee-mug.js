// Diner Coffee Mug. Units are centimetres.
//
// Reference (no photos; known dimensions of a classic diner mug):
//   Mug body: 9 cm tall, 8 cm diameter (r 4), wall ~0.3-0.45 cm thick, flat
//   thick base, slight outward lip at the rim.
//   Handle: D-shaped loop, ~3 cm tall, protrudes ~2.2 cm off the wall,
//   centred a little above the mug's mid-height.
//   Saucer: 14 cm diameter, ~0.5 cm rim height, shallow well the mug foot
//   sits in.
//
// Block-out plan:
//   1. Mug body - lathe a hollow-cup profile (outer wall, rim lip, inner
//      wall, floor), 9 points, 9 cm tall x 8 cm diameter, seg 12.
//   2. Handle - torus, D-shaped by displacing the inner half flat, ring r
//      1.55 cm / tube 0.3 cm, set into the wall at mid-height.
//   3. Saucer - lathe a shallow-dish profile (bottom, rim wall, lip, well),
//      7 points, 14 cm diameter x 0.5 cm rim height, seg 12.
//   4. Coffee surface - flat disc inside the mug near the rim, lit material
//      for the one warm glowing detail.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'diner-coffee-mug',
  name: 'Diner Coffee Mug',
  kind: 'prop',
  units: 'cm',
  scale: 1.8,
  camera: { pivotY: 7.2, fitW: 30, baseMin: 44, homePhi: 0.26, homeYaw: -0.5, tilt: 0.05 },
  colorways: 'props',
  notes: 'Mug and saucer are each one lathed hollow-vessel profile revolved around y; the handle is a torus flattened on its inner half with displace to read as a D-shape, set into the mug wall.',
  build: function (api) {
    var M = api.M, part = api.part, WELL_Y = 0.3;

    // saucer: shallow dish, bottom center -> bottom edge -> rim wall -> lip -> well -> well center
    var saucer = api.lathe([
      [0, 0],
      [6.9, 0],
      [7.0, 0.4],
      [6.6, 0.5],
      [6.2, 0.42],
      [3.9, 0.3],
      [0, 0.3]
    ], 12);
    part(saucer, M.shell, 0, 0, 0);

    // mug: hollow cup, base center -> base edge -> outer wall -> rim lip -> inner wall -> floor center
    var mug = api.lathe([
      [0, 0],
      [3.6, 0],
      [4.0, 0.2],
      [4.0, 8.55],
      [4.05, 8.8],
      [3.85, 9.0],
      [3.55, 8.85],
      [3.55, 1.1],
      [0, 0.7]
    ], 12);
    part(mug, M.face, 0, WELL_Y, 0);

    // handle: torus flattened on the inner half so it reads as a D, set into the wall
    var handle = api.torus(1.55, 0.3, 6, 12);
    api.displace(handle, function (x, y, z) { return x < -0.85 ? [-0.85, y, z] : null; });
    part(handle, M.face, 4.7, WELL_Y + 4.7, 0);

    // coffee surface, near the rim, warm lit detail
    part(api.disc(3.3, 12), M.lit, 0, WELL_Y + 7.3, 0, -Math.PI / 2);
  }
});

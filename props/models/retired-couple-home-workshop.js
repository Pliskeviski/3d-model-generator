// 2401, garage level: Barbosa & Co., the furniture shop the Nakamuras rent out. See environments/envs/retired-couple-home/scenario.md.
// Metres, shown at 1.5 scale to match the exterior model. Walls cut at 0.8 m, four doors to the street along +z.
// Read left to right the way a furniture shop reads: stock (bay 1), machines (bay 2), bench (bay 3), finish (bay 4),
// with the house's laundry still in the far right corner and a taped walkway to reach it.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'retired-couple-home-workshop',
  name: 'Barbosa & Co. Workshop, 2401',
  kind: 'scene',
  units: 'm',
  scale: 1.5,
  camera: { pivotY: 1.0, fitW: 24, baseMin: 26, homePhi: 0.6, homeYaw: -0.35, tilt: 0.02 },
  colorways: [
    { id: 'stucco', name: 'Taupe stucco', sw: '#B9AC9C', face: 0xB9AC9C, shell: 0xF1E3C4 },
    { id: 'white', name: 'Whitewash', sw: '#E6D6B4', face: 0xE6D6B4, shell: 0xF1E3C4 },
    { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
  ],
  notes: 'Garage level as a one-woman furniture shop: lumber rack and dust collector on the left, cabinet saw, bandsaw and jointer in the middle bays, a joiner\'s bench in the open with a tabletop in glue-up behind it, a wall of clamps, and a finishing corner curtained off from the landlord\'s laundry, which is reached by a taped walkway. Machines and bench are composed inline from boxes and cylinders.',
  build: function (api) {
    var CAT = (typeof module !== 'undefined' && module.exports) ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var C = CAT.init(api), K = C.K, M = api.M, PI = Math.PI;
    var X0 = -6.05, X1 = 6.05, Z0 = -4.25, Z1 = 4.25, E = 0.125;
    function box(g, w, h, d, m, x, y, z, rx, ry, rz) { return api.part(api.box(w, h, d), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    function cyl(g, rt, rb, h, seg, m, x, y, z, rx, ry, rz) { return api.part(api.cyl(rt, rb, h, seg), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    var OAK = K.woodLight, WAL = K.woodDark, CHE = K.wood;

    C.floor(X0, Z0, X1, Z1, K.floorConcrete);
    C.walls([[X0 - E, Z0 - E, X1 + E, Z0 - E], [X0 - E, Z0 - E, X0 - E, Z1 + E], [X1 + E, Z0 - E, X1 + E, Z1 + E]], [], { t: 0.25, h: 0.8 });
    C.garageFront(-6.3, 6.3, Z1 + E, 4, 0.8, api.group);

    // ---- bay 1, stock: cantilever rack of walnut, oak and cherry in stick
    [-3.0, -1.4, 0.2].forEach(function (z) {
      box(null, 0.09, 2.1, 0.09, K.metal, -5.98, 1.05, z);
      [0.6, 1.1, 1.6].forEach(function (y) { box(null, 0.55, 0.06, 0.07, K.metal, -5.72, y, z); });
    });
    [[0.66, WAL, -5.76], [0.66, WAL, -5.52], [1.16, OAK, -5.76], [1.16, OAK, -5.52], [1.16, CHE, -5.28], [1.66, OAK, -5.76], [1.66, CHE, -5.52]].forEach(function (b) {
      box(null, 0.22, 0.05, 3.4, b[1], b[2], b[0], -1.4);
    });
    [[-1.62, -4.10], [-2.24, -4.06]].forEach(function (s) { box(null, 1.22, 2.44, 0.02, OAK, s[0], 1.22, s[1], -0.12); });   // ply on the back wall
    // dust collector and the hose run along the floor to the saw
    box(null, 0.6, 0.5, 0.5, K.metal, -5.5, 0.25, -3.6);
    cyl(null, 0.22, 0.22, 0.42, 8, K.black, -5.5, 0.71, -3.6);
    cyl(null, 0.3, 0.28, 0.95, 10, K.cream, -5.5, 1.4, -3.6);
    cyl(null, 0.3, 0.3, 0.6, 8, K.blue, -5.5, 0.3, -3.05);
    cyl(null, 0.075, 0.075, 2.6, 6, K.metal, -3.9, 0.14, -3.7, 0, 0, PI / 2);
    cyl(null, 0.075, 0.075, 3.75, 6, K.metal, -2.6, 0.14, -1.83, PI / 2);
    [[-4.74, 0], [-4.5, 1], [-4.26, 2]].forEach(function (b) {                                // this week's stock, stickered on the floor
      for (var i = 0; i < 3; i++) box(null, 0.23, 0.045, 2.6, [WAL, OAK, CHE][(b[1] + i) % 3], b[0], 0.045 + i * 0.075, 2.3);
      for (var j = 0; j < 3; j++) box(null, 0.23, 0.03, 0.05, K.tan, b[0], 0.083 + j * 0.075, 2.3 + (j - 1) * 1.0);
    });
    var cart = api.sub(-3.0, 0, 3.6, 0, 0, 0);                                                 // chair parts on the cart
    box(cart, 0.9, 0.5, 0.55, K.metal, 0, 0.42, 0); box(cart, 0.94, 0.04, 0.59, OAK, 0, 0.69, 0);
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { cyl(cart, 0.07, 0.07, 0.05, 6, K.black, s * 0.36, 0.07, t * 0.2, PI / 2); }); });
    [0, 1, 2, 3].forEach(function (i) { box(cart, 0.06, 0.06, 0.5, WAL, -0.24 + i * 0.09, 0.74, -0.02, 0, i * 0.04, 0); });
    box(cart, 0.5, 0.05, 0.12, OAK, 0.24, 0.735, 0.06, 0, 0.1, 0);
    C.bike(-5.4, 3.3, 0.1, { color: K.green });
    var broom = api.sub(-0.6, 0, 3.95, 0.2, 0, 0);
    cyl(broom, 0.018, 0.018, 1.4, 6, WAL, 0, 0.7, 0); box(broom, 0.4, 0.08, 0.09, K.tan, 0, 0.04, 0);
    [[-0.95, 3.6, 0.24], [-0.72, 3.72, 0.18], [-1.12, 3.78, 0.16]].forEach(function (p) { api.part(api.cone(p[2], 0.11, 6), K.tan, p[0], 0.055, p[1]); });

    // ---- bay 2, machines: cabinet saw with its wing and fence, bandsaw, jointer
    var saw = api.sub(-2.6, 0, 0.4, 0, 0, 0);
    box(saw, 0.62, 0.78, 0.62, K.metal, 0, 0.39, 0);
    box(saw, 0.72, 0.04, 0.78, K.black, 0, 0.8, 0);
    box(saw, 0.8, 0.03, 0.78, K.metal, 0.76, 0.8, 0);
    cyl(saw, 0.125, 0.125, 0.008, 12, K.metal, 0, 0.75, 0.05, 0, 0, PI / 2);
    box(saw, 0.03, 0.16, 0.28, K.metal, 0, 0.86, -0.22);
    [-1, 1].forEach(function (s) { box(saw, 1.7, 0.06, 0.06, K.metal, 0.4, 0.78, s * 0.42); });
    box(saw, 0.05, 0.1, 0.8, K.rugSand, 0.36, 0.87, 0);
    box(saw, 0.2, 0.04, 0.03, K.black, -0.33, 0.5, 0.3);
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { cyl(saw, 0.05, 0.05, 0.06, 6, K.black, s * 0.26, 0.03, t * 0.26, PI / 2); }); });
    var bs = api.sub(-4.0, 0, -3.7, 0, 0, 0);
    box(bs, 0.5, 0.7, 0.5, K.metal, 0, 0.35, 0);
    box(bs, 0.28, 1.25, 0.34, K.metal, 0, 1.28, -0.16);
    cyl(bs, 0.26, 0.26, 0.26, 10, K.metal, 0, 1.72, 0.02, 0, 0, PI / 2);
    box(bs, 0.55, 0.04, 0.55, K.black, 0, 0.95, 0.06);
    box(bs, 0.02, 0.72, 0.03, K.metal, 0, 1.33, 0.06);
    var jt = api.sub(-4.9, 0, -1.5, 0, 0, 0);
    box(jt, 0.6, 0.72, 0.5, K.metal, 0, 0.36, 0);
    box(jt, 0.26, 0.12, 1.4, K.black, 0, 0.78, 0);
    box(jt, 0.04, 0.14, 1.0, K.metal, 0.06, 0.9, 0);
    box(jt, 0.14, 0.1, 0.1, K.red, -0.2, 0.5, 0.28);
    box(null, 0.7, 0.55, 0.5, K.card, -1.9, 0.275, 2.9);                                    // offcut crate
    [[-2.1, 2.8, 0.4], [-1.95, 2.95, -0.3], [-1.75, 2.85, 0.15], [-2.0, 3.05, 0.6]].forEach(function (o, i) {
      box(null, 0.07, 0.5, 0.07, [WAL, OAK, CHE, WAL][i], o[0], 0.45, o[1], 0.12, 0, o[2]);
    });
    cyl(null, 0.18, 0.18, 0.9, 8, K.navy, -3.4, 0.28, 2.6, 0, 0, PI / 2);                   // compressor
    box(null, 0.24, 0.2, 0.24, K.black, -3.4, 0.6, 2.6);
    [-1, 1].forEach(function (s) { box(null, 0.06, 0.18, 0.3, K.metal, -3.4 + s * 0.36, 0.09, 2.6); });

    // ---- bay 3, bench: the joiner's bench in the open, tool chest and clamp wall behind it
    var bn = api.sub(0.6, 0, -1.2, 0, 0, 0);
    box(bn, 2.2, 0.1, 0.68, OAK, 0, 0.85, 0);
    box(bn, 1.9, 0.05, 0.15, WAL, 0, 0.82, -0.24);
    [-1, 1].forEach(function (s) {
      [-1, 1].forEach(function (t) { box(bn, 0.12, 0.8, 0.12, CHE, s * 0.95, 0.4, t * 0.24); });
      box(bn, 0.12, 0.1, 0.5, CHE, s * 0.95, 0.28, 0);
    });
    box(bn, 1.8, 0.09, 0.09, CHE, 0, 0.28, 0);
    box(bn, 0.42, 0.18, 0.09, K.metal, -0.82, 0.76, 0.38);
    cyl(bn, 0.028, 0.028, 0.22, 8, K.metal, -0.82, 0.76, 0.46, PI / 2);
    cyl(bn, 0.02, 0.02, 0.18, 6, WAL, -0.82, 0.76, 0.57, 0, 0, PI / 2);
    [-0.5, -0.1, 0.3, 0.7].forEach(function (x) { cyl(bn, 0.014, 0.014, 0.02, 6, K.black, x, 0.9, -0.06); });
    box(bn, 0.24, 0.07, 0.09, K.metal, 0.25, 0.935, 0.14); box(bn, 0.06, 0.07, 0.07, WAL, 0.31, 0.97, 0.14);   // hand plane
    [0, 1, 2].forEach(function (i) { box(bn, 0.03, 0.02, 0.24, K.metal, 0.62 + i * 0.06, 0.91, 0.02); box(bn, 0.035, 0.035, 0.1, WAL, 0.62 + i * 0.06, 0.918, 0.18); });
    cyl(bn, 0.05, 0.05, 0.14, 8, CHE, 0.86, 0.97, -0.16, 0, 0, PI / 2); cyl(bn, 0.018, 0.018, 0.24, 6, OAK, 0.99, 0.97, -0.16, 0, 0, 0.5);
    [[-0.42, 0.34, 0.4], [-0.42, -0.34, 0.4], [-0.62, 0, 0.02], [-0.22, 0, 0.02]].forEach(function (p, i) {   // a drawer part made
      box(bn, i < 2 ? 0.42 : 0.02, 0.12, i < 2 ? 0.02 : 0.34, OAK, -0.35 + (i < 2 ? 0 : p[0] + 0.35), 0.96, i < 2 ? p[1] : 0);
    });
    C.mug(1.4, -1.05, 0.9, K.cream);
    [[0.1, -0.5, 0.22], [-0.15, -0.62, 0.17], [0.34, -0.66, 0.19]].forEach(function (p) { api.part(api.cone(p[2], 0.12, 6), K.tan, p[0], 0.06, p[1]); });
    var tc = api.sub(0.2, 0, -3.85, 0, 0, 0);
    box(tc, 1.0, 0.9, 0.5, K.red, 0, 0.5, 0);
    [0.22, 0.44, 0.66, 0.86].forEach(function (y) { box(tc, 0.92, 0.02, 0.02, K.metal, 0, y, 0.26); });
    box(tc, 1.02, 0.28, 0.52, K.red, 0, 1.09, 0);
    box(tc, 0.94, 0.03, 0.46, K.black, 0, 1.24, 0);
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { cyl(tc, 0.045, 0.045, 0.05, 6, K.black, s * 0.4, 0.03, t * 0.18, PI / 2); }); });
    box(tc, 0.22, 0.13, 0.13, K.card, -0.3, 1.32, 0); box(tc, 0.09, 0.04, 0.02, K.lit, -0.28, 1.34, 0.07);     // the shop radio
    box(null, 1.8, 0.08, 0.08, K.metal, 1.8, 1.55, -4.15);                                                     // clamp rail
    for (var q = 0; q < 8; q++) {
      var cx = 1.02 + q * 0.22;
      box(null, 0.045, 0.82 + (q % 3) * 0.12, 0.035, K.metal, cx, 1.06 - (q % 3) * 0.06, -4.13);
      box(null, 0.07, 0.07, 0.12, K.black, cx, 1.48, -4.13);
      box(null, 0.07, 0.09, 0.1, K.black, cx, 0.68 - (q % 3) * 0.12, -4.13);
    }
    // a tabletop in glue-up on sawhorses, five bar clamps across it
    [1.4, 3.0].forEach(function (hx) {
      box(null, 0.09, 0.09, 0.9, CHE, hx, 0.66, 1.6);
      [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { box(null, 0.06, 0.7, 0.06, CHE, hx + s * 0.1, 0.33, 1.6 + t * 0.36, t * 0.14, 0, s * 0.14); }); });
    });
    box(null, 1.9, 0.05, 0.95, WAL, 2.2, 0.73, 1.6);
    [1.28, 1.6, 1.92].forEach(function (z) { box(null, 1.9, 0.035, 0.035, K.metal, 2.2, 0.685, z); });
    [1.42, 1.78].forEach(function (z) {
      box(null, 1.9, 0.035, 0.035, K.metal, 2.2, 0.775, z);
      [-1, 1].forEach(function (s) { box(null, 0.06, 0.14, 0.08, K.black, 2.2 + s * 0.9, 0.77, z); });
    });
    C.stool(-0.9, -0.4, 0);
    C.chair(1.6, 0.6, -2.63, { mat: WAL });                                                                    // where Walter sits to watch
    box(null, 1.5, 0.75, 0.9, K.fabric, 1.8, 0.38, 3.2);                                                       // Saturday's delivery, wrapped
    box(null, 1.54, 0.06, 0.94, K.rugNavy, 1.8, 0.78, 3.2);
    [-1, 1].forEach(function (s) { box(null, 1.56, 0.05, 0.05, K.rugSand, 1.8, 0.4, 3.2 + s * 0.3); });

    // ---- bay 4, finish, and the landlord's corner behind the taped line
    box(null, 0.06, 0.06, 6.0, K.metal, 3.35, 2.05, -1.2);
    [-2.6, 1.4].forEach(function (z) {                                                                         // the dust curtain, pushed back
      box(null, 0.2, 1.45, 0.26, K.linen, 3.35, 1.02, z);
      box(null, 0.26, 0.16, 0.32, K.linen, 3.35, 1.86, z);
      box(null, 0.16, 0.12, 0.2, K.metal, 3.35, 1.98, z);
    });
    C.rug(4.3, -3.4, 0, 2.0, 1.4, K.linen);                                                                    // drop cloth
    var ft = api.sub(4.3, 0, -3.4, 0, 0, 0);
    box(ft, 1.4, 0.06, 0.7, CHE, 0, 0.85, 0);
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { box(ft, 0.07, 0.82, 0.07, CHE, s * 0.62, 0.41, t * 0.28); }); });
    [-0.35, 0.3].forEach(function (x) {                                                                        // the pair of nightstands, in oil
      box(ft, 0.42, 0.44, 0.4, WAL, x, 1.1, 0);
      box(ft, 0.36, 0.02, 0.02, K.metal, x, 1.14, 0.21);
    });
    [[0.62, K.rugRed], [0.62, K.metal]].forEach(function (c, i) { cyl(ft, 0.08, 0.08, 0.15, 8, c[1], -0.58 + i * 0.2, 0.955, 0.24); });
    box(ft, 0.16, 0.05, 0.12, K.rugSand, 0.6, 0.905, 0.2, 0, 0.3);
    C.shelvingUnit(3.6, -4.0, 0);
    C.chair(4.1, -1.3, PI - 0.3, { mat: WAL }); C.chair(4.1, -0.5, PI + 0.2, { mat: WAL });                     // done, waiting for delivery
    C.waterHeater(5.7, -3.95);
    C.washer(5.72, -3.15, -PI / 2); C.washer(5.72, -2.45, -PI / 2, { dryer: true });
    C.utilitySink(5.72, -1.6, -PI / 2);
    C.laundryBasket(5.1, -2.6, 0);
    C.boxes(5.8, 0.6, 0);
    [4.6, 5.5].forEach(function (x) { box(null, 0.06, 0.006, 6.35, K.yellow, x, 0.003, 0.975); });              // Marisol's Tuesday walkway
  }
});

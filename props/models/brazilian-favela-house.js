// Brazilian favela house (Rio hillside, from an aerial three-quarter photo): self-built two-storey
// brick house with a roof terrace under a corrugated canopy, blue water tanks and an unfinished
// third storey. Units are metres, shown at 2.1 scale.
//
// Reference: refs/brazilian-favela-house-link1.jpg. Proportions scaled off the standing figure on the
// terrace (1.75 m) and the 0.20 m brick courses in the exposed walls:
//   footprint 7.2 m wide (x) x 6.0 m deep (z); ground storey 3.15 m; floor slab 0.25 m;
//   upper storey 2.70 m; roof slab 0.25 m; unfinished rear wall 1.70 m plus 0.45 m rebar stubs
//   terrace 3.3 x 3.4 m, brick parapet 1.10 m; canopy 3.6 x 3.7 m at 5.4-5.65 m on two 0.08 m posts
//   ground openings: window 1.30 x 1.75 m (sill 1.05) and door 1.05 x 2.20 m; upper window 1.40 x 1.50 (sill 4.50)
//   water tanks 1.04 m across x 0.80 m tall on a 0.25 m plinth; side stair 10 risers of 0.34 m, 1.15 m wide
//
// Block-out, one line per form:
//   ground storey   - one brick box 7.2 x 3.15 x 6.0 with three concrete pilasters standing 0.12 off the front
//   mortar courses  - thin light bands every 0.55 m on the blank brick strips, front and right side
//   floor slab      - box overhanging 0.1 m all round, concrete shell
//   upper storey    - two brick boxes (left room full depth, rear-right room 2.6 deep) leaving the front-right open
//   terrace         - red floor slab, brick parapet on two sides with a steel cap rail, brick counter with pots
//   openings        - stacked boxes: green frame border, pane, grille bars, sill; the terrace doorway is lit
//   canopy          - tilted slab plus nine corrugation ribs on two steel posts and two beams
//   roof            - two slabs, parapet bands, blue tanks as 10-sided cylinders on a concrete plinth
//   unfinished top  - four piers between a sill and lintel band, leaving three open sky holes, rebar stubs
//   side stair      - ten stacked step boxes to a landing, dark upper doorway, sloped handrail
//   services        - conduit cylinder, meter box, satellite dish disc, concrete ground pad
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'brazilian-favela-house',
  name: 'Brazilian Favela House',
  kind: 'building',
  units: 'm',
  scale: 2.1,
  camera: { pivotY: 7.0, fitW: 24, baseMin: 34, homePhi: 0.25, homeYaw: -0.45, tilt: 0.03 },
  colorways: [
    { id: 'brick', name: 'Fired brick', sw: '#C0563A', face: 0xC0563A, shell: 0xB0A695 },
    { id: 'ochre', name: 'Ochre wash', sw: '#D89A54', face: 0xD89A54, shell: 0xC7B08A },
    { id: 'rosa', name: 'Rosa paint', sw: '#C4707F', face: 0xC4707F, shell: 0xB9AC9C }
  ],
  notes: 'Brick boxes stacked so the front-right of the upper storey stays open as a terrace: barred windows are frame-border boxes with grille bars, the canopy is a tilted slab with nine ribs on two posts, the roof carries 10-sided blue water tanks, and the unfinished top storey is four piers between a sill and lintel band so real sky shows through.',
  build: function (api) {
    var M = api.M, part = api.part;
    var W = 7.2, D = 6.0, XL = -3.6, XR = 3.6, FZ = 3.0;
    var G = 3.15, Y2 = 3.40, Y3 = 6.10, YR = 6.35;
    var TX = 0.30, TZ = -0.40;                    // terrace: x TX..XR, z TZ..FZ
    var green = api.mat(0x3F5C46), tank = api.mat(0x35527E), lid = api.mat(0x486B9E), fibre = api.mat(0xC6B68C);
    var fac = api.facade(W, D);

    // mortar courses: thin light bands standing off a blank strip of brick
    function courses(u0, u1, y0, y1, axis, at) {
      for (var y = y0 + 0.55; y < y1 - 0.12; y += 0.55) {
        if (axis === 'z') part(api.box(u1 - u0, 0.04, 0.05), M.groove, (u0 + u1) / 2, y, at + 0.02);
        else part(api.box(0.05, 0.04, u1 - u0), M.groove, at + 0.02, y, (u0 + u1) / 2);
      }
    }

    // barred window on the front face: four frame boxes, pane, grille, sill
    function win(x, y, w, h, nv, nh, mat) {
      var t = 0.1, zf = FZ + 0.05, i;
      part(api.box(w + 2 * t, t, 0.12), green, x, y + h + t / 2, zf);
      part(api.box(w + 2 * t, t, 0.12), green, x, y - t / 2, zf);
      part(api.box(t, h, 0.12), green, x - w / 2 - t / 2, y + h / 2, zf);
      part(api.box(t, h, 0.12), green, x + w / 2 + t / 2, y + h / 2, zf);
      part(api.box(w, h, 0.05), mat || M.glass, x, y + h / 2, FZ + 0.02);
      for (i = 1; i <= nv; i++) part(api.box(0.04, h, 0.04), M.groove, x - w / 2 + w * i / (nv + 1), y + h / 2, FZ + 0.07);
      for (i = 1; i <= nh; i++) part(api.box(w, 0.04, 0.04), M.groove, x, y + h * i / (nh + 1), FZ + 0.07);
      part(api.box(w + 0.36, 0.09, 0.24), M.shell, x, y - t - 0.045, FZ + 0.1);
    }

    // a clay pot with a dry shrub in it
    function pot(x, y, z, s) {
      part(api.cyl(0.13 * s, 0.1 * s, 0.2 * s, 6), M.tile, x, y + 0.1 * s, z);
      part(api.cone(0.17 * s, 0.42 * s, 5), M.grass, x, y + 0.4 * s, z);
    }

    // ---- ground storey: brick box, three concrete pilasters, coursed brick between them
    part(api.box(W, G, D), M.face, 0, G / 2, 0);
    [[-3.35, Y3], [0.05, Y3], [3.35, Y2 + 0.12]].forEach(function (p) {
      part(api.box(0.5, p[1], 0.14), M.shell, p[0], p[1] / 2, FZ + 0.07);
    });
    courses(-3.05, -2.45, 0, G, 'z', FZ); courses(-0.85, -0.25, 0, G, 'z', FZ);
    courses(0.35, 1.05, 0, G, 'z', FZ); courses(2.45, 3.05, 0, G, 'z', FZ);
    courses(-2.8, 0.4, 0, G, 'x', XR);

    // ground openings: barred window, security door with a red threshold, one small side window
    win(-1.65, 1.05, 1.3, 1.75, 3, 4);
    win(1.75, 0.2, 1.05, 2.2, 2, 6);
    part(api.box(1.45, 0.18, 0.4), M.curb, 1.75, 0.09, FZ + 0.16);
    fac.win('+x', 1.2, 1.65, 0.9, 1.0, true);

    // ---- floor slab, then the upper storey: left room full depth, rear-right room, terrace between them
    part(api.box(W + 0.2, 0.25, D + 0.2), M.shell, 0, G + 0.125, 0);
    part(api.box(TX - XL, Y3 - Y2, D), M.face, (XL + TX) / 2, (Y2 + Y3) / 2, 0);
    part(api.box(XR - TX, Y3 - Y2, D / 2 + TZ), M.face, (TX + XR) / 2, (Y2 + Y3) / 2, (-D / 2 + TZ) / 2);
    courses(-3.5, -2.65, Y2, Y3, 'z', FZ); courses(-0.85, 0.2, Y2, Y3, 'z', FZ);
    courses(-2.9, -2.2, Y2, Y3, 'x', XR); courses(-1.1, -0.5, Y2, Y3, 'x', XR);
    win(-1.75, 4.5, 1.4, 1.5, 1, 2);
    part(api.box(0.6, 0.24, 0.24), M.tile, -1.75, 4.3, FZ + 0.16);
    pot(-1.95, 4.42, FZ + 0.16, 0.7); pot(-1.55, 4.42, FZ + 0.16, 0.6);
    fac.win('+x', -1.7, 4.55, 0.9, 1.1, true);

    // ---- terrace: red floor, brick parapets with a steel cap, counter with pots, lit doorway
    part(api.box(XR - TX, 0.06, FZ - TZ), M.tile, (TX + XR) / 2, Y2 + 0.03, (TZ + FZ) / 2);
    part(api.box(XR - TX, 1.1, 0.24), M.face, (TX + XR) / 2, Y2 + 0.55, FZ - 0.12);
    part(api.box(0.24, 1.1, FZ - TZ), M.face, XR - 0.12, Y2 + 0.55, (TZ + FZ) / 2);
    courses(0.42, 3.3, Y2, Y2 + 1.1, 'z', FZ - 0.02);
    courses(TZ + 0.1, FZ - 0.3, Y2, Y2 + 1.1, 'x', XR - 0.02);
    part(api.box(XR - TX + 0.14, 0.1, 0.32), M.trim, (TX + XR) / 2, Y2 + 1.15, FZ - 0.12);
    part(api.box(0.32, 0.1, FZ - TZ + 0.1), M.trim, XR - 0.12, Y2 + 1.15, (TZ + FZ) / 2 - 0.05);

    part(api.box(1.3, 0.9, 0.55), M.face, 1.05, Y2 + 0.45, TZ + 0.275);
    part(api.box(1.42, 0.07, 0.63), M.concrete, 1.05, Y2 + 0.93, TZ + 0.27);
    pot(0.62, Y2 + 0.97, TZ + 0.27, 1.0); pot(1.05, Y2 + 0.97, TZ + 0.3, 0.8); pot(1.45, Y2 + 0.97, TZ + 0.24, 0.9);
    pot(3.15, Y2 + 0.06, 1.9, 1.1);

    part(api.box(1.18, 2.3, 0.06), M.dark, 2.55, Y2 + 1.15, TZ + 0.03);
    part(api.box(0.6, 2.06, 0.04), M.lit, 2.74, Y2 + 1.03, TZ + 0.06);
    part(api.box(0.52, 2.06, 0.05), M.door, 2.3, Y2 + 1.03, TZ + 0.09);

    // ---- canopy: two posts, two beams, a tilted slab with nine corrugation ribs
    var TILT = 0.065;
    [0.55, 3.35].forEach(function (x) { part(api.box(0.08, 1.95, 0.08), M.trim, x, Y2 + 0.975, FZ - 0.15); });
    part(api.box(3.6, 0.12, 0.1), M.trim, 2.0, 5.36, FZ - 0.15);
    part(api.box(3.6, 0.12, 0.1), M.trim, 2.0, 5.6, TZ + 0.08);
    part(api.box(3.6, 0.06, 3.7), fibre, 2.0, 5.54, 1.28, TILT);
    for (var r = 0; r < 9; r++) part(api.box(0.09, 0.07, 3.7), fibre, 0.4 + r * 0.4, 5.605, 1.28, TILT);

    // ---- roof: two slabs and their parapet bands
    part(api.box(4.14, 0.25, D + 0.24), M.shell, -1.65, Y3 + 0.125, 0);
    part(api.box(3.30, 0.25, D / 2 + TZ + 0.24), M.shell, 2.07, Y3 + 0.125, (-D / 2 + TZ) / 2);
    part(api.box(4.14, 0.37, 0.2), M.shell, -1.65, YR + 0.185, FZ + 0.02);
    part(api.box(0.2, 0.37, D + 0.24), M.shell, -3.62, YR + 0.185, 0);
    part(api.box(0.2, 0.37, D + 0.24), M.shell, 0.32, YR + 0.185, 0);
    part(api.box(0.2, 0.37, D / 2 + TZ + 0.24), M.shell, 3.62, YR + 0.185, (-D / 2 + TZ) / 2);
    part(api.box(3.30, 0.37, 0.2), M.shell, 2.07, YR + 0.185, TZ + 0.02);

    // ---- water tanks on the rear roof
    part(api.box(2.6, 0.25, 1.2), M.shell, 2.2, YR + 0.125, -1.75);
    [1.55, 3.05].forEach(function (x) {
      part(api.cyl(0.52, 0.5, 0.8, 10), tank, x, YR + 0.65, -1.75);
      part(api.cyl(0.3, 0.32, 0.12, 8), lid, x, YR + 1.11, -1.75);
    });

    // ---- unfinished third storey at the back: piers between a sill and lintel band, rebar stubs
    var BZ = -D / 2 + 0.125;
    part(api.box(W, 0.42, 0.25), M.face, 0, YR + 0.21, BZ);
    [[-3.2, 0.8], [-0.9, 0.9], [1.35, 0.9], [3.2, 0.8]].forEach(function (p) {
      part(api.box(p[1], 0.98, 0.25), M.face, p[0], YR + 0.91, BZ);
    });
    part(api.box(W, 0.3, 0.25), M.face, 0, YR + 1.55, BZ);
    [-1, 1].forEach(function (s) { part(api.box(0.25, 1.7, 1.5), M.face, s * 3.475, YR + 0.85, BZ + 0.875); });
    [[-3.3, BZ], [-1.8, BZ], [-0.2, BZ], [1.4, BZ], [2.6, BZ], [3.3, BZ], [-3.475, -1.4], [3.475, -1.4]].forEach(function (p) {
      part(api.box(0.035, 0.45, 0.035), M.trim, p[0], YR + 1.93, p[1]);
    });

    // ---- side stair up to an upper door, with a sloped handrail
    var SW = 1.15, SX = XL - 0.02 - SW / 2, RISE = Y2 / 10, TREAD = 0.3, RX = SX - SW / 2 + 0.06;
    for (var k = 0; k < 10; k++) {
      var sh = (k + 1) * RISE;
      part(api.box(SW, sh, TREAD), M.concrete, SX, sh / 2, 2.55 - k * TREAD - TREAD / 2);
    }
    part(api.box(SW, Y2, 1.3), M.concrete, SX, Y2 / 2, -1.1);
    part(api.box(0.08, 2.05, 0.95), M.dark, XL - 0.04, Y2 + 1.02, -1.1);
    part(api.box(0.05, 0.05, 4.32), M.trim, RX, 2.77, 1.05, 0.795);
    part(api.box(0.05, 0.9, 0.05), M.trim, RX, 0.79, 2.4);
    part(api.box(0.05, 0.9, 0.05), M.trim, RX, 3.85, -0.35);
    part(api.box(0.05, 0.05, 1.35), M.trim, RX, 4.3, -1.1);
    part(api.box(0.05, 0.9, 0.05), M.trim, RX, 3.85, -1.72);

    // ---- services: conduit and meter on the right wall, dish on the roof parapet
    part(api.cyl(0.045, 0.045, 3.0, 6), M.trim, XR + 0.06, 1.7, 1.9);
    part(api.box(0.14, 0.46, 0.36), M.shell, XR + 0.07, 2.35, 2.35);
    part(api.box(0.05, 0.5, 0.05), M.trim, -3.3, YR + 0.6, FZ - 0.35);
    part(api.disc(0.26, 10), M.trim, -3.27, YR + 0.9, FZ - 0.44, -0.7, 0.7);
    part(api.box(0.035, 0.035, 0.26), M.trim, -3.19, YR + 0.83, FZ - 0.32, -0.7, 0.7);

    // ---- ground pad, then recentre the whole lot on the origin
    part(api.box(8.8, 0.15, 6.9), M.pad, -0.44, -0.075, 0);
    api.group.children.forEach(function (c) { c.position.x += 0.44; });
  }
});

// City of Santa Monica Fire Station No. 2, 222 Hollister Ave, Ocean Park. Units are metres, shown at 0.85 scale.
//
// Measurements, read off the two Hollister Ave street photos (across the apron, and looking east):
//   front brick block   26.0 wide x 12.0 deep, 7.4 to the roof deck, 8.16 to the top of the parapet coping
//   apparatus doors     3 off, 4.8 wide x 4.3 tall on 6.6 centres, glass in a 4 x 4 grid, yellow frames and mullions
//   brick piers         1.8 between the doors, 3.0 at the west corner, a 5.0 panel at the east corner
//   lintel band         0.42 tall and 0.09 proud over each door head, top at 4.97
//   lettering band      letters 0.5 tall at 6.4, 16.3 of run centred on the door group
//   string course       0.16 band at 7.05, front and east elevations
//   rooftop railing     1.15 tall, set 1.6 behind the front parapet, top at 8.64
//   pedestrian entry    1.2 x 2.3 leaf with a lit transom under a 2.3 canopy, in the east panel
//   flagpole            8.0 tall on a 0.6 concrete plinth; bench 2.1 long, seat at 0.45
//   apron               5.0 deep from the facade to the red curb; driveway 6.4 wide through the west gate
//   rolling gate        5.7 x 2.1 in pale metal, 13 pickets, between brick piers 2.4 tall
//   rear yard           paved, brick boundary wall 2.2 tall on the west, north and east edges
//   lot                 33.3 x 24.0 overall, recentred in x at the end
//
// Block-out plan:
//   brick mass          one box 26 x 7.4 x 12; roof deck box; four parapet boxes with shell coping caps
//   apparatus doors     stacked primitives: dark reveal, yellow frame boxes, 16 pane boxes, 3 + 3 mullions, lintel
//   lettering           nine light boxes sized by word length, no glyphs
//   wall lamps          box arm, open cone shade, cream disc lens; four along the facade
//   entry               recessed frame, leaf, lit transom, canopy slab on two brackets
//   windows             api.facade().win, two on the front east panel and five on the east elevation
//   railing             api.railing along the roof deck
//   boundary            brick wall and pier boxes with coping; rolling gate frame plus pickets on a dark track
//   flag                cylinder pole, cone finial, four flag boxes on a sub-group that sways on tick
//   ground              pad box, lighter concrete apron, driveway and yard, red curb box
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'fire-station-2',
  name: 'Santa Monica Fire Station No. 2',
  kind: 'building',
  units: 'm',
  scale: 0.85,
  camera: { pivotY: 3.4, fitW: 34, baseMin: 34.5, homePhi: 0.16, homeYaw: -0.34, tilt: 0.03 },
  colorways: [
    { id: 'brick', name: 'Red brick', sw: '#8E4636', face: 0x8E4636, shell: 0x6A3327 },
    { id: 'sand', name: 'Sand brick', sw: '#B08A63', face: 0xB08A63, shell: 0x7E6248 },
    { id: 'charcoal', name: 'Charcoal brick', sw: '#4A3A44', face: 0x4A3A44, shell: 0x2F2531 }
  ],
  notes: 'One brick box with a parapet and rooftop railing, three apparatus doors built as stacked boxes with yellow frames and a 4 x 4 pane grid, the lettering rendered as nine light word-blocks, and a paved lot with a red curb, a rolling gate between brick piers, a flagpole whose flag sways on tick, and a bench.',
  build: function (api) {
    var M = api.M, part = api.part;
    var L = 26, D = 12, HW = 7.4, ZF = D / 2;
    var main = api.facade(L, D);

    // ---- brick mass, roof deck, parapet and coping
    part(api.box(L, HW, D), M.face, 0, HW / 2, 0);
    part(api.box(L - 0.7, 0.12, D - 0.7), M.roofDark, 0, HW + 0.06, 0);
    var PH = 0.62, PY = HW + PH / 2, CY = HW + PH + 0.07;
    [1, -1].forEach(function (s) {
      part(api.box(L, PH, 0.4), M.face, 0, PY, s * (ZF - 0.2));
      part(api.box(L + 0.24, 0.14, 0.6), M.shell, 0, CY, s * (ZF - 0.2));
      part(api.box(0.4, PH, D - 0.8), M.face, s * (L / 2 - 0.2), PY, 0);
      part(api.box(0.6, 0.14, D - 0.8), M.shell, s * (L / 2 - 0.2), CY, 0);
    });
    api.railing(-11, 11, ZF - 1.6, HW + 0.12, 1.15, 1.5, 0.06, 3.0, true);

    // string course under the parapet, corner downspouts
    main.slab(L + 0.1, 0.16, 0.12, M.shell, '+z', 0, 7.05, 0.06);
    main.slab(D + 0.1, 0.16, 0.12, M.shell, '+x', 0, 7.05, 0.06);
    [-1, 1].forEach(function (s) { part(api.box(0.16, HW - 0.2, 0.16), M.shell, s * (L / 2 - 0.3), (HW - 0.2) / 2, ZF + 0.08); });

    // ---- three apparatus doors: reveal, yellow frame, 4 x 4 panes, mullions, brick lintel.
    // the west bay has its lights on, so its panes are cream instead of dark glass
    var DW = 4.8, DH = 4.3, DY = 0.06, FR = 0.15, cols = 4, rows = 4;
    [-7.6, -1.0, 5.6].forEach(function (cx, n) {
      var pane = (n === 0) ? M.cream : M.glass, pw = DW / cols, ph = DH / rows, i, j;
      part(api.box(DW, DH, 0.12), M.dark, cx, DY + DH / 2, ZF - 0.02);
      part(api.box(DW + 2 * FR, FR, 0.26), M.y, cx, DY + DH + FR / 2, ZF + 0.13);
      part(api.box(DW + 2 * FR, 0.12, 0.26), M.y, cx, DY - 0.06, ZF + 0.13);
      [-1, 1].forEach(function (s) { part(api.box(FR, DH + 2 * FR, 0.26), M.y, cx + s * (DW + FR) / 2, DY + DH / 2, ZF + 0.13); });
      for (i = 0; i < cols; i++) for (j = 0; j < rows; j++)
        part(api.box(pw - 0.1, ph - 0.1, 0.06), pane, cx - DW / 2 + pw * (i + 0.5), DY + ph * (j + 0.5), ZF + 0.05);
      for (i = 1; i < cols; i++) part(api.box(0.09, DH, 0.16), M.y, cx - DW / 2 + pw * i, DY + DH / 2, ZF + 0.09);
      for (j = 1; j < rows; j++) part(api.box(DW, 0.09, 0.16), M.y, cx, DY + ph * j, ZF + 0.09);
      part(api.box(DW + 0.9, 0.42, 0.18), M.shell, cx, DY + DH + FR + 0.25, ZF + 0.09);
    });

    // ---- lettering band: one light block per word of "City of Santa Monica - Fire Station No. 2"
    var words = [4, 2, 5, 6, 1, 4, 7, 3, 1], CH = 0.42, GAP = 0.3;
    var run = words.reduce(function (a, w) { return a + w * CH; }, 0) + (words.length - 1) * GAP;
    var lx = -1.0 - run / 2;
    words.forEach(function (w) {
      part(api.box(w * CH, 0.5, 0.05), M.cream, lx + w * CH / 2, 6.4, ZF + 0.03);
      lx += w * CH + GAP;
    });

    // ---- gooseneck wall lamps over the piers
    [-11.0, -4.3, 2.3, 9.6].forEach(function (x) {
      part(api.box(0.09, 0.09, 0.42), M.dark, x, 5.3, ZF + 0.21);
      part(api.cone(0.3, 0.32, 8, true), M.trim, x, 5.16, ZF + 0.42);
      part(api.disc(0.2, 8), M.cream, x, 5.01, ZF + 0.42, Math.PI / 2);
    });

    // ---- pedestrian entry in the east panel, with a lit transom under a canopy
    var EX = 10.5;
    part(api.box(1.6, 2.7, 0.14), M.shell, EX, 1.35, ZF + 0.05);
    part(api.box(1.2, 2.3, 0.08), M.door, EX, 1.15, ZF + 0.12);
    part(api.box(1.2, 0.24, 0.06), M.lit, EX, 2.5, ZF + 0.12);
    part(api.box(0.07, 0.28, 0.07), M.trim, EX + 0.46, 1.15, ZF + 0.17);
    part(api.box(2.3, 0.14, 1.0), M.roofDark, EX, 3.05, ZF + 0.55);
    [-1, 1].forEach(function (s) { part(api.box(0.09, 0.55, 0.8), M.shell, EX + s * 0.95, 2.8, ZF + 0.45); });

    // ---- office windows: two over the entry, five on the east elevation
    [9.2, 11.8].forEach(function (u) { main.win('+z', u, 5.3, 1.2, 1.4, true); });
    [3.0, 0, -3.0].forEach(function (u) { main.win('+x', u, 5.3, 1.2, 1.4, true); });
    [-1.4, -4.2].forEach(function (u) { main.win('+x', u, 1.5, 1.2, 1.6, true); });

    // ---- roof mechanical
    part(api.box(1.8, 1.0, 1.6), M.roofDark, 7.5, HW + 0.6, -1.5);
    part(api.box(1.8, 0.16, 1.9), M.shell, 7.5, HW + 1.15, -1.5);
    part(api.cyl(0.34, 0.34, 1.0, 8), M.shell, 3.0, HW + 0.6, -3.2);
    part(api.box(2.8, 0.55, 1.4), M.roofDark, -6.5, HW + 0.4, -2.4);

    // ---- flagpole by the west door; the flag hangs on a sub-group that sways on tick
    var PX = -12.4, PZ = 9.4;
    part(api.cyl(0.5, 0.6, 0.3, 8), M.concrete, PX, 0.15, PZ);
    part(api.cyl(0.07, 0.11, 8.0, 8), M.shell, PX, 4.15, PZ);
    part(api.cone(0.12, 0.26, 6), M.cream, PX, 8.28, PZ);
    var flag = api.sub(PX + 0.06, 6.85, PZ);
    part(api.box(1.9, 1.1, 0.05), M.b, 0.95, 0, 0, 0, 0, 0, flag);
    part(api.box(1.9, 0.16, 0.06), M.cream, 0.95, -0.10, 0.01, 0, 0, 0, flag);
    part(api.box(1.9, 0.16, 0.06), M.cream, 0.95, -0.40, 0.01, 0, 0, 0, flag);
    part(api.box(0.78, 0.5, 0.07), M.glass, 0.39, 0.3, 0.015, 0, 0, 0, flag);
    api.onTick(function (t, dt, wind) {
      var s = 0.6 + 0.6 * (wind.strength || 0);
      flag.rotation.y = 0.12 * s * Math.sin(t * 1.4);
      flag.rotation.z = -0.06 + 0.05 * s * Math.sin(t * 2.3 + 0.7);
    });

    // ---- bench against the facade, west of the first bay
    var BX = -11.6, BZ = 7.2;
    part(api.box(2.1, 0.1, 0.5), M.trim, BX, 0.45, BZ);
    part(api.box(2.1, 0.42, 0.09), M.trim, BX, 0.72, BZ - 0.21);
    [-1, 1].forEach(function (s) { part(api.box(0.1, 0.45, 0.46), M.dark, BX + s * 0.9, 0.225, BZ); });

    // ---- lot: pad, lighter concrete apron, driveway and rear yard, red curb along the street
    part(api.box(33.3, 0.15, 24.0), M.pad, -3.45, -0.075, -1.0);
    part(api.box(24.0, 0.05, 5.0), M.concrete, -1.2, 0.005, 8.5);
    part(api.box(6.4, 0.05, 23.6), M.concrete, -16.4, 0.005, -1.2);
    part(api.box(25.6, 0.05, 6.6), M.concrete, 0, 0.005, -9.4);
    part(api.box(33.3, 0.26, 0.42), M.curb, -3.45, 0.03, 10.79);

    // ---- west boundary wall, gate piers and the rolling gate
    var GZ = 5.0, GW = 5.7, GC = -16.35, GH = 2.1;
    part(api.box(0.5, 2.2, 17.6), M.face, -19.6, 1.1, -3.6);
    part(api.box(0.68, 0.14, 17.6), M.shell, -19.6, 2.27, -3.6);
    part(api.box(0.8, 2.4, 0.9), M.face, -19.6, 1.2, GZ);
    part(api.box(0.98, 0.14, 1.08), M.shell, -19.6, 2.47, GZ);
    part(api.box(0.55, 2.4, 2.6), M.face, -13.25, 1.2, GZ + 0.4);
    part(api.box(0.73, 0.14, 2.78), M.shell, -13.25, 2.47, GZ + 0.4);
    part(api.box(GW, 0.13, 0.1), M.groove, GC, GH - 0.07, GZ);
    part(api.box(GW, 0.11, 0.1), M.groove, GC, 0.2, GZ);
    part(api.box(GW, 0.08, 0.08), M.groove, GC, 1.15, GZ);
    [-1, 1].forEach(function (s) { part(api.box(0.12, GH, 0.12), M.groove, GC + s * (GW / 2 - 0.06), GH / 2, GZ); });
    for (var g = 1; g < 14; g++) part(api.box(0.05, GH - 0.5, 0.06), M.groove, GC - GW / 2 + GW * g / 14, 0.25 + (GH - 0.5) / 2, GZ);
    part(api.box(GW + 0.6, 0.09, 0.16), M.dark, GC, 0.045, GZ);

    // ---- rear and east boundary walls around the yard
    part(api.box(33.0, 2.2, 0.5), M.face, -3.5, 1.1, -12.65);
    part(api.box(33.0, 0.14, 0.68), M.shell, -3.5, 2.27, -12.65);
    part(api.box(0.5, 2.2, 6.7), M.face, 12.75, 1.1, -9.3);
    part(api.box(0.68, 0.14, 6.7), M.shell, 12.75, 2.27, -9.3);

    // recentre the lot on the origin in x
    api.group.children.forEach(function (c) { c.position.x += 3.45; });
  }
});

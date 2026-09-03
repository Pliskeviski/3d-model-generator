// Santa Monica house: two-storey stucco over four garage doors, side stairs with gate. Units are metres, shown at 1.5 scale.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'house',
  name: 'Santa Monica House',
  kind: 'building',
  units: 'm',
  scale: 1.5,
  camera: { pivotY: 3.5, fitW: 29.5, baseMin: 36, homePhi: 0.2, homeYaw: -0.3, tilt: 0.05 },
  colorways: 'stucco',
  notes: 'Stucco box whose top vertices rise to the right for the shed roof, fascia and roof slab, five pillars with four recessed garage doors, four trimmed windows with one lit pane, roof vents, house number, driveway pad, side stairs with handrail, planter cheek, gate and fence. Proportions measured off a street photo.',
  build: function (api) {
    var M = api.M, part = api.part;
    var W = 12.6, D = 9.0, H1 = 2.7, HL = 5.4, HR = 5.95, F = D / 2;

    // walls: a box whose top edge rises left to right for the shed roof
    var walls = api.box(W, HL, D); walls.translate(0, HL / 2, 0);
    api.displace(walls, function (x, y, z) { return y > HL - 0.01 ? [x, HL + (x / W + 0.5) * (HR - HL), z] : null; });
    part(walls, M.face, 0, 0, 0);

    // fascia and roof slab tilted to the same slope, two vents
    var slope = Math.atan((HR - HL) / W), yc = (HL + HR) / 2;
    part(api.box(W + 0.6, 0.28, D + 0.6), M.shell, 0, yc + 0.14, 0, 0, 0, slope);
    part(api.box(W + 0.6, 0.12, D + 0.6), M.roofDark, 0, yc + 0.34, 0, 0, 0, slope);
    part(api.cyl(0.06, 0.06, 0.6, 6), M.shell, 0.4, yc + 0.7, -1);
    part(api.cyl(0.07, 0.07, 0.8, 6), M.shell, 1.05, yc + 0.8, -1.2);

    // garage level: five pillars, header band, four recessed doors with grooves
    var PW = 0.3, DW = (W - 5 * PW) / 4, PD = 0.42, DH = H1 - 0.35;
    for (var k = 0; k < 5; k++) part(api.box(PW, H1, PD), M.shell, -W / 2 + PW / 2 + k * (PW + DW), H1 / 2, F + PD / 2);
    part(api.box(W, 0.35, PD), M.shell, 0, H1 - 0.175, F + PD / 2);
    for (var d = 0; d < 4; d++) {
      var cx = -W / 2 + PW + DW / 2 + d * (PW + DW);
      part(api.box(DW, DH, 0.1), M.shell, cx, DH / 2, F + 0.05);
      for (var g = 1; g < 5; g++) part(api.box(DW - 0.1, 0.03, 0.02), M.groove, cx, DH * g / 5, F + 0.11);
    }

    // windows: trim frame, sill, panes, mullions; one pane lit from inside
    function win(x, y, w, h, panes, litIndex) {
      var t = 0.1, zf = F + 0.06;
      part(api.box(w + 2 * t, t, 0.12), M.shell, x, y + h + t / 2, zf);
      part(api.box(w + 2 * t, t, 0.12), M.shell, x, y - t / 2, zf);
      part(api.box(t, h, 0.12), M.shell, x - w / 2 - t / 2, y + h / 2, zf);
      part(api.box(t, h, 0.12), M.shell, x + w / 2 + t / 2, y + h / 2, zf);
      part(api.box(w + 2 * t + 0.1, 0.08, 0.2), M.shell, x, y - t - 0.04, F + 0.1);
      var pw = w / panes;
      for (var i = 0; i < panes; i++) {
        part(api.box(pw - 0.04, h, 0.04), (i === litIndex) ? M.lit : M.glass, x - w / 2 + pw * (i + 0.5), y + h / 2, F + 0.02);
        if (i > 0) part(api.box(0.06, h, 0.1), M.shell, x - w / 2 + pw * i, y + h / 2, F + 0.05);
      }
    }
    win(-5.2, 3.75, 0.7, 1.05, 1, -1); win(-1.4, 4.05, 0.95, 1.1, 1, -1); win(2.15, 3.9, 2.35, 1.45, 3, 1); win(5.3, 4.2, 1.35, 1.3, 1, -1);

    // house number plaque and the driveway pad
    part(api.box(0.14, 0.9, 0.03), M.dark, 5.75, 3.5, F + 0.015);
    part(api.box(19.5, 0.15, 12), M.pad, 2.55, -0.075, 0.5);

    // side stairs: seven solid steps, landing, right wall, planter cheek with dry grass
    var SX0 = 7.3, SW = 3.5, RISE = 0.17, TREAD = 0.32, N = 7, Z0 = F + 2.0, TOP = N * RISE, RUN = N * TREAD;
    for (var st = 0; st < N; st++) part(api.box(SW, (st + 1) * RISE, TREAD), M.concrete, SX0 + SW / 2, (st + 1) * RISE / 2, Z0 - st * TREAD - TREAD / 2);
    part(api.box(SW, TOP, 2.0), M.concrete, SX0 + SW / 2, TOP / 2, Z0 - RUN - 1.0);
    part(api.box(1.0, TOP, RUN + 2.0), M.pad, SX0 + SW + 0.5, TOP / 2, Z0 - (RUN + 2.0) / 2);
    part(api.box(1.0, TOP, RUN + 0.5), M.face, SX0 - 0.5, TOP / 2, Z0 + 0.25 - (RUN + 0.5) / 2);
    [[6.6, F + 1.2], [6.95, F + 0.6], [6.75, F + 1.7], [7.05, F + 1.3]].forEach(function (t, i) { part(api.cone(0.28, 0.6 + 0.15 * (i % 2), 5), M.grass, t[0], TOP + 0.3 + 0.075 * (i % 2), t[1]); });

    // centre handrail
    var ang = Math.atan(TOP / RUN), RX = SX0 + SW / 2;
    part(api.box(0.05, 0.05, Math.sqrt(TOP * TOP + RUN * RUN) + 0.3), M.dark, RX, TOP / 2 + RISE + 0.9, Z0 - RUN / 2, ang);
    part(api.box(0.05, 0.9, 0.05), M.dark, RX, RISE + 0.45, Z0 - TREAD / 2);
    part(api.box(0.05, 0.9, 0.05), M.dark, RX, TOP + 0.45, Z0 - RUN + 0.15);

    // gate and fence across the landing
    var GZ = Z0 - RUN - 0.3;
    api.railing(6.3, 9.3, GZ, TOP, 1.6, 0.13, 0.06, 3.0, true);
    api.railing(9.3, 11.8, GZ, TOP, 1.6, 0.13, 0.05, 1.25, false);

    // recentre so the model turns about the middle of the whole lot
    api.group.children.forEach(function (c) { c.position.x -= 2.55; });
  }
});

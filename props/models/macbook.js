// MacBook Pro 14. Units are centimetres, shown at 0.6 scale.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'macbook',
  name: 'MacBook Pro 14',
  kind: 'prop',
  units: 'cm',
  scale: 0.6,
  camera: { pivotY: 5.6, fitW: 20, baseMin: 33, homePhi: 0.24, homeYaw: -0.45, tilt: 0.04 },
  colorways: 'props',
  notes: 'Two extruded rounded rectangles for base and lid on a hinge cylinder, all 81 keys as boxes in the real six-row layout, a notch, six ports, and a wallpaper drawn on a canvas for the screen.',
  build: function (api) {
    var THREE = api.THREE, M = api.M, part = api.part, DECK = 0.96;

    var base = api.extrude(api.roundedRect(31.3, 22.1, 1.2), { depth: 0.6, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.18, bevelSegments: 1, curveSegments: 2, steps: 1 });
    part(base, [M.face, M.shell], 0, 0.18, 0, -Math.PI / 2);

    // keyboard well and keys: six rows, widths in key units
    part(api.box(27.6, 0.12, 11.2), M.dark, 0, DECK + 0.06, -4.6);
    var PITCH = 1.83, GAP = 0.25, KY = DECK + 0.12 + 0.09;
    var rows = [
      { d: 0.55, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
      { d: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
      { d: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { d: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75] },
      { d: 1, keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25] },
      { d: 1, keys: [1, 1, 1, 1.25, 5, 1.25, 1, 'L', 'UD', 'R'] }
    ];
    var zc = -9.75;
    rows.forEach(function (row) {
      var depth = row.d * PITCH, zMid = zc + depth / 2, x = -14.5 * PITCH / 2;
      row.keys.forEach(function (k) {
        var units = (typeof k === 'number') ? k : 1, w = units * PITCH - GAP, xMid = x + units * PITCH / 2, hd = (depth - GAP) / 2 - 0.06;
        if (k === 'L' || k === 'R') part(api.box(w, 0.18, hd), M.keys, xMid, KY, zMid + depth / 4);
        else if (k === 'UD') { part(api.box(w, 0.18, hd), M.keys, xMid, KY, zMid - depth / 4); part(api.box(w, 0.18, hd), M.keys, xMid, KY, zMid + depth / 4); }
        else part(api.box(w, 0.18, depth - GAP), M.keys, xMid, KY, zMid);
        x += units * PITCH;
      });
      zc += depth;
    });

    // trackpad, speaker strips, ports, hinge
    part(api.box(13, 0.06, 8), M.shell, 0, DECK + 0.03, 5.8);
    [-1, 1].forEach(function (sd) { part(api.box(1.4, 0.04, 10.8), M.shell, sd * 14.5, DECK + 0.02, -4.6); });
    [[-1, -7.0, 1.2], [-1, -4.8, 0.9], [-1, -2.9, 0.9], [1, -6.6, 1.4], [1, -4.6, 0.9], [1, -2.4, 1.2]].forEach(function (pt) {
      part(api.box(0.24, 0.32, pt[2]), M.dark, pt[0] * 15.75, 0.48, pt[1]);
    });
    part(api.cyl(0.5, 0.5, 24, 8), M.dark, 0, 1.05, -10.7, 0, 0, Math.PI / 2);

    // lid, hinged at the back edge and opened 110 degrees; the screen faces the viewer
    var lid = api.sub(0, 1.15, -10.75, -THREE.MathUtils.degToRad(110), 0, 0);
    var lidGeo = api.extrude(api.roundedRect(31.3, 22.1, 1.2), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1, curveSegments: 2, steps: 1 });
    lidGeo.rotateX(Math.PI / 2); lidGeo.translate(0, 0.15, 11.05); lidGeo.computeVertexNormals();
    part(lidGeo, [M.face, M.shell], 0, 0, 0, 0, 0, 0, lid);
    part(api.plane(30.4, 21.2), M.dark, 0, -0.28, 11.05, Math.PI / 2, 0, 0, lid);
    var screen = api.canvasMaterial(1024, 664, function (g, W, H) {
      var grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#2B1533'); grd.addColorStop(0.35, '#7A2E4E'); grd.addColorStop(0.62, '#C74A45'); grd.addColorStop(0.82, '#E8703A'); grd.addColorStop(1, '#F6C46A');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      g.fillStyle = '#F6C46A'; g.beginPath(); g.arc(660, 420, 72, 0, Math.PI * 2); g.fill();
      var rnd = api.rand(99);
      [['#5A2447', 440, 90], ['#3A1838', 505, 70], ['#17101E', 565, 55]].forEach(function (L) {
        g.fillStyle = L[0]; g.beginPath(); g.moveTo(0, H); g.lineTo(0, L[1]);
        var x = 0; while (x < W) { x += 24 + rnd() * 46; g.lineTo(x, L[1] - rnd() * L[2]); }
        g.lineTo(W, H); g.closePath(); g.fill();
      });
      function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); g.fill(); }
      g.fillStyle = 'rgba(27,18,32,0.35)'; g.fillRect(0, 0, W, 26);
      g.fillStyle = 'rgba(241,227,196,0.22)'; rr(312, 592, 400, 56, 14);
      var dock = ['#E8703A', '#F6C46A', '#7FA86A', '#4F7EA8', '#CF4B3F', '#F1E3C4', '#B03D4D', '#2B1533'];
      for (var i = 0; i < 8; i++) { g.fillStyle = dock[i]; rr(326 + i * 48, 602, 36, 36, 8); }
    }, 0x7A2E4E);
    part(api.plane(28.6, 18.6), screen, 0, -0.31, 11.35, Math.PI / 2, 0, 0, lid);
    part(api.box(1.7, 0.05, 0.5), M.dark, 0, -0.33, 20.45, 0, 0, 0, lid);
  }
});

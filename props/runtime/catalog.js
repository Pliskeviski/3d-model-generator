/*
 * Two Forks catalog: furniture, fixtures and plan pieces for composing interiors in the house style.
 * Every item is a small assembly of boxes and cylinders placed by (x, z, rotation) with its front along +z,
 * built through the same api a model's build(api) receives. Units are metres.
 * Usage inside a scene model:  var C = TwoForksCatalog.init(api); C.sofa(3.0, 3.3, Math.PI);
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TwoForksCatalog = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function init(api) {
    var M = api.M, mat = function (c, e) { return api.mat(c, e); };
    var K = {
      wood: mat(0x9A7550), woodDark: mat(0x6B4E36), woodLight: mat(0xB08A62),
      floorWood: mat(0xA67B55), floorTile: mat(0xC9C0B0), floorConcrete: M.pad, concrete: M.concrete,
      white: mat(0xF1EBDD), cream: mat(0xE6DAC6), linen: mat(0xEDE3D0),
      fabric: mat(0x4F7EA8), rust: mat(0xB86A4A), plum: mat(0x6B2A4A), navy: mat(0x3E4A66),
      rugRed: mat(0xB03D4D), rugNavy: mat(0x4F5D75), rugSand: mat(0xC9A86A),
      metal: mat(0x8A8F96), black: M.dark, leaf: mat(0x5F8A52), pot: mat(0xB5613C), tan: mat(0xC9A97A), dog: mat(0xB89A6A),
      card: mat(0xB89B6E), door: mat(0x8C6A4A), red: M.b, blue: M.x, yellow: M.y, green: M.a, glass: M.glass, lit: M.lit
    };
    var BOOKS = [K.green, K.red, K.blue, K.yellow, K.plum, K.navy, K.cream, K.rugRed, K.tan];
    var rnd = api.rand(11);
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function at(x, z, rot, parent, y) { return api.sub(x, y || 0, z, 0, rot || 0, 0, parent); }
    function B(g, w, h, d, m, x, y, z, rx, ry, rz) { return api.part(api.box(w, h, d), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    function Cy(g, rt, rb, h, seg, m, x, y, z, rx, ry, rz) { return api.part(api.cyl(rt, rb, h, seg), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    function legs(g, w, d, h, m, inset, r) { [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { Cy(g, r || 0.025, r || 0.025, h, 6, m, s * (w / 2 - (inset || 0.08)), h / 2, t * (d / 2 - (inset || 0.08))); }); }); }
    var C = { K: K };

    // ---------- plan pieces
    C.floor = function (x0, z0, x1, z1, m, parent) { return api.part(api.box(x1 - x0, 0.06, z1 - z0), m || K.floorWood, (x0 + x1) / 2, -0.03, (z0 + z1) / 2, 0, 0, 0, parent); };
    // segs: [[x0,z0,x1,z1]] axis-aligned. doors: [{x,z,w,axis:'x'|'z',leaf:true,swing:1|-1}]. o: {h,t,mat,parent}
    C.walls = function (segs, doors, o) {
      o = o || {}; var h = o.h || 0.95, t = o.t || 0.12, m = o.mat || M.face, g = o.parent;
      doors = doors || [];
      segs.forEach(function (seg) {
        var x0 = seg[0], z0 = seg[1], x1 = seg[2], z1 = seg[3], horiz = Math.abs(z1 - z0) < 1e-6;
        var a = horiz ? Math.min(x0, x1) : Math.min(z0, z1), b = horiz ? Math.max(x0, x1) : Math.max(z0, z1), gaps = [];
        doors.forEach(function (d) {
          if (horiz && d.axis === 'x' && Math.abs(d.z - z0) < 1e-6 && d.x > a && d.x < b) gaps.push([d.x - d.w / 2, d.x + d.w / 2]);
          if (!horiz && d.axis === 'z' && Math.abs(d.x - x0) < 1e-6 && d.z > a && d.z < b) gaps.push([d.z - d.w / 2, d.z + d.w / 2]);
        });
        gaps.sort(function (p, q) { return p[0] - q[0]; });
        var cur = a, pieces = [];
        gaps.forEach(function (gp) { if (gp[0] > cur) pieces.push([cur, gp[0]]); cur = Math.max(cur, gp[1]); });
        if (cur < b) pieces.push([cur, b]);
        pieces.forEach(function (pc) {
          var p = pc[0] === a ? pc[0] - t / 2 : pc[0], q = pc[1] === b ? pc[1] + t / 2 : pc[1], len = q - p, mid = (p + q) / 2;
          if (horiz) B(g, len, h, t, m, mid, h / 2, z0); else B(g, t, h, len, m, x0, h / 2, mid);
        });
      });
      doors.forEach(function (d) {
        var lh = h * 0.96, lw = d.w - 0.06;
        if (d.axis === 'x') {
          [-1, 1].forEach(function (s) { B(g, 0.06, h + 0.04, t + 0.04, K.door, d.x + s * (d.w / 2 + 0.03), (h + 0.04) / 2, d.z); });
          if (d.leaf) { var s1 = api.sub(d.x - d.w / 2 + 0.03, 0, d.z, 0, (d.swing || 1) * 1.25, 0, g); B(s1, lw, lh, 0.04, K.door, lw / 2, lh / 2, 0); }
        } else {
          [-1, 1].forEach(function (s) { B(g, t + 0.04, h + 0.04, 0.06, K.door, d.x, (h + 0.04) / 2, d.z + s * (d.w / 2 + 0.03)); });
          if (d.leaf) { var s2 = api.sub(d.x, 0, d.z - d.w / 2 + 0.03, 0, (d.swing || 1) * 1.25, 0, g); B(s2, 0.04, lh, lw, K.door, 0, lh / 2, lw / 2); }
        }
      });
    };
    // the cut-down front of the garage: pillars and door panels
    C.garageFront = function (x0, x1, z, bays, h, parent) {
      var PW = 0.3, W = x1 - x0, DW = (W - (bays + 1) * PW) / bays, i;
      for (i = 0; i <= bays; i++) B(parent, PW, h, 0.25, M.shell, x0 + PW / 2 + i * (PW + DW), h / 2, z);
      for (i = 0; i < bays; i++) { var cx = x0 + PW + DW / 2 + i * (PW + DW); B(parent, DW, h, 0.1, M.shell, cx, h / 2, z - 0.05); B(parent, DW - 0.1, 0.03, 0.02, K.tan, cx, h * 0.5, z - 0.11); }
    };
    // embed another model's build at real size: o.length (metres) along its longest horizontal axis.
    // The prop gets its own face and shell materials (its first colorway, or o.colorway, or o.face / o.shell hex overrides)
    // so it does not take the scene's colorway.
    C.prop = function (def, x, z, rot, o) {
      o = o || {}; var g = at(x, z, rot, o.parent), inner = api.sub(0, 0, 0, 0, 0, 0, g);
      var cws = typeof def.colorways === 'string' ? (api.COLORWAYS || {})[def.colorways] : def.colorways;
      var cw = (cws || []).filter(function (c) { return c.id === o.colorway; })[0] || (cws && cws[0]) || { face: 0x3A2E42, shell: 0x2A2032 };
      var sub = api.forGroup(inner, { face: mat(o.face != null ? o.face : cw.face), shell: mat(o.shell != null ? o.shell : cw.shell) });
      var own = def.scale || 1; inner.scale.setScalar(own);
      def.build(sub);
      // measure in the prop's own frame: geometry boxes brought into inner's local space, so rotation of any parent
      // (a scene turned to a street bearing, the placement yaw) cannot inflate the axis-aligned box
      inner.updateMatrixWorld(true);
      var T = api.THREE, inv = new T.Matrix4().copy(inner.matrixWorld).invert(), box = new T.Box3(), tmp = new T.Matrix4();
      inner.traverse(function (m) { if (!m.isMesh) return; m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox.clone().applyMatrix4(tmp.multiplyMatrices(inv, m.matrixWorld))); });
      var size = new T.Vector3(); box.getSize(size);            // in the prop's unscaled units
      var longest = Math.max(size.x, size.z) * own, k = o.length ? o.length / longest : 1;
      inner.scale.setScalar(own * k);
      inner.position.y = -box.min.y * own * k;     // stand it on the floor
      if (o.yaw) inner.rotation.y = o.yaw;         // if the prop's own front is not +z
      g.userData.propSize = { x: size.x * own * k, y: size.y * own * k, z: size.z * own * k };
      return g;
    };

    // ---------- soft furniture
    C.sofa = function (x, z, rot, o) {
      o = o || {}; var w = o.w || 2.2, d = 0.9, f = o.mat || K.fabric, g = at(x, z, rot, o.parent);
      B(g, w, 0.4, d, f, 0, 0.28, 0); B(g, w, 0.45, 0.22, f, 0, 0.7, -d / 2 + 0.11);
      [-1, 1].forEach(function (s) { B(g, 0.2, 0.62, d, f, s * (w / 2 - 0.1), 0.39, 0); });
      var n = o.seats || Math.max(1, Math.round(w / 0.75)), cw = (w - 0.4) / n;
      for (var i = 0; i < n; i++) B(g, cw - 0.05, 0.12, d - 0.3, f, -w / 2 + 0.2 + cw * (i + 0.5), 0.54, 0.06);
      legs(g, w, d, 0.08, K.woodDark, 0.14, 0.03);
      if (o.pillow) B(g, 0.4, 0.4, 0.12, o.pillow, w / 2 - 0.45, 0.75, -d / 2 + 0.3, 0.25);
      return g;
    };
    C.armchair = function (x, z, rot, o) { return C.sofa(x, z, rot, Object.assign({ w: 0.95, seats: 1, mat: K.rust }, o || {})); };
    C.beanbag = function (x, z, rot, o) { var g = at(x, z, rot); Cy(g, 0.3, 0.42, 0.4, 7, (o && o.mat) || K.rugNavy, 0, 0.2, 0); Cy(g, 0.22, 0.28, 0.06, 7, (o && o.mat) || K.rugNavy, 0, 0.42, 0.04); return g; };
    C.rug = function (x, z, rot, w, d, m) { var g = at(x, z, rot); B(g, w, 0.015, d, m || K.rugRed, 0, 0.008, 0); return g; };

    // ---------- tables, seating, storage
    C.coffeeTable = function (x, z, rot, o) { o = o || {}; var w = o.w || 1.1, d = o.d || 0.55, g = at(x, z, rot); B(g, w, 0.04, d, K.wood, 0, 0.42, 0); legs(g, w, d, 0.4, K.woodDark, 0.07, 0.02); B(g, 0.22, 0.03, 0.16, K.navy, -0.2, 0.455, 0.05, 0, 0.2); Cy(g, 0.04, 0.035, 0.09, 8, K.cream, 0.3, 0.485, -0.1); return g; };
    C.sideTable = function (x, z, rot) { var g = at(x, z, rot); Cy(g, 0.25, 0.25, 0.03, 10, K.wood, 0, 0.55, 0); Cy(g, 0.03, 0.03, 0.55, 6, K.woodDark, 0, 0.27, 0); Cy(g, 0.15, 0.15, 0.02, 8, K.woodDark, 0, 0.01, 0); Cy(g, 0.045, 0.04, 0.09, 8, K.plum, 0.08, 0.61, 0.05); return g; };
    C.diningTable = function (x, z, rot, o) { o = o || {}; var w = o.w || 1.6, d = o.d || 0.9, g = at(x, z, rot); B(g, w, 0.04, d, K.wood, 0, 0.74, 0); legs(g, w, d, 0.72, K.woodDark, 0.1, 0.03); return g; };
    C.chair = function (x, z, rot, o) { var m = (o && o.mat) || K.wood, g = at(x, z, rot); B(g, 0.42, 0.04, 0.42, m, 0, 0.45, 0); B(g, 0.42, 0.42, 0.03, m, 0, 0.68, -0.195); legs(g, 0.42, 0.42, 0.43, K.woodDark, 0.04, 0.015); return g; };
    C.stool = function (x, z, rot) { var g = at(x, z, rot); Cy(g, 0.16, 0.16, 0.04, 8, K.wood, 0, 0.66, 0); for (var i = 0; i < 3; i++) { var a = i * 2.094; Cy(g, 0.015, 0.015, 0.64, 6, K.metal, Math.sin(a) * 0.12, 0.32, Math.cos(a) * 0.12); } return g; };
    C.bench = function (x, z, rot, o) { var g = at(x, z, rot); B(g, 0.9, 0.05, 0.4, K.wood, 0, 0.45, 0); legs(g, 0.9, 0.4, 0.43, K.woodDark, 0.06, 0.02); if (!(o && o.bare)) [K.fabric, K.cream, K.rust].forEach(function (m, i) { B(g, 0.3, 0.06, 0.3, m, -0.15 + i * 0.05, 0.505 + i * 0.06, 0, 0, i * 0.1); }); return g; };
    C.desk = function (x, z, rot, o) { o = o || {}; var w = o.w || 1.4, d = o.d || 0.65, g = at(x, z, rot); B(g, w, 0.04, d, K.wood, 0, 0.74, 0); [-1, 1].forEach(function (s) { B(g, 0.04, 0.72, d - 0.06, K.woodDark, s * (w / 2 - 0.03), 0.36, 0); }); B(g, w - 0.1, 0.03, 0.3, K.woodDark, 0, 0.2, -0.15); return g; };
    C.officeChair = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.48, 0.08, 0.48, K.black, 0, 0.48, 0); B(g, 0.46, 0.5, 0.06, K.black, 0, 0.8, -0.22); Cy(g, 0.025, 0.025, 0.42, 6, K.metal, 0, 0.23, 0); Cy(g, 0.3, 0.3, 0.03, 5, K.black, 0, 0.02, 0); return g; };
    C.bookshelf = function (x, z, rot, o) {
      o = o || {}; var w = o.w || 0.8, h = o.h || 1.8, d = o.d || 0.3, n = o.shelves || Math.max(2, Math.round(h / 0.36)), g = at(x, z, rot), m = o.mat || K.wood;
      [-1, 1].forEach(function (s) { B(g, 0.03, h, d, m, s * (w / 2 - 0.015), h / 2, 0); });
      B(g, w, 0.03, d, m, 0, h - 0.015, 0); B(g, w - 0.06, h, 0.02, m, 0, h / 2, -d / 2 + 0.01);
      var gap = (h - 0.03) / n;
      for (var i = 0; i < n; i++) {
        var y = i * gap + 0.015; B(g, w - 0.06, 0.03, d, m, 0, y, 0);
        var bx = -w / 2 + 0.05, fill = 0.4 + rnd() * 0.5;
        while (bx < -w / 2 + 0.05 + (w - 0.1) * fill) { var bw = 0.025 + rnd() * 0.04, bh = 0.16 + rnd() * 0.12; if (bx + bw > w / 2 - 0.05) break; B(g, bw, bh, d - 0.08, pick(BOOKS), bx + bw / 2, y + 0.015 + bh / 2, 0.02); bx += bw + 0.004; }
      }
      return g;
    };
    C.cubeShelf = function (x, z, rot, o) {
      o = o || {}; var cols = o.cols || 4, rows = o.rows || 2, s = 0.37, w = cols * s + 0.03, h = rows * s + 0.03, d = 0.39, g = at(x, z, rot), m = K.white, i, j;
      for (i = 0; i <= cols; i++) B(g, 0.03, h, d, m, -w / 2 + 0.015 + i * s, h / 2, 0);
      for (j = 0; j <= rows; j++) B(g, w, 0.03, d, m, 0, 0.015 + j * s, 0);
      B(g, w, h, 0.02, m, 0, h / 2, -d / 2 + 0.01);
      for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
        var cx = -w / 2 + 0.03 + i * s + s / 2, cy = 0.03 + j * s;
        if (rnd() < 0.8) { var n = 5 + Math.floor(rnd() * 6); for (var k = 0; k < n; k++) B(g, 0.02, 0.31, 0.31, pick(BOOKS), cx - s / 2 + 0.04 + k * 0.026, cy + 0.155, 0.01); }
        else B(g, 0.28, 0.26, 0.3, K.card, cx, cy + 0.13, 0);
      }
      if (o.turntable) { B(g, 0.44, 0.08, 0.36, K.black, -w / 2 + 0.3, h + 0.04, 0); Cy(g, 0.15, 0.15, 0.012, 12, K.metal, -w / 2 + 0.28, h + 0.086, 0.01); Cy(g, 0.15, 0.15, 0.006, 12, K.black, -w / 2 + 0.28, h + 0.095, 0.01); B(g, 0.02, 0.015, 0.2, K.metal, -w / 2 + 0.47, h + 0.1, -0.05, 0, 0.35); C.plant(w / 2 - 0.3, 0, 0, { size: 0.6, parent: g, y: h + 0.015 }); }
      return g;
    };
    C.dresser = function (x, z, rot) { var g = at(x, z, rot); B(g, 1.2, 0.85, 0.5, K.wood, 0, 0.425, 0); for (var r = 0; r < 3; r++) for (var c = -1; c <= 1; c += 2) B(g, 0.12, 0.02, 0.02, K.metal, c * 0.3, 0.2 + r * 0.25, 0.26); legs(g, 1.2, 0.5, 0.0, K.wood, 0.1, 0.02); return g; };
    C.wardrobe = function (x, z, rot, o) { var w = (o && o.w) || 1.8, g = at(x, z, rot); B(g, w, 2.1, 0.6, K.woodDark, 0, 1.05, 0); B(g, 0.02, 1.9, 0.02, K.wood, 0, 1.05, 0.31); [-1, 1].forEach(function (s) { B(g, 0.02, 0.18, 0.02, K.metal, s * 0.06, 1.05, 0.32); }); return g; };
    C.nightstand = function (x, z, rot, o) { var g = at(x, z, rot); B(g, 0.45, 0.55, 0.4, K.wood, 0, 0.275, 0); B(g, 0.12, 0.02, 0.02, K.metal, 0, 0.35, 0.21); Cy(g, 0.06, 0.07, 0.02, 8, K.metal, 0.1, 0.56, -0.05); Cy(g, 0.01, 0.01, 0.2, 6, K.metal, 0.1, 0.66, -0.05); Cy(g, 0.09, 0.12, 0.15, 8, K.lit, 0.1, 0.82, -0.05); if (!(o && o.noBook)) B(g, 0.14, 0.03, 0.2, pick(BOOKS), -0.12, 0.565, 0.05, 0, 0.3); return g; };
    C.toyBox = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.6, 0.4, 0.4, K.woodLight, 0, 0.2, 0); B(g, 0.62, 0.03, 0.42, K.wood, 0, 0.415, 0); return g; };
    C.consoleTable = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.9, 0.03, 0.3, K.wood, 0, 0.8, 0); legs(g, 0.9, 0.3, 0.79, K.woodDark, 0.05, 0.015); Cy(g, 0.1, 0.07, 0.05, 8, K.plum, 0.25, 0.84, 0); return g; };
    C.shoeBench = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.9, 0.04, 0.35, K.wood, 0, 0.42, 0); [-1, 1].forEach(function (s) { B(g, 0.04, 0.42, 0.35, K.wood, s * 0.43, 0.21, 0); }); B(g, 0.86, 0.03, 0.33, K.wood, 0, 0.2, 0); [[-0.28, K.black], [0, K.rugRed], [0.28, K.tan]].forEach(function (p) { [-1, 1].forEach(function (s) { B(g, 0.09, 0.07, 0.26, p[1], p[0] + s * 0.055, 0.035, 0.02); }); }); Cy(g, 0.12, 0.13, 0.14, 8, K.red, 0.2, 0.51, 0); return g; };
    C.coatRack = function (x, z, rot) { var g = at(x, z, rot); Cy(g, 0.15, 0.17, 0.02, 8, K.woodDark, 0, 0.01, 0); Cy(g, 0.02, 0.02, 1.7, 6, K.woodDark, 0, 0.85, 0); for (var i = 0; i < 4; i++) { var a = i * 1.57; B(g, 0.02, 0.02, 0.12, K.woodDark, Math.sin(a) * 0.06, 1.55, Math.cos(a) * 0.06, 0, a); } B(g, 0.36, 0.7, 0.1, K.rust, 0.13, 1.15, 0.1); B(g, 0.34, 0.62, 0.1, K.navy, -0.14, 1.2, 0.08); return g; };
    C.laundryBasket = function (x, z, rot) { var g = at(x, z, rot); Cy(g, 0.22, 0.19, 0.5, 8, K.cream, 0, 0.25, 0); B(g, 0.3, 0.1, 0.3, K.fabric, 0, 0.54, 0, 0, 0.3); return g; };
    C.shoes = function (x, z, rot, m) { var g = at(x, z, rot); [-1, 1].forEach(function (s) { B(g, 0.09, 0.07, 0.27, m || K.black, s * 0.06, 0.035, 0); }); return g; };
    C.backpack = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.3, 0.42, 0.18, K.rugRed, 0, 0.21, 0); B(g, 0.26, 0.16, 0.06, K.black, 0, 0.14, 0.11); return g; };
    C.papers = function (x, z, rot, y) { var g = at(x, z, rot, null, y); for (var i = 0; i < 3; i++) B(g, 0.3, 0.006, 0.22, K.white, i * 0.02, 0.003 + i * 0.006, i * 0.01, 0, i * 0.12 - 0.1); return g; };
    C.laptop = function (x, z, rot, y) { var g = at(x, z, rot, null, y); B(g, 0.32, 0.015, 0.22, K.metal, 0, 0.008, 0); B(g, 0.32, 0.21, 0.01, K.metal, 0, 0.1, -0.13, -0.35); B(g, 0.29, 0.18, 0.005, K.glass, 0, 0.1, -0.126, -0.35); return g; };
    C.mug = function (x, z, y, m) { var g = at(x, z, 0, null, y); Cy(g, 0.045, 0.04, 0.09, 8, m || K.cream, 0, 0.045, 0); return g; };
    C.fruitBowl = function (x, z, y) { var g = at(x, z, 0, null, y); Cy(g, 0.18, 0.12, 0.08, 10, K.wood, 0, 0.04, 0); [[K.yellow, -0.06, 0], [K.red, 0.05, 0.03], [K.green, 0, -0.06]].forEach(function (f) { Cy(g, 0.04, 0.04, 0.06, 6, f[0], f[1], 0.1, f[2]); }); return g; };
    C.plant = function (x, z, rot, o) {
      o = o || {}; var s = o.size || 1, g = at(x, z, rot, o.parent, o.y);
      Cy(g, 0.16 * s, 0.12 * s, 0.3 * s, 8, K.pot, 0, 0.15 * s, 0); Cy(g, 0.14 * s, 0.14 * s, 0.02, 8, K.woodDark, 0, 0.3 * s, 0);
      Cy(g, 0.012, 0.015, 0.5 * s, 5, K.leaf, 0, 0.55 * s, 0);
      var n = o.leaves || 5;
      for (var i = 0; i < n; i++) { var a = i * 1.25 + (o.seed || 0), r = 0.14 * s; B(g, 0.22 * s, 0.015, 0.34 * s, K.leaf, Math.sin(a) * r, (0.5 + i * 0.09) * s, Math.cos(a) * r, -0.5, a, 0); }
      return g;
    };
    C.floorLamp = function (x, z) { var g = at(x, z, 0); Cy(g, 0.14, 0.15, 0.02, 8, K.metal, 0, 0.01, 0); Cy(g, 0.015, 0.015, 1.5, 6, K.metal, 0, 0.76, 0); Cy(g, 0.16, 0.2, 0.28, 8, K.lit, 0, 1.58, 0); return g; };
    C.dogBed = function (x, z, rot, o) {
      var g = at(x, z, rot); Cy(g, 0.42, 0.44, 0.16, 10, K.cream, 0, 0.08, 0); Cy(g, 0.33, 0.33, 0.04, 10, K.rugNavy, 0, 0.17, 0);
      if (!(o && o.empty)) { var d = api.sub(0, 0.19, 0, 0, 0.5, 0, g); B(d, 0.4, 0.18, 0.24, K.dog, 0, 0.09, 0); B(d, 0.15, 0.12, 0.14, K.dog, 0.22, 0.1, 0.06, 0, 0.5); [-1, 1].forEach(function (s) { B(d, 0.05, 0.06, 0.03, K.woodDark, 0.24 + s * 0.05, 0.17, 0.1); }); B(d, 0.16, 0.03, 0.03, K.dog, -0.22, 0.12, 0.08, 0, -0.6); }
      return g;
    };
    C.dogBowls = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.5, 0.01, 0.3, K.rugNavy, 0, 0.005, 0); [-1, 1].forEach(function (s) { Cy(g, 0.09, 0.07, 0.07, 8, K.metal, s * 0.13, 0.045, 0); }); return g; };
    C.skateboard = function (x, z, rot, o) {
      o = o || {}; var g = at(x, z, rot);
      if (o.upright) { var s = api.sub(0, 0, 0, -1.3, 0, 0, g); B(s, 0.2, 0.02, 0.8, K.wood, 0, 0.06, 0.4); [-1, 1].forEach(function (t) { Cy(s, 0.028, 0.028, 0.03, 8, K.cream, t * 0.085, 0.03, 0.4 + 0.26); Cy(s, 0.028, 0.028, 0.03, 8, K.cream, t * 0.085, 0.03, 0.4 - 0.26); }); return g; }
      B(g, 0.8, 0.02, 0.2, o.mat || K.wood, 0, 0.09, 0); [-1, 1].forEach(function (t) { B(g, 0.12, 0.02, 0.2, o.mat || K.wood, t * 0.44, 0.11, 0, 0, 0, t * 0.4); B(g, 0.03, 0.03, 0.18, K.metal, t * 0.26, 0.06, 0); [-1, 1].forEach(function (u) { Cy(g, 0.028, 0.028, 0.03, 8, K.cream, t * 0.26, 0.03, u * 0.095, Math.PI / 2); }); });
      return g;
    };
    C.legoBins = function (x, z, rot) { var g = at(x, z, rot); [K.blue, K.yellow, K.red].forEach(function (m, i) { B(g, 0.42, 0.24, 0.32, m, 0, 0.12 + i * 0.25, 0); B(g, 0.44, 0.02, 0.34, K.white, 0, 0.25 + i * 0.25, 0); }); return g; };
    C.legoBuild = function (x, z, y) { var g = at(x, z, 0, null, y); for (var i = 0; i < 7; i++) { var s = 0.03 + rnd() * 0.05; B(g, s, 0.02 + rnd() * 0.05, s, pick([K.red, K.blue, K.yellow, K.green, K.white]), (rnd() - 0.5) * 0.22, 0.02 + i * 0.012, (rnd() - 0.5) * 0.16); } return g; };

    // ---------- kitchen
    C.counter = function (x, z, rot, len) { var g = at(x, z, rot); B(g, len, 0.86, 0.6, K.white, 0, 0.43, 0); B(g, len + 0.03, 0.04, 0.63, K.woodDark, 0, 0.88, 0.015); var n = Math.max(1, Math.round(len / 0.5)); for (var i = 0; i < n; i++) B(g, 0.12, 0.02, 0.02, K.metal, -len / 2 + len * (i + 0.5) / n, 0.72, 0.31); return g; };
    C.sink = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.6, 0.16, 0.42, K.metal, 0, 0.83, 0); Cy(g, 0.015, 0.015, 0.26, 6, K.metal, 0, 1.03, -0.2); B(g, 0.03, 0.02, 0.18, K.metal, 0, 1.15, -0.11); return g; };
    C.stove = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.76, 0.9, 0.62, K.white, 0, 0.45, 0); B(g, 0.76, 0.02, 0.62, K.black, 0, 0.91, 0); [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]].forEach(function (p) { Cy(g, 0.08, 0.08, 0.01, 8, K.metal, p[0], 0.925, p[1]); }); B(g, 0.66, 0.02, 0.01, K.metal, 0, 0.75, 0.315); B(g, 0.6, 0.03, 0.03, K.metal, 0, 0.7, 0.33); Cy(g, 0.13, 0.12, 0.03, 8, K.black, -0.2, 0.945, 0.15); B(g, 0.14, 0.02, 0.03, K.black, -0.37, 0.95, 0.15); return g; };
    C.fridge = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.75, 1.8, 0.7, K.white, 0, 0.9, 0); B(g, 0.73, 0.01, 0.01, K.metal, 0, 1.3, 0.355); B(g, 0.02, 0.4, 0.03, K.metal, -0.25, 0.95, 0.37); B(g, 0.02, 0.25, 0.03, K.metal, -0.25, 1.5, 0.37); return g; };

    // ---------- bedroom, bath, studio
    C.bed = function (x, z, rot, o) {
      o = o || {}; var w = o.w || 1.6, l = o.l || 2.0, g = at(x, z, rot);
      B(g, w + 0.08, 0.22, l + 0.08, K.woodDark, 0, 0.11, 0); B(g, w, 0.22, l, K.linen, 0, 0.33, 0);
      B(g, w + 0.03, 0.05, l * 0.62, o.blanket || K.plum, 0, 0.465, l * 0.19);
      var n = w > 1.2 ? 2 : 1; for (var i = 0; i < n; i++) B(g, w / n - 0.14, 0.1, 0.4, K.white, -w / 2 + (w / n) * (i + 0.5), 0.49, -l / 2 + 0.28);
      B(g, w + 0.08, 0.55, 0.06, K.woodDark, 0, 0.5, -l / 2 - 0.03);
      return g;
    };
    C.toilet = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.42, 0.4, 0.18, K.white, 0, 0.6, -0.2); Cy(g, 0.2, 0.16, 0.38, 8, K.white, 0, 0.19, 0.08); Cy(g, 0.21, 0.21, 0.03, 8, K.cream, 0, 0.405, 0.08); return g; };
    C.vanity = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.9, 0.82, 0.5, K.wood, 0, 0.41, 0); B(g, 0.94, 0.04, 0.54, K.white, 0, 0.84, 0); Cy(g, 0.18, 0.14, 0.08, 10, K.linen, 0, 0.87, 0.02); Cy(g, 0.012, 0.012, 0.18, 6, K.metal, 0, 0.95, -0.18); Cy(g, 0.03, 0.03, 0.09, 8, K.plum, 0.32, 0.9, -0.1); return g; };
    C.bathtub = function (x, z, rot) { var g = at(x, z, rot); B(g, 1.7, 0.55, 0.75, K.white, 0, 0.275, 0); B(g, 1.5, 0.06, 0.55, K.glass, 0, 0.53, 0); Cy(g, 0.015, 0.015, 1.7, 6, K.metal, -0.78, 1.35, -0.3); B(g, 0.12, 0.03, 0.12, K.metal, -0.72, 2.18, -0.28); B(g, 0.03, 0.03, 0.14, K.metal, -0.78, 0.62, -0.28); return g; };
    C.monitor = function (x, z, rot, y, o) { var w = (o && o.w) || 0.6, g = at(x, z, rot, null, y); B(g, 0.24, 0.02, 0.16, K.black, 0, 0.01, 0); B(g, 0.04, 0.14, 0.03, K.black, 0, 0.09, -0.02); B(g, w, w * 0.58, 0.03, K.glass, 0, 0.16 + w * 0.29, -0.02); return g; };
    C.speaker = function (x, z, rot, y) { var g = at(x, z, rot, null, y); B(g, 0.18, 0.28, 0.2, K.black, 0, 0.14, 0); Cy(g, 0.06, 0.06, 0.01, 8, K.navy, 0, 0.1, 0.1, Math.PI / 2); Cy(g, 0.025, 0.025, 0.01, 8, K.metal, 0, 0.22, 0.1, Math.PI / 2); return g; };
    C.midiKeyboard = function (x, z, rot, y) { var g = at(x, z, rot, null, y); B(g, 0.9, 0.05, 0.25, K.black, 0, 0.025, 0); B(g, 0.86, 0.015, 0.12, K.white, 0, 0.055, 0.05); return g; };
    C.headphones = function (x, z, y) { var g = at(x, z, 0, null, y); api.part(api.torus(0.08, 0.015, 6, 10), K.black, 0, 0.02, 0, Math.PI / 2, 0, 0, g); return g; };
    C.micStand = function (x, z, rot) { var g = at(x, z, rot); Cy(g, 0.14, 0.15, 0.02, 8, K.black, 0, 0.01, 0); Cy(g, 0.012, 0.012, 1.2, 6, K.black, 0, 0.6, 0); B(g, 0.02, 0.02, 0.5, K.black, 0, 1.24, 0.2, 0.4); Cy(g, 0.03, 0.025, 0.14, 8, K.metal, 0, 1.34, 0.42, 0.9); return g; };

    // ---------- garage
    C.car = function (x, z, rot, o) {
      var body = (o && o.color) || K.navy, g = at(x, z, rot, o && o.parent); if (o && o.size) g.scale.setScalar(o.size);
      B(g, 1.62, 0.42, 3.6, body, 0, 0.5, 0); B(g, 1.45, 0.5, 2.0, body, 0, 0.96, -0.2); B(g, 1.48, 0.3, 1.9, K.glass, 0, 1.0, -0.2);
      [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { Cy(g, 0.3, 0.3, 0.2, 8, K.black, s * 0.74, 0.3, t * 1.15, 0, 0, Math.PI / 2); Cy(g, 0.14, 0.14, 0.21, 8, K.cream, s * 0.74, 0.3, t * 1.15, 0, 0, Math.PI / 2); }); B(g, 0.28, 0.1, 0.03, K.lit, s * 0.55, 0.62, 1.81); B(g, 0.22, 0.1, 0.03, K.red, s * 0.6, 0.62, -1.81); B(g, 0.12, 0.08, 0.1, body, s * 0.85, 0.95, 0.65); });
      B(g, 1.6, 0.16, 0.12, K.black, 0, 0.32, 1.82); B(g, 1.6, 0.16, 0.12, K.black, 0, 0.32, -1.82);
      return g;
    };
    C.bike = function (x, z, rot, o) {
      var f = (o && o.color) || K.red, s = (o && o.size) || 1, g = at(x, z, rot);
      [-1, 1].forEach(function (t) { api.part(api.torus(0.33 * s, 0.02, 6, 12), K.black, 0, 0.33 * s, t * 0.52 * s, 0, Math.PI / 2, 0, g); });
      B(g, 0.025, 0.025, 0.52 * s, f, 0, 0.85 * s, 0.0); B(g, 0.025, 0.5 * s, 0.025, f, 0, 0.6 * s, -0.25 * s); B(g, 0.025, 0.025, 0.7 * s, f, 0, 0.62 * s, 0.02, 0.62); B(g, 0.025, 0.55 * s, 0.025, f, 0, 0.58 * s, 0.4 * s, 0.25); B(g, 0.02, 0.02, 0.5 * s, f, 0, 0.34 * s, -0.26 * s);
      B(g, 0.08, 0.04, 0.25, K.black, 0, 0.92 * s, -0.28 * s); B(g, 0.5, 0.025, 0.025, K.black, 0, 0.95 * s, 0.42 * s); Cy(g, 0.03, 0.03, 0.05, 6, K.black, 0, 0.35 * s, -0.02);
      return g;
    };
    C.surfboard = function (x, z, rot, o) {
      o = o || {}; var len = o.len || 2.1, w = o.w || 0.54, g = at(x, z, rot), s = api.shape();
      s.moveTo(0, -len / 2); s.quadraticCurveTo(w / 2, -len / 4, w / 2, 0); s.quadraticCurveTo(w / 2, len / 4, 0, len / 2); s.quadraticCurveTo(-w / 2, len / 4, -w / 2, 0); s.quadraticCurveTo(-w / 2, -len / 4, 0, -len / 2);
      var geo = api.extrude(s, { depth: 0.06, bevelEnabled: false, curveSegments: 4 });
      var tilt = o.tilt == null ? 0.2 : o.tilt;
      api.part(geo, o.mat || K.cream, 0, (len / 2) * Math.cos(tilt), -(len / 2) * Math.sin(tilt), -tilt, 0, 0, g);
      B(g, 0.06, len * 0.6, 0.01, o.stripe || K.rust, 0, (len / 2) * Math.cos(tilt), -(len / 2) * Math.sin(tilt) + 0.035, -tilt);
      return g;
    };
    C.workbench = function (x, z, rot) { var g = at(x, z, rot); B(g, 1.8, 0.06, 0.6, K.woodLight, 0, 0.9, 0); legs(g, 1.8, 0.6, 0.87, K.metal, 0.06, 0.025); B(g, 1.7, 0.03, 0.5, K.metal, 0, 0.25, 0); B(g, 0.5, 0.2, 0.25, K.red, -0.5, 1.03, -0.1); Cy(g, 0.05, 0.05, 0.12, 8, K.glass, 0.3, 0.99, -0.15); B(g, 0.4, 0.2, 0.3, K.card, 0.5, 0.365, 0); return g; };
    C.shelvingUnit = function (x, z, rot) { var g = at(x, z, rot); legs(g, 0.9, 0.4, 1.8, K.metal, 0.02, 0.015); [0.1, 0.65, 1.2, 1.75].forEach(function (y, i) { B(g, 0.9, 0.03, 0.4, K.metal, 0, y, 0); if (i < 3) { B(g, 0.35, 0.28, 0.3, [K.blue, K.card, K.green][i], -0.22, y + 0.155, 0); B(g, 0.35, 0.22, 0.3, [K.card, K.tan, K.card][i], 0.22, y + 0.125, 0); } }); return g; };
    C.ladder = function (x, z, rot) { var g = at(x, z, rot); var s = api.sub(0, 0, 0, -0.25, 0, 0, g); [-1, 1].forEach(function (t) { B(s, 0.04, 2.2, 0.04, K.metal, t * 0.2, 1.1, 0); }); for (var i = 0; i < 6; i++) B(s, 0.36, 0.03, 0.03, K.metal, 0, 0.25 + i * 0.35, 0); return g; };
    C.washer = function (x, z, rot, o) { var g = at(x, z, rot); B(g, 0.6, 0.85, 0.6, K.white, 0, 0.425, 0); Cy(g, 0.2, 0.2, 0.02, 12, (o && o.dryer) ? K.metal : K.glass, 0, 0.4, 0.31, Math.PI / 2); B(g, 0.56, 0.06, 0.02, K.black, 0, 0.78, 0.3); Cy(g, 0.03, 0.03, 0.02, 8, K.metal, 0.2, 0.78, 0.32, Math.PI / 2); return g; };
    C.waterHeater = function (x, z) { var g = at(x, z, 0); Cy(g, 0.28, 0.28, 1.5, 10, K.white, 0, 0.75, 0); Cy(g, 0.03, 0.03, 0.5, 6, K.metal, 0.1, 1.75, 0); Cy(g, 0.03, 0.03, 0.5, 6, K.metal, -0.1, 1.75, 0); return g; };
    C.utilitySink = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.6, 0.35, 0.5, K.white, 0, 0.7, 0); legs(g, 0.6, 0.5, 0.52, K.metal, 0.05, 0.015); Cy(g, 0.015, 0.015, 0.2, 6, K.metal, 0, 0.97, -0.2); return g; };
    C.bins = function (x, z, rot) { var g = at(x, z, rot); [[K.blue, -0.4], [K.green, 0.4]].forEach(function (b) { B(g, 0.6, 1.0, 0.7, b[0], b[1], 0.5, 0); B(g, 0.62, 0.05, 0.72, K.black, b[1], 1.02, 0); }); return g; };
    C.boxes = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.5, 0.4, 0.4, K.card, 0, 0.2, 0); B(g, 0.45, 0.35, 0.4, K.card, 0.02, 0.575, 0.02, 0, 0.15); B(g, 0.4, 0.3, 0.35, K.card, -0.03, 0.9, 0, 0, -0.1); return g; };
    C.cooler = function (x, z, rot) { var g = at(x, z, rot); B(g, 0.55, 0.36, 0.38, K.blue, 0, 0.18, 0); B(g, 0.57, 0.06, 0.4, K.white, 0, 0.39, 0); return g; };

    // ---------- streets: pieces that build from map data (lib/map.js), metres, x east, z south
    var WALLS = [mat(0xE0D4B8), mat(0xB9AC9C), mat(0xF1EBDD), mat(0xC9B79A), mat(0xE8D8A0), mat(0xB8C0A6), mat(0xA9B7C4), mat(0xD9A98C), mat(0xC4A4A0)];
    var ROOFS = [mat(0x4A3E44), mat(0x5A4A48), mat(0x6B4E36), mat(0xA63E2A)];
    K.sidewalk = mat(0x8C8478);
    var CARS = [K.navy, K.black, K.metal, K.plum, K.rust, K.cream];
    C.footprint = function (polygon, height, o) {
      o = o || {}; var s = api.shape(); polygon.forEach(function (p, i) { if (i === 0) s.moveTo(p[0], -p[1]); else s.lineTo(p[0], -p[1]); }); s.closePath();
      var geo = api.extrude(s, { depth: height, bevelEnabled: false });
      var mesh = api.part(geo, [o.roof || K.floorConcrete, o.wall || WALLS[o.tone || 0]], 0, 0, 0, -Math.PI / 2, 0, 0, o.parent);
      if (o.gable) C.gableRoof(polygon, height, o);   // the caller offsets the roof group with the footprint
      return mesh;
    };
    // A gable roof over a footprint: ridge along the footprint's longest edge, pitch from the width across it.
    C.gableRoof = function (polygon, height, o) {
      o = o || {}; var n = polygon.length, best = 0, bi = 0, i;
      for (i = 0; i < n; i++) { var p = polygon[i], q = polygon[(i + 1) % n], l = Math.hypot(q[0] - p[0], q[1] - p[1]); if (l > best) { best = l; bi = i; } }
      var p0 = polygon[bi], p1 = polygon[(bi + 1) % n], ux = (p1[0] - p0[0]) / best, uz = (p1[1] - p0[1]) / best, vx = -uz, vz = ux;
      var cx = 0, cz = 0; polygon.forEach(function (pt) { cx += pt[0]; cz += pt[1]; }); cx /= n; cz /= n;
      var uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
      polygon.forEach(function (pt) { var dx = pt[0] - cx, dz = pt[1] - cz, u = dx * ux + dz * uz, v = dx * vx + dz * vz; uMin = Math.min(uMin, u); uMax = Math.max(uMax, u); vMin = Math.min(vMin, v); vMax = Math.max(vMax, v); });
      var len = uMax - uMin, wid = vMax - vMin, rise = Math.min(wid * 0.32, 3.2), over = 0.35;
      var tri = api.shape(); tri.moveTo(-wid / 2 - over, 0); tri.lineTo(wid / 2 + over, 0); tri.lineTo(0, rise); tri.closePath();
      var geo = api.extrude(tri, { depth: len + 2 * over, bevelEnabled: false }); geo.translate(0, 0, -(len + 2 * over) / 2);
      var yaw = Math.atan2(ux, uz);   // local +z along the ridge
      var g = api.sub(cx + ux * (uMin + uMax) / 2 + vx * (vMin + vMax) / 2, height - 0.05, cz + uz * (uMin + uMax) / 2 + vz * (vMin + vMax) / 2, 0, yaw, 0, o.parent);
      api.part(geo, o.roofMat || ROOFS[(o.tone || 0) % ROOFS.length], 0, 0, 0, 0, 0, 0, g);
      return g;
    };
    // One elevation field for a map: inverse-distance weighting over every sampled point (road vertices, building centres),
    // falling back to the fitted plane. Everything in a scene should take its height from this so nothing sinks under the ground.
    C.elevationField = function (map) {
      var pts = [], gr = map.ground || null;
      (map.roads || []).forEach(function (r) { if (r.elevation) r.polyline.forEach(function (p, i) { if (r.elevation[i] != null) pts.push([p[0], p[1], r.elevation[i]]); }); });
      (map.buildings || []).forEach(function (b) { if (b.elevation != null && b.center) pts.push([b.center[0], b.center[1], b.elevation]); });
      var plane = function (x, z) { return gr ? gr.a * x + gr.b * z + gr.c : 0; };
      if (!pts.length) return plane;
      return function (x, z) {
        var num = 0, den = 0, i, best = Infinity;
        for (i = 0; i < pts.length; i++) { var d2 = (pts[i][0] - x) * (pts[i][0] - x) + (pts[i][1] - z) * (pts[i][1] - z); if (d2 < 0.25) return pts[i][2]; var w = 1 / (d2 + 36); num += w * pts[i][2]; den += w; if (d2 < best) best = d2; }
        var idw = num / den; if (best > 60 * 60) return plane(x, z);
        var t = Math.min(1, Math.sqrt(best) / 60); return idw * (1 - t) + plane(x, z) * t;
      };
    };
    // a flat-shaded height-field disc of radius R from an elevation function
    C.terrain = function (f, R, o) {
      o = o || {}; var n = o.segments || 96, pos = [], idx = [], step = 2 * R / n, i, j;
      for (i = 0; i <= n; i++) for (j = 0; j <= n; j++) { var x = -R + i * step, z = -R + j * step; pos.push(x, f(x, z), z); }
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
        if (Math.hypot(-R + (i + 0.5) * step, -R + (j + 0.5) * step) > R) continue;
        var a = i * (n + 1) + j, b = a + 1, c = a + n + 1, d = c + 1; idx.push(a, b, c, b, d, c);
      }
      var geo = new api.THREE.BufferGeometry(); geo.setAttribute('position', new api.THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();   // shared vertices: smooth shading
      return api.part(geo, o.mat || K.lot, 0, o.y == null ? -0.02 : o.y, 0, 0, 0, 0, o.parent);
    };
    // subdivide a polyline so segments are at most `step` long, and sample per-vertex values from f
    C.resamplePolyline = function (polyline, step, f) {
      var out = [], vals = [], i;
      for (i = 0; i + 1 < polyline.length; i++) { var a = polyline[i], b = polyline[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(len / step)); for (var q = 0; q < k; q++) { var t = q / k, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; out.push([x, z]); vals.push(f ? f(x, z) : 0); } }
      var last = polyline[polyline.length - 1]; out.push(last); vals.push(f ? f(last[0], last[1]) : 0);
      return { polyline: out, values: vals };
    };
    // keep only the part of a polyline (and its per-vertex values) inside a disc of radius R about the origin
    C.clipPolyline = function (polyline, R, values) {
      var out = [], vals = [], inside = function (p) { return Math.hypot(p[0], p[1]) <= R; };
      function cross(p, q, vp, vq) { var lo = 0, hi = 1; for (var it = 0; it < 24; it++) { var m = (lo + hi) / 2, x = p[0] + (q[0] - p[0]) * m, z = p[1] + (q[1] - p[1]) * m; if (inside([x, z]) === inside(p)) lo = m; else hi = m; } var t = (lo + hi) / 2; return [[p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t], vp == null ? null : vp + (vq - vp) * t]; }
      for (var i = 0; i < polyline.length; i++) {
        var p = polyline[i], v = values ? values[i] : null;
        if (inside(p)) { if (i > 0 && !inside(polyline[i - 1])) { var c0 = cross(polyline[i - 1], p, values ? values[i - 1] : null, v); out.push(c0[0]); vals.push(c0[1]); } out.push(p); vals.push(v); }
        else if (i > 0 && inside(polyline[i - 1])) { var c1 = cross(polyline[i - 1], p, values ? values[i - 1] : null, v); out.push(c1[0]); vals.push(c1[1]); }
      }
      return { polyline: out, values: values ? vals : null };
    };
    C.road = function (polyline, width, o) {
      o = o || {}; var g = api.sub(0, 0, 0, 0, 0, 0, o.parent), el = o.elevation || null;
      for (var i = 0; i + 1 < polyline.length; i++) {
        var a = polyline[i], b = polyline[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); if (len < 0.01) continue;
        var yaw = Math.atan2(dx, dz), ya = el ? el[i] : 0, yb = el ? el[i + 1] : 0, pitch = el ? -Math.atan2(yb - ya, len) : 0, ym = (ya + yb) / 2;
        var seg = api.sub((a[0] + b[0]) / 2, ym, (a[1] + b[1]) / 2, 0, yaw, 0, g); seg.rotation.order = 'YXZ'; seg.rotation.set(pitch, yaw, 0);
        if (o.sidewalk) { [-1, 1].forEach(function (sd) { B(seg, 1.3, 0.08, len + width * 0.5, K.lawnDry, sd * (width / 2 + 0.65), 0.04, 0); B(seg, 1.7, 0.09, len + width * 0.6, K.sidewalk, sd * (width / 2 + 1.3 + 0.85), 0.045, 0); }); }
        B(seg, width, 0.1, len + width * 0.5, o.mat || K.asphalt, 0, 0.05, 0);
        if (o.centreLine && width >= 7) for (var d = -len / 2 + 1; d < len / 2 - 1; d += 4) B(seg, 0.15, 0.005, 2, K.rugSand, 0, 0.105, d);
      }
      return g;
    };
    // the edge of a footprint that faces a road polyline: index of the edge whose midpoint, pushed outward, is nearest the road
    C.streetEdge = function (polygon, polyline) {
      var n = polygon.length, best = -1, bd = Infinity, i;
      function distToLine(px, pz) { var d = Infinity; for (var k = 0; k + 1 < polyline.length; k++) { var a = polyline[k], b = polyline[k + 1], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l2)); d = Math.min(d, Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t))); } return d; }
      var cx = 0, cz = 0; polygon.forEach(function (p) { cx += p[0]; cz += p[1]; }); cx /= n; cz /= n;
      for (i = 0; i < n; i++) { var p = polygon[i], q = polygon[(i + 1) % n], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, len = Math.hypot(q[0] - p[0], q[1] - p[1]); if (len < 3) continue;
        var ox = mx - cx, oz = mz - cz, ol = Math.hypot(ox, oz) || 1, d = distToLine(mx + ox / ol * 2, mz + oz / ol * 2); if (d < bd) { bd = d; best = i; } }
      return { edge: best, distance: bd };
    };
    C.isClockwise = function (polygon) { var s2 = 0; for (var i = 0; i < polygon.length; i++) { var p = polygon[i], q = polygon[(i + 1) % polygon.length]; s2 += (q[0] - p[0]) * (q[1] + p[1]); } return s2 > 0; };
    // Palms. One item, six species presets, two detail levels, optional wind.
    //   C.palm(x, z, { species: 'date'|'canary'|'fan'|'queen'|'coconut'|'pygmy', h, detail: 'low'|'high', skirt, fruit, lean, curve, seed,
    //                  wind: { strength, dir } | false, leaf, trunk, parent, rot })
    // The trunk is a chain of ring joints: each ring is a child of the one below, so a curve is a constant rotation per ring
    // and wind is a rotation that grows toward the top. Fronds sit on the top ring and flutter about their own base.
    K.trunk = mat(0x7A5C3E); K.trunkGrey = mat(0x8C8272); K.leafDark = mat(0x557A4B); K.dried = mat(0x9A7A4A); K.dates = mat(0xD08A3A); K.coconut = mat(0x6E8A3E);
    var SPECIES = {
      date:    { h: 12, r0: 0.40, ringH: 0.7,  step: 0.06, trunk: 'scaly',  blade: 'pinnate', fronds: 20, low: 7, L: 4.2, w: 0.46, pitchTop: 1.15, pitchDrop: 1.55, droop: 0.5, droopAdd: 0.75, skirt: 7, fruit: 'dates', lean: 0.05, curve: 0 },
      canary:  { h: 8,  r0: 0.62, ringH: 0.55, step: 0.09, trunk: 'scaly',  blade: 'pinnate', fronds: 26, low: 9, L: 5.2, w: 0.55, pitchTop: 0.95, pitchDrop: 1.35, droop: 0.7, droopAdd: 0.6, skirt: 9, fruit: 'dates', lean: 0.02, curve: 0 },
      fan:     { h: 19, r0: 0.30, ringH: 1.2,  step: 0.015, trunk: 'smooth', blade: 'fan',     fronds: 16, low: 6, L: 3.2, w: 1.7,  pitchTop: 1.25, pitchDrop: 1.7, droop: 0.25, droopAdd: 0.35, skirt: 14, fruit: null, lean: 0.03, curve: 0.004 },
      queen:   { h: 11, r0: 0.28, ringH: 0.9,  step: 0.02, trunk: 'smooth', blade: 'pinnate', fronds: 14, low: 7, L: 4.6, w: 0.38, pitchTop: 1.05, pitchDrop: 1.5, droop: 1.1, droopAdd: 0.7, skirt: 0, fruit: 'dates', lean: 0.04, curve: 0.006 },
      coconut: { h: 9,  r0: 0.30, ringH: 0.8,  step: 0.025, trunk: 'smooth', blade: 'pinnate', fronds: 13, low: 7, L: 5.0, w: 0.5,  pitchTop: 1.0,  pitchDrop: 1.5, droop: 0.85, droopAdd: 0.6, skirt: 2, fruit: 'coconuts', lean: 0.18, curve: -0.022 },
      pygmy:   { h: 2.6, r0: 0.16, ringH: 0.3, step: 0.035, trunk: 'scaly',  blade: 'pinnate', fronds: 12, low: 7, L: 1.05, w: 0.2, pitchTop: 1.0,  pitchDrop: 1.45, droop: 0.9, droopAdd: 0.5, skirt: 0, fruit: null, lean: 0.12, curve: 0.02, stems: 3 }
    };
    C.palm = function (x, z, o) {
      o = o || {}; var P = SPECIES[o.species || 'date'] || SPECIES.date, high = o.detail === 'high' || o.detail === 'medium', fine = o.detail === 'high', g = at(x, z, o.rot || 0, o.parent), r2 = api.rand((o.seed || 1) * 7 + 3);
      var h = o.h || P.h, leaf = o.leaf || K.leaf, leaf2 = o.leaf2 || (o.leaf ? o.leaf : K.leafDark), trunk = o.trunk || (P.trunk === 'smooth' ? K.trunkGrey : K.trunk);
      var lean = o.lean == null ? P.lean : o.lean, curve = o.curve == null ? P.curve : o.curve, stems = o.stems || P.stems || 1;
      var rings = [], fronds = [], seedA = (o.seed || 0) * 1.7;
      function trunkAndCrown(px, pz, leanX, leanZ, hh, scale) {
        var n = Math.max(4, Math.round(hh / (fine ? P.ringH : high ? P.ringH * 1.5 : P.ringH * 2.2))), rh = hh / n, r0 = P.r0 * scale, parent = api.sub(px, 0, pz, leanZ, 0, -leanX, g), prev = parent;
        for (var i = 0; i < n; i++) {
          var joint = api.sub(0, i ? rh : 0, 0, 0, 0, 0, prev); joint.userData.base = { x: curve * (leanZ ? 1 : 0), z: -curve }; joint.rotation.z = -curve; joint.userData.k = Math.pow((i + 1) / n, 1.6);
          var rb = r0 * (1 - 0.25 * i / n), rt = P.trunk === 'scaly' ? rb * 0.8 : rb * 0.96;
          Cy(joint, rt, rb + P.step, rh, 8, trunk, 0, rh / 2, 0, 0, (i % 2) * Math.PI / 8);
          rings.push(joint); prev = joint;
        }
        var crown = api.sub(0, rh - 0.25 * scale, 0, 0, 0, 0, prev);
        Cy(crown, 0.2 * scale + P.r0 * 0.3, 0.3 * scale + P.r0 * 0.5, 0.9 * scale, 8, trunk, 0, 0.3 * scale, 0);
        var nf = fine ? (o.fronds || P.fronds) : high ? (o.fronds || Math.round(P.fronds * 0.6)) : (o.fronds || P.low), L = P.L * scale, golden = 2.399963, k;
        for (k = 0; k < nf; k++) {
          var az = k * golden + seedA, tier = k / nf, pitch = P.pitchTop - tier * P.pitchDrop + (r2() - 0.5) * 0.25;
          var f = api.sub(0, 0.7 * scale, 0, 0, 0, 0, crown); f.rotation.order = 'YXZ'; f.rotation.set(-pitch, az, 0); f.userData.bx = -pitch; f.userData.ph = k * 1.7 + seedA;
          blade(f, P.blade, L * (0.85 + 0.3 * tier), P.w * scale, k % 2 ? leaf2 : leaf, P.droop + tier * P.droopAdd); fronds.push(f);
        }
        var skirtN = o.skirt === false ? 0 : (fine ? P.skirt : high ? Math.min(5, P.skirt) : Math.min(2, P.skirt));
        for (k = 0; k < skirtN; k++) { var f2 = api.sub(0, 0.15 * scale, 0, 0, 0, 0, crown); f2.rotation.order = 'YXZ'; f2.rotation.set(1.35 + (r2() - 0.5) * 0.2, k * golden + 1.3, 0); f2.userData.bx = f2.rotation.x; f2.userData.ph = k * 2.1; blade(f2, P.blade, L * 0.65, P.w * scale * 0.7, K.dried, 0.15); fronds.push(f2); }
        var fruit = o.fruit === false ? null : (o.fruit || P.fruit);
        if (fruit) for (k = 0; k < 3; k++) { var f3 = api.sub(0, 0.35 * scale, 0, 0, 0, 0, crown); f3.rotation.order = 'YXZ'; f3.rotation.set(0.95, k * 2.1 + 0.4, 0); B(f3, 0.04, 0.04, 1.0 * scale, K.trunk, 0, 0, 0.5 * scale);
          if (fruit === 'dates') Cy(f3, 0.12 * scale, 0.3 * scale, 1.0 * scale, 6, K.dates, 0, -0.45 * scale, 1.05 * scale, 0.4);
          else for (var c = 0; c < 3; c++) Cy(f3, 0.16 * scale, 0.16 * scale, 0.26 * scale, 6, K.coconut, (c - 1) * 0.16 * scale, -0.2 * scale, 1.0 * scale + (c % 2) * 0.1); }
      }
      function blade(parent, kind, len, w, mtl, droop) {
        if (kind === 'fan') {
          var stalk = len * 0.45, R = len * 0.55;
          if (!high) { B(parent, 0.06, 0.04, stalk, mtl, 0, 0, stalk / 2); B(parent, w, 0.05, R * 1.4, mtl, 0, 0, stalk + R * 0.7); return; }
          var sh = api.shape(), segs = fine ? 14 : 8, a0 = Math.PI * 1.12, a1 = -Math.PI * 0.12, q;
          sh.moveTo(0.05, 0); sh.lineTo(0.05, stalk);
          for (q = 0; q <= segs; q++) { var a = a1 + (a0 - a1) * q / segs, rr = R * (q % 2 ? 0.78 : 1); sh.lineTo(Math.cos(a) * rr, stalk + Math.sin(a) * rr * 0.95); }
          sh.lineTo(-0.05, stalk); sh.lineTo(-0.05, 0); sh.closePath();
          var geo = api.extrude(sh, { depth: 0.035, bevelEnabled: false }); geo.rotateX(Math.PI / 2);
          api.displace(geo, function (px, py, pz) { var u = Math.max(0, (pz - stalk) / R); return [px, py - droop * u * u * 1.2 + Math.abs(px) * 0.12, pz]; });
          api.part(geo, mtl, 0, 0, 0, 0, 0, 0, parent); return;
        }
        if (!high) { B(parent, w, 0.05, len * 0.5, mtl, 0, 0, len * 0.25); var s2 = api.sub(0, 0, len * 0.5, droop, 0, 0, parent); B(s2, w * 0.65, 0.05, len * 0.5, mtl, 0, 0, len * 0.25); return; }
        var shp = api.shape(), d = Math.max(0.16, len / (fine ? 10 : 6)), teeth = Math.floor((len - 0.5) / d), pts = [], j;
        function wid(y) { var u = Math.min(1, y / len); return Math.max(0.03, w * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.1 + 0.9 * u)), 0.8)); }
        for (j = 0; j < teeth; j++) { var y = len * 0.12 + j * d; pts.push([wid(y + d * 0.55), y + d * 0.55]); pts.push([wid(y + d) * 0.38, y + d]); }
        shp.moveTo(0.04, 0); pts.forEach(function (pt) { shp.lineTo(pt[0], pt[1]); }); shp.lineTo(0, len); pts.slice().reverse().forEach(function (pt) { shp.lineTo(-pt[0], pt[1]); }); shp.lineTo(-0.04, 0); shp.closePath();
        var g2 = api.extrude(shp, { depth: 0.035, bevelEnabled: false }); g2.rotateX(Math.PI / 2);
        api.displace(g2, function (px, py, pz) { var u = pz / len; return [px, py - droop * u * u * 1.6 + Math.abs(px) * 0.45, pz]; });
        api.part(g2, mtl, 0, 0, 0, 0, 0, 0, parent);
      }
      if (stems === 1) trunkAndCrown(0, 0, lean, 0, h, 1);
      else for (var sidx = 0; sidx < stems; sidx++) { var ang = sidx * (Math.PI * 2 / stems) + seedA, rr2 = 0.18; trunkAndCrown(Math.cos(ang) * rr2, Math.sin(ang) * rr2, lean * Math.cos(ang), lean * Math.sin(ang), h * (0.75 + 0.25 * ((sidx + 1) / stems)), 0.8 + 0.2 * (sidx / stems)); }
      // wind: a gusting envelope bends the ring chain toward the wind and flutters every frond about its base
      var wind = o.wind === false ? null : Object.assign({ strength: 0.8, dir: 0.6 }, o.wind || {});
      if (wind && api.onTick) {
        var ph0 = seedA * 3.1, dx = Math.cos(wind.dir), dz = Math.sin(wind.dir), bendMax = 0.05 * (1 / Math.max(1, h / 12)) * (P.trunk === 'scaly' ? 0.8 : 1.2);
        api.onTick(function (t, dt, W) {
          var sgl = W && W.strength != null ? W.strength : 1, gust = wind.strength * sgl * (0.55 + 0.45 * Math.sin(t * 0.7 + ph0)) * (0.7 + 0.3 * Math.sin(t * 2.3 + ph0 * 1.3));
          for (var i = 0; i < rings.length; i++) { var jt = rings[i], k = jt.userData.k * bendMax * gust, base = jt.userData.base; jt.rotation.z = base.z - k * dx; jt.rotation.x = base.x + k * dz; }
          for (var f = 0; f < fronds.length; f++) { var fr = fronds[f], u = fr.userData; fr.rotation.x = u.bx + 0.07 * gust * Math.sin(t * 3.1 + u.ph); fr.rotation.z = 0.05 * gust * Math.sin(t * 4.3 + u.ph * 1.3); }
        });
      }
      return g;
    };
    C.streetTree = function (x, z, o) { o = o || {}; var h = o.h || 5, g = at(x, z, 0, o.parent); Cy(g, 0.15, 0.22, h * 0.45, 6, K.woodDark, 0, h * 0.225, 0); Cy(g, h * 0.35, h * 0.28, h * 0.55, 7, K.leaf, 0, h * 0.72, 0); return g; };
    C.streetLamp = function (x, z, rot, o) { var g = at(x, z, rot, o && o.parent); Cy(g, 0.08, 0.12, 6, 6, K.metal, 0, 3, 0); B(g, 0.08, 0.08, 1.6, K.metal, 0, 5.9, 0.8); B(g, 0.35, 0.12, 0.5, K.lit, 0, 5.8, 1.5); return g; };
    C.parkedCar = function (x, z, rot, o) { return C.car(x, z, rot, Object.assign({ color: pick(CARS) }, o || {})); };
    // A whole street base from lib/map.js output: roads with sidewalk bands, extruded footprints, trees and lamps along the main roads.
    // o.skip: [building ids] left out (so a detailed model can take that lot). o.trees: 'palm'|'tree'|'none'. Returns the group.
    C.mapScene = function (map, o) {
      o = o || {}; var g = api.sub(0, 0, 0, 0, 0, 0, o.parent), R = map.radius, skip = {}; (o.skip || []).forEach(function (id) { skip[id] = true; });
      var f = map.ground || map.buildings.some(function (b) { return b.elevation != null; }) ? C.elevationField(map) : function () { return 0; };
      map.elevationAt = f;
      C.terrain(f, R * 1.08, { parent: g, mat: o.ground || K.lot, segments: o.terrainSegments || 44 });
      map.roads.forEach(function (r) { if (r.kind === 'footway' || r.kind === 'path' || r.kind === 'cycleway') return; var cl = C.clipPolyline(r.polyline, R * 1.05, null); if (cl.polyline.length < 2) return; var rs = C.resamplePolyline(cl.polyline, 8, f); C.road(rs.polyline, r.width, { parent: g, sidewalk: r.width >= 6 ? 1.6 : 0, centreLine: !!o.centreLine, elevation: rs.values.map(function (v) { return v + 0.15; }) }); });
      var GABLE = { house: true, detached: true, bungalow: true, residential: true, semidetached_house: true, terrace: true };
      map.buildings.forEach(function (b, i) {
        if (skip[b.id]) return;
        if (!b.center) { var cx0 = 0, cz0 = 0; b.polygon.forEach(function (q) { cx0 += q[0]; cz0 += q[1]; }); b.center = [cx0 / b.polygon.length, cz0 / b.polygon.length]; }
        var h = Math.min(b.height, o.maxHeight || 30);
        var houseLike = b.type ? (GABLE[b.type] || (b.tags && b.tags['roof:shape'] === 'gabled')) : h < 7.5;   // untyped data: low and simple reads as a house
        var gable = o.roofs !== false && houseLike && b.polygon.length <= 8 && h < 9;
        var ey = f(b.center[0], b.center[1]), fp = C.footprint(b.polygon, (gable ? h - 0.6 : h) + 1.5, { parent: g, tone: i % WALLS.length, roof: K.roofFlat, gable: gable });
        fp.position.y = ey - 1.5; var last = g.children[g.children.length - 1]; if (gable && last !== fp) last.position.y += ey - 1.5;   // roof group was built at the footprint's own height
      });
      var treeKind = o.trees || 'palm', every = o.treeEvery || 14, n = 0;
      if (treeKind !== 'none') map.roads.forEach(function (r0) {
        if (r0.width < 6) return; var clr = C.clipPolyline(r0.polyline, R, r0.elevation || null), r = { name: r0.name, width: r0.width, polyline: clr.polyline, elevation: clr.values }; if (r.polyline.length < 2) return;
        for (var i = 0; i + 1 < r.polyline.length; i++) {
          var a = r.polyline[i], b = r.polyline[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len;
          for (var d = every / 2; d < len; d += every) {
            var px = a[0] + dx * d / len, pz = a[1] + dz * d / len, off = r.width / 2 + 1.2, side = (n++ % 2) ? 1 : -1;
            var tx = px + nx * off * side, tz = pz + nz * off * side; if (Math.hypot(tx, tz) > R) continue;
            var ty = f(px, pz);
            var holder = api.sub(0, ty, 0, 0, 0, 0, g);
            if (treeKind === 'palm') {
              var pc = o.palms || {}, main = (pc.main || []).indexOf(r.name) >= 0, det = main ? (pc.mainDetail || 'high') : (pc.detail || 'low');
              var sp = (pc.species && pc.species[n % pc.species.length]) || ((n % 4) ? 'fan' : (n % 8) ? 'date' : 'canary');
              C.palm(tx, tz, { parent: holder, species: sp, detail: det, h: sp === 'fan' ? 13 + rnd() * 8 : sp === 'canary' ? 6 + rnd() * 3 : 8 + rnd() * 4, seed: n, wind: { strength: pc.wind == null ? 0.6 : pc.wind, dir: 0.6 } });
            } else if (treeKind === 'canopy') C.tree(tx, tz, { parent: holder, species: ['ficus', 'ficus', 'bottlebrush', 'ficus', 'magnolia'][n % 5], seed: n });
            else C.streetTree(tx, tz, { parent: holder, h: 4 + rnd() * 3 });
            if (n % 3 === 0 && o.lamps !== false) C.streetLamp(px - nx * off * side, pz - nz * off * side, Math.atan2(-nx * side, -nz * side), { parent: holder });
          }
        }
      });
      return g;
    };
    K.roofFlat = mat(0x4A3E44);

    // ---------- street layer: canopy trees, utilities, furniture, fences, markings, parking, facades
    K.asphalt = mat(0x2A262B); K.curb = mat(0x9A9388); K.lot = mat(0x5A5A46); K.lawn = mat(0x5E7A45); K.lawnDry = mat(0x7E8452); K.gravel = mat(0x76705F); K.drive = mat(0x6B665E); K.skin = mat(0xC9A07A); K.shirt = [mat(0x4F7EA8), mat(0xB86A4A), mat(0xE6DAC6), mat(0x3E4A66), mat(0x6B2A4A)]; K.curbRed = mat(0xA0342C); K.paint = mat(0xE8E0CC); K.paintYellow = mat(0xD9B23A);
    K.pole = mat(0x5A4A3C); K.wire = mat(0x1E1A1F); K.canopy = mat(0x4F7A42); K.canopyDark = mat(0x3E6236); K.pine = mat(0x3F5E3B); K.pineDark = mat(0x33502F);
    K.flower = mat(0xD24A3A); K.brick = mat(0x8E3F32); K.siding = mat(0x8A93A0); K.glassLit = mat(0xE9D8A0, 0x8A6A2E); K.slat = mat(0x2E2A2C); K.plywood = mat(0xC9A36A); K.boardFence = mat(0x9A5A34);
    var CAR_COLORS = [K.navy, K.black, K.metal, K.white, K.plum, K.rust, K.cream, K.black, K.metal];
    // Trees. species: ficus (round dense parkway tree), pine (Aleppo: leaning trunk, irregular umbrella), coral (spreading, red flowers),
    // bottlebrush (weeping round crown, red), magnolia (tall conical). Crowns are clusters of low-poly lobes; wind sways the crown.
    C.tree = function (x, z, o) {
      o = o || {}; var sp = o.species || 'ficus', h = o.h || { ficus: 8, pine: 13, coral: 7, bottlebrush: 5, magnolia: 10 }[sp], g = at(x, z, o.rot || 0, o.parent), r3 = api.rand((o.seed || 1) * 13 + 5);
      var trunkH = h * ({ ficus: 0.38, pine: 0.5, coral: 0.4, bottlebrush: 0.35, magnolia: 0.3 }[sp]), tr = 0.12 + h * 0.018, lean = sp === 'pine' ? 0.18 : 0.03;
      var t = api.sub(0, 0, 0, 0, 0, lean, g); Cy(t, tr * 0.7, tr, trunkH, 7, K.woodDark, 0, trunkH / 2, 0);
      var crown = api.sub(0, trunkH * 0.95, 0, 0, 0, 0, t), lobes = [], k;
      function lobe(px, py, pz, rx, ry, m, seg) { lobes.push(api.part(api.cyl(rx * 0.55, rx, ry, seg || 7), m, px, py, pz, 0, r3() * 3, 0, crown)); }
      if (sp === 'ficus' || sp === 'bottlebrush') {
        var R = h * (sp === 'ficus' ? 0.42 : 0.4), n = 5;
        lobe(0, R * 0.55, 0, R * 0.8, R * 1.1, K.canopy);
        for (k = 0; k < n; k++) { var a = k * 1.256 + r3(); lobe(Math.cos(a) * R * 0.5, R * 0.35 + r3() * R * 0.3, Math.sin(a) * R * 0.5, R * 0.55, R * 0.8, k % 2 ? K.canopyDark : K.canopy); }
        if (sp === 'bottlebrush') for (k = 0; k < 12; k++) { var a2 = r3() * 6.28, rr = R * (0.5 + r3() * 0.5); Cy(crown, 0.05, 0.06, 0.28, 5, K.flower, Math.cos(a2) * rr, R * 0.2 + r3() * R * 0.8, Math.sin(a2) * rr, 0.6, a2, 0); }
      } else if (sp === 'pine') {
        var Rp = h * 0.45; for (k = 0; k < 4; k++) { var ab = k * 1.6 + r3(), br = api.sub(0, trunkH * 0.2 * k, 0, 0, ab, -0.9 + r3() * 0.3, t); Cy(br, 0.05, 0.1, Rp * 0.9, 5, K.woodDark, 0, Rp * 0.45, 0); }
        for (k = 0; k < 7; k++) { var ap = k * 0.9 + r3() * 0.4, rp = Rp * (0.35 + r3() * 0.55); lobe(Math.cos(ap) * rp, r3() * h * 0.28 + Rp * 0.15, Math.sin(ap) * rp, Rp * (0.35 + r3() * 0.25), Rp * 0.28, k % 2 ? K.pine : K.pineDark, 6); }
        lobe(0, h * 0.3, 0, Rp * 0.45, Rp * 0.3, K.pine, 6);
      } else if (sp === 'coral') {
        var Rc = h * 0.55; for (k = 0; k < 3; k++) { var ac = k * 2.1 + r3() * 0.5, br2 = api.sub(0, trunkH * 0.9, 0, 0, ac, -1.0, t); Cy(br2, 0.06, 0.12, Rc * 0.7, 5, K.woodDark, 0, Rc * 0.35, 0); }
        for (k = 0; k < 6; k++) { var a3 = k * 1.05 + r3() * 0.3, rc = Rc * (0.3 + r3() * 0.5); lobe(Math.cos(a3) * rc, Rc * 0.2 + r3() * Rc * 0.25, Math.sin(a3) * rc, Rc * 0.36, Rc * 0.45, K.canopy); }
        for (k = 0; k < 16; k++) { var a4 = r3() * 6.28, r4 = Rc * (0.3 + r3() * 0.7); Cy(crown, 0.06, 0.08, 0.22, 5, K.flower, Math.cos(a4) * r4, Rc * 0.15 + r3() * Rc * 0.5, Math.sin(a4) * r4); }
      } else { var Rm = h * 0.28; lobe(0, h * 0.25, 0, Rm, h * 0.5, K.canopyDark, 7); lobe(0, h * 0.5, 0, Rm * 0.75, h * 0.35, K.canopy, 7); }
      if (o.wind !== false && api.onTick) { var ph = (o.seed || 0) * 2.3; api.onTick(function (tt, dt, W) { var sgl = W && W.strength != null ? W.strength : 1, gust = 0.6 * sgl * (0.6 + 0.4 * Math.sin(tt * 0.8 + ph)); crown.rotation.z = 0.025 * gust * Math.sin(tt * 1.7 + ph); crown.rotation.x = 0.02 * gust * Math.sin(tt * 1.3 + ph * 1.7); }); }
      return g;
    };
    // Utilities: wooden pole with crossarm, and sagging lines between pole tops.
    C.utilityPole = function (x, z, rot, o) { o = o || {}; var h = o.h || 11, g = at(x, z, rot, o.parent); Cy(g, 0.13, 0.17, h, 6, K.pole, 0, h / 2, 0); B(g, 2.2, 0.1, 0.1, K.pole, 0, h - 0.6, 0); [-0.9, -0.3, 0.3, 0.9].forEach(function (ox) { Cy(g, 0.05, 0.05, 0.16, 5, K.metal, ox, h - 0.5, 0); }); if (o.transformer) Cy(g, 0.28, 0.28, 0.7, 7, K.metal, 0.45, h - 1.8, 0); g.userData.top = [x, h - 0.6, z]; return g; };
    C.powerLines = function (tops, o) { o = o || {}; var g = api.sub(0, 0, 0, 0, 0, 0, o.parent), sag = o.sag == null ? 0.6 : o.sag, wires = o.wires || 3; for (var i = 0; i + 1 < tops.length; i++) { var a = tops[i], b = tops[i + 1]; for (var w = 0; w < wires; w++) { var off = (w - (wires - 1) / 2) * 0.6, dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len; var p0 = [a[0] + nx * off, a[1], a[2] + nz * off], p1 = [b[0] + nx * off, b[1], b[2] + nz * off], mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - sag, (p0[2] + p1[2]) / 2]; [[p0, mid], [mid, p1]].forEach(function (seg) { var q0 = seg[0], q1 = seg[1], ex = q1[0] - q0[0], ey = q1[1] - q0[1], ez = q1[2] - q0[2], l = Math.hypot(ex, ey, ez); var s2 = api.sub((q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, (q0[2] + q1[2]) / 2, 0, 0, 0, g); s2.rotation.order = 'YXZ'; s2.rotation.set(-Math.atan2(ey, Math.hypot(ex, ez)), Math.atan2(ex, ez), 0); B(s2, 0.035, 0.035, l, K.wire, 0, 0, 0); }); } } return g; };
    C.cobraLamp = function (x, z, rot, o) { var h = (o && o.h) || 8.5, g = at(x, z, rot, o && o.parent); Cy(g, 0.07, 0.14, h, 7, K.metal, 0, h / 2, 0); var arm = api.sub(0, h - 0.1, 0, 0, 0, 0, g); B(arm, 0.07, 0.07, 1.6, K.metal, 0, 0.25, 0.8, -0.3); B(arm, 0.07, 0.07, 1.2, K.metal, 0, 0.5, 2.1, 0.05); B(arm, 0.28, 0.14, 0.7, K.lit, 0, 0.48, 2.6); return g; };
    C.hydrant = function (x, z, o) { var g = at(x, z, 0, o && o.parent), m = (o && o.mat) || K.yellow; Cy(g, 0.11, 0.13, 0.7, 7, m, 0, 0.35, 0); Cy(g, 0.13, 0.11, 0.14, 7, m, 0, 0.77, 0); Cy(g, 0.06, 0.06, 0.16, 5, m, 0, 0.45, 0, Math.PI / 2, 0, Math.PI / 2); return g; };
    C.sign = function (x, z, rot, o) { o = o || {}; var g = at(x, z, rot, o.parent), h = o.h || 2.4; Cy(g, 0.03, 0.03, h, 5, K.metal, 0, h / 2, 0); if (o.kind === 'stop') api.part(api.cyl(0.38, 0.38, 0.03, 8), K.red, 0, h - 0.4, 0, Math.PI / 2, 0, 0, g); else B(g, 0.3, 0.45, 0.02, o.kind === 'parking' ? K.white : K.blue, 0, h - 0.3, 0); return g; };
    C.curbBins = function (x, z, rot, o) { var g = at(x, z, rot, o && o.parent); B(g, 0.6, 0.95, 0.65, K.blue, -0.4, 0.48, 0); B(g, 0.6, 0.95, 0.65, K.black, 0.4, 0.48, 0); B(g, 0.62, 0.04, 0.67, K.navy, -0.4, 0.97, 0); B(g, 0.62, 0.04, 0.67, K.dark, 0.4, 0.97, 0); return g; };
    C.mailbox = function (x, z, rot, o) { var g = at(x, z, rot, o && o.parent); Cy(g, 0.03, 0.03, 1.0, 5, K.metal, 0, 0.5, 0); B(g, 0.2, 0.22, 0.45, K.black, 0, 1.1, 0); return g; };
    C.flagpole = function (x, z, o) { var g = at(x, z, 0, o && o.parent), h = (o && o.h) || 9; Cy(g, 0.03, 0.05, h, 6, K.metal, 0, h / 2, 0); B(g, 0.9, 0.5, 0.02, K.rugRed, 0.45, h - 0.4, 0); return g; };
    // Fences and edges. style: slat (dark horizontal), plywood, board (orange stained), picket (white), block (low wall), chain
    C.fence = function (x0, z0, x1, z1, o) {
      o = o || {}; var st = o.style || 'slat', h = o.h || { slat: 1.8, plywood: 1.8, board: 1.7, picket: 1.0, block: 0.9, chain: 1.2 }[st], m = { slat: K.slat, plywood: K.plywood, board: K.boardFence, picket: K.white, block: K.concrete, chain: K.metal }[st];
      var dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz), g = api.sub((x0 + x1) / 2, 0, (z0 + z1) / 2, 0, yaw, 0, o.parent);
      if (st === 'block') { B(g, 0.2, h, len, m, 0, h / 2, 0); return g; }
      if (st === 'chain') { B(g, 0.02, h - 0.1, len, K.metal, 0, h / 2, 0); }
      else if (st === 'slat') { for (var y = 0.12; y < h; y += 0.16) B(g, 0.03, 0.11, len, m, 0, y, 0); }
      else if (st === 'picket') { for (var d = -len / 2 + 0.05; d < len / 2; d += 0.14) B(g, 0.03, h, 0.08, m, 0, h / 2, d); B(g, 0.03, 0.06, len, m, 0.02, h * 0.75, 0); }
      else B(g, 0.04, h, len, m, 0, h / 2, 0);
      for (var pd = -len / 2; pd <= len / 2 + 0.01; pd += Math.min(len, 2.4)) B(g, 0.09, h + 0.05, 0.09, st === 'picket' ? K.white : K.slat, 0, (h + 0.05) / 2, Math.max(-len / 2 + 0.05, Math.min(len / 2 - 0.05, pd)));
      return g;
    };
    C.hedge = function (x0, z0, x1, z1, o) { o = o || {}; var h = o.h || 1.2, dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), n = Math.max(1, Math.round(len / 0.9)), g = api.sub(0, 0, 0, 0, 0, 0, o.parent); for (var i = 0; i < n; i++) { var u = (i + 0.5) / n; Cy(g, 0.42, 0.5, h, 6, i % 2 ? K.canopy : K.canopyDark, x0 + dx * u, h / 2, z0 + dz * u, 0, i * 0.7, 0); } return g; };
    C.grassTufts = function (x0, z0, x1, z1, o) { o = o || {}; var n = o.n || 6, g = api.sub(0, 0, 0, 0, 0, 0, o.parent), r5 = api.rand(o.seed || 9); for (var i = 0; i < n; i++) { var u = r5(), v = (r5() - 0.5); Cy(g, 0.02, 0.32, 0.5 + r5() * 0.3, 5, i % 2 ? K.grass : K.leaf, x0 + (x1 - x0) * u + v * 0.6, 0.25, z0 + (z1 - z0) * u + v * 0.6); } return g; };
    C.frontSteps = function (x, z, rot, o) { o = o || {}; var n = o.steps || 3, w = o.w || 1.4, g = at(x, z, rot, o.parent); for (var i = 0; i < n; i++) B(g, w, 0.17 * (i + 1), 0.3, K.concrete, 0, 0.17 * (i + 1) / 2, -0.3 * i); if (o.rail !== false) [-1, 1].forEach(function (sd) { B(g, 0.03, 0.03, 0.3 * n, K.black, sd * (w / 2 - 0.05), 0.17 * n + 0.75, -0.3 * (n - 1) / 2, -Math.atan2(0.17 * n, 0.3 * n)); B(g, 0.03, 0.9, 0.03, K.black, sd * (w / 2 - 0.05), 0.45 + 0.17 * n, -0.3 * (n - 1)); B(g, 0.03, 0.9, 0.03, K.black, sd * (w / 2 - 0.05), 0.45, 0.15); }); return g; };
    C.drivewayApron = function (x, z, rot, o) { var w = (o && o.w) || 3.5, d = (o && o.d) || 2.2, g = at(x, z, rot, o && o.parent); B(g, w, 0.1, d, K.concrete, 0, 0.05, 0); return g; };
    // Road detail along a polyline: kerbs, double yellow, painted street name (canvas text), crosswalk bars, manholes, red kerb spans
    C.roadDetail = function (polyline, width, o) {
      o = o || {}; var g = api.sub(0, 0, 0, 0, 0, 0, o.parent), i, total = 0, segs = [], el = o.elevation || null;
      for (i = 0; i + 1 < polyline.length; i++) { var a = polyline[i], b = polyline[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), ya = el ? el[i] : 0, yb = el ? el[i + 1] : 0;
        var hold = api.sub((a[0] + b[0]) / 2, (ya + yb) / 2, (a[1] + b[1]) / 2, 0, 0, 0, g); hold.rotation.order = 'YXZ'; hold.rotation.set(-Math.atan2(yb - ya, len), Math.atan2(dx, dz), 0);
        segs.push({ a: a, b: b, dx: dx, dz: dz, len: len, yaw: Math.atan2(dx, dz), s0: total, ya: ya, yb: yb, hold: hold }); total += len; }
      function place(s, along, across) { var u = along / s.len; return [s.a[0] + s.dx * u + (-s.dz / s.len) * across, s.a[1] + s.dz * u + (s.dx / s.len) * across]; }
      function yAt(s, along) { return s.ya + (s.yb - s.ya) * along / s.len; }
      function slab(s, along, across, w, h, d, m, yOff) { var hd = api.sub(0, 0, 0, 0, 0, 0, s.hold); B(hd, w, h, d, m, across, yOff, along - s.len / 2); }   // in the pitched frame: x across, z along
      segs.forEach(function (s) {
        [-1, 1].forEach(function (sd) { slab(s, s.len / 2, sd * (width / 2 + 0.08), 0.16, 0.14, s.len, K.curb, 0.07); });
        if (o.centre !== false) [-0.12, 0.12].forEach(function (off) { slab(s, s.len / 2, off, 0.1, 0.006, s.len - width, K.paintYellow, 0.105); });
      });
      (o.names || []).forEach(function (nm) { var s = segs[0], at2 = nm.at == null ? total * 0.35 : nm.at; for (var k = 0; k < segs.length; k++) if (segs[k].s0 <= at2 && segs[k].s0 + segs[k].len >= at2) s = segs[k]; var c3 = place(s, at2 - s.s0, nm.across == null ? width * 0.25 : nm.across);
        var mt = api.canvasMaterial(512, 128, function (ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#EDE6D2'; ctx.font = 'bold 84px Helvetica, Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm.text, W / 2, H / 2); }, 0xEDE6D2);
        mt.transparent = true; var pl = api.part(api.plane(6.5, 1.6), mt, (nm.across == null ? width * 0.25 : nm.across), 0.106, at2 - s.s0 - s.len / 2, -Math.PI / 2, 0, 0, s.hold); pl.rotation.order = 'YXZ'; pl.rotation.set(-Math.PI / 2, nm.flip ? Math.PI : 0, 0); });
      (o.crosswalks || []).forEach(function (cw) { var s = segs[0]; for (var k = 0; k < segs.length; k++) if (segs[k].s0 <= cw && segs[k].s0 + segs[k].len >= cw) s = segs[k]; for (var q = -width / 2 + 0.6; q < width / 2 - 0.3; q += 1.0) slab(s, cw - s.s0, q, 0.45, 0.006, 2.6, K.paint, 0.105); });
      (o.manholes || []).forEach(function (mh) { var s = segs[0]; for (var k = 0; k < segs.length; k++) if (segs[k].s0 <= mh && segs[k].s0 + segs[k].len >= mh) s = segs[k]; var hd2 = api.sub(0, 0, 0, 0, 0, 0, s.hold); Cy(hd2, 0.4, 0.4, 0.02, 10, K.metal, 0.9, 0.11, mh - s.s0 - s.len / 2); });
      (o.redCurbs || []).forEach(function (rc) { var s = segs[0]; for (var k = 0; k < segs.length; k++) if (segs[k].s0 <= rc.at && segs[k].s0 + segs[k].len >= rc.at) s = segs[k]; slab(s, rc.at - s.s0, rc.side * (width / 2 + 0.08), 0.18, 0.16, rc.len || 12, K.curbRed, 0.08); });
      return g;
    };
    // Parked cars along both kerbs of a polyline, nose to tail, facing the traffic direction of their side.
    C.fillKerbs = function (polyline, width, o) {
      o = o || {}; var g = api.sub(0, 0, 0, 0, 0, 0, o.parent), spacing = o.spacing || 6.2, r6 = api.rand(o.seed || 4), n = 0, el = o.elevation || null, s0 = 0;
      for (var i = 0; i + 1 < polyline.length; i++) { var a = polyline[i], b = polyline[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len, yaw = Math.atan2(dx, dz), ya = el ? el[i] : 0, yb = el ? el[i + 1] : 0;
        for (var d = spacing * 0.7; d < len - spacing * 0.5; d += spacing * (0.85 + r6() * 0.4)) { var along = s0 + d; if (o.gaps && o.gaps.some(function (gp) { return along > gp[0] && along < gp[1] && (gp[2] == null); })) continue;
          [-1, 1].forEach(function (sd) { if (o.gaps && o.gaps.some(function (gp) { return along > gp[0] && along < gp[1] && gp[2] === sd; })) return; if (r6() < (o.density == null ? 0.85 : o.density)) { var px = a[0] + dx * d / len + nx * sd * (width / 2 - 1.0), pz = a[1] + dz * d / len + nz * sd * (width / 2 - 1.0), hold = api.sub(0, ya + (yb - ya) * d / len, 0, 0, 0, 0, g); hold.rotation.order = 'YXZ'; hold.rotation.set(0, 0, 0); var cg = C.car(px, pz, yaw + (sd < 0 ? 0 : Math.PI), { color: CAR_COLORS[n++ % CAR_COLORS.length], parent: hold, size: 0.85 + r6() * 0.3 }); cg.rotation.x = -Math.atan2(yb - ya, len) * (sd < 0 ? 1 : -1); } }); }
        s0 += len; }
      return g;
    };
    // A low-poly person: legs, torso, head, standing or mid-stride. o: { shirt, walking, seed }
    C.person = function (x, z, rot, o) { o = o || {}; var g = at(x, z, rot, o.parent), r7 = api.rand((o.seed || 1) * 5 + 2), sh = o.shirt || K.shirt[Math.floor(r7() * K.shirt.length)], stride = o.walking ? 0.3 : 0.05;
      B(g, 0.14, 0.8, 0.16, K.navy, -0.1, 0.4, stride / 2, o.walking ? 0.35 : 0); B(g, 0.14, 0.8, 0.16, K.navy, 0.1, 0.4, -stride / 2, o.walking ? -0.35 : 0);
      B(g, 0.4, 0.55, 0.22, sh, 0, 1.07, 0); B(g, 0.11, 0.5, 0.12, sh, -0.26, 1.08, o.walking ? -0.1 : 0, o.walking ? -0.4 : 0.1); B(g, 0.11, 0.5, 0.12, sh, 0.26, 1.08, o.walking ? 0.1 : 0, o.walking ? 0.4 : -0.1);
      Cy(g, 0.11, 0.1, 0.24, 7, K.skin, 0, 1.49, 0); B(g, 0.24, 0.08, 0.24, K.black, 0, 1.62, 0); return g; };
    C.fireEngine = function (x, z, rot, o) { var g = at(x, z, rot, o && o.parent); B(g, 2.5, 2.2, 8.0, K.red, 0, 1.6, 0); B(g, 2.4, 1.2, 2.2, K.red, 0, 2.2, 2.8); B(g, 2.42, 0.9, 1.6, K.glass, 0, 2.5, 3.0); B(g, 2.5, 0.6, 7.9, K.metal, 0, 0.7, 0); B(g, 0.6, 0.3, 5.0, K.metal, 0, 2.85, -0.8); [-1, 1].forEach(function (sd) { [[-2.6], [2.4]].forEach(function (p) { Cy(g, 0.55, 0.55, 0.4, 8, K.black, sd * 1.1, 0.55, p[0], 0, 0, Math.PI / 2); }); B(g, 0.3, 0.14, 0.4, K.lit, sd * 0.8, 1.1, 4.02); }); B(g, 2.2, 0.25, 0.3, K.lit, 0, 3.32, 3.6); return g; };
    C.utilityBox = function (x, z, rot, o) { var g = at(x, z, rot, o && o.parent); B(g, 0.9, 1.2, 0.5, K.metal, 0, 0.6, 0); return g; };
    // Dress the lot in front of a building: lawn from the facade to the sidewalk, a driveway strip on one side, shrubs by the
    // facade, a hedge or fence at the sidewalk on some lots, a yard tree, bins, sometimes a car in the drive.
    // b: map building; road: { polyline, width }; edge: street edge index; o: { seed, kind: 'house'|'apartments', parent, y }
    C.yard = function (b, road, edge, o) {
      o = o || {}; if (edge < 0) return null; var poly = b.polygon, n = poly.length, p = poly[edge], q = poly[(edge + 1) % n], r8 = api.rand((o.seed || 1) * 3 + 11);
      var mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, len = Math.hypot(q[0] - p[0], q[1] - p[1]), cx = 0, cz = 0; poly.forEach(function (pt) { cx += pt[0]; cz += pt[1]; }); cx /= n; cz /= n;
      var nx = -(q[1] - p[1]) / len, nz = (q[0] - p[0]) / len; if (Math.hypot(mx + nx - cx, mz + nz - cz) < Math.hypot(mx - cx, mz - cz)) { nx = -nx; nz = -nz; }
      // distance from the facade to the sidewalk's inner edge along the normal
      var best = Infinity; for (var k = 0; k + 1 < road.polyline.length; k++) { var a = road.polyline[k], c = road.polyline[k + 1], dx = c[0] - a[0], dz = c[1] - a[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((mx - a[0]) * dx + (mz - a[1]) * dz) / l2)); best = Math.min(best, Math.hypot(mx - (a[0] + dx * t), mz - (a[1] + dz * t))); }
      var depth = best - road.width / 2 - 3.1; if (depth < 1.5 || depth > 20) return null;
      // choices from a street sheet override the dice: { ground: 'lawn'|'dry'|'gravel'|'concrete', driveSide: -1|1, fence: 'picket'|'slat'|'plywood'|'board'|'hedge'|'none',
      //   tree: species|'none', shrubs: bool, bins: bool, car: colour key|'none', mailbox: bool, steps: bool }
      var ch = o.choices || {}, pick2 = function (key, dflt) { return ch[key] === undefined ? dflt : ch[key]; };
      var g = api.sub(mx, o.y || 0, mz, 0, Math.atan2(nx, nz), 0, o.parent), w = Math.min(len, 22), kind = o.kind || 'house';
      var groundKey = pick2('ground', kind === 'house' ? (r8() < 0.6 ? 'lawn' : 'dry') : 'gravel'), groundMat = { lawn: K.lawn, dry: K.lawnDry, gravel: K.gravel, concrete: K.concrete }[groundKey] || K.lawnDry;
      B(g, w, 0.05, depth, groundMat, 0, 0.025, depth / 2);
      var side = pick2('driveSide', r8() < 0.5 ? -1 : 1), dw = kind === 'house' ? 3.0 : 5.0; B(g, dw, 0.07, depth + 0.4, K.drive, side * (w / 2 - dw / 2), 0.035, depth / 2);
      if (w > 6) B(g, 1.0, 0.06, depth, K.concrete, -side * (w * 0.15), 0.03, depth / 2);
      if (pick2('shrubs', true)) for (var i = 0; i < Math.max(1, Math.floor(w / 3.5)); i++) { var sx = -w / 2 + 1.2 + i * 3.5; if (Math.abs(sx - side * (w / 2 - dw / 2)) < 2) continue; Cy(g, 0.45 + r8() * 0.3, 0.55 + r8() * 0.3, 0.7 + r8() * 0.6, 6, r8() < 0.5 ? K.canopy : K.canopyDark, sx, 0.45, 0.9); }
      var fence = pick2('fence', kind === 'house' ? (r8() < 0.5 ? (r8() < 0.5 ? 'picket' : 'slat') : (r8() < 0.5 ? 'hedge' : 'none')) : (r8() < 0.5 ? 'hedge' : 'none'));
      if (fence === 'hedge') C.hedge(-w / 2 + 0.3, depth - 0.3, side > 0 ? w / 2 - dw - 0.3 : w / 2 - 0.3, depth - 0.3, { parent: g, h: 0.9 + r8() * 0.5 });
      else if (fence && fence !== 'none') C.fence(-w / 2, depth, w / 2 - dw - 0.2, depth, { parent: g, style: fence, h: fence === 'picket' ? 1.0 : fence === 'block' ? 0.9 : 1.6 });
      var tree = pick2('tree', (r8() < 0.45 && depth > 4) ? (r8() < 0.5 ? 'ficus' : 'bottlebrush') : 'none');
      if (tree && tree !== 'none' && depth > 3) C.tree(-side * (w * 0.28), depth * 0.55, { parent: g, species: tree, h: pick2('treeH', 4.5 + r8() * 3), seed: 100 + Math.floor(r8() * 50) });
      if (pick2('bins', r8() < 0.5)) C.curbBins(side * (w / 2 - dw - 0.6), depth - 1.2, 0, { parent: g });
      var car = pick2('car', (r8() < 0.35 && depth > 5) ? CAR_COLORS[Math.floor(r8() * CAR_COLORS.length)] : 'none');
      if (car && car !== 'none' && depth > 4) C.car(side * (w / 2 - dw / 2), depth * 0.5, Math.PI + (r8() - 0.5) * 0.1, { parent: g, color: typeof car === 'string' ? (K[car] || K.navy) : car, size: 0.9 + r8() * 0.2 });
      if (pick2('mailbox', kind === 'house' && r8() < 0.5)) C.mailbox(-side * (w * 0.15) + 0.5, depth - 0.4, 0, { parent: g });
      if (pick2('steps', false)) C.frontSteps(-side * (w * 0.15), 0.6, Math.PI, { parent: g, steps: 3, w: 1.4 });
      return g;
    };
    // Facade dresser for map footprints: windows per floor on every long edge, plus per type: bungalow gable/porch/siding tone,
    // apartments balconies and soft-storey parking on the street face, modern boxes big glass, retail shopfront.
    C.dressFootprint = function (b, o) {
      o = o || {}; var poly = b.polygon, n = poly.length, h = b.height, type = o.type || b.type, floors = Math.max(1, Math.round((h - 0.5) / 3.2)), g = api.sub(0, o.y || 0, 0, 0, 0, 0, o.parent), i;
      var streetEdge = o.streetEdge != null ? o.streetEdge : -1, cx = 0, cz = 0; poly.forEach(function (pt) { cx += pt[0]; cz += pt[1]; }); cx /= n; cz /= n;
      for (i = 0; i < n; i++) {
        var p = poly[i], q = poly[(i + 1) % n], dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz); if (len < 3.5) continue;
        var mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, nx = -dz / len, nz = dx / len;
        if (Math.hypot(mx + nx - cx, mz + nz - cz) < Math.hypot(mx - cx, mz - cz)) { nx = -nx; nz = -nz; }   // point the normal away from the centroid
        var yaw = Math.atan2(nx, nz);   // the edge frame faces outward: local +z is the normal, local x runs along the edge
        var e = api.sub(mx + nx * 0.06, 0, mz + nz * 0.06, 0, yaw, 0, g), street = i === streetEdge;
        var wcount = Math.max(1, Math.floor(len / 3.2)), pitch = len / wcount, ww = type === 'modern' ? 1.6 : 1.0, wh = type === 'modern' ? 1.7 : 1.3, trim = o.trim || K.white;
        for (var f = 0; f < floors; f++) { var yb = 0.9 + f * 3.2; if (yb + wh > h - 0.3) break;
          if (type === 'apartments' && street && f === 0) { B(e, len - 0.8, 2.6, 0.5, K.dark, 0, 1.4, 0.2); continue; }
          for (var w = 0; w < wcount; w++) { var x0 = -len / 2 + pitch * (w + 0.5); B(e, ww + 0.2, wh + 0.2, 0.06, trim, x0, yb + wh / 2, 0); B(e, ww, wh, 0.05, f === 0 && street && o.lit ? K.glassLit : K.glass, x0, yb + wh / 2, 0.04); }
          if (type === 'apartments' && street && f > 0) { B(e, len - 1.0, 0.12, 1.4, K.concrete, 0, yb - 0.1, 0.72); for (var r = -len / 2 + 0.6; r < len / 2 - 0.5; r += 0.18) B(e, 0.03, 0.9, 0.03, K.metal, r, yb + 0.4, 1.4); B(e, len - 1.0, 0.04, 0.04, K.metal, 0, yb + 0.9, 1.4); } }
        if (type === 'house' && street) { B(e, 3.0, 0.15, 2.2, K.concrete, 0, 0.75, 1.1); [-1.3, 1.3].forEach(function (px) { B(e, 0.14, 2.3, 0.14, trim, px, 1.9, 2.1); }); B(e, 3.4, 0.2, 2.6, K.roofDark, 0, 3.1, 1.2); C.frontSteps(0, 0, 0, { parent: e, steps: 3, w: 1.2 }); var st = e.children[e.children.length - 1]; st.position.set(0, 0, 2.7); st.rotation.y = Math.PI; }
        if (type === 'retail' && street) B(e, len - 0.6, 2.6, 0.06, K.glass, 0, 1.6, 0.05);
        if (type === 'house' && o.siding) for (var sy = 0.3; sy < h - 0.4; sy += 0.25) B(e, len - 0.1, 0.03, 0.03, K.woodDark, 0, sy, 0.02);
      }
      return g;
    };
    // name every placed group after its catalog item, so exports carry readable nodes
    Object.keys(C).forEach(function (k) { if (typeof C[k] !== 'function' || k === 'walls' || k === 'floor') return; var fn = C[k]; C[k] = function () { var r = fn.apply(null, arguments); if (r && r.isObject3D && !r.name) r.name = k; return r; }; });
    return C;
  }

  return { init: init };
});

// Xbox Wireless Controller. Units are centimetres.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'controller',
  name: 'Xbox Wireless Controller',
  kind: 'prop',
  units: 'cm',
  camera: { pivotY: 0, fitW: 17, baseMin: 30, homePhi: 0.30, homeYaw: -0.38, tilt: 0.12 },
  colorways: 'props',
  notes: 'Body is one extruded top-down silhouette with a two-step bevel, four segments per curve; grip vertices are pushed down for the droop. Sticks, buttons, D-pad, bumpers and triggers are 8 to 12-sided cylinders and plain boxes.',
  build: function (api) {
    var M = api.M, part = api.part, TOP = 2.1;

    var s = api.shape();
    s.moveTo(0, 4.7); s.lineTo(4.4, 4.7);
    s.quadraticCurveTo(7.1, 4.5, 7.5, 2.6);
    s.quadraticCurveTo(8.0, 0.4, 7.3, -2.4);
    s.quadraticCurveTo(6.6, -5.0, 5.3, -5.7);
    s.quadraticCurveTo(4.0, -6.0, 3.5, -4.6);
    s.quadraticCurveTo(3.0, -3.3, 2.3, -2.7);
    s.quadraticCurveTo(1.0, -2.2, 0, -2.2);
    s.quadraticCurveTo(-1.0, -2.2, -2.3, -2.7);
    s.quadraticCurveTo(-3.0, -3.3, -3.5, -4.6);
    s.quadraticCurveTo(-4.0, -6.0, -5.3, -5.7);
    s.quadraticCurveTo(-6.6, -5.0, -7.3, -2.4);
    s.quadraticCurveTo(-8.0, 0.4, -7.5, 2.6);
    s.quadraticCurveTo(-7.1, 4.5, -4.4, 4.7);
    s.lineTo(0, 4.7);
    var body = api.extrude(s, { depth: 2.4, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.7, bevelSegments: 2, curveSegments: 4, steps: 1 });
    body.translate(0, 0, -1.2);
    api.displace(body, function (x, y, z) { return y < -2.4 ? [x, y, z - (-2.4 - y) * 0.32] : null; });
    part(body, [M.face, M.shell], 0, 0, 0, -Math.PI / 2);

    function stick(x, z) {
      part(api.torus(1.25, 0.22, 6, 10), M.shell, x, TOP, z, Math.PI / 2);
      part(api.cyl(0.42, 0.5, 1.3, 8), M.dark, x, TOP + 0.65, z);
      part(api.cyl(1.0, 0.82, 0.5, 10), M.stickTop, x, TOP + 1.55, z);
      part(api.disc(0.72, 10), M.dark, x, TOP + 1.81, z, -Math.PI / 2);
    }
    stick(-4.3, -1.8); stick(2.5, 0.8);

    part(api.cyl(1.45, 1.55, 0.3, 10), M.dark, -2.5, TOP + 0.15, 0.8);
    part(api.box(0.8, 0.35, 2.5), M.trim, -2.5, TOP + 0.47, 0.8);
    part(api.box(2.5, 0.35, 0.8), M.trim, -2.5, TOP + 0.47, 0.8);

    function btn(r, h, mat, x, z, seg) { part(api.cyl(r, r * 0.92, h, seg || 10), mat, x, TOP + h / 2, z); }
    btn(0.5, 0.4, M.y, 4.3, -2.85); btn(0.5, 0.4, M.a, 4.3, -0.75); btn(0.5, 0.4, M.x, 3.25, -1.8); btn(0.5, 0.4, M.b, 5.35, -1.8);
    btn(0.7, 0.3, M.cream, 0, -3.3, 12); btn(0.42, 0.25, M.trim, -1.7, -1.4, 8); btn(0.42, 0.25, M.trim, 1.7, -1.4, 8); btn(0.34, 0.2, M.trim, 0, 0.2, 8);

    [-1, 1].forEach(function (side) {
      part(api.box(5.0, 0.9, 1.5), M.trim, side * 3.6, 1.6, -4.9, -0.45);
      part(api.box(2.6, 1.7, 1.6), M.trim, side * 4.6, -0.3, -5.5, 0.55);
    });
  }
});

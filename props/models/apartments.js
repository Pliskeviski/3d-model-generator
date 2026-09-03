// Santa Monica apartment building: three stucco storeys over a half-basement, bracketed tile eave, set-back penthouse. Units are metres.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'apartments',
  name: 'Santa Monica Apartments',
  kind: 'building',
  units: 'm',
  camera: { pivotY: 6, fitW: 30, baseMin: 45, homePhi: 0.18, homeYaw: -0.55, tilt: 0.03 },
  colorways: 'creamStucco',
  notes: 'Three-storey stucco block on a raised half-basement, deep eave with eighty rafter tails under a red tile visor, set-back penthouse with its own tiled eave, ninety double-hung windows, two street entrances with tile hoods up three steps, corner downspouts, corner sidewalk with red curb. Proportions read off two street photos.',
  build: function (api) {
    var M = api.M, part = api.part;
    var L = 24, Wd = 12, HW = 10.3;
    var main = api.facade(L, Wd);

    // main block and its bracketed eave
    part(api.box(L, HW, Wd), M.face, 0, HW / 2, 0);
    api.eave(L, Wd, HW, 0.9, 0.25, true);

    // penthouse, set back, with a lighter eave
    var Lp = 18, Wp = 9.6, Hp = 2.5, py = HW + 0.25, pent = api.facade(Lp, Wp);
    part(api.box(Lp, Hp, Wp), M.face, 0, py + Hp / 2, 0);
    api.eave(Lp, Wp, py + Hp, 0.6, 0.2, false);
    [-6, -2, 2, 6].forEach(function (u) { pent.win('+z', u, py + 0.85, 0.8, 0.8, true); pent.win('-z', u, py + 0.85, 0.8, 0.8, true); });
    [-2.4, 2.4].forEach(function (u) { pent.win('+x', u, py + 0.85, 0.8, 0.8, true); pent.win('-x', u, py + 0.85, 0.8, 0.8, true); });

    // window grid: half-basement plus three floors; long sides seven bays, short sides three with a paired middle
    var floors = [{ sill: 1.7, h: 1.5 }, { sill: 4.7, h: 1.5 }, { sill: 7.7, h: 1.5 }];
    var doorBays = { 1: true, 5: true };
    for (var i = 0; i < 7; i++) {
      var u = -9.9 + i * 3.3;
      ['+z', '-z'].forEach(function (face) {
        var isDoor = (face === '+z' && doorBays[i]);
        if (!isDoor) main.win(face, u, 0.55, 0.9, 0.8, false);
        floors.forEach(function (f, k) { if (!(isDoor && k === 0)) main.win(face, u, f.sill, 1.0, f.h, true); });
      });
    }
    [-3.8, 0, 3.8].forEach(function (u, j) {
      var w = (j === 1) ? 2.1 : 1.0;
      ['+x', '-x'].forEach(function (face) {
        main.win(face, u, 0.55, w - 0.1, 0.8, false);
        floors.forEach(function (f) { main.win(face, u, f.sill, w, f.h, true); });
      });
    });

    // two street entrances: door, lit transom, tile hood on brackets, three steps
    [-6.6, 6.6].forEach(function (u) {
      main.slab(1.3, 2.5, 0.06, M.shell, '+z', u, 1.1 + 1.25, 0.03);
      main.slab(1.0, 2.1, 0.05, M.door, '+z', u, 1.1 + 1.05, 0.06);
      main.slab(1.0, 0.3, 0.05, M.lit, '+z', u, 3.35, 0.06);
      main.slab(1.9, 0.08, 0.95, M.tile, '+z', u, 3.95, 0.42, 0.45);
      main.slab(0.1, 0.55, 0.7, M.shell, '+z', u - 0.75, 3.45, 0.35);
      main.slab(0.1, 0.55, 0.7, M.shell, '+z', u + 0.75, 3.45, 0.35);
      for (var k = 0; k < 3; k++) part(api.box(1.7, 1.1 - k * 0.37, 0.32), M.pad, u, (1.1 - k * 0.37) / 2, Wd / 2 + 0.16 + k * 0.32);
    });

    // corner downspouts, sidewalk and red curb
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) { part(api.box(0.12, HW - 0.3, 0.12), M.shell, c[0] * (L / 2 - 0.35), (HW - 0.3) / 2, c[1] * (Wd / 2 + 0.08)); });
    part(api.box(30, 0.15, 18), M.pad, 0, -0.075, 0);
    part(api.box(30, 0.16, 0.35), M.curb, 0, 0, 9 - 0.175);
    part(api.box(0.35, 0.16, 18), M.curb, 15 - 0.175, 0, 0);
  }
});

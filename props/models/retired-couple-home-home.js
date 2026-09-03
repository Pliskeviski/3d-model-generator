// 2401, upper floor: the Nakamura home. See environments/envs/retired-couple-home/scenario.md.
// Metres, shown at 1.5 scale to match the exterior model (props/models/house.js). Walls cut at 0.8 and 0.85 m, dollhouse style.
// Plan, origin at the centre of the 12.1 x 8.5 m clear space, +z toward the street:
//   front: kitchen and dining (x -6.05..-0.6, closed off by a peninsula) | living room (x -0.2..6.05)
//   back:  bedroom (x -6.05..-2.0) | bath (..0.5) | sewing (..3.6) | guest and radio (..6.05, z -4.25..-1.6)
//   hall x -2.0..3.6 at z -1.3..0; entry x 3.6..6.05 at z -1.6..0 with the front door on the right-hand wall.
// Front windows follow the exterior at x = -5.2 (0.70), -1.4 (0.95), 2.15 (2.35), 5.3 (1.35); sill markers sit on the cut wall.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'retired-couple-home-home',
  name: 'Nakamura Home, 2401',
  kind: 'scene',
  units: 'm',
  scale: 1.5,
  camera: { pivotY: 1.0, fitW: 24, baseMin: 26, homePhi: 0.6, homeYaw: -0.35, tilt: 0.02 },
  colorways: [
    { id: 'linen', name: 'Warm linen walls', sw: '#E9DCC6', face: 0xE9DCC6, shell: 0xF1E3C4 },
    { id: 'sage', name: 'Pale sage', sw: '#B8C0A6', face: 0xB8C0A6, shell: 0xF1E3C4 },
    { id: 'clay', name: 'Clay', sw: '#C98A6A', face: 0xC98A6A, shell: 0xF1E3C4 }
  ],
  notes: 'Upper floor of the stucco house as a dollhouse for a retired couple: seven rooms from a wall-and-door plan, a kitchen peninsula where they actually eat, a quilting room, an accessible bath and a guest room doubling as a ham radio shack, with window sill markers on the cut front wall.',
  build: function (api) {
    var CAT = (typeof module !== 'undefined' && module.exports) ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var C = CAT.init(api), K = C.K, M = api.M, PI = Math.PI;
    var X0 = -6.05, X1 = 6.05, Z0 = -4.25, Z1 = 4.25, E = 0.125;
    function box(g, w, h, d, m, x, y, z, rx, ry, rz) { return api.part(api.box(w, h, d), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    function cyl(g, rt, rb, h, seg, m, x, y, z, rx, ry, rz) { return api.part(api.cyl(rt, rb, h, seg), m, x, y, z, rx || 0, ry || 0, rz || 0, g); }
    var QUILT = [K.rugRed, K.navy, K.rugSand, K.cream, K.plum, K.leaf, K.fabric, K.rust];
    // a patchwork panel centred on its group: Marisol's quilts, four of them in the house
    function patchwork(g, w, d, y, cols, rows, seed) {
      var cw = w / cols, cd = d / rows;
      for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++)
        box(g, cw * 0.92, 0.03, cd * 0.92, QUILT[(i * 3 + j * 2 + seed) % QUILT.length], -w / 2 + cw * (i + 0.5), y, -d / 2 + cd * (j + 0.5));
    }
    function frame(g, x, y, z, w, h, rot) { box(g, w, h, 0.015, K.woodDark, x, y + h / 2, z, -0.12, rot || 0, 0); box(g, w - 0.04, h - 0.04, 0.008, K.linen, x, y + h / 2, z + 0.012, -0.12, rot || 0, 0); }

    // ---- floors
    C.floor(-0.2, 0, X1, Z1, K.floorWood);        // living
    C.floor(X0, 0, -0.2, Z1, K.floorTile);        // kitchen and dining
    C.floor(-2.0, -1.3, 3.6, 0, K.floorWood);     // hall
    C.floor(3.6, -1.6, X1, 0, K.floorTile);       // entry
    C.floor(X0, Z0, -2.0, 0, K.floorWood);        // bedroom
    C.floor(-2.0, Z0, 0.5, -1.3, K.floorTile);    // bath
    C.floor(0.5, Z0, 3.6, -1.3, K.floorWood);     // sewing
    C.floor(3.6, Z0, X1, -1.6, K.floorWood);      // guest and radio

    // ---- exterior walls, front door on the right-hand wall at the head of the outside stairs
    C.walls([[X0 - E, Z1 + E, X1 + E, Z1 + E], [X0 - E, Z0 - E, X1 + E, Z0 - E], [X0 - E, Z0 - E, X0 - E, Z1 + E], [X1 + E, Z0 - E, X1 + E, Z1 + E]],
      [{ x: X1 + E, z: -0.8, w: 0.95, axis: 'z', leaf: true, swing: -1 }], { t: 0.25, h: 0.8 });
    // ---- interior walls with door gaps
    C.walls([
      [X0, 0, X1, 0],              // front rooms | back rooms
      [-2.0, Z0, -2.0, 0],         // bedroom | bath and hall
      [-2.0, -1.3, 3.6, -1.3],     // hall | bath and sewing
      [0.5, Z0, 0.5, -1.3],        // bath | sewing
      [3.6, Z0, 3.6, 0],           // sewing and guest | hall and entry
      [3.6, -1.6, X1, -1.6]        // guest | entry
    ], [
      { x: -1.3, z: 0, w: 1.0, axis: 'x' },                              // kitchen to hall, open
      { x: 4.9, z: 0, w: 1.3, axis: 'x' },                               // living to entry, open
      { x: -2.0, z: -0.65, w: 0.9, axis: 'z', leaf: true, swing: -1 },   // bedroom
      { x: -0.95, z: -1.3, w: 0.85, axis: 'x', leaf: true, swing: 1 },   // bath
      { x: 2.0, z: -1.3, w: 0.85, axis: 'x', leaf: true, swing: 1 },     // sewing
      { x: 3.6, z: -0.65, w: 0.9, axis: 'z' },                           // hall to entry, open
      { x: 5.0, z: -1.6, w: 0.85, axis: 'x', leaf: true, swing: 1 }      // guest and radio
    ], { t: 0.12, h: 0.85 });

    // ---- window markers on the cut front wall: sill band, jamb stubs and the foot of the glass
    [[-5.2, 0.7], [-1.4, 0.95], [2.15, 2.35], [5.3, 1.35]].forEach(function (w) {
      box(null, w[1] + 0.18, 0.09, 0.22, M.shell, w[0], 0.845, 4.30);
      box(null, w[1], 0.16, 0.05, K.glass, w[0], 0.97, 4.235);
      [-1, 1].forEach(function (s) { box(null, 0.09, 0.24, 0.16, M.shell, w[0] + s * (w[1] / 2 + 0.045), 1.01, 4.29); });
    });

    // ---- living room: the set on the hall wall, both chairs pointed at it
    C.rug(2.3, 2.4, 0, 3.4, 2.6, K.rugRed);
    C.sofa(2.1, 3.35, PI, { w: 2.2, pillow: K.rugSand });
    var fold = api.sub(3.0, 0.8, 3.3, 0, 0.1, 0); patchwork(fold, 0.5, 0.42, 0.02, 3, 3, 1);   // a quilt over the arm
    C.coffeeTable(2.1, 2.25, 0);
    C.mug(1.75, 2.35, 0.44); C.mug(2.45, 2.2, 0.44, K.plum);
    [0, 1, 2].forEach(function (i) { box(null, 0.16, 0.035, 0.22, QUILT[i + 2], 2.28 + i * 0.01, 0.457 + i * 0.035, 2.36, 0, i * 0.14 - 0.1); });  // library books
    var tv = api.sub(1.4, 0, 0.34, 0, 0, 0);
    box(tv, 1.5, 0.45, 0.4, K.wood, 0, 0.225, 0); box(tv, 1.42, 0.02, 0.34, K.woodDark, 0, 0.24, 0.01);
    box(tv, 0.46, 0.04, 0.24, K.black, 0, 0.47, 0); box(tv, 0.07, 0.15, 0.06, K.black, 0, 0.55, 0);
    box(tv, 1.2, 0.68, 0.035, K.glass, 0, 0.96, -0.02); box(tv, 1.26, 0.06, 0.06, K.black, 0, 0.61, -0.02);
    box(tv, 0.2, 0.09, 0.16, K.card, -0.52, 0.29, 0.13);
    C.bookshelf(2.75, 0.22, 0, { w: 0.9, h: 1.9 });
    C.bookshelf(3.7, 0.22, 0, { w: 0.9, h: 1.9 });
    C.armchair(4.95, 2.95, -2.21, { mat: K.navy });                        // Walter's chair, high seat
    box(null, 0.52, 0.34, 0.44, K.navy, 4.3, 0.17, 2.4, 0, -2.21, 0);       // footstool
    C.sideTable(5.75, 3.6, 0);                                              // the walnut table Ines made
    C.papers(5.75, 3.6, 0.35, 0.57); C.mug(5.62, 3.42, 0.57, K.rust);
    cyl(null, 0.028, 0.028, 0.09, 8, K.white, 5.9, 0.615, 3.72); cyl(null, 0.026, 0.026, 0.08, 8, K.rugSand, 5.86, 0.61, 3.82);
    C.floorLamp(5.85, 2.6);
    C.armchair(0.5, 3.4, -0.9, { mat: K.rust });                            // Marisol's reading chair
    C.plant(0.15, 2.15, 0, { size: 1.4, leaves: 6 });
    C.dogBed(4.6, 3.75, 0.5);
    C.rug(4.75, 0.55, 0, 0.9, 0.6, K.rugSand);

    // ---- kitchen and dining: run under the front windows, peninsula where they eat
    C.counter(-5.2, 3.95, PI, 1.7);
    C.stove(-3.97, 3.94, PI);
    C.counter(-2.25, 3.95, PI, 2.7);
    C.sink(-1.4, 3.95, PI);
    C.counter(-0.6, 2.42, PI / 2, 2.45);                                    // peninsula
    C.stool(-0.03, 1.95, 0); C.stool(-0.03, 2.8, 0);
    C.mug(-0.55, 2.05, 0.9); C.mug(-0.55, 2.75, 0.9, K.blue);
    C.papers(-0.62, 1.55, 0.25, 0.9);
    C.fridge(-5.68, 1.7, PI / 2);
    C.dogBowls(-5.7, 0.55, PI / 2);
    C.fruitBowl(-2.9, 3.95, 0.9);
    C.plant(-5.2, 3.95, 0, { size: 0.5, y: 0.9, seed: 4 });                 // basil under the left window
    box(null, 0.24, 0.14, 0.14, K.card, -4.65, 0.97, 3.95); box(null, 0.1, 0.05, 0.02, K.lit, -4.6, 0.99, 4.03);  // the kitchen radio
    cyl(null, 0.085, 0.095, 0.16, 8, K.metal, -4.2, 1.01, 3.8); box(null, 0.11, 0.025, 0.03, K.metal, -4.32, 1.05, 3.8, 0, 0, 0.4);  // kettle
    box(null, 0.17, 0.24, 0.02, K.fabric, -4.0, 0.58, 3.6);                 // dish towel on the oven handle
    C.diningTable(-3.4, 1.7, 0);
    C.chair(-3.85, 2.45, PI); C.chair(-2.95, 2.45, PI); C.chair(-3.85, 0.95, 0); C.chair(-2.9, 0.82, 0.45);
    box(null, 0.62, 0.012, 0.44, K.card, -3.45, 0.766, 1.62);               // the puzzle, since Christmas
    [[-3.6, 1.5], [-3.3, 1.72], [-3.5, 1.8], [-3.22, 1.55], [-3.72, 1.66]].forEach(function (p, i) {
      box(null, 0.06, 0.008, 0.06, QUILT[(i * 3) % QUILT.length], p[0], 0.776, p[1], 0, i * 0.4);
    });
    box(null, 0.34, 0.07, 0.24, K.navy, -2.85, 0.775, 1.95, 0, 0.2);        // the puzzle box lid

    // ---- hall
    C.rug(0.7, -0.65, 0, 4.6, 0.9, K.rugSand);
    C.consoleTable(0.6, -1.06, 0);
    frame(null, 0.35, 0.815, -1.08, 0.16, 0.2, 0.1); frame(null, 0.58, 0.815, -1.12, 0.13, 0.17, -0.2); frame(null, 0.78, 0.815, -1.06, 0.18, 0.14, 0.05);

    // ---- entry: bench, coats, and the cane by the door
    C.rug(5.3, -0.75, PI / 2, 0.8, 0.5, K.rugNavy);
    C.shoeBench(4.25, -1.35, 0);                                            // white oak, made downstairs
    C.shoes(4.95, -1.4, 0.25, K.woodDark);
    C.coatRack(5.75, -1.35, 0);
    var cane = api.sub(5.9, 0, -0.3, 0, 0, -0.25);
    cyl(cane, 0.018, 0.018, 0.92, 6, K.woodDark, 0, 0.46, 0); box(cane, 0.13, 0.035, 0.035, K.woodDark, -0.05, 0.92, 0);

    // ---- bedroom: head of the bed on the outside wall, quilt over the foot
    C.bed(-4.9, -2.0, PI / 2, { w: 1.6, l: 2.0, blanket: K.linen });
    var bq = api.sub(-4.35, 0, -2.0, 0, PI / 2, 0); patchwork(bq, 1.5, 0.95, 0.5, 5, 3, 0);
    C.nightstand(-5.75, -3.1, PI / 2);
    C.nightstand(-5.75, -0.9, PI / 2, { noBook: true });
    C.dresser(-3.5, -0.35, PI);
    frame(null, -3.75, 0.85, -0.5, 0.18, 0.22, PI + 0.15); frame(null, -3.4, 0.85, -0.53, 0.14, 0.18, PI - 0.1);
    box(null, 0.22, 0.09, 0.16, K.plum, -3.1, 0.895, -0.5, 0, PI + 0.1);
    C.wardrobe(-3.1, -3.9, 0);
    C.toyBox(-3.63, -2.0, PI / 2);                                          // cedar chest at the foot
    var cq = api.sub(-3.63, 0, -2.0, 0, PI / 2, 0); patchwork(cq, 0.5, 0.34, 0.45, 3, 2, 4);
    C.laundryBasket(-2.5, -2.4, 0);
    C.shoes(-4.5, -0.95, 0.15, K.plum);
    C.plant(-5.85, -3.9, 0, { size: 0.9, seed: 3 });

    // ---- bathroom: the tub came out, level-entry shower with bars
    var sh = api.sub(-1.45, 0, -3.7, 0, 0, 0);
    box(sh, 1.0, 0.08, 0.9, K.white, 0, 0.04, 0);
    box(sh, 0.04, 1.85, 0.9, K.glass, 0.48, 0.96, 0);
    box(sh, 1.0, 1.85, 0.04, K.glass, 0, 0.96, -0.43, 0, 0, 0);
    cyl(sh, 0.02, 0.02, 1.35, 6, K.metal, -0.44, 0.85, -0.3);
    box(sh, 0.18, 0.05, 0.16, K.metal, -0.38, 1.5, -0.3);
    box(sh, 0.4, 0.06, 0.32, K.wood, -0.28, 0.48, 0.1);                     // fold-down seat
    cyl(sh, 0.028, 0.028, 0.7, 8, K.metal, -0.44, 0.9, 0.05, PI / 2);       // grab bar
    C.toilet(-1.62, -2.55, PI / 2);
    cyl(null, 0.028, 0.028, 0.6, 8, K.metal, -1.93, 0.78, -2.55, PI / 2);   // second bar
    C.vanity(0.15, -3.5, -PI / 2);
    C.rug(-0.75, -2.6, 0, 0.7, 0.5, K.rugSand);
    C.laundryBasket(-1.75, -1.75, 0);

    // ---- sewing room: machine threaded, quilt on the frame, iron still out
    C.desk(1.4, -3.9, 0, { w: 1.4, d: 0.65 });
    C.chair(1.4, -3.3, PI, { mat: K.woodLight });
    var sm = api.sub(1.3, 0.76, -3.88, 0, 0, 0);
    box(sm, 0.45, 0.09, 0.20, K.cream, 0, 0.045, 0);
    box(sm, 0.14, 0.27, 0.20, K.cream, 0.155, 0.225, 0);
    box(sm, 0.32, 0.11, 0.16, K.cream, -0.03, 0.36, 0);
    box(sm, 0.10, 0.17, 0.16, K.cream, -0.18, 0.33, 0);
    cyl(sm, 0.008, 0.008, 0.08, 6, K.metal, -0.18, 0.20, 0);
    cyl(sm, 0.05, 0.05, 0.03, 8, K.black, 0.235, 0.30, 0, 0, 0, PI / 2);
    cyl(sm, 0.018, 0.018, 0.07, 6, K.rugRed, 0.09, 0.44, -0.03);
    box(sm, 0.06, 0.02, 0.05, K.lit, -0.13, 0.29, 0.07);
    C.papers(2.0, -3.85, 0.2, 0.76);
    box(null, 0.16, 0.02, 0.05, K.metal, 1.95, 0.775, -3.6, 0, 0.3);        // shears
    var qf = api.sub(2.5, 0, -3.05, 0, 0, 0);
    [-1, 1].forEach(function (s) {
      box(qf, 1.3, 0.06, 0.06, K.woodDark, 0, 0.85, s * 0.28);
      [-1, 1].forEach(function (t) { cyl(qf, 0.03, 0.035, 0.85, 6, K.woodDark, t * 0.58, 0.425, s * 0.28); });
    });
    patchwork(qf, 1.16, 0.5, 0.89, 4, 2, 2);
    var ib = api.sub(0.95, 0, -2.6, 0, 0, 0);
    box(ib, 0.34, 0.03, 1.2, K.linen, 0, 0.88, 0);
    box(ib, 0.26, 0.02, 0.3, K.rugSand, 0, 0.905, -0.32);
    box(ib, 0.11, 0.09, 0.2, K.metal, 0.02, 0.935, 0.4); box(ib, 0.07, 0.05, 0.09, K.black, 0.02, 1.0, 0.45);
    [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { cyl(ib, 0.018, 0.018, 0.9, 6, K.metal, s * 0.11, 0.44, t * 0.32, 0, 0, s * 0.12); }); });
    C.bookshelf(3.36, -3.0, -PI / 2, { w: 1.4, h: 1.5, d: 0.35, shelves: 4 });
    [[-3.5, K.rugRed], [-3.1, K.fabric], [-2.7, K.leaf]].forEach(function (p, i) { box(null, 0.3, 0.1, 0.34, p[1], 3.36, 1.55 + 0.0, p[0], 0, 0.1 * i); });
    C.laundryBasket(3.3, -1.75, 0);
    C.rug(2.2, -2.5, 0, 1.8, 1.4, K.rugNavy);

    // ---- guest room and radio shack
    C.bed(4.85, -3.7, PI / 2, { w: 0.85, l: 1.95, blanket: K.rugNavy });
    var gq = api.sub(5.5, 0, -3.7, 0, PI / 2, 0); patchwork(gq, 0.85, 0.5, 0.5, 3, 2, 5);
    C.desk(5.75, -2.6, -PI / 2, { w: 1.1, d: 0.55 });
    var rig = api.sub(5.78, 0.76, -2.6, 0, -PI / 2, 0);
    box(rig, 0.34, 0.14, 0.26, K.black, 0, 0.07, 0);
    box(rig, 0.2, 0.05, 0.02, K.lit, -0.05, 0.09, 0.13);
    [-1, 1].forEach(function (s) { cyl(rig, 0.022, 0.022, 0.02, 8, K.metal, 0.12 * s + 0.02, 0.07, 0.135, PI / 2); });
    box(rig, 0.2, 0.16, 0.24, K.metal, 0.32, 0.08, -0.02);
    box(rig, 0.12, 0.02, 0.09, K.metal, -0.28, 0.01, 0.16); cyl(rig, 0.012, 0.012, 0.05, 6, K.black, -0.28, 0.04, 0.19);
    cyl(rig, 0.05, 0.06, 0.02, 8, K.black, -0.3, 0.01, -0.06); cyl(rig, 0.01, 0.01, 0.16, 6, K.metal, -0.3, 0.09, -0.06); box(rig, 0.05, 0.06, 0.05, K.black, -0.3, 0.19, -0.04);
    C.papers(5.6, -2.95, 0.4, 0.76);
    C.headphones(5.55, -2.25, 0.76);
    C.chair(5.15, -2.6, PI / 2, { mat: K.woodDark });
    C.bookshelf(3.85, -2.55, PI / 2, { w: 1.0, h: 1.1, d: 0.3, shelves: 3 });
    C.toyBox(4.35, -1.95, 0);
    C.rug(4.7, -2.6, 0, 1.2, 0.9, K.rugRed);
  }
});

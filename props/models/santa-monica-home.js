// Santa Monica house, upper floor: the home of the Okafor-Vance household. See environments/envs/santa-monica-house/scenario.md.
// Metres, shown at 1.5 scale to match the exterior model. Walls are cut at 0.95 m, dollhouse style.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'santa-monica-home',
  name: 'Santa Monica Home',
  kind: 'scene',
  units: 'm',
  scale: 1.5,
  camera: { pivotY: 1.0, fitW: 24, baseMin: 26, homePhi: 0.6, homeYaw: -0.35, tilt: 0.02 },
  colorways: [
    { id: 'warm', name: 'Warm white walls', sw: '#E6DAC6', face: 0xE6DAC6, shell: 0xF1E3C4 },
    { id: 'sage', name: 'Sage walls', sw: '#B8C0A6', face: 0xB8C0A6, shell: 0xF1E3C4 },
    { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
  ],
  notes: 'Upper floor of the stucco house as a dollhouse: seven rooms from a wall-and-door plan, about seventy catalog pieces placed where the household leaves them. Living room and kitchen open across the front, bedrooms, bath and the sound studio at the back, front door on the side wall.',
  build: function (api) {
    var CAT = (typeof module !== 'undefined' && module.exports) ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var C = CAT.init(api), K = C.K, PI = Math.PI;
    var X0 = -6.05, X1 = 6.05, Z0 = -4.25, Z1 = 4.25;   // interior clear space; +z is the street

    // floors by room
    C.floor(0, 0, X1, Z1, K.floorWood);           // living
    C.floor(X0, 0, 0, Z1, K.floorTile);           // kitchen and dining
    C.floor(-2.4, -1.2, 3.4, 0, K.floorWood);     // hall
    C.floor(3.4, -1.6, X1, 0, K.floorWood);       // entry
    C.floor(X0, Z0, -2.4, 0, K.floorWood);        // main bedroom
    C.floor(-2.4, Z0, -0.2, -1.2, K.floorTile);   // bathroom
    C.floor(-0.2, Z0, 3.4, -1.2, K.floorWood);    // Milo
    C.floor(3.4, Z0, X1, -1.6, K.floorWood);      // studio

    // exterior walls (0.25 thick, centred outside the clear space) with the front door on the right wall
    var E = 0.125;
    C.walls([[X0 - E, Z1 + E, X1 + E, Z1 + E], [X0 - E, Z0 - E, X1 + E, Z0 - E], [X0 - E, Z0 - E, X0 - E, Z1 + E], [X1 + E, Z0 - E, X1 + E, Z1 + E]],
      [{ x: X1 + E, z: -0.8, w: 0.95, axis: 'z', leaf: true, swing: -1 }], { t: 0.25, h: 0.8 });
    // interior walls with door gaps
    C.walls([
      [X0, 0, X1, 0],                 // front rooms | back rooms
      [-2.4, Z0, -2.4, 0],            // main bedroom | bath and hall
      [-2.4, -1.2, 3.4, -1.2],        // hall | bath and Milo
      [-0.2, Z0, -0.2, -1.2],         // bath | Milo
      [3.4, Z0, 3.4, 0],              // Milo and studio | entry and hall
      [3.4, -1.6, X1, -1.6]           // studio | entry
    ], [
      { x: 0.9, z: 0, w: 1.4, axis: 'x' },                 // living to hall, open
      { x: 4.5, z: 0, w: 1.4, axis: 'x' },                 // living to entry, open
      { x: -2.4, z: -0.65, w: 0.9, axis: 'z', leaf: true, swing: -1 },   // main bedroom
      { x: -1.35, z: -1.2, w: 0.85, axis: 'x', leaf: true, swing: 1 },   // bathroom
      { x: 1.6, z: -1.2, w: 0.85, axis: 'x', leaf: true, swing: 1 },     // Milo
      { x: 3.4, z: -0.6, w: 0.9, axis: 'z' },                            // hall to entry, open
      { x: 5.5, z: -1.6, w: 0.85, axis: 'x', leaf: true, swing: 1 }      // studio
    ], { t: 0.12, h: 0.85 });

    // ---- living room: sofa faces the TV wall, records and armchair by the right wall
    C.rug(3.0, 2.3, 0, 3.0, 2.2, K.rugRed);
    C.sofa(3.0, 3.35, PI, { pillow: K.rust });
    C.coffeeTable(3.0, 2.3, 0);
    C.armchair(5.35, 3.15, -PI / 2);
    C.sideTable(4.45, 2.65, 0);
    C.floorLamp(4.4, 3.9);
    var tv = api.sub(3.0, 0, 0.35, 0, 0, 0); api.part(api.box(1.6, 0.42, 0.42), K.wood, 0, 0.21, 0, 0, 0, 0, tv);
    api.part(api.box(0.4, 0.03, 0.2), K.black, 0, 0.435, -0.05, 0, 0, 0, tv); api.part(api.box(0.05, 0.12, 0.04), K.black, 0, 0.5, -0.1, 0, 0, 0, tv);
    api.part(api.box(1.2, 0.68, 0.035), K.glass, 0, 0.9, -0.1, 0, 0, 0, tv); api.part(api.box(0.9, 0.06, 0.08), K.black, 0, 0.45, 0.14, 0, 0, 0, tv);
    C.cubeShelf(5.8, 1.0, -PI / 2, { cols: 4, rows: 2, turntable: true });
    C.bookshelf(0.55, 3.95, PI, { w: 0.8, h: 1.8 });
    C.plant(1.85, 0.45, 0, { size: 1.6, leaves: 6 });
    C.plant(5.75, 3.95, 0, { size: 1.1, seed: 2 });
    C.dogBed(4.75, 1.25, 0.6);
    C.skateboard(3.45, 0.22, 0, { upright: true });

    // ---- kitchen and dining: L run under the front windows, walnut table in the middle
    C.counter(-5.065, 3.95, PI, 1.97);
    C.stove(-3.7, 3.94, PI);
    C.counter(-2.235, 3.95, PI, 2.17);
    C.sink(-1.7, 3.95, PI);
    C.counter(-5.75, 2.325, PI / 2, 2.65);
    C.fridge(-5.68, 0.5, PI / 2);
    C.fruitBowl(-2.7, 3.95, 0.9);
    C.plant(-4.6, 3.95, 0, { size: 0.55, y: 0.9, seed: 1 });
    C.mug(-1.1, 3.9, 0.9, K.plum);
    C.diningTable(-2.6, 1.7, 0);
    [[-3.05, 2.45, PI], [-2.15, 2.45, PI], [-3.05, 0.95, 0], [-2.15, 0.95, 0]].forEach(function (c) { C.chair(c[0], c[1], c[2]); });
    C.laptop(-2.9, 1.75, -0.2, 0.76);
    C.papers(-2.2, 1.6, 0.15, 0.76);
    C.mug(-1.95, 1.95, 0.76);
    C.dogBowls(-0.5, 0.4, 0);

    // ---- hall and entry
    C.rug(0.5, -0.6, 0, 3.0, 0.7, K.rugNavy);
    C.rug(5.55, -0.8, PI / 2, 0.7, 0.45, K.rugSand);
    C.shoeBench(4.0, -1.35, 0);
    C.coatRack(3.7, -0.3, 0);

    // ---- main bedroom: head of the bed on the left wall
    C.bed(-4.95, -2.1, PI / 2, { w: 1.6, l: 2.0 });
    C.nightstand(-5.8, -3.25, PI / 2);
    C.nightstand(-5.8, -0.95, PI / 2, { noBook: true });
    C.dresser(-3.6, -0.3, PI);
    C.wardrobe(-2.72, -3.3, -PI / 2, { w: 1.8 });
    C.bench(-3.55, -2.1, PI / 2);
    C.laundryBasket(-4.5, -3.95, 0);
    C.plant(-5.75, -0.3, 0, { size: 0.9, seed: 3 });
    C.shoes(-2.9, -0.5, 0.3, K.rugRed);

    // ---- bathroom
    C.bathtub(-1.3, -3.85, 0);
    C.toilet(-2.05, -2.55, PI / 2);
    C.vanity(-0.47, -2.3, -PI / 2);
    C.rug(-1.3, -3.2, 0, 0.8, 0.5, K.rugSand);
    C.laundryBasket(-0.5, -1.5, 0);

    // ---- Milo's room
    C.rug(1.6, -2.4, 0, 1.6, 1.2, K.rugNavy);
    C.bed(0.35, -3.2, 0, { w: 0.9, l: 2.0, blanket: K.fabric });
    C.desk(3.05, -3.3, -PI / 2, { w: 1.1, d: 0.6 });
    C.chair(2.5, -3.3, PI / 2, { mat: K.woodLight });
    C.legoBuild(3.05, -3.5, 0.76);
    C.mug(3.15, -2.95, 0.76, K.blue);
    C.legoBins(3.1, -1.55, 0);
    C.bookshelf(1.8, -3.98, 0, { w: 0.8, h: 0.9, d: 0.28, shelves: 2 });
    C.beanbag(0.5, -1.7, 0.4);
    C.toyBox(2.55, -4.02, 0);
    C.backpack(1.05, -2.3, 0.4);
    C.skateboard(2.6, -1.7, 0.3, { mat: K.navy });

    // ---- studio
    C.rug(4.7, -2.9, 0, 1.8, 1.4, K.rugRed);
    C.desk(4.7, -3.85, 0, { w: 1.6, d: 0.7 });
    C.monitor(4.45, -4.0, 0, 0.76, { w: 0.6 }); C.monitor(5.1, -4.0, -0.2, 0.76, { w: 0.5 });
    C.speaker(3.95, -4.05, 0.15, 0.76); C.speaker(5.45, -4.05, -0.15, 0.76);
    C.midiKeyboard(4.7, -3.62, 0, 0.76);
    C.headphones(5.25, -3.6, 0.76);
    C.officeChair(4.7, -3.05, PI);
    C.micStand(5.7, -3.1, PI);
    C.bookshelf(5.8, -2.2, -PI / 2, { w: 0.6, h: 1.4, d: 0.25, shelves: 3 });
    C.plant(3.65, -2.0, 0, { size: 1.2, seed: 5 });
  }
});

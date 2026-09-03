// Santa Monica house, garage level: four bays behind the doors. See environments/envs/santa-monica-house/scenario.md.
// Metres, shown at 1.5 scale. Walls cut at 0.95 m. The family car is the generated Honda Fit when present, else a catalog car.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'santa-monica-garage',
  name: 'Santa Monica Garage',
  kind: 'scene',
  units: 'm',
  scale: 1.5,
  camera: { pivotY: 1.0, fitW: 24, baseMin: 26, homePhi: 0.6, homeYaw: -0.35, tilt: 0.02 },
  colorways: [
    { id: 'stucco', name: 'Taupe stucco', sw: '#B9AC9C', face: 0xB9AC9C, shell: 0xF1E3C4 },
    { id: 'white', name: 'Whitewash', sw: '#E6D6B4', face: 0xE6D6B4, shell: 0xF1E3C4 },
    { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
  ],
  notes: 'Garage level as a dollhouse: one open bay behind the four doors. Bikes and surfboards on the left, the family hatchback in bay two, workbench and shelving in bay three, laundry and storage on the right. The car is the generated Honda Fit model embedded at its real length.',
  build: function (api) {
    var isNode = (typeof module !== 'undefined' && module.exports);
    var CAT = isNode ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var C = CAT.init(api), K = C.K, PI = Math.PI;
    var X0 = -6.05, X1 = 6.05, Z0 = -4.25, Z1 = 4.25, E = 0.125;

    C.floor(X0, Z0, X1, Z1, K.floorConcrete);
    C.walls([[X0 - E, Z0 - E, X1 + E, Z0 - E], [X0 - E, Z0 - E, X0 - E, Z1 + E], [X1 + E, Z0 - E, X1 + E, Z1 + E]], [], { t: 0.25, h: 0.8 });
    C.garageFront(-6.3, 6.3, Z1 + E, 4, 0.8, api.group);

    // the car: the generated Honda Fit if it exists in the gallery, otherwise the catalog hatchback
    var fit = null;
    try { fit = isNode ? require('./honda-fit.js') : (window.PROPS || []).filter(function (d) { return d.id === 'honda-fit'; })[0]; } catch (e) { fit = null; }
    if (fit && typeof fit.build === 'function') C.prop(fit, -1.6, 0.3, 0, { length: 4.0, face: 0x2F3F66, shell: 0x243250 });
    else C.car(-1.6, 0.3, 0);

    // bay 1: bikes along the left wall, surfboards leaning on the back wall
    C.bike(-5.55, 2.6, 0, { color: K.red }); C.bike(-5.55, 1.3, 0, { color: K.blue }); C.bike(-5.55, 0.0, 0, { color: K.green });
    C.surfboard(-5.0, -4.05, 0, { len: 2.15, mat: K.cream, stripe: K.rust }); C.surfboard(-4.3, -4.05, 0, { len: 1.9, mat: K.fabric, stripe: K.cream });

    // bay 3: workbench and shelving on the back wall, stool, cooler, Milo's bike near the door
    C.workbench(1.6, -3.9, 0);
    C.stool(1.2, -3.2, 0);
    C.shelvingUnit(3.6, -4.0, 0);
    C.cooler(2.7, -3.25, 0.3);
    C.bike(0.7, 3.0, 0.4, { color: K.yellow, size: 0.75 });
    C.skateboard(2.2, 3.4, 1.2, { mat: K.navy });

    // bay 4: laundry and storage on the right wall
    C.washer(5.7, -2.55, -PI / 2); C.washer(5.7, -1.85, -PI / 2, { dryer: true });
    C.waterHeater(5.6, -3.85);
    C.utilitySink(5.7, -0.9, -PI / 2);
    C.laundryBasket(5.0, -2.0, 0);
    C.boxes(4.6, -3.9, 0);
    C.bins(5.4, 3.5, 0);
    C.ladder(5.9, 1.6, -PI / 2);
  }
});

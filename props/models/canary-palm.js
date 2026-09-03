// Canary Island Palm. Metres, shown at 1.5 scale. One of the catalog's six palm species at high detail, with wind.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'canary-palm',
  name: 'Canary Island Palm',
  kind: 'prop',
  units: 'm',
  scale: 1.5,
  budget: 9000,
  camera: { pivotY: 9, fitW: 20, baseMin: 32, homePhi: 0.14, homeYaw: -0.3, tilt: 0.0 },
  colorways: [
    { id: 'grey', name: 'Grey green', sw: '#6F8C5E', face: 0x6F8C5E, shell: 0x7A5C3E },
    { id: 'deep', name: 'Deep green', sw: '#4E7A48', face: 0x4E7A48, shell: 0x5A4636 },
    { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0x6B4E36 }
  ],
  notes: "Canary Island date palm, Phoenix canariensis, the fat-trunked street palm. Short massive trunk with deep steps, a dense crown of twenty-six long fronds held near horizontal, nine dried fronds, orange fruit. Wind and flutter as the date palm.",
  build: function (api) {
    var CAT = (typeof module !== 'undefined' && module.exports) ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var C = CAT.init(api), M = api.M;
    C.palm(0, 0, { species: 'canary', h: 8, detail: 'high', seed: 3, leaf: M.face, trunk: M.shell, wind: { strength: 1, dir: 0.6 } });
    api.part(api.cyl(1.4, 2.2, 0.22, 9), api.mat(0x7E6A4C), 0, 0.11, 0);
  }
});

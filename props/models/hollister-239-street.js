// Hollister Avenue at 239, Ocean Park, Santa Monica. Real footprints, roads and grade from OpenStreetMap and USGS
// (props/models/_data/hollister-239-map.js); everything else placed from the street sheet written off four Street View
// captures (environments/envs/hollister-239/street.md). Metres, x east, z south, origin at 239; the scene is turned so
// Hollister runs left to right with the fire station side facing the camera. Shown at 0.25 scale.
(function (def) { if (typeof module !== 'undefined' && module.exports) module.exports = def; else (window.PROPS = window.PROPS || []).push(def); })({
  id: 'hollister-239-street',
  name: 'Hollister Avenue at 239',
  kind: 'scene',
  units: 'm',
  scale: 0.25,
  budget: 300000,
  camera: { pivotY: 1.2, fitW: 36, baseMin: 19, homePhi: 0.11, homeYaw: 0.0, tilt: 0.05 },
  sky: 'dusk',
  colorways: [
    { id: 'dusk', name: 'Dusk', sw: '#B9AC9C', face: 0xB9AC9C, shell: 0xF1E3C4 },
    { id: 'white', name: 'Whitewash', sw: '#E6D6B4', face: 0xE6D6B4, shell: 0xF1E3C4 },
    { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
  ],
  notes: 'The 200 block of Hollister Avenue with its real grade, every building dressed by type from OSM (bungalow porches, apartment balconies and soft-storey parking, modern glass), the fire station on its lot, both kerbs parked out, parkway ficus and the Aleppo pine over 239, a coral tree at the apartments, wooden poles with sagging lines, cobra lamps, double yellow, painted street names, a crosswalk at 3rd, red kerb at the station, fences and hedges at the lot lines, hydrant, signs, bins.',
  build: function (api) {
    var isNode = (typeof module !== 'undefined' && module.exports);
    var CAT = isNode ? require('../runtime/catalog.js') : window.TwoForksCatalog;
    var MAP = isNode ? require('./_data/hollister-239-map.js') : window.PROP_DATA['hollister-239-map'];
    var C = CAT.init(api), K = C.K, M = api.M, PI = Math.PI;

    // ---- street frame: u along Hollister from its south-west end, v across it (negative = north-west side, where 239 is)
    var H = MAP.roads.filter(function (r) { return r.name === 'Hollister Avenue' && r.kind === 'residential'; })[0];
    var A = H.polyline[0], Bp = H.polyline[H.polyline.length - 1], DX = Bp[0] - A[0], DZ = Bp[1] - A[1], LEN = Math.hypot(DX, DZ), dx = DX / LEN, dz = DZ / LEN, nx = -dz, nz = dx;
    function uOf(p) { return (p[0] - A[0]) * dx + (p[1] - A[1]) * dz; }
    function vOf(p) { return (p[0] - A[0]) * nx + (p[1] - A[1]) * nz; }
    function P(u, v) { return [A[0] + dx * u + nx * v, A[1] + dz * u + nz * v]; }
    var U0 = uOf([0, 0]);                              // the 239 address point
    var toStreet = Math.atan2(nx, nz), fromStreet = toStreet + PI;   // yaw for an item on the NW side facing the street, and the SE side
    // ground height: the one elevation field the map builder also uses for terrain, roads and footprints
    var gy = C.elevationField(MAP);
    // the whole block turned so Hollister runs away from the camera toward the north-east, the fire station side on the right,
    // and shifted so the road centreline sits just right of the pivot
    var world = api.sub(0, 0, 0, 0, Math.atan2(dx, -dz), 0); world.position.x = -(vOf([0, 0]) * -1) - 5.0;
    function holder(u, v) { var p = P(u, v); return api.sub(0, gy(p[0], p[1]), 0, 0, 0, 0, world); }
    function at(u, v, fn) { var p = P(u, v), h = holder(u, v); fn(p[0], p[1], h); }
    function crossU(name) { var road = MAP.roads.filter(function (r) { return r.name === name; })[0]; if (!road) return null; var best = null, bd = Infinity; road.polyline.forEach(function (p) { var d = Math.abs(vOf(p)); if (d < bd) { bd = d; best = uOf(p); } }); return best; }
    var u3 = crossU('3rd Street'), u2 = crossU('2nd Street');

    // ---- base: ground on its grade, roads sloped, footprints on their elevations, no generic trees (placed by hand below)
    var station = MAP.buildings.filter(function (b) { return b.id === 439420579; })[0];
    var fire = null; try { fire = isNode ? require('./fire-station-2.js') : (window.PROPS || []).filter(function (d) { return d.id === 'fire-station-2'; })[0]; } catch (e) { fire = null; }
    C.mapScene(MAP, { parent: world, trees: 'none', lamps: false, skip: fire ? [station.id] : [], roofs: true });
    var HC = C.resamplePolyline(C.clipPolyline(H.polyline, MAP.radius * 1.05, null).polyline, 8, gy), HP = HC.polyline, HE = HC.values.map(function (v) { return v + 0.15; }), uShift = uOf(HP[0]);   // clipped, subdivided to hug the field, lifted with the road surface

    // ---- the lot table from the street sheet: buildings facing Hollister in order along each side, anchored on 239 and the station
    var roads = MAP.roads.filter(function (r) { return r.kind === 'residential'; });
    var facing = MAP.buildings.filter(function (b) { return Math.abs(vOf(b.center)) < 26 && Math.abs(uOf(b.center) - U0) < 80 && C.streetEdge(b.polygon, H.polyline).distance < 16; });
    var nw = facing.filter(function (b) { return vOf(b.center) < 0; }).sort(function (a, b) { return uOf(a.center) - uOf(b.center); });
    var se = facing.filter(function (b) { return vOf(b.center) > 0; }).sort(function (a, b) { return uOf(a.center) - uOf(b.center); });
    var k0 = 0; nw.forEach(function (b, i) { if (Math.abs(uOf(b.center) - U0) < Math.abs(uOf(nw[k0].center) - U0)) k0 = i; });
    var j0 = se.findIndex(function (b) { return b.id === 439420579; });
    var LOT = {};
    function lot(list, idx, ch) { if (idx >= 0 && idx < list.length) LOT[list[idx].id] = ch; }
    lot(nw, k0 - 3, { ground: 'gravel', fence: 'hedge', tree: 'none', shrubs: true, bins: false, car: 'none' });                         // white three-storey apartments, queen palm placed by hand
    lot(nw, k0 - 2, { ground: 'lawn', fence: 'hedge', tree: 'bottlebrush', treeH: 5, steps: true, mailbox: true, bins: false, car: 'none' });   // green craftsman
    lot(nw, k0 - 1, { ground: 'dry', fence: 'none', tree: 'none', steps: true, mailbox: true, bins: true, car: 'none', driveSide: 1 });       // grey craftsman bungalow, grasses in the parkway
    lot(nw, k0, { ground: 'gravel', fence: 'none', tree: 'none', shrubs: false, bins: true, car: 'none', driveSide: -1, mailbox: false });     // 239: the pine and the Prius are placed by hand
    lot(nw, k0 + 1, { ground: 'gravel', fence: 'slat', tree: 'none', shrubs: true, bins: false, car: 'none' });                                // modern white stucco house
    lot(nw, k0 + 2, { ground: 'concrete', fence: 'plywood', tree: 'none', shrubs: false, bins: false, car: 'none', mailbox: false });          // the one behind hoarding
    if (j0 >= 0) { lot(se, j0 - 1, { ground: 'gravel', fence: 'board', tree: 'none', shrubs: true, bins: true, car: 'none', driveSide: 1 });   // beige apartments, coral tree and Jeep by hand
      lot(se, j0 + 1, { ground: 'lawn', fence: 'picket', tree: 'bottlebrush', treeH: 4, steps: true, mailbox: true, car: 'none' }); }         // the yellow two-storey house
    // ---- facades by OSM type, street face found against the nearest road
    MAP.buildings.forEach(function (b, i) {
      if (Math.hypot(b.center[0], b.center[1]) > 75 || (fire && b.id === station.id)) return;
      var best = { edge: -1, distance: Infinity }; roads.forEach(function (r) { var se = C.streetEdge(b.polygon, r.polyline); if (se.distance < best.distance) best = se; });
      var type = b.type === 'apartments' ? 'apartments' : b.type === 'house' ? 'house' : b.type === 'residential' ? (b.height < 6 ? 'house' : 'apartments') : b.type === 'retail' ? 'retail' : 'modern';
      var hd = api.sub(0, gy(b.center[0], b.center[1]) - 0.3, 0, 0, 0, 0, world);
      C.dressFootprint(b, { parent: hd, type: type, streetEdge: best.distance < 14 ? best.edge : -1, lit: i % 3 === 0, siding: type === 'house' && i % 2 === 0, trim: type === 'modern' ? K.slat : K.white });
      // the lot in front: lawn or gravel, a driveway, shrubs, sometimes a fence, a tree, bins, a parked car
      if (best.distance < 16) { var nr = null, nd = Infinity; roads.forEach(function (r) { var se = C.streetEdge(b.polygon, r.polyline); if (se.distance < nd) { nd = se.distance; nr = r; } }); if (nr && (!fire || b.id !== station.id)) C.yard(b, nr, best.edge, { parent: api.sub(0, gy(b.center[0], b.center[1]) + 0.05, 0, 0, 0, 0, world), seed: i + 3, kind: type === 'apartments' ? 'apartments' : 'house', choices: LOT[b.id] }); }
    });
    // fire station: the generated model on its lot, facing the street; else a brick stand-in with three glass doors
    var us = uOf(station.center), vs = vOf(station.center), sEdge = C.streetEdge(station.polygon, H.polyline);
    at(us, vs, function (x, z, h) {
      if (fire) { var fp2 = P(us, vs - 6.5), pg = C.prop(fire, fp2[0], fp2[1], fromStreet, { parent: h, length: 28, face: 0x8E3F32, shell: 0xE8C85A });
        // the prop's own pad and apron are a lighter concrete than the street; bring any large flat slab down to the street's tone
        pg.traverse(function (m) { if (!m.isMesh || !m.geometry.boundingBox && !m.geometry.computeBoundingBox()) return; m.geometry.computeBoundingBox(); var bb = m.geometry.boundingBox, sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y, sz = bb.max.z - bb.min.z; if (sy < 0.35 && sx * sz > 20 && m.material && m.material.color && m.material.color.getHSL) { var hsl = {}; m.material.color.getHSL(hsl); if (hsl.l > 0.45) m.material = K.concrete; } });
        // the engine backed into the lit west bay
        var eng = P(us - 8, vs - 13); C.fireEngine(eng[0], eng[1], fromStreet, { parent: h }); }
      else { var hd2 = api.sub(0, 0, 0, 0, 0, 0, h); C.footprint(station.polygon, 8, { parent: hd2, wall: K.brick, roof: K.roofFlat }); hd2.position.set(-x, 0, -z);
        var fx = P(us, vs - 17), doors = api.sub(fx[0], 0, fx[1], 0, fromStreet, 0, h); [-8, 0, 8].forEach(function (ox) { api.part(api.box(6.5, 4.6, 0.12), K.paintYellow, ox, 2.4, 0.2, 0, 0, 0, doors); api.part(api.box(6.0, 4.2, 0.1), K.glass, ox, 2.4, 0.28, 0, 0, 0, doors); }); api.part(api.box(28, 0.9, 0.1), K.paint, 0, 6.2, 0.2, 0, 0, 0, doors); }
    });
    at(us - 10, 7.5, function (x, z, h) { C.flagpole(x, z, { parent: h, h: 9 }); });
    at(us - 7, 7.0, function (x, z, h) { C.bench(x, z, fromStreet, { parent: h, bare: true }); });
    at(us, 6.5, function (x, z, h) { C.drivewayApron(x, z, toStreet, { parent: h, w: 26, d: 5 }); });
    at(us - 16, 6, function (x, z, h) { C.hedge(x, z, P(us - 16, 15)[0], P(us - 16, 15)[1], { parent: h, h: 1.3 }); });
    at(us - 14, 8, function (x, z, h) { C.fence(x, z, P(us - 14, 16)[0], P(us - 14, 16)[1], { parent: h, style: 'chain' }); });

    // ---- the road: kerbs, double yellow, names, crosswalk at 3rd, manhole, red kerb at the station, parked cars
    var S = function (u) { return u - uShift; };   // full-way u to clipped-way u
    C.roadDetail(HP, H.width, { parent: world, elevation: HE, names: [{ text: 'Hollister Ave', at: S(U0 - 26), across: 2 }, { text: 'Hollister Ave', at: S(U0 + 22), across: -2, flip: true }],
      crosswalks: u3 != null ? [S(u3 - 6), S(u3 + 6)] : [], manholes: [S(U0 - 12), S(U0 + 30)], redCurbs: [{ at: S(us), side: 1, len: 26 }] });
    C.fillKerbs(HP, H.width, { parent: world, elevation: HE, spacing: 6.0, density: 0.9, seed: 7, gaps: [[S(U0 + 1), S(U0 + 6), -1], [S(us - 14), S(us + 14), 1], [S(U0 - 18), S(U0 - 14), -1]].concat(u3 != null ? [[S(u3 - 8), S(u3 + 8)]] : []).concat(u2 != null ? [[S(u2 - 8), S(u2 + 8)]] : []) });
    roads.forEach(function (r) { if (r.name !== 'Hollister Avenue') { var cp = C.clipPolyline(r.polyline, MAP.radius, null); if (cp.polyline.length < 2) return; var cr = C.resamplePolyline(cp.polyline, 8, gy), cv = cr.values.map(function (v) { return v + 0.15; }); C.roadDetail(cr.polyline, r.width, { parent: world, elevation: cv, centre: false }); C.fillKerbs(cr.polyline, r.width, { parent: world, elevation: cv, density: 0.55, seed: 11 }); } });

    // ---- trees from the sheet
    [-42, -30, -18, 14, 26, 40, 54].forEach(function (du, i) { at(U0 + du, -5.0, function (x, z, h) { C.tree(x, z, { parent: h, species: i === 3 ? 'bottlebrush' : 'ficus', h: 7.5 + (i % 3), seed: i + 1 }); }); });
    at(U0 - 3, -6.6, function (x, z, h) { C.tree(x, z, { parent: h, species: 'pine', h: 13, seed: 4, rot: 0.6 }); });
    at(us - 22, 5.2, function (x, z, h) { C.tree(x, z, { parent: h, species: 'coral', h: 7, seed: 2 }); });
    [us + 24, us + 40, us - 44, us - 58].forEach(function (u, i) { at(u, 5.2, function (x, z, h) { C.tree(x, z, { parent: h, species: i % 2 ? 'ficus' : 'magnolia', h: 7 + i, seed: 20 + i }); }); });
    at(U0 - 24, -12, function (x, z, h) { C.tree(x, z, { parent: h, species: 'bottlebrush', h: 5, seed: 8 }); });
    [[U0 - 40, -24], [U0 - 56, -19], [U0 + 32, -26], [us + 12, 30]].forEach(function (p, i) { at(p[0], p[1], function (x, z, h) { C.palm(x, z, { parent: h, species: 'fan', detail: 'medium', h: 16 + i * 2, seed: 30 + i, wind: { strength: 0.7, dir: 0.6 } }); }); });
    at(U0 - 50, -9, function (x, z, h) { C.palm(x, z, { parent: h, species: 'queen', detail: 'medium', h: 10, seed: 41 }); });

    // ---- utilities and lamps: poles on the north-west side every 35 m with lines, cobra heads alternating sides
    var tops = [];
    [-70, -35, 0, 35, 70].forEach(function (du, i) { at(U0 + du + 12, -5.4, function (x, z, h) { var pole = C.utilityPole(x, z, toStreet, { parent: h, h: 11, transformer: i === 2 }); tops.push([x, h.position.y + 10.4, z]); }); });
    C.powerLines(tops, { parent: world, sag: 0.7, wires: 3 });
    [[-45, 1], [0, -1], [45, 1], [90, -1]].forEach(function (l) { at(U0 + l[0], l[1] * 5.0, function (x, z, h) { C.cobraLamp(x, z, l[1] > 0 ? fromStreet : toStreet, { parent: h }); }); });

    // ---- lot edges and yards on the north-west side: 239, the bungalow next door, the modern houses beyond
    function lotFence(u, v0, v1, style) { var p0 = P(u, v0), p1 = P(u, v1), h = holder(u, (v0 + v1) / 2); C.fence(p0[0], p0[1], p1[0], p1[1], { parent: h, style: style }); }
    lotFence(U0 + 8, -6.2, -22, 'slat'); lotFence(U0 - 11, -6.2, -22, 'plywood'); lotFence(U0 + 24, -6.2, -18, 'slat'); lotFence(U0 - 30, -6.2, -20, 'picket');
    lotFence(us - 32, 6.2, 22, 'board');
    at(U0 - 20, -8.2, function (x, z, h) { C.frontSteps(x, z, toStreet, { parent: h, steps: 4, w: 1.5 }); });
    at(U0 + 3.5, -5.2, function (x, z, h) { C.drivewayApron(x, z, toStreet, { parent: h }); });
    at(U0 - 16, -5.2, function (x, z, h) { C.drivewayApron(x, z, toStreet, { parent: h }); });
    at(us - 26, 5.2, function (x, z, h) { C.drivewayApron(x, z, fromStreet, { parent: h, w: 5 }); });
    [[-34, -20], [-12, 0], [8, 22], [30, 52]].forEach(function (seg, i) { var p0 = P(U0 + seg[0], -5.6), p1 = P(U0 + seg[1], -5.6); C.grassTufts(p0[0], p0[1], p1[0], p1[1], { parent: holder(U0 + (seg[0] + seg[1]) / 2, -5.6), n: 8 + i * 2, seed: 50 + i }); });
    var q0 = P(us - 40, 5.6), q1 = P(us - 22, 5.6); C.grassTufts(q0[0], q0[1], q1[0], q1[1], { parent: holder(us - 31, 5.6), n: 10, seed: 61 });

    // ---- furniture and traces
    at(us - 18, 5.0, function (x, z, h) { C.hydrant(x, z, { parent: h }); });
    if (u3 != null) at(u3 - 6, 5.2, function (x, z, h) { C.sign(x, z, fromStreet, { parent: h, kind: 'stop' }); });
    if (u2 != null) at(u2 + 6, -5.2, function (x, z, h) { C.sign(x, z, toStreet, { parent: h, kind: 'stop' }); });
    at(U0 - 8, -5.3, function (x, z, h) { C.sign(x, z, toStreet, { parent: h, kind: 'parking' }); });
    at(us + 10, 5.3, function (x, z, h) { C.sign(x, z, fromStreet, { parent: h, kind: 'parking' }); });
    at(U0 + 5.5, -4.8, function (x, z, h) { C.curbBins(x, z, toStreet, { parent: h }); });
    at(U0 - 27, -4.8, function (x, z, h) { C.curbBins(x, z, toStreet, { parent: h }); });
    at(U0 - 19, -5.5, function (x, z, h) { C.mailbox(x, z, toStreet, { parent: h }); });
    at(U0 + 4, -9, function (x, z, h) { C.car(x, z, toStreet + PI, { parent: h, color: K.white, size: 0.9 }); });   // the Prius in 239's driveway
    // people: a walker with a dog-less lead, two by the station, a runner, a couple by the bungalow
    [[U0 - 8, -6.4, 0.3, true], [U0 + 16, -6.4, PI + 0.2, true], [us - 6, 6.4, 0.1, false], [us - 4.6, 6.4, 2.9, false], [U0 + 38, 6.3, PI - 0.4, true], [U0 - 34, 6.4, 0.5, true], [U0 - 20, -6.5, 1.4, false], [U0 - 19, -6.5, -1.6, false]].forEach(function (pp, i) { at(pp[0], pp[1], function (x, z, h) { C.person(x, z, toStreet + pp[2], { parent: h, walking: pp[3], seed: i + 1 }); }); });
    at(U0 + 30, -5.6, function (x, z, h) { C.utilityBox(x, z, toStreet, { parent: h }); });
    at(us + 16, 5.6, function (x, z, h) { C.utilityBox(x, z, fromStreet, { parent: h }); });
    [U0 - 40, U0 + 18, U0 + 46].forEach(function (u, i) { at(u, i % 2 ? 4.8 : -4.8, function (x, z, h) { C.curbBins(x, z, i % 2 ? fromStreet : toStreet, { parent: h }); }); });
    at(us - 24, 9, function (x, z, h) { C.car(x, z, fromStreet + PI, { parent: h, color: K.yellow, size: 1.05 }); });   // the yellow Jeep at the apartments
  }
});

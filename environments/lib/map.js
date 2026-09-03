// Map research: turn a place name or coordinates into local-metre geometry a scene can build from.
// Geocoding by Nominatim, footprints and roads by Overpass (both OpenStreetMap). Output is saved as
// envs/<id>/map.json: { center, radius, buildings: [{ id, name, polygon, height, levels, tags }], roads: [{ id, name, kind, width, polyline }] }
// Local frame: x east, z south (so the default camera, on +z, looks north), metres, origin at the centre.
'use strict';
const UA = 'two-forks-props/0.1 (local modelling tool)';
const ROAD_WIDTH = { motorway: 20, trunk: 16, primary: 14, secondary: 12, tertiary: 10, residential: 8, unclassified: 7, living_street: 6, service: 4, pedestrian: 4, footway: 1.6, path: 1.2, cycleway: 2 };
const TYPE_HEIGHT = { house: 4.5, detached: 4.5, bungalow: 3.5, garage: 3, garages: 3, shed: 2.5, residential: 6.5, apartments: 9.5, commercial: 5, retail: 5, office: 9, industrial: 7, warehouse: 8, school: 6, church: 9, hotel: 12 };

async function getJson(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { 'User-Agent': UA, Accept: 'application/json' } }, opts || {}));
  if (!r.ok) throw new Error(url.split('?')[0] + ' -> HTTP ' + r.status);
  return r.json();
}

async function geocode(place) {
  const inter = place.match(/^\s*(.+?)\s*(?:&|\band\b|\bat\b)\s*(.+?)\s*(,.*)?$/i);
  const variants = inter ? [inter[1] + ' & ' + inter[2] + (inter[3] || ''), inter[1] + ' and ' + inter[2] + (inter[3] || ''), place] : [place];
  let best = null, note = null;
  for (const q of variants) {
    const list = await getJson('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(q));
    for (const hit of list) {
      const name = (hit.display_name || '').toLowerCase();
      const both = inter && name.includes(inter[1].toLowerCase().split(' ')[0]) && name.includes(inter[2].toLowerCase().split(' ')[0]);
      if (!best || (both && !best.both)) best = { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), name: hit.display_name, type: hit.type, osmType: hit.osm_type, osmId: hit.osm_id, both: !!both };
      if (best.both) break;
    }
    if (best && best.both) break;
    await new Promise((r) => setTimeout(r, 1100)); // Nominatim asks for one request per second
  }
  if (!best) throw new Error('no result for "' + place + '"');
  if (inter && !best.both) note = 'the geocoder returned a point on one street, not the intersection; check map.json centre';
  return Object.assign(best, { note });
}

function projector(lat0, lon0) {
  const kx = 111320 * Math.cos(lat0 * Math.PI / 180), kz = 110540;
  return (lat, lon) => [+((lon - lon0) * kx).toFixed(2), +(-(lat - lat0) * kz).toFixed(2)];
}

function parseHeight(tags) {
  if (tags.height) { const m = String(tags.height).match(/[\d.]+/); if (m) return parseFloat(m[0]); }
  const lv = parseFloat(tags['building:levels']); if (lv > 0) return lv * 3.3 + 0.5;
  return TYPE_HEIGHT[tags.building] || 5;
}

const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
async function overpass(lat, lon, radius) {
  const q = '[out:json][timeout:40];(way["building"](around:' + radius + ',' + lat + ',' + lon + ');way["highway"](around:' + radius + ',' + lat + ',' + lon + '););out geom;';
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const url of MIRRORS) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(q) });
        if (!r.ok) throw new Error(url.split('/')[2] + ' -> HTTP ' + r.status);
        return await r.json();
      } catch (e) { lastErr = e; }
    }
    await new Promise((res) => setTimeout(res, 3000));
  }
  throw new Error('Overpass unavailable: ' + (lastErr && lastErr.message));
}

async function fetchMap(o) {
  let lat = o.lat, lon = o.lon, geo = null;
  if ((lat == null || lon == null) && o.place) { geo = await geocode(o.place); lat = geo.lat; lon = geo.lon; }
  if (lat == null || lon == null) throw new Error('fetchMap needs a place or lat/lon');
  const radius = o.radius || 120;
  const data = await overpass(lat, lon, radius);
  const P = projector(lat, lon);
  const buildings = [], roads = [];
  for (const el of data.elements || []) {
    if (el.type !== 'way' || !el.geometry) continue;
    const tags = el.tags || {};
    const pts = el.geometry.map((g) => P(g.lat, g.lon));
    if (tags.building) {
      if (pts.length < 4) continue;
      const poly = pts.slice(0, -1); // closed way repeats the first node
      const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cz = poly.reduce((a, p) => a + p[1], 0) / poly.length;
      buildings.push({ id: el.id, name: tags.name || (tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' + (tags['addr:street'] || '') : ''), type: tags.building, height: +parseHeight(tags).toFixed(1), levels: tags['building:levels'] ? parseFloat(tags['building:levels']) : null, polygon: poly, center: [+cx.toFixed(2), +cz.toFixed(2)], tags: pickTags(tags) });
    } else if (tags.highway && ROAD_WIDTH[tags.highway] != null) {
      roads.push({ id: el.id, name: tags.name || '', kind: tags.highway, width: tags.width ? parseFloat(tags.width) || ROAD_WIDTH[tags.highway] : ROAD_WIDTH[tags.highway], lanes: tags.lanes ? parseInt(tags.lanes, 10) : null, oneway: tags.oneway === 'yes', polyline: pts });
    }
  }
  buildings.sort((a, b) => Math.hypot(a.center[0], a.center[1]) - Math.hypot(b.center[0], b.center[1]));
  return { place: o.place || null, geocoded: geo, center: { lat, lon }, radius, frame: 'x east, z south, metres, origin at centre', fetched: new Date().toISOString(), buildings, roads,
    summary: buildings.length + ' buildings, ' + roads.length + ' road segments within ' + radius + ' m' + (geo ? ' of ' + geo.name : '') };
}

function pickTags(t) { const keep = {}; ['name', 'building', 'building:levels', 'height', 'roof:shape', 'addr:housenumber', 'addr:street', 'amenity', 'shop', 'residential'].forEach((k) => { if (t[k]) keep[k] = t[k]; }); return keep; }

// Elevation from the USGS 3DEP point service (about 10 m resolution in Los Angeles), a few requests in flight at a time.
async function elevationAt(lat, lon) {
  const r = await fetch('https://epqs.nationalmap.gov/v1/json?x=' + lon + '&y=' + lat + '&units=Meters&wkid=4326&includeDate=false', { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('EPQS -> HTTP ' + r.status);
  const j = await r.json(); const v = parseFloat(j.value); if (!Number.isFinite(v)) throw new Error('EPQS gave no value'); return v;
}
// Adds elevation (metres, relative to the centre) to road vertices and building centres, plus a best-fit ground plane.
async function addElevation(map, o) {
  o = o || {}; const P0 = map.center, lat0 = P0.lat, lon0 = P0.lon, kx = 111320 * Math.cos(lat0 * Math.PI / 180), kz = 110540;
  const toLL = (x, z) => [lat0 - z / kz, lon0 + x / kx];
  const pts = [[0, 0]]; map.roads.forEach((r) => { if (r.kind === 'footway' || r.kind === 'path') return; r.polyline.forEach((p) => pts.push(p)); }); map.buildings.forEach((b) => pts.push(b.center));
  const uniq = []; const seen = new Set(); pts.forEach((p) => { const k = Math.round(p[0] / 4) + ',' + Math.round(p[1] / 4); if (!seen.has(k)) { seen.add(k); uniq.push(p); } });
  const limit = o.limit || 160, sample = uniq.slice(0, limit), values = new Array(sample.length);
  let idx = 0, failed = 0;
  async function worker() { while (idx < sample.length) { const i = idx++; const ll = toLL(sample[i][0], sample[i][1]); try { values[i] = await elevationAt(ll[0], ll[1]); } catch (e) { values[i] = null; failed++; } } }
  await Promise.all([worker(), worker(), worker(), worker()]);
  const base = values[0]; if (base == null) throw new Error('no elevation at the centre');
  const samples = sample.map((p, i) => ({ x: p[0], z: p[1], y: values[i] == null ? null : +(values[i] - base).toFixed(2) })).filter((s) => s.y != null);
  // least-squares plane y = a x + b z + c
  let sx = 0, sz = 0, sy = 0, sxx = 0, szz = 0, sxz = 0, sxy = 0, szy = 0, n = samples.length;
  samples.forEach((s) => { sx += s.x; sz += s.z; sy += s.y; sxx += s.x * s.x; szz += s.z * s.z; sxz += s.x * s.z; sxy += s.x * s.y; szy += s.z * s.y; });
  const det = (sxx * szz - sxz * sxz) * n - sxx * sz * sz - szz * sx * sx + 2 * sxz * sx * sz;
  let a = 0, b = 0, c = 0;
  if (Math.abs(det) > 1e-9) { // solve 3x3 normal equations
    const A = [[sxx, sxz, sx], [sxz, szz, sz], [sx, sz, n]], B = [sxy, szy, sy];
    const inv3 = (m) => { const [[a1, b1, c1], [d1, e1, f1], [g1, h1, i1]] = m; const D = a1 * (e1 * i1 - f1 * h1) - b1 * (d1 * i1 - f1 * g1) + c1 * (d1 * h1 - e1 * g1); return [[(e1 * i1 - f1 * h1) / D, (c1 * h1 - b1 * i1) / D, (b1 * f1 - c1 * e1) / D], [(f1 * g1 - d1 * i1) / D, (a1 * i1 - c1 * g1) / D, (c1 * d1 - a1 * f1) / D], [(d1 * h1 - e1 * g1) / D, (b1 * g1 - a1 * h1) / D, (a1 * e1 - b1 * d1) / D]]; };
    const I = inv3(A); a = I[0][0] * B[0] + I[0][1] * B[1] + I[0][2] * B[2]; b = I[1][0] * B[0] + I[1][1] * B[1] + I[1][2] * B[2]; c = I[2][0] * B[0] + I[2][1] * B[1] + I[2][2] * B[2];
  }
  const nearest = (x, z) => { let best = null, bd = Infinity; samples.forEach((s) => { const d = (s.x - x) ** 2 + (s.z - z) ** 2; if (d < bd) { bd = d; best = s; } }); return best ? best.y : a * x + b * z + c; };
  map.roads.forEach((r) => { r.elevation = r.polyline.map((p) => +nearest(p[0], p[1]).toFixed(2)); });
  map.buildings.forEach((bb) => { bb.elevation = +nearest(bb.center[0], bb.center[1]).toFixed(2); });
  map.ground = { a: +a.toFixed(5), b: +b.toFixed(5), c: +c.toFixed(3), samples: samples.length, failed, baseElevation: +base.toFixed(1), note: 'y = a*x + b*z + c, metres relative to the centre; x east, z south' };
  return map;
}

module.exports = { geocode, fetchMap, addElevation, elevationAt, ROAD_WIDTH };

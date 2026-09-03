#!/usr/bin/env node
// Builds every model (or the ids given) in Node, without a display, and checks it against the contract:
// it must build without throwing, stay under its triangle budget, have a finite, centred bounding box that
// matches its declared camera fit, and declare at least one colorway. With --export it also writes
// dist/<id>.glb and dist/<id>.obj. With --json it prints one JSON report instead of a table.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const ids = args.filter((a) => !a.startsWith('--'));

// Browser shims so three's examples/js exporters run in Node.
global.window = global; global.self = global;
if (typeof global.FileReader === 'undefined') {
  global.FileReader = class {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; if (this.onloadend) this.onloadend(); }); }
    readAsDataURL(blob) { blob.arrayBuffer().then((b) => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(b).toString('base64'); if (this.onloadend) this.onloadend(); }); }
  };
}
const THREE = require('three'); global.THREE = THREE;
require('three/examples/js/exporters/GLTFExporter.js');
require('three/examples/js/exporters/OBJExporter.js');
const TwoForks = require(path.join(root, 'runtime', 'style.js'));

function loadDefs() {
  const dir = path.join(root, 'models');
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort().map((f) => {
    const file = path.join(dir, f);
    delete require.cache[require.resolve(file)];
    const def = require(file);
    if (def && typeof def === 'object') def.__file = path.relative(root, file);
    return def;
  });
}

function check(world, def) {
  const r = { id: def && def.id, file: def && def.__file, ok: true, errors: [], warnings: [], tris: 0 };
  let m;
  try { m = world.addModel(def); } catch (e) { r.ok = false; r.errors.push('build failed: ' + (e && e.stack || e)); return { r }; }
  r.tris = m.tris; r.budget = m.budget; r.kind = m.kind; r.parts = m.parts.length; r.name = m.name; r.animated = m.ticks.length > 0;
  try { m.ticks.forEach((fn) => { fn(1.0, 0.016, { on: true, strength: 1 }); fn(2.5, 0.016, { on: true, strength: 1 }); }); }
  catch (e) { r.ok = false; r.errors.push('tick failed: ' + (e && e.stack || e)); }
  try { r.meta = JSON.parse(fs.readFileSync(path.join(root, 'models', m.id + '.meta.json'), 'utf8')); } catch (e) { /* hand-built or unknown */ }
  if (m.tris > m.budget) { r.ok = false; r.errors.push('triangle count ' + m.tris + ' exceeds the ' + m.kind + ' budget of ' + m.budget); }
  if (!m.parts.length) { r.ok = false; r.errors.push('model has no parts'); }
  const box = world.bounds(m), size = new THREE.Vector3(), c = new THREE.Vector3();
  box.getSize(size); box.getCenter(c);
  r.size = [size.x, size.y, size.z].map((v) => +v.toFixed(2)); r.center = [c.x, c.y, c.z].map((v) => +v.toFixed(2));
  if (![size.x, size.y, size.z].every(Number.isFinite)) { r.ok = false; r.errors.push('bounding box is not finite; a vertex is NaN'); return { r, m }; }
  const footprint = Math.max(size.x, size.z);
  if (footprint > m.fitW * 1.2) r.warnings.push('footprint ' + footprint.toFixed(1) + ' is wider than camera.fitW ' + m.fitW + '; the model may clip at the sides');
  if (footprint < m.fitW * 0.5) r.warnings.push('footprint ' + footprint.toFixed(1) + ' is much smaller than camera.fitW ' + m.fitW + '; the model will look small');
  if (m.pivotY < box.min.y || m.pivotY > box.max.y) r.warnings.push('camera.pivotY ' + m.pivotY + ' is outside the model height ' + box.min.y.toFixed(1) + '..' + box.max.y.toFixed(1));
  if (Math.abs(c.x) > size.x * 0.15 || Math.abs(c.z) > size.z * 0.15) r.warnings.push('model is off-centre in x or z and will wobble when turned; recentre it');
  if (!m.colorways.length) { r.ok = false; r.errors.push('no colorways'); }
  return { r, m };
}

function exportModel(m, outDir) {
  return new Promise((resolve, reject) => {
    const warn = console.warn; console.warn = () => {};
    const wasVisible = m.group.visible; m.group.visible = true;
    const done = () => { console.warn = warn; m.group.visible = wasVisible; };
    try {
      const obj = new THREE.OBJExporter().parse(m.group);
      fs.writeFileSync(path.join(outDir, m.id + '.obj'), obj);
      new THREE.GLTFExporter().parse(m.group, (buf) => {
        done();
        fs.writeFileSync(path.join(outDir, m.id + '.glb'), Buffer.from(buf));
        resolve();
      }, { binary: true, onlyVisible: false });
    } catch (e) { done(); reject(e); }
  });
}

async function main() {
  const world = TwoForks.createWorld(THREE, { headless: true });
  const defs = loadDefs().filter((d) => !ids.length || (d && ids.includes(d.id)));
  if (ids.length && defs.length !== ids.length) console.error('warning: not every requested id was found among ' + loadDefs().map((d) => d && d.id).join(', '));
  const outDir = path.join(root, 'dist'); fs.mkdirSync(outDir, { recursive: true });
  const reports = [];
  for (const def of defs) {
    const { r, m } = check(world, def);
    if (m && r.ok && flags.has('--export')) {
      try { await exportModel(m, outDir); r.exports = [path.join('dist', m.id + '.glb'), path.join('dist', m.id + '.obj')]; }
      catch (e) { r.ok = false; r.errors.push('export failed: ' + (e && e.stack || e)); }
    }
    reports.push(r);
  }
  const failed = reports.filter((r) => !r.ok).length;
  if (flags.has('--json')) { console.log(JSON.stringify({ ok: !failed, models: reports }, null, 2)); }
  else {
    for (const r of reports) {
      console.log((r.ok ? 'PASS ' : 'FAIL ') + String(r.id).padEnd(14) + String(r.tris).padStart(6) + ' tris / ' + String(r.budget).padEnd(6) + ' size ' + (r.size || []).join(' x ') + (r.exports ? '  -> ' + r.exports.join(', ') : ''));
      r.errors.forEach((e) => console.log('   error: ' + e));
      r.warnings.forEach((w) => console.log('   warn:  ' + w));
    }
    console.log(reports.length + ' model(s), ' + failed + ' failed');
  }
  process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });

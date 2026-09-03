#!/usr/bin/env node
// env: compose environments from one prompt.
//
//   env build "build a Santa Monica home" --url https://... [--place "2401 4th St, Santa Monica"] [--type home|street|park] [--id slug] [--model claude-opus-5] [--radius 120] [--quiet]
//   env build "build a street at 4th Street & Hollister Avenue, Santa Monica"
//   env map "4th Street & Hollister Avenue, Santa Monica" [--radius 120]      fetch map data only, print a summary
//   env status <id>
//   env list
//
// Progress goes to stderr; the manifest is JSON on stdout and in envs/<id>/manifest.json.
'use strict';
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const cmd = argv.shift();
const opts = { links: [] }, positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--url' || a === '--link') opts.links.push(argv[++i]);
  else if (a === '--place') opts.place = argv[++i];
  else if (a === '--lat') opts.lat = parseFloat(argv[++i]);
  else if (a === '--lon') opts.lon = parseFloat(argv[++i]);
  else if (a === '--radius') opts.radius = parseFloat(argv[++i]);
  else if (a === '--type') opts.type = argv[++i];
  else if (a === '--id') opts.id = argv[++i];
  else if (a === '--model') opts.model = argv[++i];
  else if (a === '--quiet') opts.quiet = true;
  else positional.push(a);
}
(async () => {
  if (cmd === 'build') {
    const prompt = positional.join(' '); if (!prompt) { console.error('usage: env build "<prompt>" [--url ...] [--place ...]'); process.exit(2); }
    const { buildEnvironment } = require('../lib/env.js');
    const m = await buildEnvironment(Object.assign({ prompt }, opts));
    console.log(JSON.stringify(m, null, 2)); process.exit(m.ok ? 0 : 1);
  } else if (cmd === 'map') {
    const place = positional.join(' '); if (!place) { console.error('usage: env map "<place>" [--radius m]'); process.exit(2); }
    const { fetchMap } = require('../lib/map.js');
    const m = await fetchMap({ place, radius: opts.radius || 120 });
    const { ENVS, PARENT, propsLib } = require('../lib/paths.js');
    const out = path.join(ENVS, '_maps', propsLib('prompt.js').slugify(place) + '.json'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(m, null, 1));
    console.log(m.summary); console.log('saved ' + path.relative(PARENT, out));
    console.log('roads: ' + [...new Set(m.roads.map((r) => r.name || r.kind))].join(', '));
    console.log('nearest: ' + m.buildings.slice(0, 6).map((b) => (b.name || b.type) + ' h' + b.height + ' @' + b.center.join(',')).join(' | '));
  } else if (cmd === 'status') {
    const { status } = require('../lib/env.js'); const { fmt } = require('../lib/paths.js').propsLib('progress.js');
    const st = status(positional[0] || ''); if (!st.status) { console.log('no environment build found'); process.exit(1); }
    const s = st.status; console.log((s.running ? 'running' : (s.ok ? 'finished' : 'failed')) + ' · ' + (s.stageIndex + 1) + '/' + s.stageCount + ' ' + s.label + ' · elapsed ' + fmt(s.elapsed) + (s.running ? ' · ETA ~' + fmt(s.eta) : ''));
    st.log.forEach((l) => console.log('  ' + l)); if (st.result) console.log(JSON.stringify(st.result, null, 2));
  } else if (cmd === 'list') {
    const { listEnvironments } = require('../lib/env.js');
    listEnvironments().forEach((e) => console.log(e.id.padEnd(30) + String(e.type || '').padEnd(8) + (e.ok == null ? 'running/unknown' : e.ok ? 'ok' : 'failed') + '  ' + e.models.join(', ')));
  } else { console.log('commands: build, map, status, list'); process.exit(cmd ? 2 : 0); }
})().catch((e) => { console.error(e && e.message || e); process.exit(1); });

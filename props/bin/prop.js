#!/usr/bin/env node
// prop: build, validate, export and render Two Forks props from the command line.
//
//   prop build "vintage typewriter" [--desc "..."] [--ref photo.jpg ...] [--url https://... ...]
//                                   [--kind prop|vehicle|building] [--budget 3000] [--id slug] [--model claude-opus-5] [--no-still] [--quiet]
//   prop status <id>                progress of a running or finished build
//   prop validate [id ...] [--export]
//   prop still <id>
//   prop gallery
//   prop list
//
// Progress lines (stage, elapsed, ETA) go to stderr; the final report is JSON on stdout.
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');

const argv = process.argv.slice(2);
const cmd = argv.shift();
const opts = { refs: [], links: [] }, positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--ref') opts.refs.push(argv[++i]);
  else if (a === '--url' || a === '--link') opts.links.push(argv[++i]);
  else if (a === '--desc') opts.desc = argv[++i];
  else if (a === '--kind') opts.kind = argv[++i];
  else if (a === '--budget') opts.budget = parseInt(argv[++i], 10);
  else if (a === '--id') opts.id = argv[++i];
  else if (a === '--no-still') opts.noStill = true;
  else if (a === '--overwrite') opts.overwrite = true;
  else if (a === '--export') opts.export = true;
  else if (a === '--quiet') opts.quiet = true;
  else if (a === '--model') opts.model = argv[++i];
  else positional.push(a);
}

function run(script, args) {
  const r = spawnSync(process.execPath, [path.join(root, 'tools', script)].concat(args || []), { stdio: 'inherit', cwd: root });
  process.exit(r.status || 0);
}

(async () => {
  if (cmd === 'build') {
    const name = positional.join(' ');
    if (!name) { console.error('usage: prop build "<name>" [--desc ...] [--ref photo.jpg] [--url https://...] [--kind prop|vehicle|building]'); process.exit(2); }
    const { generateModel } = require('../lib/generate.js');
    const r = await generateModel({ name, description: opts.desc, references: opts.refs, links: opts.links, kind: opts.kind, budget: opts.budget, id: opts.id, still: !opts.noStill, overwrite: opts.overwrite, quiet: opts.quiet, model: opts.model });
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === 'status') {
    const { readStatus, fmt } = require('../lib/progress.js');
    const { slugify } = require('../lib/prompt.js');
    const id = positional[0]; if (!id) { console.error('usage: prop status <id>'); process.exit(2); }
    const st = readStatus(slugify(id));
    if (!st.status) { console.log('no build found for ' + id); process.exit(1); }
    const s = st.status;
    console.log((s.running ? 'running' : (s.ok ? 'finished' : 'failed')) + ' · stage ' + (s.stageIndex + 1) + '/' + s.stageCount + ' ' + s.label + ' · elapsed ' + fmt(s.elapsed) + (s.running ? ' · ETA ~' + fmt(s.eta) + ' (' + s.etaBasis + ')' : ''));
    st.log.forEach((l) => console.log('  ' + l));
    if (st.result) console.log(JSON.stringify(st.result, null, 2));
  } else if (cmd === 'validate') run('validate.js', positional.concat(opts.export ? ['--export'] : []));
  else if (cmd === 'export') run('validate.js', positional.concat(['--export']));
  else if (cmd === 'still') run('still.js', positional);
  else if (cmd === 'gallery') run('build-gallery.js');
  else if (cmd === 'list') {
    const { listModels } = require('../lib/generate.js');
    const { fmt } = require('../lib/progress.js');
    listModels().forEach((m) => { const g = m.meta || {}; console.log(String(m.id).padEnd(18) + String(m.tris).padStart(6) + ' tris  ' + String(m.kind || '').padEnd(9) + (g.generatedBy ? g.generatedBy + (g.seconds ? ' in ' + fmt(g.seconds) : '') : '')); });
  } else {
    console.log('commands: build, status, validate, export, still, gallery, list');
    process.exit(cmd ? 2 : 0);
  }
})().catch((e) => { console.error(e && e.message || e); process.exit(1); });

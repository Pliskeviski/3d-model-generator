// Progress for a build: which recipe stage it is in, elapsed time, and an ETA from past runs.
// Writes lines to stderr (unless quiet), to dist/<id>.build.log, and a JSON snapshot to dist/<id>.status.json
// so a poller (the CLI `status` command, the MCP build_status tool) can read it while a build runs.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// [id, label, default seconds]. The ETA uses the median of past runs per stage once two or more exist.
const STAGES = {
  'claude-code': [
    ['start', 'Starting', 3],
    ['research', 'Resolving links and downloading references', 15],
    ['plan', 'Reading references and planning', 70],
    ['write', 'Writing the model file', 90],
    ['validate', 'Validating and exporting', 15],
    ['still', 'Rendering the still', 20],
    ['review', 'Reviewing the still', 35],
    ['fix', 'Fix pass and re-validation', 45],
    ['finish', 'Final checks, gallery and still', 30]
  ],
  env: [
    ['start', 'Starting', 3],
    ['research', 'Resolving links and fetching map data', 25],
    ['compose', 'Composing: scenario, plan, scenes, stills', 1200],
    ['verify', 'Verifying every model and rendering stills', 90],
    ['finish', 'Gallery and manifest', 20]
  ],
  api: [
    ['start', 'Starting', 2],
    ['research', 'Resolving links and downloading references', 15],
    ['generate', 'Asking the model for the file', 120],
    ['validate', 'Validating and exporting', 15],
    ['repair', 'Repair round', 90],
    ['finish', 'Gallery and still', 30]
  ]
};

// Buildings and vehicles take the session much longer to plan and write than small props.
const KIND_SCALE = { prop: 1, vehicle: 2.2, building: 2.6, scene: 3 };
const SCALED = { plan: true, write: true, review: true, fix: true, generate: true, repair: true, compose: true };
const HEARTBEAT_MS = 45000;

function median(a) { const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function fmt(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m ? m + 'm' + String(s).padStart(2, '0') + 's' : s + 's'; }
function oneLine(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

class Progress {
  constructor(o) {
    this.id = o.id; this.backend = o.backend;
    this.stages = STAGES[o.backend] || STAGES['claude-code'];
    var dir = o.dir || path.join(root, 'dist');
    this.historyFile = path.join(dir, '.timings.json');
    this.statusFile = path.join(dir, o.id + '.status.json');
    this.logFile = path.join(dir, o.id + '.build.log');
    this.onEvent = o.onEvent || null; this.quiet = !!o.quiet; this.stream = o.stream || process.stderr;
    this.refCount = o.refCount || 0; this.kind = o.kind || 'prop';
    this.t0 = Date.now(); this.index = -1; this.stageStart = this.t0; this.durations = {}; this.lines = []; this.done = false; this.ok = null;
    this.expected = this._expected();
    fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    fs.writeFileSync(this.logFile, '');
    this.lastEmit = Date.now();
    this.timer = setTimeout(() => this._heartbeat(), HEARTBEAT_MS); this.timer.unref();
  }
  _history() { try { return JSON.parse(fs.readFileSync(this.historyFile, 'utf8')).runs.filter((r) => r.backend === this.backend); } catch (e) { return []; } }
  _expected() {
    const hist = this._history(), exp = {};
    this.stages.forEach(([id, , def]) => {
      const xs = hist.map((r) => r.stages && r.stages[id]).filter((v) => typeof v === 'number');
      let v = xs.length >= 2 ? median(xs) : def * (SCALED[id] ? (KIND_SCALE[this.kind] || 1) : 1);
      if (id === 'plan') v += 15 * this.refCount;
      exp[id] = v;
    });
    this.samples = hist.length;
    return exp;
  }
  _heartbeat() {
    if (this.done) return;
    const quiet = (Date.now() - this.lastEmit) / 1000;
    if (quiet >= HEARTBEAT_MS / 1000 - 1) this._emit('still working, ' + fmt(quiet) + ' since the last event');
    this.timer = setTimeout(() => this._heartbeat(), HEARTBEAT_MS); this.timer.unref();
  }
  elapsed() { return (Date.now() - this.t0) / 1000; }
  eta() {
    if (this.done) return 0;
    let rem = 0; const inStage = (Date.now() - this.stageStart) / 1000;
    this.stages.forEach(([id], i) => {
      if (i > this.index) rem += this.expected[id];
      else if (i === this.index) rem += Math.max(this.expected[id] * 0.15, this.expected[id] - inStage);
    });
    return rem;
  }
  // Advance to a stage. Stages only move forward; a call for an earlier stage just logs the note.
  stage(id, note) {
    const i = this.stages.findIndex((s) => s[0] === id);
    if (i < 0 || i <= this.index) { if (note) this.log(note); return; }
    const now = Date.now();
    if (this.index >= 0) { const cur = this.stages[this.index][0]; this.durations[cur] = (this.durations[cur] || 0) + (now - this.stageStart) / 1000; }
    this.index = i; this.stageStart = now;
    this._emit(note || this.stages[i][1]);
  }
  log(msg) { this._emit(msg); }
  snapshot() {
    const i = Math.max(0, this.index);
    return {
      id: this.id, backend: this.backend, running: !this.done, ok: this.ok,
      stage: this.stages[i][0], stageIndex: i, stageCount: this.stages.length, label: this.stages[i][1],
      elapsed: Math.round(this.elapsed()), eta: Math.round(this.eta()), etaBasis: this.samples >= 2 ? this.samples + ' past runs' : 'defaults',
      overrun: this.index >= 0 ? Math.max(0, Math.round((Date.now() - this.stageStart) / 1000 - this.expected[this.stages[this.index][0]])) : 0,
      lines: this.lines.slice(-12)
    };
  }
  _emit(msg) {
    this.lastEmit = Date.now();
    const s = this.snapshot();
    const over = this.index >= 0 ? (Date.now() - this.stageStart) / 1000 - this.expected[this.stages[this.index][0]] : 0;
    const etaText = this.done ? '' : (over > 0 ? ' · ETA at least ' + fmt(s.eta) + ', this stage is ' + fmt(over) + ' over its estimate' : ' · ETA ~' + fmt(s.eta));
    const line = '[' + fmt(s.elapsed) + '] ' + (s.stageIndex + 1) + '/' + s.stageCount + ' ' + s.label + etaText + (msg && msg !== s.label ? ' · ' + msg : '');
    this.lines.push(line); if (this.lines.length > 300) this.lines.shift();
    if (!this.quiet) this.stream.write(line + '\n');
    try { fs.appendFileSync(this.logFile, line + '\n'); fs.writeFileSync(this.statusFile, JSON.stringify(Object.assign(s, { last: msg }), null, 2)); } catch (e) { /* ignore */ }
    if (this.onEvent) { try { this.onEvent(Object.assign(s, { message: msg })); } catch (e) { /* ignore */ } }
  }
  finish(ok) {
    const now = Date.now();
    if (this.index >= 0) { const cur = this.stages[this.index][0]; this.durations[cur] = (this.durations[cur] || 0) + (now - this.stageStart) / 1000; }
    this.done = true; this.ok = !!ok; if (this.timer) clearTimeout(this.timer);
    const total = this.elapsed();
    this._emit(ok ? 'done in ' + fmt(total) : 'failed after ' + fmt(total));
    if (ok) {
      let h; try { h = JSON.parse(fs.readFileSync(this.historyFile, 'utf8')); } catch (e) { h = { runs: [] }; }
      h.runs.push({ backend: this.backend, id: this.id, kind: this.kind, when: new Date().toISOString(), total: Math.round(total), stages: this.durations });
      h.runs = h.runs.slice(-30);
      try { fs.writeFileSync(this.historyFile, JSON.stringify(h, null, 2)); } catch (e) { /* ignore */ }
    }
  }
}

function readStatus(id, dir) {
  dir = dir || path.join(root, 'dist');
  const out = {};
  try { out.status = JSON.parse(fs.readFileSync(path.join(dir, id + '.status.json'), 'utf8')); } catch (e) { out.status = null; }
  try { out.result = JSON.parse(fs.readFileSync(path.join(dir, id + '.result.json'), 'utf8')); } catch (e) { out.result = null; }
  try { out.log = fs.readFileSync(path.join(dir, id + '.build.log'), 'utf8').trim().split('\n').slice(-20); } catch (e) { out.log = []; }
  return out;
}

module.exports = { Progress, STAGES, fmt, oneLine, readStatus };

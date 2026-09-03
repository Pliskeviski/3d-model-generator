// Turns a request into a validated model file: ask a model for the file, validate it, repair once, export, render.
// Two backends:
//   claude-code  runs the `claude` CLI in print mode on your Claude subscription login. Agentic: the session
//                writes the file, validates and renders it; we verify afterwards. Default.
//   api          uses the Anthropic SDK with ANTHROPIC_API_KEY; the model replies with the file as a code block.
//                Chosen automatically when the key is set, or force either with PROP_BACKEND=claude-code|api.
// Progress (stage, elapsed, ETA) goes to stderr, dist/<id>.build.log and dist/<id>.status.json; see lib/progress.js.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { spawn, spawnSync } = require('child_process');
const { buildSystemPrompt, userPrompt, agentPrompt, extractCode, slugify } = require('./prompt.js');
const { Progress, oneLine } = require('./progress.js');
const { resolveLinks, inferKind } = require('./refs.js');
const root = path.join(__dirname, '..');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
// Tools the agentic session may use: read anything, write files, and run only the repo's own tools.
const AGENT_TOOLS = ['Read', 'Write', 'Edit', 'WebFetch', 'WebSearch', 'Bash(node tools/validate.js:*)', 'Bash(node tools/still.js:*)', 'Bash(node tools/fetch-ref.js:*)', 'Bash(npm run validate:*)', 'Bash(npm run still:*)'];

// Which Claude to use by complexity, unless the caller names one: small props on Sonnet, buildings on Opus, vehicles on Fable.
const MODEL_POLICY = { prop: 'claude-sonnet-5', building: 'claude-opus-5', vehicle: 'claude-fable-5-1', scene: 'claude-opus-5' };
function pickModel(requested, kind) {
  if (requested && requested !== 'auto') return requested;
  return MODEL_POLICY[kind] || MODEL_POLICY.prop;
}

function pickBackend(opts) {
  return opts.backend || process.env.PROP_BACKEND || (process.env.ANTHROPIC_API_KEY ? 'api' : 'claude-code');
}
const rel = (f) => path.relative(root, path.resolve(f || ''));

// ---- backend: claude CLI on the user's subscription, streamed so we can follow its tool calls
function askClaudeCode(o) {
  return new Promise((resolve, reject) => {
    const bin = process.env.CLAUDE_BIN || 'claude';
    const sysFile = path.join(os.tmpdir(), 'two-forks-system-' + process.pid + '-' + Date.now() + '.md');
    fs.writeFileSync(sysFile, o.system);
    const args = ['-p', o.prompt, '--output-format', 'stream-json', '--verbose', '--max-turns', String(o.maxTurns || 8), '--append-system-prompt-file', sysFile];
    if (o.resume) args.push('--resume', o.resume);
    if (o.model) args.push('--model', o.model);
    if (o.allowedTools && o.allowedTools.length) args.push('--allowedTools', ...o.allowedTools); // variadic, so it goes last
    const env = Object.assign({}, process.env); delete env.CLAUDECODE; // allow running from inside a Claude Code session
    const child = spawn(bin, args, { cwd: o.cwd || root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let result = null, sessionId = null, stderr = '', usedModel = null;
    child.stderr.on('data', (d) => { stderr += d; });
    readline.createInterface({ input: child.stdout }).on('line', (line) => {
      let ev; try { ev = JSON.parse(line); } catch (e) { return; }
      if (ev.type === 'system' && ev.subtype === 'init') { sessionId = ev.session_id || sessionId; usedModel = ev.model || usedModel; }
      if (ev.type === 'result') { result = ev; sessionId = ev.session_id || sessionId; }
      if (o.onEvent) { try { o.onEvent(ev); } catch (e) { /* ignore */ } }
    });
    child.on('error', (e) => { try { fs.unlinkSync(sysFile); } catch (x) { /* ignore */ } reject(new Error('could not run the claude CLI (' + bin + '): ' + e.message + '. Install Claude Code or set CLAUDE_BIN.')); });
    child.on('close', (code) => {
      try { fs.unlinkSync(sysFile); } catch (x) { /* ignore */ }
      if (!result) return reject(new Error('claude CLI ended without a result (exit ' + code + '): ' + (stderr || '').slice(0, 800)));
      if (result.is_error) return reject(new Error('claude CLI error: ' + (result.result || JSON.stringify(result)).slice(0, 800)));
      resolve({ text: result.result || '', sessionId, model: usedModel, turns: result.num_turns, durationMs: result.duration_ms, cost: result.total_cost_usd });
    });
  });
}

// Maps the session's stream events onto recipe stages.
function agentTracker(prog, slug, refs) {
  const refSet = new Set(refs.map((p) => path.resolve(p)));
  return (ev) => {
    if (ev.type === 'system' && ev.subtype === 'init') { prog.stage('plan', 'session started' + (ev.model ? ' on ' + ev.model : '')); return; }
    if (ev.type === 'assistant' && ev.message && Array.isArray(ev.message.content)) {
      for (const b of ev.message.content) {
        if (b.type === 'text' && b.text && b.text.trim()) { prog.log('says: ' + oneLine(b.text, 110)); continue; }
        if (b.type !== 'tool_use') continue;
        const inp = b.input || {}, f = inp.file_path || '', cmd = inp.command || '';
        if (b.name === 'Read') {
          if (refSet.has(path.resolve(f))) prog.stage('plan', 'reading reference ' + path.basename(f));
          else if (/\.png$/i.test(f)) prog.stage('review', 'looking at ' + rel(f));
          else prog.log('reading ' + rel(f));
        } else if (b.name === 'Write') {
          if (rel(f).startsWith('models' + path.sep)) prog.stage('write', 'writing ' + rel(f)); else prog.log('writing ' + rel(f));
        } else if (b.name === 'Edit') prog.stage('fix', 'editing ' + rel(f));
        else if (b.name === 'WebFetch') prog.stage('plan', 'fetching ' + oneLine(inp.url || '', 80));
        else if (b.name === 'WebSearch') prog.stage('plan', 'searching: ' + oneLine(inp.query || '', 80));
        else if (b.name === 'Bash') {
          if (/fetch-ref\.js/.test(cmd)) prog.stage('plan', 'downloading a web photo');
          else if (/validate\.js|npm run validate/.test(cmd)) prog.stage('validate', 'running the validator');
          else if (/still\.js|npm run still/.test(cmd)) prog.stage('still', 'rendering the still');
          else prog.log('running: ' + oneLine(cmd, 90));
        } else prog.log('tool ' + b.name);
      }
    }
    if (ev.type === 'user' && ev.message && Array.isArray(ev.message.content)) {
      for (const b of ev.message.content) {
        if (b.type !== 'tool_result') continue;
        const text = typeof b.content === 'string' ? b.content : (Array.isArray(b.content) ? b.content.map((c) => c.text || '').join('\n') : '');
        const m = text.match(/^(PASS|FAIL) .*$/m); if (m) prog.log('validator: ' + oneLine(m[0], 100));
        const errs = text.match(/^\s*error: .*$/gm); if (errs) errs.slice(0, 3).forEach((e) => prog.log(oneLine(e.trim(), 120)));
        if (b.is_error) prog.log('tool error: ' + oneLine(text, 110));
      }
    }
    if (ev.type === 'result') prog.log('session finished after ' + (ev.num_turns || '?') + ' turns');
  };
}

// ---- backend: the API, code-block contract
function apiConversation(o) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic();
  const model = o.model || 'claude-fable-5-1';
  const messages = [];
  return {
    model,
    async send(text, images) {
      const content = (images || []).map((p) => ({ type: 'image', source: { type: 'base64', media_type: MIME[path.extname(p).toLowerCase()] || 'image/jpeg', data: fs.readFileSync(p).toString('base64') } }));
      content.push({ type: 'text', text });
      messages.push({ role: 'user', content });
      const res = await client.messages.create({ model, max_tokens: 16000, system: o.system, messages });
      const reply = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      messages.push({ role: 'assistant', content: reply });
      return reply;
    }
  };
}

function runValidate(id, opts) {
  const a = [path.join(root, 'tools', 'validate.js'), id, '--json'];
  if (opts && opts.export) a.push('--export');
  const r = spawnSync(process.execPath, a, { encoding: 'utf8', cwd: root });
  try {
    const all = JSON.parse(r.stdout);
    return all.models.find((x) => x.id === id) || { ok: false, errors: ['the file did not register a model with id "' + id + '"'] };
  } catch (e) {
    return { ok: false, errors: ['validator crashed: ' + (r.stderr || r.stdout || String(e))] };
  }
}

function listModels() {
  const r = spawnSync(process.execPath, [path.join(root, 'tools', 'validate.js'), '--json'], { encoding: 'utf8', cwd: root });
  try { return JSON.parse(r.stdout).models; } catch (e) { return []; }
}

async function generateModel(opts) {
  const name = opts.name; if (!name) throw new Error('name is required');
  const slug = opts.id ? slugify(opts.id) : slugify(name);
  let kind = opts.kind;
  const file = path.join(root, 'models', slug + '.js');
  if (fs.existsSync(file) && !opts.overwrite) throw new Error('models/' + slug + '.js already exists; pass overwrite or a different id');
  const refs = (opts.references || []).map((p) => path.resolve(p));
  refs.forEach((p) => { if (!fs.existsSync(p)) throw new Error('reference not found: ' + p); });
  if (backendUnknown(pickBackend(opts))) throw new Error('unknown backend ' + pickBackend(opts) + '; use claude-code or api');

  const backend = pickBackend(opts);
  const prog = new Progress({ id: slug, backend, kind: kind || 'prop', refCount: refs.length, quiet: opts.quiet, onEvent: opts.onProgress });
  const system = buildSystemPrompt();
  let model = opts.model || process.env.PROP_MODEL;
  let usedModel = model || 'auto';
  let report = null, attempts = 0, summary = '', result, turns = 0;
  let notes = [], unresolved = [];
  try {
    prog.stage('start', 'building ' + slug + ' with the ' + backend + ' backend');
    const linkTexts = [name, opts.description].concat(opts.links || []);
    if (linkTexts.filter(Boolean).join(' ').match(/https?:\/\//)) {
      prog.stage('research');
      const res = await resolveLinks(linkTexts, slug, (m) => prog.log(m));
      notes = res.notes; unresolved = res.unresolved; refs.push(...res.images);
      if (!kind) { const k = inferKind(notes); if (k) { kind = k; prog.kind = k; prog.expected = prog._expected(); prog.log('kind inferred from research: ' + k); } }
    }
    kind = kind || 'prop';
    model = pickModel(model, kind); usedModel = model;
    prog.log('model: ' + model + (opts.model && opts.model !== 'auto' ? ' (requested)' : ' (policy for ' + kind + ')'));
    if (backend === 'claude-code') {
      const prompt = agentPrompt({ name, description: opts.description, kind, budget: opts.budget, slug, refs, notes, unresolved });
      const r = await askClaudeCode({ system, prompt, model, allowedTools: AGENT_TOOLS, maxTurns: opts.maxTurns || 40, onEvent: agentTracker(prog, slug, refs) });
      summary = r.text; attempts = 1; turns = r.turns || 0; if (r.model) usedModel = r.model;
      prog.stage('finish', 'verifying the file independently');
      if (!fs.existsSync(file)) throw new Error('the session did not write models/' + slug + '.js. It said: ' + r.text.slice(0, 400));
      report = runValidate(slug, { export: true });
      if (!report.ok) {
        prog.log('validator rejected it; asking the session for a repair round');
        const r2 = await askClaudeCode({ system, prompt: 'The validator still rejects models/' + slug + '.js:\n' + report.errors.concat(report.warnings || []).join('\n') + '\nFix the file, run `node tools/validate.js ' + slug + ' --export` until it passes, then reply DONE.', resume: r.sessionId, model, allowedTools: AGENT_TOOLS, maxTurns: 20, onEvent: agentTracker(prog, slug, refs) });
        summary = r2.text; attempts = 2; turns += r2.turns || 0;
        report = runValidate(slug, { export: true });
      }
    } else {
      const convo = apiConversation({ system, model });
      prog.stage('generate');
      let text = await convo.send(userPrompt({ name, description: opts.description, kind, budget: opts.budget, slug, hasRefs: refs.length > 0, notes: notes.concat(unresolved.map((u) => 'Unresolved link (no web access in this mode): ' + u)) }), refs);
      for (let attempt = 0; attempt < 2; attempt++) {
        attempts++;
        const code = extractCode(text);
        if (!code) throw new Error('the model returned no code block; reply began: ' + text.slice(0, 300));
        fs.writeFileSync(file, code);
        prog.stage('validate');
        report = runValidate(slug, { export: true });
        prog.log(report.ok ? 'validator: PASS ' + report.tris + ' tris' : 'validator: FAIL ' + report.errors.join('; '));
        if (report.ok || attempt === 1) break;
        prog.stage('repair');
        text = await convo.send('The validator rejected the file:\n' + report.errors.concat(report.warnings || []).join('\n') + '\nReturn the corrected complete file in one ```js block.');
      }
      summary = text.replace(/```[\s\S]*?```/g, '').trim();
      prog.stage('finish');
    }
    result = { id: slug, name, kind, file: path.relative(root, file), backend, model: usedModel, attempts, ok: !!(report && report.ok), report, summary: oneLine(summary, 600), references: refs.map((p) => path.relative(root, p)), research: notes };
    try { require(path.join(root, 'tools', 'build-gallery.js')); result.gallery = 'dist/gallery.html'; prog.log('gallery rebuilt'); } catch (e) { result.galleryError = String(e); }
    if (opts.still !== false) {
      try { result.still = path.relative(root, require(path.join(root, 'tools', 'still.js')).still(slug)); prog.log('still rendered to ' + result.still); }
      catch (e) { result.stillError = String(e && e.message || e); prog.log('still failed: ' + result.stillError); }
    }
    prog.finish(result.ok);
    result.elapsed = prog.snapshot().elapsed; result.log = path.relative(root, prog.logFile);
    // provenance sidecar: which Claude model built this prop, how, and how long it took
    const meta = { generatedBy: usedModel, backend, seconds: result.elapsed, when: new Date().toISOString(), attempts, turns, kind,
      references: refs.map((p) => path.relative(root, p)), links: opts.links || [], request: { name, description: opts.description || '' } };
    fs.writeFileSync(path.join(root, 'models', slug + '.meta.json'), JSON.stringify(meta, null, 2));
    result.meta = 'models/' + slug + '.meta.json';
    try { require(path.join(root, 'tools', 'build-gallery.js')); } catch (e) { /* already reported above */ }
    fs.writeFileSync(path.join(root, 'dist', slug + '.result.json'), JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    prog.finish(false);
    fs.writeFileSync(path.join(root, 'dist', slug + '.result.json'), JSON.stringify({ id: slug, name, ok: false, error: String(e && e.message || e), elapsed: prog.snapshot().elapsed }, null, 2));
    throw e;
  }
}
function backendUnknown(b) { return b !== 'claude-code' && b !== 'api'; }

module.exports = { generateModel, runValidate, listModels, pickBackend, pickModel, askClaudeCode, MODEL_POLICY };

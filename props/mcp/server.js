#!/usr/bin/env node
// MCP server: lets another LLM or a Claude Code session ask for a prop and get back a validated model file,
// GLB and OBJ exports, and a still. Registered for this repo in .mcp.json; add it elsewhere with
//   claude mcp add two-forks-props -- node /path/to/two-forks-props/mcp/server.js
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { generateModel, runValidate, listModels } = require('../lib/generate.js');
const { readStatus, fmt } = require('../lib/progress.js');
const { slugify } = require('../lib/prompt.js');
const root = path.join(__dirname, '..');

const server = new McpServer({ name: 'two-forks-props', version: '0.1.0' });
function tool(name, description, shape, handler) {
  const wrapped = async (a, extra) => {
    try { const r = await handler(a || {}, extra); return { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }; }
    catch (e) { return { isError: true, content: [{ type: 'text', text: String(e && e.message || e) }] }; }
  };
  if (typeof server.registerTool === 'function') server.registerTool(name, { description, inputSchema: shape }, wrapped);
  else server.tool(name, description, shape, wrapped);
}

const buildShape = {
  name: z.string().describe('What to build, e.g. "vintage typewriter"'),
  description: z.string().optional().describe('Details, dimensions, which variant, what matters. May contain URLs.'),
  references: z.array(z.string()).optional().describe('Absolute paths to reference photos (jpg, png, webp)'),
  links: z.array(z.string()).optional().describe('URLs to research first. Wikidata and Wikipedia items are resolved for dimensions and a photo before the build; other links are fetched by the session.'),
  kind: z.enum(['prop', 'vehicle', 'building']).optional().describe('Sets the triangle budget and framing defaults; inferred from research when omitted'),
  budget: z.number().int().optional().describe('Override the triangle budget'),
  model: z.string().optional().describe('Claude model to build with, e.g. claude-opus-5 or claude-sonnet-5; defaults to the CLI default (or PROP_MODEL)'),
  id: z.string().optional().describe('Model id; defaults to a slug of the name'),
  overwrite: z.boolean().optional().describe('Replace an existing model with the same id'),
  still: z.boolean().optional().describe('Render a PNG still with headless Chrome (default true)'),
  wait: z.boolean().optional().describe('Default true: block until the build finishes (several minutes). false: start it in the background and return a job id to poll with build_status.')
};

tool('build_prop',
  'Build a low-poly 3D prop in the Two Forks (Firewatch dusk) style. Writes models/<id>.js, validates it, exports dist/<id>.glb and .obj, rebuilds the gallery and renders dist/<id>.png. Takes several minutes; progress is written to dist/<id>.status.json and can be read with build_status. Best for hard-surface subjects; poor for organic ones.',
  buildShape,
  async (a, extra) => {
    if (a.wait === false) {
      const slug = a.id ? slugify(a.id) : slugify(a.name);
      const args = [path.join(root, 'bin', 'prop.js'), 'build', a.name, '--id', slug, '--quiet'];
      if (a.description) args.push('--desc', a.description);
      (a.references || []).forEach((r) => args.push('--ref', r));
      (a.links || []).forEach((u) => args.push('--url', u));
      if (a.kind) args.push('--kind', a.kind);
      if (a.budget) args.push('--budget', String(a.budget));
      if (a.model) args.push('--model', a.model);
      if (a.overwrite) args.push('--overwrite');
      if (a.still === false) args.push('--no-still');
      fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
      const out = fs.openSync(path.join(root, 'dist', slug + '.build.out'), 'w');
      const child = spawn(process.execPath, args, { cwd: root, detached: true, stdio: ['ignore', out, out] });
      child.unref();
      return { job: slug, status: 'started', pid: child.pid, poll: 'build_status with id "' + slug + '"', statusFile: 'dist/' + slug + '.status.json' };
    }
    const token = extra && extra._meta && extra._meta.progressToken;
    const onProgress = (s) => {
      if (token == null || !extra.sendNotification) return;
      extra.sendNotification({ method: 'notifications/progress', params: { progressToken: token, progress: s.stageIndex + 1, total: s.stageCount, message: s.label + (s.message ? ' · ' + s.message : '') + ' · ETA ~' + fmt(s.eta) } }).catch(() => {});
    };
    return generateModel(Object.assign({}, a, { quiet: true, onProgress }));
  });

tool('build_status', 'Progress of a build started with build_prop: stage, elapsed seconds, ETA seconds, the last log lines, and the final result once it has finished.',
  { id: z.string().describe('The model id / job id') }, (a) => readStatus(slugify(a.id)));

tool('validate_prop', 'Validate one model (or all) against the contract: builds, budget, bounds, colorways. Optionally export GLB and OBJ.',
  { id: z.string().optional(), export: z.boolean().optional() },
  (a) => a.id ? runValidate(a.id, { export: a.export }) : { models: listModels() });

tool('list_props', 'List the models in the gallery with their triangle counts.', {}, () => ({ models: listModels() }));

tool('render_still', 'Render dist/<id>.png from the model\'s home camera with headless Chrome.', { id: z.string() },
  (a) => ({ still: path.relative(root, require('../tools/still.js').still(a.id)) }));

tool('build_gallery', 'Rebuild gallery/index.html, dist/gallery.html and dist/artifact.html from the current models.', {},
  () => { require('../tools/build-gallery.js'); return { gallery: 'dist/gallery.html', artifact: 'dist/artifact.html' }; });

(async () => { await server.connect(new StdioServerTransport()); })().catch((e) => { console.error(e); process.exit(1); });

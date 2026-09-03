#!/usr/bin/env node
// MCP server for the environment pipeline: build_environment, environment_status, fetch_map.
// Register with:  claude mcp add two-forks-environments -- node /path/to/two-forks/environments/mcp/server.js
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { HERE, PARENT, DIST, propsLib } = require('../lib/paths.js');
const { McpServer } = require(path.join(PARENT, 'props', 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'cjs', 'server', 'mcp.js'));
const { StdioServerTransport } = require(path.join(PARENT, 'props', 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'cjs', 'server', 'stdio.js'));
const { z } = require(path.join(PARENT, 'props', 'node_modules', 'zod'));
const { fmt } = propsLib('progress.js');
const { slugify } = propsLib('prompt.js');

const server = new McpServer({ name: 'two-forks-environments', version: '0.1.0' });
function tool(name, description, shape, handler) {
  const wrapped = async (a, extra) => {
    try { const r = await handler(a || {}, extra); return { content: [{ type: 'text', text: JSON.stringify(r, null, 2) }] }; }
    catch (e) { return { isError: true, content: [{ type: 'text', text: String(e && e.message || e) }] }; }
  };
  if (typeof server.registerTool === 'function') server.registerTool(name, { description, inputSchema: shape }, wrapped);
  else server.tool(name, description, shape, wrapped);
}

const envShape = {
  prompt: z.string().describe('One request, e.g. "build a Santa Monica home" or "build a street at 4th Street & Hollister Avenue, Santa Monica". May contain URLs.'),
  links: z.array(z.string()).optional().describe('URLs to research first (Wikidata, Wikipedia, photos, or pages the session will fetch)'),
  place: z.string().optional().describe('Address or place to map with OpenStreetMap; also detected from the prompt after "at", "near", "on"'),
  lat: z.number().optional(), lon: z.number().optional(),
  radius: z.number().optional().describe('Map radius in metres (default 120)'),
  type: z.enum(['home', 'street', 'park']).optional().describe('Detected from the prompt when omitted'),
  id: z.string().optional().describe('Environment id; defaults to a slug of the prompt'),
  model: z.string().optional().describe('Claude model for the composing session; default claude-opus-5'),
  wait: z.boolean().optional().describe('Default true. false starts the build in the background and returns an id to poll with environment_status.')
};
tool('build_environment',
  'Compose an environment in the Two Forks style from one request: a home interior (household sheet, plan, furnished scene models) or a street/block from a mapped location (footprints and roads from OpenStreetMap, dressed and with a subject building embedded). Writes docs/scenario-<id>.md, models/<id>-*.js, envs/<id>/manifest.json, stills and GLB exports. Takes 15 to 40 minutes. Meant to be called by a larger city-generation process.',
  envShape,
  async (a, extra) => {
    const { buildEnvironment } = require('../lib/env.js');
    if (a.wait === false) {
      const args = [path.join(HERE, 'bin', 'env.js'), 'build', a.prompt, '--quiet'];
      (a.links || []).forEach((u) => args.push('--url', u));
      if (a.place) args.push('--place', a.place); if (a.lat != null) args.push('--lat', String(a.lat)); if (a.lon != null) args.push('--lon', String(a.lon));
      if (a.radius) args.push('--radius', String(a.radius)); if (a.type) args.push('--type', a.type); if (a.id) args.push('--id', a.id); if (a.model) args.push('--model', a.model);
      fs.mkdirSync(DIST, { recursive: true });
      const out = fs.openSync(path.join(DIST, (a.id || slugify(a.prompt)) + '.build.out'), 'w');
      const child = spawn(process.execPath, args, { cwd: PARENT, detached: true, stdio: ['ignore', out, out] }); child.unref();
      return { status: 'started', pid: child.pid, poll: 'environment_status', note: 'the id is a slug of the prompt unless id was given; environment_status without an id lists environments' };
    }
    const token = extra && extra._meta && extra._meta.progressToken;
    const onProgress = (s) => { if (token == null || !extra.sendNotification) return; extra.sendNotification({ method: 'notifications/progress', params: { progressToken: token, progress: s.stageIndex + 1, total: s.stageCount, message: s.label + (s.message ? ' · ' + s.message : '') + ' · ETA ~' + fmt(s.eta) } }).catch(() => {}); };
    return buildEnvironment(Object.assign({}, a, { quiet: true, onProgress }));
  });
tool('environment_status', 'Progress and result of an environment build, or the list of environments when no id is given.', { id: z.string().optional() },
  (a) => { const env = require('../lib/env.js'); return a.id ? env.status(a.id) : { environments: env.listEnvironments() }; });
tool('fetch_map', 'Fetch building footprints and roads around a place from OpenStreetMap as local-metre geometry (no build).', { place: z.string(), radius: z.number().optional() },
  (a) => require('../lib/map.js').fetchMap({ place: a.place, radius: a.radius || 120 }));


(async () => { await server.connect(new StdioServerTransport()); })().catch((e) => { console.error(e); process.exit(1); });

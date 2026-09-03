// Prompts for the composing session. The environment skill is the recipe; the props skill and API are attached so the
// session can build any single object it is missing. Paths in prompts are relative to the parent folder, the session's cwd.
'use strict';
const fs = require('fs');
const path = require('path');
const { HERE, PROPS, PARENT } = require('./paths.js');
const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (s) => s.replace(/^---[\s\S]*?---\s*/, '');

function envSystemPrompt() {
  return ['You compose environments for the Two Forks gallery, following the recipe below exactly. Your working directory is the parent folder that holds props/ and environments/.',
    '', '# Environment recipe', '', strip(read(path.join(HERE, '.claude', 'skills', 'environment', 'SKILL.md'))),
    '', '# Prop recipe (for any single object you need to build)', '', strip(read(path.join(PROPS, '.claude', 'skills', 'prop', 'SKILL.md'))).replace(/`npm run (validate|still)[^`]*`/g, (m) => m.replace('npm run', 'node props/tools/').replace('validate', 'validate.js').replace('still', 'still.js')),
    '', '# Helper and catalog API (props/runtime/API.md)', '', read(path.join(PROPS, 'runtime', 'API.md'))].join('\n');
}

function envAgentPrompt(o) {
  const rel = (p) => path.relative(PARENT, p);
  const lines = ['Compose a ' + o.type + ' environment for this request: ' + o.prompt,
    'Environment id: ' + o.slug + '. Create models in props/models/ named with this id as a prefix (for example props/models/' + o.slug + '-home.js). Write the scenario to environments/envs/' + o.slug + '/scenario.md and the manifest to environments/envs/' + o.slug + '/manifest.json.'];
  if (o.notes && o.notes.length) lines.push('Research notes gathered from links (trust these dimensions over guesses):\n' + o.notes.join('\n'));
  if (o.images && o.images.length) lines.push('Reference photos, Read each before planning:\n' + o.images.map((p) => '- ' + rel(p)).join('\n'));
  if (o.unresolved && o.unresolved.length) lines.push('Links not resolved automatically; fetch them with WebFetch:\n' + o.unresolved.map((u) => '- ' + u).join('\n'));
  if (o.mapFile) lines.push('Map data for ' + (o.place || 'the given coordinates') + ' is in ' + rel(o.mapFile) + ' (' + (o.map && o.map.summary) + '). Read it before planning. Buildings are polygons in metres, x east, z south, origin at the centre. The same data is a module at props/models/_data/' + o.slug + '-map.js: load it in the model with `var MAP = (typeof module !== \'undefined\' && module.exports) ? require(\'./_data/' + o.slug + '-map.js\') : window.PROP_DATA[\'' + o.slug + '-map\'];` so you do not have to inline the JSON.');
  else if (o.type !== 'home') lines.push('No map data. Lay out a plausible ' + o.type + ' from the description and say so in the scenario.');
  lines.push('Existing models you may reuse are the files in props/models/ (Read one before embedding it). Validate with `node props/tools/validate.js <id> --export`, render with `node props/tools/still.js <id>`, build a missing prop with `node props/bin/prop.js build ...`.');
  lines.push('Follow the recipe end to end, then reply with one line: DONE ' + o.slug + ' <model ids>, followed by one paragraph on what you built and what you left out.');
  return lines.join('\n');
}

module.exports = { envSystemPrompt, envAgentPrompt };

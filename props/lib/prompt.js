// Assembles the prompt that turns a request into a model file. The same skill text drives Claude Code
// sessions (via .claude/skills/prop) and API calls (via lib/generate.js), so both paths produce the same style.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function buildSystemPrompt() {
  const skill = read('.claude/skills/prop/SKILL.md').replace(/^---[\s\S]*?---\s*/, '');
  return [
    'You build low-poly 3D props for the Two Forks gallery by writing a model file against a fixed helper API.',
    'Follow the recipe and style rules below exactly. Reply with a single ```js code block containing the complete model file and nothing else after it.',
    '', '# Recipe and style rules', '', skill,
    '', '# Helper API reference', '', read('runtime/API.md'),
    '', '# Example model file (models/controller.js)', '', '```js', read('models/controller.js'), '```'
  ].join('\n');
}

function userPrompt(o) {
  const lines = [
    'Build a model file for: ' + o.name + '.',
    o.description ? 'Description: ' + o.description : '',
    'Model id (use exactly this): ' + o.slug + '. Kind: ' + (o.kind || 'prop') + '.',
    o.budget ? 'Triangle budget: ' + o.budget + '.' : '',
    o.notes && o.notes.length ? 'Research notes gathered from links in the request:\n' + o.notes.join('\n') : '',
    o.hasRefs ? 'Measure proportions off the reference photos in real units and list them in a comment block at the top of the file before building.' : 'No reference photos. Use the real object\'s known dimensions in real units and list them in a comment block at the top of the file.',
    'Write the block-out plan as a comment first: every form, its construction method, and its measurements. Then the build function.',
    'Return the complete file in one ```js block.'
  ];
  return lines.filter(Boolean).join('\n');
}

// Prompt for the agentic backend: a Claude Code session with file and shell access does the whole recipe itself.
function agentPrompt(o) {
  const lines = [
    'Build a new prop for the Two Forks gallery in this repo.',
    'Subject: ' + o.name + '.' + (o.description ? ' ' + o.description : ''),
    'Model id: ' + o.slug + '. Write it to models/' + o.slug + '.js. Create only that file; do not modify other models or the runtime.',
    'Kind: ' + (o.kind || 'prop') + '.' + (o.budget ? ' Triangle budget: ' + o.budget + '.' : ''),
    o.refs && o.refs.length ? 'Reference photos, read each with the Read tool before planning:\n' + o.refs.map((p) => '- ' + p).join('\n') : 'No reference photos; use the real object\'s known dimensions.',
    o.notes && o.notes.length ? 'Research notes already gathered from links in the request (trust the dimensions here over guesses):\n' + o.notes.join('\n') : '',
    o.unresolved && o.unresolved.length ? 'These links were not resolved automatically. Fetch them with WebFetch before planning, and use WebSearch if you still lack dimensions:\n' + o.unresolved.map((u) => '- ' + u).join('\n') : '',
    'If you find a useful photo on the web, download it with `node tools/fetch-ref.js <image-url> <name>` and Read the file it prints.',
    'Follow the prop recipe in your instructions end to end: measurements and block-out plan as comments at the top of the file, then build(api).',
    'Then run `node tools/validate.js ' + o.slug + ' --export` and fix every error it reports.',
    'Then run `node tools/still.js ' + o.slug + '` and Read dist/' + o.slug + '.png once. Make at most one fix pass for clipping, scale or read, then validate again.',
    'Do not run any other commands and do not rebuild the gallery; the caller does that.',
    'When finished, reply with one line: DONE ' + o.slug + ' <tris> tris, then one sentence on what you built and anything you left out.'
  ];
  return lines.join('\n');
}

function extractCode(text) {
  const m = text.match(/```(?:js|javascript)?\s*\n([\s\S]*?)```/);
  return m ? m[1].trim() + '\n' : null;
}

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'model';
}

module.exports = { buildSystemPrompt, userPrompt, agentPrompt, extractCode, slugify };

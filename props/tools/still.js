#!/usr/bin/env node
// Renders a still of one model from its home camera with headless Chrome, into dist/<id>.png.
// This is the "one look" step: check it for clipping, scale and read before publishing.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');

function findChrome() {
  const candidates = [process.env.CHROME_BIN, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find((c) => c && fs.existsSync(c));
}

function still(id, opts) {
  opts = opts || {};
  const chrome = findChrome();
  if (!chrome) throw new Error('no Chrome found; set CHROME_BIN to a Chrome or Chromium binary');
  require('./build-gallery.js'); // always rebuild, so a model added since the last build is in the page
  fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  const out = opts.out || path.join(root, 'dist', id + '.png');
  const w = opts.width || 1500, h = opts.height || 1000;
  const url = 'file://' + path.join(root, 'gallery', 'index.html') + '?model=' + encodeURIComponent(id) + '&still=1' + (opts.sky ? '&sky=' + opts.sky : '');
  execFileSync(chrome, ['--headless=new', '--hide-scrollbars', '--no-first-run', '--disable-extensions', '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader', '--window-size=' + w + ',' + h, '--virtual-time-budget=6000', '--screenshot=' + out, url], { stdio: 'ignore' });
  if (!fs.existsSync(out)) throw new Error('Chrome produced no screenshot');
  return out;
}

module.exports = { still };
if (require.main === module) {
  const id = process.argv[2], sky = (process.argv[3] || '').replace(/^--sky=/, '');
  if (!id) { console.error('usage: node tools/still.js <model-id> [--sky=gloom]'); process.exit(2); }
  console.log(still(id, sky ? { sky: sky, out: path.join(root, 'dist', id + '-' + sky + '.png') } : {}));
}

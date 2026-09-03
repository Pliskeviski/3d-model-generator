#!/usr/bin/env node
// Builds the gallery in three forms:
//   gallery/index.html  - for local use and headless stills; loads three, the runtime and the models by relative path
//   dist/gallery.html   - one self-contained page (three from cdnjs, everything else inlined)
//   dist/artifact.html  - the same page as a fragment, ready to publish with the Artifact tool
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const tpl = read('gallery/template.html');
const modelFiles = fs.readdirSync(path.join(root, 'models')).filter((f) => f.endsWith('.js')).sort();
const dataDir = path.join(root, 'models', '_data');
const dataFiles = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter((f) => f.endsWith('.js')).sort() : [];
const CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
const meta = {};
fs.readdirSync(path.join(root, 'models')).filter((f) => f.endsWith('.meta.json')).forEach((f) => {
  try { meta[f.replace(/\.meta\.json$/, '')] = JSON.parse(read('models/' + f)); } catch (e) { /* skip bad sidecar */ }
});
const META = '<script>window.PROP_META=' + JSON.stringify(meta) + ';</script>';

function wrap(body) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
}

const devScripts = ['<script src="../node_modules/three/build/three.min.js"></script>', '<script src="../runtime/style.js"></script>', '<script src="../runtime/catalog.js"></script>', META]
  .concat(dataFiles.map((f) => '<script src="../models/_data/' + f + '"></script>'))
  .concat(modelFiles.map((f) => '<script src="../models/' + f + '"></script>')).join('\n');
fs.writeFileSync(path.join(root, 'gallery', 'index.html'), wrap(tpl.replace('<!--THREE-->', '').replace('<!--SCRIPTS-->', devScripts)));

const inline = ['<script>\n' + read('runtime/style.js') + '\n</script>', '<script>\n' + read('runtime/catalog.js') + '\n</script>', META]
  .concat(dataFiles.map((f) => '<script>\n' + read('models/_data/' + f) + '\n</script>'))
  .concat(modelFiles.map((f) => '<script>\n' + read('models/' + f) + '\n</script>')).join('\n');
const frag = tpl.replace('<!--THREE-->', CDN).replace('<!--SCRIPTS-->', inline);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'artifact.html'), frag);
fs.writeFileSync(path.join(root, 'dist', 'gallery.html'), wrap(frag));
console.log('gallery built for ' + modelFiles.length + ' models: gallery/index.html, dist/gallery.html, dist/artifact.html');

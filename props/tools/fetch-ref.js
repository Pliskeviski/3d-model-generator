#!/usr/bin/env node
// Downloads one image URL into refs/<name>.<ext> so a session can Read it as a reference photo.
// Refuses anything that is not an image or is over 20 MB.
'use strict';
const path = require('path');
const { download } = require('../lib/refs.js');
const [url, name] = process.argv.slice(2);
if (!url || !name) { console.error('usage: node tools/fetch-ref.js <image-url> <name>'); process.exit(2); }
download(url, path.join(__dirname, '..', 'refs', name.replace(/[^a-z0-9_-]+/gi, '-')))
  .then((f) => console.log(path.relative(path.join(__dirname, '..'), f)))
  .catch((e) => { console.error(e.message); process.exit(1); });

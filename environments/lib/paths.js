// Where things live. The environments package drives the props package next to it (or wherever TWO_FORKS_PROPS points).
'use strict';
const path = require('path');
const fs = require('fs');
const HERE = path.join(__dirname, '..');
const PROPS = process.env.TWO_FORKS_PROPS ? path.resolve(process.env.TWO_FORKS_PROPS) : path.join(HERE, '..', 'props');
if (!fs.existsSync(path.join(PROPS, 'runtime', 'style.js'))) throw new Error('props package not found at ' + PROPS + '; set TWO_FORKS_PROPS');
const PARENT = path.dirname(PROPS);
module.exports = {
  HERE, PROPS, PARENT,
  ENVS: path.join(HERE, 'envs'), DIST: path.join(HERE, 'dist'),
  propsLib: (f) => require(path.join(PROPS, 'lib', f)),
  relParent: (p) => path.relative(PARENT, p)
};

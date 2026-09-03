// Resolves links in a request into research notes and reference images before a build starts.
// Wikidata and Wikipedia are read directly (label, description, dimensions, the Commons photo);
// direct image links are downloaded; anything else is left for the session to fetch itself.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const UA = 'two-forks-props/0.1 (local modelling tool)';
const URL_RE = /https?:\/\/[^\s<>()"']+/g;
const UNITS = { Q174789: 'mm', Q11573: 'm', Q174728: 'cm', Q11570: 'kg', Q828224: 'km', Q3710: 'ft', Q218593: 'in', Q41803: 'g', Q160857: 'hp', Q11229: '%' };
const PROPS = [['P2043', 'length'], ['P2049', 'width'], ['P2048', 'height'], ['P2386', 'diameter'], ['P2067', 'mass'], ['P31', 'instance of'], ['P279', 'subclass of'],
  ['P176', 'manufacturer'], ['P571', 'inception'], ['P84', 'architect'], ['P149', 'architectural style'], ['P186', 'material'], ['P462', 'colour'], ['P17', 'country'], ['P131', 'located in']];

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  return r.json();
}

async function download(url, destBase) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  const ct = r.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) throw new Error('not an image (' + ct + ')');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 20e6) throw new Error('image over 20 MB');
  const ext = ct.includes('png') ? '.png' : ct.includes('webp') ? '.webp' : ct.includes('gif') ? '.gif' : '.jpg';
  fs.mkdirSync(path.dirname(destBase), { recursive: true });
  fs.writeFileSync(destBase + ext, buf);
  return destBase + ext;
}

const commonsUrl = (file) => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file.replace(/ /g, '_')) + '?width=1600';

async function wikidata(qid, refsDir, slug, o) {
  o = o || {};
  const d = await getJson('https://www.wikidata.org/wiki/Special:EntityData/' + qid + '.json');
  const e = d.entities && d.entities[qid]; if (!e) throw new Error('no entity ' + qid);
  const label = (e.labels && e.labels.en && e.labels.en.value) || qid;
  const desc = (e.descriptions && e.descriptions.en && e.descriptions.en.value) || '';
  const claims = e.claims || {}, notes = ['Wikidata ' + qid + ': ' + label + (desc ? ' (' + desc + ')' : '')], facts = [], ids = [];
  for (const [p, name] of PROPS) {
    const st = claims[p]; if (!st) continue;
    const vals = [];
    for (const s of st.slice(0, 3)) {
      const v = s.mainsnak && s.mainsnak.datavalue && s.mainsnak.datavalue.value; if (!v) continue;
      if (v.amount) { const u = UNITS[(v.unit || '').split('/').pop()]; vals.push(parseFloat(v.amount) + (u ? ' ' + u : '')); }
      else if (v.id) { vals.push(v.id); ids.push(v.id); }
      else if (v.time) vals.push(v.time.slice(1, 5));
      else if (typeof v === 'string') vals.push(v);
    }
    if (vals.length) facts.push([name, vals]);
  }
  const labels = {};
  const uniq = [...new Set(ids)].slice(0, 25);
  if (uniq.length) {
    try {
      const r = await getJson('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + uniq.join('|') + '&props=labels&languages=en&format=json');
      for (const [k, v] of Object.entries(r.entities || {})) labels[k] = (v.labels && v.labels.en && v.labels.en.value) || k;
    } catch (err) { /* keep ids */ }
  }
  for (const [name, vals] of facts) notes.push('  ' + name + ': ' + vals.map((v) => labels[v] || v).join(', '));
  const images = [];
  const img = claims.P18 && claims.P18[0] && claims.P18[0].mainsnak.datavalue && claims.P18[0].mainsnak.datavalue.value;
  if (img && !o.skipImage) {
    try { const f = await download(commonsUrl(img), path.join(refsDir, slug + '-wikidata')); images.push(f); notes.push('  photo: ' + path.relative(root, f) + ' (Wikimedia Commons, ' + img + ')'); }
    catch (err) { notes.push('  photo could not be downloaded: ' + err.message); }
  }
  const wp = e.sitelinks && e.sitelinks.enwiki && e.sitelinks.enwiki.title;
  if (wp && !o.skipWikipedia) {
    try { const s = await getJson('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wp.replace(/ /g, '_'))); if (s.extract) notes.push('  Wikipedia: ' + s.extract.slice(0, 700)); } catch (err) { /* optional */ }
  }
  return { notes, images };
}

async function wikipedia(url, refsDir, slug) {
  const m = url.match(/\/wiki\/([^#?]+)/); if (!m) throw new Error('not an article link');
  const s = await getJson('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(decodeURIComponent(m[1])));
  const notes = ['Wikipedia: ' + s.title + (s.description ? ' (' + s.description + ')' : '')], images = [];
  if (s.extract) notes.push('  ' + s.extract.slice(0, 700));
  const src = s.originalimage && s.originalimage.source;
  if (src) { try { const f = await download(src, path.join(refsDir, slug + '-wikipedia')); images.push(f); notes.push('  photo: ' + path.relative(root, f)); } catch (err) { notes.push('  photo could not be downloaded: ' + err.message); } }
  if (s.wikibase_item) { try { const w = await wikidata(s.wikibase_item, refsDir, slug, { skipImage: images.length > 0, skipWikipedia: true }); notes.push(...w.notes); images.push(...w.images); } catch (err) { /* optional */ } }
  return { notes, images };
}

// texts: strings that may contain URLs. Returns notes (lines), images (downloaded paths) and unresolved URLs.
async function resolveLinks(texts, slug, onLog) {
  const urls = [...new Set((texts.filter(Boolean).join(' ').match(URL_RE) || []))];
  const refsDir = path.join(root, 'refs'), notes = [], images = [], unresolved = [];
  let n = 0;
  for (const u of urls) {
    n++;
    try {
      let r = null;
      const wd = u.match(/wikidata\.org\/(?:wiki|entity)\/(Q\d+)/i);
      if (wd) r = await wikidata(wd[1], refsDir, slug + (n > 1 ? '-' + n : ''));
      else if (/wikipedia\.org\/wiki\//i.test(u)) r = await wikipedia(u, refsDir, slug + (n > 1 ? '-' + n : ''));
      else if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(u)) { const f = await download(u, path.join(refsDir, slug + '-link' + n)); r = { notes: ['Image from ' + u + ': ' + path.relative(root, f)], images: [f] }; }
      if (r) { notes.push(...r.notes); images.push(...r.images); if (onLog) onLog('resolved ' + u + ' (' + r.images.length + ' photo, ' + r.notes.length + ' notes)'); }
      else { unresolved.push(u); if (onLog) onLog('left for the session to fetch: ' + u); }
    } catch (err) { notes.push('Could not resolve ' + u + ': ' + err.message); unresolved.push(u); if (onLog) onLog('could not resolve ' + u + ': ' + err.message); }
  }
  return { urls, notes, images, unresolved };
}

// Guess a model kind from research notes when the caller gave none.
function inferKind(notes) {
  const t = notes.join(' ').toLowerCase();
  if (/\b(car|automobile|vehicle|truck|van|motorcycle|bus|tram|locomotive|aircraft|boat|ship)\b/.test(t)) return 'vehicle';
  if (/\b(building|house|tower|church|cathedral|bridge|station|skyscraper|museum|stadium|lighthouse|castle|temple)\b/.test(t)) return 'building';
  return null;
}

module.exports = { resolveLinks, download, wikidata, wikipedia, inferKind, URL_RE };

/*
 * Two Forks style runtime.
 *
 * Everything that makes a prop look like the set lives here: palette, material slots, sky, sun,
 * ridge rings, lights, camera framing and the helper library that models build with.
 * Model files never touch the scene; they only call the api handed to build(api).
 *
 * Runs in the browser (window.TwoForks) and in Node (module.exports) so the validator and
 * exporter can build models without a display.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.TwoForks = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var PALETTE = {
    dusk: 0x2B1533, crimson: 0xB03D4D, ember: 0xE8703A, gold: 0xF6C46A,
    ink: 0x17101E, cream: 0xF1E3C4, haze: 0xD8684A
  };

  // Every model names one of these sets (or supplies its own array). face and shell are the two
  // colour slots a model is built from; everything else is fixed style.
  var COLORWAYS = {
    props: [
      { id: 'charcoal', name: 'Charcoal', sw: '#3A2E42', face: 0x3A2E42, shell: 0x2A2032 },
      { id: 'cream', name: 'Lookout cream', sw: '#E6D6B4', face: 0xE6D6B4, shell: 0xC7B08A },
      { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xA63F2B }
    ],
    stucco: [
      { id: 'stucco', name: 'Taupe stucco', sw: '#B9AC9C', face: 0xB9AC9C, shell: 0xF1E3C4 },
      { id: 'white', name: 'Whitewash', sw: '#E6D6B4', face: 0xE6D6B4, shell: 0x8C7A66 },
      { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
    ],
    creamStucco: [
      { id: 'cream', name: 'Cream stucco', sw: '#E0D4B8', face: 0xE0D4B8, shell: 0xF4EAD6 },
      { id: 'taupe', name: 'Taupe stucco', sw: '#B9AC9C', face: 0xB9AC9C, shell: 0xF1E3C4 },
      { id: 'ember', name: 'Ember', sw: '#DA5A3C', face: 0xDA5A3C, shell: 0xF1E3C4 }
    ]
  };

  // Triangle budgets by model kind. The validator fails a model that exceeds its budget.
  var BUDGETS = { prop: 3500, vehicle: 6000, building: 12000, scene: 24000 };

  function rand(seed) {
    var t = (seed * 1000003) >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  function createWorld(THREE, opts) {
    opts = opts || {};
    var headless = !!opts.headless;
    var GROUND = -8;

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PALETTE.haze, 40, 260);
    var camera = new THREE.PerspectiveCamera(45, 1.5, 0.5, 1200);
    scene.add(camera);

    // ---------- backdrop: sky shader, sun, four ridge rings with pines, dark ground
    var sunPos = new THREE.Vector3(40, 36, -320);
    var weatherRefs = { ridges: [] }, weather = 'dusk';
    if (!headless) {
      var sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false,
        uniforms: { sunDir: { value: sunPos.clone().normalize() }, gloom: { value: 0.0 } },
        vertexShader: 'varying vec3 vDir; void main(){ vDir=(modelMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: [
          'uniform vec3 sunDir; uniform float gloom; varying vec3 vDir;',
          'void main(){',
          '  vec3 d=normalize(vDir); float h=d.y;',
          '  if (gloom > 0.5) { vec3 lo=vec3(0.66,0.67,0.68), hi=vec3(0.52,0.54,0.58); gl_FragColor=vec4(mix(lo,hi,smoothstep(-0.05,0.5,h)),1.0); return; }',
          '  vec3 gold=vec3(0.965,0.769,0.416), orange=vec3(0.910,0.439,0.227), crimson=vec3(0.690,0.239,0.302), dusk=vec3(0.478,0.180,0.306), plum=vec3(0.169,0.082,0.200);',
          '  vec3 c=mix(gold,orange,smoothstep(0.0,0.045,h));',
          '  c=mix(c,crimson,smoothstep(0.045,0.11,h));',
          '  c=mix(c,dusk,smoothstep(0.11,0.24,h));',
          '  c=mix(c,plum,smoothstep(0.24,0.5,h));',
          '  vec3 b=mix(gold,vec3(0.36,0.14,0.22),smoothstep(0.0,0.2,-h));',
          '  b=mix(b,vec3(0.09,0.06,0.12),smoothstep(0.2,0.6,-h));',
          '  vec3 col=mix(b,c,step(0.0,h));',
          '  float g=max(dot(d,sunDir),0.0);',
          '  col+=vec3(0.95,0.55,0.25)*pow(g,28.0)*0.7+vec3(0.6,0.25,0.1)*pow(g,5.0)*0.3;',
          '  gl_FragColor=vec4(col,1.0);',
          '}'].join('\n')
      }));
      scene.add(sky); weatherRefs.sky = sky;
      var sun = new THREE.Mesh(new THREE.CircleGeometry(24, 28), new THREE.MeshBasicMaterial({ color: PALETTE.gold, fog: false }));
      sun.position.copy(sunPos); sun.lookAt(0, 0, 0); scene.add(sun); weatherRefs.sun = sun;

      var hillFn = function (hMin, hMax, s) {
        return function (a) {
          var n = 0.5 + 0.30 * Math.sin(a * 2 + s) + 0.22 * Math.sin(a * 5 + s * 2.1) + 0.14 * Math.sin(a * 11 + s * 3.3) + 0.10 * Math.sin(a * 23 + s * 4.7);
          n = Math.min(1, Math.max(0, n)); return hMin + (hMax - hMin) * n;
        };
      };
      var coneT = (function () { var g = new THREE.ConeGeometry(1, 1, 5, 1, true); g.translate(0, 0.5, 0); return g.toNonIndexed().attributes.position.array; })();
      var cone = function (out, x, y, z, sr, sh, rot) {
        var c = Math.cos(rot), s = Math.sin(rot);
        for (var i = 0; i < coneT.length; i += 3) { var px = coneT[i] * sr, py = coneT[i + 1] * sh, pz = coneT[i + 2] * sr; out.push(px * c - pz * s + x, py + y, px * s + pz * c + z); }
      };
      var layer = function (cfg) {
        var H = hillFn(cfg.hMin, cfg.hMax, cfg.seed), pos = [], i;
        for (i = 0; i < cfg.N; i++) {
          var a0 = i / cfg.N * Math.PI * 2, a1 = (i + 1) / cfg.N * Math.PI * 2;
          var x0 = Math.cos(a0) * cfg.R, z0 = Math.sin(a0) * cfg.R, x1 = Math.cos(a1) * cfg.R, z1 = Math.sin(a1) * cfg.R;
          var y0 = GROUND + H(a0), y1 = GROUND + H(a1);
          pos.push(x0, GROUND, z0, x1, GROUND, z1, x0, y0, z0, x1, GROUND, z1, x1, y1, z1, x0, y0, z0);
        }
        if (cfg.trees) {
          var rnd = rand(cfg.seed * 1000 + 7);
          for (var k = 0; k < cfg.trees; k++) {
            var a = rnd() * Math.PI * 2, r = cfg.R - 1 - rnd() * cfg.spread;
            var ht = cfg.tMin + rnd() * (cfg.tMax - cfg.tMin), rad = ht * (0.22 + rnd() * 0.1);
            var x = Math.cos(a) * r, z = Math.sin(a) * r, y = GROUND + H(a) - 0.4, rot = rnd() * Math.PI * 2;
            if (cfg.tiers === 3) { cone(pos, x, y, z, rad, ht * 0.55, rot); cone(pos, x, y + ht * 0.28, z, rad * 0.8, ht * 0.5, rot + 0.6); cone(pos, x, y + ht * 0.55, z, rad * 0.58, ht * 0.45, rot + 1.2); }
            else if (cfg.tiers === 2) { cone(pos, x, y, z, rad, ht * 0.65, rot); cone(pos, x, y + ht * 0.4, z, rad * 0.7, ht * 0.6, rot + 0.7); }
            else cone(pos, x, y, z, rad, ht, rot);
          }
        }
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        var rm = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide }); rm.userData.dusk = cfg.color; weatherRefs.ridges.push(rm);
        scene.add(new THREE.Mesh(g, rm));
      };
      layer({ R: 50, N: 96, hMin: 1, hMax: 4, seed: 1.3, color: 0x17101E, trees: 150, spread: 6, tMin: 3, tMax: 6.5, tiers: 3 });
      layer({ R: 60, N: 80, hMin: 5, hMax: 8, seed: 2.9, color: 0x241329, trees: 110, spread: 8, tMin: 5, tMax: 8, tiers: 2 });
      layer({ R: 100, N: 56, hMin: 8, hMax: 14, seed: 4.1, color: 0x371A38, trees: 80, spread: 10, tMin: 6, tMax: 8, tiers: 1 });
      layer({ R: 160, N: 40, hMin: 22, hMax: 33, seed: 5.7, color: 0x4A2140 });
      var gm = new THREE.MeshBasicMaterial({ color: PALETTE.ink }); gm.userData.dusk = PALETTE.ink; weatherRefs.ridges.push(gm);
      var ground = new THREE.Mesh(new THREE.CircleGeometry(51, 48), gm);
      ground.rotation.x = -Math.PI / 2; ground.position.y = GROUND; scene.add(ground);
    }

    // ---------- lights: warm key from the front, gold rim from the sun, plum fill from below
    var hemi = new THREE.HemisphereLight(0xFFB07A, 0x3D2350, 0.65); scene.add(hemi);
    var amb = new THREE.AmbientLight(0x5A2A5A, 0.35); scene.add(amb);
    var key = new THREE.DirectionalLight(0xFFD2A0, 0.85); key.position.set(4, 12, 8); scene.add(key);
    var rim = new THREE.DirectionalLight(0xFFC070, 0.9); rim.position.copy(sunPos); scene.add(rim);
    // Weather: 'dusk' is the house style; 'gloom' is a Santa Monica marine layer, flat grey light, no sun, muted ridges.
    var GLOOM_RIDGES = [0x8E9296, 0x7A7E84, 0x646870, 0x50545B];
    function setWeather(w) {
      weather = w === 'gloom' ? 'gloom' : 'dusk'; var gloom = weather === 'gloom';
      if (weatherRefs.sky) weatherRefs.sky.material.uniforms.gloom.value = gloom ? 1 : 0;
      if (weatherRefs.sun) weatherRefs.sun.visible = !gloom;
      scene.fog.color.setHex(gloom ? 0x9DA1A5 : PALETTE.haze); scene.fog.near = gloom ? 30 : 40; scene.fog.far = gloom ? 200 : 260;
      weatherRefs.ridges.forEach(function (rm, i) { rm.color.setHex(gloom ? (rm.userData.dusk === PALETTE.ink ? 0x4A4E52 : GLOOM_RIDGES[Math.min(3, i)]) : rm.userData.dusk); });
      hemi.color.setHex(gloom ? 0xC8CCD0 : 0xFFB07A); hemi.groundColor.setHex(gloom ? 0x6E7072 : 0x3D2350); hemi.intensity = gloom ? 0.9 : 0.65;
      amb.color.setHex(gloom ? 0x9A9EA2 : 0x5A2A5A); amb.intensity = gloom ? 0.5 : 0.35;
      key.color.setHex(gloom ? 0xD8DCE0 : 0xFFD2A0); key.intensity = gloom ? 0.45 : 0.85;
      rim.color.setHex(gloom ? 0xB0B4B8 : 0xFFC070); rim.intensity = gloom ? 0.25 : 0.9;
      return weather;
    }

    // ---------- material slots. face and shell follow the colorway; the rest are fixed style.
    function lam(color, emissive) { var m = new THREE.MeshLambertMaterial({ color: color }); if (emissive) m.emissive.setHex(emissive); return m; }
    var M = {
      face: lam(0x3A2E42), shell: lam(0x2A2032),
      trim: lam(0x30283A), dark: lam(0x17121C), keys: lam(0x2A2233), stickTop: lam(0x2C2536),
      cream: lam(0xF1E3C4, 0x3A2A18), a: lam(0x7FA86A), b: lam(0xCF4B3F), x: lam(0x4F7EA8), y: lam(0xE9B94A),
      glass: lam(0x2E2440, 0x120A18), lit: lam(0xF6C46A, 0xB8742E),
      tile: lam(0xA63E2A), roof: lam(0x3A3036), roofDark: lam(0x2A2230),
      pad: lam(0x6F6862), concrete: lam(0x6C655C), curb: lam(0x8C3B3B), grass: lam(0xB8A47A),
      door: lam(0x4A3028), groove: lam(0x9A8C7E)
    };
    var wireMat = new THREE.MeshBasicMaterial({ color: PALETTE.cream, wireframe: true });
    var MASTER = M;

    // ---------- model registry
    var models = {}, order = [], allParts = [], active = null;
    var orbit = { phi: 0.3, zoom: 1, base: 30, zoomMax: 1.25 };

    function roundedRect(w, d, r) {
      var s = new THREE.Shape(), x = -w / 2, y = -d / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return s;
    }

    // An api bound to a group. Models get one for their root group; embedded props get one for their own
    // group with their own face and shell slots, so every helper (part, sub, facade, eave, railing) lands inside it.
    function makeApi(m, group, mats) {
      var G = group || m.group, M = mats || MASTER;
      function flat(g) { var f = g.index ? g.toNonIndexed() : g; f.computeVertexNormals(); return f; }
      function part(geo, mat, x, y, z, rx, ry, rz, parent) {
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x || 0, y || 0, z || 0); mesh.rotation.set(rx || 0, ry || 0, rz || 0);
        (parent || G).add(mesh); m.parts.push(mesh); allParts.push(mesh); return mesh;
      }
      function eave(len, wid, y, over, thick, tails) {
        part(flat(new THREE.BoxGeometry(len + 2 * over, thick, wid + 2 * over)), M.shell, 0, y + thick / 2, 0);
        part(flat(new THREE.BoxGeometry(len + 2 * over - 0.9, 0.05, wid + 2 * over - 0.9)), M.roof, 0, y + thick + 0.025, 0);
        var tl = 0.5, tilt = 0.5, ey = y + thick + tl / 2 * Math.sin(tilt) + 0.03, ins = tl / 2 * Math.cos(tilt) - 0.05;
        part(flat(new THREE.BoxGeometry(len + 2 * over + 0.1, 0.08, tl)), M.tile, 0, ey, wid / 2 + over - ins, tilt, 0, 0);
        part(flat(new THREE.BoxGeometry(len + 2 * over + 0.1, 0.08, tl)), M.tile, 0, ey, -(wid / 2 + over - ins), -tilt, 0, 0);
        part(flat(new THREE.BoxGeometry(tl, 0.08, wid + 2 * over + 0.1)), M.tile, len / 2 + over - ins, ey, 0, 0, 0, -tilt);
        part(flat(new THREE.BoxGeometry(tl, 0.08, wid + 2 * over + 0.1)), M.tile, -(len / 2 + over - ins), ey, 0, 0, 0, tilt);
        if (tails) {
          var tlen = over + 0.3, ty = y - 0.11, sp = 0.9, u;
          for (u = -len / 2 + 0.45; u < len / 2; u += sp) {
            part(flat(new THREE.BoxGeometry(0.15, 0.22, tlen)), M.shell, u, ty, wid / 2 + tlen / 2 - 0.3);
            part(flat(new THREE.BoxGeometry(0.15, 0.22, tlen)), M.shell, u, ty, -(wid / 2 + tlen / 2 - 0.3));
          }
          for (u = -wid / 2 + 0.45; u < wid / 2; u += sp) {
            part(flat(new THREE.BoxGeometry(tlen, 0.22, 0.15)), M.shell, len / 2 + tlen / 2 - 0.3, ty, u);
            part(flat(new THREE.BoxGeometry(tlen, 0.22, 0.15)), M.shell, -(len / 2 + tlen / 2 - 0.3), ty, u);
          }
        }
      }
      function railing(x0, x1, z, y0, h, pitch, thick, postEvery, midRail) {
        var len = x1 - x0, cx = (x0 + x1) / 2;
        part(flat(new THREE.BoxGeometry(len, thick, thick)), M.dark, cx, y0 + h - thick / 2, z);
        part(flat(new THREE.BoxGeometry(len, thick, thick)), M.dark, cx, y0 + 0.12, z);
        if (midRail) part(flat(new THREE.BoxGeometry(len, thick * 0.8, thick * 0.8)), M.dark, cx, y0 + h * 0.55, z);
        for (var px = x0; px <= x1 + 0.001; px += postEvery) part(flat(new THREE.BoxGeometry(0.07, h, 0.07)), M.dark, px, y0 + h / 2, z);
        for (var bx = x0 + pitch; bx < x1 - pitch / 2; bx += pitch) part(flat(new THREE.BoxGeometry(0.03, h - 0.14, 0.03)), M.dark, bx, y0 + 0.12 + (h - 0.14) / 2, z);
      }
      function facade(L, W) {
        function slab(w, h, t, mat, face, u, yc, d, rx) {
          var geo = flat(new THREE.BoxGeometry(w, h, t));
          if (face === '+z') return part(geo, mat, u, yc, W / 2 + d, rx || 0, 0, 0);
          if (face === '-z') return part(geo, mat, u, yc, -W / 2 - d, -(rx || 0), 0, 0);
          if (face === '+x') return part(geo, mat, L / 2 + d, yc, u, 0, Math.PI / 2, -(rx || 0));
          return part(geo, mat, -L / 2 - d, yc, u, 0, Math.PI / 2, rx || 0);
        }
        function win(face, u, sill, w, h, rail) {
          slab(w + 0.24, h + 0.24, 0.06, M.shell, face, u, sill + h / 2, 0.03);
          slab(w, h, 0.04, M.glass, face, u, sill + h / 2, 0.06);
          if (rail) slab(w, 0.06, 0.02, M.shell, face, u, sill + h / 2, 0.085);
          slab(w + 0.3, 0.08, 0.18, M.shell, face, u, sill - 0.04, 0.09);
        }
        return { slab: slab, win: win };
      }
      return {
        THREE: THREE, M: M, PALETTE: PALETTE, COLORWAYS: COLORWAYS, group: G, rand: rand, flat: flat, part: part,
        forGroup: function (g2, overrides) { return makeApi(m, g2, Object.assign({}, M, overrides || {})); },
        onTick: function (fn) { m.ticks.push(fn); },   // fn(t, dt, wind) runs every frame while the model is active
        sub: function (x, y, z, rx, ry, rz, parent) { var s = new THREE.Group(); s.position.set(x || 0, y || 0, z || 0); s.rotation.set(rx || 0, ry || 0, rz || 0); (parent || G).add(s); return s; },
        mat: function (color, emissive) { return lam(color, emissive); },
        box: function (w, h, d) { return flat(new THREE.BoxGeometry(w, h, d)); },
        cyl: function (rt, rb, h, seg) { return flat(new THREE.CylinderGeometry(rt, rb, h, seg || 8)); },
        cone: function (r, h, seg, open) { return flat(new THREE.ConeGeometry(r, h, seg || 5, 1, !!open)); },
        torus: function (r, t, rs, ts) { return flat(new THREE.TorusGeometry(r, t, rs || 6, ts || 10)); },
        disc: function (r, seg) { return flat(new THREE.CircleGeometry(r, seg || 10)); },
        plane: function (w, h) { return new THREE.PlaneGeometry(w, h); },
        shape: function () { return new THREE.Shape(); },
        roundedRect: roundedRect,
        extrude: function (shape, o) { var g = new THREE.ExtrudeGeometry(shape, o); g.computeVertexNormals(); return g; },
        lathe: function (points, seg) { return flat(new THREE.LatheGeometry(points.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 8)); },
        displace: function (geo, fn) {
          var p = geo.attributes.position;
          for (var i = 0; i < p.count; i++) { var r = fn(p.getX(i), p.getY(i), p.getZ(i)); if (r) p.setXYZ(i, r[0], r[1], r[2]); }
          geo.computeVertexNormals(); return geo;
        },
        canvasMaterial: function (w, h, draw, fallback) {
          if (headless || typeof document === 'undefined') return new THREE.MeshBasicMaterial({ color: fallback == null ? PALETTE.dusk : fallback });
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          draw(c.getContext('2d'), c.width, c.height);
          return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) });
        },
        facade: facade, eave: eave, railing: railing
      };
    }

    function countTris(m) {
      var t = 0;
      m.parts.forEach(function (p) { var g = p.geometry; t += (g.index ? g.index.count : g.attributes.position.count) / 3; });
      return Math.round(t);
    }

    function addModel(def) {
      if (!def || !def.id || typeof def.build !== 'function') throw new Error('a model needs an id and a build(api) function');
      if (models[def.id]) throw new Error('duplicate model id ' + def.id);
      var cws = typeof def.colorways === 'string' ? COLORWAYS[def.colorways] : (def.colorways || COLORWAYS.props);
      if (!cws || !cws.length) throw new Error('unknown colorway set for ' + def.id);
      var cam = def.camera || {};
      var g = new THREE.Group(); scene.add(g);
      var m = {
        id: def.id, name: def.name || def.id, kind: def.kind || 'prop', def: def, group: g, parts: [], tris: 0,
        pivotY: cam.pivotY || 0, fitW: cam.fitW || 20, baseMin: cam.baseMin || 30,
        homePhi: cam.homePhi == null ? 0.3 : cam.homePhi, homeYaw: cam.homeYaw == null ? -0.38 : cam.homeYaw, tilt: cam.tilt == null ? 0.12 : cam.tilt,
        colorways: cws, cw: cws[0].id, budget: def.budget || BUDGETS[def.kind] || BUDGETS.prop, ticks: []
      };
      if (def.scale) g.scale.setScalar(def.scale);
      def.build(makeApi(m));
      m.tris = countTris(m);
      g.visible = false;
      models[m.id] = m; order.push(m.id);
      return m;
    }

    function setActive(id) {
      var m = models[id]; if (!m) throw new Error('no model ' + id);
      active = m; order.forEach(function (k) { models[k].group.visible = (k === id); });
      setColorway(m.cw); resetView(); return m;
    }
    function setColorway(id) {
      var c = null; active.colorways.forEach(function (k) { if (k.id === id) c = k; }); if (!c) return null;
      active.cw = id; M.face.color.setHex(c.face); M.shell.color.setHex(c.shell); return c;
    }
    var wireOn = false;
    function setWire(on) {
      wireOn = !!on;
      allParts.forEach(function (p) { if (!p.userData.mat) p.userData.mat = p.material; p.material = wireOn ? wireMat : p.userData.mat; });
      return wireOn;
    }
    var pan = new THREE.Vector3(0, 0, 0);
    function resetView() { active.group.rotation.y = active.homeYaw; orbit.phi = active.homePhi; orbit.zoom = 1; pan.set(0, 0, 0); }
    function fit(w, h) {
      camera.aspect = w / h; camera.updateProjectionMatrix();
      var half = Math.tan(camera.fov * Math.PI / 360);
      orbit.base = Math.max(active.baseMin, (active.fitW * 0.5 * 1.25) / (half * camera.aspect));
      orbit.zoomMax = Math.min(1.25, 48 / orbit.base);
      orbit.zoom = clamp(orbit.zoom, 0.08, orbit.zoomMax);
    }
    function placeCamera() {
      var r = orbit.base * orbit.zoom, cp = Math.cos(orbit.phi), ty = active.pivotY;
      camera.position.set(pan.x, ty + pan.y + r * Math.sin(orbit.phi), pan.z + r * cp);
      camera.lookAt(pan.x, ty + pan.y, pan.z);
      camera.rotateX(active.tilt);
    }
    // move the point the camera orbits, in screen-plane units scaled to the current distance: dx right, dy up
    function panBy(dx, dy) {
      var r = orbit.base * orbit.zoom, k = r * 0.0012;
      pan.x += dx * k; pan.y += dy * k;
      pan.x = clamp(pan.x, -orbit.base * 2, orbit.base * 2); pan.y = clamp(pan.y, -orbit.base, orbit.base * 2);
    }
    function bounds(m) { m.group.updateMatrixWorld(true); return new THREE.Box3().setFromObject(m.group); }
    var wind = { on: true, strength: 1 }, clock = 0;
    function tick(dt) { clock += dt; if (!active || !wind.on) return; for (var i = 0; i < active.ticks.length; i++) active.ticks[i](clock, dt, wind); }

    return {
      THREE: THREE, scene: scene, camera: camera, M: M, PALETTE: PALETTE, COLORWAYS: COLORWAYS, BUDGETS: BUDGETS,
      models: models, order: order, allParts: allParts, orbit: orbit,
      addModel: addModel, setActive: setActive, active: function () { return active; },
      setColorway: setColorway, setWire: setWire, isWire: function () { return wireOn; },
      resetView: resetView, fit: fit, placeCamera: placeCamera, bounds: bounds, tick: tick, wind: wind,
      setWeather: setWeather, weather: function () { return weather; },
      turn: function (d) { active.group.rotation.y += d; },
      tiltBy: function (d) { orbit.phi = clamp(orbit.phi + d, 0.05, 1.25); },
      zoomBy: function (f) { orbit.zoom = clamp(orbit.zoom * f, 0.08, orbit.zoomMax); },
      panBy: panBy, pan: pan
    };
  }

  return { PALETTE: PALETTE, COLORWAYS: COLORWAYS, BUDGETS: BUDGETS, rand: rand, createWorld: createWorld };
});

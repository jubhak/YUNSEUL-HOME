/* Cozy home: procedural Three.js scenery, no external art assets. */
(function (global) {
  'use strict';
  const SKY = Object.freeze({
    ufoInitial: 20, ufoDuration: 8.4, ufoWaitMin: 50, ufoWaitRange: 60,
    ufoWait(random = Math.random) { return this.ufoWaitMin + random() * this.ufoWaitRange; },
    // UFO's complete start-to-start interval, halved; do not add meteor lifetime.
    meteorWait(random = Math.random) { return (this.ufoWait(random) + this.ufoDuration) / 2; }
  });
  function isBedtime(date = new Date()) { return date.getHours() < 6; }
  function chooseSite(T, obstacles, radius, footprint = 2.35) {
    let best = null, clearance = -Infinity;
    // Deterministic Fibonacci lattice, including quiet areas on the far side.
    for (let i = 0; i < 4096; i++) {
      const y = 1 - 2 * (i + .5) / 4096;
      if (y < -.82) continue;
      const a = i * Math.PI * (3 - Math.sqrt(5)), r = Math.sqrt(1 - y * y);
      const n = new T.Vector3(r * Math.cos(a), y, r * Math.sin(a));
      const gap = Math.min(...obstacles.map(o => radius * n.angleTo(o.n) - o.radius - footprint));
      if (gap > clearance) { clearance = gap; best = n; }
    }
    return { n: best, clearance, footprint };
  }
  function builder(T) {
    const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .82, ...extra });
    const mesh = (parent, geometry, material, x = 0, y = 0, z = 0) => {
      const m = new T.Mesh(geometry, material); m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true; parent.add(m); return m;
    };
    const box = (p, w, h, d, m, x, y, z) => mesh(p, new T.BoxGeometry(w, h, d), m, x, y, z);
    const ball = (p, r, m, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const o = mesh(p, new T.SphereGeometry(r, 24, 16), m, x, y, z); o.scale.set(sx, sy, sz); return o;
    };
    const beam = (p, a, b, width, m) => {
      const start = new T.Vector3(...a), end = new T.Vector3(...b), mid = start.clone().add(end).multiplyScalar(.5);
      const o = box(p, width, start.distanceTo(end), width, m, mid.x, mid.y, mid.z);
      o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), end.sub(start).normalize()); return o;
    };
    const arch = (p, w, h, depth, material, x, y, z) => {
      const r = w / 2, s = new T.Shape(); s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r);
      s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
      const o = mesh(p, new T.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 24 }), material, x, y, z);
      return o;
    };
    return { mat, mesh, box, ball, beam, arch };
  }
  function buildExterior(T) {
    const b = builder(T), { mat, box, ball, beam, arch } = b, g = new T.Group(); g.name = 'yunseul-cozy-house';
    const cream = mat(0xfff0d8), wood = mat(0xb96c31), red = mat(0xe95d68), tile = mat(0xf4797d), stone = mat(0xa8aaa0);
    box(g, 3.7, .55, 3.25, stone, 0, -.14, 0);
    box(g, 3.18, 2.18, 2.55, cream, 0, 1.1, 0);
    [-1, 1].forEach(s => {
      box(g, .16, 2.35, .16, wood, s * 1.54, 1.13, 1.3);
      box(g, .16, 2.35, .16, wood, s * 1.54, 1.13, -1.3);
      box(g, 3.32, .16, .16, wood, 0, 2.18, s * 1.3);
      // Gable is an actual triangle instead of a square behind the pitched roof.
      const tri = new T.Shape(); tri.moveTo(-1.58, 0); tri.lineTo(1.58, 0); tri.lineTo(0, 1.3); tri.closePath();
      const m = new T.Mesh(new T.ShapeGeometry(tri), cream); m.position.set(0, 2.18, s * 1.29); if (s < 0) m.rotation.y = Math.PI; g.add(m);
      beam(g, [-1.62, 2.18, s * 1.34], [0, 3.5, s * 1.34], .17, wood);
      beam(g, [0, 3.5, s * 1.34], [1.62, 2.18, s * 1.34], .17, wood);
      box(g, .13, 1.25, .16, wood, 0, 2.8, s * 1.34);
      for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) {
        const x = s * (.2 + row * .36), y = 3.55 - (.2 + row * .36) * .81;
        const o = box(g, .55, .14, .49, (row + col) % 3 ? red : tile, x, y, -1.48 + col * .49);
        o.rotation.z = -s * .68;
      }
    });
    box(g, .52, 1.18, .52, mat(0x86867e), 1, 3.12, -.72);
    box(g, .65, .16, .65, stone, 1, 3.74, -.72);
    arch(g, 1.35, 1.93, .12, wood, 0, .06, 1.3);
    arch(g, 1.10, 1.77, .10, mat(0xc94c32), 0, .08, 1.44);
    arch(g, .60, .77, .025, mat(0xeec36d, { emissive: 0xffb947, emissiveIntensity: .3 }), 0, .92, 1.55);
    box(g, .06, .70, .04, wood, 0, 1.30, 1.59); box(g, .58, .06, .04, wood, 0, 1.29, 1.59);
    ball(g, .075, mat(0xe9bd51, { metalness: .55 }), -.40, .81, 1.61);
    for (let i = 0; i < 3; i++) box(g, 1.45 + i * .16, .12, .38, stone, 0, .03 - i * .09, 1.48 + i * .30);
    for (const s of [-1, 1]) {
      for (let j = 0; j < 3; j++) ball(g, .38, mat(j % 2 ? 0x77bb5b : 0x5ca951), s * 1.95, .22 + j * .13, .3 + j * .43, 1, 1, .9);
      for (let j = 0; j < 5; j++) { const x = s * (1.45 + (j % 2) * .4), z = 1.65 + Math.floor(j / 2) * .2;
        box(g, .035, .3, .035, mat(0x579146), x, .12, z);
        ball(g, .10, mat(j % 2 ? 0xffd37c : 0xff9eb1), x, .32, z);
      }
    }
    box(g, .07, .9, .07, wood, 2.05, .45, 1.8);
    box(g, .45, .44, .37, mat(0xe2b76b), 2.05, 1.04, 1.8);
    ball(g, .09, mat(0x42362a), 2.05, 1.08, 2, 1, 1, .16);
    [-1, 1].forEach(s => { const r = box(g, .36, .09, .49, wood, 2.05 + s * .15, 1.33, 1.8); r.rotation.z = -s * .55; });
    g.userData.footprintRadius = 2.2; g.userData.height = 3.8;
    return g;
  }
  function makeMeteors(T, scene, aspect, night, weather) {
    const root = new T.Group(); root.renderOrder = 8; root.visible = false; scene.add(root);
    const c = document.createElement('canvas'); c.width = c.height = 128; const ctx = c.getContext('2d');
    const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64); glow.addColorStop(0, '#fffef1'); glow.addColorStop(.1, '#fff9cc'); glow.addColorStop(.3, '#b9e8ff99'); glow.addColorStop(1, '#b9d3ff00'); ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 128);
    const texture = new T.CanvasTexture(c), head = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false })); head.scale.set(.12, .12, 1); root.add(head);
    const steps = 40, positions = new Float32Array((steps + 1) * 6), fractions = [], indices = [];
    for (let i = 0; i <= steps; i++) { fractions.push(i / steps, i / steps); if (i < steps) { const j = i * 2; indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); } }
    const tailGeo = new T.BufferGeometry(); tailGeo.setAttribute('position', new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage)); tailGeo.setAttribute('fraction', new T.Float32BufferAttribute(fractions, 1)); tailGeo.setIndex(indices);
    const tailMaterial = new T.ShaderMaterial({
      uniforms: { alpha: { value: 0 } }, transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false, side: T.DoubleSide,
      vertexShader: 'attribute float fraction; varying float k; void main(){k=fraction;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform float alpha; varying float k; void main(){vec3 c=mix(vec3(1.0,.98,.84),vec3(.48,.65,1.0),k);gl_FragColor=vec4(c,alpha*pow(1.0-k,1.65));}'
    });
    const tail = new T.Mesh(tailGeo, tailMaterial); tail.frustumCulled = false; tail.renderOrder = 8; root.add(tail);
    const glitter = [];
    for (let i = 0; i < 7; i++) { const p = new T.Sprite(new T.SpriteMaterial({ map: texture, transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false })); p.scale.set(.025, .025, 1); root.add(p); glitter.push(p); }
    let wait = SKY.ufoInitial / 2, age = 0, active = false, enabled = false, count = 0, startX = 0, startY = 0, side = 1;
    function spawn() { age = 0; active = true; count++; root.visible = true; side = Math.random() < .5 ? -1 : 1; startX = -side * aspect() * (.3 + Math.random() * .4); startY = .79 + Math.random() * .12; }
    return {
      update(dt) {
        const visible = night() > .6 && weather() < .5;
        if (!visible) { root.visible = false; active = false; enabled = false; return; }
        if (!enabled) { wait = SKY.ufoInitial / 2; enabled = true; }
        wait -= dt;
        if (wait <= 0) { spawn(); wait += SKY.meteorWait(); }
        if (!active) return;
        age += dt; const u = age / 2.25;
        if (u >= 1) { root.visible = false; active = false; return; }
        const x = startX + side * age * .65, y = startY - age * .23, alpha = Math.min(1, age * 4) * Math.pow(1 - u, .6);
        head.position.set(x, y, 0); head.material.opacity = alpha; head.scale.setScalar(.09 + Math.sin(age * 10) * .009);
        const length = Math.min(1, age / .55), nx = .333, ny = side * .943;
        for (let i = 0; i <= steps; i++) {
          const k = i / steps, width = .012 * Math.pow(1 - k, .8), px = x - side * k * .70 * length, py = y + k * .248 * length, j = i * 6;
          positions[j] = px + nx * width; positions[j + 1] = py + ny * width; positions[j + 2] = 0;
          positions[j + 3] = px - nx * width; positions[j + 4] = py - ny * width; positions[j + 5] = 0;
        }
        tailGeo.attributes.position.needsUpdate = true; tailMaterial.uniforms.alpha.value = alpha * .88;
        glitter.forEach((p, i) => { const k = ((age * .34 + i / 7) % 1); p.position.set(x - side * k * .7 * length, y + k * .248 * length + Math.sin(i * 4.1) * .016, 0); p.material.opacity = alpha * (1 - k) * (.25 + .35 * Math.sin(age * 8 + i) ** 2); });
      }, get state() { return { count, active, wait }; }
    };
  }
  function createRoom(T, env) {
    const { mat, mesh, box, ball, beam, arch } = builder(T);
    const room = new T.Scene(); room.background = new T.Color(0x18253b);
    const camera = new T.PerspectiveCamera(38, 1, .1, 120);
    let open = false, sleeping = false, wakeTime = -1, elapsed = 0, selectedBed = 0, lastNight = null, target = null, transitioning = false;
    let characters = [], owner = null, hiddenHud = [], returnFocus = null;
    const group = new T.Group(); room.add(group);
    const cream = mat(0xffefce), timber = mat(0xbb8250), wall = mat(0xf4ba57), floor = mat(0xa4c9b1), white = mat(0xfff8e8);
    const ambient = new T.HemisphereLight(0xffe8c3, 0xa3b5a7, 1); room.add(ambient);
    const lamp = new T.PointLight(0xffd29b, .9, 28); lamp.position.set(1, 6, 1); room.add(lamp);
    const fill = new T.DirectionalLight(0xd8e7ff, .65); fill.position.set(3, 9, 12); room.add(fill);
    box(group, 14.4, .4, 12.4, timber, 0, -.23, 0);
    for (let i = 0; i < 25; i++) { const plank = box(group, 14, .08, .47, i % 3 ? floor : mat(0xb6d2bd), 0, 0, -5.76 + i * .48); plank.receiveShadow = true;
      for (let j = 0; j < 3; j++) box(group, .015, .008, .46, mat(0x95b9a1), -6 + j * 4.5 + (i % 2) * 1.3, .045, plank.position.z);
    }
    // Cut out a real window opening in the rear wall.
    box(group, 14.2, 1.95, .20, wall, 0, .98, -6.08);
    box(group, 14.2, 1.0, .20, wall, 0, 5.6, -6.08);
    box(group, 4.1, 3.2, .20, wall, -5.05, 3.52, -6.08);
    box(group, 4.1, 3.2, .20, wall, 5.05, 3.52, -6.08);
    box(group, .20, 6.2, 12.2, wall, -7.08, 3, 0);
    box(group, 14.2, .20, .24, cream, 0, .15, -5.91);
    box(group, .24, .20, 12.2, cream, -6.94, .15, 0);
    beam(group, [-7, 6, -6], [7, 6, -6], .18, timber); beam(group, [-7, 6, -6], [-7, 6, 6], .18, timber);
    // Painted night/day sky is physically outside the window frame.
    const skyMat = new T.MeshBasicMaterial({ color: 0x182850 });
    box(group, 6.1, 3.25, .08, skyMat, 0, 3.52, -6.31);
    const moon = ball(group, .46, new T.MeshBasicMaterial({ color: 0xffedba }), 1.32, 4.19, -6.19, 1, 1, .13);
    const moonHalo = ball(group, .67, new T.MeshBasicMaterial({ color: 0xffe6a4, transparent: true, opacity: .12, depthWrite: false }), 1.32, 4.19, -6.25, 1, 1, .04);
    const stars = new T.Group(); group.add(stars);
    for (let i = 0; i < 25; i++) ball(stars, i % 5 ? .018 : .035, new T.MeshBasicMaterial({ color: 0xfff2cf }), -2.7 + ((i * 137) % 541) / 100, 2.1 + ((i * 71) % 280) / 100, -6.22, 1, 1, .1);
    [-1, 1].forEach(s => box(group, .16, 3.5, .28, timber, s * 3.04, 3.55, -5.96));
    [1.84, 5.2].forEach(y => box(group, 6.25, .16, .28, timber, 0, y, -5.96));
    box(group, .10, 3.3, .17, cream, 0, 3.53, -5.9); box(group, 6, .10, .17, cream, 0, 3.45, -5.9);
    box(group, 6.5, .16, .60, white, 0, 1.8, -5.82);
    const curtain = mat(0xf9e8ce);
    [-1, 1].forEach(s => { for (let i = 0; i < 5; i++) { const o = mesh(group, new T.CylinderGeometry(.12, .19, 3.30, 12), curtain, s * (2.65 + i * .10), 3.55, -5.63); o.scale.z = .65; } box(group, .65, .12, .18, mat(0xe4b16b), s * 2.88, 2.6, -5.4); });
    // Exit door remains a separate raycast target.
    const door = new T.Group(); door.name = 'home-exit-door'; door.position.set(-5.35, .08, -5.87); group.add(door);
    arch(door, 1.78, 3.18, .16, timber, 0, 0, 0); arch(door, 1.47, 2.98, .06, mat(0xc76548), 0, .05, .18);
    arch(door, .82, 1.03, .02, mat(0xedc17c), 0, 1.55, .27); box(door, .06, .85, .035, timber, 0, 2.06, .31); box(door, .78, .06, .035, timber, 0, 2.04, .31);
    ball(door, .09, mat(0xe9bd6a, { metalness: .5 }), .52, 1.3, .3);
    const rug = mesh(group, new T.CylinderGeometry(2.65, 2.65, .035, 80), mat(0xe9b28d), .3, .065, 1.7); rug.scale.z = .72;
    const innerRug = mesh(group, new T.CylinderGeometry(2.34, 2.34, .038, 80), mat(0xf7d5aa), .3, .071, 1.7); innerRug.scale.z = .72;
    const beds = [], blankets = [], bedXs = [-2.05, .65];
    for (let i = 0; i < 2; i++) {
      const g = new T.Group(); g.name = 'home-bed-' + i; g.position.set(bedXs[i], 0, -2.6); group.add(g); beds.push(g);
      const bedWood = mat(0xcf9e6b), quilt = mat(i ? 0xe7a5b0 : 0x91b9c9);
      box(g, 2.15, .28, 3.65, bedWood, 0, .51, 0);
      [-1, 1].forEach(s => { [-1, 1].forEach(z => box(g, .14, .6, .14, bedWood, s * .90, .3, z * 1.6)); box(g, 2.14, s < 0 ? 1.3 : .65, .13, bedWood, 0, s < 0 ? .84 : .52, s * 1.79); });
      box(g, 1.96, .32, 3.36, white, 0, .82, 0);
      const pillow = ball(g, .5, white, 0, 1.04, -1.13, 1.63, .21, .66); pillow.name = 'soft-pillow';
      const blanket = new T.Group(); g.add(blanket); blankets.push(blanket);
      box(blanket, 2.02, .13, 2.17, quilt, 0, 1.045, .46);
      box(blanket, 2.02, .04, .32, white, 0, 1.13, -.52);
      for (let a = 0; a < 5; a++) for (let j = 0; j < 5; j++) {
        const patch = box(blanket, .30, .014, .28, mat(i ? 0xf1c2ca : 0xb5d6df), -.78 + a * .39, 1.12, -.30 + j * .40); patch.rotation.y = (a + j) % 2 ? .12 : 0;
      }
    }
    // A broad, uncluttered aisle around the beds and a tiny nightstand.
    box(group, .48, .75, .60, timber, -.7, .4, -3.65);
    mesh(group, new T.CylinderGeometry(.18, .22, .3, 16), mat(0xebd9ab), -.7, .96, -3.65);
    const bedsideLight = new T.PointLight(0xffc675, .7, 5); bedsideLight.position.set(-.7, 1.2, -3.65); room.add(bedsideLight);
    const teddy = (parent, x, z, size, color) => {
      const g = new T.Group(); g.position.set(x, .06, z); g.scale.setScalar(size); parent.add(g);
      const fur = mat(color), muzzle = mat(0xf4d4a1), eyes = mat(0x35251e);
      ball(g, .59, fur, 0, .86, 0, 1, 1.23, .8); ball(g, .52, fur, 0, 1.72, .02);
      [-1, 1].forEach(s => { ball(g, .21, fur, s * .41, 2.12, 0); ball(g, .10, muzzle, s * .41, 2.12, .17); ball(g, .27, fur, s * .64, .96, .05, .7, 1.45, .8); ball(g, .30, fur, s * .38, .22, .35, 1, .75, 1.25); ball(g, .045, eyes, s * .19, 1.79, .49); });
      ball(g, .21, muzzle, 0, 1.57, .46, 1.1, .75, .4); ball(g, .055, eyes, 0, 1.65, .56, 1.15, .75, .6);
      [-1, 1].forEach(s => { const bow = ball(g, .18, mat(0xc5a64e), s * .16, 1.25, .5, 1, .65, .3); bow.rotation.z = s * .3; }); ball(g, .07, mat(0xf2d573), 0, 1.25, .55);
      return g;
    };
    teddy(group, 4.7, -4.24, 1.75, 0xb88561);
    const shelf = new T.Group(); shelf.position.set(5.65, 0, -.2); shelf.rotation.y = -.25; group.add(shelf);
    [-1.05, 1.05].forEach(x => box(shelf, .12, 2.7, 1.05, white, x, 1.38, 0));
    [0, 1.28, 2.62].forEach(y => box(shelf, 2.18, .12, 1.05, white, 0, y + .12, 0)); box(shelf, .10, 2.5, 1, white, 0, 1.4, 0);
    for (let i = 0; i < 9; i++) { const book = box(shelf, .14, .61 + (i % 3) * .08, .47, mat([0xe4b272, 0x91b7aa, 0x95afce, 0xd99391][i % 4]), -.82 + i * .20, 1.76, -.05); book.rotation.z = i % 3 === 0 ? -.13 : 0; }
    for (let i = 0; i < 5; i++) box(shelf, .15, .60, .47, mat([0xf2c76b, 0xb5bc8b, 0xe3bfb0][i % 3]), -.85 + i * .17, .47, -.05);
    teddy(shelf, .45, -.05, .53, 0xe8d5a5);
    const plant = (x, z, scale = 1) => {
      const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); group.add(g);
      mesh(g, new T.CylinderGeometry(.23, .16, .38, 20), mat(0xe6c290), 0, .25, 0);
      for (let i = 0; i < 7; i++) { const a = i * 2.4; const leaf = ball(g, .21, mat(i % 2 ? 0x719f61 : 0x9eba77), Math.sin(a) * .21, .58 + i * .09, Math.cos(a) * .18, .6, 1.6, .6); leaf.rotation.z = Math.sin(a) * .7; }
    };
    plant(-6.15, -1.8, 1.3); plant(5.5, 3.55, 1.7);
    // Framed bear portrait and a cozy pendant light.
    box(group, 1.12, 1.37, .12, timber, -6.91, 3.65, -.2).rotation.y = Math.PI / 2;
    box(group, .07, 1.10, .85, mat(0xa9b18d), -6.79, 3.65, -.2);
    const pendant = new T.Group(); pendant.position.set(2, 5.65, 1.4); group.add(pendant);
    box(pendant, .035, .65, .035, mat(0x6f5943), 0, .48, 0);
    mesh(pendant, new T.CylinderGeometry(.51, .68, .66, 32, 1, true), mat(0xffefd1, { side: T.DoubleSide, emissive: 0xffd7a0, emissiveIntensity: .22 }), 0, 0, 0);
    // Fine, warm wall decoration without asset downloads.
    const buntingColors = [0xdf8b83, 0xa6b8a1, 0xecc876, 0x9eb4c5];
    for (let i = 0; i < 9; i++) { const x = -2.4 + i * .6, y = 5.48 - Math.sin(i / 8 * Math.PI) * .16; const pennant = mesh(group, new T.ConeGeometry(.12, .25, 3), mat(buntingColors[i % 4]), x, y, -5.82); pennant.rotation.z = Math.PI; }
    const panel = document.createElement('section'); panel.id = 'cozyHome'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'homeTitle');
    panel.innerHTML = '<header class="home-bar"><div><span class="home-kicker">YUNSEUL · OUR LITTLE HOME</span><h2 id="homeTitle">달빛이 쉬어 가는 집</h2></div><button id="homeExit" type="button">↩ 집 밖으로</button></header><div class="home-note" id="homeNote" role="status" aria-live="polite"></div><div class="home-actions"><button type="button" data-home-bed="0">🛏 남자아이 침대</button><button type="button" data-home-bed="1">🛏 여자아이 침대</button><button type="button" id="homeWake">☀ 일어나기</button></div>';
    document.getElementById('app').appendChild(panel);
    const note = panel.querySelector('#homeNote'), exitButton = panel.querySelector('#homeExit'), wakeButton = panel.querySelector('#homeWake');
    exitButton.onclick = leave;
    panel.querySelectorAll('[data-home-bed]').forEach(button => button.onclick = () => sleepInBed(Number(button.dataset.homeBed)));
    wakeButton.onclick = wake;
    // Blank parts of the header/footer also count as a wake-up tap.
    panel.addEventListener('pointerup', e => { if (sleeping && !e.target.closest('button')) wake(); });
    function status(text) { note.textContent = text; wakeButton.hidden = !sleeping; }
    function makeCharacter(source, rig) {
      const copy = source.clone(true), map = new Map(), originals = [], clones = [];
      source.traverse(o => originals.push(o)); copy.traverse(o => clones.push(o)); originals.forEach((o, i) => map.set(o, clones[i]));
      copy.position.set(0, .08, 1); copy.rotation.set(0, 0, 0); copy.visible = true;
      const c = { root: copy, body: map.get(rig.body), head: map.get(rig.head), legs: rig.legs.map(o => map.get(o)), arms: rig.arms.map(o => map.get(o)), eyes: [], closed: [], awake: true, t: 0 };
      c.body.position.set(0, 0, 0); c.body.rotation.set(0, 0, 0); c.head.rotation.set(0, 0, 0); c.legs.concat(c.arms).forEach(o => o.rotation.set(0, 0, 0));
      if (rig.shades && map.get(rig.shades)) map.get(rig.shades).visible = false;
      if (rig.book && map.get(rig.book)) map.get(rig.book).visible = false;
      c.head.children.forEach(o => { if (o.isMesh && o.geometry.type === 'SphereGeometry' && o.position.z > .52 && Math.abs(o.position.x) > .12 && Math.abs(o.position.x) < .29 && o.geometry.parameters.radius < .08) c.eyes.push(o); });
      [-1, 1].forEach(s => {
        const pts = [new T.Vector3(s * .20 - .07, -.045, .594), new T.Vector3(s * .20, -.071, .604), new T.Vector3(s * .20 + .07, -.045, .594)];
        const line = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, .013, 5, false), mat(0x443029)); line.visible = false; c.head.add(line); c.closed.push(line);
      });
      group.add(copy); return c;
    }
    function updateCharacters() {
      // Re-clone on entry so any clothing purchased outdoors is preserved.
      characters.forEach(c => { group.remove(c.root); c.closed.forEach(o => { o.geometry.dispose(); o.material.dispose(); }); }); characters = env.characters().map(x => makeCharacter(x.object, x.rig));
    }
    function poseEyes(c, closed) { c.eyes.forEach(o => o.visible = !closed); c.closed.forEach(o => o.visible = closed); }
    function stand(c, x, z) { c.rise = null; c.awake = true; c.root.position.set(x, .08, z); c.root.rotation.set(0, 0, 0); poseEyes(c, false); c.legs.concat(c.arms).forEach(o => o.rotation.set(0, 0, 0)); }
    function rise(c, x, z) {
      const from = c.root.position.clone(), rotation = c.root.quaternion.clone();
      stand(c, x, z); c.rise = { from, rotation, to: c.root.position.clone(), t: 0 };
      c.root.position.copy(from); c.root.quaternion.copy(rotation);
    }
    function lie(c, bedIndex) { c.rise = null; c.awake = false; c.root.position.set(bedXs[bedIndex], 1.04, -1.58); c.root.rotation.set(-Math.PI / 2, 0, 0); poseEyes(c, true); c.legs.concat(c.arms).forEach(o => o.rotation.set(0, 0, 0)); }
    function sleepInBed(index) {
      if (!open || transitioning) return;
      if (sleeping) { wake(); return; }
      selectedBed = index; sleeping = true; wakeTime = -1; target = null;
      lie(characters[0], index); lie(characters[1], 1 - index);
      blankets.forEach(o => o.position.y = .19);
      status('새근새근… 두 아이가 잠들었어요. 방 안을 톡 누르면 일어나요.');
    }
    function wake() {
      if (!open || !sleeping || transitioning) return;
      sleeping = false; wakeTime = 0; target = null;
      rise(characters[0], bedXs[selectedBed], -.10); blankets[selectedBed].position.y = 0;
      status('잘 잤어요! 여자아이도 곧 일어나요.');
    }
    function enter(options = {}) {
      if (open) return;
      env.beforeEnter(); owner = env.capture(); returnFocus = document.activeElement;
      updateCharacters(); open = true; sleeping = false; elapsed = 0; wakeTime = -1; target = null; transitioning = false;
      hiddenHud = [];
      document.querySelectorAll('#app > *').forEach(el => { if (['c', 'cozyHome', 'toast', 'load'].includes(el.id) || el.tagName === 'SCRIPT') return; hiddenHud.push([el, el.style.visibility]); el.style.visibility = 'hidden'; });
      panel.hidden = false; document.body.classList.add('inside-cozy-home'); env.setInside(true); env.canvas.setAttribute('aria-label', '집 내부. 침대를 누르면 잠들고, 방문을 누르면 밖으로 나가요.');
      stand(characters[0], -.7, 1.4); stand(characters[1], .7, 1.7); blankets.forEach(o => o.position.y = 0);
      status('넓은 우리 방에 어서 와요. 바닥을 누르면 걷고, 침대를 누르면 잠들어요.');
      lastNight = null; setLighting(); resize();
      if (options.sleeping) sleepInBed(0);
      exitButton.focus({ preventScroll: true });
    }
    function leave() {
      if (!open) return;
      open = false; keys.clear(); down.clear(); panel.hidden = true; document.body.classList.remove('inside-cozy-home');
      hiddenHud.forEach(([el, visibility]) => el.style.visibility = visibility); hiddenHud = [];
      env.canvas.removeAttribute('aria-label'); env.setInside(false); env.onExit(owner); owner = null;
      if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    }
    function resize() {
      camera.aspect = innerWidth / innerHeight;
      const center = new T.Vector3(0, 1.65, -.2), direction = new T.Vector3(12, 13, 19).normalize();
      // Solve all room corners in the camera basis, including their depth.
      // A fixed distance/aspect shortcut clips the near corners on narrow phones.
      const right = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), direction).normalize();
      const up = new T.Vector3().crossVectors(direction, right).normalize();
      const tanY = Math.tan(camera.fov * Math.PI / 360) * .76, tanX = Math.tan(camera.fov * Math.PI / 360) * camera.aspect * .92;
      let fit = 20;
      for (const x of [-7.3, 7.3]) for (const y of [-.5, 6.25]) for (const z of [-6.3, 6.3]) {
        const p = new T.Vector3(x, y, z).sub(center), depth = p.dot(direction);
        fit = Math.max(fit, depth + Math.abs(p.dot(right)) / tanX, depth + Math.abs(p.dot(up)) / tanY);
      }
      camera.position.copy(center).addScaledVector(direction, fit); camera.lookAt(center); camera.updateProjectionMatrix();
    }
    function setLighting() {
      const night = env.isNight(); if (night === lastNight) return; lastNight = night;
      ambient.intensity = night ? .62 : 1.05; lamp.intensity = night ? .95 : .60; bedsideLight.intensity = night ? .65 : .2; fill.intensity = night ? .30 : .7;
      skyMat.color.setHex(night ? 0x162548 : 0x8bc9d9); moon.visible = moonHalo.visible = stars.visible = night;
      note.dataset.night = night ? 'true' : 'false';
    }
    const ray = new T.Raycaster(), mouse = new T.Vector2(), down = new Map();
    const floorPlane = new T.Plane(new T.Vector3(0, 1, 0), -.08);
    function blocked(x, z) {
      return beds.some(g => Math.abs(x - g.position.x) < 1.35 && z > -4.75 && z < -.42) || (x > 3.3 && z < -2.7) || (x > 4.2 && Math.abs(z) < 1.65);
    }
    function groundGoal(point) {
      const p = new T.Vector3(T.MathUtils.clamp(point.x, -6.0, 6), .08, T.MathUtils.clamp(point.z, -5.0, 5.3));
      if (!blocked(p.x, p.z)) target = p;
    }
    env.canvas.addEventListener('pointerdown', e => { if (!open) return; e.stopImmediatePropagation(); if (e.button !== 0) return; down.set(e.pointerId, [e.clientX, e.clientY]); try { env.canvas.setPointerCapture(e.pointerId); } catch (_) {} }, true);
    env.canvas.addEventListener('pointermove', e => { if (open) e.stopImmediatePropagation(); }, true);
    env.canvas.addEventListener('pointercancel', e => { down.delete(e.pointerId); }, true);
    env.canvas.addEventListener('pointerup', e => {
      if (!open) return; e.stopImmediatePropagation(); const start = down.get(e.pointerId); down.delete(e.pointerId);
      if (!start || Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 12) return;
      mouse.set(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1); ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects([door, ...beds], true)[0]; let hitDoor = false, bedIndex = -1;
      if (hit) { let o = hit.object; while (o && o !== group) { if (o === door) hitDoor = true; const i = beds.indexOf(o); if (i >= 0) bedIndex = i; o = o.parent; } }
      if (hitDoor) { leave(); return; }
      if (sleeping) { wake(); return; }
      if (bedIndex >= 0) { sleepInBed(bedIndex); return; }
      const p = new T.Vector3(); if (ray.ray.intersectPlane(floorPlane, p)) groundGoal(p);
    }, true);
    env.canvas.addEventListener('wheel', e => { if (open) { e.preventDefault(); e.stopImmediatePropagation(); } }, { capture: true, passive: false });
    const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
    const keys = new Set();
    addEventListener('keydown', e => {
      if (!open) return; e.stopImmediatePropagation();
      const key = e.key.toLowerCase();
      if (key === 'escape') { e.preventDefault(); leave(); return; }
      if (key === 'tab') { const buttons = [...panel.querySelectorAll('button')].filter(b => !b.hidden); const i = buttons.indexOf(document.activeElement); e.preventDefault(); buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus(); return; }
      if (movementKeys.has(key) || key === ' ') { e.preventDefault(); if (sleeping) wake(); if (movementKeys.has(key)) { keys.add(key); target = null; } }
    }, true);
    addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); if (open) e.stopImmediatePropagation(); }, true);
    addEventListener('blur', () => { keys.clear(); down.clear(); });
    addEventListener('resize', resize);
    function move(c, goal, dt, speed) {
      const d = goal.clone().sub(c.root.position); d.y = 0; const length = d.length();
      if (length < .09) return false;
      d.multiplyScalar(Math.min(speed * dt, length) / length);
      const x = c.root.position.x + d.x, z = c.root.position.z + d.z;
      let moved = false;
      if (!blocked(x, z)) { c.root.position.x = x; c.root.position.z = z; moved = true; }
      else { if (!blocked(x, c.root.position.z)) { c.root.position.x = x; moved = true; } if (!blocked(c.root.position.x, z)) { c.root.position.z = z; moved = true; } }
      if (moved) { const a = Math.atan2(d.x, d.z); c.root.rotation.y += Math.atan2(Math.sin(a - c.root.rotation.y), Math.cos(a - c.root.rotation.y)) * Math.min(1, dt * 8); }
      return moved;
    }
    const sleepingSymbols = [];
    const zz = document.createElement('canvas'); zz.width = 128; zz.height = 128; const zc = zz.getContext('2d'); zc.fillStyle = '#ffe9b8'; zc.font = '700 82px sans-serif'; zc.fillText('z', 40, 88);
    const ztex = new T.CanvasTexture(zz);
    for (let i = 0; i < 6; i++) { const o = new T.Sprite(new T.SpriteMaterial({ map: ztex, transparent: true, depthWrite: false })); o.scale.set(.4, .4, 1); group.add(o); sleepingSymbols.push(o); }
    const api = {
      enter, leave, wake, sleep: sleepInBed, resize,
      tick(dt) {
        if (!open) return; elapsed += dt; setLighting();
        if (wakeTime >= 0) { wakeTime += dt; if (wakeTime >= .8 && !characters[1].awake) { rise(characters[1], bedXs[1 - selectedBed], -.1); blankets[1 - selectedBed].position.y = 0; status('같이 놀아요. 여자아이가 남자아이 곁을 맴돌아요.'); } }
        const boy = characters[0], girl = characters[1];
        const ix = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
        const iz = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
        let moving = false;
        if (!sleeping && !boy.rise) {
          if (ix || iz) { const delta = new T.Vector3(ix, 0, iz).normalize(); const dest = boy.root.position.clone().addScaledVector(delta, .4); dest.x = T.MathUtils.clamp(dest.x, -6, 6); dest.z = T.MathUtils.clamp(dest.z, -5, 5.3); moving = move(boy, dest, dt, 2.4); }
          else if (target) { moving = move(boy, target, dt, 2.4); if (boy.root.position.distanceTo(target) < .12 || !moving) target = null; }
        }
        let girlMoving = false;
        if (!sleeping && girl.awake && !girl.rise) {
          const a = elapsed * .65, goal = boy.root.position.clone().add(new T.Vector3(Math.cos(a) * 1.16, 0, Math.sin(a) * .85));
          goal.x = T.MathUtils.clamp(goal.x, -5.9, 5.9); goal.z = T.MathUtils.clamp(goal.z, -5, 5.2);
          if (blocked(goal.x, goal.z)) goal.z = .1;
          girlMoving = move(girl, goal, dt, 2.65);
        }
        characters.forEach((c, i) => {
          if (c.rise) {
            const r = c.rise; r.t += dt; const u = Math.min(1, r.t / .65), e = u * u * (3 - 2 * u);
            c.root.position.lerpVectors(r.from, r.to, e); c.root.position.y += Math.sin(u * Math.PI) * .22;
            c.root.quaternion.copy(r.rotation).slerp(new T.Quaternion(), e); c.body.position.y = 0;
            if (u >= 1) c.rise = null; return;
          }
          if (!c.awake) { c.root.position.y = 1.04 + Math.sin(elapsed * 1.7 + i) * .018; c.body.position.y = 0; return; }
          const mv = i ? girlMoving : moving; const wave = Math.sin(elapsed * 9 + i) * (mv ? .55 : 0);
          c.legs[0].rotation.x = wave; c.legs[1].rotation.x = -wave; c.arms[0].rotation.x = -wave * .7; c.arms[1].rotation.x = wave * .7; c.body.position.y = mv ? Math.abs(wave) * .065 : Math.sin(elapsed * 2) * .012;
        });
        sleepingSymbols.forEach((o, i) => { const c = characters[Math.floor(i / 3)], u = (elapsed * .28 + (i % 3) / 3) % 1; o.visible = !c.awake; const bi = Math.floor(i / 3) ? 1 - selectedBed : selectedBed; o.position.set(bedXs[bi] + .5 + u * .3, 1.8 + u * 1.25, -3.30); o.material.opacity = Math.sin(u * Math.PI) * .75; o.scale.setScalar(.25 + u * .16); });
        stars.children.forEach((o, i) => o.scale.setScalar(.75 + .25 * Math.sin(elapsed * 1.4 + i)));
      },
      render(renderer) { renderer.clear(); renderer.render(room, camera); },
      get isOpen() { return open; },
      get state() { return { open, sleeping, selectedBed, girlAwake: characters[1]?.awake, boyAwake: characters[0]?.awake, night: lastNight, characters: characters.map(c => ({ awake: c.awake, position: c.root.position.toArray(), eyesClosed: c.closed.every(o => o.visible) })) }; },
      // Read-only scene coordinates are also useful for keyboard/accessibility adapters.
      screenPoint(kind, index = 0) { const o = kind === 'door' ? door : kind === 'bed' ? beds[index] : group; const p = o.getWorldPosition(new T.Vector3()); if (kind === 'door') p.y += 1.4; if (kind === 'bed') p.y += 1; if (kind === 'floor') p.set(0, .08, 2); p.project(camera); return { x: (p.x + 1) * innerWidth / 2, y: (1 - p.y) * innerHeight / 2 }; }
    };
    global.YunseulHome.active = api;
    return api;
  }
  global.YunseulHome = { skyTiming: SKY, isBedtime, chooseSite, buildExterior, makeMeteors, createRoom };
})(window);

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------
   Sangeluce Noctis Ame — procedural perfume bottle
   Built entirely in code (no external model file).
------------------------------------------------------------------- */

const stage = document.getElementById('perfume-stage');
if (!stage) throw new Error('perfume-stage container missing');

// ---------- Renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const LOOK_Y = 2.15;
camera.position.set(0, 2.6, 10.5);
camera.lookAt(0, LOOK_Y, 0);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const key = new THREE.SpotLight(0xffe2b8, 60, 30, Math.PI / 6, 0.6, 1.5);
key.position.set(-4, 7, 6);
key.target.position.set(0, 2, 0);
scene.add(key, key.target);

const rim = new THREE.PointLight(0xff2a3a, 25, 20, 1.6);
rim.position.set(3.5, 3.5, -3);
scene.add(rim);

// Gold light that follows the cursor
const cursorLight = new THREE.PointLight(0xd4af37, 18, 14, 1.6);
cursorLight.position.set(0, 3, 4);
scene.add(cursorLight);

// ---------- Texture helpers ----------
await Promise.all([
  document.fonts.load('600 80px "Playfair Display"'),
  document.fonts.load('500 40px "Montserrat"'),
]).catch(() => {});

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// Draws the label artwork. mode = 'color' | 'metal'
function drawLabel(ctx, W, H, mode) {
  const gold = mode === 'color' ? '#d9a650' : '#ffffff';

  if (mode === 'color') {
    // Deep marbled red glass
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#4a0309');
    g.addColorStop(0.5, '#7a0a14');
    g.addColorStop(1, '#3a0207');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Wavy streaks (lacquered wood / marble feel)
    for (let i = 0; i < 260; i++) {
      const y0 = Math.random() * H;
      const amp = 6 + Math.random() * 22;
      const freq = 0.004 + Math.random() * 0.01;
      const light = Math.random() > 0.55;
      ctx.strokeStyle = light
        ? `rgba(200, 40, 50, ${0.05 + Math.random() * 0.12})`
        : `rgba(20, 0, 3, ${0.08 + Math.random() * 0.18})`;
      ctx.lineWidth = 1 + Math.random() * 5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const y = y0 + Math.sin(x * freq + i) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
  }

  // Label is centred at u = 0.5 (mesh is rotated so this faces the camera)
  const cx = W / 2;
  ctx.fillStyle = gold;
  ctx.strokeStyle = gold;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Lathe UVs stretch horizontally — compensate so letters keep proportion
  const sx = 1.3;
  const text = (str, y, size, weight, family, spacing = 0) => {
    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(sx, 1);
    ctx.font = `${weight} ${size}px ${family}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(str, 0, 0);
    ctx.restore();
  };

  // Gold collar band at the shoulder
  ctx.fillRect(0, 30, W, 6);
  ctx.fillRect(0, 44, W, 2);

  text('SÂNGELUCE', 250, 66, 600, '"Playfair Display", serif', 4);
  text('NOCTIS', 330, 66, 600, '"Playfair Display", serif', 4);
  text('ÂME', 410, 66, 600, '"Playfair Display", serif', 4);

  // Emblem: filigree diamond with a ruby centre
  ctx.save();
  ctx.translate(cx, 540);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -60); ctx.lineTo(34, 0); ctx.lineTo(0, 60); ctx.lineTo(-34, 0); ctx.closePath();
  ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 34, 0);
    ctx.bezierCurveTo(s * 70, -30, s * 110, 10, s * 80, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 34, 0);
    ctx.bezierCurveTo(s * 60, 30, s * 90, -10, s * 70, -40);
    ctx.stroke();
  }
  if (mode === 'color') {
    ctx.fillStyle = '#b3001b';
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gold;
  }
  ctx.restore();

  text('EXTRAIT', 760, 40, 500, '"Playfair Display", serif', 6);
  text('DE PARFUM', 810, 40, 500, '"Playfair Display", serif', 6);
}

function labelTextures() {
  const W = 2048, H = 1024;
  const [cc, cctx] = makeCanvas(W, H);
  drawLabel(cctx, W, H, 'color');
  const [mc, mctx] = makeCanvas(W, H);
  drawLabel(mctx, W, H, 'metal');

  const map = new THREE.CanvasTexture(cc);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const metal = new THREE.CanvasTexture(mc);
  return { map, metal };
}

// Filigree bump texture for gold parts
function filigreeTexture() {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 500; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? '#ffffff' : '#202020';
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    const x = Math.random() * 512, y = Math.random() * 512, r = 4 + Math.random() * 18;
    ctx.arc(x, y, r, Math.random() * 6, Math.random() * 6 + 2);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

// ---------- Materials ----------
const { map: labelMap, metal: labelMetal } = labelTextures();
const filigree = filigreeTexture();

const MAT = {
  body: new THREE.MeshPhysicalMaterial({
    map: labelMap,
    metalnessMap: labelMetal,
    metalness: 1,            // scaled by map: only gold print is metallic
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  }),
  gold: new THREE.MeshStandardMaterial({
    color: 0xc98f3c, metalness: 1, roughness: 0.32,
    bumpMap: filigree, bumpScale: 1.2,
  }),
  goldSmooth: new THREE.MeshStandardMaterial({ color: 0xd4a24c, metalness: 1, roughness: 0.18 }),
  lacquer: new THREE.MeshPhysicalMaterial({
    color: 0x070606, metalness: 0.2, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.03,
  }),
  silver: new THREE.MeshStandardMaterial({ color: 0xe8e2da, metalness: 0.9, roughness: 0.12 }),
  ruby: new THREE.MeshPhysicalMaterial({
    color: 0x9a0014, emissive: 0x2a0004, metalness: 0.1, roughness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0, ior: 1.77,
  }),
};

// ---------- Geometry ----------
const bottle = new THREE.Group();

// Pedestal
const PED_H = 0.26;
const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.2, PED_H, 96), MAT.lacquer);
pedestal.position.y = PED_H / 2;
const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.06, 0.04, 96), MAT.silver);
pedTop.position.y = PED_H + 0.02;
const pedRim = new THREE.Mesh(new THREE.TorusGeometry(1.155, 0.018, 12, 128), MAT.goldSmooth);
pedRim.rotation.x = Math.PI / 2;
pedRim.position.y = PED_H;
bottle.add(pedestal, pedTop, pedRim);

// Body — tapered amphora via lathe
const BODY_BASE = PED_H + 0.04;
const BODY_H = 2.2;
const NECK_R = 0.15;
function bodyRadius(t) {
  if (t < 0.82) return 0.2 + 0.44 * Math.pow(t / 0.82, 1.15);
  const s = (t - 0.82) / 0.18;
  return NECK_R + (0.64 - NECK_R) * Math.sqrt(Math.max(0, 1 - s * s));
}
const profile = [new THREE.Vector2(0, 0)];
const SAMPLES = 90;
for (let i = 0; i <= SAMPLES; i++) {
  const t = i / SAMPLES;
  profile.push(new THREE.Vector2(bodyRadius(t), t * BODY_H));
}
profile.push(new THREE.Vector2(0, BODY_H));
const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 160), MAT.body);
body.position.y = BODY_BASE;
body.rotation.y = Math.PI; // bring the label (u = 0.5) to the front
bottle.add(body);

// Neck stack
let y = BODY_BASE + BODY_H - 0.02;
function addRing(r, tube, mat) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 96), mat);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  bottle.add(m);
}
function addCyl(rTop, rBot, h, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 96), mat);
  m.position.y = y + h / 2;
  bottle.add(m);
  y += h;
}
addRing(0.17, 0.03, MAT.goldSmooth);
addCyl(0.15, 0.15, 0.1, MAT.lacquer);
addCyl(0.23, 0.23, 0.05, MAT.gold);
addRing(0.2, 0.025, MAT.goldSmooth);
addCyl(0.16, 0.16, 0.08, MAT.lacquer);
addCyl(0.24, 0.24, 0.04, MAT.goldSmooth);
addCyl(0.44, 0.22, 0.09, MAT.lacquer); // flared plate under the crown
const CAP_BASE = y;

// Crown cap — ornate gold "lamp"
const capPts = [
  [0, 0], [0.3, 0], [0.34, 0.06], [0.3, 0.14], [0.2, 0.22], [0.25, 0.3],
  [0.18, 0.38], [0.09, 0.46], [0.06, 0.56], [0.03, 0.63], [0, 0.66],
].map(([r, h]) => new THREE.Vector2(r, h));
const cap = new THREE.Mesh(new THREE.LatheGeometry(capPts, 96), MAT.gold);
cap.position.y = CAP_BASE;
bottle.add(cap);

const ruby = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 32), MAT.ruby);
ruby.scale.set(1, 1.25, 0.6);
ruby.position.set(0, CAP_BASE + 0.13, 0.31);
bottle.add(ruby);

// Curling horns on either side of the cap
for (const s of [-1, 1]) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(s * 0.28, CAP_BASE + 0.12, 0),
    new THREE.Vector3(s * 0.46, CAP_BASE + 0.16, 0),
    new THREE.Vector3(s * 0.52, CAP_BASE + 0.34, 0),
    new THREE.Vector3(s * 0.42, CAP_BASE + 0.5, 0),
  ]);
  bottle.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.032, 12), MAT.gold));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.12, 12), MAT.gold);
  tip.position.set(s * 0.39, CAP_BASE + 0.56, 0);
  tip.rotation.z = s * 0.5;
  bottle.add(tip);
}

// Crescent halo behind the crown
const R_OUT = 0.62, R_IN = 0.5, IN_OFF = -0.13;
const crescent = new THREE.Shape();
crescent.absarc(0, 0, R_OUT, -0.32, Math.PI + 0.32, false);
crescent.absarc(0, IN_OFF, R_IN, Math.PI + 0.12, -0.12, true);
const halo = new THREE.Mesh(
  new THREE.ExtrudeGeometry(crescent, {
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 64,
  }),
  MAT.gold
);
const HALO_Y = CAP_BASE + 0.82;
halo.position.set(0, HALO_Y, -0.1);
bottle.add(halo);

const haloDisc = new THREE.Mesh(new THREE.CircleGeometry(R_IN, 64), MAT.lacquer);
haloDisc.material = MAT.lacquer.clone();
haloDisc.material.side = THREE.DoubleSide;
haloDisc.position.set(0, HALO_Y + IN_OFF, -0.08);
bottle.add(haloDisc);

// Black lacquer handles — broad, flat sculpted blades (not round tubes).
// Sweeps a squared-off blade cross-section along a planar (XY) curve,
// with independent taper for in-plane width and front-to-back depth.
function sweepBlade(points, widthFn, depthFn, segs = 220, ring = 28) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const pos = [], idx = [];
  const T = new THREE.Vector3(), N = new THREE.Vector3();
  const sq = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const P = curve.getPointAt(t);
    curve.getTangentAt(t, T);
    N.set(-T.y, T.x, 0).normalize();
    const w = widthFn(t), d = depthFn(t);
    for (let j = 0; j < ring; j++) {
      const a = (j / ring) * Math.PI * 2;
      // Superellipse => flat faces with crisp, slightly rounded edges
      const cn = sq(Math.cos(a), 0.45) * w;
      const cb = sq(Math.sin(a), 0.45) * d;
      pos.push(P.x + N.x * cn, P.y + N.y * cn, P.z + cb);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < ring; j++) {
      const j1 = (j + 1) % ring;
      const a = i * ring + j, b = (i + 1) * ring + j;
      const c = (i + 1) * ring + j1, dd = i * ring + j1;
      idx.push(a, dd, b, b, dd, c);
    }
  }
  // End caps
  const capStart = pos.length / 3;
  const p0 = curve.getPointAt(0); pos.push(p0.x, p0.y, p0.z);
  const capEnd = capStart + 1;
  const p1 = curve.getPointAt(1); pos.push(p1.x, p1.y, p1.z);
  const last = segs * ring;
  for (let j = 0; j < ring; j++) {
    const j1 = (j + 1) % ring;
    idx.push(capStart, j1, j);
    idx.push(capEnd, last + j, last + j1);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const smooth = (a, b, t) => {
  const x = Math.min(Math.max((t - a) / (b - a), 0), 1);
  return x * x * (3 - 2 * x);
};

{
  const top = BODY_BASE + BODY_H;
  const BB = BODY_BASE;
  const V = (x, y) => new THREE.Vector3(x, y, 0);

  // Main blade: question-mark scroll off the shoulder, down the outside to the pedestal
  const mainGeo = sweepBlade(
    [
      V(0.44, top - 0.14),  // tucked into the shoulder (scroll end)
      V(0.5, top + 0.1),
      V(0.68, top + 0.3),
      V(0.9, top + 0.3),
      V(1.04, top + 0.08),
      V(1.02, top - 0.35),
      V(0.92, top - 0.85),
      V(0.86, BB + 0.95),
      V(0.93, BB + 0.45),
      V(0.94, PED_H + 0.07),
    ],
    (t) => 0.035 + 0.05 * smooth(0, 0.35, t) + 0.012 * smooth(0.7, 1, t),
    (t) => 0.05 + 0.1 * smooth(0, 0.25, t) - 0.02 * smooth(0.5, 1, t)
  );

  // Inner leaf strut: pointed tip at mid-body, S-sweep down to the pedestal
  const strutGeo = sweepBlade(
    [
      V(0.68, BB + 1.32),   // sharp leaf tip
      V(0.75, BB + 1.05),
      V(0.73, BB + 0.7),
      V(0.67, BB + 0.38),
      V(0.72, PED_H + 0.07),
    ],
    (t) => 0.004 + 0.052 * smooth(0, 0.45, t),
    (t) => 0.01 + 0.1 * smooth(0, 0.35, t),
    140
  );

  // Sculpted foot pad that both blades plant into
  const footGeo = new THREE.CylinderGeometry(0.17, 0.2, 0.07, 48);

  for (const s of [-1, 1]) {
    const main = new THREE.Mesh(mainGeo, MAT.lacquer);
    const strut = new THREE.Mesh(strutGeo, MAT.lacquer);
    const foot = new THREE.Mesh(footGeo, MAT.lacquer);
    foot.scale.set(1.35, 1, 1);
    foot.position.set(0.83, PED_H + 0.075, 0);
    // Mirror for the left side (three.js flips face winding for negative scale)
    for (const m of [main, strut]) m.scale.x = s;
    foot.position.x *= s;
    bottle.add(main, strut, foot);
  }
}

scene.add(bottle);

// ---------- Sizing ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Pull back on narrow screens so the whole bottle stays in frame
  camera.position.z = w / h < 0.75 ? 13 : 10.5;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

// ---------- Interaction ----------
const pointer = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
});

const clock = new THREE.Clock();
let idleSpin = 0;
const INTRO = 2.2;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  idleSpin += dt * 0.12;

  // Mouse "rolls" the bottle around its axis and tilts it gently
  const targetY = idleSpin + pointer.x * Math.PI * 0.85;
  const targetX = pointer.y * 0.12;
  bottle.rotation.y += (targetY - bottle.rotation.y) * 0.05;
  bottle.rotation.x += (targetX - bottle.rotation.x) * 0.05;
  bottle.position.y = Math.sin(t * 1.1) * 0.05;

  // Intro: rise and spin in
  const p = Math.min(t / INTRO, 1);
  const e = easeOutCubic(p);
  bottle.scale.setScalar(0.6 + 0.4 * e);
  bottle.position.y += (1 - e) * -1.2;
  bottle.rotation.y += (1 - e) * 0.25;

  cursorLight.position.set(pointer.x * 4, LOOK_Y - pointer.y * 3, 4);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

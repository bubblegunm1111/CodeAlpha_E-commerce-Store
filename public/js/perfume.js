import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ------------------------------------------------------------------
   SYS Royal Essence — "Midnight" crown flacon
   Faceted ruby-glass body + jewelled gold crown cap.
   Built entirely in code (no external model file).
------------------------------------------------------------------- */

const stage = document.getElementById('perfume-stage');
if (!stage) throw new Error('perfume-stage container missing');

// ---------- Renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const LOOK_Y = 1.8;
camera.position.set(0, 2.3, 10.5);
camera.lookAt(0, LOOK_Y, 0);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight(0xffffff, 0.18));

const key = new THREE.SpotLight(0xffe2b8, 70, 30, Math.PI / 6, 0.6, 1.5);
key.position.set(-4, 7, 6);
key.target.position.set(0, 2, 0);
scene.add(key, key.target);

const rim = new THREE.PointLight(0xff2a3a, 30, 20, 1.6);
rim.position.set(3.5, 3.5, -3);
scene.add(rim);

// Red glow from behind so the glass reads as lit-through ruby
const back = new THREE.PointLight(0xff1a2a, 22, 12, 1.5);
back.position.set(0, 1.4, -2.2);
scene.add(back);

// Gold light that follows the cursor
const cursorLight = new THREE.PointLight(0xd4af37, 20, 14, 1.6);
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

// Front label artwork. mode = 'color' | 'metal'
function drawLabel(ctx, W, H, mode) {
  const gold = mode === 'color' ? '#d9a650' : '#ffffff';

  if (mode === 'color') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2a0207');
    g.addColorStop(0.5, '#4d0611');
    g.addColorStop(1, '#1f0105');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Soft vignette for depth
    const v = ctx.createRadialGradient(W / 2, H * 0.45, W * 0.1, W / 2, H / 2, W * 0.9);
    v.addColorStop(0, 'rgba(160, 20, 35, 0.25)');
    v.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = gold;
  ctx.strokeStyle = gold;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = W / 2;

  // Double gold frame
  ctx.lineWidth = 8;
  ctx.strokeRect(22, 22, W - 44, H - 44);
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  const text = (str, y, size, weight, family, spacing = 0) => {
    ctx.save();
    ctx.font = `${weight} ${size}px ${family}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(str, cx, y);
    ctx.restore();
  };

  // Monogram: tiny crown above an italic "S"
  ctx.save();
  ctx.translate(cx, 250);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-60, 30); ctx.lineTo(-70, -25); ctx.lineTo(-30, 5);
  ctx.lineTo(0, -40); ctx.lineTo(30, 5); ctx.lineTo(70, -25); ctx.lineTo(60, 30);
  ctx.closePath();
  ctx.stroke();
  for (const x of [-70, 0, 70]) {
    ctx.beginPath(); ctx.arc(x, x === 0 ? -50 : -33, 8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  text('S', 410, 230, 'italic 500', '"Playfair Display", serif');

  text('SYS ROYAL', 640, 92, 600, '"Playfair Display", serif', 16);
  text('ESSENCE', 740, 46, 500, '"Montserrat", sans-serif', 26);

  // Divider with diamond
  ctx.fillRect(cx - 220, 850, 180, 2);
  ctx.fillRect(cx + 40, 850, 180, 2);
  ctx.save();
  ctx.translate(cx, 851);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-9, -9, 18, 18);
  ctx.restore();

  text('MIDNIGHT', 1170, 82, 600, '"Playfair Display", serif', 14);
  text('100 ML', 1300, 32, 500, '"Montserrat", sans-serif', 10);
  text('EAU DE PARFUM', 1350, 32, 500, '"Montserrat", sans-serif', 10);
}

function labelTextures() {
  const W = 1024, H = 1600;
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

// Engraved filigree bump for the crown band
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
  t.repeat.set(4, 1);
  return t;
}

// Soft contact shadow under the bottle
function shadowTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.7)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ---------- Materials ----------
const { map: labelMap, metal: labelMetal } = labelTextures();
const filigree = filigreeTexture();

const MAT = {
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xff4050,
    metalness: 0,
    roughness: 0.04,
    transmission: 1,
    thickness: 0.6,
    ior: 1.52,
    attenuationColor: new THREE.Color(0x8a0614),
    attenuationDistance: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    specularIntensity: 1,
  }),
  liquid: new THREE.MeshPhysicalMaterial({
    color: 0x7a0612,
    emissive: 0x2a0005,
    metalness: 0,
    roughness: 0.18,
    clearcoat: 0.6,
  }),
  label: new THREE.MeshPhysicalMaterial({
    map: labelMap,
    metalnessMap: labelMetal,
    metalness: 1,            // scaled by map: only gold print is metallic
    roughness: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }),
  gold: new THREE.MeshStandardMaterial({
    color: 0xc98f3c, metalness: 1, roughness: 0.3,
    bumpMap: filigree, bumpScale: 1.1,
  }),
  goldSmooth: new THREE.MeshStandardMaterial({ color: 0xd8a64e, metalness: 1, roughness: 0.16 }),
  onyx: new THREE.MeshPhysicalMaterial({
    color: 0x050304, metalness: 0.1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.02,
  }),
};

// ---------- Geometry ----------
const bottle = new THREE.Group();

// Rectangle with faceted (two-cut) corners — the flacon's cross-section
function facetedRect(w, d, c) {
  const hw = w / 2, hd = d / 2, k = Math.SQRT1_2;
  const s = new THREE.Shape();
  const corner = (sx, sy) => [
    [sx * hw, sy * (hd - c)],
    [sx * (hw - c + c * k), sy * (hd - c + c * k)],
    [sx * (hw - c), sy * hd],
  ];
  const tr = corner(1, 1), tl = corner(-1, 1).reverse();
  const bl = corner(-1, -1), br = corner(1, -1).reverse();
  const pts = [...tr, ...tl, ...bl, ...br];
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

// Extrude a cross-section upward (Y) from `y0` with height `h`
function prism(shape, h, y0, mat, bevel = 0) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: h - bevel * 2,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 1,
  });
  g.rotateX(-Math.PI / 2);     // extrusion axis Z -> Y
  g.translate(0, y0 + bevel, 0);
  const m = new THREE.Mesh(g, mat);
  bottle.add(m);
  return m;
}

// Body
const BODY_W = 1.5, BODY_D = 0.82, BODY_C = 0.2, BODY_H = 2.3, BEVEL = 0.03;
prism(facetedRect(BODY_W, BODY_D, BODY_C), BODY_H, 0, MAT.glass, BEVEL);

// Liquid inside — thick glass base, small air gap at the top
const GLASS_BASE = 0.26;
prism(
  facetedRect(BODY_W - 0.18, BODY_D - 0.18, BODY_C - 0.06),
  BODY_H - GLASS_BASE - 0.16, GLASS_BASE, MAT.liquid
);

// Recessed label on the front face
const LABEL_W = 0.92, LABEL_H = 1.44;
const label = new THREE.Mesh(new THREE.PlaneGeometry(LABEL_W, LABEL_H), MAT.label);
label.position.set(0, BODY_H * 0.52, BODY_D / 2 + BEVEL + 0.003);
bottle.add(label);
// Fine gold frame around the label panel
{
  const fr = new THREE.Shape();
  const ow = LABEL_W / 2 + 0.03, oh = LABEL_H / 2 + 0.03;
  fr.moveTo(-ow, -oh); fr.lineTo(ow, -oh); fr.lineTo(ow, oh); fr.lineTo(-ow, oh); fr.closePath();
  const hole = new THREE.Path();
  const iw = LABEL_W / 2, ih = LABEL_H / 2;
  hole.moveTo(-iw, -ih); hole.lineTo(-iw, ih); hole.lineTo(iw, ih); hole.lineTo(iw, -ih); hole.closePath();
  fr.holes.push(hole);
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(fr, { depth: 0.012, bevelEnabled: false }),
    MAT.goldSmooth
  );
  frame.position.set(0, label.position.y, label.position.z - 0.004);
  bottle.add(frame);
}

// Stepped glass shoulders
let y = BODY_H;
const SH1 = 0.12, SH2 = 0.1;
prism(facetedRect(BODY_W * 0.84, BODY_D * 0.86, BODY_C * 0.8), SH1, y - 0.01, MAT.glass, 0.02);
y += SH1 - 0.01;
prism(facetedRect(BODY_W * 0.62, BODY_D * 0.72, BODY_C * 0.6), SH2, y - 0.01, MAT.glass, 0.02);
y += SH2 - 0.01;

// ---------- Crown cap ----------
function addMesh(geo, mat, px = 0, py = 0, pz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(px, py, pz);
  bottle.add(m);
  return m;
}
function ring(r, tube, py) {
  const m = addMesh(new THREE.TorusGeometry(r, tube, 16, 96), MAT.goldSmooth, 0, py, 0);
  m.rotation.x = Math.PI / 2;
  return m;
}

// Neck collar
const COLLAR_H = 0.07;
addMesh(new THREE.CylinderGeometry(0.34, 0.38, COLLAR_H, 64), MAT.goldSmooth, 0, y + COLLAR_H / 2, 0);
y += COLLAR_H;

// Engraved band
const BAND_H = 0.24, BAND_R_BOT = 0.4, BAND_R_TOP = 0.45;
addMesh(new THREE.CylinderGeometry(BAND_R_TOP, BAND_R_BOT, BAND_H, 96, 1, true), MAT.gold, 0, y + BAND_H / 2, 0);
ring(BAND_R_BOT + 0.01, 0.028, y + 0.01);
ring(BAND_R_TOP, 0.026, y + BAND_H);

// Jewels and studs around the band
{
  const jewelGeo = new THREE.SphereGeometry(0.06, 32, 24);
  const bezelGeo = new THREE.TorusGeometry(0.066, 0.012, 10, 40);
  const studGeo = new THREE.SphereGeometry(0.024, 16, 12);
  const midR = (BAND_R_BOT + BAND_R_TOP) / 2;
  const midY = y + BAND_H / 2;
  const out = new THREE.Vector3();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);

    const jewel = addMesh(jewelGeo, MAT.onyx, ca * (midR + 0.01), midY, sa * (midR + 0.01));
    jewel.scale.set(1, 1.35, 0.55);
    out.set(ca * 2, midY, sa * 2);
    jewel.lookAt(out);

    const bezel = addMesh(bezelGeo, MAT.goldSmooth, ca * (midR + 0.02), midY, sa * (midR + 0.02));
    bezel.scale.set(1, 1.35, 1);
    bezel.lookAt(out);

    const b = a + Math.PI / 8;
    for (const dy of [-0.055, 0.055]) {
      addMesh(studGeo, MAT.goldSmooth, Math.cos(b) * (midR + 0.012), midY + dy, Math.sin(b) * (midR + 0.012));
    }
  }
}
y += BAND_H;

// Crown points along the upper rim
{
  const spikeGeo = new THREE.ConeGeometry(0.03, 0.1, 12);
  const tipGeo = new THREE.SphereGeometry(0.018, 12, 10);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
    const r = BAND_R_TOP - 0.005;
    addMesh(spikeGeo, MAT.goldSmooth, Math.cos(a) * r, y + 0.06, Math.sin(a) * r);
    addMesh(tipGeo, MAT.goldSmooth, Math.cos(a) * r, y + 0.115, Math.sin(a) * r);
  }
}

// Black onyx dome, pinched into 8 lobes between the gold arches
const DOME_R = 0.41, DOME_SY = 1.15;
{
  const g = new THREE.SphereGeometry(DOME_R, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const f = 0.9 + 0.1 * Math.abs(Math.sin(4 * Math.atan2(z, x)));
    p.setX(i, x * f);
    p.setZ(i, z * f);
  }
  g.computeVertexNormals();
  const dome = addMesh(g, MAT.onyx, 0, y, 0);
  dome.scale.y = DOME_SY;
}

// Gold arches over the dome, studded with gold beads
{
  const archR = DOME_R * 0.9 + 0.02;
  const archH = DOME_R * DOME_SY + 0.02;
  const beadGeo = new THREE.SphereGeometry(0.026, 16, 12);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pts = [];
    for (let k = 0; k <= 12; k++) {
      const th = Math.PI / 2 - (k / 12) * (Math.PI / 2 - 0.1);
      pts.push(new THREE.Vector3(
        Math.cos(a) * archR * Math.sin(th),
        y + archH * Math.cos(th),
        Math.sin(a) * archR * Math.sin(th)
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    addMesh(new THREE.TubeGeometry(curve, 48, 0.026, 12), MAT.gold);
    for (const t of [0.18, 0.4, 0.62, 0.82]) {
      const pt = curve.getPointAt(t);
      const n = new THREE.Vector3(pt.x, 0, pt.z).normalize().multiplyScalar(0.02);
      addMesh(beadGeo, MAT.goldSmooth, pt.x + n.x, pt.y, pt.z + n.z);
    }
  }
  y += archH;
}

// Finial: collar, orb and cross
addMesh(new THREE.CylinderGeometry(0.07, 0.1, 0.05, 32), MAT.goldSmooth, 0, y + 0.01, 0);
addMesh(new THREE.SphereGeometry(0.075, 32, 24), MAT.goldSmooth, 0, y + 0.1, 0);
ring(0.077, 0.01, y + 0.1);
addMesh(new THREE.BoxGeometry(0.035, 0.17, 0.035), MAT.goldSmooth, 0, y + 0.25, 0);
addMesh(new THREE.BoxGeometry(0.12, 0.035, 0.035), MAT.goldSmooth, 0, y + 0.27, 0);

scene.add(bottle);

// Contact shadow (stays on the "floor" while the bottle floats)
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 1.6),
  new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -0.12;
scene.add(shadow);

// ---------- Sizing ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Pull back on narrow screens so the whole bottle stays in frame
  camera.position.z = w / h < 0.75 ? 12.5 : 10;
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

  shadow.material.opacity = e * (0.85 - Math.sin(t * 1.1) * 0.1);

  cursorLight.position.set(pointer.x * 4, LOOK_Y - pointer.y * 3, 4);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Het vliegtuig: een algemeen tweemotorig passagiersvliegtuig, in code getekend (schaal 1:10). Geen bestaand type, geen merk.
// GEMAAKT door scripts/maak_vliegtuig.py: niet met de hand bewerken. De weergave is gedeeld met app.js (de fiets).
import * as THREE from "/js/vendor/three.module.min.js";
import { mergeGeometries } from "/js/vendor/BufferGeometryUtils.js";
import { HDRLoader } from "/js/vendor/HDRLoader.js";
import * as STEM from "/js/stem.js";
import * as MIJN from "/js/mijn.js";
const KINDMODUS = location.pathname.replace(/\/$/, "") === "/kinderen/vliegtuig";
const params = new URLSearchParams(location.search);
const TAU = Math.PI * 2;
const HDR = "/modellen/studio_small_09_1k.hdr";
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

// ================= Renderer, licht =================
const doek = document.getElementById("doek");
const renderer = new THREE.WebGLRenderer({ canvas: doek, antialias: false, powerPreference: "high-performance" });
const DPR = Math.min(devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.setClearColor(0xffffff, 0);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
const zon = new THREE.DirectionalLight(0xffffff, 2.0);
zon.position.set(2.4, 9, 4.4); zon.castShadow = true; zon.shadow.mapSize.set(2048, 2048);
Object.assign(zon.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: 0.5, far: 16 });
zon.shadow.bias = -0.0006; zon.shadow.normalBias = 0.01; zon.shadow.radius = 4;
const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d6d1, 1.0); scene.add(zon, hemi);
{ // terugval-omgeving tot de HDR binnen is
  const kamer = new THREE.Scene();
  kamer.add(new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), new THREE.MeshBasicMaterial({ color: 0xa0a0a0, side: THREE.BackSide })));
  const l = new THREE.Mesh(new THREE.PlaneGeometry(12, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 5, 5) })); l.position.set(0, 4.9, 0); l.rotation.x = Math.PI / 2; kamer.add(l);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(kamer, 0.04).texture;
}
fetch(HDR).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status))).then(zetHDR).catch(() => {}); // ARTEFACT-HDR
function zetHDR(buf) {
  const d = new HDRLoader().parse(buf);
  const t = new THREE.DataTexture(d.data, d.width, d.height, THREE.RGBAFormat, d.type);
  t.colorSpace = THREE.LinearSRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping; t.flipY = true; t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(t).texture; t.dispose();
  scene.environmentRotation.set(0, 1.4, 0); vraag();
}
window.__zetHDR = zetHDR;
const grond = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.17 }));
grond.receiveShadow = true; scene.add(grond);

// ================= Materialen: "tekening" (wit papier) en "donker" (mat zwart, zoals in het voorbeeld) =================
const SOORT = {
  romp: [0xfbfbf9, { color: 0x2a2b2d, roughness: 0.4, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.2 }],
  klep: [0xe4e4e1, { color: 0x3a3c3f, roughness: 0.45, metalness: 0.3 }],
  raam: [0x55575a, { color: 0x0d0f11, roughness: 0.1, metalness: 0.4, clearcoat: 1 }],
  naad: [0xd2d2cf, { color: 0x232426, roughness: 0.4, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.2 }],
  stoel: [0xc4c9d1, { color: 0x3c4658, roughness: 0.8, metalness: 0 }],
  vloer: [0xe6e6e3, { color: 0x2a2b2d, roughness: 0.8, metalness: 0 }],
  roodlicht: [0xff8a8a, { color: 0xc8102e, roughness: 0.2, metalness: 0, emissive: 0xff2030, emissiveIntensity: 0 }],
  groenlicht: [0x8fe0a6, { color: 0x1d8a3a, roughness: 0.2, metalness: 0, emissive: 0x20ff60, emissiveIntensity: 0 }],
  witlicht: [0xffffff, { color: 0xffffff, roughness: 0.2, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0 }],
  frame: [0xfbfbf9, { color: 0x2a2b2d, roughness: 0.42, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25 }],
  velg: [0xe6e6e3, { color: 0x1d1e20, roughness: 0.35, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.15 }],
  carbon: [0xcfd0cd, { color: 0x1d1e20, roughness: 0.35, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.15 }],
  metaal: [0xe2e4e6, { color: 0xb9bdc1, roughness: 0.28, metalness: 0.95 }],
  schijf: [0xc8cacd, { color: 0xc9cdd1, roughness: 0.22, metalness: 1.0 }],
  spaak: [0x5f605d, { color: 0x2b2c2e, roughness: 0.4, metalness: 0.8 }],
  zwartmetaal: [0x9c9ea1, { color: 0x3a3c3f, roughness: 0.35, metalness: 0.8 }],
  ketting: [0x8f9296, { color: 0x6c7075, roughness: 0.3, metalness: 0.95 }],
  loopvlak: [0x6f6f6b, { color: 0x262626, roughness: 0.85, metalness: 0 }],
  wand: [0xdcc49c, { color: 0xc9a774, roughness: 0.75, metalness: 0 }],
  greep: [0xe2e2df, { color: 0x1a1a1a, roughness: 0.8, metalness: 0 }],
  rubber: [0xc6c6c2, { color: 0x1a1a1a, roughness: 0.8, metalness: 0 }],
  zadel: [0xb8b8b4, { color: 0x1c1c1c, roughness: 0.6, metalness: 0 }],
  lamp: [0xffffff, { color: 0xffffff, roughness: 0.1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0 }],
  achterlicht: [0xffffff, { color: 0xb3121f, roughness: 0.2, metalness: 0, emissive: 0xff1a2a, emissiveIntensity: 0 }],
  scherm: [0xf0f0f0, { color: 0x111418, roughness: 0.15, metalness: 0.2, emissive: 0x9fd3ff, emissiveIntensity: 0 }],
  cel: [0xf3c7cf, { color: 0x3d6fb3, roughness: 0.4, metalness: 0.3 }],
  karton: [0xe2d2b2, { color: 0xc9a77a, roughness: 0.9, metalness: 0 }],
  rood: [0xf0a7b3, { color: 0xc8102e, roughness: 0.5, metalness: 0 }],
};
const MAT = {};
for (const [k, [teken, donker]] of Object.entries(SOORT)) {
  MAT[k] = {
    teken: new THREE.MeshStandardMaterial({ color: teken, roughness: ["metaal", "schijf", "ketting", "zwartmetaal", "klep"].includes(k) ? 0.45 : 0.75, metalness: ["metaal", "schijf", "ketting"].includes(k) ? 0.35 : 0, envMapIntensity: 0.7, emissive: donker.emissive ?? 0x000000, emissiveIntensity: 0 }),
    donker: new THREE.MeshPhysicalMaterial({ ...donker }),
  };
}
const ACCENT = { teken: new THREE.Color(0xf3b7c0), donker: new THREE.Color(0xc8102e) };
const NORM_AAN = new THREE.MeshNormalMaterial({ opacity: 1 }), NORM_UIT = new THREE.MeshNormalMaterial({ opacity: 0.3 });

// ================= Bouwhulpjes =================
const meshes = [];
const DELEN = {}; // deel -> [meshes]
function mesh(geo, soort, deel, o = {}) {
  const m = new THREE.Mesh(geo, MAT[soort].teken);
  m.castShadow = o.schaduw !== false; m.receiveShadow = true;
  m.userData = { soort, deel };
  meshes.push(m); (DELEN[deel] ||= []).push(m);
  return m;
}
const groep = (...k) => { const g = new THREE.Group(); if (k.length) g.add(...k); return g; };
const op = (o, x, y, z) => (o.position.set(x, y, z), o);
// Een buis langs een kromme, met een doorsnede die per plek anders mag zijn: r(t) geeft [in het vlak, dwars].
function veeg(pts, r, o = {}) {
  const kromme = pts.isCurve ? pts : new THREE.CatmullRomCurve3(pts, !!o.dicht, "centripetal");
  const nS = o.seg ?? 48, nR = o.rond ?? 20, ref = o.ref ?? V(0, 0, 1);
  const pos = [], idx = [];
  for (let i = 0; i <= nS; i++) {
    const t = i / nS, P = kromme.getPointAt(t), T = kromme.getTangentAt(t);
    let rf = ref; if (Math.abs(T.dot(rf)) > 0.95) rf = V(0, 1, 0);
    const N = new THREE.Vector3().crossVectors(T, rf).normalize(), B = new THREE.Vector3().crossVectors(N, T).normalize();
    const [a, b] = typeof r === "function" ? r(t) : Array.isArray(r) ? r : [r, r];
    for (let j = 0; j < nR; j++) { const h = (j / nR) * TAU; pos.push(P.x + N.x * a * Math.cos(h) + B.x * b * Math.sin(h), P.y + N.y * a * Math.cos(h) + B.y * b * Math.sin(h), P.z + N.z * a * Math.cos(h) + B.z * b * Math.sin(h)); }
  }
  for (let i = 0; i < nS; i++) for (let j = 0; j < nR; j++) { const a = i * nR + j, b = i * nR + ((j + 1) % nR), c = a + nR, d = b + nR; idx.push(a, c, b, b, c, d); }
  if (!o.dicht && o.dop !== false) for (const [i0, s] of [[0, -1], [nS, 1]]) { // doppen
    const c = kromme.getPointAt(i0 / nS), ci = pos.length / 3; pos.push(c.x, c.y, c.z);
    for (let j = 0; j < nR; j++) { const a = i0 * nR + j, b = i0 * nR + ((j + 1) % nR); if (s < 0) idx.push(ci, b, a); else idx.push(ci, a, b); }
  }
  let g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g = g.toNonIndexed(); g.computeVertexNormals();
  // gladde normalen op de buis zelf, scherp bij de doppen: opnieuw indexeren met een kleine hoek
  return g;
}
function zacht(geo) { const m = mergeVerts(geo); m.computeVertexNormals(); return m; }
// geometrieën samenvoegen: alles zonder index, alleen positie en normaal
function samen(geos) { return mergeGeometries(geos.map((g) => { const n = g.index ? g.toNonIndexed() : g.clone(); for (const k of Object.keys(n.attributes)) if (k !== "position" && k !== "normal") n.deleteAttribute(k); if (!n.attributes.normal) n.computeVertexNormals(); return n; })); }
function mergeVerts(g) { // eenvoudige weld voor gladde normalen
  const p = g.attributes.position, map = new Map(), nieuw = [], idx = [];
  for (let i = 0; i < p.count; i++) { const k = `${p.getX(i).toFixed(5)},${p.getY(i).toFixed(5)},${p.getZ(i).toFixed(5)}`; let n = map.get(k); if (n === undefined) { n = nieuw.length / 3; map.set(k, n); nieuw.push(p.getX(i), p.getY(i), p.getZ(i)); } idx.push(n); }
  const o = new THREE.BufferGeometry(); o.setAttribute("position", new THREE.Float32BufferAttribute(nieuw, 3)); o.setIndex(idx); return o;
}
const buis = (pts, r, o) => zacht(veeg(pts, r, o));
function staaf(a, b, r, seg = 6) { const d = b.clone().sub(a), l = d.length(); const g = new THREE.CylinderGeometry(r, r, l, seg, 1, true); g.translate(0, l / 2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); g.translate(a.x, a.y, a.z); return g; }
function draai(profiel, seg = 72) { const g = new THREE.LatheGeometry(profiel.map(([r, y]) => new THREE.Vector2(r, y)), seg); g.rotateX(Math.PI / 2); return g; } // as langs z
function rondeDoos(x, y, z, r) {
  const s = new THREE.Shape(), hx = x / 2 - r, hy = y / 2 - r;
  s.moveTo(-hx, -y / 2); s.lineTo(hx, -y / 2); s.quadraticCurveTo(x / 2, -y / 2, x / 2, -hy); s.lineTo(x / 2, hy); s.quadraticCurveTo(x / 2, y / 2, hx, y / 2); s.lineTo(-hx, y / 2); s.quadraticCurveTo(-x / 2, y / 2, -x / 2, hy); s.lineTo(-x / 2, -hy); s.quadraticCurveTo(-x / 2, -y / 2, -hx, -y / 2);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.0005, z - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.9, bevelSegments: 4, curveSegments: 6 }); g.translate(0, 0, -(z - 2 * r) / 2); g.computeVertexNormals(); return g;
}
function tandwiel(T, dikte, gaten = 0, binnen = 0.4) { // T tanden, steek 12,7 mm (zoals een fietsketting)
  const r = (T * 0.0127) / TAU, h = 0.0045, s = new THREE.Shape();
  for (let i = 0; i < T; i++) {
    const a0 = (i / T) * TAU, p = (a, rr) => [Math.cos(a) * rr, Math.sin(a) * rr], st = TAU / T;
    if (i === 0) s.moveTo(...p(a0 - st * 0.18, r - h));
    s.quadraticCurveTo(...p(a0, r - h * 1.15), ...p(a0 + st * 0.18, r - h)); s.lineTo(...p(a0 + st * 0.36, r + h * 0.55)); s.lineTo(...p(a0 + st * 0.64, r + h * 0.55)); s.lineTo(...p(a0 + st * 0.82, r - h));
  }
  if (gaten) for (let k = 0; k < gaten; k++) { const a0 = (k / gaten) * TAU + 0.2, a1 = a0 + TAU / gaten - 0.55, r1 = r * binnen, r2 = r - 0.012, g = new THREE.Path(); g.absarc(0, 0, r2, a0, a1, false); g.absarc(0, 0, r1, a1, a0, true); s.holes.push(g); }
  else { const g = new THREE.Path(); g.absarc(0, 0, Math.min(0.012, r * 0.5), 0, TAU, true); s.holes.push(g); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: dikte, bevelEnabled: true, bevelThickness: 0.0004, bevelSize: 0.0004, bevelSegments: 1, curveSegments: 3 }); geo.translate(0, 0, -dikte / 2); geo.computeVertexNormals(); return geo;
}

// ================= Het vliegtuig (schaal 1:10 in meters; de neus wijst naar +x, rechts is +z) =================
// Een algemeen tweemotorig passagiersvliegtuig, zelf getekend. Geen bestaand type, geen merk.
const vliegtuig = new THREE.Group(); scene.add(vliegtuig);
const G = { draaien: [], wielen: [], kleppen: [], roer: null, lichten: {} };
const RR = 0.2, LANG = 3.8, X0 = -1.9, YM = 0.45; // straal van de romp, lengte, achterkant, hoogte van de as
const ruimte = (t) => t * t * (3 - 2 * t);
const NEUS = 0.86, STAART = 0.28;
const rompStraal = (t) => {
  if (t > NEUS) { const u = (t - NEUS) / (1 - NEUS); return Math.max(0.004, RR * Math.pow(Math.max(0, 1 - u ** 2.3), 0.56)); }
  if (t < STAART) return 0.018 + (RR - 0.018) * Math.pow(ruimte(t / STAART), 0.75);
  return RR;
};
// de bovenkant loopt bijna recht door naar de staart; de neus zakt iets omlaag
const rompY = (t) => YM + (t < STAART ? (RR - rompStraal(t)) * 0.8 : 0) - (t > NEUS ? 0.055 * ((t - NEUS) / (1 - NEUS)) ** 1.6 : 0);
const rompX = (t) => X0 + LANG * t;
// een punt op de romp: x langs de lengte, phi rond (0 = boven, + = rechts), off = iets naar buiten
function opRomp(x, phi, off = 0) { const t = THREE.MathUtils.clamp((x - X0) / LANG, 0, 1), r = rompStraal(t) + off; return V(x, rompY(t) + Math.cos(phi) * r * 1.04, Math.sin(phi) * r); }
// een stukje huid op de romp (raam, deur): een afgeronde vorm die precies op het oppervlak ligt
function huid(xc, phic, w, h, off = 0.0015, n = 4, rond = 4) {
  const pos = [], idx = [], ringen = 6, hoeken = 28, rc = rompStraal((xc - X0) / LANG);
  pos.push(...opRomp(xc, phic, off).toArray());
  for (let i = 1; i <= ringen; i++) for (let j = 0; j < hoeken; j++) {
    const a = (j / hoeken) * TAU, c = Math.cos(a), sn = Math.sin(a), ex = 2 / rond;
    const s = Math.sign(c) * Math.abs(c) ** ex, u = Math.sign(sn) * Math.abs(sn) ** ex, rho = i / ringen;
    pos.push(...opRomp(xc + s * rho * w / 2, phic + (u * rho * h / 2) / rc, off).toArray());
  }
  for (let j = 0; j < hoeken; j++) idx.push(0, 1 + j, 1 + ((j + 1) % hoeken));
  for (let i = 1; i < ringen; i++) for (let j = 0; j < hoeken; j++) { const a = 1 + (i - 1) * hoeken + j, b = 1 + (i - 1) * hoeken + ((j + 1) % hoeken), c2 = a + hoeken, d = b + hoeken; idx.push(a, c2, b, b, c2, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  // naar buiten gericht?
  const nrm = g.attributes.normal, mid = opRomp(xc, phic, 0).sub(V(xc, rompY((xc - X0) / LANG), 0));
  if (V(nrm.getX(0), nrm.getY(0), nrm.getZ(0)).dot(mid) < 0) { const ix = g.index.array; for (let q = 0; q < ix.length; q += 3) { const tmp = ix[q + 1]; ix[q + 1] = ix[q + 2]; ix[q + 2] = tmp; } g.computeVertexNormals(); }
  return g.toNonIndexed();
}
// ---- de romp
{
  const pts = Array.from({ length: 80 }, (_, i) => { const t = i / 79; return V(rompX(t), rompY(t), 0); });
  const romp = mesh(buis(pts, (t) => [rompStraal(t) * 1.04, rompStraal(t)], { seg: 220, rond: 56 }), "romp", "romp");
  romp.userData.romp = true;
  const phiRaam = Math.PI / 2 - 0.26, ramen = [];
  for (let x = -1.18; x <= 1.24; x += 0.074) for (const k of [1, -1]) ramen.push(huid(x, k * phiRaam, 0.028, 0.04, 0.0012, 4, 3.2));
  const deuren = [];
  for (const x of [1.33, -1.34]) for (const k of [1, -1]) deuren.push(huid(x, k * (Math.PI / 2 - 0.05), 0.085, 0.16, 0.0008, 4, 6));
  // vleugel-rompkap onder de vleugels
  const kap = mesh(new THREE.SphereGeometry(1, 48, 24).scale(0.66, 0.1, 0.212).translate(-0.06, YM - 0.15, 0), "romp", "romp");
  const ramenM = mesh(samen(ramen), "raam", "romp"), deurenM = mesh(samen(deuren), "naad", "romp");
  ramenM.userData.romp = deurenM.userData.romp = kap.userData.romp = true;
  vliegtuig.add(romp, ramenM, deurenM, kap);
  // cockpitruiten: zes ruiten in een band rond de neus
  const cr = [];
  for (const [phi, xc, w] of [[0.24, 1.7, 0.05], [-0.24, 1.7, 0.05], [0.66, 1.692, 0.052], [-0.66, 1.692, 0.052], [1.06, 1.676, 0.05], [-1.06, 1.676, 0.05]]) cr.push(huid(xc, phi, w, 0.058, 0.006, 4, 5));
  vliegtuig.add(mesh(samen(cr), "raam", "cockpit"));
}
// ---- een vleugelprofiel, uitgetrokken over doorsneden (NACA 4-cijfers, 2 procent welving)
function profiel(n = 30) {
  const p = [], m = 0.02, pp = 0.4;
  for (let i = 0; i <= n; i++) { const b = (i / n) * Math.PI, x = (1 - Math.cos(b)) / 2; p.push(x); }
  const pt = (x, onder) => { const yt = 5 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    const yc = x < pp ? (m / pp ** 2) * (2 * pp * x - x * x) : (m / (1 - pp) ** 2) * (1 - 2 * pp + 2 * pp * x - x * x); return [x, yc + (onder ? -yt : yt), yt]; };
  return [...p.slice().reverse().map((x) => pt(x, false)), ...p.slice(1).map((x) => pt(x, true))]; // van achterrand over de bovenkant naar voren en onderlangs terug
}
const PROFIEL = profiel();
// een vleugelachtig deel: dikte per doorsnede schaalt het profiel (12 procent) naar t
function vleugelvorm(secs, naar, soort, deel, dicht = true) {
  const echte = secs.map((sc) => ({ ...sc }));
  const pos = [], idx = [], n = PROFIEL.length;
  for (const sc of echte) for (const [x, y] of PROFIEL) pos.push(...naar(sc.le - x * sc.c, y * sc.c * sc.t, sc).toArray());
  for (let i = 0; i < echte.length - 1; i++) for (let j = 0; j < n - 1; j++) { const a = i * n + j, b = a + 1, c = a + n, d = c + 1; idx.push(a, c, b, b, c, d); }
  if (dicht) for (const [l, kant] of [[echte.length - 1, 1], [0, -1]]) { if (kant < 0 && !secs.wortelDicht) continue; const sc = echte[l], ci = pos.length / 3; pos.push(...naar(sc.le - 0.4 * sc.c, 0.02 * sc.c, sc).toArray()); for (let j = 0; j < n - 1; j++) kant > 0 ? idx.push(l * n + j, ci, l * n + j + 1) : idx.push(l * n + j + 1, ci, l * n + j); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function naarBuitenG(g, binnen) { // draai de vlakken om als de normalen naar het punt "binnen" wijzen
  const p = g.attributes.position, nrm = g.attributes.normal; let som = 0;
  for (let i = 0; i < p.count; i += 7) som += (p.getX(i) - binnen.x) * nrm.getX(i) + (p.getY(i) - binnen.y) * nrm.getY(i) + (p.getZ(i) - binnen.z) * nrm.getZ(i);
  if (som < 0) { const ix = g.index.array; for (let q = 0; q < ix.length; q += 3) { const tmp = ix[q + 1]; ix[q + 1] = ix[q + 2]; ix[q + 2] = tmp; } g.computeVertexNormals(); }
  return g;
}
// ---- vleugels met kleppen en winglets
const VL_Y = 0.345, V_HOEK = 0.09; // hoogte van de vleugelwortel, V-stand (5 graden)
const voorrand = (z) => 0.39 - 0.526 * (Math.abs(z) - 0.1);
const achterrand = (z) => { const a = Math.abs(z); return a < 0.95 ? -0.39 - (0.03 * (a - 0.1)) / 0.85 : -0.42 - (0.18 * (a - 0.95)) / 0.73; };
for (const k of [1, -1]) {
  const vg = new THREE.Group(); vg.position.set(0, VL_Y, 0); vg.rotation.x = -k * V_HOEK;
  const secs = [0.1, 0.62, 0.95, 1.3, 1.68].map((z) => ({ le: voorrand(z), c: voorrand(z) - achterrand(z), t: 0.15 - 0.05 * (z / 1.68), z }));
  const naar = (x, y, sc) => V(x, y, k * sc.z);
  vg.add(mesh(naarBuitenG(vleugelvorm(secs, naar), V(-0.1, 0, k * 0.8)), "romp", "vleugels"));
  // winglet: omhoog aan de punt
  const wsecs = [0, 0.06, 0.2].map((h) => ({ le: -0.441 - 0.6 * h, c: 0.159 - 0.42 * h, t: 0.1, h }));
  const wnaar = (x, y, sc) => V(x, 0.004 + sc.h, k * (1.68 + 0.18 * sc.h * sc.h) + k * y);
  vg.add(mesh(naarBuitenG(vleugelvorm(wsecs, wnaar), V(-0.5, 0.1, k * 1.7)), "romp", "vleugels"));
  // kleppen achter het binnenste deel: een dun profiel aan een scharnier
  for (const [z0, z1] of [[0.24, 0.6], [0.64, 0.94]]) {
    const scharnier = new THREE.Group(); scharnier.position.set(achterrand(z0) + 0.012, -0.004, 0);
    const ks = [z0, z1].map((z) => ({ le: achterrand(z) - achterrand(z0), c: 0.1, t: 0.07, z }));
    ks.wortelDicht = true;
    const klep = mesh(naarBuitenG(vleugelvorm(ks, (x, y, sc) => V(x, y, k * sc.z)), V(-0.05, 0, k * (z0 + z1) / 2)), "klep", "kleppen");
    scharnier.add(klep); vg.add(scharnier); G.kleppen.push(scharnier);
  }
  // lampjes op de vleugeltip: rood links, groen rechts
  const lamp = op(mesh(new THREE.SphereGeometry(0.012, 16, 10), k > 0 ? "groenlicht" : "roodlicht", "lichten"), -0.47, 0.0, k * 1.686);
  vg.add(lamp); G.lichten[k > 0 ? "groen" : "rood"] = lamp;
  vliegtuig.add(vg); G[k > 0 ? "vleugelR" : "vleugelL"] = vg;
}
// ---- motoren
function nacel() {
  const prof = [[0.0, 0.29], [0.105, 0.29], [0.122, 0.27], [0.128, 0.2], [0.124, 0.02], [0.11, -0.12], [0.085, -0.2], [0.07, -0.21], [0.06, -0.2], [0.04, -0.29], [0.0, -0.31]];
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 56); g.rotateZ(-Math.PI / 2); return g;
}
for (const k of [1, -1]) {
  const z = k * 0.6, x = voorrand(z) + 0.02, y = VL_Y + 0.5 * V_HOEK - 0.16;
  const mg = new THREE.Group(); mg.position.set(x, y, z);
  const huis = mesh(nacel(), "romp", "motoren");
  const inlaat = op(mesh(new THREE.CylinderGeometry(0.104, 0.104, 0.02, 48).rotateZ(Math.PI / 2), "zwartmetaal", "motoren"), 0.26, 0, 0);
  const fan = new THREE.Group(); fan.position.x = 0.265;
  const bladen = []; for (let i = 0; i < 20; i++) { const b = new THREE.BoxGeometry(0.006, 0.092, 0.018); b.translate(0, 0.052, 0); b.rotateY(0.5); b.rotateX((i / 20) * TAU); bladen.push(b); }
  fan.add(mesh(samen(bladen), "metaal", "motoren"), op(mesh(new THREE.ConeGeometry(0.028, 0.06, 24).rotateZ(-Math.PI / 2), "metaal", "motoren"), 0.03, 0, 0));
  const ps = new THREE.Shape(); ps.moveTo(0.2, 0.105); ps.lineTo(-0.26, 0.105); ps.quadraticCurveTo(-0.33, 0.12, -0.36, 0.185); ps.lineTo(0.02, 0.185); ps.quadraticCurveTo(0.12, 0.15, 0.2, 0.105);
  const pg = new THREE.ExtrudeGeometry(ps, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 8 }); pg.translate(0, 0, -0.006); pg.computeVertexNormals();
  const pyloon = mesh(pg, "romp", "motoren");
  const kegel = op(mesh(new THREE.ConeGeometry(0.045, 0.12, 28).rotateZ(Math.PI / 2), "zwartmetaal", "motoren"), -0.33, 0, 0);
  mg.add(kegel);
  mg.add(huis, inlaat, fan, pyloon); vliegtuig.add(mg);
  G.draaien.push(fan); G[k > 0 ? "motorR" : "motorL"] = mg;
}
// ---- de staart: kielvlak met richtingsroer, en hoogteroeren (met vleugelprofiel)
{
  const voet = opRomp(-1.45, 0).y - 0.025, st = new THREE.Group(); st.position.set(0, voet, 0);
  const vsecs = [0, 0.3, 0.6].map((h) => ({ le: -1.17 - 0.82 * h, c: 0.48 - 0.47 * h, t: 0.11 - 0.03 * h, h }));
  vsecs.wortelDicht = true;
  st.add(mesh(naarBuitenG(vleugelvorm(vsecs, (x, y, sc) => V(x, sc.h, y)), V(-1.5, 0.3, 0)), "romp", "staart"));
  const rug = new THREE.Shape(); rug.moveTo(-0.9, 0); rug.quadraticCurveTo(-1.1, 0.02, -1.2, 0.12); rug.lineTo(-1.25, 0.0);
  const rugG = new THREE.ExtrudeGeometry(rug, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3 }); rugG.translate(0, 0, -0.004); rugG.computeVertexNormals();
  st.add(mesh(rugG, "romp", "staart"));
  const scharnierX = -1.65, roer = new THREE.Group(); roer.position.set(scharnierX, 0, 0);
  const rsecs = [0.03, 0.3, 0.58].map((h) => { const fin = vsecs[0].le - 0.82 * h - (0.48 - 0.47 * h); return { le: fin - scharnierX + 0.004, c: 0.12 - 0.08 * h, t: 0.09, h }; });
  rsecs.wortelDicht = true;
  roer.add(mesh(naarBuitenG(vleugelvorm(rsecs, (x, y, sc) => V(x, sc.h, y)), V(-0.06, 0.3, 0)), "klep", "staart"));
  st.add(roer); G.roer = roer;
  vliegtuig.add(st); G.staartVert = st;
  for (const k of [1, -1]) {
    const hg = new THREE.Group(); hg.position.set(0, rompY(0.06) + 0.005, 0); hg.rotation.x = -k * 0.1;
    const hsecs = [0.02, 0.64].map((z) => ({ le: -1.42 - 0.55 * (z - 0.02), c: 0.38 - 0.42 * (z - 0.02), t: 0.1, z }));
    hg.add(mesh(naarBuitenG(vleugelvorm(hsecs, (x, y, sc) => V(x, y, k * sc.z)), V(-1.6, 0, k * 0.3)), "romp", "staart"));
    vliegtuig.add(hg); G[k > 0 ? "hoogteR" : "hoogteL"] = hg;
  }
  const staartlicht = op(mesh(new THREE.SphereGeometry(0.012, 12, 8), "witlicht", "lichten"), X0 + 0.003, rompY(0), 0); vliegtuig.add(staartlicht); G.lichten.wit = staartlicht;
  const zwaai = op(mesh(new THREE.SphereGeometry(0.016, 14, 8, 0, TAU, 0, Math.PI / 2), "roodlicht", "lichten"), 0.1, YM + RR * 1.04, 0); vliegtuig.add(zwaai); G.lichten.zwaai = zwaai;
}
// ---- landingsgestel
function gestel(x, z, yBoven, rw, twee) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const poot = mesh(samen([new THREE.CylinderGeometry(0.014, 0.014, yBoven - rw, 14).translate(0, rw + (yBoven - rw) / 2, 0), new THREE.CylinderGeometry(0.02, 0.02, 0.06, 14).translate(0, yBoven - 0.05, 0)]), "metaal", "landingsgestel");
  const as = mesh(new THREE.CylinderGeometry(0.008, 0.008, twee ? 0.12 : 0.08, 10).rotateX(Math.PI / 2).translate(0, rw, 0), "metaal", "landingsgestel");
  g.add(poot, as);
  for (const dz of twee ? [-0.045, 0.045] : [-0.028, 0.028]) {
    const w = new THREE.Group(); w.position.set(0, rw, dz);
    const band = mesh(new THREE.TorusGeometry(rw * 0.72, rw * 0.3, 14, 32), "rubber", "landingsgestel");
    const naaf = mesh(new THREE.CylinderGeometry(rw * 0.55, rw * 0.55, rw * 0.5, 24).rotateX(Math.PI / 2), "metaal", "landingsgestel");
    w.add(band, naaf); g.add(w); G.wielen.push(w);
  }
  vliegtuig.add(g); return g;
}
G.neuswiel = gestel(1.42, 0, YM - RR + 0.01, 0.038, false);
G.hoofdL = gestel(-0.12, -0.36, VL_Y - 0.03, 0.064, true);
G.hoofdR = gestel(-0.12, 0.36, VL_Y - 0.03, 0.064, true);
// ---- binnen: cockpit en cabine (te zien als de romp doorzichtig is of het vliegtuig uit elkaar is)
{
  const st = [];
  for (let x = -1.05; x <= 1.15; x += 0.084) for (const z of [-0.13, -0.085, -0.04, 0.04, 0.085, 0.13]) {
    st.push(rondeDoos(0.035, 0.018, 0.038, 0.006).translate(x, YM - 0.075, z), rondeDoos(0.012, 0.06, 0.038, 0.005).translate(x - 0.017, YM - 0.045, z));
  }
  const cabine = mesh(samen(st), "stoel", "cabine");
  const vloer = mesh(new THREE.BoxGeometry(2.3, 0.008, 0.34).translate(0.05, YM - 0.09, 0), "vloer", "cabine");
  G.cabine = groep(cabine, vloer); vliegtuig.add(G.cabine);
  const cs = [];
  for (const z of [-0.06, 0.06]) cs.push(rondeDoos(0.05, 0.02, 0.045, 0.008).translate(1.54, YM - 0.04, z), rondeDoos(0.014, 0.08, 0.045, 0.006).translate(1.515, YM, z));
  const paneel = rondeDoos(0.03, 0.045, 0.2, 0.006); paneel.rotateZ(0.5); paneel.translate(1.64, YM + 0.02, 0);
  G.cockpitBinnen = groep(mesh(samen(cs), "stoel", "cockpit"), mesh(paneel, "scherm", "cockpit"));
  vliegtuig.add(G.cockpitBinnen);
}
const SNELHEID = { fan: 0 };

// ================= Inktlijnen en weergave =================
let rtKleur, rtNormaal;
const lijnMat = new THREE.ShaderMaterial({
  uniforms: { kleur: { value: null }, normaal: { value: null }, diepte: { value: null }, pixel: { value: new THREE.Vector2() }, dik: { value: 0.85 * DPR }, aan: { value: 1 }, inkt: { value: new THREE.Color(0x1e1e1e) }, papier: { value: new THREE.Vector3(241 / 255, 240 / 255, 238 / 255) }, brandpunt: { value: 800 }, ao: { value: 0.55 }, near: { value: camera.near }, far: { value: camera.far } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: `
    uniform sampler2D kleur, normaal, diepte; uniform vec2 pixel; uniform float dik, aan, near, far; uniform vec3 inkt; uniform vec3 papier; uniform float brandpunt, ao; varying vec2 vUv;
    float lin(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
    void main(){
      vec4 c = texture2D(kleur, vUv);
      float d0r = texture2D(diepte, vUv).r;
      float lijn = 0.0, nadruk = texture2D(normaal, vUv).a;
      if (aan > 0.5) {
        float d0 = lin(d0r); vec3 n0 = texture2D(normaal, vUv).rgb * 2.0 - 1.0; float de = 0.0, ne = 0.0;
        for (int i = 0; i < 4; i++) {
          float a = float(i) * 1.570796; vec2 o = vec2(cos(a), sin(a)) * pixel * dik;
          vec4 nb = texture2D(normaal, vUv + o); float db = texture2D(diepte, vUv + o).r;
          float d = lin(db); de = max(de, (d - d0) / max(d0, 0.001)); // alleen de voorste rand krijgt de lijn
          ne = max(ne, 1.0 - dot(n0, nb.rgb * 2.0 - 1.0));
          if (db < d0r) nadruk = max(nadruk, nb.a);
        }
        lijn = max(smoothstep(0.01, 0.03, de), smoothstep(0.5, 0.8, ne));
      }
      vec3 kl = c.rgb;
      // zachte schaduw in hoeken: hoeveel buren liggen dichterbij (binnen een straal van 4 cm)?
      if (ao > 0.0 && d0r < 0.99999) {
        float d0 = lin(d0r), straal = 0.04 * brandpunt / d0, dicht = 0.0;
        for (int i = 0; i < 14; i++) {
          float a = float(i) * 2.39996, rr = straal * sqrt((float(i) + 0.5) / 14.0);
          vec2 o = vec2(cos(a), sin(a)) * rr * pixel;
          float d = lin(texture2D(diepte, vUv + o).r), v = d0 - d;
          dicht += smoothstep(0.004, 0.02, v) * (1.0 - smoothstep(0.08, 0.16, v));
        }
        kl *= 1.0 - ao * pow(dicht / 14.0, 1.2);
      }
      float zicht = clamp(nadruk, 0.0, 1.0);
      gl_FragColor = vec4(kl, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      vec3 achter = papier;
      vec3 uit = mix(achter, gl_FragColor.rgb, c.a);
      uit = mix(uit, inkt, lijn * mix(0.25, 0.78, zicht));
      gl_FragColor = vec4(uit, 1.0);
    }`,
  depthTest: false, depthWrite: false, toneMapped: true,
});
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
{ const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lijnMat); q.frustumCulled = false; quadScene.add(q); }
function maakDoelen(w, h) {
  rtKleur?.dispose(); rtNormaal?.dispose();
  rtKleur = new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType });
  rtNormaal = new THREE.WebGLRenderTarget(w, h, { samples: 0, depthTexture: new THREE.DepthTexture(w, h) });
  lijnMat.uniforms.kleur.value = rtKleur.texture; lijnMat.uniforms.normaal.value = rtNormaal.texture; lijnMat.uniforms.diepte.value = rtNormaal.depthTexture;
  lijnMat.uniforms.pixel.value.set(1 / w, 1 / h);
  lijnMat.uniforms.brandpunt.value = (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
}

// ================= Teksten (proeftekst; maten zijn die van de tekening, schaal 1:10) =================
const SECTIES = [
  { naam: "Het vliegtuig", titel: "Het vliegtuig", tekst: "Een passagiersvliegtuig met twee motoren, zoals je er veel ziet op Schiphol. Tik op de lampjes.", cam: [0.78, 0.3, 7.2, [0.0, 0.5, 0], 32], focus: null,
    specs: [["Lengte", "38 m in de tekening"], ["Spanwijdte", "34 m in de tekening"], ["Motoren", "2, onder de vleugels"], ["Stoelen", "162 in de tekening"], ["Lampjes", "tik", "lichten"]],
    namen: [["vleugelR", "VLEUGEL", 60, -40], ["motorR", "MOTOR", 70, 40], ["staartVert", "STAART", -70, -30], ["neuswiel", "LANDINGSGESTEL", 40, 50], ["romp", "ROMP", -60, -50]] },
  { naam: "De romp", titel: "De romp", tekst: "De lange buis waar de mensen in zitten. Voorin de piloten, daarachter rijen stoelen, en onderin de koffers.", cam: [0.12, 0.18, 6.4, [0.0, 0.5, 0], 30], focus: ["romp", "cabine"], doorzicht: true,
    specs: [["Rijen stoelen", "27 in de tekening"], ["Stoelen per rij", "6, met een gangpad"], ["Deuren", "2 aan elke kant"], ["Ramen", "een lange rij aan elke kant"]],
    namen: [["cabine", "CABINE · STOELEN", -60, -60], ["romp", "ROMP", 60, -50]] },
  { naam: "De vleugels", titel: "De vleugels", tekst: "Door de vorm van de vleugels gaat het vliegtuig omhoog als het hard genoeg gaat. Kijk: de kleppen gaan uit.", cam: [0.55, 1.05, 5.6, [-0.15, 0.4, 0.5], 34], focus: ["vleugels", "kleppen"], kleppen: true,
    specs: [["Spanwijdte", "34 m in de tekening"], ["Pijlstand", "naar achteren"], ["Kleppen", "2 aan elke kant"], ["Winglets", "omhoog aan de punt"]],
    namen: [["vleugelR", "VLEUGEL", 60, -30], ["kleppen", "KLEPPEN", -70, 30]] },
  { naam: "De motoren", titel: "De motoren", tekst: "Voorin draait een grote ventilator. Die blaast lucht hard naar achteren, en dan gaat het vliegtuig vooruit.", cam: [0.95, 0.16, 2.3, [0.18, 0.25, 0.62], 32], focus: ["motoren"], draaien: true,
    specs: [["Motoren", "2 straalmotoren"], ["Ventilator", "20 bladen in de tekening"], ["Plek", "onder de vleugels"]],
    namen: [["motorR", "STRAALMOTOR", 60, -40]] },
  { naam: "De staart", titel: "De staart", tekst: "De staart houdt het vliegtuig recht. Met het roer stuurt de piloot naar links en naar rechts.", cam: [-0.95, 0.35, 2.9, [-1.55, 0.8, 0], 32], focus: ["staart"], roer: true,
    specs: [["Richtingsroer", "links en rechts"], ["Hoogteroeren", "omhoog en omlaag"], ["Staartlicht", "wit"]],
    namen: [["staartVert", "RICHTINGSROER", -60, -40], ["hoogteR", "HOOGTEROER", 60, 30]] },
  { naam: "Het landingsgestel", titel: "Het landingsgestel", tekst: "Wielen om op te landen en te rijden. In de lucht klappen ze in de romp, zodat het vliegtuig makkelijker vliegt.", cam: [0.85, 0.03, 3.3, [0.4, 0.18, 0], 34], focus: ["landingsgestel"], rollen: true,
    specs: [["Neuswiel", "2 wielen, stuurt op de grond"], ["Hoofdwielen", "2 × 2 wielen"], ["Wielen samen", "6"]],
    namen: [["neuswiel", "NEUSWIEL", 60, -30], ["hoofdR", "HOOFDWIELEN", -60, -30]] },
  { naam: "De cockpit", titel: "De cockpit", tekst: "Hier zitten de piloten, met schermen en knoppen. Buiten knipperen de lampjes: rood links, groen rechts.", cam: [0.62, 0.22, 2.3, [1.45, 0.5, 0], 30], focus: ["cockpit", "lichten"], doorzicht: true, lichten: true,
    specs: [["Piloten", "2"], ["Ramen", "4 in de tekening"], ["Lampjes", "rood, groen en wit"]],
    namen: [["cockpit", "COCKPIT", 60, -40], ["lichten", "LAMPJES", -60, 40]] },
];
const KIND = [
  { naam: "het vliegtuig", focus: ["romp"], cam: [0.78, 0.3, 7.2, [0.0, 0.5, 0], 32] },
  { naam: "de vleugel", focus: ["vleugels", "kleppen"], cam: [0.55, 1.05, 5.6, [-0.15, 0.4, 0.5], 34], kleppen: true },
  { naam: "de motor", focus: ["motoren"], cam: [0.95, 0.16, 2.3, [0.18, 0.25, 0.62], 32], draaien: true, geluid: "straal" },
  { naam: "de staart", focus: ["staart"], cam: [-0.95, 0.35, 2.9, [-1.55, 0.8, 0], 32], roer: true },
  { naam: "de wielen", focus: ["landingsgestel"], cam: [0.85, 0.03, 3.3, [0.4, 0.18, 0], 34], rollen: true },
  { naam: "de ramen", focus: ["romp"], cam: [0.12, 0.15, 3.4, [0.3, 0.5, 0], 30] },
  { naam: "de cockpit", focus: ["cockpit"], cam: [0.62, 0.22, 2.3, [1.45, 0.5, 0], 30] },
  { naam: "de lampjes", focus: ["lichten"], cam: [0.6, 0.6, 5.0, [-0.2, 0.45, 0], 34], lichten: true },
];

// ================= Weetjes =================
const SECTIE_SLEUTEL = ["vliegtuig", "romp", "vleugels", "motoren", "staart", "landingsgestel", "cockpit"];
let WEETJES = {};
fetch("/data/weetjes-vliegtuig.json").then((r) => (r.ok ? r.json() : {})).then((d) => { WEETJES = d.secties || {}; if (tab === "anatomie") toon(); }).catch(() => {});
const zetTeller = () => { const t = document.getElementById("mijnteller"); if (t) t.textContent = MIJN.aantal(); };

// ================= Toestand en kleuren =================
let stand = "donker", tab = KINDMODUS ? "kind" : "anatomie", sectie = 0, kindI = 0, lichtAan = false, stemAan = false, geluidAan = true, tourAan = false;
const podium = document.querySelector(".podium");
const huidig = () => (tab === "kind" ? KIND[kindI] : SECTIES[sectie]);
const focusVan = () => huidig().focus;
function kleuren() {
  const f = focusVan(), donker = stand === "donker", h = huidig(), doorzicht = !!h.doorzicht || uiteenNu > 0.01;
  for (const m of meshes) {
    const basis = MAT[m.userData.soort][donker ? "donker" : "teken"];
    let mat = basis;
    if (tab === "kind" && f && f.includes(m.userData.deel)) mat = (m.userData.nadruk ||= {})[stand] ||= Object.assign(basis.clone(), { color: ACCENT[donker ? "donker" : "teken"].clone() });
    if (doorzicht && m.userData.romp) mat = (m.userData.glas ||= {})[stand] ||= Object.assign(basis.clone(), { transparent: true, opacity: 0.22, depthWrite: false });
    m.material = mat;
  }
  G.cabine.visible = G.cockpitBinnen.visible = doorzicht;
  renderer.toneMapping = donker ? THREE.ACESFilmicToneMapping : THREE.NeutralToneMapping;
  renderer.toneMappingExposure = donker ? 1.05 : 1;
  scene.environmentIntensity = donker ? 0.9 : 0.55;
  zon.intensity = donker ? 1.6 : 2.6; hemi.intensity = donker ? 1.0 : 0.55;
  lijnMat.uniforms.aan.value = donker ? 0 : 1; lijnMat.uniforms.ao.value = donker ? 0.35 : 0.6;
  vraag();
}

// ================= Paneel =================
const $ = (id) => document.getElementById(id);
const lijstEl = $("lijst"), inhoudEl = $("inhoud"), knoppenEl = $("onderknoppen"), toetsenEl = $("toetsen");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function toon() {
  lijstEl.innerHTML = SECTIES.map((s, i) => `<li class="${i === sectie ? "aan" : ""}"><button type="button" data-sectie="${i}">${esc(s.naam)}</button></li>`).join("");
  const s = SECTIES[sectie], w = WEETJES[SECTIE_SLEUTEL[sectie]] || [];
  inhoudEl.innerHTML = `<h2>${esc(s.titel)}</h2><p class="tekst">${esc(s.tekst)}</p><ul class="specs">${s.specs.map(([a, b, tik]) => `<li${tik ? ` class="tik" data-tik="${tik}"` : ""}><span class="label">${esc(a)}</span><span class="waarde">${esc(b)}</span></li>`).join("")}</ul>
    ${w.length ? `<details class="weetjes"><summary>Weetjes <span class="mono zacht">nagekeken · ${w.length}</span></summary><ul>${w.map((x) => `<li>${esc(x.tekst)}<a href="${esc(x.bron)}" target="_blank" rel="noopener noreferrer">${esc(x.bron.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48))}</a></li>`).join("")}</ul></details>` : ""}`;
  knoppenEl.innerHTML = `<button type="button" class="knop licht" id="terug" ${sectie === 0 ? "disabled" : ""}>Terug</button><button type="button" class="knop" id="verder" ${sectie === SECTIES.length - 1 ? "disabled" : ""}>Verder</button>`;
  toetsenEl.innerHTML = `<span><kbd>←</kbd> <kbd>→</kbd> verder</span><span><kbd>E</kbd> uit elkaar · <kbd>T</kbd> tour</span>`;
  for (const b of lijstEl.querySelectorAll("[data-sectie]")) b.addEventListener("click", () => gaSectie(+b.dataset.sectie));
  for (const li of inhoudEl.querySelectorAll("[data-tik]")) li.addEventListener("click", () => { lichtAan = !lichtAan; klik(); vraag(); });
  $("terug").addEventListener("click", () => gaSectie(sectie - 1)); $("verder").addEventListener("click", () => gaSectie(sectie + 1));
  tekenMini(); maakNamen(); kleuren(); zetTeller();
}
function praat(t) { if (stemAan) STEM.zeg(t); }
function klik() { if (geluidAan && navigator.userActivation?.hasBeenActive) STEM.klik(); }
function gaSectie(i) { if (uiteen) { uiteen = 0; $("uiteenknop").setAttribute("aria-pressed", "false"); } sectie = Math.max(0, Math.min(SECTIES.length - 1, i)); camNaar(SECTIES[sectie].cam); klik(); toon(); praat(SECTIES[sectie].titel + ". " + SECTIES[sectie].tekst); }
for (const b of document.querySelectorAll("[data-stand]")) b.addEventListener("click", () => { stand = b.dataset.stand === "echt" ? "donker" : "tekening"; for (const x of document.querySelectorAll("[data-stand]")) x.setAttribute("aria-pressed", String(x === b)); klik(); kleuren(); });
let tourKlok = null;
$("tour")?.addEventListener("click", (e) => { tourAan = !tourAan; e.currentTarget.setAttribute("aria-pressed", String(tourAan)); clearInterval(tourKlok); if (tourAan) { gaSectie(0); tourKlok = setInterval(() => { if (sectie >= SECTIES.length - 1) { tourAan = false; $("tour").setAttribute("aria-pressed", "false"); clearInterval(tourKlok); } else gaSectie(sectie + 1); }, 6000); } });
$("geluid")?.addEventListener("click", (e) => { geluidAan = !geluidAan; e.currentTarget.setAttribute("aria-pressed", String(geluidAan)); e.currentTarget.textContent = geluidAan ? "Geluid" : "Stil"; });
$("stem")?.addEventListener("click", (e) => { stemAan = !stemAan; e.currentTarget.setAttribute("aria-pressed", String(stemAan)); if (stemAan) praat(SECTIES[sectie].titel + ". " + SECTIES[sectie].tekst); else STEM.stil(); });
$("uiteenknop").addEventListener("click", () => zetUitElkaar(!uiteen));
addEventListener("keydown", (e) => {
  if (e.target.closest?.("input,textarea")) return;
  if (KINDMODUS) { if (e.key === "ArrowRight") kindToon(kindI + 1); else if (e.key === "ArrowLeft") kindToon(kindI - 1); else if (e.key === " ") kindGeluid(); return; }
  if (e.key === "ArrowRight") gaSectie(sectie + 1); else if (e.key === "ArrowLeft") gaSectie(sectie - 1); else if (e.key.toLowerCase() === "e") zetUitElkaar(!uiteen); else if (e.key.toLowerCase() === "t") $("tour")?.click();
});
// minivliegtuig: zijaanzicht in lijnen, het onderdeel van nu in rood
function tekenMini() {
  const f = focusVan() || [], aan = (d) => (f.includes(d) ? "aan" : "");
  const sx = (x) => 60 + x * 26, sy = (y) => 52 - y * 26;
  const romp = Array.from({ length: 31 }, (_, i) => { const t = i / 30; return [rompX(t), rompY(t) + rompStraal(t)]; }).concat(Array.from({ length: 31 }, (_, i) => { const t = 1 - i / 30; return [rompX(t), rompY(t) - rompStraal(t)]; }));
  $("minifiets").innerHTML = `<path d="M${romp.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("L")}Z" class="${aan("romp") || aan("cockpit")}"/>` +
    `<path d="M${sx(-1.2)},${sy(0.66)}L${sx(-1.66)},${sy(1.28)}L${sx(-1.84)},${sy(1.28)}L${sx(-1.76)},${sy(0.66)}" class="${aan("staart")}"/>` +
    `<path d="M${sx(0.36)},${sy(0.36)}L${sx(-0.5)},${sy(0.42)}L${sx(-0.36)},${sy(0.33)}Z" class="${aan("vleugels")}"/>` +
    `<path d="M${sx(0.42)},${sy(0.24)}L${sx(-0.18)},${sy(0.24)}" class="${aan("motoren")}" style="stroke-width:6"/>` +
    `<line x1="${sx(1.42)}" y1="${sy(0.26)}" x2="${sx(1.42)}" y2="${sy(0)}" class="${aan("landingsgestel")}"/><line x1="${sx(-0.12)}" y1="${sy(0.33)}" x2="${sx(-0.12)}" y2="${sy(0)}" class="${aan("landingsgestel")}"/>`;
}

// ================= Kinderen =================
function kindToon(i, praatOok = true) {
  kindI = (i + KIND.length) % KIND.length; const k = KIND[kindI];
  $("kindnaam").textContent = k.naam;
  for (const b of document.querySelectorAll("#kindstrook button")) b.setAttribute("aria-current", String(+b.dataset.i === kindI));
  camNaar(k.cam); kleuren(); tekenMini();
  if (praatOok) STEM.zeg(k.naam, { kind: true });
}
function kindGeluid() { const k = KIND[kindI]; if (k.geluid === "straal") STEM.straal(); else STEM.zeg(k.naam, { kind: true }); }
function kindTik(d) { const i = KIND.findIndex((k) => k.focus.includes(d)); if (i >= 0 && i !== kindI) kindToon(i); else kindGeluid(); handWeg(); }
function handWeg() { $("kindhand")?.remove(); try { localStorage.setItem("fiets-kind-hand", "1"); } catch {} }

// ================= Namen met lijntjes =================
const namenEl = $("namen"), lijnEl = $("lijntjes");
const ANKEROBJ = () => ({ romp: DELEN.romp[0], cabine: G.cabine, vleugelR: G.vleugelR, kleppen: G.kleppen[1], motorR: G.motorR, staartVert: G.staartVert, hoogteR: G.hoogteR, neuswiel: G.neuswiel, hoofdR: G.hoofdR, cockpit: DELEN.cockpit[0], lichten: G.lichten.groen });
let namen = [];
function lokaal(obj) { const b = new THREE.Box3().setFromObject(obj); return obj.worldToLocal(b.getCenter(new THREE.Vector3())); }
function maakNamen() {
  namenEl.textContent = ""; lijnEl.textContent = ""; namen = [];
  if (KINDMODUS) return;
  const A = ANKEROBJ();
  const lijst = uiteen ? EX.filter((e) => e.naam).map((e) => [e.obj, e.naam, e.plek[0], e.plek[1], e]) : (SECTIES[sectie].namen || []).map(([k, t, dx, dy]) => [A[k], t, dx, dy, null]);
  for (const [obj, tekst, dx, dy, ex] of lijst) {
    if (!obj) continue;
    const el = document.createElement("span"); el.className = "naam"; el.textContent = tekst; namenEl.append(el);
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line"); lijnEl.append(l);
    namen.push({ obj, lok: ex ? null : lokaal(obj), ex, el, l, dx, dy });
  }
}
const pw = new THREE.Vector3();
function scherm(p, r) { pw.copy(p).project(camera); return [((pw.x + 1) / 2) * r.width, ((1 - pw.y) / 2) * r.height]; }
function namenBijwerken() {
  if (!namen.length) return;
  const r = doek.getBoundingClientRect();
  for (const n of namen) {
    const lok = n.ex ? n.ex.lok : n.lok; if (!lok) continue;
    pw.copy(lok); n.obj.localToWorld(pw);
    if (n.ex) { n.el.style.opacity = n.l.style.opacity = Math.min(1, uiteenNu * 2); }
    const [ax, ay] = scherm(pw, r), links = n.dx < 0, bw = (n.w ||= n.el.offsetWidth || 90);
    const lx = links ? Math.max(8 + bw, ax + n.dx) : Math.min(r.width - 8 - bw, ax + n.dx), ly = Math.max(70, Math.min(r.height - 40, ay + n.dy));
    n.el.classList.toggle("links", links); n.el.style.left = lx + (links ? -3 : 3) + "px"; n.el.style.top = ly + "px";
    n.l.setAttribute("x1", ax); n.l.setAttribute("y1", ay); n.l.setAttribute("x2", lx); n.l.setAttribute("y2", ly);
  }
}

// ================= Uit elkaar =================
let uiteen = 0, uiteenNu = 0;
const EX = [];
function exDef() {
  const lijst = [
    [G.staartVert, [-0.35, 0.55, 0], "STAART", [-60, -30]], [G.hoogteL, [-0.45, 0.2, -0.35], null], [G.hoogteR, [-0.45, 0.2, 0.35], "HOOGTEROER", [60, -20]],
    [G.vleugelL, [0, 0.05, -0.65], null], [G.vleugelR, [0, 0.05, 0.65], "VLEUGEL", [60, -30]],
    [G.motorL, [0.15, -0.3, -0.95], null], [G.motorR, [0.15, -0.3, 0.95], "MOTOR", [60, 30]],
    [G.neuswiel, [0.35, -0.3, 0], "NEUSWIEL", [50, 20]], [G.hoofdL, [0, -0.35, -0.3], null], [G.hoofdR, [0, -0.35, 0.3], "HOOFDWIELEN", [60, 20]],
    [G.cabine, [0, 0.75, 0], "CABINE · 162 STOELEN", [-70, -30]], [G.cockpitBinnen, [0.45, 0.6, 0], "COCKPIT", [60, -20]],
  ];
  lijst.forEach(([obj, v, naam, plek], i) => EX.push({ obj, v: V(...v), naam, plek: plek || [0, 0], vertraging: i * 0.04 }));
}
const gidsGeo = new THREE.BufferGeometry(), gidsMat = new THREE.LineDashedMaterial({ color: 0x8a8a87, dashSize: 0.05, gapSize: 0.04 });
const gids = new THREE.LineSegments(gidsGeo, gidsMat); gids.userData.geenLijn = true; gids.frustumCulled = false; scene.add(gids);
const qInv = new THREE.Quaternion();
function zetUiteen() {
  if (!EX.length) exDef();
  const u = uiteenNu, pts = [];
  vliegtuig.updateMatrixWorld(true);
  for (const e of EX) {
    e.thuis ||= e.obj.position.clone(); e.obj.position.copy(e.thuis); e.obj.updateMatrixWorld(true);
    const thuisW = new THREE.Box3().setFromObject(e.obj).getCenter(new THREE.Vector3());
    if (!e.lok) e.lok = e.obj.worldToLocal(thuisW.clone());
    const k = glad((u - e.vertraging) / 0.55); if (k <= 0) continue;
    e.obj.parent.getWorldQuaternion(qInv).invert();
    e.obj.position.add(e.v.clone().multiplyScalar(k).applyQuaternion(qInv)); e.obj.updateMatrixWorld(true);
    pts.push(thuisW, thuisW.clone().addScaledVector(e.v, k));
  }
  gidsGeo.setFromPoints(pts.length ? pts : [V(0, 0, 0), V(0, 0, 0)]); gids.computeLineDistances(); gids.visible = u > 0.02;
}
function zetUitElkaar(aan) {
  uiteen = aan ? 1 : 0; $("uiteenknop").setAttribute("aria-pressed", String(aan));
  camNaar(aan ? [0.75, 0.45, 8.8, [-0.1, 0.65, 0], 34] : SECTIES[sectie].cam);
  podium.classList.toggle("smal-uit", !!aan); klik(); maakNamen(); kleuren(); vraag();
}

// ================= Camera =================
const cam = { draai: 0.78, helling: 0.3, afstand: 7.2, doel: V(0, 0.5, 0), fov: 32 }, camDoel = { ...cam, doel: cam.doel.clone() };
let camVolgt = true;
function camNaar([d, h, a, p, fov = 32]) { camDoel.draai = cam.draai + Math.atan2(Math.sin(d - cam.draai), Math.cos(d - cam.draai)); camDoel.helling = h; camDoel.afstand = a; camDoel.doel = V(...p); camDoel.fov = fov; camVolgt = true; vraag(); }
const wijzers = new Map(); let vaart = 0, knijp = null;
doek.addEventListener("pointerdown", (e) => { doek.setPointerCapture(e.pointerId); wijzers.set(e.pointerId, { x: e.clientX, y: e.clientY }); vaart = 0; camVolgt = false; if (wijzers.size === 2) { const [a, b] = [...wijzers.values()]; knijp = { d: Math.hypot(a.x - b.x, a.y - b.y), a: cam.afstand }; } });
doek.addEventListener("pointermove", (e) => {
  const w = wijzers.get(e.pointerId); if (!w) return; const dx = e.clientX - w.x, dy = e.clientY - w.y; w.x = e.clientX; w.y = e.clientY;
  if (wijzers.size === 2 && knijp) { const [a, b] = [...wijzers.values()]; cam.afstand = THREE.MathUtils.clamp(knijp.a * knijp.d / Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), 1.2, 14); }
  else { vaart = -dx * 0.007; cam.draai += vaart; cam.helling = THREE.MathUtils.clamp(cam.helling + dy * 0.004, -0.05, 1.35); }
  vraag();
});
const los = (e) => { wijzers.delete(e.pointerId); if (wijzers.size < 2) knijp = null; };
doek.addEventListener("pointerup", los); doek.addEventListener("pointercancel", los);
doek.addEventListener("wheel", (e) => { e.preventDefault(); camVolgt = false; cam.afstand = THREE.MathUtils.clamp(cam.afstand * Math.exp(e.deltaY * 0.001), 1.2, 14); vraag(); }, { passive: false });
const ray = new THREE.Raycaster();
doek.addEventListener("click", (e) => {
  const r = doek.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const zicht = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const h = ray.intersectObjects(meshes.filter(zicht), false).find((x) => !(x.object.userData.romp && huidig().doorzicht)) ; if (!h) return;
  const d = h.object.userData.deel;
  if (KINDMODUS) { kindTik(d); return; }
  if (d === "lichten") { lichtAan = !lichtAan; klik(); vraag(); return; }
  const i = SECTIES.findIndex((s) => s.focus?.includes(d)); if (i >= 0 && i !== sectie) gaSectie(i);
});

// ================= Tekenen =================
let vraagNu = true; const vraag = () => { vraagNu = true; };
const glad = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
function zetLens() {
  const fov = cam.fov || 32;
  camera.fov = camera.aspect < 1.2 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov * 0.62)) / camera.aspect)) : fov;
  camera.updateProjectionMatrix();
  if (rtKleur) lijnMat.uniforms.brandpunt.value = (rtKleur.height / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
}
function maat() {
  const r = doek.getBoundingClientRect(); renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / Math.max(1, r.height); zetLens(); maakDoelen(Math.round(r.width * DPR), Math.round(r.height * DPR)); vraag();
}
new ResizeObserver(maat).observe(doek);
let vorigeT = performance.now(), opening = params.has("stil") ? 1 : 0, kleppenNu = 0, roerT = 0, wielHoek = 0, lichtT = 0;
window.__meting = { frames: 0 };
function stap_(t) {
  requestAnimationFrame(stap_);
  const dt = Math.max(0, Math.min(0.05, (t - vorigeT) / 1000)); vorigeT = t;
  let bezig = false;
  const h = huidig();
  if (opening < 1) { opening = Math.min(1, opening + dt / 1.6); bezig = true; }
  if (camVolgt) { const k = Math.min(1, dt * 2.6); for (const key of ["draai", "helling", "afstand", "fov"]) cam[key] += (camDoel[key] - cam[key]) * k; zetLens(); cam.doel.lerp(camDoel.doel, k); if (Math.abs(camDoel.draai - cam.draai) + Math.abs(camDoel.afstand - cam.afstand) + cam.doel.distanceTo(camDoel.doel) > 0.002) bezig = true; }
  if (Math.abs(vaart) > 1e-4 && !wijzers.size) { cam.draai += vaart; vaart *= 0.94; bezig = true; }
  if (Math.abs(uiteenNu - uiteen) > 1e-3) { uiteenNu += Math.sign(uiteen - uiteenNu) * Math.min(Math.abs(uiteen - uiteenNu), dt / 1.6); bezig = true; if (uiteenNu < 0.02 || uiteenNu > 0.98) kleuren(); } else uiteenNu = uiteen;
  // bewegingen (simulatie, vertraagd)
  const fanDoel = h.draaien || uiteen ? 9 : 0; SNELHEID.fan += (fanDoel - SNELHEID.fan) * Math.min(1, dt * 1.5);
  if (SNELHEID.fan > 0.01) { for (const f of G.draaien) f.rotation.x += SNELHEID.fan * dt; bezig = true; }
  if (h.kleppen || h.roer || h.rollen || lichtAan || h.lichten || Math.abs(kleppenNu - (h.kleppen ? 0.55 : 0)) > 0.002) bezig = true;
  const kDoel = h.kleppen ? 0.55 : 0; kleppenNu += (kDoel - kleppenNu) * Math.min(1, dt * 2); for (const k of G.kleppen) k.rotation.z = kleppenNu;
  if (h.roer) roerT += dt; G.roer.rotation.y = h.roer ? Math.sin(roerT * 1.6) * 0.35 : G.roer.rotation.y * 0.9;
  if (h.rollen) { wielHoek -= dt * 2.5; for (const w of G.wielen) w.rotation.z = wielHoek; }
  lichtT += dt; const aan = lichtAan || h.lichten || uiteen;
  for (const k of ["teken", "donker"]) { MAT.roodlicht[k].emissiveIntensity = MAT.groenlicht[k].emissiveIntensity = MAT.witlicht[k].emissiveIntensity = aan ? 2.2 : 0.15; }
  G.lichten.zwaai.scale.setScalar(aan && lichtT % 1.1 < 0.12 ? 1.6 : 1);
  if (!rtKleur || (!bezig && !vraagNu)) return; vraagNu = false;
  zetUiteen();
  const o = glad(opening), dr = cam.draai - (1 - o) * 1.2, af = cam.afstand + (1 - o) * 5;
  camera.position.set(cam.doel.x + Math.sin(dr) * Math.cos(cam.helling) * af, cam.doel.y + Math.sin(cam.helling) * af, cam.doel.z + Math.cos(dr) * Math.cos(cam.helling) * af); camera.lookAt(cam.doel);
  renderer.setRenderTarget(rtKleur); renderer.setClearColor(0xffffff, 0); renderer.clear(); renderer.render(scene, camera);
  const f = focusVan(), bewaar = new Map();
  for (const m of meshes) { bewaar.set(m, m.material); m.material = !f || f.includes(m.userData.deel) || uiteen ? NORM_AAN : NORM_UIT; if (m.userData.romp && (h.doorzicht || uiteenNu > 0.01)) m.visible = false; }
  const zichtbaar = []; scene.traverse((x) => { if (x.userData?.geenLijn && x.visible) { zichtbaar.push(x); x.visible = false; } });
  grond.visible = false; renderer.shadowMap.autoUpdate = false;
  renderer.setRenderTarget(rtNormaal); renderer.setClearColor(0x8080ff, 0); renderer.clear(); renderer.render(scene, camera);
  renderer.shadowMap.autoUpdate = true; grond.visible = true; zichtbaar.forEach((x) => (x.visible = true));
  for (const [m, mat] of bewaar) { m.material = mat; m.visible = true; }
  renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
  namenBijwerken();
  window.__meting.frames++;
}
if (KINDMODUS) {
  document.body.classList.add("kindmodus");
  const strook = $("kindstrook");
  strook.innerHTML = KIND.map((k, i) => `<button type="button" data-i="${i}">${esc(k.naam.replace(/^(de|het) /, ""))}</button>`).join("");
  for (const b of strook.querySelectorAll("button")) b.addEventListener("click", () => { kindToon(+b.dataset.i); handWeg(); });
  $("kindknop").addEventListener("click", () => { kindGeluid(); handWeg(); });
  $("kindvorige").addEventListener("click", () => { kindToon(kindI - 1); handWeg(); });
  $("kindvolgende").addEventListener("click", () => { kindToon(kindI + 1); handWeg(); });
  let sx = null; doek.addEventListener("pointerdown", (e) => (sx = e.clientX)); doek.addEventListener("pointerup", (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 90 && !wijzers.size) kindToon(kindI + (e.clientX < sx ? 1 : -1)); sx = null; });
  try { if (localStorage.getItem("fiets-kind-hand")) $("kindhand")?.remove(); } catch {}
  kindToon(0, false);
} else { toon(); camNaar(SECTIES[0].cam); }
if (params.get("sectie")) gaSectie(+params.get("sectie"));
if (params.get("cam")) { const c = params.get("cam").split(",").map(Number); camNaar([c[0], c[1], c[2], [c[3], c[4], c[5]], c[6] || 32]); }
if (params.get("stand") === "tekening") document.querySelector('[data-stand="tekening"]').click(); else document.querySelector('[data-stand="echt"]').click();
if (params.has("uiteen")) { zetUitElkaar(true); if (params.has("af")) uiteenNu = 1; }
requestAnimationFrame(stap_);
window.__klaar = true;
window.__info = { meshes: meshes.length };

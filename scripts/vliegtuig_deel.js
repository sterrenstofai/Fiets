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

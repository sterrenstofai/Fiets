// ================= Het vliegtuig (schaal 1:10 in meters; de neus wijst naar +x, rechts is +z) =================
// Een algemeen tweemotorig passagiersvliegtuig, zelf getekend. Geen bestaand type, geen merk.
const vliegtuig = new THREE.Group(); scene.add(vliegtuig);
const G = { draaien: [], wielen: [], kleppen: [], roer: null, lichten: {} };
const RR = 0.2, LANG = 3.8, X0 = -1.9, YM = 0.45; // straal van de romp, lengte, achterkant, hoogte van de as
const ruimte = (t) => t * t * (3 - 2 * t);
const rompStraal = (t) => {
  if (t > 0.88) return Math.max(0.006, RR * Math.sqrt(Math.max(0, 1 - ((t - 0.88) / 0.12) ** 2)));
  if (t < 0.26) return 0.045 + (RR - 0.045) * ruimte(t / 0.26);
  return RR;
};
const rompY = (t) => YM + 0.13 * (1 - ruimte(Math.min(1, t / 0.26))) - (t > 0.88 ? 0.05 * ((t - 0.88) / 0.12) ** 2 : 0);
const rompX = (t) => X0 + LANG * t;
// ---- de romp
{
  const pts = Array.from({ length: 60 }, (_, i) => { const t = i / 59; return V(rompX(t), rompY(t), 0); });
  const romp = mesh(buis(pts, (t) => [rompStraal(t) * 1.04, rompStraal(t)], { seg: 160, rond: 44 }), "romp", "romp");
  romp.userData.romp = true;
  const ramen = [];
  for (let x = -1.2; x <= 1.25; x += 0.088) for (const k of [1, -1]) ramen.push(rondeDoos(0.034, 0.05, 0.006, 0.013).translate(x, YM + 0.045, k * (RR + 0.001)));
  const deuren = [];
  for (const x of [1.3, -1.32]) for (const k of [1, -1]) { const g = rondeDoos(0.09, 0.17, 0.004, 0.02); deuren.push(g.translate(x, YM - 0.005, k * (RR + 0.002))); }
  const ramenM = mesh(samen(ramen), "raam", "romp"), deurenM = mesh(samen(deuren), "naad", "romp");
  ramenM.userData.romp = deurenM.userData.romp = true;
  vliegtuig.add(romp, ramenM, deurenM);
  // cockpitramen: vier ruitjes op de neus, precies op het oppervlak
  const cr = [];
  for (const phi of [-1.15, -0.45, 0.45, 1.15]) {
    const x = 1.69, t = (x - X0) / LANG, rc = rompStraal(t) + 0.002, dir = V(0, Math.cos(phi), Math.sin(phi)).normalize();
    const g = rondeDoos(0.055, 0.04, 0.006, 0.01);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), dir.clone().add(V(0.55, 0, 0)).normalize()));
    cr.push(g.translate(x, rompY(t) + dir.y * rc * 1.04 * 0.62 + 0.035, dir.z * rc));
  }
  vliegtuig.add(mesh(samen(cr), "raam", "cockpit"));
}
// ---- vleugels met kleppen en winglets
function vlak(punten, dikte, soort, deel) { // een plat vlak in x,z met afgeronde randen
  const s = new THREE.Shape(); punten.forEach(([x, z], i) => (i ? s.lineTo(x, z) : s.moveTo(x, z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: dikte * 0.4, bevelEnabled: true, bevelThickness: dikte * 0.3, bevelSize: dikte * 0.45, bevelSegments: 4, curveSegments: 4 });
  g.rotateX(Math.PI / 2); g.translate(0, dikte * 0.2, 0); g.computeVertexNormals();
  return mesh(g, soort, deel);
}
const VL_Y = 0.355, V_HOEK = 0.09; // hoogte van de vleugelwortel, V-stand (5 graden)
const voorrand = (z) => 0.36 - (0.8 / 1.52) * (Math.abs(z) - 0.18);
for (const k of [1, -1]) {
  const vg = new THREE.Group(); vg.position.set(0, VL_Y, 0); vg.rotation.x = -k * V_HOEK;
  const p = [[0.36, 0.12], [-0.44, 1.7], [-0.6, 1.7], [-0.42, 0.95], [-0.36, 0.12]].map(([x, z]) => [x, k * z]);
  vg.add(vlak(p, 0.04, "romp", "vleugels"));
  const wl = new THREE.Shape(); wl.moveTo(-0.44, 0); wl.lineTo(-0.56, 0.2); wl.lineTo(-0.64, 0.2); wl.lineTo(-0.6, 0);
  const wg = new THREE.ExtrudeGeometry(wl, { depth: 0.012, bevelEnabled: false }); wg.translate(0, 0, -0.006);
  vg.add(op(mesh(wg, "romp", "vleugels"), 0, 0, k * 1.7));
  // kleppen achter het binnenste deel
  for (const [z0, z1] of [[0.24, 0.62], [0.66, 0.95]]) {
    const scharnier = new THREE.Group(); scharnier.position.set(-0.38 - 0.03 * (z0 - 0.24), 0, 0);
    const klep = vlak([[0, z0], [0, z1], [-0.11, z1], [-0.11, z0]].map(([x, z]) => [x, k * z]), 0.018, "klep", "kleppen");
    scharnier.add(klep); vg.add(scharnier); G.kleppen.push(scharnier);
  }
  // lampjes op de vleugeltip: rood links, groen rechts
  const lamp = op(mesh(new THREE.SphereGeometry(0.016, 16, 10), k > 0 ? "groenlicht" : "roodlicht", "lichten"), -0.5, 0.0, k * 1.69);
  vg.add(lamp); G.lichten[k > 0 ? "groen" : "rood"] = lamp;
  vliegtuig.add(vg); G[k > 0 ? "vleugelR" : "vleugelL"] = vg;
}
// ---- motoren
function nacel() {
  const prof = [[0.0, 0.29], [0.105, 0.29], [0.122, 0.27], [0.128, 0.2], [0.124, 0.02], [0.11, -0.12], [0.085, -0.2], [0.07, -0.21], [0.06, -0.2], [0.04, -0.29], [0.0, -0.31]];
  const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 56); g.rotateZ(-Math.PI / 2); return g;
}
for (const k of [1, -1]) {
  const z = k * 0.62, x = voorrand(z) + 0.03, y = VL_Y + 0.44 * V_HOEK - 0.15;
  const mg = new THREE.Group(); mg.position.set(x, y, z);
  const huis = mesh(nacel(), "romp", "motoren");
  const inlaat = op(mesh(new THREE.CylinderGeometry(0.104, 0.104, 0.02, 48).rotateZ(Math.PI / 2), "zwartmetaal", "motoren"), 0.26, 0, 0);
  const fan = new THREE.Group(); fan.position.x = 0.265;
  const bladen = []; for (let i = 0; i < 20; i++) { const b = new THREE.BoxGeometry(0.006, 0.092, 0.018); b.translate(0, 0.052, 0); b.rotateY(0.5); b.rotateX((i / 20) * TAU); bladen.push(b); }
  fan.add(mesh(samen(bladen), "metaal", "motoren"), op(mesh(new THREE.ConeGeometry(0.028, 0.06, 24).rotateZ(-Math.PI / 2), "metaal", "motoren"), 0.03, 0, 0));
  const pyloon = op(mesh(rondeDoos(0.36, 0.11, 0.025, 0.01), "romp", "motoren"), -0.04, 0.12, 0);
  mg.add(huis, inlaat, fan, pyloon); vliegtuig.add(mg);
  G.draaien.push(fan); G[k > 0 ? "motorR" : "motorL"] = mg;
}
// ---- de staart: richtingsroer en hoogteroeren
{
  const st = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-1.2, 0); s.lineTo(-1.66, 0.62); s.lineTo(-1.84, 0.62); s.lineTo(-1.76, 0.05); s.lineTo(-1.76, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.01, bevelSegments: 3 }); g.translate(0, 0, -0.006); g.computeVertexNormals();
  st.add(mesh(g, "romp", "staart"));
  const roer = new THREE.Group(); roer.position.set(-1.76, 0, 0);
  const rs = new THREE.Shape(); rs.moveTo(0, 0.04); rs.lineTo(-0.08, 0.61); rs.lineTo(-0.15, 0.6); rs.lineTo(-0.13, 0.05);
  const rg = new THREE.ExtrudeGeometry(rs, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }); rg.translate(0, 0, -0.005);
  roer.add(mesh(rg, "klep", "staart")); st.add(roer); G.roer = roer;
  st.position.set(0, rompY(0.08) + 0.03, 0); vliegtuig.add(st); G.staartVert = st;
  for (const k of [1, -1]) {
    const hg = new THREE.Group(); hg.position.set(0, rompY(0.06), 0); hg.rotation.x = -k * 0.1;
    hg.add(vlak([[-1.42, 0.02], [-1.74, 0.64], [-1.84, 0.64], [-1.8, 0.02]].map(([x, z]) => [x, k * z]), 0.022, "romp", "staart"));
    vliegtuig.add(hg); G[k > 0 ? "hoogteR" : "hoogteL"] = hg;
  }
  const staartlicht = op(mesh(new THREE.SphereGeometry(0.014, 12, 8), "witlicht", "lichten"), X0 - 0.005, rompY(0) + 0.0, 0); vliegtuig.add(staartlicht); G.lichten.wit = staartlicht;
  const zwaai = op(mesh(new THREE.SphereGeometry(0.018, 14, 8, 0, TAU, 0, Math.PI / 2), "roodlicht", "lichten"), 0.1, YM + RR * 1.04, 0); vliegtuig.add(zwaai); G.lichten.zwaai = zwaai;
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

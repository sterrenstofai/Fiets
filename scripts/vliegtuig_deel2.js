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
if (params.get("stand") === "tekening") document.querySelector('[data-stand="tekening"]').click(); else document.querySelector('[data-stand="echt"]').click();
if (params.has("uiteen")) { zetUitElkaar(true); if (params.has("af")) uiteenNu = 1; }
requestAnimationFrame(stap_);
window.__klaar = true;
window.__info = { meshes: meshes.length };

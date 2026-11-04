// De startpagina en de kinderkeuze: een kaart per voertuig. Op /kinderen gaat een tik naar de kinderstand.
import { lijst, pad } from "/js/voertuigen.js";
const kind = location.pathname.replace(/\/$/, "") === "/kinderen";
const doel = document.getElementById("voertuigen");
const groepen = [...new Set(lijst().map((v) => v.groep))];
for (const g of kind ? [null] : groepen) {
  if (g) { const h = document.createElement("h2"); h.className = "mono groepnaam"; h.textContent = g; doel.append(h); }
  const rij = document.createElement("div"); rij.className = "kaartrij"; doel.append(rij);
  for (const v of lijst().filter((x) => !g || x.groep === g)) {
    const a = document.createElement("a"); a.className = "kaart"; a.href = pad(v, kind);
    const img = document.createElement("img"); img.src = `/iconen/${v.slug}.svg`; img.alt = ""; img.width = 120; img.height = 70;
    const s = document.createElement("span"); s.textContent = kind ? v.naam : v.label;
    a.append(img, s); rij.append(a);
  }
}

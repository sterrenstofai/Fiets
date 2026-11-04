// Alle voertuigen op de site, in de volgorde van de keuzelijst. De fiets heeft een eigen app (app.js, met bouwstappen);
// de rest is een module in /js/voertuigen/<slug>.js voor /js/kern.js. Het plaatje staat in /iconen/<slug>.svg.
export const VOERTUIGEN = [
  { slug: "fiets", naam: "de fiets", label: "Fiets", groep: "op wielen" },
  { slug: "step", naam: "de step", label: "Step", groep: "op wielen" },
  { slug: "skateboard", naam: "het skateboard", label: "Skateboard", groep: "op wielen" },
  { slug: "trekker", naam: "de trekker", label: "Trekker", groep: "op de weg" },
  { slug: "vrachtwagen", naam: "de vrachtwagen", label: "Vrachtwagen", groep: "op de weg" },
  { slug: "bus", naam: "de bus", label: "Bus", groep: "op de weg" },
  { slug: "brandweerauto", naam: "de brandweerauto", label: "Brandweerauto", groep: "op de weg" },
  { slug: "vuilniswagen", naam: "de vuilniswagen", label: "Vuilniswagen", groep: "op de weg" },
  { slug: "trein", naam: "de trein", label: "Trein", groep: "op het spoor" },
  { slug: "boot", naam: "de boot", label: "Boot", groep: "op het water" },
  { slug: "vliegtuig", naam: "het vliegtuig", label: "Vliegtuig", groep: "in de lucht" },
];
// alleen wat er al is (een voertuig in aanbouw staat er nog niet in)
export const KLAAR = new Set(["fiets", "step", "skateboard", "vrachtwagen", "bus", "brandweerauto", "vuilniswagen", "trein", "vliegtuig", "boot"]);
export const lijst = () => VOERTUIGEN.filter((v) => KLAAR.has(v.slug));
export const pad = (v, kind = false) => (kind ? "/kinderen/" : "/") + v.slug;

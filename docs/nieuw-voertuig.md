# Een voertuig toevoegen

Elk voertuig behalve de fiets draait op de gedeelde motor `site/js/kern.js`. De motor regelt het licht, de materialen,
de inktlijnen, het paneel, de kinderstand, de namen met lijntjes, uit elkaar, de camera en het tekenen.
Een voertuig levert alleen zijn vorm en zijn teksten. Het voorbeeld is `site/js/voertuigen/vliegtuig.js`.

## Bestanden per voertuig (`<naam>` = slug, alleen kleine letters)

| Bestand | Wat |
|---|---|
| `site/js/voertuigen/<naam>.js` | de module: `export default function maak(ctx) { ... return { ... } }` |
| `site/iconen/<naam>.svg` | plaatje voor de startpagina en de kinderkeuze: viewBox `0 0 120 70`, lijnen `#1E1E1E` 2.2 breed, `fill="none"`, ronde uiteinden, één onderdeel in rood `#C8102E` |
| `scripts/weetjes/<naam>.json` | `{"secties": [sleutels], "weetjes": [[sectie, tekst, bron, controlezin], ...]}` |
| `site/data/weetjes-<naam>.json` | gemaakt door `python3 -I scripts/weetjes_voertuig.py <naam>`; niet met de hand |
| `data/weetjes_<naam>_controle.json` | idem: alle pogingen met http-status |

Daarna in `site/js/voertuigen.js` de naam toevoegen aan `KLAAR`. De adressen `/<naam>` en `/kinderen/<naam>`
staan al in `netlify.toml` voor alles wat in `VOERTUIGEN` staat (anders: toevoegen).

## Wat `maak(ctx)` krijgt

`{ THREE, V, TAU, root, MAT, soort, DELEN, meshes, mesh, groep, op, veeg, buis, samen, staaf, draai, rondeDoos, tandwiel, vleugelvorm, naarBuitenG, PROFIEL, mergeGeometries }`

- Bouw alles in `root` (een `THREE.Group`). Maten in meters van het echte voertuig (of een schaal die je noemt).
  De motor schaalt het geheel zodat het langste van lengte en breedte 4 is (`F = 4 / max(x, z)`),
  dus camera's en verschuivingen geef je in **jouw** eenheden; de motor vermenigvuldigt ze met F.
- Het voertuig staat op de grond: y = 0 is de vloer, het midden ongeveer bij x = 0, z = 0. De voorkant wijst naar +x.
- `mesh(geometrie, soort, deel)` maakt een mesh met materiaal `soort` en hangt hem aan onderdeel `deel`
  (voor oplichten, aantikken en de kinderstand). Hang hem zelf in een groep of in `root`.
  Zet `m.userData.romp = true` op de buitenkant als die doorzichtig moet worden (zie `doorzicht`).
- Materialen (`soort`): zie `SOORT` in kern.js: `romp` (wit/donker gelakt), `klep`, `raam`, `naad`, `stoel`, `vloer`,
  `frame`, `velg`, `carbon`, `metaal`, `schijf`, `spaak`, `zwartmetaal`, `ketting`, `loopvlak`, `wand`, `greep`, `rubber`,
  `zadel`, `lamp`, `achterlicht`, `scherm`, `cel`, `karton`, `rood`, `roodlicht`, `groenlicht`, `witlicht`.
  Een eigen kleur: `soort("groenlak", 0xd9e4d6, { color: 0x2f6b3a, roughness: 0.4, metalness: 0.1, clearcoat: 0.6 })`
  geeft de naam terug. Eerste kleur = stand "Tekening" (licht, papierachtig, de inktlijnen doen het werk),
  het object = stand "Donker" (`MeshPhysicalMaterial`-opties). Houd het rustig: geen felle plastic kleuren.
- Hulpjes: `buis(punten, r, {seg, rond})` buis langs een kromme (r mag een functie `t => [a, b]` zijn),
  `draai(profiel)` draaivorm om de z-as (wielen), `rondeDoos(x, y, z, r)` afgeronde doos, `staaf(a, b, r)`,
  `samen([geos])` geometrieën samenvoegen (één mesh is sneller), `groep(...objs)`, `op(obj, x, y, z)`.

## Wat `maak` teruggeeft

```js
return {
  titel: "De trekker", label: "Trekker", model: "Trekker · 4 wielen", schaal: "Maten in meters", hint: "Sleep om te draaien",
  SECTIES,   // 5 tot 8 onderdelen: { sleutel, naam, titel, tekst, cam, focus, specs, namen, ...vlaggen }
  KIND,      // 6 tot 10 voor de kinderstand: { naam: "de motor", focus: [delen], cam, geluid?: "brom", ...vlaggen }
  mini(aan),       // SVG-binnenwerk (paths/lines) voor viewBox 0 0 120 70: zijaanzicht; class="${aan('motor')}" maakt het rood
  beweeg(dt, h, s),// elke frame: h = huidige sectie of KIND-item (je eigen vlaggen), s = { uiteen, lichtAan, t }; true = er beweegt iets
  anker(),         // { sleutel: object } voor de namen met lijntjes in SECTIES[i].namen
  uiteen(),        // [[object, [dx, dy, dz], "NAAM" of null, [schermDx, schermDy]], ...] voor uit elkaar
  uiteenCam,       // [draai, helling, afstand, [doel x, y, z], fov]
  doorzicht(aan),  // optioneel: binnenkant tonen als de buitenkant doorzichtig is
  tik(deel),       // optioneel: iets doen bij een tik op een deel; true = afgehandeld
};
```

- `cam`: `[draai (radialen om y, 0 = van de zijkant +z), helling (radialen), afstand, [doel], fov]`.
- `SECTIES[i].specs`: `[["Label", "waarde"], ...]`; `["Lampjes", "tik", "lichten"]` maakt een tikregel die de lampen aan/uit zet.
  Een tik op een mesh met deel `"lichten"` doet hetzelfde.
- `SECTIES[i].namen`: `[[ankerSleutel, "HOOFDLETTERS", dx, dy], ...]` (dx, dy = verschuiving op het scherm in px).
- `sleutel` per sectie = de sleutel in `scripts/weetjes/<naam>.json`. De eerste sectie is het hele voertuig, `focus: null`.
- Geluiden (`STEM` in `site/js/stem.js`, allemaal nagemaakt): `bel`, `ratel`, `klik`, `straal`, `toeter`, `sirene`, `fluit`, `hoorn`, `brom`, `rol`.

## Afspraken

- Geen merk, geen logo, geen bestaand type nadoen (ook geen herkenbare kleurstelling van een vervoerder). Geen tekst op het voertuig.
- Teksten in het Nederlands, kort en direct, voor een kind van 4 tot 8 met een ouder ernaast. Let op de/het.
- Getallen in `specs` zijn maten van de tekening ("4,2 m in de tekening"), geen gegevens van een echt voertuig.
- Weetjes: alleen met een controlezin die letterlijk op de bronpagina staat (Nederlandse of Engelse Wikipedia).
- Veiligheid: niets dat een kind uitnodigt om iets echts open te maken of aan te raken (accu, motor, spoor, hoogspanning).

## Kijken

```bash
python3 scripts/server.py 8810
```

Open `http://127.0.0.1:8810/<naam>`, `/<naam>?uiteen&af`, `/kinderen/<naam>`, `/<naam>?sectie=2&stand=tekening`.
`window.__klaar` is true als de pagina staat; `window.__info` geeft het aantal meshes en de schaal.

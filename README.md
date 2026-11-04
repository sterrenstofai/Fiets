# Voertuigen (werktitel)

Voertuigen in 3D, in de browser, getekend in code: een racefiets met motor, een vliegtuig, een trekker, een trein, een boot en meer.
Draaien, onderdelen bekijken, uit elkaar halen, en een stand voor kinderen. De fiets zet je ook in negen stappen in elkaar.

```
site/                    wat live gaat (Netlify publiceert deze map)
  index.html             de startpagina: een kaart per voertuig (js/overzicht.js)
  kinderen.html          /kinderen: de kinderkeuze met grote plaatjes
  fiets.html             /fiets en /kinderen/fiets: de fiets (js/app.js), met bouwstappen
  voertuig.html          /<naam> en /kinderen/<naam>: elk ander voertuig (js/kern.js + js/voertuigen/<naam>.js)
  onderzoekjes.html      zes onderzoekjes met Fos (js/onderzoekjes.js), met logboek, stempel en certificaat
  mijn.html              Mijn fiets: wat je in het echt hebt gezien (js/mijnpagina.js, js/mijn.js)
  hoe-dit-werkt.html     wat echt is en wat niet, en de bronnen
  data/weetjes*.json     weetjes per voertuig, elk met bron en controlezin
  iconen/<naam>.svg      de plaatjes op de startpagina
  css/stijl.css
  js/voertuigen.js       de lijst van voertuigen (en welke klaar zijn)
  js/kiezer.js           de keuzestrook bovenaan het paneel
  js/kern.js             de gedeelde motor: licht, materialen, inktlijnen, paneel, kinderstand, uit elkaar, camera
  js/voertuigen/         een module per voertuig
  js/stem.js             de stem (Web Speech) en nagemaakte geluiden (Web Audio)
  js/vendor/             three.js r187 (MIT), BufferGeometryUtils, HDRLoader
  fonts/                 Geist, Geist Mono (OFL)
  modellen/              studio_small_09_1k.hdr (Poly Haven, CC0)
docs/nieuw-voertuig.md   hoe je een voertuig toevoegt
scripts/server.py        testserver met de redirects en de CSP uit netlify.toml
scripts/weetjes_voertuig.py <naam>   weetjes maken uit scripts/weetjes/<naam>.json (de fiets: weetjes_maken.py, het vliegtuig: weetjes_vliegtuig.py)
scripts/nakijken.py      alle weetjes maandelijks nakijken (.github/workflows/nakijken.yml)
tests/                   klikken.js, schermen.js (Playwright)
```

Lokaal: `python3 scripts/server.py 8765` en open `http://127.0.0.1:8765/`.
Handig bij het bijwerken: `?stand=tekening`, `?sectie=0..6`, `?uiteen&af`, `?stil`; bij de fiets ook `?stap=0..8&af` en `?klaar`.

Netlify: maak een project met publish-map `site`, en koppel de GitHub-repo (Project configuration → Build & deploy → Link repository).

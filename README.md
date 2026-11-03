# De fiets (werktitel)

Een racefiets met motor in 3D, in de browser. Draaien, onderdelen bekijken (zeven delen), uit elkaar halen, en in negen stappen in elkaar zetten.

```
site/                 wat live gaat (Netlify publiceert deze map)
  index.html          de app: podium links, paneel rechts; /kinderen is dezelfde pagina in de kinderstand
  onderzoekjes.html   zes onderzoekjes met Fos (js/onderzoekjes.js), met logboek, stempel en certificaat
  mijn.html           Mijn fiets: wat je in het echt hebt gezien (js/mijnpagina.js, js/mijn.js)
  data/weetjes.json   44 weetjes met bron en controlezin
  hoe-dit-werkt.html  wat echt is en wat niet, en de bronnen
  css/stijl.css
  js/app.js           de fiets (three.js), de anatomie, de bouwstappen, uit elkaar
  js/vendor/          three.js r187 (MIT), BufferGeometryUtils, HDRLoader
  fonts/              Geist, Geist Mono (OFL)
  modellen/           studio_small_09_1k.hdr (Poly Haven, CC0)
scripts/server.py     testserver met de redirects en de CSP uit netlify.toml
scripts/weetjes_maken.py, nakijken.py   weetjes maken en maandelijks nakijken (.github/workflows/nakijken.yml)
tests/                klikken.js, schermen.js (Playwright)
```

Lokaal: `python3 scripts/server.py 8765` en open `http://127.0.0.1:8765/`.
Handig bij het bijwerken: `?stand=tekening`, `?sectie=0..6`, `?stap=0..8&af`, `?klaar`, `?uiteen&af`, `?stil`.

Netlify: maak een project met publish-map `site`, en koppel de GitHub-repo (Project configuration → Build & deploy → Link repository).

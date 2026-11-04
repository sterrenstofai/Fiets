# De fiets (werktitel): werkafspraken

Ontstaan uit het autoproject (`/home/user/auto`, fase 1 datacheck). Op 3 november 2026 besloten: geen auto maar een racefiets met motor, getekend in code, naar het voorbeeld van een interactieve 3D-fiets (LinkedIn-video).

- **Eerlijk over wat de site niet weet.** De fiets is een "tekening" en de beweging een "simulatie". De getallen zijn maten van de tekening, geen gegevens van een echte fiets. Weetjes met een bron alleen met een controlezin (`nakijken.py` uit `sterrenstofai/deruimte`). Pagina `site/hoe-dit-werkt.html`.
- **Het vliegtuig** (besluit 4 november 2026): een algemeen tweemotorig passagiersvliegtuig, in code getekend op schaal 1:10, met anatomie (zeven onderdelen), uit elkaar en een kinderstand; geen bouwstappen. Schakelaar "Fiets | Vliegtuig" bovenaan het paneel. `site/js/vliegtuig.js` wordt gemaakt door `scripts/maak_vliegtuig.py` uit `scripts/vliegtuig_deel*.js` plus de weergave uit `app.js`: bewerk de delen, niet het resultaat.
- **Geen merk nadoen:** geen logo's, geen merknamen (dus geen TREK, Bontrager, SRAM, TQ).
- **Geen AI-beelden.** Alles in code; belichting is een CC0-HDR van Poly Haven.
- **Veiligheid:** bouwen doe je samen met een volwassene; het is geen handleiding voor een echte fiets; de accu maak je niet open.
- **Geen cookies, geen tracking**, niets naar andere sites. Stem = Web Speech van het toestel, klikgeluid nagemaakt (Web Audio, pas na een tik).
- **Browser-first:** statische site in `site/`, ES-modules, geen build-stap. three.js r187 (MIT) in `site/js/vendor/`, één keer verkleind met esbuild; versie vastgezet. Strikte CSP in `netlify.toml`; `scripts/server.py` stuurt dezelfde CSP mee.
- **Stijl:** lichtgrijs papier `#F1F0EE`, inkt `#1E1E1E`, rood accent `#C8102E`; Geist en Geist Mono (OFL), zelf gehost. Standaard de stand "Donker".
- **Nederlands**, direct, zonder marketingtoon. Let op de/het: de fiets, het frame, het stuur, de ketting, het wiel, de accu.
- **Testen:** `node tests/klikken.js` en `node tests/schermen.js <url> <map buiten de repo>` (360–1920 px). Processen stoppen via hun pid.

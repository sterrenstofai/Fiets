# Nieuw project: hoe werkt een auto? (werktitel)

Briefing om een nieuwe Claude Code-sessie mee te starten. Geschreven na het bouwen van drie sites voor ouders en kinderen:

- **Voggels** (voggels.nl): vogels in Twente. Code: `sterrenstofai/vogels`.
- **ikhooreengeluidje.nl**: nummers uit elkaar gehaald. Code: `sterrenstofai/ikhooreengeluidje`.
- **De Ruimte** (deruimte-vncz.netlify.app): de hemellichamen als draaiende 3D-bollen, de hemel van vanavond in 3D. Code: `sterrenstofai/deruimte`.

Alles wat daar werkte staat hieronder, met de valkuilen. Geef de nieuwe sessie toegang tot alle drie de repo's, zodat hij code kan overnemen in plaats van opnieuw te schrijven. Lees ook `docs/briefing.md`, `CLAUDE.md` en `docs/bollen-datacheck.md` in `sterrenstofai/deruimte`.

## Het idee

Mijn zoon (4 jaar, heet Fos) is gefascineerd door auto's. De site laat zien hoe een auto in elkaar zit, zowel een **benzineauto** als een **elektrische auto**, en wat het verschil is.

Aanleiding: een fietssite op LinkedIn (een interactieve 3D-fiets met anatomie, onderdelen en een bouwhandleiding in stappen). Wat daar goed werkte, en wat we willen:

- **Anatomie:** de auto in 3D, draaien met slepen. Tik op een onderdeel, dan licht het op en verschijnt uitleg met een paar getallen.
- **Uit elkaar halen:** een "explosietekening": de onderdelen schuiven uit elkaar en weer terug.
- **Stap voor stap:** in plaats van een fiets in elkaar zetten, hier: *wat gebeurt er als je wegrijdt?* Sleutel omdraaien of op de knop drukken, gas geven, schakelen, remmen. Elke stap een korte animatie.
- **Technische tekening:** een lijntekening met maten (lengte, wielbasis, spoorbreedte), net zo mooi als in die fietssite.
- **Twee standen:** "tekening" (lijnen) en "echt" (kleur en licht).
- **Geluid aan/uit en een stem** die de onderdelen uitlegt (Web Speech, zoals de kinderversie van ikhooreengeluidje).

Daarnaast, zoals bij de andere sites:

- **Per onderdeel één scherm:** groot beeld, weetjes, hoe het werkt, hoe het klinkt.
- **Benzine of elektrisch?** Elk onderdeel naast elkaar: wat heeft alleen een benzineauto (motor, tank, uitlaat, versnellingsbak), wat alleen een elektrische (accu, elektromotor, laadstekker), en wat hebben ze allebei (wielen, remmen, stuur, lampen).
- **Een kinderversie:** groot beeld, één knop, een stem die de naam zegt.
- **Onderzoekjes met Fos:** samen op onderzoek. Eerst op de site, dan naar buiten, naar de straat of de garage.

De naam en het domein kies ik zelf.

## Harde regels (overgenomen van Voggels, ikhooreengeluidje en De Ruimte)

- **Eerlijk over wat de site niet weet.** Wat geschat of nagemaakt is, staat zo op de site, met een label.
  - "simulatie" of "tekening" voor alles wat getekend of nagebootst is (een animatie van een zuiger is geen film van een echte motor).
  - "nagekeken" betekent: met de hand gecontroleerd, met een bron per feit.
  - Er komt een pagina "Hoe dit werkt / wat de site niet kan".
- **Een tekening is geen foto.** Een getekende of zelf gemodelleerde auto krijgt het label "tekening". Een foto blijft een foto, met maker en licentie.
- **Geen AI-beelden, ook niet om iets mooier te maken.** Bij De Ruimte is dat expliciet besloten: liever een egale bol met uitleg dan een verzonnen oppervlak. Hier hetzelfde: geen gegenereerde auto's, motoren of texturen. Echte foto's uit open collecties, zelf getekende 3D-modellen en open 3D-modellen met een nagekeken licentie.
- **Geen merk nadoen.** Geen logo's, geen merknaam als titel, geen ontwerp dat te herkennen is als één bepaald model (de fietssite gebruikte het merk TREK; dat doen wij niet). Een algemene auto, zelf getekend. Bij echte voorbeelden (een foto van een motor) mag het merk in de bronvermelding staan.
- **Veiligheid voor een kind van vier.**
  - Onderzoekjes zijn altijd samen met een volwassene, de auto staat stil en de motor is uit.
  - Niets zelf repareren of openmaken. Bij een elektrische auto zeggen dat de grote accu en de oranje kabels gevaarlijk zijn (hoogspanning): alleen kijken.
  - Geen uitleg die werkt als handleiding om aan een echte auto te sleutelen.
- **Geen cookies en geen tracking.** Wat je zelf bijhoudt (onderzoekjes, gespotte auto's) blijft in de browser van je eigen apparaat (localStorage of IndexedDB). Een kenteken dat je intikt wordt niet bewaard.
- **Browser-first.**
  - Ik werk zonder lokale ontwikkelomgeving.
  - Statische site (HTML, CSS, losse ES-modules, geen framework, geen build-stap), live via Netlify, data ververst door GitHub Actions.
  - Strikte CSP.
  - Een 3D-bibliotheek mag, als los ES-modulebestand in de repo (bijvoorbeeld three.js, MIT), zonder build-stap. De Ruimte deed 3D zonder bibliotheek (WebGL zelf, zie `site/js/bolgl.js`); voor een auto met losse onderdelen is three.js waarschijnlijk handiger. Laat dat in fase 1 afwegen.
- **Communicatie en sitetekst in het Nederlands,** direct en zonder marketingtoon. Let op "de" en "het": de motor, het stuur, de accu, het wiel, de uitlaat.
- **Licenties per bron nakijken voordat iets in de repo komt.** Ook van 3D-modellen en geluiden.
- **Eerst een datacheck, dan stoppen** (fase 1, zie onderaan). Pas bouwen na mijn akkoord.

## Opbouw en uiterlijk: zoals de andere drie

Neem dit over uit de code, en schrijf het niet opnieuw.

**De auto in 3D (het hart van de site)**
- Een groot podium met de auto, draaien met slepen, zoomen met knijpen of scrollen (De Ruimte: `site/js/bolgl.js` en `site/js/hemelkaart.js` voor slepen met vaart, knijpen en een openingsanimatie).
- Tik op een onderdeel: het licht op in de accentkleur, de rest wordt grijs, en rechts verschijnt de uitleg.
- Een knop "Benzine / Elektrisch" die de auto omzet: de motor wordt een accu en een elektromotor, de tank een laadstekker, de uitlaat verdwijnt.
- Een knop "Uit elkaar": de onderdelen schuiven langzaam uit elkaar.
- Licht van één kant, zodat het rond oogt (zoals de bollen in De Ruimte).
- Altijd op wit, geen zwart vlak eromheen (zo wilde ik het bij De Ruimte ook).

**Eén scherm per onderdeel**
- In het midden het podium met tabjes. Titel en weetjes (`<dl class="weetjes">`) linksonder. Onderaan een strook met verwante onderdelen.
- Bijvoorbeeld deze tabjes:
  - **3D:** het onderdeel los, draaiend.
  - **Zo werkt het:** een animatie (de vier slagen van een benzinemotor; stroom die van de accu naar de motor loopt). Label "simulatie".
  - **Foto:** een echte foto, met maker en licentie.
  - **Geluid:** wat je hoort (de motor, de richtingaanwijzer, het zoemen van een elektrische auto, het piepje bij achteruit).
  - **Benzine of elektrisch:** hoe het bij de ander zit.

**Index en zoeken**
- Index van alle onderdelen met filterchips (Motor en aandrijving, Wielen en remmen, Binnen, Licht en geluid, Alleen benzine, Alleen elektrisch).

**Kop, voet, typografie**
- Zoals De Ruimte: logo, zoekveld, een knop "Ontdek een onderdeel", icoontjes voor onderzoekjes, kinderen, "Mijn garage" (met teller) en de index.
- Letters: Geist en Geist Mono (OFL), zelf gehost. Koppen dun (gewicht 300) en strak gespatieerd. Kleine labels in Geist Mono, hoofdletters.
- Wit `#FFFFFF`, inkt `#232323`, grijs `#F4F4F4`, `#D9D9D9`, `#6E6E6E`. Altijd een licht thema (`color-scheme: only light`).
- **Een eigen accentkleur in de familie.** Voggels is zalm, De Ruimte lavendel (`#B5B1E5`), Ik hoor een geluidje mint. Kies er een die ernaast past en anders is: bijvoorbeeld een zacht geel (verkeersbord, speelgoedauto) of een zacht blauw. Laat in fase 1 twee voorstellen zien; ik kies.
- Kleur zit in vlakken, niet in letters. Een accentwoord in een kop krijgt een vlak in de accentkleur.

**Kinderversie** (`/kinderen`, kopieer `site/js/kinderen.js` uit De Ruimte of ikhooreengeluidje)
- Een groot beeld en een grote knop in de accentkleur. Een stem die de naam zegt ("de motor", "het wiel") als je erop tikt.
- Een geluid bij elk onderdeel als dat er is (de toeter, de richtingaanwijzer).

**Onderzoekjes met Fos** (`/onderzoekjes`, kopieer `site/js/onderzoekjes.js`)
- Zes opdrachten, elk met "Wat heb je nodig", "Zo doe je het", een interactief stuk en een blok "En dan naar buiten".
- Voortgangsbalk, logboek, stempel "Gedaan", certificaat met naam als A4-PNG.

**"Mijn garage"** (kopieer `site/js/mijn.js`)
- Een plusje bij elk onderdeel dat je in het echt hebt gezien (de uitlaat van de buurman, een laadpaal in de straat), met datum.

## Techniek: wat werkte (zie ook de briefing in `sterrenstofai/deruimte/docs/briefing.md`)

- Opbouw van de repo zoals De Ruimte: `site/` (Netlify), `data/` (ruw en met de hand), `scripts/` (Python), `tests/` (Playwright), `docs/`, `.github/workflows/`, `netlify.toml`, `CLAUDE.md`.
- **Data in lagen:** automatisch uit open bronnen in `data/ruw/`, met de hand met een bron per feit in `data/handwerk/<slug>.json`, een bouwscript maakt `site/data/*.json`. Weetjes alleen met een controlezin die letterlijk op de bronpagina staat (kopieer `scripts/nakijken.py` uit De Ruimte).
- **Geluid:** op iOS afspelen direct in de tik, zonder `await` ervoor. Eén `<audio>`-element voor de hele site (`site/js/geluid.js`).
- **Netlify:** Claude kan het project aanmaken; de GitHub-repo koppel ik zelf.
- **CSP:** strikt, met per externe bron een uitzondering. De lokale testserver stuurt dezelfde CSP mee (`scripts/server.py`).
- **Testen:** Playwright met schermafbeeldingen op 360, 390, 768, 1024, 1366 en 1920 px; controle op horizontaal scrollen en fouten in de console; een klikscript dat alles doorklikt (draaien, onderdeel kiezen, uit elkaar, benzine/elektrisch, stappen).
- **Bij veel zoekwerk** (bronnen en licenties): laat een hulpagent het uitzoeken en kijk de belangrijkste licenties daarna zelf na.

## Valkuilen waar we in liepen (bij alle drie)

- **CSS overnemen:** knip niet midden in een `@media`-blok. Tel daarna `{` en `}`.
- **`pkill -f` met een woord uit je eigen opdracht doodt je eigen shell.** Stop een proces via zijn pid.
- **Schermafbeeldingen met een relatief pad** belandden in `site/` en gingen mee live. Schrijf testuitvoer altijd naar een vaste map buiten de repo.
- **Een bron met een onvolledige certificaatketen** (archive.stsci.edu): niet de controle uitzetten, maar het ontbrekende tussencertificaat meeleveren.
- **Wikimedia (Commons, Wikipedia-API) blokkeert gewone machines.** Ophalen via een GitHub Action.
- **Een race bij het laden:** begin pas met tekenen als alle data binnen is (een ResizeObserver kan eerder afgaan).
- **Kun je iets niet zelf zien of horen, zeg dat dan** en meet het op een andere manier.

## Mogelijke bronnen (eerst controleren in fase 1)

**Gegevens over auto's**
- **RDW Open Data** (opendata.rdw.nl, gekentekende voertuigen): merk, brandstof (benzine, diesel, elektrisch, hybride), kleur, aantal deuren, gewicht, vermogen. Licentie en CORS nakijken. Mooi voor een onderzoekje: "tik het kenteken van onze auto in: rijdt hij op benzine of op stroom?" Het kenteken niet bewaren; er staan geen persoonsgegevens in, maar zeg dat erbij.
- **CBS Statline:** hoeveel auto's er in Nederland zijn, en hoeveel elektrisch. Licentie CC BY 4.0, nakijken.
- **Laadpalen:** open data (bijvoorbeeld OpenChargeMap of NDW). Licentie en CORS nakijken.
- **Wikidata/Wikipedia:** algemene getallen (een benzinemotor heeft meestal 3 of 4 cilinders, toerental, hoe een accu werkt). Altijd met een bron per feit.

**Beeld**
- **Wikimedia Commons:** opengewerkte motoren, versnellingsbakken, accupakketten, foto's van onderdelen (via een GitHub Action, licentie per bestand).
- **Musea:** Louwman Museum, Smithsonian Open Access (CC0), Science Museum Group (licentie nakijken).
- **Geen persfoto's van merken** zonder vrije licentie.

**3D**
- **Zelf getekend:** een algemene auto uit eenvoudige vormen (zoals de fietssite "in code getekend" is). Eerlijk label "tekening". Waarschijnlijk de beste weg: dan bepaal je zelf welke onderdelen los kunnen.
- **Open modellen:** Smithsonian 3D (CC0), Khronos glTF-voorbeeldmodellen, Sketchfab met CC0 of CC BY. Licentie, maker en of het een bestaand merk nadoet, per model nakijken.

**Geluid**
- **Echte opnames:** Freesound (alleen CC0 of CC BY, per bestand nakijken), Wikimedia Commons, de BBC Sound Effects-licentie is waarschijnlijk niet goed genoeg (nakijken).
- Een benzinemotor die start en stationair draait, optrekken, de richtingaanwijzer, de toeter, een elektrische auto die wegrijdt (met het verplichte zoemgeluid bij lage snelheid), een laadpaal die klikt.
- **Eerlijk:** een nagemaakt geluid (Web Audio) krijgt het label "nagemaakt".

## Inhoud: een vaste kern van ongeveer 25 onderdelen

**Allebei:** de carrosserie, het chassis, de wielen en banden, de remmen, het stuur, de vering, de lampen, de ruitenwissers, de toeter, de stoelen en gordels, de kleine accu (12 volt).

**Alleen benzine:** de motor (met zuigers en cilinders), de tank, de uitlaat, de versnellingsbak en de koppeling, de bougies, de radiator.

**Alleen elektrisch:** de grote accu, de elektromotor, de laadstekker en het laden, de omvormer, terugwinnen bij het remmen.

**Stap voor stap: wat gebeurt er als je wegrijdt?**
1. Starten (sleutel of knop): bij benzine draait een startmotor de motor aan; bij elektrisch gaat er alleen een lampje aan, het is stil.
2. Gas geven: benzine en lucht ontploffen in de cilinders (vier slagen); of stroom gaat van de accu naar de motor.
3. Schakelen (alleen benzine met handbak).
4. Sturen.
5. Remmen: remblokken knijpen de schijf; een elektrische auto remt ook met de motor en laadt zo de accu bij.
6. Tanken of laden.

## Ideeën voor Onderzoekjes met Fos (4 jaar)

1. **Hoor je het verschil?** Luister naar twee auto's: welke rijdt op benzine, welke op stroom? Dan naar de straat: luister naar auto's die langsrijden.
2. **Tel de wielen.** Hoeveel wielen heeft een auto, een bus, een vrachtwagen? Buiten tellen, en op de site kijken of het klopt.
3. **Benzine of stroom?** Tik het kenteken van je eigen auto in (RDW). Dan in de straat: zie je een laadpaal? Een auto aan de stekker? Zonder uitlaat?
4. **Onder de motorkap.** Samen met een volwassene, motor uit: wat herken je van de site? (De accu, de ruitensproeiervloeistof.) Bij een elektrische auto: alleen kijken.
5. **Remmen op een plank.** Een speelgoedauto van een plank laten rollen: hoe ver komt hij op de vloer, op het tapijt, op een handdoek? Waarom remmen banden beter op droge weg dan op ijs?
6. **Bouw een auto.** Van karton, doppen en rietjes, met de onderdelen van de site: wielen, as, stuur, motor of accu. De site laat zien welke onderdelen je nodig hebt.

## Fase 1: eerst een datacheck, dan stoppen

Net als bij de andere drie: eerst kijken wat er echt is, voordat er iets gebouwd wordt.

- **Een testset van ongeveer 12 onderdelen:** de motor, de grote accu, de elektromotor, de wielen, de remmen, de uitlaat, de tank, de laadstekker, de versnellingsbak, het stuur, de lampen, de toeter.
- **Per onderdeel meten:**
  - Is er een echte foto met een vrije licentie? Van wie, en onder welke licentie?
  - Is er een echte geluidsopname met een licentie die ons gebruik toestaat?
  - Zijn er drie of vier weetjes met een bron, en een controlezin die letterlijk op de bronpagina staat?
- **3D:**
  - Een proef: een algemene auto in code getekend, met minstens vijf losse onderdelen die oplichten en uit elkaar schuiven. Hoe ziet het eruit, hoe snel is het op een telefoon?
  - Een lijst van open 3D-modellen met licentie, en of ze een merk nadoen.
  - Advies: three.js (los bestand) of zelf WebGL.
- **RDW:** werkt de API vanuit de browser (CORS)? Wat geeft één kenteken terug? Licentie?
- **Twee voorstellen voor de accentkleur,** naast zalm, lavendel en mint.
- **Rapport in het Nederlands,** in `docs/fase1-datacheck.md`. Scripts en ruwe uitkomsten in `datacheck/`.
- **Daarna stoppen en wachten op mijn akkoord.**

## Open vragen voor mij

- **De naam en het domein.** Nog vrij bij SIDN op 3 november 2026 (zelf registreren): hoewerkteenauto.nl, autokieker.nl ("kieken" is Twents voor kijken, zoals Voggels), kijkonderdekap.nl. Al bezet: vroemvroem.nl, broembroem.nl, tuuttuut.nl, motorkap.nl, onderdemotorkap.nl. Het mooiste is een uitspraak van Fos zelf, zoals bij ikhooreengeluidje.
- **Een eigen repo:** maak ik aan op GitHub. Daarna koppel ik hem zelf aan Netlify.
- **Ook diesel, hybride en waterstof,** of alleen benzine en elektrisch? (Voorstel: eerst benzine en elektrisch; hybride als "allebei" in één zin.)
- **Ook andere voertuigen** (bus, vrachtwagen, tractor, vuilniswagen)? Kinderen van vier vinden die vaak net zo mooi. Voorstel: eerst de auto, later uitbreiden.
- **Mag de site een kenteken opzoeken bij de RDW?** Alleen als je het zelf intikt, niet bewaard.

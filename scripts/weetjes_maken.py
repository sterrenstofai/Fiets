"""Maakt site/data/weetjes.json: weetjes per onderdeel van de fiets, elk met bron en controlezin.

Haalt elke bron op en zoekt de controlezin letterlijk op de pagina, met norm()/haal() uit
scripts/nakijken.py (zelfde normalisatie als sterrenstofai/deruimte). Alleen gevonden weetjes
gaan naar de site; alle pogingen (met http-status) naar data/weetjes_controle.json.
Daarna kan scripts/nakijken.py maandelijks dezelfde weetjes opnieuw nakijken.

Let op bij Wikipedia: na een link staat in de tekst een spatie voor de leestekens
("frame , een zadel"), dus een controlezin niet net na een link laten eindigen of
een leesteken erachter zetten.

Alleen standaardbibliotheek: python3 -I scripts/weetjes_maken.py
"""
import json, sys
from datetime import date
from pathlib import Path

HIER = Path(__file__).resolve().parent
ROOT = HIER.parent
sys.path.insert(0, str(HIER))  # python3 -I zet de scriptmap niet in sys.path
from nakijken import haal, norm  # noqa: E402

NL = "https://nl.wikipedia.org/wiki/"
EN = "https://en.wikipedia.org/wiki/"
REGELING = "https://wetten.overheid.nl/BWBR0025798/"  # Regeling voertuigen (hfst. 5, afdeling 9: fietsen)
RVV = "https://wetten.overheid.nl/BWBR0004825/"       # RVV 1990 (art. 35: verlichting fietsers)
RO = "https://www.rijksoverheid.nl/themas/verkeer-en-vervoer/fiets"
RO_EBIKE = RO + "/vraag-en-antwoord/fiets/welke-regels-gelden-voor-mijn-elektrische-fiets-e-bike"
RO_LICHT = RO + "/vraag-en-antwoord/fiets/wat-zijn-de-regels-voor-fietsverlichting-en-reflectie-op-een-fiets"
RO_KIND = RO + "/vraag-en-antwoord/voertuigen-op-de-weg/moet-mijn-kind-achterop-een-fiets-snorfiets-of-bromfiets-in-een-fietsstoeltje"
VVN_HELM = "https://vvn.nl/fietshelm"

# (sectie, tekst voor de site, bron, controlezin zoals die op de bronpagina staat)
WEETJES = [
    # de fiets
    ("fiets", "De allereerste fiets had nog geen trappers. Je duwde jezelf vooruit met je voeten op de grond.", NL + "Fiets",
     "de berijder bewoog zich voort door zich af te zetten tegen de grond."),
    ("fiets", "De loopfiets werd bedacht door Karl Drais. De eerste was er in 1817, meer dan 200 jaar geleden.", NL + "Fiets",
     "het eerste exemplaar ontstond in 1817."),
    ("fiets", "Kleine kinderen leren nu vaak fietsen op een loopfiets, al vanaf ongeveer 2 jaar.", NL + "Loopfiets",
     "populair als speelgoed en oefenmiddel voor jonge kinderen (vanaf ca. 2 jaar oud)"),
    ("fiets", "In Nederland zijn ongeveer 18 miljoen fietsen. Dat zijn er meer dan er mensen zijn die kunnen fietsen.", EN + "Cycling_in_the_Netherlands",
     "the country's 18 million bicycles (1.3 per citizen old enough to ride)"),
    # het frame
    ("frame", "Het frame van een racefiets is gemaakt van twee driehoeken: een grote voor en een kleinere achter.", EN + "Bicycle_frame",
     "a main triangle and a paired rear triangle"),
    ("frame", "Een frame moet sterk, stijf en licht zijn.", EN + "Bicycle_frame",
     "frames are required to be strong, stiff and light"),
    ("frame", "Veel racefietsen hebben een frame van carbon. Carbon is licht en sterk, maar duur.", EN + "Bicycle_frame",
     "although expensive, it is light-weight, corrosion-resistant and strong"),
    ("frame", "Een frame kan ook van aluminium zijn. Dat is lichter dan staal.", EN + "Bicycle_frame",
     "giving them notable weight advantages over steel"),
    # de motor
    ("motor", "Een elektrische fiets helpt alleen als je zelf trapt. Je moet altijd meetrappen.", RO_EBIKE,
     "u moet meetrappen om vooruit te komen."),
    ("motor", "Stop je met trappen, dan moet de motor meteen stoppen met helpen.", NL + "Elektrische_fiets",
     "de motor moet dan ook direct stil vallen als de gebruiker stopt met trappen."),
    ("motor", "De motor helpt tot 25 kilometer per uur. Wil je harder, dan moet je dat zelf doen.", RO_EBIKE,
     "een elektrische fiets heeft trapondersteuning tot maximaal 25 kilometer per uur."),
    ("motor", "De motor is niet heel sterk: hoogstens 250 watt.", RO_EBIKE,
     "de elektromotor van een elektrische fiets heeft een vermogen van maximaal 250 watt."),
    ("motor", "De accu moet goed vastzitten aan de fiets.", REGELING,
     "de accu, indien aanwezig, van fietsen moet deugdelijk zijn bevestigd."),
    # de aandrijving
    ("aandrijving", "De ketting brengt de kracht van de trappers naar het achterwiel.", NL + "Fietsketting",
     "zorgt voor de krachtoverbrenging van het pedaal naar het achterwiel"),
    ("aandrijving", "Achter zitten tandwielen van verschillende maten. De derailleur duwt de ketting van het ene tandwiel naar het andere. Zo schakel je.", NL + "Derailleur",
     "de fietsketting van het ene kettingwiel naar het andere kettingwiel kan worden gebracht"),
    ("aandrijving", "De derailleur heeft twee kleine wieltjes. Daar loopt de ketting overheen.", NL + "Derailleur",
     "deze derailleur heeft vrijwel altijd twee kettingwieltjes waarover de ketting geleid wordt."),
    ("aandrijving", "Het woord derailleur komt uit het Frans.", EN + "Derailleur_gears",
     'the word "derailleur" is derived from the french word dérailleur'),
    ("aandrijving", "De schakels van de ketting zitten een halve inch uit elkaar: 12,7 millimeter.", NL + "Fietsketting",
     "hebben fietskettingen een steek (de afstand tussen de asjes) van een halve inch (12,7 mm)."),
    # de wielen
    ("wielen", "Een fietswiel heeft dunne spaken, vaak 24, 28, 32 of 36. Tel ze maar eens.", EN + "Bicycle_wheel",
     "conventional metallic bicycle wheels have 24, 28, 32 or 36 spokes."),
    ("wielen", "In de band zit lucht. Die lucht draagt bijna al het gewicht, de band zelf de rest.", NL + "Luchtband",
     "de spanning van de lucht in een band draagt 90% van de last die erop rust."),
    ("wielen", "John Boyd Dunlop zag dat zijn zoontje moeilijk reed op een driewieler met harde banden. Daarom maakte hij een band vol lucht.", NL + "John_Boyd_Dunlop",
     "hij zag hoe zijn zoontje moeite had om op zijn driewieler met harde rubberbanden te rijden"),
    ("wielen", "Dunlop vroeg in 1888 patent aan op zijn band met lucht.", NL + "John_Boyd_Dunlop",
     "hij vroeg in 1888 patent hierop aan."),
    ("wielen", "De allereerste fietsen hadden geen rubber banden, maar ijzeren banden om houten wielen.", EN + "Bicycle_tire",
     'the first bicycle "tires" were iron bands on the wooden wheels'),
    # de remmen
    ("remmen", "Een fiets in Nederland moet een rem hebben die goed werkt.", REGELING,
     "fietsen moeten zijn voorzien van een goed werkende rem."),
    ("remmen", "Bij een schijfrem draait een schijf mee met het wiel. Remblokken knijpen ertegen, en dan gaat de fiets langzamer.", NL + "Schijfrem",
     "door het aandrukken van remblokken tegen een remschijf, wrijving ontstaat."),
    ("remmen", "Door het remmen wordt de schijf warm. Niet aankomen dus.", NL + "Schijfrem",
     "de bewegingsenergie van het voertuig waarop de rem gemonteerd is, wordt in warmte omgezet."),
    ("remmen", "Bijna alle racefietsen hebben nu schijfremmen.", EN + "Disc_brake",
     "by 2024, almost all road bikes are equipped with disc brakes"),
    ("remmen", "De remschijven van een fiets zijn meestal van staal.", EN + "Disc_brake",
     "most bicycle brake discs are made of steel."),
    # de cockpit (stuur, bel, lampen)
    ("cockpit", "Een fiets in Nederland moet een bel hebben die goed werkt.", REGELING,
     "fietsen moeten zijn voorzien van een goed werkende bel."),
    ("cockpit", "Die bel is al verplicht sinds 1906.", NL + "Fietsbel",
     "in nederland is het hebben van een fietsbel op een fiets vanaf 1906 verplicht."),
    ("cockpit", "De bel zit meestal links op het stuur. Je belt met je duim.", NL + "Fietsbel",
     "een fietsbel is een kleine bel die over het algemeen links op het stuur van een fiets is gemonteerd, en die meestal met de duim wordt bediend."),
    ("cockpit", "In het donker moet je licht aan op de fiets: voor en achter.", RO_LICHT,
     "als fietser moet u in het donker en bij slecht zicht een voorlicht en achterlicht aan hebben."),
    ("cockpit", "Het lampje voor is wit of geel. Het lampje achter is rood. Ze mogen niet knipperen.", RO_LICHT,
     "vaste verlichting op de fiets mag niet knipperen: het achterlicht is rood, het voorlicht is wit of geel."),
    ("cockpit", "Dat rode achterlicht staat ook in de verkeersregels.", RVV,
     "een fiets moet zijn voorzien van een rood achterlicht dat aan de achterzijde wordt gevoerd"),
    # de geometrie (de vorm)
    ("geometrie", "Een racefiets is gemaakt om hard te gaan. Hij moet licht zijn en weinig last hebben van de wind.", NL + "Racefiets",
     "twee zaken zijn hierbij van belang: de luchtweerstand en het gewicht."),
    ("geometrie", "Het stuur zit lager dan het zadel. Dan zit je voorovergebogen en heb je minder last van de wind.", EN + "Racing_bicycle",
     "the drop handlebars are positioned lower than the saddle to put the rider in a more aerodynamic posture."),
    ("geometrie", "Een racefiets zit minder lekker dan een gewone fiets, maar hij gaat wel sneller.", EN + "Racing_bicycle",
     "racing bicycles sacrifice comfort for speed compared to non-racing bicycles."),
    ("geometrie", "De wielen staan dicht bij elkaar. Daardoor stuurt een racefiets snel.", EN + "Racing_bicycle",
     "the front and back wheels are close together so the bicycle has quick handling"),
    ("geometrie", "De wielen van een racefiets heten 700C. De velg is 622 millimeter groot.", EN + "Racing_bicycle",
     "most road bicycles use 700c bicycle wheels (622 mm bead seat diameter)"),
    # de veiligheid
    ("veiligheid", "Een fietshelm is in Nederland niet verplicht, maar wel slim.", VVN_HELM,
     "een fietshelm dragen is in nederland niet verplicht, maar wel raadzaam."),
    ("veiligheid", "Met een helm is de kans op ernstig hoofdletsel ongeveer 60 procent kleiner.", RO,
     "draag daarom een helm en verklein daarmee de kans op ernstig hoofdletsel met ongeveer 60%."),
    ("veiligheid", "De helm zit vast met een riempje onder je kin.", NL + "Fietshelm",
     "de helm wordt met een riempje links en rechts onder de kin aan het hoofd vastgemaakt"),
    ("veiligheid", "Ben je gevallen met je helm op? Dan heb je een nieuwe helm nodig, ook als je niets ziet.", NL + "Fietshelm",
     "na een dergelijk voorval moet de helm worden vervangen"),
    ("veiligheid", "Zit je achterop bij een grote? Dan heb je steuntjes voor je voeten nodig, zodat ze niet tussen de spaken komen.", RO_KIND,
     "als een kind achter op een fiets zit, kan een voet tussen de spaken komen."),
]

SECTIES = ["fiets", "frame", "motor", "aandrijving", "wielen", "remmen", "cockpit", "geometrie", "veiligheid"]


def main():
    alle = []
    for sectie, t, bron, controle in WEETJES:
        status, pagina = haal(bron)
        gevonden = "onbereikbaar" if pagina is None else norm(controle) in pagina
        if gevonden is not True:
            print(f"  {gevonden}: {sectie}: {controle[:60]} ({bron}, {status})")
        alle.append({"sectie": sectie, "tekst": t, "bron": bron, "controle": controle,
                     "gevonden": gevonden, "http": status})
    vandaag = date.today().isoformat()
    secties = {s: [] for s in SECTIES}
    for w in alle:
        if w["gevonden"] is True:
            secties[w["sectie"]].append({"tekst": w["tekst"], "bron": w["bron"], "controle": w["controle"], "gevonden": True})
    per_sectie = {s: {"geprobeerd": sum(w["sectie"] == s for w in alle), "gevonden": len(secties[s])} for s in SECTIES}
    (ROOT / "site" / "data").mkdir(parents=True, exist_ok=True)
    (ROOT / "site" / "data" / "weetjes.json").write_text(
        json.dumps({"datum": vandaag, "secties": secties}, indent=1, ensure_ascii=False) + "\n")
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "weetjes_controle.json").write_text(
        json.dumps({"datum": vandaag, "per_sectie": per_sectie, "pogingen": alle}, indent=1, ensure_ascii=False) + "\n")
    for s, v in per_sectie.items():
        print(f"{s:12} {v['gevonden']}/{v['geprobeerd']}")
    print(f"{sum(v['gevonden'] for v in per_sectie.values())} van {len(alle)} weetjes gevonden")


if __name__ == "__main__":
    main()

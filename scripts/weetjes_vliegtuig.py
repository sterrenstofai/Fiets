"""Maakt site/data/weetjes-vliegtuig.json: weetjes per onderdeel van het vliegtuig, elk met bron en controlezin.

Zelfde werkwijze als scripts/weetjes_maken.py (de fiets): elke bron ophalen met haal() uit
scripts/nakijken.py en de controlezin letterlijk zoeken op de pagina (na norm()). Alleen gevonden
weetjes gaan naar de site; alle pogingen (met http-status) naar data/weetjes_vliegtuig_controle.json.
Het vliegtuig is een gewoon passagiersvliegtuig met twee motoren en één gangpad, zonder merk.
Daarna kijkt scripts/nakijken.py deze weetjes maandelijks opnieuw na.

Let op bij Wikipedia: na een link staat in de tekst een spatie voor de leestekens
("versneld , waardoor"), dus een controlezin niet net na een link met een leesteken laten eindigen.

Alleen standaardbibliotheek: python3 -I scripts/weetjes_vliegtuig.py
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

# (sectie, tekst voor de site, bron, controlezin zoals die op de bronpagina staat)
WEETJES = [
    # het vliegtuig
    ("vliegtuig", "Een vliegtuig vliegt door zijn vleugels. De vleugel duwt de lucht naar beneden, en dan gaat het vliegtuig omhoog. Dat heet lift.", NL + "Vliegtuig",
     'de vleugel buigt de lucht die er langs stroomt af, en veroorzaakt "lift".'),
    ("vliegtuig", "Een vliegtuig moet hard genoeg gaan. Zolang het hard genoeg gaat, blijft het in de lucht.", NL + "Vliegtuig",
     "zolang het vliegtuig dus voldoende snelheid heeft, blijft het in de lucht."),
    ("vliegtuig", "De broers Wright vlogen als eerste mensen met een vliegtuig met een motor. Dat was in 1903, meer dan 120 jaar geleden.", NL + "Vliegtuig",
     "in 1903 wisten de amerikaanse gebroeders wright als eerste mensen met hun zelf gebouwde en gemotoriseerde vliegtuig"),
    ("vliegtuig", "Schiphol is het grootste vliegveld van Nederland.", NL + "Luchthaven_Schiphol",
     "is de grootste nederlandse luchthaven en een belangrijke luchthaven in europa"),
    ("vliegtuig", "In 2025 telde Schiphol 68,8 miljoen passagiers.", NL + "Luchthaven_Schiphol",
     "in 2025 verwerkte schiphol 68,8 miljoen passagiers."),
    # de romp
    ("romp", "Hoog in de lucht is de lucht te dun. Daar krijg je niet genoeg zuurstof om goed te ademen.", NL + "Drukcabine",
     "de luchtdruk in de atmosfeer op grotere hoogte voor mensen te laag is om voldoende zuurstof op te kunnen nemen"),
    ("romp", "Daarom wordt er steeds lucht in de romp gepompt. Zo kun je binnen gewoon ademen. Dat heet een drukcabine.", EN + "Cabin_pressurization",
     "cabin pressurization is a process in which conditioned air is pumped into the cabin of an aircraft"),
    ("romp", "Binnen in de romp is de lucht zoals op een berg van ongeveer 2 kilometer hoog.", NL + "Drukcabine",
     "in een modern verkeersvliegtuig komt de cabinedruk op kruishoogte overeen met de atmosferische druk op een hoogte tussen 5500 en de 8000 voet (ca. 1600-2400 meter)."),
    ("romp", "Een vliegtuig met één gangpad heeft plaats voor 100 tot 240 passagiers.", EN + "Airliner",
     "generally used for medium-haul flights with 100 to 240 passengers."),
    ("romp", "Een vliegtuig is vaak gemaakt van aluminium, gemengd met een beetje ander metaal. Dat is sterk en toch licht.", EN + "Aluminium_alloy",
     "aluminium alloys are used extensively in aircraft due to their high strength"),
    # de vleugels
    ("vleugels", "Bij het opstijgen en landen schuiven er kleppen uit de vleugel. Dan kan het vliegtuig langzaam vliegen en blijft het toch in de lucht.", NL + "Welvingsklep",
     "bij het opstijgen en het landen worden de welvingskleppen uitgeschoven of omlaag gezet, waardoor de draagkracht groter wordt"),
    ("vleugels", "In de vleugels zit de brandstof. Soms ook in de romp en in de staart.", EN + "Aircraft_fuel_tank",
     "most large transport aircraft use this system to store fuel in the wings, fuselage and empennage of the aircraft."),
    ("vleugels", "De brandstof van een vliegtuig heet kerosine.", NL + "Kerosine",
     "het staat bekend als brandstof voor vliegtuigen"),
    ("vleugels", "Aan het eind van de vleugel staat vaak een stukje rechtop: de winglet. Die zorgt dat de lucht het vliegtuig minder tegenhoudt.", NL + "Winglet",
     "winglets beperken plaatselijk deze wervels, zodat de luchtweerstand afneemt."),
    ("vleugels", "Het idee van de winglet komt van vogels. Die buigen de veren aan het eind van hun vleugels omhoog.", NL + "Winglet",
     "de techniek is afgekeken van vogels die aan het eind van hun vleugels waaiervormig opgestelde slagpennen kennen, die naar boven kunnen worden gekruld."),
    # de motoren
    ("motoren", "Voorin de motor zit een grote ventilator. Die blaast lucht naar achteren.", EN + "Turbofan",
     "a ducted fan that accelerates air rearward from the front of the engine."),
    ("motoren", "Die grote ventilator geeft de motor de meeste duwkracht.", EN + "Turbofan",
     "in a high-bypass design, the ducted fan and nozzle produce most of the thrust."),
    ("motoren", "Zo'n motor heet een turbofan. Het is een straalmotor die vrij stil is.", NL + "Turbofan",
     "een turbofan is een relatief stille straalmotor met een hoog rendement"),
    ("motoren", "De motor zuigt voor lucht naar binnen. Binnenin wordt brandstof verbrand, en de hete lucht gaat er achter uit.", NL + "Straalmotor",
     "lucht wordt ingezogen aan de voorkant en door de compressor samengeperst."),
    ("motoren", "Duw je iets weg, dan duwt het even hard terug. Dat schreef Isaac Newton op. De motor duwt lucht naar achteren, en de lucht duwt het vliegtuig naar voren.", EN + "Newton%27s_laws_of_motion",
     "to every action there is always opposed an equal reaction"),
    # de staart
    ("staart", "Achter op het vliegtuig staat een groot rechtop vlak. Dat heet het kielvlak.", NL + "Kielvlak",
     "het kielvlak of staartvlak is het verticale vlak van de staart van een vliegtuig"),
    ("staart", "Aan het kielvlak zit het richtingsroer. Daarmee draait de neus van het vliegtuig naar links of naar rechts. Dat heet gieren.", NL + "Richtingsroer",
     "deze beweging wordt gieren genoemd."),
    ("staart", "De piloot beweegt het richtingsroer met pedalen, met zijn voeten.", NL + "Richtingsroer",
     "besturing ervan vindt plaats door middel van pedalen"),
    ("staart", "Achteraan zitten ook twee kleine vleugeltjes. Samen heten ze het stabilo.", NL + "Stabilo",
     "het bevindt zich meestal aan de achterzijde en ziet eruit als kleine vleugels."),
    ("staart", "Aan het stabilo zit het hoogteroer. Daarmee gaat de neus omhoog of omlaag. Dat heet stampen.", NL + "Hoogteroer",
     "dit noemt men stampen"),
    # het landingsgestel
    ("landingsgestel", "Het landingsgestel zijn de wielen onder het vliegtuig. Daar staat het vliegtuig op als het niet vliegt.", NL + "Landingsgestel",
     "het landingsgestel of onderstel is dat deel van een vliegtuig dat het toestel ondersteunt als het niet in de lucht is."),
    ("landingsgestel", "Na het opstijgen gaan de wielen naar binnen, achter luikjes in de romp. Dan houdt de lucht het vliegtuig minder tegen.", NL + "Landingsgestel",
     "om de luchtweerstand te verminderen wordt het landingsgestel doorgaans ingetrokken tot achter luiken in de romp die vervolgens worden gesloten."),
    ("landingsgestel", "Op de grond stuurt het vliegtuig met het neuswiel. Dat is het wiel onder de neus. Het kan draaien.", NL + "Landingsgestel",
     "bij grote toestellen wordt dit gedaan door een draaibaar neuswiel"),
    ("landingsgestel", "Voor een scherpe bocht op de grond heeft de piloot een hendel. Die heet de tiller.", NL + "Landingsgestel",
     'gebruikgemaakt van een hendel aangeduid met de engelse naam "tiller".'),
    ("landingsgestel", "Aan de wielen zitten remmen. Daarmee stopt het vliegtuig na de landing.", NL + "Landingsgestel",
     "de belangrijkste manier waarop dit bereikt wordt zijn de remmen op de wielen."),
    # de cockpit (piloten en lampen)
    ("cockpit", "Voorin het vliegtuig zit de cockpit. Daar zitten de piloten en besturen ze het vliegtuig.", NL + "Cockpit",
     "de ruimte vóór in een vliegtuig van waaruit de piloten het toestel besturen."),
    ("cockpit", "Er zijn twee piloten: de gezagvoerder en de eerste officier. Ze wisselen het vliegen af.", NL + "Eerste_officier",
     "het daadwerkelijke vliegen (van start tot en met landing) wordt normaal gesproken tussen de gezagvoerder en de eerste officier verdeeld"),
    ("cockpit", "Aan de linkervleugel brandt een rood lampje, aan de rechtervleugel een groen lampje.", EN + "Navigation_light",
     "with a red navigation light located on the left wingtip leading edge and a green light on the right wingtip leading edge."),
    ("cockpit", "Helemaal achteraan brandt een wit lampje.", EN + "Navigation_light",
     "a white navigation light is as far aft as possible on the tail or each wing tip."),
    ("cockpit", "Er zijn ook knipperlichten, boven en onder op de romp. Die knipperen als de motoren draaien, zodat iedereen het ziet.", EN + "Navigation_light",
     "their purpose is to alert others when something is happening that ground crew and other aircraft need to be aware of, such as running engines"),
]

SECTIES = ["vliegtuig", "romp", "vleugels", "motoren", "staart", "landingsgestel", "cockpit"]


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
    (ROOT / "site" / "data" / "weetjes-vliegtuig.json").write_text(
        json.dumps({"datum": vandaag, "secties": secties}, indent=1, ensure_ascii=False) + "\n")
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "weetjes_vliegtuig_controle.json").write_text(
        json.dumps({"datum": vandaag, "per_sectie": per_sectie, "pogingen": alle}, indent=1, ensure_ascii=False) + "\n")
    for s, v in per_sectie.items():
        print(f"{s:15} {v['gevonden']}/{v['geprobeerd']}")
    print(f"{sum(v['gevonden'] for v in per_sectie.values())} van {len(alle)} weetjes gevonden")


if __name__ == "__main__":
    main()

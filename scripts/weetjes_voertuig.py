"""Maakt site/data/weetjes-<naam>.json voor een voertuig uit scripts/weetjes/<naam>.json.

Invoer (scripts/weetjes/<naam>.json):
  {"secties": ["trekker", "motor", ...],            # de sleutels van de onderdelen, in volgorde
   "weetjes": [[sectie, tekst voor de site, bron, controlezin], ...]}
De controlezin moet letterlijk op de bronpagina staan (na norm() uit scripts/nakijken.py).
Alleen gevonden weetjes gaan naar de site; alle pogingen (met http-status) naar data/weetjes_<naam>_controle.json.
Daarna kijkt scripts/nakijken.py ze maandelijks opnieuw na.

Let op bij Wikipedia: na een link staat in de tekst een spatie voor de leestekens
("versneld , waardoor"), dus een controlezin niet net na een link met een leesteken laten eindigen.

Alleen standaardbibliotheek: python3 -I scripts/weetjes_voertuig.py <naam>
"""
import json, re, sys
from datetime import date
from pathlib import Path

HIER = Path(__file__).resolve().parent
ROOT = HIER.parent
sys.path.insert(0, str(HIER))  # python3 -I zet de scriptmap niet in sys.path
from nakijken import haal, norm  # noqa: E402


def main(naam):
    assert re.fullmatch(r"[a-z]+", naam), "naam: alleen kleine letters"
    invoer = json.loads((HIER / "weetjes" / f"{naam}.json").read_text())
    SECTIES = invoer["secties"]
    alle = []
    for sectie, t, bron, controle in invoer["weetjes"]:
        assert sectie in SECTIES, f"onbekende sectie {sectie}"
        status, pagina = haal(bron)
        gevonden = "onbereikbaar" if pagina is None else norm(controle) in pagina
        if gevonden is not True:
            print(f"  {gevonden}: {sectie}: {controle[:60]} ({bron}, {status})")
        alle.append({"sectie": sectie, "tekst": t, "bron": bron, "controle": controle, "gevonden": gevonden, "http": status})
    vandaag = date.today().isoformat()
    secties = {s: [] for s in SECTIES}
    for w in alle:
        if w["gevonden"] is True:
            secties[w["sectie"]].append({"tekst": w["tekst"], "bron": w["bron"], "controle": w["controle"], "gevonden": True})
    per_sectie = {s: {"geprobeerd": sum(w["sectie"] == s for w in alle), "gevonden": len(secties[s])} for s in SECTIES}
    (ROOT / "site" / "data").mkdir(parents=True, exist_ok=True)
    (ROOT / "site" / "data" / f"weetjes-{naam}.json").write_text(
        json.dumps({"datum": vandaag, "secties": secties}, indent=1, ensure_ascii=False) + "\n")
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / f"weetjes_{naam}_controle.json").write_text(
        json.dumps({"datum": vandaag, "per_sectie": per_sectie, "pogingen": alle}, indent=1, ensure_ascii=False) + "\n")
    for s, v in per_sectie.items():
        print(f"{s:15} {v['gevonden']}/{v['geprobeerd']}")
    print(f"{sum(v['gevonden'] for v in per_sectie.values())} van {len(alle)} weetjes gevonden")


if __name__ == "__main__":
    main(sys.argv[1])

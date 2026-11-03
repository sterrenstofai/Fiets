"""Kijkt elk weetje in site/data/weetjes.json na: staat de controlezin letterlijk op de bronpagina?

Overgenomen van sterrenstofai/deruimte/scripts/nakijken.py (zelfde norm() en tekst()).
Zet per weetje "gevonden" op true/false in site/data/weetjes.json (de site toont alleen
gevonden weetjes) en schrijft data/nagekeken.json met de uitkomst en de datum.
Is een bron nu niet bereikbaar (Wikipedia geeft soms 429), dan blijft de vorige uitkomst staan.
Dit script vangt verschuivingen en tikfouten op, niet of de vertaling goed is.
Bedoeld om maandelijks te draaien. Alleen standaardbibliotheek: python3 -I scripts/nakijken.py
"""
import html, json, re, time, urllib.error, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (fiets-nakijken; github.com/sterrenstofai)"
PAUZE = 1.5  # seconden tussen verzoeken (Wikipedia)


def norm(s):
    s = html.unescape(s).replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"').replace("\u00a0", " ")
    return re.sub(r"\s+", " ", s).lower()


def haal(url, cache={}):
    """(http-status, genormaliseerde tekst of None). Bij 429/5xx opnieuw proberen, steeds langer wachten."""
    if url not in cache:
        status, t = None, None
        for p in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                    status, ruw = r.status, r.read().decode("utf-8", "replace")
                ruw = re.sub(r"(?s)<(script|style).*?</\1>", " ", ruw)
                t = norm(re.sub(r"<[^>]+>", " ", ruw))
                if status == 200 and t.strip():
                    break
            except urllib.error.HTTPError as e:
                status = e.code
                if e.code not in (429, 500, 502, 503, 504):
                    break
            except Exception as e:
                status = type(e).__name__
            print("  opnieuw", url, status); time.sleep(10 * (p + 1))
        cache[url] = (status, t if status == 200 else None)
        time.sleep(PAUZE)
    return cache[url]


def tekst(url):
    return haal(url)[1]


def main():
    pad = ROOT / "site" / "data" / "weetjes.json"
    data = json.loads(pad.read_text())
    uit, fout, totaal = {}, 0, 0
    for sectie, weetjes in data["secties"].items():
        r = []
        for w in weetjes:
            totaal += 1
            status, t = haal(w["bron"])
            if t is None:
                ok = w.get("gevonden", False)
                print(f"  niet bereikbaar ({status}), vorige uitkomst gehouden: {w['bron']}")
            else:
                ok = norm(w["controle"]) in t
                if not ok:
                    fout += 1; print(f"  NIET GEVONDEN {sectie}: {w['controle'][:60]} ({w['bron']})")
            w["gevonden"] = ok
            r.append(ok)
        uit[sectie] = {"weetjes": r, "alles": all(r) and bool(r), "datum": date.today().isoformat()}
    pad.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "nagekeken.json").write_text(json.dumps(uit, indent=1) + "\n")
    print(f"{sum(v['alles'] for v in uit.values())} van {len(uit)} secties helemaal nagekeken; "
          f"{fout} van {totaal} weetjes niet gevonden")


if __name__ == "__main__":
    main()

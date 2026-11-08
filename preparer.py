import csv
import json
from datetime import datetime, timezone

FICHIERS = [
    "ibtracs.SP.list.v04r01.csv",
    "ibtracs.WP.list.v04r01.csv",
    "ibtracs.EP.list.v04r01.csv",
]

def nombre(valeur):
    try:
        return float(valeur)
    except (TypeError, ValueError):
        return None

def heure_epoch(texte):
    # nombre d'heures depuis 1970-01-01 UTC, ou None si la date est invalide
    try:
        d = datetime.strptime(texte.strip(), "%Y-%m-%d %H:%M:%S")
    except (ValueError, AttributeError):
        return None
    return int(d.replace(tzinfo=timezone.utc).timestamp() // 3600)

trajectoires = {}

for fichier in FICHIERS:
    lus = 0
    with open(fichier, newline="", encoding="utf-8", errors="replace") as f:
        for ligne in csv.DictReader(f):
            lat = nombre(ligne.get("LAT"))
            lon = nombre(ligne.get("LON"))
            saison = nombre(ligne.get("SEASON"))
            h = heure_epoch(ligne.get("ISO_TIME"))
            if None in (lat, lon, saison, h):
                continue  # ligne d'unités ou donnée manquante
            sid = ligne["SID"].strip()
            if sid not in trajectoires:
                nom = ligne["NAME"].strip()
                trajectoires[sid] = {
                    "nom": "sans nom" if nom == "NOT_NAMED" else nom.title(),
                    "saison": int(saison),
                    "points": [],
                }
            vent = nombre(ligne.get("WMO_WIND"))
            trajectoires[sid]["points"].append((h, lat, lon, vent))
            lus += 1
    print(f"{fichier} : {lus} points valides")

sortie = []
for t in trajectoires.values():
    t["points"].sort(key=lambda p: p[0])  # tri chronologique
    vents = [p[3] for p in t["points"] if p[3] is not None]
    sortie.append({
        "nom": t["nom"],
        "saison": t["saison"],
        "vmax": max(vents) if vents else None,
        "pts": [[round(lat, 2), round(lon, 2), h] for h, lat, lon, _ in t["points"]],
    })

sortie.sort(key=lambda t: (t["saison"], t["nom"]))

with open("donnees.js", "w", encoding="utf-8") as f:
    f.write("const DONNEES = ")
    json.dump(sortie, f, ensure_ascii=False)
    f.write(";\n")

if sortie:
    print(f"{len(sortie)} trajectoires, saisons {sortie[0]['saison']} à {sortie[-1]['saison']}")

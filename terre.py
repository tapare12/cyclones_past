import json

with open("ne_50m_land.geojson", encoding="utf-8") as f:
    geo = json.load(f)

anneaux = []
for entite in geo["features"]:
    g = entite["geometry"]
    polygones = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for polygone in polygones:
        for anneau in polygone:
            anneaux.append([[round(lon, 2), round(lat, 2)] for lon, lat in anneau])

with open("terre.js", "w", encoding="utf-8") as f:
    f.write("const TERRE = ")
    json.dump(anneaux, f)
    f.write(";\n")

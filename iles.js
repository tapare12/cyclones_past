// Archipels de Polynésie française (Pacifique Sud) : positions approximatives
const ARCHIPELS_PF = [
  { nom: "ÎLES DE LA SOCIÉTÉ", lat: -16.8, lon: -150.5 },
  { nom: "TUAMOTU", lat: -17.0, lon: -144.5 },
  { nom: "ÎLES MARQUISES", lat: -9.5, lon: -139.5 },
  { nom: "ÎLES AUSTRALES", lat: -24.0, lon: -148.0 }
];

// Îles principales de chaque archipel : positions approximatives
const ILES_PF = [
  { nom: "Tahiti", lat: -17.67, lon: -149.43 },
  { nom: "Moorea", lat: -17.54, lon: -149.83 },
  { nom: "Raiatea", lat: -16.83, lon: -151.43 },
  { nom: "Tahaa", lat: -16.60, lon: -151.47 },
  { nom: "Bora Bora", lat: -16.50, lon: -151.74 },
  { nom: "Huahine", lat: -16.73, lon: -151.00 },
  { nom: "Maupiti", lat: -16.45, lon: -152.25 },
  { nom: "Rangiroa", lat: -14.95, lon: -147.66 },
  { nom: "Fakarava", lat: -16.25, lon: -145.60 },
  { nom: "Manihi", lat: -14.40, lon: -145.90 },
  { nom: "Anaa", lat: -17.35, lon: -145.50 },
  { nom: "Hao", lat: -18.07, lon: -140.93 },
  { nom: "Nuku Hiva", lat: -8.90, lon: -140.10 },
  { nom: "Hiva Oa", lat: -9.77, lon: -139.03 },
  { nom: "Ua Pou", lat: -9.35, lon: -140.08 },
  { nom: "Fatu Hiva", lat: -10.47, lon: -138.67 },
  { nom: "Tubuai", lat: -23.35, lon: -149.47 },
  { nom: "Rurutu", lat: -22.43, lon: -151.35 },
  { nom: "Rimatara", lat: -22.65, lon: -152.80 },
  { nom: "Raivavae", lat: -23.87, lon: -147.65 },
  { nom: "Rapa", lat: -27.60, lon: -144.33 }
];

// groupe des noms, placé dans le fond pour être copié aussi dans la loupe
const gIles = creer("g", { "pointer-events": "none" });
gFond.appendChild(gIles);

for (const a of ARCHIPELS_PF) {
  const t = creer("text", {
    x: x(a.lon),
    y: y(a.lat),
    "text-anchor": "middle",
    "font-size": 14,
    "font-weight": "bold",
    fill: "#7a3e12",
    stroke: "#ffffff",
    "stroke-width": 3,
    "paint-order": "stroke"
  });
  t.textContent = a.nom;
  gIles.appendChild(t);
}

for (const i of ILES_PF) {
  const t = creer("text", {
    x: x(i.lon) + 4,
    y: y(i.lat) - 3,
    "font-size": 10,
    fill: "#1d1d1d",
    stroke: "#ffffff",
    "stroke-width": 2.5,
    "paint-order": "stroke"
  });
  t.textContent = i.nom;
  gIles.appendChild(t);
}

// les nouveaux textes reçoivent la même gestion de taille que le reste de la carte
appliquerEchelle();

// case à cocher : affiche ou masque les noms
document.getElementById("ilesActives").addEventListener("change", e => {
  gIles.style.display = e.target.checked ? "" : "none";
});

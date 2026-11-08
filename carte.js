const W = 1000;
const H = 500;
const LON_DEBUT = 100;     // bord gauche de la carte : 100° E
const LAT_MIN = -60;
const LAT_MAX = 60;
const PAS_MAX = 1000;      // valeur maximale du curseur
const PAUSE_SAISON = 2500; // pause entre deux saisons, en millisecondes
const NS = "http://www.w3.org/2000/svg";

const svg = document.getElementById("carte");
const selection = document.getElementById("annee");
const info = document.getElementById("info");
const curseur = document.getElementById("curseur");
const dateTxt = document.getElementById("date");
const bouton = document.getElementById("lecture");
const boutonSequence = document.getElementById("sequence");
const boutonArret = document.getElementById("arret");
const vitesse = document.getElementById("vitesse");
const titre = document.getElementById("titre");

const gFond = creer("g", {});
const gTraces = creer("g", {});
svg.appendChild(gFond);
svg.appendChild(gTraces);
svg.appendChild(titre);    // le titre reste au-dessus des tracés

const SAISONS = [...new Set(DONNEES.map(t => t.saison))].sort((a, b) => a - b);

let traces = [];          // cyclones affichés pour la saison courante
let tMin = 0;
let tMax = 0;
let timer = null;         // intervalle de lecture
let pauseTimer = null;    // pause entre deux saisons
let enSequence = false;   // défilement de toutes les saisons en cours
let indexSaison = 0;      // position dans SAISONS pendant le défilement

function x(lon) {
  return ((lon - LON_DEBUT + 360) % 360) / 360 * W;
}

function y(lat) {
  return (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H;
}

function creer(tag, attributs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attributs)) el.setAttribute(k, v);
  return el;
}

function couleur(vent) {
  if (vent === null || vent < 34) return "#888888";
  if (vent < 64) return "#2a7fff";
  if (vent < 96) return "#f39c12";
  return "#d62728";
}

// construit un chemin SVG à partir de points [px, py] ; rupture si saut de bord à bord
function chemin(points) {
  let d = "";
  let px0 = null;
  for (const [px, py] of points) {
    const saut = px0 !== null && Math.abs(px - px0) > W / 2;
    d += (px0 === null || saut ? "M" : "L") + px.toFixed(1) + "," + py.toFixed(1) + " ";
    px0 = px;
  }
  return d;
}

function dessinerFond() {
  for (const anneau of TERRE) {
    const pts = anneau.map(([lon, lat]) => [x(lon), y(lat)]);
    gFond.appendChild(creer("path", {
      d: chemin(pts),
      fill: "#f3efe0",
      stroke: "#9a9a8a",
      "stroke-width": 0.5
    }));
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    gFond.appendChild(creer("line", {
      x1: 0, x2: W, y1: y(lat), y2: y(lat),
      stroke: "#8fa9bd", "stroke-width": lat === 0 ? 1 : 0.4
    }));
    const t = creer("text", { x: 4, y: y(lat) - 3, "font-size": 12, fill: "#333" });
    t.textContent = Math.abs(lat) + (lat > 0 ? "°N" : lat < 0 ? "°S" : "");
    gFond.appendChild(t);
  }
  for (let k = 0; k < 12; k++) {
    const lon = (LON_DEBUT + k * 30) % 360;
    const px = x(lon);
    gFond.appendChild(creer("line", {
      x1: px, x2: px, y1: 0, y2: H,
      stroke: "#8fa9bd", "stroke-width": 0.4
    }));
    const t = creer("text", { x: px + 3, y: 12, "font-size": 12, fill: "#333" });
    t.textContent = lon === 180 ? "180°" : lon < 180 ? `${lon}°E` : `${360 - lon}°W`;
    gFond.appendChild(t);
  }
}

function preparerTrace(t) {
  const proj = t.pts.map(([lat, lon, h]) => [x(lon), y(lat), h]);
  const el = creer("path", {
    fill: "none",
    stroke: couleur(t.vmax),
    "stroke-width": 1.5,
    opacity: 0.85
  });
  const infoBulle = creer("title", {});
  infoBulle.textContent = `${t.nom} (${t.saison}) – vent max : ${t.vmax ?? "non renseigné"} nœuds`;
  el.appendChild(infoBulle);

  const tete = creer("circle", { r: 3.5, fill: couleur(t.vmax), stroke: "#fff", "stroke-width": 0.5 });

  // étiquette placée au dernier point, affichée une fois le tracé terminé
  const [dx, dy] = proj[proj.length - 1];
  const etiquette = creer("text", {
    x: dx + 5,
    y: dy - 4,
    "font-size": 11,
    fill: "#1d1d1d",
    stroke: "#ffffff",
    "stroke-width": 3,
    "paint-order": "stroke"
  });
  etiquette.textContent = t.nom;
  etiquette.style.display = "none";

  gTraces.append(el, tete, etiquette);
  return { proj, el, tete, etiquette };
}

// affiche chaque trajectoire jusqu'à l'instant correspondant au curseur f
function majTemps(f) {
  const tc = tMin + (f / PAS_MAX) * (tMax - tMin);
  for (const t of traces) {
    const visibles = t.proj.filter(p => p[2] <= tc);
    const termine = visibles.length === t.proj.length;
    t.el.setAttribute("d", chemin(visibles));

    if (visibles.length && !termine) {
      const [px, py] = visibles[visibles.length - 1];
      t.tete.setAttribute("cx", px);
      t.tete.setAttribute("cy", py);
      t.tete.style.display = "";
    } else {
      t.tete.style.display = "none";
    }
    t.etiquette.style.display = termine ? "" : "none";
  }
  dateTxt.textContent = new Date(tc * 3600000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

function arreterLecture() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  bouton.textContent = "▶ Lecture";
}

// arrête la lecture, la pause et le défilement des saisons
function arreterTout() {
  enSequence = false;
  if (pauseTimer) {
    clearTimeout(pauseTimer);
    pauseTimer = null;
  }
  arreterLecture();
}

// lit la saison courante ; surFin est appelée à la fin de la lecture
function lire(surFin) {
  if (Number(curseur.value) >= PAS_MAX) curseur.value = 0;
  majTemps(Number(curseur.value));
  bouton.textContent = "⏸ Pause";
  timer = setInterval(() => {
    let f = Number(curseur.value) + Number(vitesse.value);
    if (f >= PAS_MAX) f = PAS_MAX;
    curseur.value = f;
    majTemps(f);
    if (f >= PAS_MAX) {
      arreterLecture();
      if (surFin) surFin();
    }
  }, 60);
}

function afficher(annee) {
  gTraces.replaceChildren();
  const liste = DONNEES.filter(t => annee === "toutes" || t.saison === Number(annee));
  traces = liste.map(preparerTrace);
  if (liste.length) {
    tMin = liste.reduce((m, t) => Math.min(m, t.pts[0][2]), Infinity);
    tMax = liste.reduce((m, t) => Math.max(m, t.pts[t.pts.length - 1][2]), -Infinity);
  } else {
    tMin = tMax = 0;
  }
  curseur.value = PAS_MAX;
  majTemps(PAS_MAX);
  titre.textContent = annee === "toutes" ? "Toutes les saisons" : `Saison ${annee}`;
  info.textContent = `${liste.length} trajectoire(s)`;
}

function jouerSaisonSuivante() {
  if (!enSequence) return;
  if (indexSaison >= SAISONS.length) {
    enSequence = false;
    info.textContent = "Défilement terminé";
    return;
  }
  const a = SAISONS[indexSaison];
  indexSaison++;
  selection.value = String(a);
  afficher(String(a));
  titre.textContent = `Saison ${a} (${indexSaison}/${SAISONS.length})`;
  lire(() => {
    pauseTimer = setTimeout(() => {
      pauseTimer = null;
      jouerSaisonSuivante();
    }, PAUSE_SAISON);
  });
}

function demarrerSequence() {
  arreterTout();
  enSequence = true;
  indexSaison = 0;
  jouerSaisonSuivante();
}

function remplirSelection() {
  const toutes = document.createElement("option");
  toutes.value = "toutes";
  toutes.textContent = "Toutes les années";
  selection.appendChild(toutes);
  for (const a of SAISONS) {
    const o = document.createElement("option");
    o.value = String(a);
    o.textContent = String(a);
    selection.appendChild(o);
  }
  selection.value = String(SAISONS[SAISONS.length - 1]);
}

function decaler(delta) {
  const i = selection.selectedIndex + delta;
  if (i >= 0 && i < selection.options.length) {
    selection.selectedIndex = i;
    afficher(selection.value);
  }
}

dessinerFond();
remplirSelection();

selection.addEventListener("change", () => {
  arreterTout();
  afficher(selection.value);
});
document.getElementById("precedent").addEventListener("click", () => {
  arreterTout();
  decaler(-1);
});
document.getElementById("suivant").addEventListener("click", () => {
  arreterTout();
  decaler(1);
});
bouton.addEventListener("click", () => {
  if (timer) {
    arreterLecture();   // bascule lecture / pause
    return;
  }
  arreterTout();
  lire();
});
boutonSequence.addEventListener("click", demarrerSequence);
boutonArret.addEventListener("click", () => {
  arreterTout();
  info.textContent = "Arrêté";
});
curseur.addEventListener("input", () => {
  arreterTout();
  majTemps(Number(curseur.value));
});

afficher(selection.value);

const ZOOM_MAX = 14;              // grossissement maximal de la carte : 14
const FACTEUR_ZOOM = 1.2;        // amplitude d'un cran de molette
const ATTRIBUTS_ECHELLE = ["font-size", "stroke-width", "r"];
const SELECTEUR_ECHELLE = "#contenu [font-size], #contenu [stroke-width], #contenu circle[r]";

const vue = { x: 0, y: 0, w: W, h: H };   // fenêtre affichée, en unités du viewBox
const basesEchelle = new WeakMap();        // valeurs d'origine de chaque élément
let glisser = null;                        // état du glisser-déposer en cours

// garde la vue dans les bornes de la carte et conserve le rapport largeur/hauteur
function contraindreVue() {
  vue.w = Math.min(Math.max(vue.w, W / ZOOM_MAX), W);
  vue.h = vue.w * H / W;
  vue.x = Math.min(Math.max(vue.x, 0), W - vue.w);
  vue.y = Math.min(Math.max(vue.y, 0), H - vue.h);
}

// ramène les textes, traits et points à une taille constante à l'écran
function appliquerEchelle() {
  const k = W / vue.w;   // facteur de zoom courant
  svg.querySelectorAll(SELECTEUR_ECHELLE).forEach(el => {
    if (!basesEchelle.has(el)) {
      const base = {};
      for (const a of ATTRIBUTS_ECHELLE) {
        if (el.hasAttribute(a)) base[a] = parseFloat(el.getAttribute(a));
      }
      basesEchelle.set(el, base);
    }
    const base = basesEchelle.get(el);
    for (const a in base) el.setAttribute(a, base[a] / k);
  });
}

// place le titre en haut de la vue visible, et adapte la taille de la lentille
function placerElements() {
  const k = W / vue.w;
  titre.setAttribute("x", vue.x + vue.w / 2);
  titre.setAttribute("y", vue.y + 38 / k);
  titre.setAttribute("font-size", 26 / k);
  titre.setAttribute("stroke-width", 4 / k);
  cercleMasque.setAttribute("r", RAYON_LOUPE / k);
  bordure.setAttribute("r", RAYON_LOUPE / k);
  bordure.setAttribute("stroke-width", 2 / k);
}

function appliquerVue() {
  contraindreVue();
  svg.setAttribute("viewBox", `${vue.x} ${vue.y} ${vue.w} ${vue.h}`);
  appliquerEchelle();
  placerElements();
}

// zoom centré sur le point p : ce point reste à la même place à l'écran
function zoomer(p, facteur) {
  const ancienW = vue.w;
  vue.w = Math.min(Math.max(ancienW * facteur, W / ZOOM_MAX), W);
  const rapport = vue.w / ancienW;
  vue.x = p.x - (p.x - vue.x) * rapport;
  vue.y = p.y - (p.y - vue.y) * rapport;
  appliquerVue();
}

function vueComplete() {
  vue.x = 0;
  vue.y = 0;
  vue.w = W;
  appliquerVue();
}

// molette : zoom avant et arrière
svg.addEventListener("wheel", e => {
  e.preventDefault();
  zoomer(positionSvg(e), e.deltaY < 0 ? 1 / FACTEUR_ZOOM : FACTEUR_ZOOM);
}, { passive: false });

// glisser-déposer : déplacement de la vue
svg.addEventListener("mousedown", e => {
  if (e.button !== 0) return;
  glisser = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y };
  svg.style.cursor = "grabbing";
});

window.addEventListener("mousemove", e => {
  if (!glisser) return;
  const echelle = vue.w / svg.getBoundingClientRect().width;   // unités du viewBox par pixel
  vue.x = glisser.vx - (e.clientX - glisser.x) * echelle;
  vue.y = glisser.vy - (e.clientY - glisser.y) * echelle;
  appliquerVue();
});

window.addEventListener("mouseup", () => {
  glisser = null;
  svg.style.cursor = "";
});

// double-clic ou bouton : retour à la vue complète
svg.addEventListener("dblclick", vueComplete);
const boutonReinit = document.getElementById("reinit");
if (boutonReinit) boutonReinit.addEventListener("click", vueComplete);

// les étiquettes et tracés créés lors d'un changement de saison reçoivent la bonne taille
new MutationObserver(appliquerEchelle).observe(gTraces, { childList: true });

appliquerVue();

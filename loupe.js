const RAYON_LOUPE = 90;   // rayon de la lentille, en unités du viewBox

// regroupe le fond et les trajectoires pour pouvoir les dupliquer dans la loupe
const gContenu = creer("g", { id: "contenu" });
svg.insertBefore(gContenu, gFond);
gContenu.append(gFond, gTraces);

// la loupe : un groupe découpé en cercle, contenant une copie agrandie du contenu
const gLoupe = creer("g", { "pointer-events": "none" });
gLoupe.style.display = "none";

const defs = creer("defs", {});
const masque = creer("clipPath", { id: "masqueLoupe" });
const cercleMasque = creer("circle", { cx: 0, cy: 0, r: RAYON_LOUPE });
masque.appendChild(cercleMasque);
defs.appendChild(masque);

// le clip-path est placé sur un groupe sans transformation, pour rester en coordonnées de la carte
const gMasque = creer("g", { "clip-path": "url(#masqueLoupe)" });
const copie = creer("use", { href: "#contenu" });
gMasque.appendChild(copie);

const bordure = creer("circle", {
  cx: 0, cy: 0, r: RAYON_LOUPE,
  fill: "none", stroke: "#1d3557", "stroke-width": 2
});

gLoupe.append(defs, gMasque, bordure);
svg.appendChild(gLoupe);

const caseLoupe = document.getElementById("loupeActive");
const zoomLoupe = document.getElementById("zoomLoupe");
let dernierPoint = null;   // dernière position du curseur sur la carte

// convertit la position de la souris en coordonnées du viewBox
function positionSvg(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

// place la lentille centrée sur le point p, avec le facteur de zoom choisi
function placerLoupe(p) {
  const z = Number(zoomLoupe.value);
  cercleMasque.setAttribute("cx", p.x);
  cercleMasque.setAttribute("cy", p.y);
  bordure.setAttribute("cx", p.x);
  bordure.setAttribute("cy", p.y);
  // agrandissement centré sur le curseur : le point sous la souris reste à sa place
  copie.setAttribute("transform",
    `translate(${p.x} ${p.y}) scale(${z}) translate(${-p.x} ${-p.y})`);
}

svg.addEventListener("mousemove", e => {
  if (!caseLoupe.checked) return;
  dernierPoint = positionSvg(e);
  gLoupe.style.display = "";
  placerLoupe(dernierPoint);
});

svg.addEventListener("mouseleave", () => {
  gLoupe.style.display = "none";
});

zoomLoupe.addEventListener("input", () => {
  if (caseLoupe.checked && dernierPoint) placerLoupe(dernierPoint);
});

caseLoupe.addEventListener("change", () => {
  if (!caseLoupe.checked) gLoupe.style.display = "none";
});

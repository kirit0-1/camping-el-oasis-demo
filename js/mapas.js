/* Catálogo modular de planos 2D. Más adelante se pueden añadir hotspots por sitio
   sin cambiar el markup: cada entrada admite src, alt y sitios asociados. */
window.OASIS_MAPAS = {
  playa: {
    id: "playa",
    titulo: "Sector Playa",
    src: "img/plano-playa.jpg",
    alt: "Plano oficial del sector Playa: Blue, primera y segunda línea, duchas y baños frente al mar",
    sitios: ["playa-blue", "playa-primera", "playa-segunda"],
  },
  bosque: {
    id: "bosque",
    titulo: "Sector Bosque",
    src: "img/plano-bosque.png",
    alt: "Plano oficial del sector Bosque: sitios, lavaderos, baños, pérgola y recepción junto al túnel",
    sitios: ["bosque"],
  },
};

window.OASIS_mapaDeSitio = function (sitioId) {
  const mapas = window.OASIS_MAPAS || {};
  const ids = Object.keys(mapas);
  for (let i = 0; i < ids.length; i++) {
    const mapa = mapas[ids[i]];
    if (mapa.sitios && mapa.sitios.indexOf(sitioId) !== -1) return mapa.id;
  }
  return "playa";
};

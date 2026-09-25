(function () {
  const data = {
    "@context": "https://schema.org",
    "@type": "Campground",
    name: "Camping El Oasis de Guanaqueros",
    description:
      "Camping familiar a orillas del mar en Guanaqueros, Coquimbo. Sitios en sector Bosque y Sector Playa.",
    url: "https://campingeloasisdeguanaqueros.cl/",
    telephone: "+56986694501",
    email: "contacto@campingeloasisdeguanaqueros.cl",
    image: "https://campingeloasisdeguanaqueros.cl/img/galeria-01.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Guanaqueros s/n, loteo 10",
      addressLocality: "Guanaqueros",
      addressRegion: "Coquimbo",
      addressCountry: "CL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -30.1943558,
      longitude: -71.4134859,
    },
    openingHours: "Mo-Su 08:30-18:00",
  };
  const node = document.createElement("script");
  node.type = "application/ld+json";
  node.textContent = JSON.stringify(data);
  document.head.appendChild(node);
})();

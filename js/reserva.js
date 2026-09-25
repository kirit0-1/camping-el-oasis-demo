(function () {
  const sitios = window.OASIS_SITIOS || [];
  const form = document.getElementById("formReserva");
  const select = document.getElementById("r-sector");
  const panel = document.getElementById("sitioInfo");
  const totalEl = document.getElementById("reservaTotal");
  const statusEl = document.getElementById("reservaStatus");
  const banoCheck = document.getElementById("r-bano");
  const llegadaInput = document.getElementById("r-llegada");
  const salidaInput = document.getElementById("r-salida");
  const mapButtons = document.querySelectorAll("[data-sitio]");
  const mapTabs = document.querySelectorAll("[data-map-tab]");
  const mapPanels = document.querySelectorAll("[data-map-panel]");
  const privacyCheck = document.getElementById("r-privacidad");
  const privacyError = document.getElementById("privacidadError");
  const loader = document.getElementById("reservaLoader");

  function hideLoader() {
    if (!loader) return;
    loader.classList.add("is-done");
    loader.setAttribute("aria-busy", "false");
    document.body.classList.remove("is-loading-reserva");
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
  }

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(hideLoader, reduceMotion ? 200 : 1800);

  function findSitio(id) {
    return sitios.find(function (item) {
      return item.id === id;
    });
  }

  function clp(n) {
    return "$" + Number(n).toLocaleString("es-CL");
  }

  function nightsBetween(a, b) {
    if (!a || !b) return 0;
    const start = new Date(a + "T12:00:00");
    const end = new Date(b + "T12:00:00");
    const diff = Math.round((end - start) / 86400000);
    return diff > 0 ? diff : 0;
  }

  function selectedId() {
    return select ? select.value : "";
  }

  function renderPanel(id) {
    const sitio = findSitio(id);
    if (!panel) return;
    if (!sitio) {
      panel.innerHTML =
        "<p>Toque un sector en el mapa para ver a qué distancia queda de la playa y el valor de la noche.</p>";
      return;
    }
    panel.innerHTML =
      "<p class=\"sitio-info__tag\">" +
      sitio.sector +
      "</p>" +
      "<h3>" +
      sitio.nombre +
      "</h3>" +
      "<p class=\"sitio-info__dist\">" +
      sitio.playa +
      " · " +
      sitio.minutos +
      "</p>" +
      "<p>" +
      sitio.detalle +
      "</p>" +
      "<p class=\"sitio-info__precio\">" +
      clp(sitio.precio) +
      " <small>por sitio / noche</small></p>" +
      (sitio.extra ? "<p class=\"sitio-info__extra\">" + sitio.extra + "</p>" : "");
  }

  function hydratePlanos() {
    const mapas = window.OASIS_MAPAS || {};
    Object.keys(mapas).forEach(function (id) {
      const mapa = mapas[id];
      const img = document.querySelector('[data-map-panel="' + id + '"] img');
      if (!img || !mapa) return;
      if (mapa.src) img.src = mapa.src;
      if (mapa.alt) img.alt = mapa.alt;
    });
  }

  function showPlano(mapId) {
    const id = mapId || "playa";
    mapTabs.forEach(function (tab) {
      const on = tab.getAttribute("data-map-tab") === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    mapPanels.forEach(function (panel) {
      const on = panel.getAttribute("data-map-panel") === id;
      panel.classList.toggle("is-on", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }

  function syncMap(id) {
    mapButtons.forEach(function (btn) {
      const on = btn.getAttribute("data-sitio") === id;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (typeof window.OASIS_mapaDeSitio === "function") {
      showPlano(window.OASIS_mapaDeSitio(id));
    }
  }

  function updateTotal() {
    if (!totalEl) return;
    const sitio = findSitio(selectedId());
    const noches = nightsBetween(llegadaInput && llegadaInput.value, salidaInput && salidaInput.value);
    const bano = banoCheck && banoCheck.checked ? window.OASIS_BANO_PRIVADO : 0;
    if (!sitio) {
      totalEl.textContent = "Elija un sector para ver el total estimado.";
      return;
    }
    if (!noches) {
      totalEl.textContent =
        clp(sitio.precio) +
        " por noche" +
        (bano ? " + " + clp(bano) + " baño privado" : "") +
        ". Indique fechas para el total.";
      return;
    }
    const total = (sitio.precio + bano) * noches;
    totalEl.textContent =
      noches +
      (noches === 1 ? " noche" : " noches") +
      " · " +
      clp(total) +
      " (estimado, sin pago aún)";
  }

  function selectSitio(id, scrollForm) {
    if (!findSitio(id)) return;
    if (select) select.value = id;
    syncMap(id);
    renderPanel(id);
    updateTotal();
    if (scrollForm && form && window.matchMedia("(max-width: 800px)").matches) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  mapButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectSitio(btn.getAttribute("data-sitio"), true);
    });
    btn.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSitio(btn.getAttribute("data-sitio"), true);
      }
    });
  });

  mapTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showPlano(tab.getAttribute("data-map-tab"));
    });
    tab.addEventListener("keydown", function (event) {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (keys.indexOf(event.key) === -1) return;
      event.preventDefault();
      const list = Array.prototype.slice.call(mapTabs);
      const i = list.indexOf(tab);
      let next = i;
      if (event.key === "ArrowRight") next = (i + 1) % list.length;
      if (event.key === "ArrowLeft") next = (i - 1 + list.length) % list.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = list.length - 1;
      const target = list[next];
      if (target) {
        showPlano(target.getAttribute("data-map-tab"));
        target.focus();
      }
    });
  });

  if (privacyCheck) {
    privacyCheck.addEventListener("change", function () {
      if (privacyError && privacyCheck.checked) privacyError.hidden = true;
    });
  }

  hydratePlanos();
  showPlano("playa");

  if (select) {
    select.addEventListener("change", function () {
      selectSitio(select.value, false);
    });
  }

  if (salidaInput) salidaInput.addEventListener("change", updateTotal);
  if (banoCheck) banoCheck.addEventListener("change", updateTotal);

  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("sector");
  if (fromUrl && findSitio(fromUrl)) {
    selectSitio(fromUrl, false);
  } else {
    renderPanel("");
    updateTotal();
  }

  if (llegadaInput) {
    const today = new Date().toISOString().slice(0, 10);
    llegadaInput.min = today;
    if (salidaInput) salidaInput.min = today;
    llegadaInput.addEventListener("change", function () {
      if (salidaInput && llegadaInput.value) {
        const next = new Date(llegadaInput.value + "T12:00:00");
        next.setDate(next.getDate() + 1);
        salidaInput.min = next.toISOString().slice(0, 10);
        if (salidaInput.value && salidaInput.value <= llegadaInput.value) {
          salidaInput.value = salidaInput.min;
        }
      }
      updateTotal();
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const sitio = findSitio(String(data.get("sector") || ""));
      const nombre = String(data.get("nombre") || "").trim();
      const email = String(data.get("email") || "").trim();
      const telefono = String(data.get("telefono") || "").trim();
      const llegada = String(data.get("llegada") || "");
      const salida = String(data.get("salida") || "");
      const personas = String(data.get("personas") || "");
      const rut = String(data.get("rut") || "").trim();
      const notas = String(data.get("notas") || "").trim();
      const bano = banoCheck && banoCheck.checked;
      const noches = nightsBetween(llegada, salida);

      if (!nombre || !email || !telefono || !llegada || !salida || !sitio) {
        form.reportValidity();
        return;
      }
      if (privacyCheck && !privacyCheck.checked) {
        if (privacyError) privacyError.hidden = false;
        privacyCheck.focus();
        return;
      }
      if (privacyError) privacyError.hidden = true;
      if (!noches) {
        if (statusEl) statusEl.textContent = "La fecha de salida debe ser posterior a la de llegada.";
        return;
      }

      const extra = bano ? window.OASIS_BANO_PRIVADO : 0;
      const reserva = {
        id: "oasis-" + Date.now(),
        creado: new Date().toISOString(),
        estado: "solicitud",
        nombre: nombre,
        rut: rut,
        email: email,
        telefono: telefono,
        llegada: llegada,
        salida: salida,
        noches: noches,
        personas: Number(personas) || 6,
        sectorId: sitio.id,
        sectorNombre: sitio.nombre,
        playa: sitio.playa,
        precioNoche: sitio.precio,
        banoPrivado: bano,
        extraBano: extra,
        totalEstimado: (sitio.precio + extra) * noches,
        notas: notas,
      };

      const key = window.OASIS_STORAGE_KEY;
      let prev = [];
      try {
        prev = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(prev)) prev = [];
      } catch (err) {
        prev = [];
      }
      prev.push(reserva);
      localStorage.setItem(key, JSON.stringify(prev));

      if (statusEl) {
        statusEl.textContent =
          "Solicitud guardada. Ahora se abre WhatsApp para que el camping la confirme.";
      }

      const mensaje = [
        "Hola, quiero reservar en Camping El Oasis.",
        "N° interno: " + reserva.id,
        "Nombre: " + nombre,
        rut ? "RUT: " + rut : "",
        "Correo: " + email,
        "Teléfono: " + telefono,
        "Llegada: " + llegada,
        "Salida: " + salida,
        "Noches: " + noches,
        "Sector: " + sitio.nombre + " (" + sitio.playa + ")",
        "Personas: " + personas,
        bano ? "Baño privado: sí" : "",
        "Total estimado: " + clp(reserva.totalEstimado),
        notas ? "Notas: " + notas : "",
      ]
        .filter(Boolean)
        .join("\n");

      if (typeof window.oasisOpenWhatsApp === "function") {
        window.oasisOpenWhatsApp(mensaje);
      }
    });
  }
})();

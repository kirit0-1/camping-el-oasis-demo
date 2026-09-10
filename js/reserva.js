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

  function syncMap(id) {
    mapButtons.forEach(function (btn) {
      const on = btn.getAttribute("data-sitio") === id;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
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
  });

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
          "Solicitud guardada. Ahora se abre WhatsApp para que el camping la confirme. El correo y Transbank se conectan en el siguiente paso.";
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

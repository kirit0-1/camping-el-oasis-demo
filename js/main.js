(function () {
  const navLinks = document.getElementById("navLinks");
  const burger = document.getElementById("burger");
  const contactoForm = document.getElementById("formContacto");
  const waNumber = window.OASIS_WA || "56986694501";

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      const open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.classList.contains("is-open")) return;
      if (navLinks.contains(event.target) || burger.contains(event.target)) return;
      navLinks.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  }

  function openWhatsApp(text) {
    window.open(
      "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(text),
      "_blank",
      "noopener"
    );
  }

  window.oasisOpenWhatsApp = openWhatsApp;

  if (contactoForm) {
    contactoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(contactoForm);
      const nombre = String(data.get("nombre") || "").trim();
      const email = String(data.get("email") || "").trim();
      const mensaje = String(data.get("mensaje") || "").trim();

      if (!nombre || !email || !mensaje) {
        contactoForm.reportValidity();
        return;
      }

      openWhatsApp("Hola, soy " + nombre + " (" + email + ").\n\n" + mensaje);
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }
})();

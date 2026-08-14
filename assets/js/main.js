// VOID — protótipo de landing page
// Sem dependências: navegação com blur ao rolar, reveal on scroll,
// spotlight no hero seguindo o cursor e submit fake do formulário de acesso.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // --- nav com fundo ao rolar ---------------------------------------------
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 8) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- reveal on scroll ----------------------------------------------------
  var revealEls = document.querySelectorAll(".reveal");

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      // Não espera o primeiro callback do IO: qualquer elemento já visível
      // no viewport no momento do load é revelado na hora — evita depender
      // do timing do primeiro frame de renderização.
      if (isInViewport(el)) {
        el.classList.add("in-view");
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  // --- spotlight no hero seguindo o cursor ---------------------------------
  var hero = document.getElementById("hero");
  var heroGlow = hero ? hero.querySelector(".hero__glow") : null;
  if (hero && heroGlow && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      heroGlow.style.background =
        "radial-gradient(560px circle at " + x + "% " + y + "%, rgba(207, 255, 4, 0.14), transparent 60%)," +
        "radial-gradient(500px circle at 80% 70%, rgba(207, 255, 4, 0.06), transparent 60%)," +
        "radial-gradient(900px circle at 15% 85%, rgba(255, 46, 106, 0.08), transparent 60%)";
    });
  }

  // --- formulário de acesso (sem backend ainda) -----------------------------
  var form = document.getElementById("access-form");
  var note = document.getElementById("access-note");
  if (form && note) {
    var defaultNote = note.textContent;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input[type=email]");
      if (!input.checkValidity()) {
        note.textContent = "Digita um e-mail válido pra entrar na lista.";
        note.classList.remove("is-success");
        return;
      }
      note.textContent = "Você está dentro. A gente chama assim que o VOID abrir.";
      note.classList.add("is-success");
      form.reset();
      window.setTimeout(function () {
        note.textContent = defaultNote;
        note.classList.remove("is-success");
      }, 6000);
    });
  }
})();

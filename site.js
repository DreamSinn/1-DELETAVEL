// ReelFlow: interações do site. Respeita "reduzir movimento" do sistema.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cabeçalho ganha sombra ao rolar
  const topbar = document.querySelector(".topbar");
  const onScroll = () => topbar && topbar.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu do celular
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  // Revelação ao rolar, com barras de passo e digitação do log
  const revealItems = document.querySelectorAll(".reveal, .step");
  const typeOnce = (el) => {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";
    const full = el.dataset.type;
    if (reduce) { el.textContent = full; return; }
    let i = 0;
    const tick = () => {
      el.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(tick, 28);
    };
    tick();
  };
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll("[data-type]").forEach(typeOnce);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("in"));
    document.querySelectorAll("[data-type]").forEach((el) => (el.textContent = el.dataset.type));
  }

  // Brilho do cursor no hero
  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  // Inclinação 3D: a janela do app e os cartões acompanham o mouse
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = Number(el.dataset.tilt) || 8;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = `rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg)`;
        el.style.setProperty("--gx", `${x * 100}%`);
        el.style.setProperty("--gy", `${y * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  // Botões de copiar (dados do aplicativo para o Google)
  const toast = document.querySelector(".toast");
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.textContent = "Copiado";
        btn.classList.add("done");
        setTimeout(() => { btn.textContent = original; btn.classList.remove("done"); }, 1600);
        showToast("Copiado: " + value);
      } catch (err) {
        showToast("Não foi possível copiar. Selecione o texto manualmente.");
      }
    });
  });

  // Partículas de fundo (mesma cor de destaque do app)
  const canvas = document.getElementById("particles");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w, h, dots;
    const make = () => {
      const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 26000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.8 + Math.random() * 1.8, vx: (Math.random() - 0.5) * 0.25, vy: -0.1 - Math.random() * 0.25,
        a: 0.15 + Math.random() * 0.35,
      }));
    };
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      make();
    };
    resize();
    window.addEventListener("resize", resize);
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
        if (d.x < -5) d.x = w + 5;
        if (d.x > w + 5) d.x = -5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(194, 137, 255, ${d.a})`;
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    frame();
  }
})();

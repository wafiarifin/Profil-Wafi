/* =========================================================
   Profil Diri — Portofolio Digital
   Merender seluruh isi dari CMS.load() + interaksi UI.
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const safeUrl = (url, fallback = "#") => {
    const u = String(url ?? "").trim();
    return /^(https?:|mailto:|tel:|#|\/|assets\/)/i.test(u) ? u : fallback;
  };

  const content = window.CMS ? window.CMS.load() : null;
  if (!content) return;

  /* =========================================================
     1) RENDER — Meta & Brand
     ========================================================= */
  document.title = content.meta.title;
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", content.meta.description);

  const brandMark = $(".nav__brand-mark");
  const brandText = $(".nav__brand-text");
  if (brandMark) brandMark.textContent = content.brand.initials;
  if (brandText) brandText.textContent = content.brand.name;

  // JSON-LD
  const ld = $('script[type="application/ld+json"]');
  if (ld) {
    try {
      const data = JSON.parse(ld.textContent);
      data.name = content.brand.name;
      data.jobTitle = content.hero.role;
      data.description = content.meta.description;
      data.email = "mailto:" + content.contact.email;
      ld.textContent = JSON.stringify(data, null, 2);
    } catch { /* biarkan */ }
  }

  /* =========================================================
     2) RENDER — Hero
     ========================================================= */
  const setText = (sel, value) => { const el = $(sel); if (el) el.textContent = value; };

  const heroEyebrow = $(".hero__eyebrow");
  if (heroEyebrow) {
    heroEyebrow.innerHTML = `<span class="dot" aria-hidden="true"></span> ${esc(content.hero.availability)}`;
  }
  const grad = $(".hero__title .grad");
  if (grad) grad.textContent = content.hero.name;
  setText(".hero__role", content.hero.role);
  setText(".hero__lead", content.hero.summary);

  const heroMeta = $(".hero__meta");
  if (heroMeta) {
    heroMeta.innerHTML = `
      <li>
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
        ${esc(content.hero.location)}
      </li>
      <li>
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
        ${esc(content.hero.email)}
      </li>`;
  }

  const heroStats = $(".hero__stats");
  if (heroStats) {
    heroStats.innerHTML = content.hero.stats
      .map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`)
      .join("");
  }

  $$(".hero__cta a[download], .nav__actions a[download]").forEach((a) => {
    a.setAttribute("href", safeUrl(content.hero.cvUrl));
  });

  // Fallback awal avatar
  const avatarImg = $(".hero__avatar img");
  avatarImg?.addEventListener("error", () => {
    const holder = document.createElement("div");
    holder.className = "hero__avatar-fallback";
    holder.setAttribute("aria-label", "Foto profil belum tersedia");
    holder.textContent = content.brand.initials;
    avatarImg.replaceWith(holder);
  });

  /* =========================================================
     3) RENDER — Tentang Saya
     ========================================================= */
  const ab = content.about;
  const aboutText = $(".about__text");
  if (aboutText) {
    aboutText.innerHTML = `
      <p class="kicker">${esc(ab.kicker)}</p>
      <h2 class="section__title">${esc(ab.title)}</h2>
      <h3 class="about__subhead">${esc(ab.backgroundHeading)}</h3>
      ${ab.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      <p class="about__signoff">&ldquo;${esc(ab.quote)}&rdquo;</p>`;
  }

  const factsEl = $(".about__facts .facts");
  if (factsEl) {
    factsEl.innerHTML = ab.facts
      .map(
        (f) => `
      <li class="fact">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/></svg>
        <div><span class="fact__label">${esc(f.label)}</span><span class="fact__value">${esc(f.value)}</span></div>
      </li>`
      )
      .join("");
  }

  const interestsWrap = $(".interests");
  if (interestsWrap) {
    const grid = $(".interests-grid", interestsWrap);
    const head = $(".about__subhead", interestsWrap);
    const lead = $(".philosophy__lead", interestsWrap);
    if (head) head.textContent = ab.interestsHeading;
    if (lead) lead.textContent = ab.interestsLead;
    if (grid) {
      grid.innerHTML = ab.interests
        .map(
          (i) => `
        <article class="interest reveal">
          <span class="interest__icon" aria-hidden="true">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 3 2 8l10 5 10-5z"/><path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>
          </span>
          <h4>${esc(i.title)}</h4>
          <p>${esc(i.desc)}</p>
        </article>`
        )
        .join("");
    }
  }

  const philWrap = $(".philosophy");
  if (philWrap) {
    const head = $(".about__subhead", philWrap);
    const lead = $(".philosophy__lead", philWrap);
    const grid = $(".philosophy-grid", philWrap);
    if (head) head.textContent = ab.philosophyHeading;
    if (lead) lead.textContent = ab.philosophyLead;
    if (grid) {
      grid.innerHTML = ab.philosophy
        .map(
          (p, n) => `
        <article class="principle reveal">
          <span class="principle__no" aria-hidden="true">${String(n + 1).padStart(2, "0")}</span>
          <h4>${esc(p.title)}</h4>
          <p>${esc(p.desc)}</p>
        </article>`
        )
        .join("");
    }
  }

  /* =========================================================
     4) RENDER — Keahlian
     ========================================================= */
  const sk = content.skills;
  const skillGrids = $$(".skills");
  const renderGroups = (el, groups) => {
    if (!el) return;
    el.innerHTML = groups
      .map(
        (g) => `
      <article class="skill-group reveal">
        <h3>${esc(g.group)}</h3>
        <ul class="tags">${g.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </article>`
      )
      .join("");
  };
  renderGroups(skillGrids[0], sk.technical); // Technical Skills
  renderGroups($(".tools-extra .skills"), sk.tools);

  const techHead = $(".section#keahlian .about__subhead");
  if (techHead) techHead.textContent = sk.technicalHeading;
  const techLead = $(".section#keahlian > .container > .philosophy__lead");
  if (techLead) techLead.textContent = sk.technicalLead;

  const toolsWrap = $(".tools-extra");
  if (toolsWrap) {
    setText(".tools-extra .about__subhead", sk.toolsHeading);
    setText(".tools-extra .philosophy__lead", sk.toolsLead);
  }

  const bars = $(".bars");
  if (bars) {
    bars.innerHTML = sk.proficiency
      .map((b) => `<div class="bar"><span>${esc(b.label)}</span><i style="--w:${Number(b.percent) || 0}%"></i></div>`)
      .join("");
  }

  const coreWrap = $(".core");
  if (coreWrap) {
    setText(".core .about__subhead", sk.coreHeading);
    setText(".core .philosophy__lead", sk.coreLead);
    const grid = $(".interests-grid", coreWrap);
    if (grid) {
      grid.innerHTML = sk.core
        .map(
          (c) => `
        <article class="interest reveal">
          <span class="interest__icon" aria-hidden="true">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <h4>${esc(c.title)}</h4>
          <p>${esc(c.desc)}</p>
        </article>`
        )
        .join("");
    }
  }

  /* =========================================================
     5) RENDER — Proyek
     ========================================================= */
  const grid = $("#projectsGrid");
  const emptyMsg = $("#projectsEmpty");
  const catLabel = (id) => (content.categories.find((c) => c.id === id) || {}).label || id;

  function linkIcon(link) {
    const label = String(link.label || "").toLowerCase();
    if (label.includes("repo") || label.includes("github"))
      return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.4.4-.5 1-.5 1.7V21"/></svg>`;
    if (label.includes("demo") || label.includes("preview"))
      return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`;
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>`;
  }

  function cardMarkup(p, index) {
    const MAX_TAGS = 3;
    const shown = p.tech.slice(0, MAX_TAGS).map((t) => `<li>${esc(t)}</li>`);
    const extra = p.tech.length - shown.length;
    if (extra > 0) shown.push(`<li class="more">+${extra}</li>`);

    const results = p.results.map((r) => `<li>${esc(r)}</li>`).join("");
    const allTech = p.tech.map((t) => `<li>${esc(t)}</li>`).join("");
    const allLinks = p.links
      .map(
        (l) =>
          `<a class="btn ${l.primary ? "btn--primary" : "btn--outline"} btn--sm" href="${esc(safeUrl(l.href))}" target="_blank" rel="noopener">${linkIcon(l)} ${esc(l.label)}</a>`
      )
      .join("");

    return `
      <article class="card" style="--accent:${esc(p.accent)}; animation-delay:${index * 60}ms" data-id="${esc(p.id)}">
        <div class="card__media">
          <span class="card__year">${esc(p.year)}</span>
          <span class="card__glyph" aria-hidden="true">${esc(p.glyph)}</span>
        </div>
        <div class="card__body">
          <p class="card__cat">${esc(catLabel(p.category))}</p>
          <h3 class="card__title">${esc(p.title)}</h3>
          <p class="card__problem">${esc(p.problem)}</p>
          <ul class="card__tags">${shown.join("")}</ul>
          <div class="card__foot">
            <button class="card__detail" type="button" aria-expanded="false" aria-controls="detail-${esc(p.id)}">
              <span class="card__detail-text">Detail</span>
              <svg class="icon card__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <span class="card__links">
              ${p.links.slice(0, 2).map((l) => `<a class="card__link" href="${esc(safeUrl(l.href))}" target="_blank" rel="noopener">${linkIcon(l)}<span>${esc(l.label)}</span></a>`).join("")}
            </span>
          </div>
          <div class="card__details" id="detail-${esc(p.id)}" hidden>
            <div class="card__block"><h4>Solusi &amp; Peran</h4><p>${esc(p.solution)}</p></div>
            <div class="card__block"><h4>Dampak</h4><ul class="card__results">${results}</ul></div>
            <ul class="tags card__alltech">${allTech}</ul>
            <div class="card__actions">${allLinks}</div>
          </div>
        </div>
      </article>`;
  }

  function renderProjects(filter = "all") {
    const list = filter === "all" ? content.projects : content.projects.filter((p) => p.category === filter);
    grid.innerHTML = list.map(cardMarkup).join("");
    emptyMsg.hidden = list.length > 0;
  }

  const filtersWrap = $(".filters");
  if (filtersWrap) {
    filtersWrap.innerHTML =
      `<button class="filter is-active" data-filter="all" role="tab" aria-selected="true">Semua</button>` +
      content.categories
        .map((c) => `<button class="filter" data-filter="${esc(c.id)}" role="tab" aria-selected="false">${esc(c.label)}</button>`)
        .join("");
  }

  const catFilters = $$(".filters .filter");
  catFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      catFilters.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderProjects(btn.dataset.filter);
    });
  });

  function toggleCard(card) {
    const details = $(".card__details", card);
    const btn = $(".card__detail", card);
    const label = $(".card__detail-text", card);
    if (!details || !btn) return;
    const open = details.hidden;
    details.hidden = !open;
    card.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Tutup" : "Detail";
  }
  grid.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const card = e.target.closest(".card");
    if (card) toggleCard(card);
  });

  /* =========================================================
     6) RENDER — Pengalaman
     ========================================================= */
  const timeline = $("#timeline");
  if (timeline) {
    timeline.innerHTML = content.experience
      .map(
        (x) => `
      <li class="timeline__item reveal" data-exp="${esc(x.type)}">
        <span class="timeline__dot" aria-hidden="true"></span>
        <p class="timeline__date">${esc(x.date)} <span class="timeline__type">${esc(x.typeLabel)}</span></p>
        <h3 class="timeline__title">${esc(x.title)}</h3>
        <p class="timeline__org">${esc(x.org)}</p>
        <ul class="timeline__points">${x.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
      </li>`
      )
      .join("");
  }

  const expFilters = $$(".timeline-tabs .filter");
  expFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      expFilters.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const type = btn.dataset.exp;
      $$("#timeline .timeline__item").forEach((item) => {
        item.classList.toggle("is-hidden", type !== "all" && item.dataset.exp !== type);
      });
    });
  });

  /* =========================================================
     7) RENDER — Pendidikan & Sertifikasi
     ========================================================= */
  const ed = content.education;
  const eduList = $(".edu-list");
  if (eduList) {
    eduList.innerHTML = ed.formal
      .map(
        (e) => `
      <li class="edu-item reveal">
        <p class="edu-item__date">${esc(e.date)}</p>
        <h4 class="edu-item__title">${esc(e.title)}</h4>
        <p class="edu-item__org">${esc(e.org)}</p>
        <p class="edu-item__note">${esc(e.note)}</p>
      </li>`
      )
      .join("");
  }

  const certList = $(".cert-list");
  if (certList) {
    certList.innerHTML = ed.certs
      .map(
        (c) => `
      <li class="cert reveal">
        <div class="cert__icon" aria-hidden="true">${esc(c.abbr)}</div>
        <div class="cert__body">
          <h4>${esc(c.title)}</h4>
          <p>${esc(c.org)} &middot; ${esc(c.year)} &middot; ID: ${esc(c.id)}</p>
        </div>
        <a class="cert__link" href="${esc(safeUrl(c.url))}" target="_blank" rel="noopener" aria-label="Verifikasi sertifikat ${esc(c.title)}">
          Verifikasi
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        </a>
      </li>`
      )
      .join("");
  }

  const trainingGrid = $(".training-grid");
  if (trainingGrid) {
    trainingGrid.innerHTML = ed.training
      .map(
        (t) => `
      <article class="training-card">
        <p class="training-card__year">${esc(t.year)}</p>
        <h4>${esc(t.title)}</h4>
        <p class="training-card__org">${esc(t.org)}</p>
        <p class="training-card__note">${esc(t.note)}</p>
      </article>`
      )
      .join("");
  }

  /* =========================================================
     8) RENDER — Kontak & Footer
     ========================================================= */
  const ct = content.contact;
  setText(".contact__title", ct.title);
  setText(".contact__sub", ct.sub);

  const contactMail = $(".contact__mail");
  if (contactMail) {
    contactMail.setAttribute("href", "mailto:" + ct.email);
    contactMail.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
      ${esc(ct.email)}`;
  }

  const socialIcons = {
    linkedin: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.5h4v12h-4zM8.5 8.5h3.8v1.7h.05c.53-.9 1.83-1.85 3.77-1.85 4.03 0 4.78 2.5 4.78 5.75v6.4h-4v-5.7c0-1.36-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8h-4z"/></svg>`,
    github: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.4.4-.5 1-.5 1.7V21"/></svg>`,
    dribbble: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8.6 2.6c4.2 4.6 6.3 9.8 6.9 16.8M2.4 10.3c6.6 0 12.7-1.6 17.2-5.3M3.6 17.5c3.1-3.6 7.2-5.3 12.4-5.1"/></svg>`,
    download: `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>`,
  };
  const socials = $(".socials");
  if (socials) {
    socials.innerHTML = ct.socials
      .map(
        (s) => `
      <li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">
        ${socialIcons[s.icon] || socialIcons.download}
        ${esc(s.label)}
      </a></li>`
      )
      .join("");
  }

  const footerP = $(".footer__inner p");
  if (footerP) {
    footerP.innerHTML = `&copy; <span id="year"></span> ${esc(content.footer.name)} &middot; ${esc(content.footer.role)}.`;
  }

  /* =========================================================
     9) INTERAKSI — Tema, Navbar, Reveal, Form, Progress
     ========================================================= */
  const THEME_KEY = "portfolio-theme";
  const root = document.documentElement;
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
  });

  const navbar = $("#navbar");
  const navLinks = $("#navLinks");
  const burger = $("#navBurger");
  const onScroll = () => navbar?.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks?.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
    }
  });

  const linkMap = new Map($$("#navLinks a").map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkMap.forEach((a) => a.classList.remove("is-active"));
        linkMap.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("section[id]").forEach((s) => spy.observe(s));

  const revealer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealer.observe(el));

  // Form kontak
  const form = $("#contactForm");
  const status = $("#formStatus");
  const setError = (input, msg) => {
    const field = input.closest(".field");
    const slot = $(`.field__error[data-error-for="${input.id}"]`);
    field?.classList.toggle("has-error", Boolean(msg));
    if (slot) slot.textContent = msg || "";
    return !msg;
  };
  const validate = () => {
    const name = $("#cf-name"), email = $("#cf-email"), msg = $("#cf-message");
    let ok = true;
    ok = setError(name, name.value.trim() ? "" : "Nama wajib diisi.") && ok;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    ok = setError(email, !email.value.trim() ? "Email wajib diisi." : validEmail ? "" : "Format email tidak valid.") && ok;
    ok = setError(msg, msg.value.trim().length >= 10 ? "" : "Pesan minimal 10 karakter.") && ok;
    return ok;
  };
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("is-error");
    if (!validate()) {
      status.textContent = "Mohon periksa kembali kolom yang ditandai.";
      status.classList.add("is-error");
      $(".field.has-error input, .field.has-error textarea")?.focus();
      return;
    }
    const subject = $("#cf-subject").value;
    const body =
      `Nama: ${$("#cf-name").value}\nEmail: ${$("#cf-email").value}\n\n${$("#cf-message").value}`;
    window.location.href = `mailto:${content.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = "Membuka aplikasi email Anda... Terima kasih!";
    form.reset();
  });
  form?.addEventListener("input", (e) => {
    if (e.target.matches("input, textarea")) setError(e.target, "");
  });

  // Progress bar & back-to-top
  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  const onScrollUi = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (toTop) toTop.hidden = window.scrollY < 400;
  };
  onScrollUi();
  window.addEventListener("scroll", onScrollUi, { passive: true });
  window.addEventListener("resize", onScrollUi);
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* =========================================================
     10) Init
     ========================================================= */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  renderProjects();
})();

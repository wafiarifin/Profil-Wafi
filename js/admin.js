/* =========================================================
   Panel Admin — mengelola konten CMS (localStorage)
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* ---------- Path helpers ---------- */
  const toPath = (p) => p.replace(/\[(\d+)\]/g, ".$1").split(".");
  const getPath = (obj, p) => toPath(p).reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const setPath = (obj, p, v) => {
    const parts = toPath(p);
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = v;
  };

  const TEMPLATES = {
    "hero.stats": { value: "", label: "" },
    "about.facts": { label: "", value: "" },
    "about.interests": { title: "", desc: "" },
    "about.philosophy": { title: "", desc: "" },
    "skills.technical": { group: "", items: [] },
    "skills.proficiency": { label: "", percent: 80 },
    "skills.tools": { group: "", items: [] },
    "skills.core": { title: "", desc: "" },
    categories: { id: "", label: "" },
    projects: {
      id: "", title: "", category: "web", year: "", accent: "#4f46e5", glyph: "",
      problem: "", solution: "", results: [], tech: [], links: [],
    },
    experience: { type: "kerja", typeLabel: "", date: "", title: "", org: "", points: [] },
    "education.formal": { date: "", title: "", org: "", note: "" },
    "education.certs": { abbr: "", title: "", org: "", year: "", id: "", url: "" },
    "education.training": { year: "", title: "", org: "", note: "" },
    "contact.socials": { label: "", url: "", icon: "linkedin" },
    "publications.items": { id: "", type: "penelitian", year: "", title: "", venue: "", desc: "", url: "", image: "" },
    "publications.categories": { id: "", label: "" },
    "techmate.courses": { id: "", title: "", desc: "", image: "", tags: [] },
  };
  const templateFor = (base) => {
    if (base === "about.paragraphs") return "";
    if (/^projects\[\d+\]\.links$/.test(base)) return { label: "", href: "", primary: false };
    return TEMPLATES[base] || {};
  };

  /* ---------- State ---------- */
  const PUB_KEY = "portfolio-publish";
  let state = CMS.load();
  let currentView = "overview";
  let dirty = false;

  /* ---------- Konfigurasi publikasi (GitHub) ---------- */
  function getPublishConfig() {
    try {
      const raw = localStorage.getItem(PUB_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function setPublishConfig(cfg) {
    localStorage.setItem(PUB_KEY, JSON.stringify(cfg));
  }
  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  async function readError(res) {
    try {
      const j = await res.json();
      return j && j.message ? res.status + ": " + j.message : "HTTP " + res.status;
    } catch { return "HTTP " + res.status; }
  }

  /* Menerbitkan konten ke file `content.json` di repo GitHub, sehingga
     GitHub Pages menyajikannya ke semua perangkat (HP, tablet, browser lain). */
  async function publishToGitHub() {
    const cfg = getPublishConfig();
    if (!cfg || !cfg.owner || !cfg.repo || !cfg.token) {
      throw new Error("Pengaturan publikasi belum lengkap.");
    }
    const branch = cfg.branch || "main";
    const path = cfg.path || "content.json";
    const api =
      "https://api.github.com/repos/" + encodeURIComponent(cfg.owner) +
      "/" + encodeURIComponent(cfg.repo) + "/contents/" + path;
    const headers = {
      Authorization: "Bearer " + cfg.token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    // 1) Cari SHA file yang ada (wajib untuk memperbarui file yang sudah ada).
    let sha;
    const getRes = await fetch(api + "?ref=" + encodeURIComponent(branch) + "&t=" + Date.now(), {
      headers,
      cache: "no-store",
    });
    if (getRes.ok) {
      const info = await getRes.json();
      sha = info.sha;
    } else if (getRes.status !== 404) {
      throw new Error(await readError(getRes));
    }

    // 2) Kirim konten terbaru (commit -> GitHub Pages terbit ulang).
    const body = {
      message: "Perbarui konten situs — " + new Date().toISOString(),
      content: toBase64(JSON.stringify(state, null, 2) + "\n"),
      branch,
    };
    if (sha) body.sha = sha;
    const putRes = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!putRes.ok) throw new Error(await readError(putRes));
    return true;
  }

  /* ---------- Field builder ---------- */
  function field(path, label, opts = {}) {
    const val = getPath(state, path);
    const id = "id_" + path.replace(/[^a-z0-9]/gi, "_");
    const type = opts.type || "text";
    const hint = opts.hint ? `<small>${esc(opts.hint)}</small>` : "";

    if (type === "textarea")
      return `<div class="afield"><label for="${id}">${esc(label)}</label><textarea id="${id}" data-path="${esc(path)}" rows="${opts.rows || 3}">${esc(val ?? "")}</textarea>${hint}</div>`;
    if (type === "list") {
      const v = Array.isArray(val) ? val.join(", ") : val ?? "";
      return `<div class="afield"><label for="${id}">${esc(label)}</label><input id="${id}" data-path="${esc(path)}" data-list="1" value="${esc(v)}" placeholder="${esc(opts.placeholder || "")}">${hint || "<small>Pisahkan dengan koma.</small>"}</div>`;
    }
    if (type === "select")
      return `<div class="afield"><label for="${id}">${esc(label)}</label><select id="${id}" data-path="${esc(path)}">${(opts.options || []).map((o) => `<option value="${esc(o.value)}"${String(o.value) === String(val) ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select></div>`;
    if (type === "bool")
      return `<div class="afield"><label for="${id}">${esc(label)}</label><select id="${id}" data-path="${esc(path)}" data-bool="1"><option value="true"${val ? " selected" : ""}>Ya</option><option value="false"${!val ? " selected" : ""}>Tidak</option></select></div>`;
    if (type === "color")
      return `<div class="afield"><label for="${id}">${esc(label)}</label><input id="${id}" type="color" data-path="${esc(path)}" value="${esc(val || "#4f46e5")}"></div>`;
    if (type === "number")
      return `<div class="afield"><label for="${id}">${esc(label)}</label><input id="${id}" type="number" min="0" max="100" data-path="${esc(path)}" value="${esc(val ?? "")}"></div>`;

    return `<div class="afield"><label for="${id}">${esc(label)}</label><input id="${id}" type="text" data-path="${esc(path)}" value="${esc(val ?? "")}" placeholder="${esc(opts.placeholder || "")}">${hint}</div>`;
  }

  /* Kolom gambar dengan unggah dari perangkat atau tempel URL. */
  function imageField(path, label, opts = {}) {
    const val = String(getPath(state, path) || "");
    const id = "img_" + path.replace(/[^a-z0-9]/gi, "_");
    const isData = val.startsWith("data:");
    return `
      <div class="aimg" data-imgpath="${esc(path)}">
        <label for="${id}">${esc(label)}${opts.hint ? ` <small>${esc(opts.hint)}</small>` : ""}</label>
        <div class="aimg__row">
          <div class="aimg__preview">${val ? `<img alt="" src="${esc(val)}" />` : `<span>Belum ada gambar</span>`}</div>
          <div class="aimg__ctrl">
            <input id="${id}" class="aimg__file" type="file" accept="image/*" hidden />
            <label class="btn btn--outline btn--sm" for="${id}">Unggah gambar</label>
            <button type="button" class="btn btn--ghost btn--sm" data-imgclear="${esc(path)}">Hapus</button>
            <small class="aimg__info"></small>
          </div>
        </div>
        <input type="text" class="aimg__url" data-imgurl="${esc(path)}" value="${isData ? "" : esc(val)}" placeholder="atau tempel URL gambar (https://... / assets/...)" />
      </div>`;
  }

  function initImageFields() {
    $$(".aimg", dashContent).forEach((box) => {
      const path = box.dataset.imgpath;
      const file = $(".aimg__file", box);
      const url = $(".aimg__url", box);
      const preview = $(".aimg__preview", box);
      const info = $(".aimg__info", box);
      const paint = (src) => {
        preview.innerHTML = src ? `<img alt="" src="${esc(src)}" />` : `<span>Belum ada gambar</span>`;
      };

      file?.addEventListener("change", async () => {
        const f = file.files && file.files[0];
        if (!f) return;
        try {
          if (info) info.textContent = "Memproses…";
          const dataUrl = await fileToDataUrl(f, 1200, 0.85);
          if (dataUrl.length > 2500000) {
            if (info) info.textContent = "Gambar terlalu besar (maks ~2 MB).";
            file.value = "";
            return;
          }
          setPath(state, path, dataUrl);
          dirty = true;
          setStatus("Ada perubahan belum disimpan");
          paint(dataUrl);
          if (url) url.value = "";
          if (info) info.textContent = `Terunggah: ${f.name}`;
        } catch {
          if (info) info.textContent = "Gagal memuat gambar. Coba file lain.";
        }
        file.value = "";
      });

      url?.addEventListener("input", () => {
        const v = url.value.trim();
        setPath(state, path, v);
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
        paint(v);
        if (info) info.textContent = "";
      });

      box.addEventListener("click", (e) => {
        if (!e.target.closest("[data-imgclear]")) return;
        setPath(state, path, "");
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
        paint("");
        if (url) url.value = "";
        if (info) info.textContent = "Gambar dihapus.";
      });
    });
  }

  function nextItemNo(base) {
    const arr = getPath(state, base) || [];
    return `${templateFor(base).label || base} #${arr.length + 1}`;
  }

  function repeater(base, fields, opts = {}) {
    const arr = getPath(state, base) || [];
    const items = arr
      .map(
        (_, i) => `
      <div class="repeater__item">
        <div class="repeater__head">
          <span>${esc(opts.label || "Item")} #${i + 1}</span>
          <button type="button" class="repeater__remove" data-remove="${esc(base)}" data-index="${i}">Hapus</button>
        </div>
        <div class="${fields.length > 1 ? "agrid" : ""}">
          ${fields.map((f) => field(`${base}[${i}].${f.key}`, f.label, f)).join("")}
        </div>
      </div>`
      )
      .join("");
    return items + `<button type="button" class="repeater__add" data-add="${esc(base)}">+ Tambah ${esc(opts.label || "item")}</button>`;
  }

  /* ---------- Photo upload ---------- */
  const DEFAULT_PHOTO = "assets/avatar.svg";

  function fileToDataUrl(file, maxSize = 900, quality = 0.85, forcePng = false) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("Bukan gambar"));
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Gagal memuat gambar"));
        image.onload = () => {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const w = Math.max(1, Math.round(image.width * scale));
          const h = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, w, h);
          const isPng = forcePng || /png|svg/i.test(file.type);
          resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function initPhotoPanel() {
    const preview = $("#photoPreview");
    const input = $("#photoInput");
    const clearBtn = $("#photoClear");
    const urlInput = $("#photoUrl");
    const info = $("#photoInfo");
    if (!preview || !input) return;

    const current = getPath(state, "hero.photoUrl");
    const isData = typeof current === "string" && current.startsWith("data:");
    const paint = (src) => { preview.src = src || DEFAULT_PHOTO; };

    paint(current || DEFAULT_PHOTO);
    if (urlInput) urlInput.value = isData ? "" : (current || "");
    if (info) info.textContent = isData ? "Foto diunggah dari perangkat (tersimpan di browser)." : "";

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        if (info) info.textContent = "Memproses gambar…";
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl.length > 2500000) {
          if (info) info.textContent = "Gambar terlalu besar. Pilih gambar lain (maks ~2 MB).";
          input.value = "";
          return;
        }
        setPath(state, "hero.photoUrl", dataUrl);
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
        paint(dataUrl);
        if (urlInput) urlInput.value = "";
        if (info) info.textContent = `Terunggah: ${file.name}`;
      } catch {
        if (info) info.textContent = "Gagal memuat gambar. Coba file lain.";
      }
      input.value = "";
    });

    clearBtn?.addEventListener("click", () => {
      setPath(state, "hero.photoUrl", DEFAULT_PHOTO);
      dirty = true;
      setStatus("Ada perubahan belum disimpan");
      paint(DEFAULT_PHOTO);
      if (urlInput) urlInput.value = DEFAULT_PHOTO;
      if (info) info.textContent = "Kembali ke foto default.";
    });

    urlInput?.addEventListener("input", () => {
      const v = urlInput.value.trim();
      setPath(state, "hero.photoUrl", v || DEFAULT_PHOTO);
      dirty = true;
      setStatus("Ada perubahan belum disimpan");
      paint(v || DEFAULT_PHOTO);
      if (info) info.textContent = "";
    });
  }

  /* ---------- Favicon (ikon tab browser) ---------- */
  const DEFAULT_FAVICON = "assets/favicon.svg";

  function initFaviconPanel() {
    const preview = $("#faviconPreview");
    const input = $("#faviconInput");
    const clearBtn = $("#faviconClear");
    const urlInput = $("#faviconUrl");
    const info = $("#faviconInfo");
    if (!preview || !input) return;

    const current = getPath(state, "brand.faviconUrl");
    const isData = typeof current === "string" && current.startsWith("data:");
    const paint = (src) => { preview.src = src || DEFAULT_FAVICON; };

    paint(current || DEFAULT_FAVICON);
    if (urlInput) urlInput.value = isData ? "" : (current || "");
    if (info) info.textContent = isData ? "Favicon diunggah dari perangkat." : "";

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        if (info) info.textContent = "Memproses gambar…";
        const dataUrl = await fileToDataUrl(file, 256, 0.9, true);
        if (dataUrl.length > 500000) {
          if (info) info.textContent = "Gambar terlalu besar. Pilih gambar lain.";
          input.value = "";
          return;
        }
        setPath(state, "brand.faviconUrl", dataUrl);
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
        paint(dataUrl);
        if (window.CMS.applyFavicon) CMS.applyFavicon(state);
        if (urlInput) urlInput.value = "";
        if (info) info.textContent = `Terunggah: ${file.name}`;
      } catch {
        if (info) info.textContent = "Gagal memuat gambar. Coba file lain.";
      }
      input.value = "";
    });

    clearBtn?.addEventListener("click", () => {
      setPath(state, "brand.faviconUrl", DEFAULT_FAVICON);
      dirty = true;
      setStatus("Ada perubahan belum disimpan");
      paint(DEFAULT_FAVICON);
      if (urlInput) urlInput.value = "";
      if (info) info.textContent = "Kembali ke favicon default.";
      if (window.CMS.applyFavicon) CMS.applyFavicon(state);
    });

    urlInput?.addEventListener("input", () => {
      const v = urlInput.value.trim();
      setPath(state, "brand.faviconUrl", v || DEFAULT_FAVICON);
      dirty = true;
      setStatus("Ada perubahan belum disimpan");
      paint(v || DEFAULT_FAVICON);
      if (window.CMS.applyFavicon) CMS.applyFavicon(state);
      if (info) info.textContent = "";
    });
  }

  /* ---------- Views ---------- */
  const catOptions = () => state.categories.map((c) => ({ value: c.id, label: c.label }));

  function projectLinks(i) {
    const links = getPath(state, `projects[${i}].links`) || [];
    return (
      links
        .map(
          (_, j) => `
        <div class="repeater__item" style="background:var(--surface)">
          <div class="repeater__head">
            <span>Link #${j + 1}</span>
            <button type="button" class="repeater__remove" data-remove="projects[${i}].links" data-index="${j}">Hapus</button>
          </div>
          <div class="agrid agrid--3">
            ${field(`projects[${i}].links[${j}].label`, "Label")}
            ${field(`projects[${i}].links[${j}].href`, "URL")}
            ${field(`projects[${i}].links[${j}].primary`, "Tautan utama", { type: "bool" })}
          </div>
        </div>`
        )
        .join("") + `<button type="button" class="repeater__add" data-add="projects[${i}].links">+ Tambah link</button>`
    );
  }

  function projectRepeater() {
    const arr = state.projects || [];
    return (
      arr
        .map(
          (p, i) => `
      <div class="repeater__item">
        <div class="repeater__head">
          <span>Proyek #${i + 1} — ${esc(p.title || "(belum diberi judul)")}</span>
          <button type="button" class="repeater__remove" data-remove="projects" data-index="${i}">Hapus</button>
        </div>
        <div class="agrid agrid--3">
          ${field(`projects[${i}].id`, "ID unik")}
          ${field(`projects[${i}].year`, "Tahun")}
          ${field(`projects[${i}].glyph`, "Glyph (maks 3 huruf)")}
        </div>
        ${field(`projects[${i}].title`, "Judul proyek")}
        <div class="agrid">
          ${field(`projects[${i}].category`, "Kategori", { type: "select", options: catOptions() })}
          ${field(`projects[${i}].accent`, "Warna aksen", { type: "color" })}
        </div>
        ${field(`projects[${i}].problem`, "Masalah yang diselesaikan", { type: "textarea" })}
        ${field(`projects[${i}].solution`, "Solusi & Peran", { type: "textarea" })}
        ${field(`projects[${i}].results`, "Dampak (poin)", { type: "list", hint: "Setiap poin dipisah koma." })}
        ${field(`projects[${i}].tech`, "Tag teknologi", { type: "list" })}
        <div class="afield"><label>Tautan (demo / repo)</label>${projectLinks(i)}</div>
      </div>`
        )
        .join("") + `<button type="button" class="repeater__add" data-add="projects">+ Tambah proyek</button>`
    );
  }

  const VIEWS = {
    overview() {
      return `
        <div class="ov-grid">
          <div class="ov-card"><b>${state.projects.length}</b><span>Proyek</span></div>
          <div class="ov-card"><b>${state.experience.length}</b><span>Pengalaman</span></div>
          <div class="ov-card"><b>${state.education.certs.length}</b><span>Sertifikasi</span></div>
          <div class="ov-card"><b>${state.skills.technical.reduce((n, g) => n + g.items.length, 0)}</b><span>Teknologi</span></div>
        </div>
        <div class="panel">
          <h3 class="panel__title">Selamat datang di panel konten</h3>
          <p class="panel__desc">Kelola seluruh isi website dari sini, lalu klik <b>Simpan</b>.</p>
          <ul class="tips">
            <li>Perubahan tersimpan di browser ini (localStorage). Agar tampil di HP/tab/perangkat lain, buka <b>Pengaturan → Publikasi ke semua perangkat</b> lalu klik <b>Publikasikan</b>.</li>
            <li>Menu <b>Profil &amp; Hero</b> mengatur nama, peran, ringkasan, dan statistik.</li>
            <li>Menu <b>Proyek</b> mendukung tambah/ubah/hapus, tag teknologi, serta tautan demo &amp; repo.</li>
            <li>Jangan lupa ubah password default di menu <b>Pengaturan</b>.</li>
          </ul>
        </div>`;
    },

    profil() {
      return `
        <div class="panel">
          <h3 class="panel__title">Identitas &amp; SEO</h3>
          <p class="panel__desc">Tampil pada judul tab dan meta deskripsi.</p>
          ${field("meta.title", "Judul halaman (title)")}
          ${field("meta.description", "Meta deskripsi", { type: "textarea", rows: 2 })}
          <div class="agrid">
            ${field("brand.initials", "Inisial logo")}
            ${field("brand.name", "Nama pada navbar")}
          </div>
        </div>
        <div class="panel">
          <h3 class="panel__title">Foto Profil</h3>
          <p class="panel__desc">Unggah foto dari perangkat (JPG/PNG/WebP). Gambar otomatis diperkecil agar hemat penyimpanan browser.</p>
          <div class="photo">
            <div class="photo__preview"><img id="photoPreview" src="assets/avatar.svg" alt="Pratinjau foto profil" /></div>
            <div class="photo__ctrl">
              <input id="photoInput" type="file" accept="image/*" hidden />
              <label class="btn btn--outline btn--sm" for="photoInput">Pilih &amp; unggah foto</label>
              <button type="button" class="btn btn--ghost btn--sm" id="photoClear">Gunakan default</button>
              <small id="photoInfo"></small>
            </div>
          </div>
          <div class="afield">
            <label for="photoUrl">Atau tempel URL foto</label>
            <input id="photoUrl" type="text" placeholder="Contoh: assets/foto.jpg atau https://..." />
            <small>Biarkan kosong untuk memakai foto default.</small>
          </div>
        </div>
        <div class="panel">
          <h3 class="panel__title">Favicon (ikon tab browser)</h3>
          <p class="panel__desc">Tampil di tab browser, bookmark, dan ikon pintasan di HP. Gunakan gambar persegi (PNG/SVG), disarankan 256×256 px atau lebih kecil.</p>
          <div class="photo">
            <div class="photo__preview"><img id="faviconPreview" src="assets/favicon.svg" alt="Pratinjau favicon" /></div>
            <div class="photo__ctrl">
              <input id="faviconInput" type="file" accept="image/*" hidden />
              <label class="btn btn--outline btn--sm" for="faviconInput">Pilih &amp; unggah favicon</label>
              <button type="button" class="btn btn--ghost btn--sm" id="faviconClear">Gunakan default</button>
              <small id="faviconInfo"></small>
            </div>
          </div>
          <div class="afield">
            <label for="faviconUrl">Atau tempel URL favicon</label>
            <input id="faviconUrl" type="text" placeholder="Contoh: assets/favicon.svg atau https://..." />
            <small>Biarkan kosong untuk memakai favicon default.</small>
          </div>
        </div>
        <div class="panel">
          <h3 class="panel__title">Hero</h3>
          ${field("hero.availability", "Badge ketersediaan")}
          ${field("hero.name", "Nama lengkap")}
          ${field("hero.role", "Peran / spesialisasi")}
          ${field("hero.summary", "Ringkasan (2–3 kalimat)", { type: "textarea", rows: 4 })}
          <div class="agrid">
            ${field("hero.location", "Lokasi")}
            ${field("hero.email", "Email")}
          </div>
          ${field("hero.cvUrl", "URL file CV", { hint: "Contoh: assets/cv.pdf" })}
        </div>
        <div class="panel">
          <h3 class="panel__title">Statistik</h3>
          <p class="panel__desc">Angka pencapaian singkat di hero.</p>
          ${repeater("hero.stats", [{ key: "value", label: "Angka" }, { key: "label", label: "Keterangan" }], { label: "Statistik" })}
        </div>`;
    },

    tentang() {
      return tentangView();
    },
  };

  /* --- placeholder agar struktur VIEWS tetap rapi --- */

  /* ---- View Tentang Saya ---- */
  function tentangView() {
    const paras = (state.about.paragraphs || [])
      .map(
        (p, i) => `
      <div class="repeater__item">
        <div class="repeater__head"><span>Paragraf #${i + 1}</span>
          <button type="button" class="repeater__remove" data-remove="about.paragraphs" data-index="${i}">Hapus</button></div>
        <div class="afield"><textarea data-path="about.paragraphs[${i}]" rows="3">${esc(p)}</textarea></div>
      </div>`
      )
      .join("");
    return `
      <div class="panel">
        <h3 class="panel__title">Judul &amp; latar belakang</h3>
        ${field("about.kicker", "Kicker")}
        ${field("about.title", "Judul seksi")}
        ${field("about.backgroundHeading", "Sub-judul latar belakang")}
        ${paras}<button type="button" class="repeater__add" data-add="about.paragraphs">+ Tambah paragraf</button>
      </div>
      <div class="panel">
        <h3 class="panel__title">Kutipan &amp; fakta</h3>
        ${field("about.quote", "Kutipan prinsip kerja", { type: "textarea", rows: 2 })}
        <div class="afield"><label>Fakta "Sekilas"</label>
          ${repeater("about.facts", [{ key: "label", label: "Label" }, { key: "value", label: "Nilai" }], { label: "Fakta" })}
        </div>
      </div>
      <div class="panel">
        <h3 class="panel__title">Bidang minat utama</h3>
        ${field("about.interestsHeading", "Sub-judul")}
        ${field("about.interestsLead", "Deskripsi singkat")}
        ${repeater("about.interests", [{ key: "title", label: "Judul" }, { key: "desc", label: "Deskripsi", type: "textarea", rows: 2 }], { label: "Minat" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Filosofi kerja</h3>
        ${field("about.philosophyHeading", "Sub-judul")}
        ${field("about.philosophyLead", "Deskripsi singkat")}
        ${repeater("about.philosophy", [{ key: "title", label: "Prinsip" }, { key: "desc", label: "Penjelasan", type: "textarea", rows: 2 }], { label: "Prinsip" })}
      </div>`;
  }

  function keahlianView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Technical Skills</h3>
        ${field("skills.technicalHeading", "Sub-judul")}
        ${field("skills.technicalLead", "Deskripsi singkat")}
        ${repeater("skills.technical", [
          { key: "group", label: "Nama grup" },
          { key: "items", label: "Daftar teknologi", type: "list" },
        ], { label: "Grup" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Tingkat penguasaan</h3>
        ${repeater("skills.proficiency", [
          { key: "label", label: "Keahlian" },
          { key: "percent", label: "Persen (0-100)", type: "number" },
        ], { label: "Bar" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Alat &amp; software tambahan</h3>
        ${field("skills.toolsHeading", "Sub-judul")}
        ${field("skills.toolsLead", "Deskripsi singkat")}
        ${repeater("skills.tools", [
          { key: "group", label: "Nama grup" },
          { key: "items", label: "Daftar alat", type: "list" },
        ], { label: "Grup" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Keahlian non-teknis</h3>
        ${field("skills.coreHeading", "Sub-judul")}
        ${field("skills.coreLead", "Deskripsi singkat")}
        ${repeater("skills.core", [
          { key: "title", label: "Keahlian" },
          { key: "desc", label: "Deskripsi", type: "textarea", rows: 2 },
        ], { label: "Keahlian" })}
      </div>`;
  }

  function proyekView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Kategori</h3>
        <p class="panel__desc">Digunakan untuk filter pada seksi Proyek.</p>
        ${repeater("categories", [
          { key: "id", label: "ID kategori" },
          { key: "label", label: "Label" },
        ], { label: "Kategori" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Daftar proyek</h3>
        <p class="panel__desc">Kartu interaktif: masalah, solusi, dampak, tag teknologi, dan tautan demo/repo.</p>
        ${projectRepeater()}
      </div>`;
  }

  function pengalamanView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Pengalaman kerja &amp; organisasi</h3>
        ${repeater("experience", [
          { key: "type", label: "Jenis", type: "select", options: [{ value: "kerja", label: "Kerja" }, { value: "organisasi", label: "Organisasi" }] },
          { key: "typeLabel", label: "Label tipe", hint: "Mis. Penuh Waktu, Magang, Organisasi" },
          { key: "date", label: "Rentang waktu" },
          { key: "title", label: "Posisi" },
          { key: "org", label: "Instansi / perusahaan" },
          { key: "points", label: "Poin pencapaian", type: "list", hint: "Pisah tiap poin dengan koma." },
        ], { label: "Pengalaman" })}
      </div>`;
  }

  function pendidikanView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Pendidikan formal</h3>
        ${repeater("education.formal", [
          { key: "date", label: "Rentang tahun" },
          { key: "title", label: "Jenjang / jurusan" },
          { key: "org", label: "Institusi" },
          { key: "note", label: "Catatan", type: "textarea", rows: 2 },
        ], { label: "Pendidikan" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Sertifikasi</h3>
        ${repeater("education.certs", [
          { key: "abbr", label: "Singkatan" },
          { key: "title", label: "Nama sertifikat" },
          { key: "org", label: "Penerbit" },
          { key: "year", label: "Tahun" },
          { key: "id", label: "ID kredensial" },
          { key: "url", label: "URL verifikasi" },
        ], { label: "Sertifikat" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Pelatihan &amp; up-skilling</h3>
        ${repeater("education.training", [
          { key: "year", label: "Tahun" },
          { key: "title", label: "Program" },
          { key: "org", label: "Penyelenggara / durasi" },
          { key: "note", label: "Deskripsi", type: "textarea", rows: 2 },
        ], { label: "Pelatihan" })}
      </div>`;
  }

  /* ---- View Publikasi Karya ---- */
  const pubCatOptions = () => ((state.publications && state.publications.categories) || []).map((c) => ({ value: c.id, label: c.label }));

  function publicationRepeater() {
    const arr = (state.publications && state.publications.items) || [];
    const cats = pubCatOptions();
    return (
      arr
        .map(
          (p, i) => `
      <div class="repeater__item">
        <div class="repeater__head">
          <span>Publikasi #${i + 1} — ${esc(p.title || "(belum diberi judul)")}</span>
          <button type="button" class="repeater__remove" data-remove="publications.items" data-index="${i}">Hapus</button>
        </div>
        <div class="agrid agrid--3">
          ${field(`publications.items[${i}].id`, "ID unik")}
          ${field(`publications.items[${i}].year`, "Tahun")}
          ${field(`publications.items[${i}].type`, "Kategori", { type: "select", options: cats })}
        </div>
        ${field(`publications.items[${i}].title`, "Judul")}
        ${field(`publications.items[${i}].venue`, "Jurnal / Penerbit / Lokasi")}
        ${field(`publications.items[${i}].desc`, "Deskripsi singkat", { type: "textarea", rows: 2 })}
        ${field(`publications.items[${i}].url`, "URL tautan")}
        ${imageField(`publications.items[${i}].image`, "Gambar / Sampul")}
      </div>`
        )
        .join("") + `<button type="button" class="repeater__add" data-add="publications.items">+ Tambah publikasi</button>`
    );
  }

  function publikasiView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Judul &amp; pengantar</h3>
        ${field("publications.kicker", "Kicker")}
        ${field("publications.title", "Judul seksi")}
        ${field("publications.lead", "Deskripsi singkat", { type: "textarea", rows: 2 })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Kategori</h3>
        <p class="panel__desc">Contoh: Penelitian, Pengabdian Masyarakat, Buku.</p>
        ${repeater("publications.categories", [
          { key: "id", label: "ID kategori" },
          { key: "label", label: "Label" },
        ], { label: "Kategori" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Daftar publikasi</h3>
        <p class="panel__desc">Setiap karya bisa memuat gambar/sampul, tautan, dan keterangan.</p>
        ${publicationRepeater()}
      </div>`;
  }

  /* ---- View Techmate (Kursus Privat) ---- */
  function courseRepeater() {
    const arr = (state.techmate && state.techmate.courses) || [];
    return (
      arr
        .map(
          (c, i) => `
      <div class="repeater__item">
        <div class="repeater__head">
          <span>Kursus #${i + 1} — ${esc(c.title || "(belum diberi nama)")}</span>
          <button type="button" class="repeater__remove" data-remove="techmate.courses" data-index="${i}">Hapus</button>
        </div>
        <div class="agrid">
          ${field(`techmate.courses[${i}].id`, "ID unik")}
          ${field(`techmate.courses[${i}].title`, "Nama kursus")}
        </div>
        ${field(`techmate.courses[${i}].desc`, "Deskripsi", { type: "textarea", rows: 2 })}
        ${field(`techmate.courses[${i}].tags`, "Tag (pisah koma)", { type: "list" })}
        ${imageField(`techmate.courses[${i}].image`, "Gambar kursus")}
      </div>`
        )
        .join("") + `<button type="button" class="repeater__add" data-add="techmate.courses">+ Tambah kursus</button>`
    );
  }

  function techmateView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Judul &amp; pengantar</h3>
        ${field("techmate.kicker", "Kicker")}
        ${field("techmate.title", "Judul seksi")}
        ${field("techmate.lead", "Deskripsi singkat", { type: "textarea", rows: 2 })}
      </div>
      <div class="panel">
        <h3 class="panel__title">WhatsApp Techmate</h3>
        ${field("techmate.whatsapp", "Nomor WhatsApp", { hint: "Format internasional tanpa +, contoh: 6281234567890. Kosongkan untuk memakai nomor pada menu Kontak." })}
        ${field("techmate.whatsappMessage", "Pesan otomatis WhatsApp", { type: "textarea", rows: 2 })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Daftar kursus</h3>
        <p class="panel__desc">Contoh: Ms Office, Ms Excel, Video Editing, Digital Marketing, AI Optimization. Setiap kursus bisa memuat gambar.</p>
        ${courseRepeater()}
      </div>`;
  }

  function kontakView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Kontak</h3>
        ${field("contact.title", "Judul")}
        ${field("contact.sub", "Deskripsi", { type: "textarea", rows: 2 })}
        ${field("contact.email", "Email profesional")}
        <div class="agrid">
          ${field("contact.whatsapp", "Nomor WhatsApp", { hint: "Format internasional tanpa +, contoh: 6281234567890." })}
          ${field("contact.whatsappMessage", "Pesan otomatis WhatsApp")}
        </div>
      </div>
      <div class="panel">
        <h3 class="panel__title">Akun profesional &amp; tautan</h3>
        ${repeater("contact.socials", [
          { key: "label", label: "Label" },
          { key: "url", label: "URL" },
          { key: "icon", label: "Ikon", type: "select", options: [
            { value: "linkedin", label: "LinkedIn" },
            { value: "github", label: "GitHub" },
            { value: "dribbble", label: "Dribbble" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "download", label: "Unduh" },
          ] },
        ], { label: "Tautan" })}
      </div>
      <div class="panel">
        <h3 class="panel__title">Footer</h3>
        <div class="agrid">
          ${field("footer.name", "Nama")}
          ${field("footer.role", "Peran")}
        </div>
      </div>`;
  }

  function pengaturanView() {
    const cfg = getPublishConfig() || {};
    const auto = cfg.auto !== false ? "true" : "false";
    return `
      <div class="panel">
        <h3 class="panel__title">Cadangkan konten</h3>
        <p class="panel__desc">Unduh seluruh konten sebagai file JSON, atau tempel JSON untuk memulihkan.</p>
        <div class="btn-row">
          <button type="button" class="btn btn--outline btn--sm" id="exportBtn">Ekspor JSON</button>
          <button type="button" class="btn btn--outline btn--sm" id="importBtn">Impor JSON</button>
          <button type="button" class="btn danger btn--sm" id="resetAllBtn">Reset ke default</button>
        </div>
        <div class="afield" style="margin-top:1rem">
          <label for="importArea">Tempel JSON di sini</label>
          <textarea id="importArea" class="import-area" placeholder='{ "version": 1, ... }'></textarea>
        </div>
      </div>
      <div class="panel">
        <h3 class="panel__title">Publikasi ke semua perangkat</h3>
        <p class="panel__desc">
          Simpan konten ke file <b>content.json</b> di server agar ikut tampil di HP,
          tablet, dan browser lain — bukan hanya di perangkat ini. Isi data repositori
          GitHub tempat situs ini di-hosting (GitHub Pages).
        </p>
        <div class="agrid">
          <div class="afield"><label for="pub-owner">Pemilik repo (username)</label><input id="pub-owner" type="text" value="${esc(cfg.owner || "wafiarifin")}" placeholder="wafiarifin" /></div>
          <div class="afield"><label for="pub-repo">Nama repo</label><input id="pub-repo" type="text" value="${esc(cfg.repo || "Profil-Wafi")}" placeholder="Profil-Wafi" /></div>
        </div>
        <div class="agrid">
          <div class="afield"><label for="pub-branch">Branch</label><input id="pub-branch" type="text" value="${esc(cfg.branch || "main")}" placeholder="main" /></div>
          <div class="afield"><label for="pub-path">Path file</label><input id="pub-path" type="text" value="${esc(cfg.path || "content.json")}" placeholder="content.json" /></div>
        </div>
        <div class="afield">
          <label for="pub-token">Personal Access Token (Contents: Read and write)</label>
          <input id="pub-token" type="password" value="${esc(cfg.token || "")}" placeholder="github_pat_..." autocomplete="off" />
          <small>Hanya disimpan di browser ini. Jangan dibagikan ke siapa pun.</small>
        </div>
        <div class="afield">
          <label for="pub-auto">Publikasikan otomatis setiap klik Simpan</label>
          <select id="pub-auto"><option value="true"${auto === "true" ? " selected" : ""}>Ya</option><option value="false"${auto === "false" ? " selected" : ""}>Tidak</option></select>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn--primary btn--sm" id="pubSaveCfgBtn">Simpan pengaturan</button>
          <button type="button" class="btn btn--outline btn--sm" id="pubNowBtn">Publikasikan sekarang</button>
          <button type="button" class="btn btn--ghost btn--sm" id="pubClearBtn">Hapus token</button>
        </div>
        <p class="dash__status" id="pubStatus" role="status"></p>
        <ol class="tips">
          <li>GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.</li>
          <li>Beri akses ke repositori situs ini dengan izin <b>Contents: Read and write</b>.</li>
          <li>Tempel token di atas, simpan, lalu klik <b>Publikasikan sekarang</b>.</li>
          <li>Setelah terbit, tunggu 1–2 menit agar GitHub Pages memuat ulang, lalu cek di HP/tab lain.</li>
        </ol>
      </div>
      <div class="panel">
        <h3 class="panel__title">Ubah password</h3>
        <p class="panel__desc">Password disimpan sebagai hash SHA-256 di browser ini.</p>
        <div class="agrid">
          <div class="afield"><label for="pw-cur">Password saat ini</label><input id="pw-cur" type="password" /></div>
          <div class="afield"><label for="pw-new">Password baru</label><input id="pw-new" type="password" /></div>
        </div>
        <button type="button" class="btn btn--primary btn--sm" id="pwBtn">Simpan password</button>
        <p class="dash__status" id="pwStatus" role="status"></p>
      </div>
      <div class="panel">
        <h3 class="panel__title">Catatan keamanan</h3>
        <p class="panel__desc">
          Panel ini berjalan sepenuhnya di browser tanpa server. Autentikasinya tidak
          melindungi situs dari publik — siapa pun dapat membaca file. Untuk produksi,
          gunakan autentikasi berbasis server atau layanan CMS/backend.
        </p>
      </div>`;
  }

  /* ---------- Render ---------- */
  const viewRenderers = {
    overview: () => VIEWS.overview(),
    profil: () => VIEWS.profil(),
    tentang: tentangView,
    keahlian: keahlianView,
    publikasi: publikasiView,
    proyek: proyekView,
    pengalaman: pengalamanView,
    pendidikan: pendidikanView,
    techmate: techmateView,
    kontak: kontakView,
    pengaturan: pengaturanView,
  };
  const titles = {
    overview: "Ringkasan", profil: "Profil & Hero", tentang: "Tentang Saya",
    keahlian: "Keahlian", publikasi: "Publikasi Karya", proyek: "Proyek",
    pengalaman: "Pengalaman", pendidikan: "Pendidikan & Sertifikasi",
    techmate: "Techmate", kontak: "Kontak", pengaturan: "Pengaturan",
  };

  const dashContent = $("#dashContent");
  const saveBtn = $("#saveBtn");
  const saveStatus = $("#saveStatus");
  const resetViewBtn = $("#resetViewBtn");

  function render(view) {
    currentView = view;
    $("#viewTitle").textContent = titles[view] || "Panel";
    dashContent.innerHTML = viewRenderers[view] ? viewRenderers[view]() : "";
    if (view === "profil") { initPhotoPanel(); initFaviconPanel(); }
    initImageFields();
    $$("#dashNav button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
    saveBtn.style.display = view === "overview" || view === "pengaturan" ? "none" : "";
    resetViewBtn.hidden = view === "overview" || view === "pengaturan";
    dirty = false;
    setStatus("");
    window.scrollTo(0, 0);
  }

  function setStatus(msg, isError = false) {
    saveStatus.textContent = msg;
    saveStatus.classList.toggle("is-error", isError);
  }

  /* ---------- Input handling ---------- */
  dashContent.addEventListener("input", (e) => {
    const el = e.target.closest("[data-path]");
    if (!el) return;
    const path = el.dataset.path;
    let v = el.value;
    if (el.dataset.list) v = v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    else if (el.dataset.bool) v = el.value === "true";
    else if (el.type === "number") v = Number(v);
    setPath(state, path, v);
    dirty = true;
    setStatus("Ada perubahan belum disimpan");
  });
  dashContent.addEventListener("change", (e) => {
    const el = e.target.closest("[data-path]");
    if (el && (el.tagName === "SELECT")) el.dispatchEvent(new Event("input", { bubbles: true }));
  });

  dashContent.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const base = add.dataset.add;
      const arr = getPath(state, base);
      if (Array.isArray(arr)) {
        arr.push(CMS.clone(templateFor(base)));
        render(currentView);
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
      }
      return;
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      const base = rm.dataset.remove;
      const idx = Number(rm.dataset.index);
      const arr = getPath(state, base);
      if (Array.isArray(arr)) {
        arr.splice(idx, 1);
        render(currentView);
        dirty = true;
        setStatus("Ada perubahan belum disimpan");
      }
      return;
    }
    if (e.target.id === "exportBtn") return exportJSON();
    if (e.target.id === "importBtn") return importJSON();
    if (e.target.id === "resetAllBtn") return resetAll();
    if (e.target.id === "pwBtn") return savePassword();
    if (e.target.id === "pubSaveCfgBtn") return savePublishConfig();
    if (e.target.id === "pubNowBtn") return publishNow();
    if (e.target.id === "pubClearBtn") return clearPublishConfig();
  });

  /* ---------- Actions ---------- */
  async function save() {
    CMS.save(state);
    dirty = false;
    const cfg = getPublishConfig();
    if (cfg && cfg.auto && cfg.token) {
      setStatus("Menyimpan & menerbitkan…");
      try {
        await publishToGitHub();
        setStatus("Tersimpan & terbit ke semua perangkat ✓");
      } catch (err) {
        setStatus("Tersimpan lokal, gagal terbit: " + err.message, true);
        return;
      }
    } else {
      setStatus("Tersimpan di perangkat ini ✓ — klik Publikasikan agar tampil di semua perangkat");
    }
    setTimeout(() => setStatus(""), 4000);
  }

  function savePublishConfig() {
    const st = $("#pubStatus");
    const cfg = {
      owner: $("#pub-owner").value.trim(),
      repo: $("#pub-repo").value.trim(),
      branch: $("#pub-branch").value.trim() || "main",
      path: $("#pub-path").value.trim() || "content.json",
      token: $("#pub-token").value.trim(),
      auto: $("#pub-auto").value === "true",
    };
    setPublishConfig(cfg);
    st.classList.remove("is-error");
    st.textContent = "Pengaturan publikasi tersimpan ✓";
  }

  async function publishNow() {
    savePublishConfig(); // pastikan isian terbaru terpakai
    const st = $("#pubStatus");
    st.classList.remove("is-error");
    st.textContent = "Menerbitkan…";
    try {
      await publishToGitHub();
      st.textContent = "Berhasil diterbitkan ✓ Tunggu 1–2 menit lalu muat ulang di HP/tab lain.";
    } catch (err) {
      st.classList.add("is-error");
      st.textContent = "Gagal menerbitkan: " + err.message;
    }
  }

  function clearPublishConfig() {
    localStorage.removeItem(PUB_KEY);
    render("pengaturan");
    const st = $("#pubStatus");
    if (st) st.textContent = "Konfigurasi publikasi dihapus.";
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "konten-portofolio.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON() {
    const area = $("#importArea");
    if (!area || !area.value.trim()) {
      setStatus("Tempel JSON terlebih dahulu.", true);
      return;
    }
    try {
      state = CMS.importJSON(area.value);
      setStatus("Konten berhasil diimpor ✓");
      render(currentView);
    } catch {
      setStatus("JSON tidak valid.", true);
    }
  }

  function resetAll() {
    if (!window.confirm("Kembalikan semua konten ke pengaturan default? Perubahan akan hilang.")) return;
    CMS.reset();
    state = CMS.load();
    setStatus("Konten dikembalikan ke default.");
    render(currentView);
  }

  async function savePassword() {
    const cur = $("#pw-cur").value;
    const next = $("#pw-new").value;
    const st = $("#pwStatus");
    if (next.length < 6) {
      st.textContent = "Password baru minimal 6 karakter.";
      st.classList.add("is-error");
      return;
    }
    const ok = await CMS.changePassword(cur, next);
    st.classList.toggle("is-error", !ok);
    st.textContent = ok ? "Password diperbarui ✓" : "Password saat ini salah.";
    if (ok) { $("#pw-cur").value = ""; $("#pw-new").value = ""; }
  }

  /* ---------- Auth / boot ---------- */
  const loginView = $("#loginView");
  const dashView = $("#dashView");

  async function showApp() {
    await CMS.initAuth();
    const { name, initials } = CMS.load().brand || {};
    if (window.CMS.applyFavicon) CMS.applyFavicon(CMS.load());
    const mark = $("#loginBrand");
    if (mark) mark.textContent = initials || "AD";
    const side = $("#sideMark");
    if (side) side.textContent = initials || "AD";

    if (CMS.isLoggedIn()) {
      loginView.hidden = true;
      dashView.hidden = false;
      render("overview");
    } else {
      loginView.hidden = false;
      dashView.hidden = true;
    }
  }

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#loginError");
    err.textContent = "";
    const ok = await CMS.login($("#lg-user").value.trim(), $("#lg-pass").value);
    if (ok) {
      loginView.hidden = true;
      dashView.hidden = false;
      render("overview");
    } else {
      err.textContent = "Username atau password salah.";
    }
  });

  $("#logoutBtn").addEventListener("click", () => {
    CMS.logout();
    location.reload();
  });

  $("#dashNav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]");
    if (!btn) return;
    if (dirty && !window.confirm("Ada perubahan yang belum disimpan. Tetap pindah?")) return;
    render(btn.dataset.view);
  });

  saveBtn.addEventListener("click", save);

  // Batalkan perubahan yang belum disimpan pada view aktif
  resetViewBtn.addEventListener("click", () => {
    if (!window.confirm("Batalkan semua perubahan yang belum disimpan pada halaman ini?")) return;
    state = CMS.load();
    render(currentView);
    setStatus("Perubahan dibatalkan.");
  });

  showApp();
})();

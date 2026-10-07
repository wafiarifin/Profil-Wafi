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
  };
  const templateFor = (base) => {
    if (base === "about.paragraphs") return "";
    if (/^projects\[\d+\]\.links$/.test(base)) return { label: "", href: "", primary: false };
    return TEMPLATES[base] || {};
  };

  /* ---------- State ---------- */
  let state = CMS.load();
  let currentView = "overview";
  let dirty = false;

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
            <li>Perubahan tersimpan di browser ini (localStorage). Untuk membawa ke situs publik, gunakan <b>Ekspor JSON</b> di menu Pengaturan.</li>
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

  function kontakView() {
    return `
      <div class="panel">
        <h3 class="panel__title">Kontak</h3>
        ${field("contact.title", "Judul")}
        ${field("contact.sub", "Deskripsi", { type: "textarea", rows: 2 })}
        ${field("contact.email", "Email profesional")}
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
    proyek: proyekView,
    pengalaman: pengalamanView,
    pendidikan: pendidikanView,
    kontak: kontakView,
    pengaturan: pengaturanView,
  };
  const titles = {
    overview: "Ringkasan", profil: "Profil & Hero", tentang: "Tentang Saya",
    keahlian: "Keahlian", proyek: "Proyek", pengalaman: "Pengalaman",
    pendidikan: "Pendidikan & Sertifikasi", kontak: "Kontak", pengaturan: "Pengaturan",
  };

  const dashContent = $("#dashContent");
  const saveBtn = $("#saveBtn");
  const saveStatus = $("#saveStatus");
  const resetViewBtn = $("#resetViewBtn");

  function render(view) {
    currentView = view;
    $("#viewTitle").textContent = titles[view] || "Panel";
    dashContent.innerHTML = viewRenderers[view] ? viewRenderers[view]() : "";
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
  });

  /* ---------- Actions ---------- */
  function save() {
    CMS.save(state);
    dirty = false;
    setStatus("Tersimpan ✓");
    setTimeout(() => setStatus(""), 2200);
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

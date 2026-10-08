/* =========================================================
   CMS-lite — Lapisan data konten
   Menyimpan seluruh isi website dalam localStorage, dengan
   nilai default yang bisa di-export/impor sebagai JSON.
   ========================================================= */
window.CMS = (() => {
  "use strict";

  const KEY = "portfolio-content";
  const AUTH_KEY = "portfolio-admin";
  const SESSION_KEY = "portfolio-session";
  const DRAFT_KEY = "portfolio-draft";
  const REMOTE_CACHE_KEY = "portfolio-content-remote";
  const REMOTE_URL = "content.json";

  /* ---------- Nilai default (sesuai isi situs) ---------- */
  const DEFAULT_CONTENT = {
    version: 1,
    meta: {
      title: "Profil Diri — Portofolio Digital",
      description:
        "Web Developer & Technical Educator dengan pengalaman 5+ tahun membangun produk digital yang cepat, aksesibel, dan berdampak.",
    },
    brand: { initials: "AD", name: "Andi Pratama", faviconUrl: "assets/favicon.svg" },
    hero: {
      availability: "Terbuka untuk peluang kerja sama",
      name: "Andi Pratama",
      role: "Web Developer & Technical Educator",
      summary:
        "Web Developer & Technical Educator dengan pengalaman 5+ tahun membangun produk digital dari konsep hingga rilis produksi. Fokus keahlian saya ada pada performa, aksesibilitas, dan pengalaman pengguna yang sederhana namun berdampak. Saya membantu tim mengubah kebutuhan rumit menjadi antarmuka yang cepat, mudah dipakai, dan mudah dirawat.",
      location: "Jakarta, Indonesia",
      email: "andi@example.com",
      photoUrl: "assets/avatar.svg",
      cvUrl: "assets/cv.pdf",
      stats: [
        { value: "5+", label: "Tahun pengalaman" },
        { value: "40+", label: "Proyek selesai" },
        { value: "12", label: "Klien puas" },
      ],
    },
    about: {
      kicker: "Tentang Saya",
      title: "Dari masalah nyata menjadi produk yang benar-benar dipakai",
      backgroundHeading: "Latar Belakang Profesional",
      paragraphs: [
        "Saya mulai dari rasa penasaran bagaimana sebuah halaman sederhana bisa memudahkan ribuan orang. Sejak saat itu saya menghabiskan lima tahun terakhir membangun aplikasi web bersama tim produk, dari startup kecil hingga perusahaan dengan puluhan ribu pengguna aktif.",
        "Fokus saya ada di persimpangan antara rekayasa frontend dan desain pengalaman: menulis kode yang cepat, aksesibel, dan terukur, tanpa mengorbankan kejelasan bagi pengguna. Saya percaya produk yang baik lahir dari pemahaman masalah, bukan sekadar menumpuk fitur.",
        "Selain membangun, saya senang mengajar dan berbagi — melalui workshop internal, mentor komunitas, dan dokumentasi yang rapi — karena pengetahuan yang dibagikan membuat seluruh tim tumbuh lebih cepat.",
      ],
      quote: "Kerjakan hal rumit dengan sederhana, lalu ukur dampaknya.",
      facts: [
        { label: "Berbasis di", value: "Jakarta, Indonesia (terbuka remote)" },
        { label: "Fokus keahlian", value: "Performa web, aksesibilitas, design system" },
        { label: "Pengalaman", value: "5+ tahun, 40+ proyek terkirim" },
        { label: "Pendidikan", value: "S1 Teknik Informatika, cum laude" },
        { label: "Bahasa", value: "Indonesia (native) · Inggris (profesional)" },
      ],
      interestsHeading: "Bidang Minat Utama",
      interestsLead: "Tiga area yang paling saya geluti dan ingin terus kembangkan.",
      interests: [
        { title: "Pengembangan Web", desc: "Membangun aplikasi web modern yang cepat, aksesibel, dan skalabel — dari antarmuka hingga integrasi API." },
        { title: "Sistem Informasi", desc: "Merancang alur data dan sistem yang membuat operasional tim lebih efisien, terukur, dan mudah dipelihara." },
        { title: "Edukasi Teknologi", desc: "Mengajar, menulis, dan membangun materi belajar yang membuat konsep teknis rumit menjadi mudah dipahami." },
      ],
      philosophyHeading: "Filosofi Kerja",
      philosophyLead: "Empat prinsip yang saya pegang di setiap proyek.",
      philosophy: [
        { title: "Sederhana dulu, baru cerdas", desc: "Bangun solusi paling sederhana yang menyelesaikan masalah, lalu optimalkan berdasarkan kebutuhan nyata — bukan tebakan." },
        { title: "Ukur, jangan menebak", desc: "Setiap keputusan desain dan teknis diuji dengan data pengguna serta metrik performa, agar dampaknya bisa dibuktikan." },
        { title: "Aksesibel sejak awal", desc: "Aksesibilitas bukan tambahan di akhir, melainkan dasar yang membuat produk dapat digunakan semua orang." },
        { title: "Berbagi agar tim tumbuh", desc: "Dokumentasi, code review, dan mentoring membuat pengetahuan tersebar sehingga seluruh tim bergerak lebih cepat." },
      ],
    },
    skills: {
      technicalHeading: "Technical Skills",
      technicalLead: "Pengembangan Web & Software — teknologi yang saya pakai untuk membangun dan mengoperasikan produk.",
      technical: [
        { group: "Bahasa Pemrograman", items: ["JavaScript", "TypeScript", "Python", "PHP", "SQL", "HTML5", "CSS3"] },
        { group: "Framework & Library", items: ["React", "Vue", "Next.js", "Node.js", "Express", "Laravel", "Tailwind", "Bootstrap"] },
        { group: "Database", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase Firestore"] },
        { group: "Cloud & Serverless", items: ["AWS Lambda", "Amazon S3", "Google Cloud", "Google Apps Script", "Firebase", "Vercel", "Netlify"] },
        { group: "DevOps & Tools", items: ["Git", "GitHub Actions", "Docker", "CI/CD", "Jest", "Figma"] },
      ],
      proficiency: [
        { label: "UI / Frontend", percent: 95 },
        { label: "Backend API", percent: 82 },
        { label: "Database", percent: 75 },
        { label: "Cloud & Serverless", percent: 70 },
      ],
      toolsHeading: "Alat & Software Tambahan",
      toolsLead: "Perangkat pendukung desain, produksi media, dan kolaborasi harian.",
      tools: [
        { group: "Desain", items: ["Figma", "Adobe Photoshop", "Adobe Illustrator", "Canva", "Affinity Designer"] },
        { group: "Editing Video", items: ["Adobe Premiere Pro", "Adobe After Effects", "DaVinci Resolve", "CapCut"] },
        { group: "Produktivitas", items: ["Notion", "Trello", "Miro", "Slack", "Google Workspace", "Microsoft 365"] },
      ],
      coreHeading: "Keahlian Non-Teknis",
      coreLead: "Kemampuan inti yang menopang kerja teknis dan kerja sama tim.",
      core: [
        { title: "Pengajaran & Instruksional", desc: "Merancang materi, memandu workshop, dan mendampingi anggota tim agar cepat memahami konsep teknis." },
        { title: "Analisis Sistem", desc: "Memetakan kebutuhan, alur proses, dan data menjadi rancangan solusi yang efisien dan terukur." },
        { title: "Manajemen Proyek", desc: "Merencanakan ruang lingkup, memprioritaskan tugas, dan mengawal tenggat bersama pemangku kepentingan." },
        { title: "Komunikasi", desc: "Menyampaikan gagasan teknis dengan bahasa yang jelas, baik lisan (presentasi) maupun tulisan (dokumentasi)." },
        { title: "Kolaborasi Lintas Tim", desc: "Bekerja selaras dengan desain, produk, dan backend menuju tujuan yang sama tanpa silo." },
        { title: "Kepemimpinan & Mentoring", desc: "Memimpin inisiatif, melakukan code review, dan membina anggota agar standar kualitas tim terjaga." },
      ],
    },
    categories: [
      { id: "web", label: "Web App" },
      { id: "mobile", label: "Mobile" },
      { id: "branding", label: "Branding" },
    ],
    projects: [
      {
        id: "kasira",
        title: "Kasira — POS untuk UMKM",
        category: "web",
        year: "2024",
        accent: "#4f46e5",
        glyph: "KSR",
        problem:
          "Pemilik warung dan kafe kecil masih mencatat transaksi di buku, sehingga stok sering selisih dan laporan harian memakan waktu lebih dari satu jam.",
        solution:
          "Saya membangun aplikasi kasir berbasis web yang bisa dipakai offline, dengan sinkronisasi otomatis saat kembali online. Bertindak sebagai frontend lead dan merancang alur checkout.",
        results: [
          "Waktu tutup buku turun dari ~60 menit menjadi 5 menit.",
          "Selisih stok berkurang 78% pada 3 bulan pertama.",
          "Dipakai oleh 120+ UMKM di 4 kota.",
        ],
        tech: ["Google Apps Script", "Bootstrap", "Firebase", "JavaScript"],
        links: [
          { label: "Lihat Demo", href: "https://example.com", primary: true },
          { label: "Studi Kasus", href: "https://example.com" },
        ],
      },
      {
        id: "medibook",
        title: "MediBook — Booking Klinik",
        category: "web",
        year: "2023",
        accent: "#0891b2",
        glyph: "MDB",
        problem:
          "Pasien harus menelepon untuk membuat janji, sehingga resepsionis kewalahan dan sering terjadi jadwal ganda.",
        solution:
          "Merancang dan mengembangkan sistem reservasi dengan kalender ketersediaan dokter secara real-time serta pengingat otomatis via pesan.",
        results: [
          "Jadwal ganda turun hingga nol dalam 6 bulan.",
          "Beban panggilan resepsionis berkurang 65%.",
          "Tingkat kehadiran pasien naik 24%.",
        ],
        tech: ["Vue", "Bootstrap", "Firebase", "REST API"],
        links: [{ label: "Studi Kasus", href: "https://example.com", primary: true }],
      },
      {
        id: "belajar",
        title: "Belajar.id — Platform Kursus",
        category: "web",
        year: "2023",
        accent: "#7c3aed",
        glyph: "BLJ",
        problem:
          "Siswa di daerah dengan internet lambat kesulitan mengakses video pembelajaran yang berat dan sering buffering.",
        solution:
          "Membangun pemutar video adaptif dan strategi cache progresif, plus mode hemat data. Fokus pada performa dan aksesibilitas.",
        results: [
          "Ukuran muat awal turun 61%.",
          "Retensi penyelesaian kursus naik 33%.",
          "Skor aksesibilitas Lighthouse 98/100.",
        ],
        tech: ["React", "Tailwind", "Service Worker", "HLS"],
        links: [
          { label: "Lihat Demo", href: "https://example.com", primary: true },
          { label: "GitHub", href: "https://github.com" },
        ],
      },
      {
        id: "jejak",
        title: "Jejak — Aplikasi Pendaki",
        category: "mobile",
        year: "2022",
        accent: "#059669",
        glyph: "JJK",
        problem: "Pendaki sering tersesat karena sinyal hilang di jalur gunung dan tidak punya peta offline yang andal.",
        solution: "Mengembangkan aplikasi mobile dengan peta offline, perekaman jejak GPS, dan tombol darurat yang mengirim koordinat terakhir.",
        results: [
          "Peta offline berfungsi penuh tanpa sinyal.",
          "Digunakan 8.400+ kali pendakian tercatat.",
          "Rating 4.8/5 di toko aplikasi.",
        ],
        tech: ["React Native", "Firebase", "MapLibre", "SQLite"],
        links: [{ label: "Unduh", href: "https://example.com", primary: true }],
      },
      {
        id: "fitflow",
        title: "FitFlow — Latihan Harian",
        category: "mobile",
        year: "2022",
        accent: "#db2777",
        glyph: "FTF",
        problem: "Pengguna pemula bingung harus mulai olahraga dari mana dan cepat berhenti karena tidak melihat kemajuan.",
        solution: "Merancang pengalaman onboarding personal dan sistem progres visual yang membuat kemajuan terasa nyata setiap hari.",
        results: [
          "Retensi 30 hari naik dari 18% ke 41%.",
          "Rata-rata sesi latihan mingguan naik 2,3x.",
          "Churn bulan pertama turun 37%.",
        ],
        tech: ["Flutter", "Firebase", "Figma", "Google Apps Script"],
        links: [{ label: "Studi Kasus", href: "https://example.com", primary: true }],
      },
      {
        id: "kopi",
        title: "Rebranding Kopi Lereng",
        category: "branding",
        year: "2021",
        accent: "#b45309",
        glyph: "KLR",
        problem: "Kedai kopi lokal sulit dibedakan dari kompetitor dan kemasan produknya tidak menarik di rak toko.",
        solution: "Menyusun identitas visual menyeluruh: logo, palet warna, tipografi, dan sistem kemasan yang konsisten lintas produk.",
        results: [
          "Penjualan ritel naik 52% dalam 4 bulan.",
          "Dikenali kembali oleh 7 dari 10 pelanggan lokal.",
          "Diterapkan pada 12 varian kemasan.",
        ],
        tech: ["Figma", "Illustrator", "Bootstrap", "Design System"],
        links: [{ label: "Lihat Brand", href: "https://example.com", primary: true }],
      },
    ],
    publications: {
      kicker: "Publikasi Karya",
      title: "Penelitian, Pengabdian Masyarakat & Buku",
      lead: "Rekam jejak karya ilmiah, kegiatan pengabdian kepada masyarakat, serta buku yang telah ditulis dan diterbitkan.",
      categories: [
        { id: "penelitian", label: "Penelitian" },
        { id: "pengabdian", label: "Pengabdian Masyarakat" },
        { id: "buku", label: "Buku" },
      ],
      items: [
        {
          id: "pub-1",
          type: "penelitian",
          year: "2024",
          title: "Contoh Judul Penelitian Anda",
          venue: "Jurnal Ilmiah Contoh · Vol. 12 No. 1",
          desc: "Ganti contoh ini dengan penelitian Anda: tujuan, metode, dan temuan utama secara singkat.",
          url: "https://example.com",
          image: "",
        },
        {
          id: "pub-2",
          type: "pengabdian",
          year: "2023",
          title: "Contoh Kegiatan Pengabdian Masyarakat",
          venue: "Desa / Kelompok Binaan · Lokasi",
          desc: "Jelaskan kegiatan pengabdian: sasaran, bentuk kegiatan, dan dampaknya bagi masyarakat.",
          url: "https://example.com",
          image: "",
        },
        {
          id: "pub-3",
          type: "buku",
          year: "2022",
          title: "Contoh Judul Buku",
          venue: "Penerbit Contoh · ISBN 978-000-000-000-0",
          desc: "Uraikan isi buku dan kontribusinya secara singkat.",
          url: "https://example.com",
          image: "",
        },
      ],
    },
    techmate: {
      kicker: "Techmate",
      title: "Portofolio Kursus Privat",
      lead: "Kelas privat tatap muka maupun daring untuk meningkatkan keterampilan digital. Pilih topik yang Anda butuhkan.",
      whatsapp: "",
      whatsappMessage: "Halo Techmate, saya ingin bertanya tentang kursus privat.",
      courses: [
        {
          id: "ms-office",
          title: "Ms Office",
          desc: "Word, PowerPoint, dan dasar komputer untuk pekerjaan sehari-hari.",
          image: "",
          tags: ["Word", "PowerPoint", "Dasar Komputer"],
        },
        {
          id: "ms-excel",
          title: "Ms Excel",
          desc: "Rumus, tabel, grafik, pivot table, hingga otomatisasi laporan.",
          image: "",
          tags: ["Rumus", "Pivot Table", "Grafik"],
        },
        {
          id: "video-editing",
          title: "Video Editing",
          desc: "Editing video untuk konten media sosial maupun kebutuhan profesional.",
          image: "",
          tags: ["Premiere", "CapCut", "After Effects"],
        },
        {
          id: "digital-marketing",
          title: "Digital Marketing",
          desc: "Strategi media sosial, iklan digital, dan pemasaran konten.",
          image: "",
          tags: ["Media Sosial", "Iklan Digital", "Konten"],
        },
        {
          id: "ai-optimization",
          title: "AI Optimization",
          desc: "Memanfaatkan AI untuk produktivitas kerja dan optimasi konten.",
          image: "",
          tags: ["Prompt", "Produktivitas", "AI Tools"],
        },
      ],
    },
    experience: [
      {
        type: "kerja",
        typeLabel: "Penuh Waktu",
        date: "Feb 2023 — Sekarang",
        title: "Frontend Engineer",
        org: "PT Nusantara Digital · Jakarta",
        points: [
          "Memimpin migrasi antarmuka warisan ke React + TypeScript, menurunkan waktu muat halaman 42%.",
          "Membangun design system internal yang dipakai 6 tim produk, memangkas duplikasi komponen 60%.",
          "Menginisiasi pipeline CI/CD frontend, mempercepat siklus rilis dari 2 mingguan menjadi mingguan.",
        ],
      },
      {
        type: "kerja",
        typeLabel: "Penuh Waktu",
        date: "Jul 2021 — Jan 2023",
        title: "UI Developer",
        org: "Studio Kreatif Arta · Bandung",
        points: [
          "Mengembangkan 25+ antarmuka klien dengan skor aksesibilitas Lighthouse rata-rata 96/100.",
          "Mengotomatisasi komponen formulir, menghemat estimasi 15 jam kerja per proyek.",
        ],
      },
      {
        type: "kerja",
        typeLabel: "Magang",
        date: "Jun 2020 — Jun 2021",
        title: "Frontend Intern",
        org: "Startup RuangData · Remote",
        points: [
          "Membangun dashboard analitik internal yang memangkas waktu pelaporan manual tim ops 50%.",
          "Diangkat menjadi kontributor tetap setelah masa magang berakhir.",
        ],
      },
      {
        type: "organisasi",
        typeLabel: "Organisasi",
        date: "2022 — Sekarang",
        title: "Ketua Divisi Teknologi",
        org: "Komunitas Developer Muda Indonesia",
        points: [
          "Memimpin 12 anggota divisi dan menyelenggarakan 8 workshop teknis dengan 600+ peserta.",
          "Membangun situs komunitas yang meningkatkan pendaftaran anggota baru 3x.",
        ],
      },
      {
        type: "organisasi",
        typeLabel: "Organisasi",
        date: "2018 — 2021",
        title: "Koordinator Media & Publikasi",
        org: "Himpunan Mahasiswa Teknik Informatika",
        points: [
          "Mengelola kanal media kampus, menaikkan jangkauan konten 120% dalam satu tahun.",
          "Mengoordinasikan 5 event dengan total 1.200+ peserta.",
        ],
      },
    ],
    education: {
      formal: [
        { date: "2017 — 2021", title: "S1 Teknik Informatika", org: "Universitas Contoh · IPK 3.82 / 4.00", note: "Cum laude. Skripsi: optimasi performa antarmuka web pada jaringan berlatensi tinggi." },
        { date: "2014 — 2017", title: "SMA Jurusan MIPA", org: "SMA Negeri 1 Contoh", note: "Juara 2 Olimpiade Komputer tingkat provinsi." },
      ],
      certs: [
        { abbr: "GCP", title: "Associate Cloud Engineer", org: "Google Cloud", year: "2024", id: "GC-8842", url: "https://example.com" },
        { abbr: "META", title: "Front-End Developer Professional", org: "Meta", year: "2023", id: "META-FE-5521", url: "https://example.com" },
        { abbr: "GAS", title: "Google Apps Script & Automation", org: "Coursera", year: "2022", id: "CR-GAS-1093", url: "https://example.com" },
        { abbr: "A11Y", title: "Web Accessibility Specialist", org: "IAAP", year: "2023", id: "IAAP-WAS-3310", url: "https://example.com" },
      ],
      training: [
        { year: "2024", title: "Advanced React Patterns & Performance", org: "Epic React · 40 jam", note: "Pola komposisi lanjutan, server components, dan profiling render." },
        { year: "2023", title: "Google Apps Script Automation Bootcamp", org: "Dicoding · 30 jam", note: "Otomasi Google Workspace & integrasi API untuk alur kerja tim." },
        { year: "2023", title: "UX Research Fundamentals", org: "Nielsen Norman Group · 25 jam", note: "Wawancara pengguna, usability testing, dan sintesis temuan." },
        { year: "2022", title: "Cloud & DevOps untuk Developer", org: "Bangkit Academy · 60 jam", note: "CI/CD, kontainerisasi, dan observabilitas aplikasi web." },
      ],
    },
    contact: {
      title: "Mari bangun sesuatu bersama.",
      sub: "Terbuka untuk proyek freelance, posisi penuh waktu, maupun kolaborasi riset. Balasan biasanya dalam 1×24 jam.",
      email: "andi@example.com",
      whatsapp: "",
      whatsappMessage:
        "Halo, saya menemukan situs Anda dan ingin bertanya.",
      socials: [
        { label: "LinkedIn", url: "https://linkedin.com/in/username", icon: "linkedin" },
        { label: "GitHub", url: "https://github.com/username", icon: "github" },
        { label: "Dribbble", url: "https://dribbble.com/username", icon: "dribbble" },
        { label: "Unduh CV", url: "assets/cv.pdf", icon: "download" },
      ],
    },
    footer: { name: "Andi Pratama", role: "Web Developer & Technical Educator" },
  };

  /* ---------- Util ---------- */
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const deepMerge = (base, patch) => {
    if (Array.isArray(base) || Array.isArray(patch) || typeof base !== "object" || base === null) {
      return patch === undefined ? base : patch;
    }
    const out = { ...base };
    for (const k of Object.keys(patch || {})) {
      out[k] = deepMerge(base[k], patch[k]);
    }
    return out;
  };

  /* ---------- Store konten ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT_CONTENT);
      return deepMerge(clone(DEFAULT_CONTENT), JSON.parse(raw));
    } catch {
      return clone(DEFAULT_CONTENT);
    }
  }
  function save(content) {
    localStorage.setItem(KEY, JSON.stringify(content));
    // Tandai bahwa perangkat ini punya perubahan lokal (draft) yang
    // belum diterbitkan, agar index.html menampilkan pratinjau lokal.
    try { localStorage.setItem(DRAFT_KEY, "1"); } catch { /* abaikan */ }
    return content;
  }
  function reset() {
    localStorage.removeItem(KEY);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* abaikan */ }
  }
  function hasDraft() {
    try { return localStorage.getItem(DRAFT_KEY) === "1"; } catch { return false; }
  }

  /* ---------- Konten publik (tersinkron lintas perangkat) ----------
     Situs statis tidak bisa berbagi localStorage antar perangkat. Karena
     itu konten yang sudah dipublikasikan disimpan di file `content.json`
     di server dan diambil lewat fetch setiap kali halaman dibuka. */
  async function loadRemote() {
    // `cache: no-store` + query unik => selalu ambil versi terbaru dari server,
    // menembus cache browser maupun CDN (GitHub Pages / hosting statis).
    const url = REMOTE_URL + "?v=" + Date.now();
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      try { localStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify(data)); } catch { /* penuh/privasi */ }
      return deepMerge(clone(DEFAULT_CONTENT), data);
    } catch {
      // Offline / fetch gagal: pakai salinan terakhir dari server bila ada.
      try {
        const cached = localStorage.getItem(REMOTE_CACHE_KEY);
        if (cached) return deepMerge(clone(DEFAULT_CONTENT), JSON.parse(cached));
      } catch { /* abaikan */ }
      return load();
    }
  }

  // Dipakai situs publik (index.html): utamakan konten terbit dari server.
  // Namun bila perangkat ini (mis. komputer admin) punya simpanan lokal,
  // tampilkan versi lokal agar editan tidak hilang & bisa dipratinjau.
  async function loadSite() {
    try {
      if (localStorage.getItem(KEY)) return load();
    } catch { /* mode privasi: localStorage tidak tersedia */ }
    return loadRemote();
  }
  function exportJSON() {
    return JSON.stringify(load(), null, 2);
  }
  function importJSON(text) {
    const data = JSON.parse(text); // lempar bila invalid
    save(data);
    return data;
  }

  /* ---------- Auth (hash SHA-256) ---------- */
  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function getAuth() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* abaikan */ }
    return null;
  }
  async function initAuth() {
    if (!getAuth()) {
      const pass = await sha256("admin123");
      localStorage.setItem(AUTH_KEY, JSON.stringify({ username: "admin", pass }));
    }
  }
  async function login(username, password) {
    const auth = getAuth();
    if (!auth) return false;
    const pass = await sha256(password);
    if (username === auth.username && pass === auth.pass) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return true;
    }
    return false;
  }
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }
  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }
  async function changePassword(current, next) {
    const auth = getAuth();
    if (!auth) return false;
    if ((await sha256(current)) !== auth.pass) return false;
    auth.pass = await sha256(next);
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    return true;
  }

  // Terapkan favicon dari CMS ke <head>. Mendukung URL, path, atau data URL.
  function applyFavicon(content) {
    const url = String((content && content.brand && content.brand.faviconUrl) || "").trim();
    if (!url || typeof document === "undefined") return;
    const setLink = (rel) => {
      let el = document.head.querySelector('link[rel="' + rel + '"]');
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", url);
    };
    setLink("icon");
    setLink("apple-touch-icon");
  }

  return {
    DEFAULT_CONTENT,
    load, save, reset, exportJSON, importJSON,
    loadRemote, loadSite, hasDraft, applyFavicon,
    initAuth, login, logout, isLoggedIn, changePassword,
    clone,
  };
})();

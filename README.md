# CV Profil Diri — Portofolio Digital

Situs portofolio statis (HTML + CSS + JavaScript murni, tanpa build tool).
Dirancang **scannable**, **responsif**, dan langsung menampilkan keahlian utama.

## Struktur utama halaman

```
<body>
├─ .skip-link                 → aksesibilitas (lewati ke konten)
├─ #scrollProgress            → indikator progres baca
├─ header#navbar              → navbar lengket (brand, nav, tema, tombol CV, burger)
│
├─ main#utama
│  ├─ section#hero            → Hero / Pembuka
│  │  ├─ Identitas: nama, peran, tagline, lokasi, email
│  │  ├─ Foto profil (avatar) + badge ketersediaan
│  │  ├─ CTA utama: Unduh CV (PDF) · Hubungi Saya
│  │  ├─ Tautan tersier: Lihat Proyek
│  │  └─ Statistik singkat (angka pencapaian)
│  │
│  ├─ section#tentang         → Tentang Saya (About Me)
│  │  ├─ Latar Belakang Profesional (3 paragraf: asal, fokus, nilai)
│  │  ├─ Kutipan/prinsip kerja
│  │  ├─ Daftar "Sekilas": lokasi, fokus, pengalaman, pendidikan, bahasa
│  │  ├─ Bidang Minat Utama: Pengembangan Web · Sistem Informasi · Edukasi Teknologi
│  │  └─ Filosofi Kerja: 4 prinsip (Sederhana dulu · Ukur · Aksesibel · Berbagi)
│  │
│  ├─ section#keahlian        → Keahlian Utama
│  │  ├─ Technical Skills (Pengembangan Web & Software):
│  │  │    Bahasa Pemrograman · Framework & Library · Database · Cloud & Serverless · DevOps & Tools
│  │  ├─ Alat & Software Tambahan: Desain · Editing Video · Produktivitas
│  │  ├─ Bar tingkat penguasaan
│  │  └─ Keahlian Non-Teknis: pengajaran/instruksional · analisis sistem · manajemen proyek · komunikasi · kolaborasi lintas tim · kepemimpinan & mentoring
│  │
│  ├─ section#proyek          → Portofolio / Proyek Pilihan
│  │  ├─ Filter kategori: Semua · Web App · Mobile · Branding
│  │  └─ #projectsGrid → kartu interaktif (dirender JS)
│  │     └─ .card
│  │        ├─ Media (tahun + glyph)
│  │        ├─ Kategori, Judul, Masalah yang diselesaikan
│  │        ├─ Tag teknologi (+N)
│  │        └─ Tombol Detail · Link Demo · Link Repo
│  │
│  ├─ section#pengalaman      → Pengalaman Kerja & Organisasi
│  │  ├─ Tab: Semua · Pengalaman Kerja · Organisasi
│  │  └─ ol#timeline → item kronologis
│  │     └─ posisi · instansi · rentang waktu · tipe · bullet pencapaian
│  │
│  ├─ section#pendidikan      → Pendidikan & Sertifikasi
│  │  ├─ Riwayat pendidikan formal (sekolah/kampus, tahun, IPK, catatan)
│  │  ├─ Sertifikasi kompetensi (penerbit, tahun, ID, tautan verifikasi)
│  │  └─ Pelatihan & up-skilling (program pengembangan keahlian)
│  │
│  └─ section#kontak          → Kontak
│     ├─ Formulir interaktif (nama, email, subjek, pesan) + validasi
│     ├─ Email profesional langsung (mailto)
│     └─ Akun profesional: LinkedIn · GitHub · Dribbble · Unduh CV
│
├─ footer.footer              → Navigasi ringkas + copyright + kembali ke atas
└─ button#toTop               → Tombol kembali ke atas (muncul saat scroll)

Halaman lain:
├─ admin.html                 → Login + dashboard kelola konten (CMS-lite)
└─ js/content.js              → Sumber data konten & penyimpanan (localStorage)
```

### Ringkasan urutan seksi

| # | Seksi | Anchor | Tujuan |
| --- | --- | --- | --- |
| 1 | Hero / Pembuka | `#hero` | Kesan pertama + keahlian utama langsung terlihat |
| 2 | Tentang Saya (About Me) | `#tentang` | Konteks personal, fokus, dan nilai tambah |
| 3 | Keahlian (Skills) | `#keahlian` | Pindai cepat kompetensi inti |
| 4 | Portofolio / Proyek Pilihan | `#proyek` | Bukti nyata & dampak |
| 5 | Pengalaman Kerja & Organisasi | `#pengalaman` | Kredibilitas & perjalanan karier |
| 6 | Pendidikan & Sertifikasi | `#pendidikan` | Latar akademik, lisensi, up-skilling |
| 7 | Kontak | `#kontak` | Ajakan tindakan (CTA) |
| — | Footer | — | Navigasi & penutup |

## Panel Admin (kelola konten)

Tampilan panel memakai bahasa desain yang sama: **sidebar ink pekat** dengan indikator
emas pada menu aktif, area konten terang, kartu ringkasan bergradien, dan layar login
terbagi (panel merek + formulir). Semua id/kelas yang dipakai `js/admin.js` dipertahankan,
sehingga tidak ada perubahan alur kerja.

Akses melalui tautan **Panel Admin** di footer, atau langsung ke `admin.html`.

- **Login default:** username `admin` — password `admin123` (ubah di menu **Pengaturan**).
- **Menu:** Ringkasan · Profil & Hero · Tentang Saya · Keahlian · Publikasi Karya · Proyek · Pengalaman · Pendidikan & Sertifikasi · Techmate · Kontak · Pengaturan.
- **CRUD** untuk proyek, publikasi karya, kursus Techmate, pengalaman, pendidikan, sertifikasi, pelatihan, minat, filosofi, keahlian, kategori, dan tautan sosial.
- **Gambar:** setiap publikasi dan kursus Techmate dapat memuat gambar/sampul yang diunggah dari perangkat (otomatis diperkecil) atau ditempel sebagai URL.
- **Ekspor/Impor JSON** untuk mencadangkan atau memindahkan konten; **Reset** ke default.
- **Publikasi ke semua perangkat:** simpan konten ke file `content.json` di repo GitHub (menu **Pengaturan → Publikasi ke semua perangkat**), sehingga perubahan tampil di HP, tablet, dan browser lain — tidak hanya di perangkat tempat menyunting.
- Perubahan lokal disimpan di `localStorage` browser sebagai *draft/pratinjau*, sedangkan situs publik (`js/main.js`) mengambil versi terbit dari `content.json` setiap kali dibuka.
- Sesi login menggunakan `sessionStorage`; password disimpan sebagai hash **SHA-256**.

> ⚠ **Keamanan:** karena situs statis tanpa server, autentikasi ini berjalan di sisi klien dan **bukan perlindungan nyata** — siapa pun yang dapat membaca file situs bisa melewatinya. Gunakan hanya untuk demo/kelola pribadi. Untuk produksi, pasang backend/host dengan autentikasi server, atau gunakan layanan CMS.

### Alur kerja yang disarankan

1. Kelola konten di `admin.html`, klik **Simpan** (tersimpan sebagai draft di perangkat ini).
2. Buka **Pengaturan → Publikasi ke semua perangkat**, isi username/repo GitHub, branch (`main`), path (`content.json`), dan **Personal Access Token** dengan izin *Contents: Read and write*. Aktifkan **Publikasikan otomatis** bila ingin setiap klik Simpan langsung terbit.
3. Klik **Publikasikan sekarang**. Konten ditulis ke `content.json` dan di-commit ke repo; GitHub Pages memuat ulang dalam 1–2 menit.
4. Muat ulang situs di HP/tab lain — konten terbaru otomatis diambil dari server (`fetch` dengan `cache: no-store`).

> Tanpa konfigurasi GitHub, perubahan hanya tersimpan lokal. Alternatif manual: **Ekspor JSON**, lalu timpa file `content.json` di repo dan commit.
>
> **Cara termudah tanpa token:** klik **Ekspor JSON**, lalu jalankan `node publish.js` di folder repo (skrip menulis `content.json` dan otomatis commit & push memakai login git yang sudah tersimpan).

#### Kenapa dulu hanya terlihat di desktop?

Sebelumnya semua konten disimpan di `localStorage`, yang bersifat **per-perangkat** — jadi HP/tab lain tidak pernah menerima perubahan. Sekarang konten terbit disimpan di `content.json` di server dan dibaca ulang setiap halaman dibuka, sehingga sinkron di semua perangkat.

## Kartu proyek (Featured Projects)

Setiap kartu memuat:

- Judul proyek dan **deskripsi singkat masalah yang diselesaikan**
- **Tag teknologi** (contoh: Google Apps Script, Firebase, Bootstrap) — 3 tag tampil di kartu, sisanya `+N` dan lengkap saat detail dibuka
- **Link demo langsung (live preview)** dan **repositori kode** (open-source)
- Kategori, tahun, dan tombol **Detail** yang membuka isi kartu secara inline (expand/collapse) berisi: Solusi & Peran, Dampak (bullet berorientasi hasil), seluruh tag teknologi, dan semua tautan. Tidak ada popup/modal.

Kartu dapat difilter berdasarkan kategori: Web App, Mobile, Branding.

## Seksi Publikasi Karya & Techmate

Dua seksi baru (keduanya diatur dari panel admin):

- **Publikasi Karya** (`#publikasi`) — di atas Portofolio. Menampilkan **Penelitian**, **Pengabdian Masyarakat**, dan **Buku** dengan filter kategori. Setiap karya memiliki judul, tahun, jurnal/penerbit/lokasi, deskripsi, tautan, dan gambar/sampul opsional.
- **Techmate** (`#techmate`) — di atas Kontak. Menampilkan **Portofolio Kursus Privat**: Ms Office, Ms Excel, Video Editing, Digital Marketing, AI Optimization (dapat ditambah/ubah). Setiap kursus bisa memuat gambar, deskripsi, dan tag, plus tombol **Tanya via WhatsApp**.
- **WhatsApp** juga tersedia di seksi **Kontak** (tombol WhatsApp muncul bila nomor diisi). Isi nomor pada menu **Kontak → Nomor WhatsApp** dengan format internasional tanpa `+`, contoh `6281234567890`.

## Fitur tambahan

- **Mode gelap/terang** dengan penyimpanan preferensi (`localStorage`)
- **Responsif penuh** (mobile-first, grid menyesuaikan di 960px & 720px)
- Scroll progress bar, tombol kembali ke atas
- Animasi reveal saat scroll (menghormati `prefers-reduced-motion`)
- Aksesibilitas: skip link, `aria-*`, `aria-expanded` pada tombol Detail, fokus keyboard
- Navigasi aktif otomatis mengikuti seksi (scroll spy)

## Cara mengubah data

Dua cara:

1. **Lewat panel admin** (`admin.html`) — cara termudah, tersimpan di browser sebagai draft, lalu **Publikasikan** ke `content.json` agar tampil bagi semua pengunjung.
2. **Lewat kode** — untuk nilai default yang tampil bagi semua pengunjung:
   - Seluruh isi default ada di `js/content.js` pada objek `DEFAULT_CONTENT` (profil, tentang, keahlian, kategori, proyek, pengalaman, pendidikan, kontak, footer).
   - `js/main.js` merender isi tersebut ke halaman; `admin.html` + `js/admin.js` menyuntingnya.

Poin penting:

- **Proyek**: field `title`, `category`, `year`, `accent`, `glyph`, `problem`, `solution`, `results[]`, `tech[]`, `links[]`.
- **Nama, peran, kontak, SEO** kini satu sumber di `content.js` (`brand`, `hero`, `meta`) dan otomatis tersinkron ke hero, navbar, footer, serta JSON-LD.
- **Warna/tema**: seluruh design token ada di `:root` dan `[data-theme="dark"]` pada `css/style.css` — lihat bagian **Design system** di bawah.
- **CV**: ganti `assets/cv.pdf` atau ubah `hero.cvUrl`.
- **Favicon**: ubah lewat panel admin — menu **Profil & Hero → Favicon**. Unggah gambar persegi (PNG/SVG, disarankan 256×256 px) atau tempel URL. Bisa juga ganti langsung `assets/favicon.svg` dan ubah `brand.faviconUrl` di `js/content.js`/`content.json`.
- **Foto profil**: unggah lewat panel admin — menu **Profil & Hero → Foto Profil** (Pilih & unggah foto). Gambar otomatis diperkecil dan disimpan di browser. Bisa juga menempelkan URL pada kolom "Atau tempel URL foto", atau ganti langsung `assets/avatar.svg` dan ubah `hero.photoUrl` di `js/content.js`. Jika gagal dimuat, inisial otomatis ditampilkan.

### Panduan foto profil profesional

- Format & ukuran: JPG/WebP, rasio **1:1**, minimal **600x600 px** (disarankan 800x800 px), ukuran file < 300 KB.
- Latar belakang polos/netral, pencahayaan merata, wajah menghadap kamera.
- Ekspresi ramah, pakaian rapi sesuai bidang (profesional namun tetap personal).
- Bingkai otomatis membulat, jadi posisikan wajah di tengah agar tidak terpotong.
- Tambahkan `<img src="..." alt="Foto profil Nama Anda" width="600" height="600" loading="eager" decoding="async" />` untuk menghindari layout shift.

## Design system — "Ink & Brass" (UI/UX 2026)

Tampilan situs publik **dan** panel admin memakai satu bahasa desain yang diadaptasi
dari referensi visual `UI UX 2026.jfif`: band gelap pekat, aksen emas, dan glow aqua.

### Palet

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--ink` | `#0f1f29` | Hero, band gelap, sidebar admin, footer |
| `--ink-2` / `--ink-3` | `#162a36` / `#1e3744` | Permukaan di atas ink (kartu, sidebar) |
| `--gold` / `--gold-2` | `#c8a24a` / `#e8cb85` | Tombol utama, label, garis aksen |
| `--aqua` | `#7fe3f0` | Glow dekoratif, garis progres, aksen sekunder |
| `--bg` / `--bg-alt` | `#ffffff` / `#f6f3ee` | Latar halaman terang (ivory) |
| `--text` / `--text-soft` | `#14232c` / `#5c6a74` | Teks utama & sekunder |

### Ritme seksi (terang ↔ gelap)

```
Hero (ink) → Tentang (ivory) → Keahlian (putih) → Publikasi (ink)
→ Proyek (ivory) → Pengalaman (putih) → Pendidikan (ivory)
→ Techmate (putih) → Kontak (kartu bercahaya) → Footer (ink)
```

Ganti latar sebuah seksi cukup dengan menambahkan kelas `section--ink`
atau `section--alt` pada elemen `<section class="section ...">`.

### Konteks "on ink"

Kelas `.nav`, `.hero`, `.footer`, `.section--ink` (dan `.on-ink`) menimpa token warna
secara lokal, sehingga **semua komponen di dalamnya otomatis beradaptasi** — tag,
tombol, filter, kartu — tanpa perlu gaya khusus per komponen:

```css
.nav, .hero, .footer, .section--ink, .on-ink {
  --surface: var(--ink-2);
  --text: var(--ink-text);
  --brand: var(--gold-2);
  --brand-2: var(--aqua);
  /* … */
}
```

### Lain-lain

- **Tipografi**: satu keluarga sans (Plus Jakarta Sans, weight 400–800) untuk semua
  teks — sesuai referensi yang seluruhnya sans-serif. Label kecil (kicker, kategori,
  tanggal, angka ringkasan) memakai tumpukan monospace sistem lewat token `--mono`.
- **Bentuk**: `--radius` 18px untuk kartu, `--radius-lg` 28px untuk panel besar,
  tombol selalu pill (`999px`).
- **Warna kartu proyek**: aksen per proyek tetap dapat diubah di panel admin. Warna
  bawaan lama otomatis dipetakan ke palet baru saat dirender (`LEGACY_ACCENTS`
  di `js/main.js`); warna kustom buatan Anda dibiarkan apa adanya.
- **Tema gelap**: area "ink" pada tema gelap berubah menjadi panel yang sedikit
  terangkat (`#16242e`) sehingga ritme terang/gelap tetap terbaca.
- **Anti-kedip**: tema diterapkan lewat skrip inline kecil di `<head>` sebelum CSS
  di-render.
## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal (disarankan agar `admin.html` dan `index.html` berbagi origin yang sama sehingga konten terbaca konsisten):

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Troubleshooting: browser bilang "Not Secure"

Jalankan pemeriksa otomatis (Windows PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\cek-ssl.ps1
```

### Penyebab

Situs ini dilayani **GitHub Pages** dengan custom domain `wafiarifin.my.id`.
Agar gembok HTTPS muncul, GitHub harus menerbitkan sertifikat Let's Encrypt
khusus untuk domain itu. Kalau belum terbit, GitHub menyajikan sertifikat
bawaannya (`*.github.io`) yang **tidak mencakup** `wafiarifin.my.id`, sehingga
browser menandai situs **Not Secure**.

Perlu dipahami: masalah ini **tidak ada di dalam repo ini**. DNS, `CNAME`, dan
konten sudah benar. Yang perlu diperbaiki adalah pengaturan Pages di GitHub.

### Ciri-ciri sertifikat belum terbit

- `cek-ssl.ps1` melaporkan `Subject : CN=*.github.io` dan `COCOK : TIDAK`.
- Permintaan ke `http://` tidak dialihkan ke `https://`.
- Opsi **Enforce HTTPS** di Settings > Pages tidak bisa dicentang / abu-abu.

### Cara memperbaiki

1. Buka `https://github.com/wafiarifin/Profil-Wafi/settings/pages`.
2. Di bagian **Custom domain**, kosongkan / klik **Remove**, lalu **Save**.
3. Isi kembali `wafiarifin.my.id`, lalu **Save**.
   Langkah 2-3 ini memicu ulang permintaan sertifikat ke Let's Encrypt.
4. Tunggu 15 menit sampai 24 jam. Jalankan `cek-ssl.ps1` berkala.
5. Setelah `COCOK : ya`, centang **Enforce HTTPS**, lalu **Save**.
   Mulai saat itu semua akses `http://` otomatis dialihkan ke `https://`.

Setelah **Enforce HTTPS** aktif, file `CNAME` di repo ini akan tetap berisi
`wafiarifin.my.id` dan tidak perlu diubah.

### Kalau tetap gagal setelah 24 jam

- Pastikan hanya repo `Profil-Wafi` yang memakai domain ini. Domain yang
diklaim dua repo sekaligus membuat penerbitan sertifikat selalu gagal.
- Pastikan DNS hanya berisi 4 IP GitHub Pages
  (`185.199.108.153` - `185.199.111.153`) tanpa IP tambahan dari hosting lama.
- Pastikan tidak ada CAA record di DNS yang melarang Let's Encrypt.
- Verifikasi kepemilikan domain lewat **Settings > Pages > Verify domain**,
lalu tambahkan TXT `_github-pages-challenge-wafiarifin.wafiarifin.my.id`
di DNS.
- Alternatif: pasang **Cloudflare** (gratis) di depan domain, mode SSL
**Full**. Cloudflare akan menerbitkan sertifikat sendiri sehingga gembok
muncul tanpa menunggu GitHub.

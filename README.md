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

Akses melalui tautan **Panel Admin** di footer, atau langsung ke `admin.html`.

- **Login default:** username `admin` — password `admin123` (ubah di menu **Pengaturan**).
- **Menu:** Ringkasan · Profil & Hero · Tentang Saya · Keahlian · Proyek · Pengalaman · Pendidikan & Sertifikasi · Kontak · Pengaturan.
- **CRUD** untuk proyek, pengalaman, pendidikan, sertifikasi, pelatihan, minat, filosofi, keahlian, kategori, dan tautan sosial.
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
- **Warna/tema**: ubah design token di `:root` dan `[data-theme="dark"]` pada `css/style.css`.
- **CV**: ganti `assets/cv.pdf` atau ubah `hero.cvUrl`.
- **Foto profil**: unggah lewat panel admin — menu **Profil & Hero → Foto Profil** (Pilih & unggah foto). Gambar otomatis diperkecil dan disimpan di browser. Bisa juga menempelkan URL pada kolom "Atau tempel URL foto", atau ganti langsung `assets/avatar.svg` dan ubah `hero.photoUrl` di `js/content.js`. Jika gagal dimuat, inisial otomatis ditampilkan.

### Panduan foto profil profesional

- Format & ukuran: JPG/WebP, rasio **1:1**, minimal **600x600 px** (disarankan 800x800 px), ukuran file < 300 KB.
- Latar belakang polos/netral, pencahayaan merata, wajah menghadap kamera.
- Ekspresi ramah, pakaian rapi sesuai bidang (profesional namun tetap personal).
- Bingkai otomatis membulat, jadi posisikan wajah di tengah agar tidak terpotong.
- Tambahkan `<img src="..." alt="Foto profil Nama Anda" width="600" height="600" loading="eager" decoding="async" />` untuk menghindari layout shift.

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal (disarankan agar `admin.html` dan `index.html` berbagi origin yang sama sehingga konten terbaca konsisten):

```bash
python -m http.server 8000
# lalu buka http://localhost:8000
```

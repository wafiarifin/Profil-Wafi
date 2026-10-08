#!/usr/bin/env node
/**
 * publish.js — Terbitkan konten dari panel admin ke semua perangkat.
 *
 * Cara pakai (tanpa token GitHub, memakai login git yang sudah tersimpan):
 *   1. Buka admin.html → Pengaturan → Ekspor JSON. File `konten-portofolio.json`
 *      akan terunduh (biasanya ke folder Downloads).
 *   2. Pindahkan file itu ke folder ini (root repo), ATAU biarkan di Downloads.
 *   3. Jalankan:  node publish.js
 *
 * Skrip akan menulis konten ke `content.json`, lalu commit & push ke GitHub.
 * GitHub Pages akan menyajikannya ke HP/tablet/browser lain dalam 1–2 menit.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const root = __dirname;
const candidates = [
  path.join(root, "konten-portofolio.json"),
  path.join(os.homedir(), "Downloads", "konten-portofolio.json"),
  path.join(os.homedir(), "Unduhan", "konten-portofolio.json"),
];

const source = candidates.find((p) => fs.existsSync(p));
if (!source) {
  console.error("✗ File konten-portofolio.json tidak ditemukan.");
  console.error("  Ekspor dulu dari admin.html → Pengaturan → Ekspor JSON,");
  console.error("  lalu taruh file itu di folder ini atau di folder Downloads.");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(source, "utf8"));
} catch (e) {
  console.error("✗ JSON tidak valid:", e.message);
  process.exit(1);
}

fs.writeFileSync(path.join(root, "content.json"), JSON.stringify(data, null, 2) + "\n");
console.log("✓ Konten ditulis ke content.json  (sumber: " + source + ")");

const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" });
try {
  run("git add content.json");
  const status = execSync("git status --porcelain content.json", { cwd: root }).toString().trim();
  if (!status) {
    console.log("• content.json tidak berubah — tidak ada yang perlu di-commit.");
    process.exit(0);
  }
  run('git commit -m "Terbitkan konten terbaru dari panel admin"');
  run("git push");
  console.log("✓ Selesai! Tunggu 1–2 menit, lalu muat ulang situs di HP/tab lain.");
} catch (e) {
  console.error("✗ Gagal commit/push. Jalankan manual:");
  console.error("   git add content.json && git commit -m \"Terbitkan konten\" && git push");
  process.exit(1);
}

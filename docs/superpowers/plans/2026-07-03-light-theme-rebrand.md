# Rebrand Tema Terang + Interaktif Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti skema warna SukarameApp dari tema gelap ke tema terang (background putih) permanen di customer site DAN admin panel, plus tambah pola interaksi (hover/press/badge-shine/toast) konsisten di seluruh app.

**Architecture:** Rename+redefinisi token CSS pusat di `shared/theme.css` (satu sumber kebenaran, dipakai lewat `var()` di semua file) supaya perubahan tema mengalir otomatis ke hampir semua komponen; 3 section foto full-bleed di HomePage (`.sec-hero`, `.sec-sig`, `.sec-carousel`) sengaja dikecualikan lewat override variabel lokal (`--photo-text`) supaya teks tetap terbaca di atas foto gelap. Pola interaktif ditambahkan sebagai CSS rule baru (transition + hover/active state) pada selector yang sudah ada — tidak ada komponen React baru.

**Tech Stack:** CSS custom properties (`var()`), CSS Modules (admin), plain CSS (customer), tidak ada dependency baru.

## Global Constraints

- Referensi warna: `assets/banner.jfif` — merah `#D32F2F`, kuning-emas `#FFC107` (nilai HEX ini TIDAK berubah dari sebelumnya, cuma konteks pemakaiannya).
- Background baru: putih `#FFFFFF` di semua tempat KECUALI 3 section foto full-bleed di HomePage (`.sec-hero`, `.sec-sig`, `.sec-carousel`) yang tetap pakai overlay gradient gelap hardcode `rgba(26,10,0,X)` (tidak disentuh — sudah otomatis tidak ikut berubah karena tidak pakai variable).
- Semua nilai token baru: lihat tabel di Task 1, Langkah 1 — pakai persis, jangan improvisasi warna baru di luar tabel itu.
- Setiap task diverifikasi dengan `npm run build && npm run lint` (harus bersih) DAN screenshot Playwright (desktop 1440×900 dan mobile 375×812) sebelum dianggap selesai.
- `npm run dev` jalan di `http://localhost:5183/SukarameApp/` (base path `/SukarameApp/` sudah dikonfigurasi di `vite.config.ts` sejak Fase 7 — semua URL test HARUS pakai prefix ini).
- Untuk screenshot halaman `/admin/*` yang butuh auth: pakai debug hook sementara di `src/admin/auth/authStore.ts` (tambah `if (import.meta.env.DEV) { (window as unknown as { __authStore: typeof useAuthStore }).__authStore = useAuthStore }` setelah definisi store, HAPUS lagi sebelum commit tiap task — pola ini sudah dipakai berkali-kali di sesi sebelumnya, lihat `log.md` Fase 3/4/5).
- JANGAN mengubah `src/admin/pos/receiptPrint.css` — struk cetak sudah hardcode hitam-di-atas-putih terlepas dari tema, sudah benar untuk printer thermal.
- JANGAN menambah dependency npm baru — semua animasi pakai CSS murni (`transition`, `@keyframes`), bukan library.

---

## Task 1: Design System — Token Baru + Rename Global

**Files:**
- Modify: `src/shared/theme.css` (rewrite penuh)
- Delete: `src/shared/theme.ts` (tidak dipakai di mana pun — dikonfirmasi lewat `grep -rln "from '.*shared/theme'" src/` yang hasilnya kosong)
- Modify (rename variable reference, mekanis): `src/customer/HomePage.css`, `src/customer/OrderPage.css`, `src/admin/AdminLayout.module.css`, `src/admin/auth/LoginPage.module.css`, `src/admin/auth/PinPage.module.css`, `src/admin/auth/RequireAuth.tsx`, `src/admin/pos/PosPage.module.css`, `src/admin/pos/CheckoutPage.module.css`, `src/admin/pos/ReceiptModal.module.css`, `src/admin/reports/ReportsPage.module.css`, `src/admin/settings/SettingsPage.module.css`, `src/admin/settings/WebsiteCmsPage.module.css`, `src/admin/shift/ShiftPage.module.css`, `src/admin/staff/StaffPage.module.css`, `src/admin/stock/StockPage.module.css`, `src/admin/tables/BookingPage.module.css`, `src/admin/tables/TablesPage.module.css`, `src/admin/transactions/TransactionsPage.module.css`
- Modify (hardcoded literal → variable, mekanis): semua file di atas KECUALI `RequireAuth.tsx`, PLUS `src/admin/AdminHome.tsx` dan `src/customer/HomePage.tsx` (inline style)

**Interfaces:**
- Produces: token CSS baru dipakai oleh Task 2–10: `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-red`, `--color-red-light`, `--color-red-dark` (BARU), `--color-red-tint`, `--color-yellow`, `--color-yellow-light`, `--color-yellow-tint`, `--color-text` (ganti nama dari `--color-cream`), `--color-text-muted` (ganti nama dari `--color-cream-2`), `--color-border` (ganti nama dari `--color-line`), `--color-border-strong` (ganti nama dari `--color-line-2`), `--photo-text` (BARU — dipakai untuk DUA hal: (1) teks di atas foto full-bleed di HomePage/Task 2, (2) teks di SEMUA tombol solid ber-background `--color-red` di admin, sejak Step 3 di bawah, karena keduanya sama-sama butuh "teks terang permanen di atas surface gelap/jenuh warna", terlepas dari tema halaman), `--font-heading`, `--font-body`, `--ease` (tidak berubah).

- [ ] **Step 1: Rewrite `src/shared/theme.css`**

Ganti seluruh isi file jadi:

```css
/* Tema Sukarame — tema terang, referensi warna dari assets/banner.jfif
   (merah/kuning-emas tetap sama, background sekarang putih).
   Nilai warna & font adalah satu-satunya sumber kebenaran — jangan
   duplikasi di file lain. Lihat docs/superpowers/specs/2026-07-03-light-theme-rebrand-design.md
   untuk alasan tiap token. */
:root {
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-2: #f5f5f5;

  --color-red: #d32f2f;
  --color-red-light: #ff5252;
  --color-red-dark: #b71c1c;
  --color-red-tint: rgba(211, 47, 47, 0.08);

  --color-yellow: #ffc107;
  --color-yellow-light: #ffd54f;
  --color-yellow-tint: rgba(255, 193, 7, 0.12);

  --color-text: #1a1a1a;
  --color-text-muted: #6b6b6b;

  --color-border: #e5e5e5;
  --color-border-strong: rgba(211, 47, 47, 0.3);

  /* Khusus teks di atas foto full-bleed (Hero/Signature/Carousel di
     HomePage) — SELALU krem terang, tidak ikut tema, karena overlay
     gradient di baliknya selalu gelap (hardcode, lihat HomePage.css). */
  --photo-text: #fff8f0;

  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Poppins', system-ui, sans-serif;

  --ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

- [ ] **Step 2: Hapus `src/shared/theme.ts`**

```bash
rm src/shared/theme.ts
```

- [ ] **Step 3: Fix teks tombol solid merah supaya tetap terang (SEBELUM rename umum)**

Kenapa langkah ini harus terjadi SEBELUM Step 5 (rename umum): 15 tombol solid di admin pakai `background: var(--color-red); color: var(--color-cream);` — pola ini AMAN di tema lama (cream = hampir putih, kontras bagus di atas merah, terlepas dari tema halaman), tapi kalau `--color-cream` di-rename jadi `--color-text` (yang nilainya jadi gelap `#1a1a1a` di tema terang), tombol ini akan jadi **teks gelap di atas merah** — kontras rusak. Solusinya: teks di tombol ini harus tetap terang selamanya (seperti teks di atas foto), jadi dipetakan ke `--photo-text` (bukan `--color-text`), BUKAN lewat rename umum.

Jalankan persis (satu `sed` per baris spesifik, aman karena tidak mengubah jumlah baris file):

```bash
sed -i '55s/.*/  color: var(--photo-text);/' src/admin/AdminLayout.module.css
sed -i '91s/.*/  color: var(--photo-text);/' src/admin/auth/LoginPage.module.css
sed -i '101s/.*/  color: var(--photo-text);/' src/admin/pos/CheckoutPage.module.css
sed -i '116s/.*/  color: var(--photo-text);/' src/admin/pos/PosPage.module.css
sed -i '195s/.*/  color: var(--photo-text);/' src/admin/pos/PosPage.module.css
sed -i '95s/.*/  color: var(--photo-text);/' src/admin/pos/ReceiptModal.module.css
sed -i '24s/.*/  color: var(--photo-text);/' src/admin/reports/ReportsPage.module.css
sed -i '131s/.*/  color: var(--photo-text);/' src/admin/settings/SettingsPage.module.css
sed -i '95s/.*/  color: var(--photo-text);/' src/admin/settings/WebsiteCmsPage.module.css
sed -i '60s/.*/  color: var(--photo-text);/' src/admin/shift/ShiftPage.module.css
sed -i '74s/.*/  color: var(--photo-text);/' src/admin/shift/ShiftPage.module.css
sed -i '117s/.*/  color: var(--photo-text);/' src/admin/staff/StaffPage.module.css
sed -i '120s/.*/  color: var(--photo-text);/' src/admin/stock/StockPage.module.css
sed -i '14s/.*/  color: var(--photo-text);/' src/admin/tables/BookingPage.module.css
sed -i '148s/.*/  color: var(--photo-text);/' src/admin/tables/BookingPage.module.css
```

Verifikasi tidak ada yang salah sasaran (setiap baris HARUS berbunyi `color: var(--photo-text);`, dan baris SEBELUMNYA harus mengandung `background: var(--color-red)` atau `border-color: var(--color-red)`):
```bash
grep -n -B2 "color: var(--photo-text);" src/admin/AdminLayout.module.css src/admin/auth/LoginPage.module.css src/admin/pos/CheckoutPage.module.css src/admin/pos/PosPage.module.css src/admin/pos/ReceiptModal.module.css src/admin/reports/ReportsPage.module.css src/admin/settings/SettingsPage.module.css src/admin/settings/WebsiteCmsPage.module.css src/admin/shift/ShiftPage.module.css src/admin/staff/StaffPage.module.css src/admin/stock/StockPage.module.css src/admin/tables/BookingPage.module.css
```
Expected: 15 kemunculan total (PosPage & ShiftPage & BookingPage masing-masing 2×), tiap satu didahului baris `background: var(--color-red)` (boleh ada baris lain seperti `border-color` di antaranya untuk kasus `.periodChipActive`).

- [ ] **Step 4: Fix teks tombol/avatar kuning supaya tetap gelap (SEBELUM rename umum)**

Pola serupa Step 3 tapi terbalik: 7 tempat pakai `background: var(--color-yellow); color: var(--color-bg);` (dulu `--color-bg` gelap → teks gelap dari page background jadi kontras bagus di atas kuning; sekarang `--color-bg` jadi putih → teks putih di atas kuning, kontras jelek). Perbaikannya lebih sederhana: ganti ke `--color-text` (yang nilainya SUDAH `#1a1a1a`, persis yang dibutuhkan) — token ini AMAN dipakai langsung karena `--color-text` memang dimaksudkan sebagai "teks gelap standar", bukan token yang berubah makna seperti kasus Step 3.

```bash
sed -i '102s/.*/  color: var(--color-text);/' src/admin/auth/LoginPage.module.css
sed -i '110s/.*/  color: var(--color-text);/' src/admin/pos/CheckoutPage.module.css
sed -i '126s/.*/  color: var(--color-text);/' src/admin/pos/PosPage.module.css
sed -i '99s/.*/  color: var(--color-text);/' src/admin/pos/ReceiptModal.module.css
sed -i '105s/.*/  color: var(--color-text);/' src/admin/settings/WebsiteCmsPage.module.css
sed -i '49s/.*/  color: var(--color-text);/' src/admin/staff/StaffPage.module.css
sed -i '24s/.*/  color: var(--color-text);/' src/admin/tables/BookingPage.module.css
```

Verifikasi:
```bash
grep -n -B2 "color: var(--color-text);" src/admin/auth/LoginPage.module.css src/admin/pos/CheckoutPage.module.css src/admin/pos/PosPage.module.css src/admin/pos/ReceiptModal.module.css src/admin/settings/WebsiteCmsPage.module.css src/admin/staff/StaffPage.module.css src/admin/tables/BookingPage.module.css | grep -B1 "color-text"
```
Expected: tiap kemunculan `color: var(--color-text);` di atas didahului baris `background: var(--color-yellow)`.

- [ ] **Step 5: Rename variable reference di semua file customer/admin**

Jalankan sed berikut persis (urutan penting — `--color-line-2`/`--color-cream-2` harus di-rename SEBELUM `--color-line`/`--color-cream` supaya tidak salah potong jadi `--color-border-2`/`--color-text-2`). File ini TIDAK termasuk file yang sudah diperbaiki manual di Step 3/4 (sed di situ sudah final untuk baris-baris itu; rename `--color-cream`→`--color-text` global di file yang sama TIDAK menyentuh baris yang sudah jadi `--photo-text` karena sed hanya mengganti teks yang cocok):

```bash
FILES="src/customer/HomePage.css src/customer/OrderPage.css src/admin/AdminLayout.module.css src/admin/auth/LoginPage.module.css src/admin/auth/PinPage.module.css src/admin/auth/RequireAuth.tsx src/admin/pos/PosPage.module.css src/admin/pos/CheckoutPage.module.css src/admin/pos/ReceiptModal.module.css src/admin/reports/ReportsPage.module.css src/admin/settings/SettingsPage.module.css src/admin/settings/WebsiteCmsPage.module.css src/admin/shift/ShiftPage.module.css src/admin/staff/StaffPage.module.css src/admin/stock/StockPage.module.css src/admin/tables/BookingPage.module.css src/admin/tables/TablesPage.module.css src/admin/transactions/TransactionsPage.module.css"

for f in $FILES; do
  sed -i \
    -e 's/--color-cream-2/--color-text-muted/g' \
    -e 's/--color-cream/--color-text/g' \
    -e 's/--color-line-2/--color-border-strong/g' \
    -e 's/--color-line/--color-border/g' \
    "$f"
done
```

- [ ] **Step 6: Fix hardcoded `rgba(255,248,240,X)` literal jadi variable (KECUALI `HomePage.css`)**

Aturan: SEMUA kemunculan `rgba(255, 248, 240, <angka apa pun>)` (dengan atau tanpa spasi setelah koma) diganti jadi `var(--color-text-muted)` — tanpa kecuali, tanpa mempertahankan gradasi opacity lama (konsolidasi sengaja, lihat spec Bagian 7). `HomePage.css` SENGAJA dikecualikan dari daftar di bawah — filenya punya nav & section foto yang butuh penanganan manual, dikerjakan terpisah di Step 7.

```bash
FILES2="src/customer/OrderPage.css src/admin/AdminLayout.module.css src/admin/auth/LoginPage.module.css src/admin/auth/PinPage.module.css src/admin/pos/PosPage.module.css src/admin/pos/CheckoutPage.module.css src/admin/pos/ReceiptModal.module.css src/admin/reports/ReportsPage.module.css src/admin/settings/SettingsPage.module.css src/admin/settings/WebsiteCmsPage.module.css src/admin/shift/ShiftPage.module.css src/admin/staff/StaffPage.module.css src/admin/stock/StockPage.module.css src/admin/tables/BookingPage.module.css src/admin/tables/TablesPage.module.css src/admin/transactions/TransactionsPage.module.css"

for f in $FILES2; do
  sed -i -E 's/rgba\(255,\s*248,\s*240,\s*[0-9.]+\)/var(--color-text-muted)/g' "$f"
done
```

- [ ] **Step 7: `HomePage.css` — scoping nav/foto + fix hardcoded rgba manual**

`HomePage.css` punya elemen yang SELALU di atas backdrop gelap terlepas dari tema halaman: nav (`.nav.solid` pakai `background: rgba(26, 10, 0, 0.88)` hardcode, dan saat belum solid nav melayang di atas foto Hero), dan `.halal-footer` (badge melayang fixed, transparan, bisa nongkrong di atas section foto MAUPUN section putih). Elemen ini perlu tetap pakai `--photo-text`, sama seperti 3 section foto.

Tambahkan rule berikut tepat setelah blok alias `.home-page { ... }` (baris ~4-20, setelah baris `--fs: var(--font-body);\n}` — INI MENGGANTIKAN rule yang akan ditambahkan Task 2 Step 1, jadi Task 2 Step 1 dihapus, lihat catatan di Task 2):

```css
/* Elemen yang SELALU di atas backdrop gelap (foto atau nav gelap
   translucent), terlepas dari section apa yang aktif — --crm dipaksa
   tetap krem terang di sini, TIDAK ikut tema umum. */
.sec-hero,
.sec-sig,
.sec-carousel,
.nav,
.halal-footer {
  --crm: var(--photo-text);
}
```

Beri `.halal-footer` background gelap solid supaya tetap terbaca kalau melayang di atas section putih (cari rule `.halal-footer`, sekitar baris 1273, saat ini `background: transparent;` — ganti jadi `background: rgba(26, 10, 0, 0.75);` dan tambahkan `backdrop-filter: blur(4px);` persis di bawahnya).

Fix 10 kemunculan `rgba(255,248,240,X)` yang berada di section BUKAN foto/nav (Cerita/Story, Menu Lengkap, Lokasi, Footer strip, Info Grid) — jadi `var(--color-text-muted)`:
```bash
sed -i '455s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '484s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '859s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '936s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '954s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '986s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '1135s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '1149s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '1263s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
sed -i '1308s/.*/  color: var(--color-text-muted);/' src/customer/HomePage.css
```

9 kemunculan LAIN (nav ×2 di baris 137/152, Hero ×3 di baris 279/320/353, Signature ×1 di baris 588, Carousel ×2 di baris 725/750, side-dots ×1 di baris 1199) **SENGAJA TIDAK DIUBAH** — sudah benar sebagai teks/elemen terang di atas backdrop gelap (nav & 3 section foto), atau elemen dekoratif kecil (`.sd` dot indikator, baris 1199, cukup low-stakes untuk dibiarkan).

Verifikasi jumlah akhir:
```bash
grep -c "rgba(255,\s*248,\s*240" src/customer/HomePage.css
```
Expected: `9` (persis 9 sisa yang sengaja dipertahankan).

- [ ] **Step 8: Fix 2 inline style di file `.tsx`**

`src/admin/AdminHome.tsx` baris 11 — ganti:
```tsx
<p style={{ color: 'rgba(255,248,240,.7)' }}>Selamat datang di Business OS. Pilih modul dari menu di samping.</p>
```
jadi:
```tsx
<p style={{ color: 'var(--color-text-muted)' }}>Selamat datang di Business OS. Pilih modul dari menu di samping.</p>
```

`src/customer/HomePage.tsx` baris 498 — ganti:
```tsx
<span style={{ color: 'rgba(255,248,240,.4)', fontSize: '.7rem' }}>(atau sampai habis)</span>
```
jadi:
```tsx
<span style={{ color: 'var(--color-text-muted)', fontSize: '.7rem' }}>(atau sampai habis)</span>
```

- [ ] **Step 9: Verifikasi tidak ada sisa referensi token lama**

```bash
grep -rln "color-cream\|color-line" src/ && echo "MASIH ADA SISA — perbaiki dulu" || echo "BERSIH (rename)"
grep -rc "rgba(255,\s*248,\s*240" src/ 2>/dev/null | grep -v ":0$"
```
Expected baris pertama: `BERSIH (rename)`. Expected baris kedua: HANYA `src/customer/HomePage.css:9` yang muncul (9 sisa yang sengaja dipertahankan dari Step 7) — kalau ada file lain muncul di situ, berarti Step 6 atau Step 8 belum lengkap, perbaiki dulu sebelum lanjut.

- [ ] **Step 10: Build & lint**

```bash
npm run build
npm run lint
```
Expected: keduanya sukses tanpa error (build akan tetap punya warning ukuran chunk >500KB dari Fase 5 — itu bukan error, abaikan).

- [ ] **Step 11: Verifikasi visual awal (baseline "flip")**

Jalankan dev server, screenshot homepage & 1 halaman admin (pakai debug hook dari Global Constraints) di desktop 1440×900:
```bash
npm run dev -- --port 5183
```
Ambil screenshot `http://localhost:5183/SukarameApp/` dan `http://localhost:5183/SukarameApp/admin` (dengan debug hook). Expected: background sudah putih di kedua halaman, teks jadi gelap di admin. Hero/Signature/Carousel dan nav MASIH krem-di-atas-foto/gelap (itu benar, disengaja — lihat Step 7), section lain (Cerita, Menu, Lokasi) sudah putih dengan teks gelap. Cek KHUSUS: semua 15 tombol solid merah dari Step 3 (mis. tombol Simpan di `/admin/settings`, tombol Bayar di `/admin/pos`) punya teks TERANG terbaca (bukan gelap-di-atas-merah); semua 7 hover/state kuning dari Step 4 (mis. hover tombol Masuk di `/admin/login`) punya teks GELAP terbaca (bukan putih-di-atas-kuning).

- [ ] **Step 12: Commit**

```bash
git add src/shared/theme.css src/customer/HomePage.css src/customer/HomePage.tsx src/customer/OrderPage.css src/admin/ 
git rm src/shared/theme.ts
git commit -m "Rebrand tema terang: token baru + rename global (Fase design system)"
```

---

## Task 2: HomePage — Pengecualian Foto + Interaksi

**Files:**
- Modify: `src/customer/HomePage.css`

**Interfaces:**
- Consumes: `--photo-text`, `--color-red-dark`, `--color-border` dari Task 1. Scoping `--crm` untuk `.sec-hero`/`.sec-sig`/`.sec-carousel`/`.nav`/`.halal-footer` SUDAH dikerjakan di Task 1 Step 7 — task ini hanya menambah interaksi (tidak ada pekerjaan warna/kontras tersisa untuk HomePage).
- Produces: tidak ada interface baru untuk task lain (task ini daun/terminal untuk HomePage).

- [ ] **Step 1: Build & cek visual bagian foto (verifikasi hasil Task 1, bukan pekerjaan baru)**

```bash
npm run build
```
Ambil screenshot section Hero (scroll ke atas) dan Signature (scroll ke section ke-3) di `http://localhost:5183/SukarameApp/`. Expected: judul "MIE AYAM SUKARAME" dan teks lain di atas foto tetap krem/putih terbaca, BUKAN gelap (ini hasil Task 1 Step 7 — kalau belum benar, kembali ke Task 1, jangan diperbaiki lagi di sini).

- [ ] **Step 2: Tambah interaksi tombol — hover naik + bayangan, klik mengecil**

Cari rule `.btn-solid` (sekitar baris 273) dan tambahkan `transition` + hover/active. Ganti:
```css
.btn-solid {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.85rem 2rem;
  background: var(--red);
  color: var(--crm);
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s;
}
.btn-solid:hover {
  background: var(--ylw);
  color: var(--esp);
}
```
jadi:
```css
.btn-solid {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.85rem 2rem;
  background: var(--red);
  color: var(--crm);
  text-decoration: none;
  font-weight: 700;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease,
    color 0.2s ease;
}
.btn-solid:hover {
  background: var(--color-red-dark);
  color: var(--crm);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.btn-solid:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 2px 6px rgba(211, 47, 47, 0.25);
}
```

Sekalian perbaiki bug kontras di `.btn-directions:hover` (section Lokasi, BUKAN section foto — sekitar baris 1090), yang saat ini mengandalkan `--esp` (dulu gelap, sekarang putih) buat teks di atas kuning:
```css
.btn-directions:hover {
  background: var(--ylw);
  color: var(--esp);
  border-color: var(--ylw);
}
```
jadi:
```css
.btn-directions:hover {
  background: var(--ylw);
  color: var(--crm);
  border-color: var(--ylw);
}
```

- [ ] **Step 3: Tambah interaksi kartu menu — hover terangkat**

Cari rule `.menu-item` (sekitar baris 780) dan tambahkan transform+shadow di hover. Ganti:
```css
.menu-item {
  background: var(--brn);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  align-items: start;
  transition: background 0.3s;
}
.menu-item:hover {
  background: rgba(93, 32, 0, 0.8);
}
```
jadi:
```css
.menu-item {
  background: var(--brn);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  align-items: start;
  transition:
    background 0.3s,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.menu-item:hover {
  background: var(--color-surface-2);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 4: Tambah animasi kilau ke badge "Menu Terlaris"**

Cari rule `.badge` (sekitar baris 890) dan tambahkan efek shine. Ganti:
```css
.badge {
  display: inline-block;
  font-size: 0.52rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid rgba(211, 47, 47, 0.5);
  background: rgba(211, 47, 47, 0.12);
  color: #ff7070;
  padding: 0.25rem 0.65rem;
  margin-bottom: 0.5rem;
}
```
jadi:
```css
.badge {
  display: inline-block;
  position: relative;
  overflow: hidden;
  font-size: 0.52rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border: 1px solid rgba(211, 47, 47, 0.5);
  background: rgba(211, 47, 47, 0.12);
  color: #ff7070;
  padding: 0.25rem 0.65rem;
  margin-bottom: 0.5rem;
}
.badge::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: badge-shine 2.6s ease-in-out infinite;
}
@keyframes badge-shine {
  0% {
    left: -60%;
  }
  50%,
  100% {
    left: 140%;
  }
}
```

- [ ] **Step 5: Build, lint, screenshot penuh**

```bash
npm run build
npm run lint
```
Screenshot `http://localhost:5183/SukarameApp/` desktop 1440×900 DAN mobile 375×812 — scroll ke tiap 6 section, pastikan: (a) Hero/Signature/Carousel teks tetap krem di atas foto gelap, nav tetap krem di atas backdrop-nya, (b) section lain putih dengan teks gelap, (c) tombol "Pesan Online" bereaksi ke hover (translateY + shadow) dan klik (scale kecil), (d) badge "Menu Terlaris" ada kilau bergerak, (e) tidak ada horizontal overflow (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`).

- [ ] **Step 6: Commit**

```bash
git add src/customer/HomePage.css
git commit -m "Rebrand tema terang: HomePage — pengecualian foto + interaksi (Fase customer)"
```

---

## Task 3: OrderPage — Interaksi

**Files:**
- Modify: `src/customer/OrderPage.css`

**Interfaces:**
- Consumes: `--color-red-dark` dari Task 1.

- [ ] **Step 1: Tambah interaksi tombol qty (+/-)**

Cari rule `.qty-btn` (sekitar baris 155) dan tambahkan transition+hover scale. Ganti:
```css
.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.2s;
  flex-shrink: 0;
}
```
jadi (tambahkan `transform` di transition, sisanya sama):
```css
.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.12s ease;
  flex-shrink: 0;
}
.qty-btn:hover {
  transform: scale(1.12);
}
.qty-btn:active {
  transform: scale(0.9);
}
```

Cari juga rule `.qty-btn.plus:hover` (sekitar baris 225) — saat ini `color: var(--esp)` (mengandalkan `--esp` = background halaman yang DULU gelap supaya kontras di atas kuning; sekarang `--esp` putih, jadi teks jadi putih-di-atas-kuning, kontras rusak). Ganti:
```css
.qty-btn.plus:hover {
  background: var(--ylw);
  color: var(--esp);
}
```
jadi:
```css
.qty-btn.plus:hover {
  background: var(--ylw);
  color: var(--crm);
}
```
(`--crm` di `OrderPage.css` SELALU gelap — tidak ada pengecualian foto seperti di HomePage — jadi ini otomatis jadi teks gelap yang benar di atas kuning.)

- [ ] **Step 2: Tambah interaksi tombol submit/pesan**

Cari rule `.btn-submit` (sekitar baris 265) dan `.btn-pesan` (sekitar baris 190). Untuk `.btn-submit`, ganti:
```css
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: var(--red);
  color: #fff;
  border: none;
  font-family: var(--fs);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 2px;
  margin-top: 0.5rem;
}
.btn-submit:hover {
  background: #b71c1c;
}
```
jadi (nilai hover sudah `#b71c1c` yang kebetulan SAMA dengan `--color-red-dark` — cukup ganti literal ke variable + tambah transform):
```css
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: var(--red);
  color: #fff;
  border: none;
  font-family: var(--fs);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
  border-radius: 2px;
  margin-top: 0.5rem;
}
.btn-submit:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.btn-submit:active {
  transform: translateY(0) scale(0.98);
}
```

Untuk `.btn-pesan` (baris ~290), ganti:
```css
.btn-pesan {
  width: 100%;
  padding: 1rem;
  background: var(--red);
  color: #fff;
  border: none;
  font-family: var(--fs);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-pesan:hover {
  background: #b71c1c;
}
```
jadi:
```css
.btn-pesan {
  width: 100%;
  padding: 1rem;
  background: var(--red);
  color: #fff;
  border: none;
  font-family: var(--fs);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-pesan:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.btn-pesan:active {
  transform: translateY(0) scale(0.98);
}
```

- [ ] **Step 3: Tambah interaksi item-card (hover halus, bukan lift besar — ini list padat, bukan grid kartu)**

Cari rule `.item-card`/`.item-card:hover` (baris ~153) dan ganti:
```css
.item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid rgba(211, 47, 47, 0.1);
  transition: background 0.2s;
}
.item-card:hover {
  background: rgba(61, 20, 0, 0.6);
}
```
jadi:
```css
.item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid rgba(211, 47, 47, 0.1);
  border-left: 3px solid transparent;
  transition:
    background 0.2s,
    border-left-color 0.2s;
}
.item-card:hover {
  background: var(--color-surface-2);
  border-left-color: var(--ylw);
}
```

- [ ] **Step 4: Build, lint, screenshot**

```bash
npm run build
npm run lint
```
Screenshot `http://localhost:5183/SukarameApp/order` desktop & mobile — cek: tombol qty +/- membesar saat hover, tombol "Lanjut Bayar"/"Pesan via WhatsApp" naik+bayangan saat hover, item menu ada border kiri kuning saat hover.

- [ ] **Step 5: Commit**

```bash
git add src/customer/OrderPage.css
git commit -m "Rebrand tema terang: OrderPage — interaksi tombol & kartu (Fase customer)"
```

---

## Task 4: AdminLayout — Verifikasi Tema + Interaksi

**Files:**
- Modify: `src/admin/AdminLayout.module.css`

- [ ] **Step 1: Sesuaikan bayangan drawer mobile untuk tema terang**

Cari rule `.sidebar` di dalam media query `@media (max-width: 768px)` (drawer off-canvas dari perbaikan responsive sebelumnya) — bayangan `box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4)` terlalu berat untuk drawer putih, kurangi opacity. Ganti:
```css
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 400;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
  }
```
jadi:
```css
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 400;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }
```

- [ ] **Step 2: Tambah interaksi hover ke `.navLink`**

Cari rule `.navLink` dan `.navLink:hover` — tambahkan sedikit geser ke kanan saat hover untuk kesan responsif:
```css
.navLink {
  display: block;
  padding: 0.65rem 0.8rem;
  border-radius: 6px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    color 0.15s,
    transform 0.15s ease;
}
.navLink:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
  transform: translateX(3px);
}
```

- [ ] **Step 3: Tambah interaksi ke `.logoutBtn`**

Cari rule `.logoutBtn`/`.logoutBtn:hover`, tambahkan transition warna lebih eksplisit (border+color sudah ada, pastikan ada `transition`):
```css
.logoutBtn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    background 0.15s;
}
.logoutBtn:hover {
  border-color: var(--color-red);
  color: var(--color-red);
  background: var(--color-red-tint);
}
```

- [ ] **Step 4: Build, lint, screenshot (pakai debug hook, lihat Global Constraints)**

Screenshot dashboard admin desktop & mobile (drawer terbuka & tertutup). Cek: sidebar putih dengan border tipis, nav link geser halus saat hover, tombol Keluar berubah warna saat hover, DAN nav link halaman aktif (`.navLinkActive`, background merah) punya teks terang terbaca (hasil fix Task 1 Step 3 — bukan pekerjaan baru di sini, cuma verifikasi; kalau masih gelap-di-atas-merah berarti Task 1 Step 3 belum benar, kembali ke situ).

- [ ] **Step 5: Commit**

```bash
git add src/admin/AdminLayout.module.css
git commit -m "Rebrand tema terang: AdminLayout — interaksi nav & shadow drawer (Fase admin)"
```

---

## Task 5: Auth Pages (Login, Pin) — Interaksi

**Files:**
- Modify: `src/admin/auth/LoginPage.module.css`
- Modify: `src/admin/auth/PinPage.module.css`

- [ ] **Step 1: `LoginPage.module.css` — interaksi `.submitBtn`**

Isi saat ini (setelah Task 1 Step 3 mengubah baris 91 `color: var(--color-cream)`→`color: var(--photo-text)`, dan Task 1 Step 4 mengubah baris 102 `color: var(--color-bg)`→`color: var(--color-text)`):
```css
.submitBtn {
  margin-top: 0.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.submitBtn:hover:not(:disabled) {
  background: var(--color-yellow);
  color: var(--color-text);
}
.submitBtn:disabled {
  opacity: 0.6;
  cursor: default;
}
```
Ganti jadi (standarkan hover jadi "gelapkan merah", bukan "tukar ke kuning"):
```css
.submitBtn {
  margin-top: 0.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.submitBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.submitBtn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}
.submitBtn:disabled {
  opacity: 0.6;
  cursor: default;
}
```

- [ ] **Step 2: `PinPage.module.css` — interaksi `.key` (numpad)**

Cari rule `.key`/`.key:hover` (numpad button) — tambahkan scale+shadow saat hover/active:
```css
.key {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s ease,
    box-shadow 0.15s ease;
}
.key:hover {
  background: var(--color-surface);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.key:active {
  transform: scale(0.94);
}
```

- [ ] **Step 3: `PinPage.module.css` — interaksi dot indikator PIN**

Cari rule `.dot`/`.dotFilled` — tambahkan transition supaya transisi kosong→terisi halus:
```css
.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-yellow);
  background: transparent;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}
.dotFilled {
  background: var(--color-yellow);
  transform: scale(1.1);
}
```

- [ ] **Step 4: Build, lint, screenshot**

Screenshot `/admin/login` dan `/admin/pin` (pin butuh `phase: 'needsPin'` via debug hook) desktop & mobile. Cek tombol Masuk naik+bayangan saat hover, tombol numpad membesar bayangan saat hover dan mengecil saat diklik, dot PIN membesar sedikit saat terisi.

- [ ] **Step 5: Commit**

```bash
git add src/admin/auth/LoginPage.module.css src/admin/auth/PinPage.module.css
git commit -m "Rebrand tema terang: Login & Pin — interaksi tombol/numpad (Fase admin)"
```

---

## Task 6: POS Cluster (Pos, Checkout, Receipt) — Interaksi

**Files:**
- Modify: `src/admin/pos/PosPage.module.css`
- Modify: `src/admin/pos/CheckoutPage.module.css`
- Modify: `src/admin/pos/ReceiptModal.module.css`

- [ ] **Step 1: `PosPage.module.css` — interaksi `.tile` (kartu menu)**

Cari rule `.tile`/tambahkan hover lift. Ganti:
```css
.tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
}
```
jadi:
```css
.tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.tile:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: var(--color-yellow);
}
```

- [ ] **Step 2: `PosPage.module.css` — interaksi `.qtyBtn`**

Cari rule `.qtyBtn`/`.qtyBtn:hover`, tambahkan scale:
```css
.qtyBtn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.12s ease;
}
.qtyBtn:hover {
  border-color: var(--color-yellow);
  transform: scale(1.1);
}
.qtyBtn:active {
  transform: scale(0.9);
}
```

- [ ] **Step 3: `PosPage.module.css` — interaksi `.payBtn`**

Isi saat ini (setelah Task 1 Step 3 mengubah baris 195 `color: var(--color-cream)` → `color: var(--photo-text)`):
```css
.payBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.payBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi (tambah `transition` + `:hover` baru):
```css
.payBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.payBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.payBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

Sekalian perbaiki `.fab` (tombol bulat keranjang melayang) — isi saat ini (setelah Task 1 Step 3 mengubah baris 116 `color: var(--color-cream)`→`color: var(--photo-text)`, Task 1 Step 4 mengubah baris 126 `color: var(--color-bg)`→`color: var(--color-text)`):
```css
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.fab:hover {
  background: var(--color-yellow);
  color: var(--color-text);
}
```
Ganti jadi (standarkan hover jadi "gelapkan merah" + tambah lift):
```css
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.fab:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
```

- [ ] **Step 4: `CheckoutPage.module.css` — interaksi `.methodOption` (radio metode bayar) dan `.payBtn`**

Cari rule `.methodOption`, tambahkan hover state:
```css
.methodOption {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.methodOption:hover {
  border-color: var(--color-yellow);
  background: var(--color-yellow-tint);
}
```

Untuk `.payBtn` di file ini, isi saat ini (setelah Task 1 Step 3 & Step 4 mengubah baris 101 `color: var(--color-cream)`→`color: var(--photo-text)` dan baris 110 `color: var(--color-bg)`→`color: var(--color-text)`):
```css
.payBtn {
  width: 100%;
  margin-top: 1.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}
.payBtn:hover:not(:disabled) {
  background: var(--color-yellow);
  color: var(--color-text);
}
.payBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi (standarkan hover jadi "gelapkan merah", bukan "tukar ke kuning" — konsisten dengan tombol solid lain di seluruh app):
```css
.payBtn {
  width: 100%;
  margin-top: 1.5rem;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.9rem;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.payBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.payBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

- [ ] **Step 5: `ReceiptModal.module.css` — interaksi 3 tombol aksi (`.waBtn`, `.printBtn`, `.doneBtn`)**

Isi file saat ini (baris 74-100, setelah Task 1 Step 3 mengubah baris 95 `color: var(--color-cream)`→`color: var(--photo-text)`, Task 1 Step 4 mengubah baris 99 `color: var(--color-bg)`→`color: var(--color-text)`, dan Task 1 Step 5 mengubah `--color-line`→`--color-border` di baris 82):
```css
.waBtn,
.printBtn,
.doneBtn {
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}
.waBtn {
  background: #25d366;
  color: #fff;
}
.printBtn {
  background: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.doneBtn {
  background: var(--color-red);
  color: var(--photo-text);
}
.doneBtn:hover {
  background: var(--color-yellow);
  color: var(--color-text);
}
```
Ganti jadi (tambah `transition` di rule gabungan, tambah hover ke `.waBtn`/`.printBtn`, standarkan `.doneBtn:hover` jadi "gelapkan merah" bukan "tukar ke kuning" — konsisten dengan tombol solid lain):
```css
.waBtn,
.printBtn,
.doneBtn {
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    transform 0.12s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.waBtn {
  background: #25d366;
  color: #fff;
}
.waBtn:hover {
  background: #1fa854;
  transform: translateY(-2px);
}
.printBtn {
  background: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.printBtn:hover {
  border-color: var(--color-yellow);
  transform: translateY(-2px);
}
.doneBtn {
  background: var(--color-red);
  color: var(--photo-text);
}
.doneBtn:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
}
```

- [ ] **Step 6: Build, lint, screenshot**

Screenshot `/admin/pos` (tambah item ke cart, buka drawer keranjang), `/admin/pos/checkout` desktop & mobile. Cek kartu menu terangkat saat hover, tombol qty membesar, tombol bayar naik+bayangan.

- [ ] **Step 7: Commit**

```bash
git add src/admin/pos/PosPage.module.css src/admin/pos/CheckoutPage.module.css src/admin/pos/ReceiptModal.module.css
git commit -m "Rebrand tema terang: POS/Checkout/Receipt — interaksi (Fase admin)"
```

---

## Task 7: Tables + Booking — Interaksi

**Files:**
- Modify: `src/admin/tables/TablesPage.module.css`
- Modify: `src/admin/tables/BookingPage.module.css`

- [ ] **Step 1: `TablesPage.module.css` — perkuat interaksi `.card` (sudah ada hover, tambah shadow+scale)**

Cari rule `.card`/`.card:hover` yang sudah ada, ganti jadi:
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.card:hover {
  border-color: var(--color-yellow);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 2: `TablesPage.module.css` — animasi kilau ke `.badge`**

Cari rule `.badge` dan variannya (`.badge_available`, dst.) — tambahkan pseudo-element shine ke `.badge` dasar (pola identik Task 2 Step 4):
```css
.badge {
  position: relative;
  overflow: hidden;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}
.badge::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: badge-shine 2.6s ease-in-out infinite;
}
@keyframes badge-shine {
  0% {
    left: -60%;
  }
  50%,
  100% {
    left: 140%;
  }
}
```
(Pertahankan rule `.badge_available`, `.badge_occupied`, `.badge_reserved` yang sudah ada persis seperti sekarang — mereka cuma mengatur `background`/`color`, tidak bentrok dengan penambahan di atas.)

- [ ] **Step 3: `BookingPage.module.css` — interaksi `.row` (perkuat yang sudah ada) dan `.newBtn`**

Cari rule `.row`/`.row:hover`, ganti jadi:
```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.row:hover {
  border-color: var(--color-yellow);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
```
Untuk `.newBtn`, isi saat ini (setelah Task 1 Step 3 mengubah baris 14 `color: var(--color-cream)`→`color: var(--photo-text)`, Task 1 Step 4 mengubah baris 24 `color: var(--color-bg)`→`color: var(--color-text)`):
```css
.newBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}
.newBtn:hover {
  background: var(--color-yellow);
  color: var(--color-text);
}
```
Ganti jadi (standarkan hover jadi "gelapkan merah"):
```css
.newBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.newBtn:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
```

Untuk `.submitBtn` (dialog form reservasi baru, baris ~146 sebelum Task 1) — isi saat ini (setelah Task 1 Step 3 mengubah baris 148 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.submitBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.4rem;
}
.submitBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi:
```css
.submitBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.4rem;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.submitBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.submitBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

- [ ] **Step 4: Build, lint, screenshot**

Screenshot `/admin/tables` dan `/admin/booking` desktop & mobile. Cek kartu meja/baris reservasi terangkat saat hover, badge status ada kilau bergerak.

- [ ] **Step 5: Commit**

```bash
git add src/admin/tables/TablesPage.module.css src/admin/tables/BookingPage.module.css
git commit -m "Rebrand tema terang: Tables & Booking — interaksi + badge shine (Fase admin)"
```

---

## Task 8: Transactions + Reports — Interaksi

**Files:**
- Modify: `src/admin/transactions/TransactionsPage.module.css`
- Modify: `src/admin/reports/ReportsPage.module.css`

- [ ] **Step 1: `TransactionsPage.module.css` — perkuat `.row` (list transaksi)**

Isi saat ini (setelah Task 1 Step 5 rename `--color-line`→`--color-border`, `--color-cream`→`--color-text`):
```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
}
.row:hover {
  border-color: var(--color-yellow);
}
```
Ganti jadi:
```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.row:hover {
  border-color: var(--color-yellow);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
```

- [ ] **Step 2: `ReportsPage.module.css` — interaksi `.periodChip`**

Cari rule `.periodChip` (belum ada, ditambah baru) dan `.periodChipActive` — isi `.periodChipActive` saat ini (setelah Task 1 Step 3 mengubah baris 24 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.periodChipActive {
  background: var(--color-red);
  border-color: var(--color-red);
  color: var(--photo-text);
}
```
Tambahkan `.periodChip` baru (dasar, belum aktif) dan hover, PLUS `transition` ke `.periodChipActive`:
```css
.periodChip {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.45rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  transition:
    background 0.15s,
    border-color 0.15s,
    transform 0.12s ease;
}
.periodChip:hover {
  border-color: var(--color-yellow);
  transform: translateY(-1px);
}
.periodChipActive {
  background: var(--color-red);
  border-color: var(--color-red);
  color: var(--photo-text);
}
```

- [ ] **Step 3: `ReportsPage.module.css` — interaksi `.summaryCard`**

Cari rule `.summaryCard` — tambahkan hover lift ringan (kartu statistik, bukan interaktif-klik, jadi transform kecil saja tanpa cursor:pointer):
```css
.summaryCard {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.summaryCard:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}
```

- [ ] **Step 4: Build, lint, screenshot**

Screenshot `/admin/transactions` dan `/admin/reports` (semua 3 periode: Hari ini/7 Hari/Bulan ini) desktop & mobile. Cek chip periode aktif tetap jelas (merah solid), chip non-aktif naik sedikit saat hover, kartu ringkasan sedikit terangkat saat hover.

- [ ] **Step 5: Commit**

```bash
git add src/admin/transactions/TransactionsPage.module.css src/admin/reports/ReportsPage.module.css
git commit -m "Rebrand tema terang: Transactions & Reports — interaksi (Fase admin)"
```

---

## Task 9: Stock + Staff + Shift — Interaksi

**Files:**
- Modify: `src/admin/stock/StockPage.module.css`
- Modify: `src/admin/staff/StaffPage.module.css`
- Modify: `src/admin/shift/ShiftPage.module.css`

- [ ] **Step 1: `StockPage.module.css` — perkuat `.row`**

Isi saat ini (setelah Task 1 Step 5 rename):
```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
}
.row:hover {
  border-color: var(--color-yellow);
}
```
Ganti jadi:
```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.row:hover {
  border-color: var(--color-yellow);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
```

Untuk `.saveBtn` (baris ~119 sebelum Task 1) — isi saat ini (setelah Task 1 Step 3 mengubah baris 120 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.saveBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
```
Ganti jadi:
```css
.saveBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.saveBtn:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
```

- [ ] **Step 2: `StaffPage.module.css` — perkuat `.row`, `.actionBtn`, dan tambah interaksi `.avatar`**

`.row` isi saat ini (setelah Task 1 Step 5 rename; catat: file ini pakai `gap: 0.9rem`, BUKAN `justify-content: space-between` seperti Stock/Transactions):
```css
.row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
}
.row:hover {
  border-color: var(--color-yellow);
}
```
Ganti jadi:
```css
.row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  text-align: left;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}
.row:hover {
  border-color: var(--color-yellow);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
```

Untuk `.avatar`, tambahkan sedikit scale saat parent `.row` di-hover:
```css
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.row:hover .avatar {
  transform: scale(1.08);
}
```

Untuk `.actionBtn` — isi saat ini (setelah Task 1 Step 3 mengubah baris 117 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.actionBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.actionBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi:
```css
.actionBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.actionBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.actionBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

Perbaiki juga `.avatarMe` (avatar untuk baris "kamu sendiri" di daftar staff) — isi saat ini:
```css
.avatarMe {
  background: var(--color-yellow);
  color: var(--color-bg);
}
```
Ganti jadi (`--color-bg` dulu gelap → kontras bagus di atas kuning; sekarang putih → kontras rusak, ganti ke `--color-text`):
```css
.avatarMe {
  background: var(--color-yellow);
  color: var(--color-text);
}
```

- [ ] **Step 3: `ShiftPage.module.css` — interaksi `.activeBadge` (shine) dan `.openBtn`/`.closeBtn`**

`.activeBadge` isi saat ini (tidak terpengaruh Task 1 — `#4caf50` hardcode hijau, tidak ada masalah kontras):
```css
.activeBadge {
  display: inline-block;
  background: rgba(76, 175, 80, 0.18);
  color: #4caf50;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.9rem;
  font-weight: 700;
}
```
Ganti jadi (tambah pseudo-element shine, pola identik Task 2 Step 4 / Task 7 Step 2):
```css
.activeBadge {
  display: inline-block;
  position: relative;
  overflow: hidden;
  background: rgba(76, 175, 80, 0.18);
  color: #4caf50;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.9rem;
  font-weight: 700;
}
.activeBadge::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: badge-shine 2.6s ease-in-out infinite;
}
@keyframes badge-shine {
  0% {
    left: -60%;
  }
  50%,
  100% {
    left: 140%;
  }
}
```

`.openBtn`/`.closeBtn` isi saat ini (setelah Task 1 Step 3 mengubah baris 60 dan 74 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.openBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.openBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
.closeBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}
.closeBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi:
```css
.openBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.openBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.openBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
.closeBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.closeBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.closeBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

- [ ] **Step 4: Build, lint, screenshot**

Screenshot `/admin/stock`, `/admin/staff`, `/admin/shift` (kondisi shift aktif & tidak aktif) desktop & mobile.

- [ ] **Step 5: Commit**

```bash
git add src/admin/stock/StockPage.module.css src/admin/staff/StaffPage.module.css src/admin/shift/ShiftPage.module.css
git commit -m "Rebrand tema terang: Stock, Staff, Shift — interaksi (Fase admin)"
```

---

## Task 10: Settings + Website CMS — Interaksi

**Files:**
- Modify: `src/admin/settings/SettingsPage.module.css`
- Modify: `src/admin/settings/WebsiteCmsPage.module.css`

- [ ] **Step 1: `SettingsPage.module.css` — interaksi `.tab`/`.tabActive` dan `.actionRow`**

Cari rule `.tab`, tambahkan transition halus:
```css
.tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.tab:hover {
  color: var(--color-text);
}
.tabActive {
  color: var(--color-yellow);
  border-color: var(--color-red);
}
```
Untuk `.actionRow` (yang sudah punya `:hover`), pastikan ada `transition` eksplisit dan tambah `transform`:
```css
.actionRow {
  display: block;
  width: 100%;
  text-align: left;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    border-color 0.15s,
    transform 0.15s ease;
}
.actionRow:hover {
  border-color: var(--color-yellow);
  transform: translateX(3px);
}
```

Untuk `.saveBtn` — isi saat ini (setelah Task 1 Step 3 mengubah baris 131 `color: var(--color-cream)`→`color: var(--photo-text)`):
```css
.saveBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.saveBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```
Ganti jadi:
```css
.saveBtn {
  width: 100%;
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.saveBtn:hover:not(:disabled) {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
.saveBtn:disabled {
  opacity: 0.5;
  cursor: default;
}
```

- [ ] **Step 2: `WebsiteCmsPage.module.css` — interaksi `.sectionCard`/`.themeCard`, `.swatch`, dan `.saveBtn`**

Cari rule `.sectionCard, .themeCard` (rule gabungan), tambahkan hover halus (kartu form, bukan tombol — hover ringan saja, tanpa cursor:pointer karena bukan area klik tunggal):
```css
.sectionCard,
.themeCard {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.1rem;
  max-width: 520px;
  transition: box-shadow 0.2s ease;
}
.sectionCard:hover,
.themeCard:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}
```
Untuk `.swatch` (kotak warna kecil di form tema), tambahkan scale saat hover supaya terasa bisa diklik/diperiksa:
```css
.swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.swatch:hover {
  transform: scale(1.15);
}
```

Untuk `.saveBtn` — isi saat ini (setelah Task 1 Step 3 mengubah baris 95 `color: var(--color-cream)`→`color: var(--photo-text)`, Task 1 Step 4 mengubah baris 105 `color: var(--color-bg)`→`color: var(--color-text)`):
```css
.saveBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
}
.saveBtn:hover {
  background: var(--color-yellow);
  color: var(--color-text);
}
```
Ganti jadi (standarkan hover jadi "gelapkan merah"):
```css
.saveBtn {
  background: var(--color-red);
  color: var(--photo-text);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.2s ease;
}
.saveBtn:hover {
  background: var(--color-red-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
}
```

- [ ] **Step 3: Build, lint, screenshot**

Screenshot `/admin/settings` tab Akun & Website (termasuk scroll ke bagian Tema Warna & Font) desktop & mobile.

- [ ] **Step 4: Commit**

```bash
git add src/admin/settings/SettingsPage.module.css src/admin/settings/WebsiteCmsPage.module.css
git commit -m "Rebrand tema terang: Settings & Website CMS — interaksi (Fase admin)"
```

---

## Task 11: Sinkronisasi Data CMS `website_theme` (Live Data — Butuh Izin Terpisah)

**Files:**
- Tidak ada file kode — ini update DATA di Supabase staging (tabel `website_theme`).

**Interfaces:**
- Consumes: token warna final dari Task 1 Step 1.

- [ ] **Step 1: Konfirmasi ke user sebelum eksekusi**

Task ini mengubah DATA LIVE di Supabase staging (bukan cuma kode) — **WAJIB tanya izin eksplisit ke user sebelum menjalankan**, sesuai pola yang sudah dipakai untuk migration `branches` di sesi sebelumnya. Jangan lanjut ke Step 2 tanpa konfirmasi.

- [ ] **Step 2: Update baris `website_theme` (setelah login staff sungguhan tersedia)**

Login ke `/admin/settings` tab Website, isi form tema dengan nilai baru (samakan dengan tabel Task 1 Step 1):
- Background: `#FFFFFF`
- Surface: `#FFFFFF`
- Surface 2: `#F5F5F5`
- Primary (Merah): `#D32F2F`
- Primary Terang: `#FF5252`
- Teks: `#1A1A1A`
- Teks Redup: `#6B6B6B`
- Garis: `#E5E5E5`
- Tersier (Kuning): `#FFC107`

Klik "Simpan Tema".

- [ ] **Step 3: Verifikasi**

Buka `/` (homepage, tanpa login) di tab baru/incognito, cek warna sudah terang (bukan cache lama) — kalau perlu hard refresh.

- [ ] **Step 4: Catat di `log.md`**

Tambah entry di `SukarameApp/log.md` bagian Log Progres, format sama seperti entry sebelumnya, mencatat rebrand ini selesai + tanggal sinkronisasi CMS.

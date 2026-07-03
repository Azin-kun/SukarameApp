# Log & Rencana — SukarameApp (Unified Web PWA)

> **Baca ini dulu sebelum mulai kerja.** File ini adalah rencana lengkap + log progres untuk project **SukarameApp** — pengganti terpadu dari app Flutter (`Sukarame/app/`) dan website statis (`SukarameWeb/`) yang sudah ada.

---

## 1. Latar Belakang & Keputusan

Project client "Mie Ayam Sukarame" sebelumnya punya 2 codebase terpisah:
- `Sukarame/app/` — app kasir/admin Flutter (native, build APK, distribusi lewat GitHub Release, sideload manual)
- `SukarameWeb/` — website customer statis (HTML/CSS/JS), di-hosting GitHub Pages

Masalah yang mendorong perubahan ini: kesulitan mendukung Android **dan** iOS sekaligus dari 1 app native. Setelah didiskusikan (lihat riwayat percakapan sesi 2026-07-03), diputuskan:

1. **Satu codebase, satu project**, dipisah lewat URL/routing — bukan 2 aplikasi terpisah:
   - `/` → website customer (homepage + order sederhana → WhatsApp)
   - `/admin/*` → POS & admin lengkap (auth, kasir, stok, laporan, staff, shift, booking, edit konten website)
2. **Full web/PWA**, bukan native — supaya 1 build jalan di Android, iOS, desktop, tanpa app store, tanpa code signing, tanpa APK sideload.
3. **Ganti stack dari Flutter ke JavaScript/TypeScript** (bukan Flutter Web). Alasan:
   - Print struk pakai `window.print()` + CSS `@media print` — API browser native, jauh lebih sederhana di JS/HTML daripada lewat `dart:js_interop` di Flutter Web.
   - Website customer sudah HTML/JS — SEO jauh lebih baik di stack web native dibanding Flutter Web (penting untuk orang googling "mie ayam sukarame").
   - Tooling PWA di ekosistem JS lebih matang (`vite-plugin-pwa`, Workbox).
   - **Trade-off yang disadari:** app admin Flutter yang lama (`Sukarame/app/`) sudah lengkap & lolos `flutter analyze` (0 error) — semua itu ditulis ulang dari nol di JS. Ini keputusan sadar (bukan kecelakaan), karena skema DB & RPC sudah stabil/terpetakan sehingga rewrite jauh lebih rendah risiko dibanding waktu pertama kali dibangun.
4. **Printer struk**: pakai `window.print()` ke printer thermal yang terdaftar sebagai printer sistem OS (bukan Bluetooth SDK langsung). Ini pilihan sadar untuk kompatibilitas web — kalau printer di kasir belum mendukung mode ini, perlu dicek ulang saat implementasi (lihat Fase 4).
5. **Hosting**: GitHub Pages (static hosting), sama seperti `SukarameWeb/` sekarang. Build output (`dist/`) di-deploy lewat GitHub Actions.

### Yang TIDAK berubah
- **Backend Supabase** (`Sukarame/supabase/`) — semua migration, RPC, RLS, seed data **tetap dipakai apa adanya**. Project ini murni rewrite client-side.
- Supabase project staging yang sudah live: `https://tfsljifxmvptzkjrorol.supabase.co` — anon key ada di `Sukarame/.env` (lokal) dan sudah ter-embed di `SukarameWeb/index.html`/`order.html` (boleh dipakai ulang, jangan generate/ganti key).
- Skema database, RLS policy, dan role/permission — tidak berubah.

### Status project lama setelah ini selesai
- `Sukarame/app/` (Flutter) — akan **di-deprecate** setelah SukarameApp mencapai paritas fitur penuh, tidak dihapus dulu (biar ada fallback).
- `SukarameWeb/` — akan **di-deprecate**, konten & aset (foto WebP, copy, tema) **dipakai ulang** di SukarameApp (lihat Fase 2).
- `Sukarame/` (backend) — tetap jadi sumber kebenaran schema & migration selamanya, tidak berubah.

---

## 2. Tech Stack

| Bagian | Pilihan | Catatan |
|---|---|---|
| Framework | **Vite + React + TypeScript** | SPA, client-side routing |
| Routing | `react-router-dom` v6+ | `/` group (customer) vs `/admin/*` group (protected) |
| State management | **Zustand** | Padanan ringan dari pattern `Provider`/`ChangeNotifier` yang dipakai di app Flutter lama (auth store, cart store, table store) |
| Backend client | `@supabase/supabase-js` | Auth, Postgrest query, RPC, Realtime — sama persis dengan yang dipakai `.dart` lama, tinggal translate API |
| PWA | `vite-plugin-pwa` (Workbox) | Auto-generate `manifest.json` + service worker |
| Styling | CSS biasa / CSS Modules (ikuti tema yang sudah ada di `SukarameWeb/`), boleh Tailwind kalau mempercepat — putuskan di Fase 1 | |
| Print struk | `window.print()` + CSS `@media print` | Bukan Bluetooth/ESC-POS SDK |
| Hosting/CI | GitHub Actions → `npm run build` → deploy `dist/` ke GitHub Pages | Jauh lebih simpel dari `build_apk.yml` lama (tidak perlu Java/Android SDK/keystore) |

---

## 3. Struktur Project (usulan)

```
SukarameApp/
├── src/
│   ├── customer/          # Halaman publik: homepage, order → WA
│   │   ├── HomePage.tsx
│   │   └── OrderPage.tsx
│   ├── admin/              # POS & admin (butuh login)
│   │   ├── auth/            # LoginPage, PinPage
│   │   ├── pos/              # POS/kasir, checkout, receipt (window.print)
│   │   ├── tables/            # Booking meja
│   │   ├── transactions/
│   │   ├── stock/
│   │   ├── reports/
│   │   ├── staff/
│   │   ├── shift/
│   │   ├── settings/          # termasuk CMS: edit website_sections & website_theme
│   │   └── AdminLayout.tsx    # shell + nav + auth guard
│   ├── shared/
│   │   ├── supabaseClient.ts
│   │   ├── theme.ts            # port dari Sukarame/app/lib/config/theme.dart
│   │   └── components/
│   ├── App.tsx                 # router root
│   └── main.tsx
├── public/
│   └── icons/                  # PWA icons (reuse Sukarame/app/assets/icon/*)
├── index.html
├── vite.config.ts
├── package.json
├── .github/workflows/deploy.yml
├── .env.example                # SUPABASE_URL, SUPABASE_ANON_KEY (jangan commit .env asli)
└── log.md                      # file ini — update terus tiap fase selesai
```

---

## 4. Referensi Data & Fitur dari Project Lama

### 4.1 Tema & Branding (port dari `Sukarame/app/lib/config/theme.dart` & `SukarameWeb/`)
- Merah `#D32F2F` (aksen utama), Kuning `#FFC107` (aksen sekunder)
- Background `#1A0A00` (gelap kopi tua), Surface `#3D1400`
- Font: Playfair Display (heading) + Poppins (body) — Google Fonts
- Logo & foto: pakai ulang file WebP yang sudah dioptimasi di `SukarameWeb/assets/img/` (hero.webp, logo.jpg, 5 foto menu, story-foto.webp) — **jangan proses ulang dari sumber PNG asli**, sudah dikompres dari ~49MB jadi <700KB total.

### 4.2 Data Klien (referensi, bukan hardcode — sebagian sudah ada di tabel `website_sections`/`branches`)
- Nama owner: Amrey, email dummy `amrey@sukarame.com` (keputusan final, tidak diganti)
- WA: 6282220888139
- Alamat: Jl. Rindang, Tamantirto, Kasihan, Bantul, DIY 55184
- Jam buka: Senin–Minggu 07.00–18.00
- Maps: maps.app.goo.gl/N6Ni8pnRMqnCt8YKA
- Instagram: @mie_sukarame
- Menu: 13 item, 4 kategori (Mie Ayam, Mie Goreng, Tambahan, Minuman) — lihat `Sukarame/supabase/seed/1_catalog.sql`

### 4.3 RPC & Tabel Supabase yang Dipakai (SUDAH ADA, jangan bikin ulang)
| Fitur | RPC / Tabel | File migration referensi |
|---|---|---|
| Login PIN kasir | `set_pin(p_staff_id, p_pin)`, `verify_pin(p_staff_id, p_pin)` | `0001_core_identity.sql` |
| Order online → WA | `create_web_order(p_payload jsonb)` | `0014_core_web_order.sql` |
| Booking meja publik | `create_public_booking(...)` | `0003_core_transactions.sql` |
| Cek meja tersedia | `fnb_available_tables(...)` | `fnb/migrations/0002_fnb_booking_rpc.sql` |
| CMS konten website | tabel `website_sections` (section_key: hero/about/contact/social/hours/gallery, kolom `content jsonb`) | `0008_core_website.sql` |
| CMS tema website | tabel `website_theme` (semua `color_*`, `heading_font`, `body_font`, `google_fonts_url`) | `0008_core_website.sql` |
| Auth staff | Supabase Auth + `staff_profiles` + `staff_roles` | `0001_core_identity.sql` |
| Katalog, transaksi, stok | `categories`, `catalog_items`, `transactions`, `transaction_items`, `inventory_item` (cek nama tabel pasti di migration) | `0002`–`0003_core_*.sql` |

### 4.4 Halaman/Fitur Admin (paritas dengan 11 screen Flutter lama)
Referensi 1:1 dari `Sukarame/app/lib/screens/`: login, pin, home, pos, checkout, tables, transactions, stock, reports, staff, shift, booking, settings. Logic bisnis (query, RPC call, validasi) bisa dibaca langsung dari kode `.dart` masing-masing screen sebagai spek — translate ke React, jangan re-desain ulang alur bisnisnya kecuali ada alasan kuat.

### 4.5 Halaman Customer (paritas dengan `SukarameWeb/`)
- `index.html` → `HomePage.tsx`: 6 section (Hero, Cerita, Signature, Carousel Menu, Menu Lengkap per kategori, Lokasi+Maps)
- `order.html` → `OrderPage.tsx`: cart interaktif, modal konfirmasi (nama+catatan), submit ke RPC `create_web_order`, redirect WhatsApp, success screen

---

## 5. Rencana Fase (Build Plan)

Update status (⏳/✅) tiap fase selesai, tambah catatan seperti format `Sukarame/log.md`.

### Fase 0 — Setup Repo ✅
- [x] Folder `SukarameApp/` dibuat, git init
- [x] Repo GitHub `Azin-kun/SukarameApp` (public — perlu public untuk GitHub Pages gratis)
- [x] `log.md` ini dibuat

### Fase 1 — Scaffold ✅
- [x] `npm create vite@latest` dengan template React+TypeScript
- [x] Install: `react-router-dom`, `@supabase/supabase-js`, `zustand`, `vite-plugin-pwa`
- [x] Setup `.env.example` + `.env` (Supabase URL + anon key, ambil dari `Sukarame/.env` — **jangan commit `.env` asli**)
- [x] `supabaseClient.ts` — init client
- [x] Routing skeleton: `/` (customer layout) dan `/admin/*` (admin layout, belum ada auth guard dulu)
- [x] Port tema (warna, font) ke `shared/theme.ts` / CSS variables
- [x] Putuskan: CSS Modules polos vs Tailwind — pilih yang mempercepat, catat keputusan di sini
  - **Keputusan: plain CSS + CSS custom properties (variables), CSS Modules untuk scoping per-komponen. Bukan Tailwind.**
  - Alasan: `SukarameWeb/index.html` sudah punya CSS custom lengkap (animasi, `clamp()`, custom properties) yang akan di-port hampir verbatim di Fase 2 — menerjemahkan itu ke utility classes Tailwind lebih lambat dan berisiko mengubah visual dibanding pakai ulang CSS yang sudah ada. Variabel warna/font global ada di `src/shared/theme.css` (`:root`), disinkronkan manual dengan `src/shared/theme.ts` (dipakai kalau butuh nilai tema di JS/TS, mis. `theme-color` meta atau canvas).

### Fase 2 — Customer Site ⏳
- [ ] `HomePage.tsx` — port semua 6 section dari `SukarameWeb/index.html` (copy konten, struktur, responsive)
- [ ] `OrderPage.tsx` — port cart + modal + RPC `create_web_order` + redirect WA dari `SukarameWeb/order.html`
- [ ] Copy aset WebP dari `SukarameWeb/assets/img/` ke `public/`
- [ ] Verifikasi tampilan mobile & desktop cocok dengan versi lama

### Fase 3 — Admin Auth & Shell ⏳
- [ ] `LoginPage.tsx` — Supabase Auth (email/password)
- [ ] `PinPage.tsx` — RPC `verify_pin`/`set_pin`
- [ ] Auth guard untuk semua route `/admin/*` (redirect ke login kalau belum auth)
- [ ] `AdminLayout.tsx` — nav/sidebar ke semua modul admin

### Fase 4 — POS Core ⏳
- [ ] POS screen: kategori + katalog dari Supabase, cart, checkout
- [ ] Transaksi tersimpan ke `transactions`/`transaction_items`
- [ ] Struk: layout HTML khusus + CSS `@media print`, trigger `window.print()`
- [ ] **Cek fisik**: printer thermal yang dipakai kasir kompatibel dengan print-via-OS-driver (bukan cuma Bluetooth ESC/POS) — kalau tidak, perlu cari alternatif (mis. printer network/USB yang bisa di-set jadi printer sistem)

### Fase 5 — Modul Admin Lainnya ⏳
- [ ] Tables/Booking (`fnb_available_tables`, `create_public_booking`, tabel `bookings`)
- [ ] Transactions (riwayat + detail)
- [ ] Stock (inventory)
- [ ] Reports (laporan penjualan)
- [ ] Staff (kelola staff & role)
- [ ] Shift (buka/tutup shift kasir)
- [ ] Settings termasuk **CMS**: form edit `website_sections` & `website_theme` yang langsung mempengaruhi `HomePage.tsx` (fetch dari tabel yang sama)

### Fase 6 — PWA Polish ⏳
- [ ] `vite-plugin-pwa`: manifest.json (nama, icon, theme_color, display: standalone)
- [ ] Icon PWA — reuse `Sukarame/app/assets/icon/app_icon.png` (sudah ada, dari logo asli)
- [ ] Service worker: caching strategy (offline fallback minimal untuk halaman customer)
- [ ] Test "Add to Home Screen" di Android Chrome & iOS Safari

### Fase 7 — CI/CD & Deploy ⏳
- [ ] `.github/workflows/deploy.yml`: `npm ci` → `npm run build` → deploy `dist/` ke GitHub Pages (pakai `actions/deploy-pages`)
- [ ] Aktifkan GitHub Pages di repo (source: GitHub Actions)
- [ ] Verifikasi live URL jalan di HTTPS (wajib untuk service worker)

### Fase 8 — Cutover ⏳
- [ ] Feature parity check vs `Sukarame/app/` (Flutter) dan `SukarameWeb/`
- [ ] Ganti CNAME/DNS kalau ada domain custom (saat ini belum ada, masih pakai github.io)
- [ ] Umumkan ke staff pindah dari APK ke web app (install lewat "Add to Home Screen")
- [ ] Deprecate `Sukarame/app/` (Flutter) dan `SukarameWeb/` — jangan hapus dulu, tandai deprecated di README masing-masing

---

## 6. Log Progres

> Tambah entry baru di bawah tiap sesi kerja, format sama seperti `Sukarame/log.md`: `## YYYY-MM-DD` lalu deskripsi per fase.

### 2026-07-03 — Inisiasi
- Diskusi arsitektur di sesi Claude terpisah (project `Sukarame`) menghasilkan keputusan pivot ke unified web/PWA (lihat Bagian 1)
- Folder `SukarameApp/` dibuat, git init, repo GitHub dibuat
- `log.md` (file ini) ditulis sebagai rencana lengkap untuk sesi Claude baru yang akan mengerjakan implementasi

### 2026-07-03 — Fase 1: Scaffold selesai
- Scaffold Vite dibuat di folder sementara (`npm create vite@latest -- --template react-ts`) lalu dipindah ke `SukarameApp/` supaya tidak bentrok dengan `log.md`/`assets/`/`.git` yang sudah ada; boilerplate demo (`App.css`, logo react/vite, `hero.png`, `icons.svg`) dihapus.
- `package.json` name diganti jadi `sukarame-app`.
- Dependencies terinstall: `react-router-dom`, `@supabase/supabase-js`, `zustand` (dependencies); `vite-plugin-pwa` (devDependency, belum di-wire ke `vite.config.ts` — itu tugas Fase 6).
- `.env` + `.env.example` dibuat (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), nilai staging diambil dari `Sukarame/.env`. `.env` ditambahkan ke `.gitignore` (belum ada aturan itu di `.gitignore` bawaan Vite, cuma `*.local`).
- `src/shared/supabaseClient.ts` — init client `@supabase/supabase-js` dari env var, throw kalau env kosong.
- Routing skeleton di `src/App.tsx` (`react-router-dom` v7): `/` → `HomePage`, `/order` → `OrderPage`, `/admin` → `AdminLayout` (nested `<Outlet/>`, index route `AdminHome`) — semua masih placeholder, belum ada auth guard (Fase 3).
- Tema di-port dari `Sukarame/app/lib/config/theme.dart` & `SukarameWeb/index.html` (`:root` CSS vars) ke `src/shared/theme.css` (CSS variables, di-`@import` dari `src/index.css`) dan `src/shared/theme.ts` (konstanta JS/TS, harus tetap sinkron manual dengan `theme.css`). Font Playfair Display + Poppins di-load via Google Fonts link di `index.html`.
- Keputusan styling: plain CSS + CSS Modules (bukan Tailwind) — lihat catatan di checklist Fase 1 di atas.
- Verifikasi: `npm run build` (tsc -b && vite build) sukses, `npm run lint` (oxlint) bersih, dev server jalan dan menyajikan route `/` & `/admin` dengan benar.
- Belum dikerjakan (menyusul Fase 2+): konten asli HomePage/OrderPage, PWA manifest/icons, CI deploy.

---

## 7. Kontak & Referensi Lain
- Backend/Supabase project: `Sukarame/` (folder sebelah, jangan diubah kecuali memang perlu migration baru)
- Website lama (untuk referensi konten/desain): `SukarameWeb/`
- Memory project (Claude): `project_sukarame.md` — berisi ringkasan status semua sub-project client Sukarame

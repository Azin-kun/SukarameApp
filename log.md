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

### Fase 2 — Customer Site ✅
- [x] `HomePage.tsx` — port semua 6 section dari `SukarameWeb/index.html` (copy konten, struktur, responsive)
- [x] `OrderPage.tsx` — port cart + modal + RPC `create_web_order` + redirect WA dari `SukarameWeb/order.html`
- [x] Copy aset WebP dari `SukarameWeb/assets/img/` ke `public/`
- [x] Verifikasi tampilan mobile & desktop cocok dengan versi lama

### Fase 3 — Admin Auth & Shell ✅
- [x] `LoginPage.tsx` — Supabase Auth (email/password)
- [x] `PinPage.tsx` — RPC `verify_pin`/`set_pin`
- [x] Auth guard untuk semua route `/admin/*` (redirect ke login kalau belum auth)
- [x] `AdminLayout.tsx` — nav/sidebar ke semua modul admin

### Fase 4 — POS Core ✅ (kecuali cek fisik printer)
- [x] POS screen: kategori + katalog dari Supabase, cart, checkout
- [x] Transaksi tersimpan ke `transactions`/`transaction_items`
- [x] Struk: layout HTML khusus + CSS `@media print`, trigger `window.print()`
- [ ] **Cek fisik**: printer thermal yang dipakai kasir kompatibel dengan print-via-OS-driver (bukan cuma Bluetooth ESC/POS) — kalau tidak, perlu cari alternatif (mis. printer network/USB yang bisa di-set jadi printer sistem). **Belum bisa dicek dari sesi ini** (butuh printer fisik) — perlu dicoba manual oleh user.

### Fase 5 — Modul Admin Lainnya ✅
- [x] Tables/Booking (`fnb_available_tables`, `create_public_booking`, tabel `bookings`)
- [x] Transactions (riwayat + detail)
- [x] Stock (inventory)
- [x] Reports (laporan penjualan)
- [x] Staff (kelola staff & role)
- [x] Shift (buka/tutup shift kasir)
- [x] Settings termasuk **CMS**: form edit `website_sections` & `website_theme` yang langsung mempengaruhi `HomePage.tsx` (fetch dari tabel yang sama)

### Fase 6 — PWA Polish ✅ (kecuali cek fisik Add to Home Screen)
- [x] `vite-plugin-pwa`: manifest.json (nama, icon, theme_color, display: standalone)
- [x] Icon PWA — reuse `Sukarame/app/assets/icon/app_icon.png` (sudah ada, dari logo asli)
- [x] Service worker: caching strategy (offline fallback minimal untuk halaman customer)
- [ ] Test "Add to Home Screen" di Android Chrome & iOS Safari — **belum bisa dicek dari sesi ini** (butuh device fisik/emulator dengan UI install prompt), perlu dicoba manual oleh user setelah deploy (Fase 7).

### Fase 7 — CI/CD & Deploy ✅
- [x] `.github/workflows/deploy.yml`: `npm ci` → `npm run build` → deploy `dist/` ke GitHub Pages (pakai `actions/deploy-pages`)
- [x] Aktifkan GitHub Pages di repo (source: GitHub Actions) — `gh api repos/Azin-kun/SukarameApp/pages -X POST -f build_type=workflow`
- [x] Verifikasi live URL jalan di HTTPS — **LIVE**: https://azin-kun.github.io/SukarameApp/

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

### 2026-07-03 — Fase 2: Customer Site selesai
- Aset WebP + `logo.jpg` di-copy dari `assets/img/` (Fase 0) ke `public/img/` — di-refer sebagai `/img/*.webp` di kode.
- `src/shared/format.ts` (`formatRupiah`) dan `src/customer/menuData.ts` (data menu 4 kategori: mie, goreng, tambahan, minuman — dipakai bareng oleh HomePage & OrderPage supaya harga/nama tidak duplikat).
- `HomePage.tsx` + `HomePage.css`: port 1:1 dari `SukarameWeb/index.html` (738 baris) — nav solid/hide-on-scroll, side-dots, 6 section snap-scroll (hero, cerita, signature, carousel menu otomatis 5 detik, menu lengkap dgn tab kategori, lokasi+maps), lightbox foto, semua state (scroll, carousel, tab, lightbox, mini-map overlay) di-translate ke React hooks — logic asli (index section, delay animasi, dsb) dipertahankan persis, bukan didesain ulang.
- `OrderPage.tsx` + `OrderPage.css`: port 1:1 dari `SukarameWeb/order.html` (516 baris) — cart state, kategori tab, qty control, bottom bar, modal konfirmasi + recap, toast validasi, submit ke RPC `create_web_order` via `supabase.rpc()` (fire-and-forget, tidak pernah blok alur WA), redirect WhatsApp, success screen.
- Class CSS asli (`.nav`, `.nav-brand`, dst.) dipakai lagi apa adanya (plain CSS, bukan Tailwind, sesuai keputusan Fase 1) — tapi `.nav`/`.nav-brand` di OrderPage di-rename jadi `.order-nav`/`.order-nav-brand` supaya tidak bentrok dengan HomePage.css (keduanya global CSS, bukan CSS Modules, jadi nama generik yang dipakai 2 file bisa saling override).
- Variabel warna/font lama (`--esp`, `--brn`, `--red`, `--ylw`, `--crm`, `--ff`, `--fs`, dst.) di-alias ke variabel kanonik `shared/theme.css` lewat blok `:root` lokal di `.home-page`/`.order-page`, supaya CSS asli bisa di-paste hampir tanpa ubah nama selector.
- **Verifikasi**: `npm run build` + `npm run lint` bersih. Instal Playwright (Chromium) lokal, jalankan dev server, screenshot desktop (1440×900) & mobile (390×844) untuk hero/cerita/menu/lokasi/order/cart/modal/toast/success — semua render sesuai desain asli setelah transisi CSS selesai (beberapa screenshot awal sempat menangkap mid-transition/fade, dikonfirmasi bukan bug lewat re-capture dengan delay lebih lama).
- **Temuan**: RPC `create_web_order` return **404** di Supabase staging (`tfsljifxmvptzkjrorol.supabase.co`) — bukan bug di port ini (anon key & tabel lain jalan normal, mis. `catalog_items` return 200), kemungkinan migration `0014_core_web_order.sql` belum ter-apply ke staging. Tidak mem-blok alur customer (WA redirect tetap jalan, sesuai desain asli yang fire-and-forget), tapi notifikasi Telegram ke owner untuk pesanan web kemungkinan belum aktif — perlu dicek di sesi project `Sukarame` (backend), bukan di sini.

### 2026-07-03 — Fase 3: Admin Auth & Shell selesai
- `src/admin/auth/authStore.ts` (Zustand) — port 1:1 dari `Sukarame/app/lib/providers/auth_provider.dart`: state machine `initial → unauthenticated → needsPin → authenticated`, urutan panggilan sama persis (`signInWithPassword` → fetch `staff_profiles` (+`staff_roles(branch_id)`) → RPC `verify_pin` → fetch `branches` limit 1 → `authenticated`). `changePin`/`signOut` juga di-port, belum dipakai di UI (menyusul Fase 5 — Settings).
- `LoginPage.tsx` + `.module.css` — port dari `login_screen.dart`: email/password, toggle show/hide password, pesan error dari Supabase Auth ditampilkan apa adanya (sama seperti versi Flutter yang juga tidak melokalisasi pesan error).
- `PinPage.tsx` + `.module.css` — port dari `pin_screen.dart`: numpad 3 kolom, 6 dot indikator, auto-submit begitu 6 digit terisi, tombol "Keluar" (sign out) di header.
- `RequireAuth.tsx` — guard component (bukan router-level `redirect` seperti `go_router`, karena react-router v6/v7 dipakai secara declarative) yang mem-bungkus route `/admin`: redirect ke `/admin/login`/`/admin/pin` sesuai `phase`, mengikuti logic `redirect` di `Sukarame/app/lib/core/router.dart`. `LoginPage`/`PinPage` sendiri juga py guard balik (kalau sudah `needsPin`/`authenticated`, redirect maju) — total logic redirect sama dengan versi Flutter.
- `AdminLayout.tsx` + `.module.css` — shell baru (sidebar persisten + topbar nama staff/Keluar), **beda dari Flutter** yang push-navigation per layar tanpa shell tetap — ini keputusan sadar sesuai rencana struktur folder di Bagian 3 (bukan redesain alur bisnis, cuma pola navigasi web yang lebih umum dibanding mobile). Sidebar berisi link ke semua 9 modul (paritas dgn grid `home_screen.dart`); `AdminHome.tsx` disederhanakan jadi teks salam saja (grid card dihilangkan karena redundan dengan sidebar yang sudah persisten).
- Ditambah `<Route path="*">` fallback di dalam layout `/admin` supaya AdminLayout (sidebar+topbar) tetap tampil dengan pesan "belum tersedia" kalau user klik modul yang belum dibangun (Fase 4/5) — tanpa fallback ini halaman jadi blank kosong total karena react-router tidak match apa pun.
- **Verifikasi**: `npm run build`/`lint` bersih. Browser test via Playwright: `/admin` & `/admin/pin` tanpa sesi redirect ke login ✅, login salah menampilkan pesan error dari Supabase (`Invalid login credentials`) ✅, transisi `needsPin`→PIN page dan `authenticated`→dashboard displet lewat debug hook sementara (dihapus sebelum commit, tidak ikut ke git) karena tidak ada password akun staff asli yang tersedia di sesi ini — alur PIN/RPC (`verify_pin`) sendiri sudah diverifikasi lewat pembacaan kode, belum lewat login staff sungguhan end-to-end (perlu dicoba manual oleh user dengan kredensial asli).

### 2026-07-03 — Fase 4: POS Core selesai
- `src/admin/pos/cartStore.ts` (Zustand) — port 1:1 dari `Sukarame/app/lib/providers/cart_provider.dart`: `add`/`remove`/`clear`/`checkout`. Urutan insert (`transactions` → `transaction_items` → update `fnb_tables` kalau ada meja → `transaction_payments`) dan **nilai `amount` di `transaction_payments` = total transaksi (bukan uang tunai yang diterima kasir)** dipertahankan persis — kolom itu dicek oleh trigger DB `fn_guard_payment` (`0003_core_transactions.sql`) yang men-set `status='completed'` otomatis kalau `sum(amount) = total`, dan akan `raise exception` "Overpayment" kalau nilainya melebihi total. Kembalian tunai murni tampilan UI, tidak pernah dikirim ke DB — sama seperti versi Flutter.
- `PosPage.tsx` — port dari `pos_screen.dart`+`catalog_tile.dart`: fetch `categories`/`catalog_items` (`is_active=true`) dari Supabase saat mount, tab kategori, tile item dengan tombol +/− (qty inline), badge jumlah di header, floating button total saat cart tidak kosong, drawer keranjang (port `cart_bottom_sheet.dart`) dengan tombol "Lanjut Bayar" ke `/admin/pos/checkout`.
- `CheckoutPage.tsx` — port dari `checkout_screen.dart`: metode bayar (cash/qris/transfer), validasi "Uang kurang" untuk cash, hitung kembalian live, snapshot item+total SEBELUM panggil `checkout()` (karena cart di-`clear()` otomatis setelah sukses) supaya struk tetap bisa menampilkan isi pesanan.
- `ReceiptModal.tsx` + `receiptPrint.css` — struk (port teks dari `_buildReceiptText()` di `receipt_dialog.dart`, termasuk tombol share WhatsApp) + tombol "Cetak Struk" yang panggil `window.print()`. CSS `@media print` global (bukan CSS Module — perlu selector `body *` yang menjangkau seluruh halaman) menyembunyikan semua elemen KECUALI `.receipt-print`, lebar dibatasi 58mm meniru kertas thermal.
- Routing: `/admin/pos` dan `/admin/pos/checkout` ditambah sebagai child route `/admin` (di antara `index` dan `path="*"` fallback dari Fase 3).
- **Bug ditemukan & diperbaiki**: pesan error di `authStore.ts` (Fase 3) dan `cartStore.ts` menampilkan literal `"[object Object]"` alih-alih pesan asli, karena `PostgrestError` dari `@supabase/supabase-js` bukan instance `Error` bawaan JS sehingga `e instanceof Error` selalu `false`. Diperbaiki dengan helper baru `src/shared/errors.ts` (`getErrorMessage`) yang cek properti `.message` langsung — dipakai di kedua store. Ditemukan lewat verifikasi manual RLS-denied insert (lihat di bawah), bukan lewat code review saja.
- **Verifikasi**: `npm run build`/`lint` bersih. Playwright (dengan `branchId`/`profile` di-inject manual via debug hook sementara — dihapus sebelum commit — karena RLS `categories`/`catalog_items` memang terbuka untuk `anon`/tidak perlu login, tapi insert ke `transactions`/`transaction_items`/`transaction_payments` mensyaratkan role `authenticated`+`is_staff()` yang tidak bisa didapat tanpa kredensial staff asli): kategori+katalog **live dari Supabase staging** ter-load benar (13 item, 4 kategori, harga cocok seed data) ✅, tambah/kurang qty di tile & drawer ✅, "Lanjut Bayar" → checkout ✅, validasi "Uang kurang" ✅, hitung kembalian ✅, insert transaksi dengan `branchId` palsu correctly ditolak Postgres (`invalid input syntax for type uuid`) dan pesannya tampil jelas ke user (bukti fix error message di atas) ✅.
- **Belum diverifikasi end-to-end** (butuh login staff asli + transaksi sukses sungguhan): tampilan `ReceiptModal` setelah checkout sukses, isi print-preview struk fisik, dan **cek fisik printer thermal** (item checklist yang memang dari awal ditandai perlu verifikasi manual di luar sesi Claude).

### 2026-07-03 — Fase 5: Modul Admin Lainnya selesai
Sebelum implementasi, riset referensi Flutter + skema Supabase dilakukan lewat 3 subagent paralel (Tables/Booking/Shift; Transactions/Reports/Stock; Staff/Settings-CMS) supaya cepat & menyeluruh. Beberapa **gap/bug nyata di backend/reference app** ditemukan lewat riset ini (bukan di-introduce oleh port ini, tapi perlu dicatat karena mempengaruhi keputusan desain):
- Kolom `transactions.shift_id` **tidak pernah diisi** di mana pun (Flutter maupun port ini) — jadi laporan/rekonsiliasi kas per-shift tidak benar-benar menghubungkan transaksi ke shift tertentu. Dibiarkan apa adanya (paritas dengan Flutter), dicatat sebagai keterbatasan.
- `transactions.status` cuma pernah bernilai `open|completed|void|refunded` — **`'settled'` tidak pernah ada**. Flutter `transactions_screen.dart`/`reports_screen.dart` membandingkan ke `'settled'` (selalu false, bug diam-diam). **Diperbaiki** di port ini: bandingkan ke `'completed'`.
- RLS untuk `fnb_tables`/`bookings`/`staff_shifts`/`inventory_items` cuma cek `is_staff()` (siapa saja staff aktif, lintas cabang) — permission granular (`core.inventory.manage`, `core.report.view.own`, dst.) ada di tabel `permissions` tapi **tidak ditegakkan di RLS** untuk modul-modul ini. Diikuti apa adanya (paritas Flutter, yang juga tidak menegakkan ini di client).
- Staff/akun baru **tidak bisa dibuat dari browser** (butuh `service_role`, cuma bisa lewat Supabase Dashboard manual + insert `staff_profiles` — ini didokumentasikan di `seed/0_bootstrap.sql`). Modul Staff di port ini karena itu cuma **list staff + reset PIN**, sama seperti `staff_screen.dart` — tidak ada tombol buat/undang staff baru (secara sadar, bukan kelupaan).
- CMS website (`website_sections`/`website_theme`) **sepenuhnya fitur baru** — `settings_screen.dart` Flutter tidak pernah menyentuh 2 tabel ini sama sekali (dikonfirmasi via grep, 0 match).

**Modul yang dibangun** (semua di `src/admin/`):
- `tables/TablesPage.tsx` — grid meja + ubah status (available/occupied/reserved) lewat update langsung ke `fnb_tables`, port dari `tables_screen.dart`+`table_provider.dart`.
- `tables/BookingPage.tsx` — list reservasi aktif (join `customers`), form buat baru via RPC `create_public_booking` (durasi selalu 2 jam, hardcode — sama seperti `booking_screen.dart`), transisi status (pending→confirmed→in_progress→completed, atau batalkan) lewat update langsung ke `bookings`.
- `transactions/TransactionsPage.tsx` — 50 transaksi terbaru + modal detail item, port dari `transactions_screen.dart` (dengan fix bug `'settled'`→`'completed'` di atas). `transactions/api.ts` dipakai bareng oleh Reports.
- `reports/ReportsPage.tsx` — filter periode (Hari ini/7 Hari/Bulan ini), agregasi 100% client-side (total transaksi, pendapatan, item terlaris diurutkan by qty, riwayat 20 terbaru) — port persis termasuk inkonsistensi asli batas tanggalnya (today/month pakai tengah malam lokal, week pakai rolling 7×24 jam, tanpa batas atas).
- `stock/StockPage.tsx` — list inventori (join nama dari `catalog_items`) urut stok terendah, edit stok via update absolut (bukan delta), port dari `stock_screen.dart`. Trigger DB (`fn_deduct_stock`, `fn_check_stock_low`) otomatis handle pengurangan stok saat transaksi `completed` dan notifikasi Telegram stok rendah — tidak perlu logic tambahan di client.
- `staff/StaffPage.tsx` — list staff + reset PIN via RPC `set_pin`, port dari `staff_screen.dart` (lihat gap "staff creation" di atas).
- `shift/ShiftPage.tsx` — buka/tutup shift (insert/update langsung ke `staff_shifts`, tidak ada RPC di backend), ringkasan kas awal/akhir/selisih saat tutup, durasi live-update. Port dari `shift_screen.dart`.
- `settings/SettingsPage.tsx` — 2 tab: "Akun" (profil, ganti PIN via `authStore.changePin`, keluar — port dari `settings_screen.dart`) dan "Website" (`WebsiteCmsPage.tsx`, fitur baru).
- `settings/WebsiteCmsPage.tsx` — form edit 5 `website_sections` (title/body/content-JSON per section: hero/about/hours/contact/social) + `website_theme` (9 warna + font), gated permission `core.website.manage` (lewat RLS, bukan pre-check di client — kalau gagal, pesan error Postgres tampil apa adanya lewat `getErrorMessage`).
- `customer/useWebsiteContent.ts` — **HomePage sekarang benar-benar membaca `website_sections`/`website_theme`** (anon-readable, tanpa perlu login): hero tagline+body, cerita/about body, jam buka, alamat, kontak WA, link sosial, dan 9 warna tema — semua dengan fallback ke teks statis asli kalau data CMS kosong/gagal fetch (progressive enhancement, bukan hard dependency). Ini memenuhi requirement checklist "langsung mempengaruhi HomePage.tsx" yang eksplisit di rencana Fase 5.

**Keputusan desain baru**: RPC `create_public_booking` dipanggil dengan payload **flat** (`{branch_id, customer_name, ...}`, bukan `{p_payload: {...}}`) — sama seperti pola RPC jsonb tunggal yang sudah dipakai di Fase 2 (`create_web_order`), karena PostgREST otomatis memetakan seluruh body jadi parameter jsonb tunggal fungsi tsb.

**Verifikasi**: `npm run build`/`lint` bersih (95 file, tidak ada error TS). Playwright:
- **HomePage/CMS — diverifikasi PENUH tanpa perlu auth** (RLS anon-readable): konfirmasi lewat inspeksi response network mentah bahwa `hero.body`, `about.body`, `hours.body`, dll benar-benar berasal dari Supabase staging (bukan fallback statis) — hero-sub menampilkan teks CMS yang lebih pendek dari default, membuktikan wiring nyata bekerja, bukan cuma "kebetulan sama". `WebsiteCmsPage` juga dites dengan `branch_id` staging asli (didapat lewat `curl` publik) — form ter-isi benar dengan 5 section + tema warna asli.
- **7 modul lain** (Tables/Booking/Transactions/Reports/Stock/Staff/Shift): karena RLS-nya mensyaratkan `authenticated`+`is_staff()` (tidak bisa didapat tanpa kredensial staff asli di sesi ini — sama seperti Fase 3/4), verifikasi dilakukan dengan `branchId`/`profile` di-inject manual via debug hook sementara (dihapus sebelum commit, tidak ikut git): semua halaman render tanpa crash, pesan error Postgres tampil jelas (bukti `getErrorMessage` dari Fase 4 bekerja konsisten di semua store baru), form/dialog (buka shift, ganti PIN, reservasi baru, edit stok) berfungsi, filter periode Laporan berpindah dengan benar, sidebar nav aktif menyorot halaman yang benar.
- **Belum diverifikasi end-to-end** (butuh kredensial staff asli): insert/update sungguhan ke `fnb_tables`/`bookings`/`transactions`/`inventory_items`/`staff_shifts`/`staff_pins`, dan penyimpanan sungguhan lewat `WebsiteCmsPage` (butuh permission `core.website.manage`) — perlu dicoba manual oleh user.
- Catatan non-blocking: build menghasilkan 1 chunk JS >500KB (bundle admin makin besar seiring modul bertambah) — belum masalah fungsional, tapi code-splitting (`React.lazy` per route admin) bisa jadi optimasi di Fase 6/7 kalau ukuran bundle mulai terasa di jaringan lambat.

### 2026-07-03 — Fase 6: PWA Polish selesai
- Icon: dipakai tool resmi ekosistem `vite-plugin-pwa`, `@vite-pwa/assets-generator` (preset `minimal`), dari source `Sukarame/app/assets/icon/app_icon.png` (1024×1024) — generate otomatis `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png` (dengan padding safe-zone yang benar), `apple-touch-icon-180x180.png`, `favicon.ico`. Source disimpan di `pwa-assets/icon.png` (di-commit, hanya ~1MB, supaya bisa regenerate kalau logo berubah) — hasil generate dipindah ke `public/` (root, bukan `public/icons/` seperti draf awal di Bagian 3, karena path itu yang otomatis dipakai tool & manifest, lebih simpel daripada override prefix).
- `vite.config.ts`: `VitePWA()` — `registerType: 'autoUpdate'`, manifest (nama "Mie Ayam Sukarame", `display: standalone`, `theme_color`/`background_color: #1A0A00` konsisten dengan tema, 4 icon termasuk maskable).
- Service worker (`workbox`, strategi `generateSW` bawaan): `globPatterns` diperluas mencakup gambar (`webp`/`png`) & font (`woff2`), bukan cuma js/css/html default — supaya halaman customer (foto menu, dsb.) betul-betul kepakai offline, bukan cuma app-shell kosong. `navigateFallback: '/index.html'` untuk SPA. `runtimeCaching` khusus Google Fonts (`CacheFirst`, cache 1 tahun untuk file font) karena itu resource cross-origin yang tidak ikut precache build.
- `index.html`: tambah `<link rel="icon">`, `<link rel="apple-touch-icon">`, `<meta name="description">`. `<link rel="manifest">` & script register SW di-inject otomatis oleh plugin saat build (tidak perlu ditulis manual).
- **Verifikasi nyata** (bukan cuma baca kode) — dicoba di atas `npm run preview` (server produksi, karena service worker tidak aktif di `npm run dev`): manifest fetchable (200, nama & 4 icon benar) ✅, service worker ter-registrasi dan `state: activated` ✅, semua file icon reachable (200) ✅, **dan yang paling penting: `/order` di-reload dalam kondisi network benar-benar `offline` (Playwright `context.setOffline(true)`) tetap menampilkan halaman lengkap dengan benar** (bukti offline fallback beneran jalan, bukan asumsi) ✅. 0 console error di kedua kondisi.
- **Belum bisa diverifikasi dari sesi ini**: "Add to Home Screen" di Android Chrome & iOS Safari sungguhan (butuh device fisik/emulator dengan UI native install-prompt yang tidak tersedia di headless browser) — item ini secara eksplisit memang butuh dicoba manual oleh user, idealnya setelah Fase 7 (deploy) supaya bisa dites lewat URL HTTPS asli, bukan localhost.

### 2026-07-03 — Fase 7: CI/CD & Deploy (workflow siap, deploy pertama menunggu izin user)
- **Base path GitHub Pages**: repo ini adalah *project page* (`Azin-kun/SukarameApp`, bukan repo `azin-kun.github.io`), jadi live URL akan berupa subpath `https://azin-kun.github.io/SukarameApp/`, bukan root domain. Ditambahkan `base: '/SukarameApp/'` di `vite.config.ts` (dipakai juga untuk `manifest.start_url`/`scope`/`navigateFallback` supaya konsisten, tidak cuma default `/`).
- **Bug ditemukan & diperbaiki (baru kelihatan setelah base path diaktifkan)**: banyak referensi gambar customer (`/img/hero.webp`, logo, dst. di `HomePage.tsx`/`menuData.ts`) ditulis sebagai string literal absolut — Vite HANYA otomatis meng-inject `base` ke asset yang di-`import`/dirujuk lewat `<link>`/`<script>` di `index.html`, BUKAN ke string runtime seperti `src="/img/x.webp"` di JSX. Kalau dibiarkan, semua foto menu/hero/logo akan 404 begitu di-deploy ke subpath. Diperbaiki dengan helper baru `src/shared/assetUrl.ts` (`assetUrl(path)` → prefix `import.meta.env.BASE_URL`), dipakai di semua tempat yang merujuk `public/img/*`.
- **`src/App.tsx`**: `<BrowserRouter basename={import.meta.env.BASE_URL}>` — otomatis mengikuti `base` Vite (dev `/`, prod `/SukarameApp/`), tidak di-hardcode supaya tidak perlu update 2 tempat kalau nama repo berubah.
- **SPA fallback untuk GitHub Pages** (`public/404.html`): GitHub Pages adalah static host tanpa rewrite server-side, jadi hard-refresh/direct-link ke route non-root (mis. `/SukarameApp/admin/pos`) akan 404 di level CDN. Dipakai pola standar [spa-github-pages](https://github.com/rafgraph/spa-github-pages): `404.html` redirect ke `index.html` lewat query string `?redirect=...`, lalu script inline di `<head>` `index.html` memulihkannya via `history.replaceState` sebelum React Router mount.
  - **Bug ditemukan & diperbaiki lewat testing nyata** (bukan keliatan dari baca kode): hasil `history.replaceState` awalnya menghasilkan double-slash (`/SukarameApp//admin/pos`) karena `location.pathname` (berakhiran `/`) + `redirect` (berawalan `/`) digabung langsung. Diperbaiki dengan `.replace(/\/$/, '')` sebelum concat.
- `.github/workflows/deploy.yml`: trigger `push` ke `main` + `workflow_dispatch` manual, job `build` (`npm ci` → `npm run build` → `actions/configure-pages` → `actions/upload-pages-artifact`) lalu job `deploy` (`actions/deploy-pages`) — pola resmi GitHub untuk static site, YAML divalidasi via `js-yaml`.
- **Verifikasi nyata**: build+lint bersih. Setelah base path diaktifkan, `dist/index.html`/`manifest.webmanifest`/`sw.js` dicek langsung — semua path (`favicon`, `apple-touch-icon`, JS/CSS bundle, `manifest` link, `start_url`/`scope`, `navigateFallback`) sudah ter-prefix `/SukarameApp/` dengan benar. Redirect 404→index diuji end-to-end pakai Playwright di atas `npm run preview` (dengan base path aktif): `/SukarameApp/?redirect=%2Forder` → URL akhir `/SukarameApp/order` dengan konten OrderPage lengkap ✅; `/SukarameApp/?redirect=%2Fadmin%2Fpos` → benar di-guard ke `/SukarameApp/admin/login` (karena belum login) ✅.
- **Deploy pertama, dengan izin eksplisit user** (commit+push serta aktivasi GitHub Pages ditanyakan dulu lewat `AskUserQuestion`, tidak dilakukan otomatis karena visible ke publik & mengubah state remote):
  1. Push 8 commit (Fase 1–7) ke `origin/main` — sebelumnya repo GitHub cuma punya commit `Inisiasi...`.
  2. `gh api repos/Azin-kun/SukarameApp/pages -X POST -f build_type=workflow` — aktifkan Pages dengan source GitHub Actions.
  3. Workflow pertama **sukses** (`build` 25s, `deploy` 10s), tapi live URL **crash total** (blank page, `pageerror`) saat dicek pakai Playwright.
- **🔴 Bug produksi ditemukan lewat verifikasi live URL sungguhan** (bukan cuma cek "workflow hijau"): `.env` sengaja tidak ter-commit (keputusan Fase 1, demi keamanan) — akibatnya `npm run build` di GitHub Actions jalan TANPA `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, dan `supabaseClient.ts` (Fase 1) `throw` di module-load time begitu env kosong → seluruh app crash sebelum render apa pun. Workflow "sukses" secara CI (build tidak error, artifact ke-upload, deploy ke-publish) padahal situs hasilnya benar-benar rusak — bukti kenapa "cek workflow hijau" saja tidak cukup, harus buka situsnya.
  - **Fix** (dengan izin eksplisit user lewat `AskUserQuestion` lagi, karena menulis secret ke repo adalah aksi baru di luar yang sudah disetujui): 2 nilai (URL + anon key publik — sama seperti yang sudah lama ter-embed di `SukarameWeb/index.html`) disimpan sebagai **GitHub Actions secrets** (`gh secret set`), `deploy.yml` step build diberi `env:` yang mengambil dari `secrets.VITE_SUPABASE_URL`/`secrets.VITE_SUPABASE_ANON_KEY`. Commit fix → push → workflow ke-2 sukses.
- **Verifikasi live URL final (Playwright langsung ke `https://azin-kun.github.io/SukarameApp/`, bukan lokal)**: homepage render penuh dengan data live ✅, deep-link `/order` (uji nyata SPA-fallback di GitHub Pages sungguhan, bukan simulasi) render lengkap ✅, service worker `state: activated` ✅, **0 console error**.
- Belum dicoba (perlu device fisik): "Add to Home Screen" Android/iOS — bisa dicoba sekarang karena URL HTTPS asli sudah live.

### 2026-07-03 — Fix backend: login PIN gagal ("Cannot coerce the result to a single JSON object")
- User mencoba login PIN sungguhan di live URL (pertama kalinya alur ini benar-benar dites end-to-end, lihat catatan "belum diverifikasi" di Fase 3) — gagal dengan error PostgREST tsb setelah PIN benar.
- **Root cause** (bukan bug di kode SukarameApp): tabel `branches` di backend `Sukarame/supabase/` di-enable RLS tapi **tidak pernah diberi policy sama sekali** — query terakhir di `verifyPin()` (`.from('branches').select('id').limit(1).single()`) selalu balik 0 baris untuk role `authenticated`, dan `.single()` melempar error itu. Bug yang sama persis ada di `auth_provider.dart` (Flutter lama), belum pernah ketahuan karena APK belum pernah dites di device asli.
- **Fix**: migration baru `Sukarame/supabase/core/migrations/0015_core_branches_rls.sql` (policy `branches_read`, select, authenticated, `is_staff()`) — dibuat & diterapkan ke staging lewat `python scripts/apply.py` di sesi ini (dengan izin eksplisit user), commit+push ke repo `Sukarame` terpisah. Detail lengkap ada di `Sukarame/log.md` (2026-07-03).
- **Belum diverifikasi**: user perlu coba login PIN lagi untuk konfirmasi fix ini benar-benar menyelesaikan masalah.

### 2026-07-03 — Fix: tampilan admin tidak responsive di mobile
- User melaporkan seluruh area `/admin/*` tidak responsive di HP. Direproduksi dengan Playwright viewport 375px (debug hook sementara untuk auth, seperti biasa — dihapus sebelum commit).
- **Root cause utama**: `AdminLayout.module.css` — sidebar `width: 220px` di dalam `.shell { display:flex }` **tanpa media query sama sekali** sejak Fase 3. Di layar 375px, sidebar sendirian makan ~59% lebar, sisa konten cuma dapat ~120px — bikin semua halaman admin (judul+tombol header, card menu POS, dst.) tumpang tindih/terpotong parah.
- **Fix struktural**: `AdminLayout.tsx`/`.module.css` — sidebar jadi off-canvas drawer di ≤768px (translateX + backdrop overlay), dipicu tombol hamburger baru di topbar; topbar/greeting/content dapat padding & ellipsis yang lebih pas untuk layar sempit. Di desktop (>768px) tidak berubah sama sekali.
- **Verifikasi bertahap** (bukan asumsi): setelah fix sidebar SAJA, di-screenshot ulang semua 10 route admin (`Dashboard`, `Kasir POS`, `Meja`, `Reservasi`, `Shift`, `Transaksi`, `Laporan`, `Stok`, `Karyawan`, `Pengaturan`) — ternyata hampir semua langsung rapi karena penyebab utamanya memang lebar konten yang kepotong, bukan CSS per-halaman yang salah satu-satu.
- **Bug per-halaman yang tetap ketemu & diperbaiki**: `WebsiteCmsPage.module.css` — grid tema warna 2 kolom (`.themeGrid`) + input warna di dalam `.colorRow` (flex) meng-overflow horizontal di ≤480px, karena default `min-width:auto` pada flex/grid item (bukan `0`) mencegah `<input>` menyusut di bawah lebar kontennya (`#3D1400`, `rgba(...)`, dst. terpotong). Diperbaiki dengan `min-width:0` pada `.field`/`.colorRow`/`.colorRow input`, plus `.themeGrid` collapse ke 1 kolom di ≤480px.
- Dicek otomatis: 0 horizontal-overflow di ke-10 route admin pada viewport 375px setelah kedua fix.

---

## 7. Kontak & Referensi Lain
- **Live URL (sejak 2026-07-03): https://azin-kun.github.io/SukarameApp/**
- Backend/Supabase project: `Sukarame/` (folder sebelah, jangan diubah kecuali memang perlu migration baru)
- Website lama (untuk referensi konten/desain): `SukarameWeb/`
- Memory project (Claude): `project_sukarame.md` — berisi ringkasan status semua sub-project client Sukarame
- GitHub Actions secrets (repo `Azin-kun/SukarameApp`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — dipakai `deploy.yml` saat build, wajib di-set ulang kalau anon key pernah di-rotate.

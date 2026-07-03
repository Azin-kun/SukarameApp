# Rebrand Tema Terang + Interaktif — Design Spec

**Tanggal**: 2026-07-03
**Status**: Disetujui, menunggu implementasi

## 1. Latar Belakang

Referensi warna: `SukarameApp/assets/banner.jfif` (poster promo "100 Porsi Mie Ayam Gratis di Opening") — merah `#D32F2F`, kuning-emas `#FFC107`, hitam, putih. Isi promo di banner (tanggal 31 Mei – 4 Juni 2026, syarat & ketentuan) **sudah lewat masa berlakunya** (hari ini 2026-07-03) dan **tidak** menjadi konten web — banner murni referensi warna/gaya.

Keputusan: ganti skema warna SukarameApp dari tema gelap (`#1A0A00`) yang sekarang jadi tema terang (background putih) secara permanen, mencakup **customer site DAN admin panel**, plus tambah sentuhan interaktif (micro-interaction, badge dinamis, feedback menu/cart) di seluruh app.

Arah gaya yang dipilih (dari 3 opsi mockup): **"Clean Light"** — putih bersih, merah/kuning-emas sebagai aksen di tombol & teks penting, banyak white space, bayangan tipis. (Bukan opsi "Bold Poster" yang meniru gaya stiker/outline tebal banner, dan bukan "Warm Cream" yang pakai background krem.)

Intensitas interaktif dikonfirmasi via demo live (hover/klik nyata di browser): tombol hover naik + bayangan + warna gelap, kartu hover terangkat + border kuning, tombol bulat (+/-) membesar & ganti warna saat hover, badge dengan kilau bergerak terus-menerus, toast konfirmasi muncul→hilang otomatis. Intensitas ini dikonfirmasi user sebagai "pas" — diterapkan seragam ke customer & admin, tidak dibuat lebih heboh atau lebih halus.

## 2. Cakupan

**Termasuk**: seluruh customer site (`/`, `/order`) DAN seluruh admin panel (`/admin/*`, 10 halaman + shell).
**Tidak termasuk**: konten promo banner (tanggal/syarat/kuota) tidak jadi section web. Struk cetak (`receiptPrint.css`) tidak berubah — sudah hardcode hitam-di-atas-putih terlepas dari tema, sudah benar untuk kertas thermal.

## 3. Token Warna Baru (`src/shared/theme.css` + `theme.ts`)

Token di-**rename** (bukan cuma ganti nilai) karena nama lama menyesatkan kalau nilainya dibalik total (mis. `--color-cream` bernilai hampir hitam tidak masuk akal untuk pembaca kode di masa depan).

| Token baru | Nilai baru | Token lama (dihapus) | Nilai lama |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | `--color-bg` | `#1A0A00` |
| `--color-surface` | `#FFFFFF` | `--color-surface` | `#3D1400` |
| `--color-surface-2` | `#F5F5F5` | `--color-surface-2` | `#5C2000` |
| `--color-red` | `#D32F2F` (tetap) | `--color-red` | `#D32F2F` |
| `--color-red-light` | `#FF5252` (tetap) | `--color-red-light` | `#FF5252` |
| `--color-red-dark` | `#B71C1C` (**baru**) | — | — |
| `--color-red-tint` | `rgba(211,47,47,.08)` | `--color-red-tint` | `rgba(211,47,47,.18)` |
| `--color-yellow` | `#FFC107` (tetap) | `--color-yellow` | `#FFC107` |
| `--color-yellow-light` | `#FFD54F` (tetap) | `--color-yellow-light` | `#FFD54F` |
| `--color-yellow-tint` | `rgba(255,193,7,.12)` | `--color-yellow-tint` | `rgba(255,193,7,.15)` |
| `--color-text` | `#1A1A1A` | `--color-cream` | `#FFF8F0` |
| `--color-text-muted` | `#6B6B6B` | `--color-cream-2` | `#FFE8D0` |
| `--color-border` | `#E5E5E5` | `--color-line` | `rgba(211,47,47,.28)` |
| `--color-border-strong` | `rgba(211,47,47,.3)` | `--color-line-2` | `rgba(255,193,7,.5)` |
| `--photo-text` (**baru**) | `#FFF8F0` | — | — |
| `--font-heading`, `--font-body`, `--ease` | tidak berubah | | |

`theme.ts` (`colors`/`fonts` export) di-update mengikuti tabel yang sama, dipakai di tempat yang butuh nilai tema di JS (cek pemakaian aktual saat implementasi — kalau ternyata tidak dipakai di mana pun, boleh dihapus, bukan dipertahankan tanpa alasan).

## 4. Pengecualian: Section Foto Full-Bleed di HomePage

`HomePage.css` punya 3 section dengan foto besar + gradient gelap transparan buat legibilitas teks: **Hero**, **Signature** (mie goreng pedas), **Carousel**. Gradient overlay-nya sudah hardcode `rgba(26,10,0,X)` (bukan lewat variable) — otomatis TETAP GELAP tanpa perlu diubah.

Yang PERLU diubah: teks di dalam 3 section itu (`.hero-tag`, `.hero-title`, `.hero-sub`, `.sig-price`, `.sig-name`, `.sig-desc`, `.car-dish-tag`, `.car-dish-name`, `.car-dish-desc`, dan sejenis) saat ini pakai alias `--crm`/`--cream` yang akan ikut jadi gelap kalau tidak dipisah — ganti referensinya ke token baru `--photo-text` (selalu krem/putih, tidak ikut tema) supaya tidak jadi teks gelap di atas foto gelap.

Section LAIN di HomePage (nav, Cerita/about, Menu Lengkap, Lokasi) full pakai token tema baru (putih + teks gelap), tidak ada pengecualian.

`OrderPage.css` tidak punya section foto sama sekali — pure ganti alias value, tidak ada pengecualian.

## 5. Sinkronisasi CMS Website (`website_theme` table)

HomePage fetch warna dari tabel `website_theme` (Supabase, fitur CMS Fase 5) lewat `useWebsiteContent.ts` → di-apply sebagai **inline style** (prioritas tertinggi, override CSS manapun). Baris yang sudah ter-seed di database masih nilai tema gelap lama.

**Wajib**: setelah kode di-deploy, baris `website_theme` di Supabase staging harus di-update ke nilai baru (lewat form admin **Pengaturan → Website** yang sudah ada, atau lewat migration/update singkat) — kalau tidak, homepage customer akan tetap tampil gelap (override CMS menang) padahal admin panel sudah terang. Ini keputusan/aksi terpisah yang perlu izin user saat dieksekusi (mengubah data live), dicatat di sini supaya tidak terlewat.

## 6. Pola Interaktif (berlaku sama di customer & admin)

Diterapkan sebagai aturan CSS konsisten pada elemen sejenis di semua file `.module.css`/`.css` yang relevan (tombol, kartu, badge, form control) — bukan komponen React baru, murni penambahan/penggantian rule CSS + sedikit JS untuk toast.

- **Tombol solid** (mis. `.payBtn`, `.saveBtn`, `.actionBtn`, `.submitBtn`): `transition: transform .15s, box-shadow .15s, background .2s`; hover → `background: var(--color-red-dark)`, `translateY(-2px)`, shadow lebih tebal; active/klik → `translateY(0) scale(.97)`.
- **Kartu/tile** (mis. `.tile` di PosPage, `.card` di TablesPage, `.sectionCard` di CMS): hover → `translateY(-4px)`, shadow lebih besar, `border-color: var(--color-yellow)`.
- **Tombol bulat qty** (`.qtyBtn`, `.add-btn`): hover → membesar (`scale(1.1–1.15)`) + ganti warna jadi merah; active → mengecil (`scale(.9)`).
- **Badge promo/status** (mis. badge status meja/booking, "Menu Terlaris"): tambah animasi kilau (`::after` pseudo-element, `linear-gradient` bergerak, `@keyframes shine`, loop terus-menerus 2.5–3 detik).
- **Toast/konfirmasi**: pola baru untuk aksi sukses singkat (mis. "Ditambahkan ke keranjang", "Tersimpan") — muncul dari bawah dengan fade+slide, hilang otomatis ~2 detik. Dipakai di titik-titik yang sudah ada state sukses tapi belum ada feedback visual jelas (cek per-halaman saat implementasi Fase B/C — tidak menambah fitur baru yang tidak diminta, cuma memperjelas feedback aksi yang sudah ada).

## 7. Audit Wajib: Hardcoded Warna Tanpa Variable

Beberapa file menulis warna teks redup langsung sebagai angka literal (pola: `rgba(255,248,240,.4)` s/d `.7`) alih-alih lewat variable — ini TIDAK ikut berubah otomatis walau token pusat diganti. Perlu dicari (`grep -rn "rgba(255,\s*248,\s*240"`) di seluruh `src/` dan diganti ke `var(--color-text-muted)` (dengan opacity yang setara kalau perlu) satu per satu, terutama di modul admin (Pos/Tables/Booking/Transactions/Reports/Stock/Staff/Shift/Settings) yang banyak memakai pola ini untuk label/subtitle redup.

## 8. Urutan Eksekusi (3 fase)

1. **Fase A — Design System**: token baru di `theme.css`/`theme.ts`, audit+ganti semua hardcode `rgba(255,248,240,X)`, definisikan pola interaktif (hover/press/badge-shine/toast) sebagai referensi yang dipakai konsisten di Fase B & C.
2. **Fase B — Customer Site**: `HomePage.css` (termasuk pemisahan `--photo-text` untuk 3 section foto) + `OrderPage.css`, terapkan pola interaktif ke tombol/kartu/badge di kedua halaman.
3. **Fase C — Admin**: `AdminLayout` + 10 halaman admin (Dashboard, POS, Checkout, Tables, Booking, Transactions, Reports, Stock, Staff, Shift, Settings+CMS) — verifikasi tema terang + terapkan pola interaktif yang sama.

Setiap fase diverifikasi visual (build + screenshot Playwright, desktop & mobile) sebelum lanjut ke fase berikutnya, mengikuti pola kerja yang sudah dipakai di seluruh sesi ini.

## 9. Kriteria Selesai

- Tidak ada lagi background gelap (`#1A0A00`/`#3D1400`/dst.) di customer maupun admin, KECUALI overlay foto Hero/Signature/Carousel yang memang sengaja dipertahankan gelap untuk legibilitas.
- Kontras teks-ke-background memenuhi keterbacaan wajar di semua halaman (teks gelap di atas putih, teks krem di atas foto gelap — tidak ada teks gelap di atas foto gelap atau teks terang di atas putih).
- Tombol, kartu, badge di customer & admin punya perilaku hover/klik yang konsisten sesuai Bagian 6.
- `npm run build` + `npm run lint` bersih di setiap fase.
- Baris `website_theme` di Supabase staging sudah disinkronkan (Bagian 5) sebelum dianggap selesai total — dicatat sebagai langkah terpisah yang butuh izin eksplisit.

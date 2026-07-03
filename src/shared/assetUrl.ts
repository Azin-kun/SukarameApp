// Vite tidak menulis-ulang string literal seperti src="/img/x.webp" saat build
// (hanya asset yang di-import lewat modul yang di-prefix `base` otomatis) — jadi
// referensi ke public/ lewat path absolut harus lewat helper ini supaya tetap
// benar saat di-deploy ke subpath GitHub Pages (lihat log.md Fase 7).
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

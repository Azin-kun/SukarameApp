// CMS website — fitur baru (tidak ada di Sukarame/app Flutter lama, lihat
// log.md). Skema tabel dari Sukarame/supabase/core/migrations/0008_core_website.sql.
export interface WebsiteSection {
  id: string
  branchId: string
  sectionKey: string
  title: string | null
  body: string | null
  imageUrl: string | null
  content: Record<string, unknown>
  sortOrder: number
}

export interface WebsiteTheme {
  branchId: string
  colorBackground: string | null
  colorSurface: string | null
  colorSurface2: string | null
  colorPrimary: string | null
  colorPrimary2: string | null
  colorText: string | null
  colorTextMuted: string | null
  colorLine: string | null
  colorTertiary: string | null
  headingFont: string | null
  bodyFont: string | null
  googleFontsUrl: string | null
}

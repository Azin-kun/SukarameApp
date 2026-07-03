import { useEffect, useState } from 'react'
import { supabase } from '../shared/supabaseClient'

// CMS: HomePage baca tabel yang sama yang diedit admin di
// /admin/settings (lihat src/admin/settings/WebsiteCmsPage.tsx), supaya
// perubahan konten/tema langsung tampil di sini. Anon-readable (RLS
// `anon_read_website`/`anon_read_theme`), tidak perlu login. Selalu ada
// fallback ke konten statis asli kalau fetch gagal/kosong — CMS ini murni
// progressive enhancement, bukan dependency keras untuk homepage tampil.
export interface WebsiteSectionContent {
  title: string | null
  body: string | null
  content: Record<string, unknown>
}

export interface WebsiteThemeColors {
  colorBackground: string | null
  colorSurface: string | null
  colorSurface2: string | null
  colorPrimary: string | null
  colorPrimary2: string | null
  colorText: string | null
  colorTextMuted: string | null
  colorLine: string | null
  colorTertiary: string | null
}

export function useWebsiteContent() {
  const [sections, setSections] = useState<Record<string, WebsiteSectionContent>>({})
  const [theme, setTheme] = useState<WebsiteThemeColors | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [sectionsRes, themeRes] = await Promise.all([
        supabase.from('website_sections').select('section_key, title, body, content'),
        supabase
          .from('website_theme')
          .select(
            'color_background, color_surface, color_surface_2, color_primary, color_primary_2, color_text, color_text_muted, color_line, color_tertiary',
          )
          .limit(1)
          .maybeSingle(),
      ])
      if (cancelled) return

      if (!sectionsRes.error && sectionsRes.data) {
        setSections(
          Object.fromEntries(
            sectionsRes.data.map((r) => [
              r.section_key,
              { title: r.title, body: r.body, content: (r.content as Record<string, unknown>) ?? {} },
            ]),
          ),
        )
      }

      if (!themeRes.error && themeRes.data) {
        const t = themeRes.data
        setTheme({
          colorBackground: t.color_background,
          colorSurface: t.color_surface,
          colorSurface2: t.color_surface_2,
          colorPrimary: t.color_primary,
          colorPrimary2: t.color_primary_2,
          colorText: t.color_text,
          colorTextMuted: t.color_text_muted,
          colorLine: t.color_line,
          colorTertiary: t.color_tertiary,
        })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { sections, theme }
}

export function themeToCssVars(theme: WebsiteThemeColors | null): Record<string, string> {
  if (!theme) return {}
  const map: Record<string, string | null> = {
    '--color-bg': theme.colorBackground,
    '--color-surface': theme.colorSurface,
    '--color-surface-2': theme.colorSurface2,
    '--color-red': theme.colorPrimary,
    '--color-red-light': theme.colorPrimary2,
    '--color-cream': theme.colorText,
    '--color-cream-2': theme.colorTextMuted,
    '--color-line': theme.colorLine,
    '--color-yellow': theme.colorTertiary,
  }
  return Object.fromEntries(Object.entries(map).filter(([, v]) => !!v)) as Record<string, string>
}

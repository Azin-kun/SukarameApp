import { useEffect, useState } from 'react'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'
import { useAuthStore } from '../auth/authStore'
import type { WebsiteSection, WebsiteTheme } from './cmsTypes'
import styles from './WebsiteCmsPage.module.css'

const THEME_COLOR_FIELDS: { key: keyof WebsiteTheme; label: string }[] = [
  { key: 'colorBackground', label: 'Background' },
  { key: 'colorSurface', label: 'Surface' },
  { key: 'colorSurface2', label: 'Surface 2' },
  { key: 'colorPrimary', label: 'Primary (Merah)' },
  { key: 'colorPrimary2', label: 'Primary Terang' },
  { key: 'colorText', label: 'Teks' },
  { key: 'colorTextMuted', label: 'Teks Redup' },
  { key: 'colorLine', label: 'Garis' },
  { key: 'colorTertiary', label: 'Tersier (Kuning)' },
]

export default function WebsiteCmsPage() {
  const branchId = useAuthStore((s) => s.branchId)
  const profile = useAuthStore((s) => s.profile)
  const [sections, setSections] = useState<WebsiteSection[]>([])
  const [theme, setTheme] = useState<WebsiteTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, { title: string; body: string; contentText: string }>>({})
  const [contentErrors, setContentErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!branchId) return
    async function load() {
      setLoading(true)
      setError(null)
      const [sectionsRes, themeRes] = await Promise.all([
        supabase
          .from('website_sections')
          .select('id, branch_id, section_key, title, body, image_url, content, sort_order')
          .eq('branch_id', branchId)
          .order('sort_order'),
        supabase
          .from('website_theme')
          .select(
            'branch_id, color_background, color_surface, color_surface_2, color_primary, color_primary_2, color_text, color_text_muted, color_line, color_tertiary, heading_font, body_font, google_fonts_url',
          )
          .eq('branch_id', branchId)
          .maybeSingle(),
      ])

      if (sectionsRes.error) {
        setError(getErrorMessage(sectionsRes.error))
      } else {
        const mapped: WebsiteSection[] = (sectionsRes.data ?? []).map((r) => ({
          id: r.id,
          branchId: r.branch_id,
          sectionKey: r.section_key,
          title: r.title,
          body: r.body,
          imageUrl: r.image_url,
          content: (r.content as Record<string, unknown>) ?? {},
          sortOrder: r.sort_order ?? 0,
        }))
        setSections(mapped)
        setSectionDrafts(
          Object.fromEntries(
            mapped.map((s) => [
              s.id,
              { title: s.title ?? '', body: s.body ?? '', contentText: JSON.stringify(s.content, null, 2) },
            ]),
          ),
        )
      }

      if (themeRes.error) {
        setError(getErrorMessage(themeRes.error))
      } else if (themeRes.data) {
        const t = themeRes.data
        setTheme({
          branchId: t.branch_id,
          colorBackground: t.color_background,
          colorSurface: t.color_surface,
          colorSurface2: t.color_surface_2,
          colorPrimary: t.color_primary,
          colorPrimary2: t.color_primary_2,
          colorText: t.color_text,
          colorTextMuted: t.color_text_muted,
          colorLine: t.color_line,
          colorTertiary: t.color_tertiary,
          headingFont: t.heading_font,
          bodyFont: t.body_font,
          googleFontsUrl: t.google_fonts_url,
        })
      }
      setLoading(false)
    }
    load()
  }, [branchId])

  async function saveSection(section: WebsiteSection) {
    const draft = sectionDrafts[section.id]
    if (!draft) return
    let parsedContent: Record<string, unknown>
    try {
      parsedContent = draft.contentText.trim() ? JSON.parse(draft.contentText) : {}
      setContentErrors((prev) => ({ ...prev, [section.id]: '' }))
    } catch {
      setContentErrors((prev) => ({ ...prev, [section.id]: 'JSON tidak valid' }))
      return
    }

    const { error } = await supabase
      .from('website_sections')
      .update({
        title: draft.title || null,
        body: draft.body || null,
        content: parsedContent,
        updated_at: new Date().toISOString(),
        updated_by_staff_id: profile?.id ?? null,
      })
      .eq('id', section.id)

    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setSavedMsg(`Section "${section.sectionKey}" tersimpan`)
    setTimeout(() => setSavedMsg(null), 2500)
  }

  async function saveTheme() {
    if (!theme || !branchId) return
    const { error } = await supabase
      .from('website_theme')
      .update({
        color_background: theme.colorBackground,
        color_surface: theme.colorSurface,
        color_surface_2: theme.colorSurface2,
        color_primary: theme.colorPrimary,
        color_primary_2: theme.colorPrimary2,
        color_text: theme.colorText,
        color_text_muted: theme.colorTextMuted,
        color_line: theme.colorLine,
        color_tertiary: theme.colorTertiary,
        heading_font: theme.headingFont,
        body_font: theme.bodyFont,
        google_fonts_url: theme.googleFontsUrl,
        updated_at: new Date().toISOString(),
        updated_by_staff_id: profile?.id ?? null,
      })
      .eq('branch_id', branchId)

    if (error) {
      setError(getErrorMessage(error))
      return
    }
    setSavedMsg('Tema website tersimpan')
    setTimeout(() => setSavedMsg(null), 2500)
  }

  if (loading) return <p>Memuat konten website...</p>

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}
      {savedMsg && <p className={styles.saved}>{savedMsg}</p>}

      <h2 className={styles.groupTitle}>Section Halaman Utama</h2>
      <p className={styles.hint}>
        Perubahan di sini langsung memengaruhi halaman <code>/</code> (HomePage) karena keduanya membaca tabel yang
        sama.
      </p>
      <div className={styles.sectionList}>
        {sections.map((s) => {
          const draft = sectionDrafts[s.id]
          if (!draft) return null
          return (
            <div className={styles.sectionCard} key={s.id}>
              <div className={styles.sectionKey}>{s.sectionKey}</div>
              <div className={styles.field}>
                <label>Judul</label>
                <input
                  value={draft.title}
                  onChange={(e) => setSectionDrafts((p) => ({ ...p, [s.id]: { ...p[s.id], title: e.target.value } }))}
                />
              </div>
              <div className={styles.field}>
                <label>Isi</label>
                <textarea
                  rows={2}
                  value={draft.body}
                  onChange={(e) => setSectionDrafts((p) => ({ ...p, [s.id]: { ...p[s.id], body: e.target.value } }))}
                />
              </div>
              <div className={styles.field}>
                <label>Data tambahan (JSON)</label>
                <textarea
                  rows={4}
                  className={styles.jsonArea}
                  value={draft.contentText}
                  onChange={(e) =>
                    setSectionDrafts((p) => ({ ...p, [s.id]: { ...p[s.id], contentText: e.target.value } }))
                  }
                />
                {contentErrors[s.id] && <p className={styles.fieldError}>{contentErrors[s.id]}</p>}
              </div>
              <button className={styles.saveBtn} onClick={() => saveSection(s)}>
                Simpan
              </button>
            </div>
          )
        })}
      </div>

      <h2 className={styles.groupTitle}>Tema Warna &amp; Font</h2>
      {theme && (
        <div className={styles.themeCard}>
          <div className={styles.themeGrid}>
            {THEME_COLOR_FIELDS.map((f) => (
              <div className={styles.field} key={f.key}>
                <label>{f.label}</label>
                <div className={styles.colorRow}>
                  <span className={styles.swatch} style={{ background: (theme[f.key] as string) || 'transparent' }} />
                  <input
                    value={(theme[f.key] as string) ?? ''}
                    onChange={(e) => setTheme((t) => (t ? { ...t, [f.key]: e.target.value } : t))}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.field}>
            <label>Font Heading</label>
            <input value={theme.headingFont ?? ''} onChange={(e) => setTheme((t) => (t ? { ...t, headingFont: e.target.value } : t))} />
          </div>
          <div className={styles.field}>
            <label>Font Body</label>
            <input value={theme.bodyFont ?? ''} onChange={(e) => setTheme((t) => (t ? { ...t, bodyFont: e.target.value } : t))} />
          </div>
          <div className={styles.field}>
            <label>Google Fonts URL</label>
            <input
              value={theme.googleFontsUrl ?? ''}
              onChange={(e) => setTheme((t) => (t ? { ...t, googleFontsUrl: e.target.value } : t))}
            />
          </div>
          <button className={styles.saveBtn} onClick={saveTheme}>
            Simpan Tema
          </button>
        </div>
      )}
    </div>
  )
}

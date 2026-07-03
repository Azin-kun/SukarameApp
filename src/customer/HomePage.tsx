import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'
import { menuCategories, type MenuCategoryKey } from './menuData'
import { formatRupiah } from '../shared/format'
import { useWebsiteContent, themeToCssVars } from './useWebsiteContent'

const WA_NUMBER = '6282220888139'
const SECTION_COUNT = 6

interface CarouselSlide {
  img: string
  alt: string
  tag: string
  name: React.ReactNode
  desc: string
  cta: { label: string; href: string; external?: boolean }
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    img: '/img/mie-ayam-original.webp',
    alt: 'Mie Ayam Original',
    tag: 'Menu Utama · Rp 10.000',
    name: 'Mie Ayam Original',
    desc: 'Mie kuning segar, ayam cincang berbumbu, dan kuah kaldu gurih yang dimasak perlahan. Pilihan klasik yang selalu memuaskan.',
    cta: { label: '🍜 Pesan Online', href: '/order' },
  },
  {
    img: '/img/mie-goreng-pedas.webp',
    alt: 'Mie Ayam Goreng Level 3-5',
    tag: 'Menu Andalan · Rp 15.000',
    name: (
      <>
        Mie Goreng
        <br />
        Level 3–5
      </>
    ),
    desc: 'Mie goreng kering, bumbu pedas kaya rempah, ayam juicy. Untuk yang berani — level 3 sampai 5. Siap?',
    cta: { label: '🔥 Pesan via WA', href: `https://wa.me/${WA_NUMBER}`, external: true },
  },
  {
    img: '/img/mie-ayam-bakso.webp',
    alt: 'Mie Ayam Bakso',
    tag: 'Menu Favorit · Rp 13.000',
    name: 'Mie Ayam Bakso',
    desc: 'Kombinasi mie ayam kuah gurih dan bakso sapi pilihan dalam satu mangkuk. Lebih kenyang, lebih puas.',
    cta: { label: '🥣 Pesan via WA', href: `https://wa.me/${WA_NUMBER}`, external: true },
  },
]

const NAV_LINKS: { label: string; sec: number }[] = [
  { label: 'Beranda', sec: 0 },
  { label: 'Cerita', sec: 1 },
  { label: 'Menu', sec: 3 },
  { label: 'Lokasi', sec: 5 },
]

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const carTrackRef = useRef<HTMLDivElement>(null)
  const lastYRef = useRef(0)

  const [navSolid, setNavSolid] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [activeFlags, setActiveFlags] = useState<boolean[]>(Array(SECTION_COUNT).fill(false))
  const [menuCat, setMenuCat] = useState<MenuCategoryKey>('mie')
  const [carIdx, setCarIdx] = useState(0)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const [miniMapUnlocked, setMiniMapUnlocked] = useState(false)

  function handleScroll() {
    const ct = scrollRef.current
    if (!ct) return
    const y = ct.scrollTop
    if (window.innerWidth > 900) {
      if (y > lastYRef.current + 30 && y > 120) setNavHidden(true)
      else if (y < lastYRef.current - 10) setNavHidden(false)
    }
    lastYRef.current = y
    setNavSolid(y > 60)

    let cur = 0
    const flags = sectionRefs.current.map((s, i) => {
      if (!s) return false
      const top = s.getBoundingClientRect().top
      if (top <= 80) cur = i
      return top <= 80 && top > -s.offsetHeight * 0.6
    })
    setActiveIdx(cur)
    setActiveFlags(flags)
  }

  useEffect(() => {
    handleScroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToSec(i: number) {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Carousel autoplay
  useEffect(() => {
    const id = setInterval(() => {
      setCarIdx((i) => (i + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const track = carTrackRef.current
    if (!track) return
    track.scrollTo({ left: carIdx * track.offsetWidth, behavior: 'smooth' })
  }, [carIdx])

  function handleCarScroll() {
    const track = carTrackRef.current
    if (!track) return
    const i = Math.round(track.scrollLeft / track.offsetWidth)
    if (i !== carIdx) setCarIdx(i)
  }

  // Lightbox: close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const mieItems = menuCategories.mie.items
  const gorengItems = menuCategories.goreng.items

  // CMS (src/admin/settings/WebsiteCmsPage.tsx) — fallback ke teks statis
  // asli kalau tabel kosong/fetch gagal, lihat useWebsiteContent.ts.
  const { sections: cms, theme: cmsTheme } = useWebsiteContent()
  const heroTag = cms.hero?.content?.tagline as string | undefined
  const heroSub = cms.hero?.body
  const aboutBody = cms.about?.body
  const hoursBody = cms.hours?.body
  const contactAddress = cms.contact?.body
  const contactWa = cms.contact?.content?.whatsapp as string | undefined
  const socialInstagramUrl = (cms.social?.content?.instagram as string | undefined) ?? 'https://www.instagram.com/mie_sukarame/'
  const socialWhatsappUrl = (cms.social?.content?.whatsapp as string | undefined) ?? `https://wa.me/${WA_NUMBER}`

  return (
    <div className="home-page" style={themeToCssVars(cmsTheme)}>
      {/* LIGHTBOX */}
      <div className={`lb${lightbox ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setLightbox(null)}>
        <span className="lb-close" onClick={() => setLightbox(null)}>
          ✕
        </span>
        {lightbox && <img src={lightbox.src} alt={lightbox.alt} />}
      </div>

      {/* NAV */}
      <nav className={`nav${navSolid ? ' solid' : ''}${navHidden ? ' hidden' : ''}`}>
        <a className="nav-brand" href="#" onClick={(e) => { e.preventDefault(); scrollToSec(0) }}>
          <img src="/img/logo.jpg" alt="Logo Mie Ayam Sukarame" />
          <span className="nav-brand-name">Mie Ayam</span>
          <span className="nav-brand-sub">Sukarame · Asli &amp; Segar</span>
        </a>
        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.sec}>
              <a href="#" onClick={(e) => { e.preventDefault(); scrollToSec(l.sec) }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link className="nav-wa" to="/order">
          Pesan Online
        </Link>
      </nav>

      {/* SIDE DOTS */}
      <div className="side-dots">
        {Array.from({ length: SECTION_COUNT }).map((_, i) => (
          <button
            key={i}
            className={`sd${activeIdx === i ? ' on' : ''}`}
            aria-label={`Ke bagian ${i + 1}`}
            onClick={() => scrollToSec(i)}
          />
        ))}
      </div>

      {/* SCROLL CONTAINER */}
      <div className="scroll-ct" ref={scrollRef} onScroll={handleScroll}>
        {/* 0: HERO */}
        <section
          className={`sec sec-hero${activeFlags[0] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[0] = el }}
        >
          <div className="hero-img">
            <img className="hero-video-blur" src="/img/hero.webp" alt="" aria-hidden="true" />
            <img className="hero-video-main" src="/img/hero.webp" alt="Semangkuk Mie Ayam Sukarame" />
          </div>
          <div className="hero-body">
            <div className="hero-tag">{heroTag ?? 'Warung Mie Legendaris · Sukarame'}</div>
            <h1 className="hero-title">
              Mie Ayam
              <br />
              <em>Sukarame</em>
            </h1>
            <p className="hero-sub">
              {heroSub ?? 'Cita rasa asli yang menggugah selera. Mie segar, kuah gurih, dan topping spesial yang bikin ketagihan.'}
            </p>
            <div className="hero-cta">
              <Link className="btn-solid" to="/order">
                Pesan Online
              </Link>
              <a className="btn-outline" href="#" onClick={(e) => { e.preventDefault(); scrollToSec(3) }}>
                Lihat Menu
              </a>
              <Link className="btn-solid btn-fullmenu-mobile" to="/order">
                Pesan Online
              </Link>
            </div>
          </div>
          <div className="hero-scroll">
            <span>Geser</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* 1: CERITA / ABOUT */}
        <section
          className={`sec sec-story${activeFlags[1] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[1] = el }}
        >
          <div className="story-right">
            <img
              className="story-img"
              src="/img/story-foto.webp"
              alt="Dapur Mie Ayam Sukarame"
              onClick={() => setLightbox({ src: '/img/story-foto.webp', alt: 'Dapur Mie Ayam Sukarame' })}
            />
          </div>
          <div className="story-left">
            <div className="ch-label">Cerita Kami</div>
            <h2 className="story-title">
              Asli &amp; Penuh
              <br />
              <em>Kenangan</em>
            </h2>
            <div className="story-body">
              {aboutBody ? (
                <p>{aboutBody}</p>
              ) : (
                <>
                  <p>
                    Mie Ayam Sukarame lahir dari semangat menyajikan mie ayam yang autentik — dibuat dari bahan segar
                    setiap hari, dengan kuah kaldu yang dimasak perlahan untuk mendapatkan cita rasa terbaik.
                  </p>
                  <p>
                    Dari satu gerobak kecil hingga warung yang kini menjadi tempat berkumpul keluarga dan sahabat, kami
                    berkomitmen menjaga kualitas di setiap mangkuk yang kami sajikan.
                  </p>
                </>
              )}
            </div>
            <div className="story-nums">
              <div>
                <div className="num-val">1+</div>
                <div className="num-lbl">Tahun Berdiri</div>
              </div>
              <div>
                <div className="num-val">13</div>
                <div className="num-lbl">Pilihan Menu</div>
              </div>
              <div>
                <div className="num-val">200+</div>
                <div className="num-lbl">Ulasan Bintang 5</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2: SIGNATURE — MIE GORENG LEVEL 3-5 */}
        <section
          className={`sec sec-sig sig-dark${activeFlags[2] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[2] = el }}
        >
          <div className="sig-photo right">
            <img
              src="/img/mie-goreng-pedas.webp"
              alt="Mie Ayam Goreng Level 3-5"
              onClick={() => setLightbox({ src: '/img/mie-goreng-pedas.webp', alt: 'Mie Ayam Goreng Level 3-5' })}
            />
          </div>
          <div className="sig-text from-left">
            <div className="ch-label">Andalan Kami</div>
            <div className="badge">Menu Terlaris</div>
            <div className="sig-price">Rp 15.000</div>
            <h2 className="sig-name">
              Mie Goreng
              <br />
              <em>Level 3–5</em>
            </h2>
            <p className="sig-desc">
              Mie goreng kering berbumbu pedas rempah kaya, topping ayam cincang juicy. Pilih level kepedasan sesuai
              nyali — dari 3 sampai 5. Satu porsi, tidak akan cukup.
            </p>
            <Link className="sig-wa" to="/order">
              Pesan Online →
            </Link>
          </div>
        </section>

        {/* 3: CAROUSEL MENU */}
        <section
          className={`sec sec-carousel${activeFlags[3] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[3] = el }}
        >
          <div className="car-header">
            <div className="ch-label">Pilihan Kami</div>
            <h2 className="car-title">
              Menu <em>Favorit</em>
            </h2>
          </div>
          <div className="car-track" ref={carTrackRef} onScroll={handleCarScroll}>
            {CAROUSEL_SLIDES.map((slide, i) => (
              <div className="car-slide" key={i}>
                <img src={slide.img} alt={slide.alt} />
                <div className="car-overlay" />
                <div className="car-info">
                  <div>
                    <div className="car-dish-tag">{slide.tag}</div>
                    <div className="car-dish-name">{slide.name}</div>
                    <div className="car-dish-desc">{slide.desc}</div>
                    {slide.cta.external ? (
                      <a className="car-wa" href={slide.cta.href} target="_blank" rel="noopener">
                        {slide.cta.label}
                      </a>
                    ) : (
                      <Link className="car-wa" to={slide.cta.href}>
                        {slide.cta.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="car-arr car-arr-l"
            aria-label="Sebelumnya"
            onClick={() => setCarIdx((i) => (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
          >
            &#8592;
          </button>
          <button
            className="car-arr car-arr-r"
            aria-label="Berikutnya"
            onClick={() => setCarIdx((i) => (i + 1) % CAROUSEL_SLIDES.length)}
          >
            &#8594;
          </button>
          <div className="car-nav">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`car-dot${carIdx === i ? ' on' : ''}`}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCarIdx(i)}
              />
            ))}
          </div>
        </section>

        {/* 4: FULL MENU */}
        <section
          className={`sec sec-menu${activeFlags[4] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[4] = el }}
        >
          <div className="menu-inner">
            <div className="menu-hd-label">Daftar Menu Lengkap</div>
            <h2 className="menu-hd-title">
              Menu <em>Kami</em>
            </h2>
            <div className="menu-tabs" role="tablist">
              {Object.entries(menuCategories).map(([key, cat]) => (
                <button
                  key={key}
                  className={`menu-tab${menuCat === key ? ' on' : ''}`}
                  role="tab"
                  onClick={() => setMenuCat(key as MenuCategoryKey)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={`menu-pane${menuCat === 'mie' ? ' on' : ''}`}>
              <div className="menu-grid">
                {mieItems.map((item) => (
                  <div className="menu-item" key={item.id}>
                    <div className="mi-photo">
                      <img
                        src={item.img}
                        alt={item.name}
                        onClick={() => setLightbox({ src: item.img!, alt: item.name })}
                      />
                    </div>
                    <div>
                      <div className="mi-name">{item.name}</div>
                      <div className="mi-desc">{item.desc}</div>
                      <div className="mi-foot">
                        <div className="mi-price">{formatRupiah(item.price)}</div>
                        <Link className="mi-order" to="/order">
                          Pesan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="menu-fill" />
              </div>
            </div>

            <div className={`menu-pane${menuCat === 'goreng' ? ' on' : ''}`}>
              <div className="menu-grid">
                {gorengItems.map((item) => (
                  <div className="menu-item" key={item.id}>
                    <div className="mi-photo">
                      <img
                        src={item.img}
                        alt={item.name}
                        onClick={() => setLightbox({ src: item.img!, alt: item.name })}
                      />
                    </div>
                    <div>
                      <div className="mi-name">{item.name}</div>
                      <div className="mi-desc">{item.desc}</div>
                      <div className="mi-foot">
                        <div className="mi-price">{formatRupiah(item.price)}</div>
                        <Link className="mi-order" to="/order">
                          Pesan
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="menu-fill" />
                <div className="menu-fill" />
              </div>
            </div>

            <div className={`menu-pane${menuCat === 'tambahan' ? ' on' : ''}`}>
              <div className="drinks-grid">
                <div className="drink-cat">
                  <div className="drink-cat-name">Tambahan</div>
                  {menuCategories.tambahan.items.map((item) => (
                    <div className="drink-row" key={item.id}>
                      <span>{item.name}</span>
                      <strong>{formatRupiah(item.price)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`menu-pane${menuCat === 'minuman' ? ' on' : ''}`}>
              <div className="drinks-grid">
                <div className="drink-cat">
                  <div className="drink-cat-name">Minuman</div>
                  {menuCategories.minuman.items.map((item) => (
                    <div className="drink-row" key={item.id}>
                      <span>{item.name}</span>
                      <strong>{formatRupiah(item.price)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ornament" style={{ marginTop: '3rem' }}>
              <span>Info</span>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-title">Jam Buka</div>
                <div className="info-copy">
                  {hoursBody ?? (
                    <>
                      Senin – Minggu
                      <br />
                      <strong style={{ color: 'var(--crm)' }}>07.00 – 18.00 WIB</strong>
                      <br />
                      <span style={{ color: 'rgba(255,248,240,.4)', fontSize: '.7rem' }}>(atau sampai habis)</span>
                    </>
                  )}
                </div>
              </div>
              <div className="info-card">
                <div className="info-title">Ikuti Kami</div>
                <div className="info-copy">Update menu &amp; promo terbaru</div>
                <div className="social-row">
                  <a className="social-btn" href={socialInstagramUrl} target="_blank" rel="noopener">
                    📸 Instagram
                  </a>
                  <a className="social-btn" href={socialWhatsappUrl} target="_blank" rel="noopener">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="foot-strip">
              <span>© 2025 Mie Ayam Sukarame</span>
              <Link to="/order">Pesan Online</Link>
            </div>
          </div>
        </section>

        {/* 5: LOKASI */}
        <section
          className={`sec sec-loc${activeFlags[5] ? ' active' : ''}`}
          ref={(el) => { sectionRefs.current[5] = el }}
        >
          <div className="loc-map">
            <iframe
              title="Lokasi Mie Ayam Sukarame"
              src="https://maps.google.com/maps?q=Jl.+Rindang+Tamantirto+Kasihan+Bantul+Yogyakarta&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="loc-text">
            <div className="ch-label">Temukan Kami</div>
            <h2 className="loc-title">
              Mie Ayam
              <br />
              <em>Sukarame</em>
            </h2>
            <div className="loc-row">
              <div className="loc-lbl">Alamat</div>
              <div className="loc-val">
                {contactAddress ?? (
                  <>
                    Jl. Rindang, Tamantirto, Kec. Kasihan,
                    <br />
                    Kab. Bantul, D.I. Yogyakarta 55184
                  </>
                )}
              </div>
            </div>
            <div className="loc-row">
              <div className="loc-lbl">Jam Buka</div>
              <div className="loc-val">{hoursBody ?? 'Senin – Minggu, 07.00 – 18.00 WIB'}</div>
              <div className="loc-badges">
                <span className="loc-badge">Buka Setiap Hari</span>
              </div>
            </div>
            <div className="loc-row">
              <div className="loc-lbl">Kontak</div>
              <div className="loc-val">WA: {contactWa ? `+${contactWa}` : '+62 822-2088-8139'}</div>
            </div>
            <div className="mini-map">
              <iframe
                title="Mini map"
                src="https://maps.google.com/maps?q=Jl.+Rindang+Tamantirto+Kasihan+Bantul+Yogyakarta&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ pointerEvents: miniMapUnlocked ? 'auto' : 'none' }}
              />
              {!miniMapUnlocked && (
                <div className="mini-map-overlay" onClick={() => setMiniMapUnlocked(true)}>
                  <span className="mini-map-pin">Buka Peta</span>
                </div>
              )}
            </div>
            <a className="btn-directions" href="https://maps.app.goo.gl/N6Ni8pnRMqnCt8YKA" target="_blank" rel="noopener">
              🗺 Petunjuk Arah
            </a>
            <a className="loc-wa" href={socialWhatsappUrl} target="_blank" rel="noopener">
              💬 Chat via WhatsApp
            </a>
          </div>
        </section>
      </div>

      {/* HALAL BADGE */}
      <div className="halal-footer">✓ HALAL</div>
    </div>
  )
}

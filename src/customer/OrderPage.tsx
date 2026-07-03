import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './OrderPage.css'
import { menuCategories, type MenuCategoryKey } from './menuData'
import { formatRupiah } from '../shared/format'
import { supabase } from '../shared/supabaseClient'

const WA_NUMBER = '6282220888139'

const ALL_ITEMS = Object.values(menuCategories).flatMap((c) => c.items)

interface CartLine {
  name: string
  price: number
  qty: number
}

export default function OrderPage() {
  const [activeCat, setActiveCat] = useState<MenuCategoryKey>('mie')
  const [cart, setCart] = useState<Record<string, CartLine>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [waUrl, setWaUrl] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cartCount = Object.values(cart).reduce((s, i) => s + i.qty, 0)
  const cartTotal = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }

  function addItem(id: string) {
    const item = ALL_ITEMS.find((i) => i.id === id)
    if (!item) return
    setCart((c) => {
      const existing = c[id]
      return { ...c, [id]: { name: item.name, price: item.price, qty: (existing?.qty || 0) + 1 } }
    })
  }

  function decItem(id: string) {
    setCart((c) => {
      const existing = c[id]
      if (!existing) return c
      const qty = existing.qty - 1
      if (qty <= 0) {
        const { [id]: _removed, ...rest } = c
        return rest
      }
      return { ...c, [id]: { ...existing, qty } }
    })
  }

  function openModal() {
    setModalOpen(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }
  function closeModal() {
    setModalOpen(false)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  async function handleSubmit() {
    const trimmedName = name.trim()
    const trimmedNote = note.trim()

    if (!trimmedName) {
      showToast('Nama harus diisi')
      nameInputRef.current?.focus()
      return
    }
    if (cartCount === 0) {
      showToast('Pilih menu dulu')
      return
    }

    setSubmitting(true)

    const itemsText = Object.values(cart)
      .map((i) => `• ${i.name} ×${i.qty} — ${formatRupiah(i.price * i.qty)}`)
      .join('\n')
    const totalText = formatRupiah(cartTotal)

    const waMsg = [
      'Halo Mie Ayam Sukarame! 🍜',
      '',
      `Nama: ${trimmedName}`,
      'Pesanan:',
      itemsText,
      '',
      `Total: ${totalText}`,
      trimmedNote ? `Catatan: ${trimmedNote}` : '',
      '',
      'Mohon konfirmasinya ya, terima kasih!',
    ]
      .filter(Boolean)
      .join('\n')

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`

    try {
      await supabase.rpc('create_web_order', {
        customer_name: trimmedName,
        items_text: itemsText,
        total_text: totalText,
        note: trimmedNote || null,
      })
    } catch {
      // notifikasi Telegram gagal tidak boleh memblok proses pesan pelanggan
    }

    closeModal()
    setWaUrl(url)
    setSuccessOpen(true)
    setSubmitting(false)
  }

  const cartLines = Object.values(cart)

  return (
    <div className="order-page">
      {/* TOAST */}
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      {/* SUCCESS SCREEN */}
      <div className={`success-screen${successOpen ? ' show' : ''}`}>
        <div className="success-icon">🍜</div>
        <h2 className="success-title">
          Pesanan
          <br />
          <em>Dikirim!</em>
        </h2>
        <p className="success-sub">
          Pesananmu sudah kami terima. Klik tombol di bawah untuk konfirmasi via WhatsApp — kami siapkan segera!
        </p>
        <a className="btn-wa" href={waUrl} target="_blank" rel="noopener">
          💬 Konfirmasi via WhatsApp
        </a>
        <Link className="btn-back-home" to="/">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* NAV */}
      <nav className="order-nav">
        <Link className="nav-back" to="/">
          ← Kembali
        </Link>
        <div className="order-nav-brand">Mie Ayam Sukarame</div>
      </nav>

      {/* HERO */}
      <div className="order-hero">
        <h1>
          Pesan
          <br />
          <em>Online</em>
        </h1>
        <p>Pilih menu favoritmu, isi nama, dan kami langsung konfirmasi via WhatsApp. Gratis ongkir, tinggal datang!</p>
      </div>

      {/* CATEGORY TABS */}
      <div className="cat-tabs">
        {Object.entries(menuCategories).map(([key, cat]) => (
          <button
            key={key}
            className={`cat-tab${activeCat === key ? ' on' : ''}`}
            onClick={(e) => {
              setActiveCat(key as MenuCategoryKey)
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MENU SECTIONS */}
      <div>
        {Object.entries(menuCategories).map(([key, cat]) => (
          <div className={`menu-section${activeCat === key ? '' : ' hidden'}`} key={key}>
            <div className="menu-section-title">{cat.label}</div>
            {cat.items.map((item) => {
              const qty = cart[item.id]?.qty || 0
              return (
                <div className="item-card" key={item.id}>
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    {item.desc && <div className="item-desc">{item.desc}</div>}
                    <div className="item-price">{formatRupiah(item.price)}</div>
                  </div>
                  <div className="qty-ctrl">
                    {qty === 0 ? (
                      <button className="qty-add" onClick={() => addItem(item.id)}>
                        + Tambah
                      </button>
                    ) : (
                      <>
                        <button className="qty-btn minus" onClick={() => decItem(item.id)}>
                          −
                        </button>
                        <span className="qty-num">{qty}</span>
                        <button className="qty-btn plus" onClick={() => addItem(item.id)}>
                          +
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* BOTTOM BAR */}
      <div className={`bottom-bar${cartCount > 0 ? ' show' : ''}`}>
        <div className="bottom-summary">
          <div className="bottom-count">{cartCount} item</div>
          <div className="bottom-total">{formatRupiah(cartTotal)}</div>
        </div>
        <button className="btn-pesan" onClick={openModal}>
          🍜 Lanjutkan Pesan
        </button>
      </div>

      {/* MODAL FORM */}
      <div className={`modal-overlay${modalOpen ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="modal">
          <span className="modal-drag" />
          <div className="modal-title">Konfirmasi Pesanan</div>
          <div className="modal-subtitle">Isi detail di bawah untuk menyelesaikan pemesanan</div>

          <div className="recap">
            {cartLines.map((line, i) => (
              <div className="recap-item" key={i}>
                <span>
                  {line.name} ×{line.qty}
                </span>
                <strong>{formatRupiah(line.price * line.qty)}</strong>
              </div>
            ))}
            <div className="recap-divider" />
            <div className="recap-total">
              <span>Total</span>
              <span className="recap-total-val">{formatRupiah(cartTotal)}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="inp-name">Nama *</label>
            <input
              type="text"
              id="inp-name"
              ref={nameInputRef}
              placeholder="Nama kamu"
              autoComplete="name"
              autoCapitalize="words"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="inp-note">Catatan (opsional)</label>
            <textarea
              id="inp-note"
              placeholder="Misal: tidak pakai kecap, kuah terpisah..."
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn-submit" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Memproses...' : '💬 Pesan via WhatsApp'}
          </button>
          <button className="btn-cancel" onClick={closeModal}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

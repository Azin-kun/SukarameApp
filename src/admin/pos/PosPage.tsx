import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../shared/supabaseClient'
import { formatRupiah } from '../../shared/format'
import { useCartStore, cartCount, cartTotal } from './cartStore'
import type { Category, CatalogItem } from './catalogTypes'
import styles from './PosPage.module.css'

export default function PosPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  const cartItems = useCartStore((s) => s.items)
  const add = useCartStore((s) => s.add)
  const remove = useCartStore((s) => s.remove)
  const count = cartCount(cartItems)
  const total = cartTotal(cartItems)

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from('categories').select('id, name, sort_order').order('sort_order')
      const { data: catalog } = await supabase
        .from('catalog_items')
        .select('id, category_id, name, price, is_active, photo_url')
        .eq('is_active', true)

      const mappedCats: Category[] = (cats ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sort_order ?? 0,
      }))
      const mappedItems: CatalogItem[] = (catalog ?? []).map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        price: Number(r.price),
        isActive: r.is_active ?? true,
        photoUrl: r.photo_url,
      }))

      setCategories(mappedCats)
      setItems(mappedItems)
      setActiveCat(mappedCats[0]?.id ?? null)
      setLoading(false)
    }
    load()
  }, [])

  const catalogForActiveCat = items.filter((i) => i.categoryId === activeCat)

  function qtyOf(itemId: string) {
    return cartItems.find((c) => c.item.id === itemId)?.qty ?? 0
  }

  if (loading) {
    return <p>Memuat katalog...</p>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kasir POS</h1>
        <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
          🛒 Keranjang{count > 0 ? ` (${count})` : ''}
        </button>
      </div>

      <div className={styles.tabs}>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.tab}${activeCat === c.id ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {catalogForActiveCat.map((item) => {
          const qty = qtyOf(item.id)
          return (
            <div className={styles.tile} key={item.id}>
              <div className={styles.tileInfo}>
                <div className={styles.tileName}>{item.name}</div>
                <div className={styles.tilePrice}>{formatRupiah(item.price)}</div>
              </div>
              <div className={styles.tileControls}>
                {qty > 0 && (
                  <>
                    <button className={styles.qtyBtn} onClick={() => remove(item.id)}>
                      −
                    </button>
                    <span className={styles.qtyNum}>{qty}</span>
                  </>
                )}
                <button className={styles.qtyBtn} onClick={() => add(item)}>
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {count > 0 && (
        <button className={styles.fab} onClick={() => setCartOpen(true)}>
          {count} item · {formatRupiah(total)}
        </button>
      )}

      {cartOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}>
          <div className={styles.sheet}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>Keranjang</h2>
            <div className={styles.sheetItems}>
              {cartItems.length === 0 ? (
                <p className={styles.empty}>Keranjang kosong</p>
              ) : (
                cartItems.map((c) => (
                  <div className={styles.sheetRow} key={c.item.id}>
                    <div>
                      <div className={styles.tileName}>{c.item.name}</div>
                      <div className={styles.tilePrice}>{formatRupiah(c.item.price)}</div>
                    </div>
                    <div className={styles.tileControls}>
                      <button className={styles.qtyBtn} onClick={() => remove(c.item.id)}>
                        −
                      </button>
                      <span className={styles.qtyNum}>{c.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => add(c.item)}>
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={styles.sheetTotal}>
              <span>Total</span>
              <strong>{formatRupiah(total)}</strong>
            </div>
            <button
              className={styles.payBtn}
              disabled={cartItems.length === 0}
              onClick={() => {
                setCartOpen(false)
                navigate('/admin/pos/checkout')
              }}
            >
              Lanjut Bayar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

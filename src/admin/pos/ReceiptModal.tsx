import { formatRupiah } from '../../shared/format'
import type { CartItem } from './catalogTypes'
import styles from './ReceiptModal.module.css'
import './receiptPrint.css'

const CLIENT_NAME = 'Mie Ayam Sukarame'

interface ReceiptModalProps {
  txnId: string
  items: CartItem[]
  total: number
  cashPaid?: number
  method: string
  onDone: () => void
}

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Port dari _buildReceiptText() di Sukarame/app/lib/widgets/receipt_dialog.dart
function buildReceiptText(items: CartItem[], total: number, method: string, cashPaid?: number): string {
  const now = formatDateTime(new Date())
  const lines = [
    `🍜 *${CLIENT_NAME}*`,
    `🕐 ${now}`,
    '─────────────────',
    ...items.map((ci) => `${ci.item.name} ×${ci.qty}  ${formatRupiah(ci.item.price * ci.qty)}`),
    '─────────────────',
    `*TOTAL: ${formatRupiah(total)}*`,
    `Bayar: ${method.toUpperCase()}`,
  ]
  if (cashPaid != null) {
    lines.push(`Tunai: ${formatRupiah(cashPaid)}`, `Kembali: ${formatRupiah(cashPaid - total)}`)
  }
  lines.push('─────────────────', 'Terima kasih! 🙏')
  return lines.join('\n')
}

export default function ReceiptModal({ items, total, cashPaid, method, onDone }: ReceiptModalProps) {
  const change = cashPaid != null ? cashPaid - total : null
  const now = formatDateTime(new Date())

  function shareWhatsApp() {
    const text = encodeURIComponent(buildReceiptText(items, total, method, cashPaid))
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.successHeader}>
          <span className={styles.checkIcon}>✓</span>
          <h2>Transaksi Berhasil</h2>
        </div>

        <div className={`receipt-print ${styles.receipt}`}>
          <p className={styles.receiptClient}>{CLIENT_NAME}</p>
          <p className={styles.receiptTime}>{now}</p>
          <div className={styles.receiptDivider} />
          {items.map((ci) => (
            <div className={styles.receiptRow} key={ci.item.id}>
              <span>
                {ci.item.name} ×{ci.qty}
              </span>
              <span>{formatRupiah(ci.item.price * ci.qty)}</span>
            </div>
          ))}
          <div className={styles.receiptDivider} />
          <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          {change != null && (
            <div className={styles.receiptRow}>
              <span>Kembalian</span>
              <span>{formatRupiah(change)}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.waBtn} onClick={shareWhatsApp}>
            💬 WhatsApp
          </button>
          <button className={styles.printBtn} onClick={() => window.print()}>
            🖨️ Cetak Struk
          </button>
          <button className={styles.doneBtn} onClick={onDone}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}

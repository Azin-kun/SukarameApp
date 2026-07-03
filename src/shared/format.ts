export function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Supabase/PostgrestError bukan instance `Error` bawaan JS, tapi selalu
// punya field `.message` string — cek itu dulu sebelum jatuh ke String(e)
// (yang menghasilkan "[object Object]" untuk error semacam itu).
export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return String(e)
}

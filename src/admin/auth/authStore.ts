import { create } from 'zustand'
import { supabase } from '../../shared/supabaseClient'
import { getErrorMessage } from '../../shared/errors'

// Port dari Sukarame/app/lib/providers/auth_provider.dart — state machine dan
// urutan panggilan (signIn -> verifyPin -> branches) dipertahankan persis.
export type AuthPhase = 'initial' | 'unauthenticated' | 'needsPin' | 'authenticated'

export interface StaffProfile {
  id: string
  userId: string
  displayName: string
  phone: string | null
  branchId: string | null
}

interface StaffRoleRow {
  branch_id: string
}

interface StaffProfileRow {
  id: string
  user_id: string
  display_name: string
  phone: string | null
  staff_roles: StaffRoleRow[] | null
}

interface AuthStore {
  phase: AuthPhase
  profile: StaffProfile | null
  branchId: string | null
  error: string | null
  init: () => void
  signIn: (email: string, password: string) => Promise<boolean>
  verifyPin: (pin: string) => Promise<boolean>
  changePin: (oldPin: string, newPin: string) => Promise<boolean>
  signOut: () => Promise<void>
}

let initialized = false

export const useAuthStore = create<AuthStore>((set, get) => ({
  phase: 'initial',
  profile: null,
  branchId: null,
  error: null,

  init: () => {
    if (initialized) return
    initialized = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ phase: session ? 'needsPin' : 'unauthenticated' })
    })

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ profile: null, branchId: null, phase: 'unauthenticated' })
      } else if (session && get().phase === 'unauthenticated') {
        set({ phase: 'needsPin' })
      }
    })
  },

  signIn: async (email, password) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: error.message })
      return false
    }
    set({ phase: 'needsPin' })
    return true
  },

  verifyPin: async (pin) => {
    set({ error: null })
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi tidak ditemukan')

      const { data: row, error: profileError } = await supabase
        .from('staff_profiles')
        .select('id, user_id, display_name, phone, staff_roles(branch_id)')
        .eq('user_id', user.id)
        .single<StaffProfileRow>()
      if (profileError) throw profileError

      const profile: StaffProfile = {
        id: row.id,
        userId: row.user_id,
        displayName: row.display_name,
        phone: row.phone,
        branchId: row.staff_roles?.[0]?.branch_id ?? null,
      }
      set({ profile })

      const { data: ok, error: rpcError } = await supabase.rpc('verify_pin', {
        p_staff_id: profile.id,
        p_pin: pin,
      })
      if (rpcError) throw rpcError
      if (!ok) {
        set({ error: 'PIN salah' })
        return false
      }

      const { data: branchRow, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .limit(1)
        .single<{ id: string }>()
      if (branchError) throw branchError

      set({ branchId: branchRow.id, phase: 'authenticated' })
      return true
    } catch (e) {
      set({ error: getErrorMessage(e) })
      return false
    }
  },

  changePin: async (oldPin, newPin) => {
    const profile = get().profile
    if (!profile) return false
    const { data: ok } = await supabase.rpc('verify_pin', { p_staff_id: profile.id, p_pin: oldPin })
    if (!ok) return false
    await supabase.rpc('set_pin', { p_staff_id: profile.id, p_pin: newPin })
    return true
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ phase: 'unauthenticated', profile: null, branchId: null })
  },
}))

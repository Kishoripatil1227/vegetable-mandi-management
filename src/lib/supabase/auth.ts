import { createClient } from './server'
import { supabaseAdmin } from './admin'

export type Role = 'admin' | 'staff' | 'customer'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabaseAdmin()
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) return null
  return { id: user.id, email: user.email!, name: profile.full_name as string | null, role: profile.role as Role }
}
 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireRole(['admin'])
  if (error) return error
  const db = supabaseAdmin()
  const [c, b] = await Promise.all([
    db.from('profiles').select('id,full_name').eq('role', 'customer'),
    db.from('buyers').select('id,name,phone,user_id'),
  ])
  if (c.error) return dbError(c.error.message)
  if (b.error) return dbError(b.error.message)
  return NextResponse.json({ customers: c.data, buyers: b.data })
}

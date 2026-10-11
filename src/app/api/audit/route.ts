 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireRole(['admin'])
  if (error) return error
  const { data, error: e } = await supabaseAdmin()
    .from('audit_logs')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (e) return dbError(e.message)
  return NextResponse.json(data)
}

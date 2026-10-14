 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error
  const { data, error: e } = await supabaseAdmin()
    .from('app_settings').select('value').eq('key', 'default_commission_percent').single()
  if (e) return dbError(e.message)
  return NextResponse.json({ default_commission_percent: Number(data.value) })
}

export async function PUT(req: Request) {
  const { user, error } = await requireRole(['admin'])
  if (error) return error
  const pct = Number((await req.json()).default_commission_percent)
  if (isNaN(pct) || pct < 0 || pct > 100)
    return NextResponse.json({ error: 'Commission must be between 0 and 100' }, { status: 400 })

  const { error: e } = await supabaseAdmin().from('app_settings')
    .update({ value: String(pct), updated_at: new Date().toISOString() })
    .eq('key', 'default_commission_percent')
  if (e) return dbError(e.message)
  await audit(user!.id, 'SETTINGS_UPDATE', 'app_settings', undefined, { pct })
  return NextResponse.json({ ok: true })
}

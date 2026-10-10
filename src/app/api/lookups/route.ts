 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const type = new URL(req.url).searchParams.get('type')
  const db = supabaseAdmin()
  let res

  switch (type) {
    case 'farmers':
      res = await db.from('farmers').select('id,name,phone').eq('status', 'active').order('name')
      break
    case 'buyers':
      res = await db.from('buyers').select('id,name,phone').eq('status', 'active').order('name')
      break
    case 'vegetables':
      res = await db.from('vegetables').select('id,name,unit').order('name')
      break
    case 'lots_received':
      res = await db.from('produce_lots')
        .select('id,lot_no,quantity,farmers(name),vegetables(name)')
        .eq('status', 'received').order('created_at', { ascending: false })
      break
    case 'lots_weighed':
      res = await db.from('produce_lots')
        .select('id,lot_no,farmers(name),vegetables(name),weighments(net_weight)')
        .eq('status', 'weighed').order('created_at', { ascending: false })
      break
    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (res.error) return dbError(res.error.message)
  return NextResponse.json(res.data)
}

import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error
  const { id } = await params
  const body = await req.json()

  if (body.phone && !/^[0-9]{10}$/.test(body.phone))
    return NextResponse.json({ error: 'Phone must be 10 digits' }, { status: 400 })

  const { data, error: e } = await supabaseAdmin()
    .from('farmers')
    .update({
      name: body.name,
      phone: body.phone,
      village: body.village,
      bank_account: body.bank_account,
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (e) return dbError(e.message)
  await audit(user!.id, 'UPDATE', 'farmers', id, body)
  return NextResponse.json(data)
}
import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

// 1. GET ALL FARMERS
export async function GET(req: Request) {
  try {
    const { user, error } = await requireRole(['admin', 'agent'])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = Number(searchParams.get('page') || '1')
    const size = 10

    const supabase = typeof supabaseAdmin === 'function' ? (supabaseAdmin as any)() : supabaseAdmin
    
    let q = supabase.from('farmers').select('*', { count: 'exact' })

    if (search) {
      q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const from = (page - 1) * size
    const to = from + size - 1

    const { data: farmers, count, error: dbErr } = await q
      .order('created_at', { ascending: false })
      .range(from, to)

    if (dbErr) return dbError(dbErr.message)

    return NextResponse.json({
      data: farmers,
      total: count || 0
    }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// 2. POST - CREATE NEW FARMER
export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole(['admin', 'agent'])
    if (error) return error

    const data = await req.json()
    const supabase = typeof supabaseAdmin === 'function' ? (supabaseAdmin as any)() : supabaseAdmin

    // Claude criteria sheet rule no 3 Validation (Phone digit check)
    if (data.phone && data.phone.length !== 10) {
      return NextResponse.json({ error: 'Phone must be 10 digits' }, { status: 400 })
    }

    const { data: newFarmer, error: dbErr } = await supabase
      .from('farmers')
      .insert([data])
      .select()
      .single()

    if (dbErr) return dbError(dbErr.message)

    await audit(user!.id, 'CREATE', 'farmers', newFarmer.id, data)

    return NextResponse.json({ data: newFarmer }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
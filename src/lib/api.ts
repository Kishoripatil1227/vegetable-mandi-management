import { NextResponse } from 'next/server'
import { getCurrentUser, Role } from './supabase/auth'
import { supabaseAdmin } from './supabase/admin'

// 1. Role Verification Helper
export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser()
  
  if (!user) {
    return { 
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
    }
  }
  
  if (!roles.includes(user.role)) {
    return { 
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) 
    }
  }
  
  return { user }
}

// 2. Audit Logging Helper
export async function audit(
  userId: string,
  action: string,
  table: string,
  recordId?: string,
  details?: object
) {
  const supabase = typeof supabaseAdmin === 'function' ? (supabaseAdmin as any)() : supabaseAdmin;
  
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    table_name: table,
    record_id: recordId,
    details,
  })
}

// 3. Database Error Parser Helper
export function dbError(message: string) {
  const duplicate = message.includes('duplicate key')
  return NextResponse.json(
    { error: duplicate ? 'Record already exists (duplicate phone)' : message },
    { status: duplicate ? 409 : 500 }
  )
}
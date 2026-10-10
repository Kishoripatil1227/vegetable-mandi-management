import { getCurrentUser } from '@/lib/supabase/auth'

export default async function Dashboard() {
  const user = await getCurrentUser()
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.name || user?.email}. Role: <b>{user?.role}</b></p>
    </div>
  )
}

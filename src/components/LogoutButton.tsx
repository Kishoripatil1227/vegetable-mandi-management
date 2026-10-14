 'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut()
        router.push('/login')
        router.refresh()
      }}
      className="bg-white text-green-700 px-3 py-1 rounded text-sm font-semibold"
    >
      Logout
    </button>
  )
}

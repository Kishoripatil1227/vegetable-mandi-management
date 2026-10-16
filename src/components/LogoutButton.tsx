'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  return (
    <button
      title="Sign out"
      aria-label="Sign out"
      onClick={async () => {
        await createClient().auth.signOut()
        router.push('/login')
        router.refresh()
      }}
      className="text-white text-lg px-2 hover:text-[#f0b429]"
    >
      ⎋
    </button>
  )
}
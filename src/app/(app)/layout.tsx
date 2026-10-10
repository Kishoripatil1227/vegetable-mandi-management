 import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import LogoutButton from '@/components/LogoutButton'

const links = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'staff', 'customer'] },
  { href: '/farmers', label: 'Farmers', roles: ['admin', 'staff'] },
  { href: '/buyers', label: 'Buyers', roles: ['admin', 'staff'] },
  { href: '/lots', label: 'Produce Lots', roles: ['admin', 'staff'] },
  { href: '/weighments', label: 'Weighment', roles: ['admin', 'staff'] },
  { href: '/auctions', label: 'Auction & Commission', roles: ['admin', 'staff'] },
  { href: '/settlements', label: 'Settlements', roles: ['admin', 'staff'] },
  { href: '/history', label: 'Search & History', roles: ['admin', 'staff', 'customer'] },
  { href: '/reports', label: 'Reports', roles: ['admin', 'staff'] },
  { href: '/settings', label: 'Profile / Settings', roles: ['admin', 'staff', 'customer'] },
  { href: '/roles', label: 'Role Management', roles: ['admin'] },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 bg-green-800 text-white p-4 space-y-1">
        <h2 className="font-bold text-lg mb-4">🥬 Mandi Agent</h2>
        {links.filter((l) => l.roles.includes(user.role)).map((l) => (
          <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-green-700">
            {l.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 bg-gray-50">
        <header className="flex justify-between items-center bg-green-700 text-white px-6 py-3">
          <span>{user.name || user.email} ({user.role})</span>
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

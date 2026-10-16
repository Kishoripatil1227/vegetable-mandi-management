import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import LogoutButton from '@/components/LogoutButton'
import NavLinks from '@/components/NavLinks'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'staff', 'customer'] },
  { href: '/farmers', label: 'Farmers', icon: '🧑‍🌾', roles: ['admin', 'staff'] },
  { href: '/buyers', label: 'Buyers', icon: '🛒', roles: ['admin', 'staff'] },
  { href: '/lots', label: 'Produce Lots', icon: '📦', roles: ['admin', 'staff'] },
  { href: '/weighments', label: 'Weighment', icon: '⚖️', roles: ['admin', 'staff'] },
  { href: '/auctions', label: 'Auction & Commission', icon: '🔨', roles: ['admin', 'staff'] },
  { href: '/settlements', label: 'Settlements', icon: '💰', roles: ['admin', 'staff'] },
  { href: '/history', label: 'Search & History', icon: '🔍', roles: ['admin', 'staff'] },
  { href: '/reports', label: 'Reports', icon: '📊', roles: ['admin', 'staff'] },
  { href: '/settings', label: 'Profile / Settings', icon: '⚙️', roles: ['admin', 'staff', 'customer'] },
  { href: '/roles', label: 'Role Management', icon: '🔐', roles: ['admin'] },
  { href: '/customer-links', label: 'Customer Link', icon: '🔗', roles: ['admin'] },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const items = links.filter((l) => l.roles.includes(user.role))
  const initial = (user.name || user.email)[0].toUpperCase()

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-64 md:min-h-screen bg-gradient-to-b from-green-800 to-green-900 text-white p-4 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="flex items-center gap-2 px-2 mb-6">
          <span className="text-2xl">🥬</span>
          <div>
            <p className="font-bold leading-tight">Mandi Agent</p>
            <p className="text-xs text-green-200">Vegetable Mandi System</p>
          </div>
        </div>
        <NavLinks items={items} />
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex justify-between items-center bg-white/90 backdrop-blur border-b px-6 py-3">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user.name || user.email}</p>
              <p className="text-xs text-green-700 capitalize">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
              {initial}
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
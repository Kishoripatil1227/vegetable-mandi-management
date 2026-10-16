import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import LogoutButton from '@/components/LogoutButton'
import NavLinks, { NavGroup } from '@/components/NavLinks'

type L = { href: string; label: string; icon: string; roles: string[] }

const groups: { label: string; items: L[] }[] = [
  {
    label: 'Workflow',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⌂', roles: ['admin', 'staff', 'customer'] },
      { href: '/farmers', label: 'Farmers', icon: '♙', roles: ['admin', 'staff'] },
      { href: '/buyers', label: 'Buyers', icon: '◫', roles: ['admin', 'staff'] },
      { href: '/lots', label: 'Produce lots', icon: '▦', roles: ['admin', 'staff'] },
      { href: '/weighments', label: 'Weighments', icon: '⚖', roles: ['admin', 'staff'] },
      { href: '/auctions', label: 'Auction and commission', icon: '₹', roles: ['admin', 'staff'] },
      { href: '/settlements', label: 'Settlements', icon: '✓', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/history', label: 'Search and history', icon: '⌕', roles: ['admin', 'staff'] },
      { href: '/reports', label: 'Reports', icon: '▥', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/roles', label: 'Role management', icon: '◇', roles: ['admin'] },
      { href: '/customer-links', label: 'Customer link', icon: '⇄', roles: ['admin'] },
      { href: '/settings', label: 'Profile and settings', icon: '⚙', roles: ['admin', 'staff', 'customer'] },
    ],
  },
]

const roleLabel: Record<string, string> = {
  admin: 'Admin / Owner',
  staff: 'Staff / Operator',
  customer: 'Customer',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const navGroups: NavGroup[] = groups
    .map((g) => ({
      label: g.label,
      items: g.items
        .filter((i) => i.roles.includes(user.role))
        .map(({ href, label, icon }) => ({ href, label, icon })),
    }))
    .filter((g) => g.items.length > 0)

  const display = user.name || user.email
  const initials = display
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="bg-[#0d3822] text-[#e8f3ec] px-4 py-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex flex-col gap-3">
        <div className="flex items-center gap-3 px-1">
          <span className="w-10 h-10 rounded-xl bg-[#f0b429] text-[#0d3822] grid place-items-center font-display font-extrabold">VM</span>
          <strong className="font-display leading-tight">Vegetable Mandi Agent</strong>
        </div>

        <NavLinks groups={navGroups} />

        <div className="mt-auto flex items-center gap-3 bg-white/10 rounded-xl p-3">
          <span className="w-9 h-9 rounded-full bg-[#f0b429] text-[#0d3822] grid place-items-center font-bold text-sm shrink-0">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{display}</p>
            <p className="text-xs text-[#9dbfaa]">{roleLabel[user.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f1f4f0]/95 backdrop-blur border-b border-[#dce3dc] px-6 py-3">
          <p className="text-sm text-[#5d6f64]">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <span className="bg-[#e3f1e8] text-[#197a45] font-semibold text-sm px-3 py-1 rounded-full">
            {roleLabel[user.role]}
          </span>
        </header>
        <main className="p-4 md:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}
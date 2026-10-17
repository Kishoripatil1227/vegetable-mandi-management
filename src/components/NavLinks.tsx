'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = { href: string; label: string; icon: string }
export type NavGroup = { label: string; items: NavItem[] }

export default function NavLinks({ groups }: { groups: NavGroup[] }) {
  const path = usePathname()
  return (
    <nav className="flex flex-col">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-xs font-semibold text-[#7fa68d] mt-5 mb-1 px-3">{g.label}</p>
          {g.items.map((l) => {
            const active = path === l.href || path.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active ? 'bg-white/15 text-white font-semibold' : 'text-[#bcd6c5] hover:bg-white/10'
                }`}
              >
                {active && <span className="absolute -left-4 top-2 bottom-2 w-1 rounded-r bg-[#f0b429]" />}
                <span className="w-5 text-center text-base">{l.icon}</span>
                {l.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
 const map: Record<string, string> = {
  received: 'bg-amber-100 text-amber-800',
  weighed: 'bg-blue-100 text-blue-800',
  auctioned: 'bg-purple-100 text-purple-800',
  settled: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-200 text-gray-700',
}

export default function StatusBadge({ s }: { s?: string | null }) {
  if (!s) return null
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[s] || 'bg-gray-100 text-gray-700'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s}
    </span>
  )
}

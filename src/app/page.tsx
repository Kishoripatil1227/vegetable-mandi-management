import Link from 'next/link'

const features = [
  { icon: '▦', t: 'Lot intake', d: 'Receive new produce from farmers and generate a unique lot number automatically.' },
  { icon: '⚖', t: 'Weighment', d: 'Record gross and tare weight. Net weight is calculated and validated for you.' },
  { icon: '₹', t: 'Auction and price', d: 'Enter the price a buyer pays and see the total instantly.' },
  { icon: '％', t: 'Commissions', d: 'Calculate the agent commission with a configurable default rate.' },
  { icon: '✓', t: 'Settlements', d: 'Pay farmers their net amount. Only an admin can finalize a payment.' },
  { icon: '▥', t: 'Reports and analytics', d: 'Search records, review totals and track daily mandi rates.' },
]

const steps = [
  ['1', 'Lot intake'],
  ['2', 'Weighment'],
  ['3', 'Auction'],
  ['4', 'Commission'],
  ['5', 'Settlement'],
]

const roles = [
  ['Admin / Owner', 'Full access. Finalizes payments, manages users, rates and settings.'],
  ['Staff / Operator', 'Daily entries for farmers, lots, weighments and auctions. Cannot finalize payments.'],
  ['Customer', 'Views their own purchases and rate details.'],
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f1f4f0] text-[#14231b]">
      <header className="sticky top-0 z-30 bg-[#0d3822] text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#f0b429] text-[#0d3822] grid place-items-center font-display font-extrabold">VM</span>
            <strong className="font-display text-lg">Vegetable Mandi Agent</strong>
          </a>
          <nav className="hidden md:flex gap-8 text-sm text-[#bcd6c5]">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#roles" className="hover:text-white">Roles</a>
          </nav>
          <Link href="/login" className="bg-[#f0b429] hover:bg-[#e0a51f] text-[#0d3822] px-5 py-2 rounded-lg text-sm font-bold">
            Sign in
          </Link>
        </div>
      </header>

      <section id="top" className="bg-[#0d3822] text-white">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] max-w-3xl">
            Every lot, from the gate to the farmer&apos;s payment.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-[#bcd6c5] max-w-2xl">
            Receive, weigh, price, take commission and settle in one place, instead of five registers.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="bg-[#f0b429] hover:bg-[#e0a51f] text-[#0d3822] px-7 py-3 rounded-lg font-bold">
              Get started
            </Link>
            <a href="#workflow" className="border border-white/30 hover:bg-white/10 px-7 py-3 rounded-lg font-semibold">
              See the workflow
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold">Everything a mandi agent needs</h2>
        <p className="mt-2 text-[#5d6f64]">One searchable system with a clear record of every change.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.t} className="bg-white border border-[#dce3dc] rounded-xl p-6 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-lg bg-[#e3f1e8] text-[#197a45] grid place-items-center text-xl font-bold mb-4">{f.icon}</div>
              <h3 className="font-display text-lg font-bold">{f.t}</h3>
              <p className="text-sm text-[#5d6f64] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="bg-white border-y border-[#dce3dc]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">The workflow</h2>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-5 gap-4">
            {steps.map(([n, t]) => (
              <div key={n} className="border-b-4 border-[#197a45] bg-[#f1f4f0] rounded-t-lg p-4 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#197a45] text-white grid place-items-center text-sm font-bold">{n}</span>
                <span className="font-display font-bold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold">Built for three kinds of users</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {roles.map(([t, d]) => (
            <div key={t} className="bg-white border border-[#dce3dc] rounded-xl p-6">
              <span className="inline-block bg-[#e3f1e8] text-[#197a45] text-sm font-semibold px-3 py-1 rounded-full">{t}</span>
              <p className="text-sm text-[#5d6f64] mt-3">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-[#0d3822] rounded-2xl p-10 md:p-14 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">Ready to run your mandi from one place?</h2>
          <Link href="/login" className="inline-block mt-7 bg-[#f0b429] hover:bg-[#e0a51f] text-[#0d3822] px-8 py-3 rounded-lg font-bold">
            Sign in
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#dce3dc] py-8 text-center text-sm text-[#5d6f64]">
        Vegetable Mandi Agent · Full Stack Internship Project · Next.js, Supabase and Vercel
      </footer>
    </div>
  )
}
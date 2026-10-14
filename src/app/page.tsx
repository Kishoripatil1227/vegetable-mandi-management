import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-green-50">
      <header className="flex items-center justify-between px-8 py-4 bg-green-700 text-white">
        <h1 className="text-xl font-bold">🥬 Vegetable Mandi Agent</h1>
        <Link href="/login" className="bg-white text-green-700 px-4 py-2 rounded font-semibold">Login</Link>
      </header>
      <section className="max-w-4xl mx-auto text-center py-20 px-6">
        <h2 className="text-4xl font-bold text-green-900">Mandi Management, ek jagi</h2>
        <p className="mt-4 text-gray-700">
          Farmer lot intake, weighment, auction, commission ani farmer payment, sagla ek searchable system madhe.
        </p>
        <Link href="/login" className="inline-block mt-8 bg-green-700 text-white px-6 py-3 rounded-lg text-lg">
          Get Started
        </Link>
      </section>
      <section className="max-w-5xl mx-auto grid md:grid-cols-4 gap-4 px-6 pb-20 text-center">
        {['Lot Intake', 'Weighment', 'Auction & Commission', 'Farmer Settlement'].map((t) => (
          <div key={t} className="bg-white rounded-lg shadow p-6 font-semibold text-green-800">{t}</div>
        ))}
      </section>
    </main>
  )
}
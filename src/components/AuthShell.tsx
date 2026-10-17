import Link from 'next/link'

const slips = [
  { c: '#d6452d', v: 'Tomato', f: 'Ramesh Patil', l: 'L-1001', kg: '1,200 kg', rot: '-rotate-2', ml: '' },
  { c: '#9b4f96', v: 'Onion', f: 'Sunita Devi', l: 'L-1002', kg: '2,050 kg', rot: 'rotate-1', ml: 'ml-9' },
  { c: '#b08a4f', v: 'Potato', f: 'Mahesh Gowda', l: 'L-1003', kg: '1,800 kg', rot: '-rotate-1', ml: '' },
]

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
        <div className="min-h-screen grid md:grid-cols-[1.15fr_1fr] bg-[#f1f4f0]">
      <section className="bg-[#0d3822] text-white px-8 py-10 md:px-14 md:py-12 flex flex-col justify-between gap-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#f0b429] text-[#0d3822] grid place-items-center font-display font-extrabold">VM</span>
          <strong className="font-display text-lg">Vegetable Mandi Agent</strong>
        </Link>
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.05] max-w-[15ch]">
            Every lot, from the gate to the farmer&apos;s payment.
          </h1>
          <p className="mt-4 text-lg text-[#bcd6c5] max-w-[40ch]">
            Receive, weigh, price, take commission and settle in one place, instead of five registers.
          </p>
        </div>
        <div className="hidden md:grid gap-3 max-w-[340px]">
          {slips.map((s) => (
            <div key={s.l} className={`relative bg-white text-[#14231b] rounded-md py-2.5 pl-5 pr-4 shadow ${s.rot} ${s.ml}`}>
              <span className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-md" style={{ background: s.c }} />
              <b className="font-display block">{s.v}</b>
              <span className="block text-sm text-[#5d6f64]">{s.f}</span>
              <small className="text-xs text-[#5d6f64] mr-3">{s.l}</small>
              <small className="text-xs text-[#5d6f64]">{s.kg}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="grid place-items-center p-6">{children}</section>
    </div>
  )
}
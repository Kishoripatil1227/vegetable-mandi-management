'use client'

export default function LogoutButton() {
  return (
    <button
      title="Sign out"
      aria-label="Sign out"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        window.location.href = '/login'
      }}
      className="text-white text-lg px-2 hover:text-[#f0b429]"
    >
      ⎋
    </button>
  )
}
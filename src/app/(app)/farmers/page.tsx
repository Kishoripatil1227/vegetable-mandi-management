import MasterPage from '@/components/MasterPage'

export default function FarmersPage() {
  return (
    <MasterPage
      title="Farmer"
      endpoint="/api/farmers"
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'phone', label: 'Phone (10 digits)', required: true },
        { key: 'village', label: 'Village' },
        { key: 'bank_account', label: 'Bank Account' },
      ]}
    />
  )
}
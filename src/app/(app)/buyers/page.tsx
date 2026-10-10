import MasterPage from '@/components/MasterPage'

export default function BuyersPage() {
  return (
    <MasterPage
      title="Buyer"
      endpoint="/api/buyers"
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'phone', label: 'Phone (10 digits)', required: true },
      ]}
    />
  )
}
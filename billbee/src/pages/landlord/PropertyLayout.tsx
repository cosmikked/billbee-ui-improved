import { useState } from 'react'
import { useParams, useNavigate, Outlet } from 'react-router-dom'
import { Pencil, Archive, Plus } from 'lucide-react'
import { MOCK_PROPERTIES, MOCK_PROPERTY_HUB } from '../../data/mock'
import { EditPropertyDrawer } from './EditPropertyDrawer'
import { PageHead } from '../../components/ui/PageHead'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TabNav } from '../../components/ui/TabNav'
import type { Property } from '../../types/properties'

export interface PropertyLayoutContext {
  property: Property
}

export function PropertyLayout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [property, setProperty] = useState<Property>(
    MOCK_PROPERTIES.find(p => p.id === id) ?? MOCK_PROPERTIES[0],
  )
  const [editOpen, setEditOpen] = useState(false)
  const { cycle, nextBillingIn } = MOCK_PROPERTY_HUB

  const tabs = [
    { label: 'Overview', href: `/landlord/properties/${property.id}`,          end: true },
    { label: 'Charges',  href: `/landlord/properties/${property.id}/charges`             },
    { label: 'Rooms',    href: `/landlord/properties/${property.id}/rooms`                },
    { label: 'Tenants',  href: `/landlord/properties/${property.id}/tenants`              },
    // { label: 'Bills',    href: `/landlord/properties/${property.id}/bills`,   count: '11 mar' },
  ]

  return (
    <main className="px-8 pt-4 pb-16 max-w-[1320px] mx-auto w-full">

      {/* Page head */}
      <PageHead
        className="mb-0"
        title={
          <span className="inline-flex items-center gap-2 flex-wrap leading-normal">
            {property.name}
            <StatusBadge status={property.status} />
          </span>
        }
        subtitle={`Billing day every ${property.billingDay}th · Next in ${nextBillingIn} days`}
        actions={
          <>
            <Button variant="default" onClick={() => setEditOpen(true)}>
              <Pencil size={13} strokeWidth={1.75} />
              Edit property
            </Button>
            <Button variant="default">
              <Archive size={13} strokeWidth={1.75} />
              Archive
            </Button>
            <Button variant="accent" onClick={() => navigate(cycle.generateBillsUrl)}>
              <Plus size={14} strokeWidth={2} />
              Generate {cycle.label} Bills
            </Button>
          </>
        }
      />

      {/* Tab nav */}
      <TabNav tabs={tabs} className="mt-5 mb-6" />

      {/* Tab content */}
      <Outlet context={{ property } satisfies PropertyLayoutContext} />

      <EditPropertyDrawer
        property={editOpen ? property : null}
        onClose={() => setEditOpen(false)}
        onSave={updated => { setProperty(updated); setEditOpen(false) }}
      />
    </main>
  )
}

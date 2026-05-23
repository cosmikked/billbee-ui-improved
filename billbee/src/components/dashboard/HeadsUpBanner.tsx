import { Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Callout } from '../ui/Callout'
import { Button } from '../ui/Button'

interface HeadsUpBannerProps {
  propertyName: string
  cycleUrl: string
}

export function HeadsUpBanner({ propertyName, cycleUrl }: HeadsUpBannerProps) {
  const navigate = useNavigate()

  return (
    <Callout
      variant="accent"
      className="mb-6"
      icon={<Clock size={18} strokeWidth={1.75} />}
      action={
        <Button variant="primary" size="sm" onClick={() => navigate(cycleUrl)}>
          Start prep
          <ArrowRight size={14} strokeWidth={1.75} />
        </Button>
      }
    >
      <strong className="text-ink font-semibold">Heads up.</strong>{' '}
      {propertyName} bills on the 15th. Prep tenants &amp; non-fixed charges before then.
    </Callout>
  )
}

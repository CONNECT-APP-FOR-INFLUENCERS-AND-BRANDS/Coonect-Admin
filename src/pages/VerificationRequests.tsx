import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_BRAND_VERIFICATION_REQUESTS_QUERY, REVIEW_BRAND_VERIFICATION_MUTATION } from '@/lib/queries'
import type { Brand } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState, EmptyState } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'
import { Check, ExternalLink, X } from 'lucide-react'

interface Data {
  getAdminBrandVerificationRequests: Brand[]
}

export function VerificationRequests() {
  const { data, loading, error, refetch } = useAdminQuery<Data>(ADMIN_BRAND_VERIFICATION_REQUESTS_QUERY, { status: 'PENDING' })

  if (loading) return <FullPageSpinner />
  if (error) return <ErrorState message={error} />

  const requests = data?.getAdminBrandVerificationRequests ?? []

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Verification Requests</h1>
        <p className="text-sm text-muted-foreground">
          Review a brand's submitted GST/business-registration document. Approving grants the verified badge shown to
          influencers.
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState message="No pending verification requests." />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((b) => (
            <RequestCard key={b.id} brand={b} onResolved={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ brand, onResolved }: { brand: Brand; onResolved: () => void }) {
  const [adminNote, setAdminNote] = useState('')
  const [resolving, setResolving] = useState(false)
  const request = brand.verificationRequest!

  async function resolve(approve: boolean) {
    setResolving(true)
    try {
      await gqlRequest(REVIEW_BRAND_VERIFICATION_MUTATION, { brandId: brand.id, approve, adminNote: adminNote || null })
      onResolved()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve request')
      setResolving(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/brands/${brand.id}`} className="font-medium hover:underline">
              {brand.name}
            </Link>
            <div className="text-sm text-muted-foreground">{brand.email}</div>
          </div>
          <Badge tone="accent">{request.method.replaceAll('_', ' ')}</Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {request.gstNumber && (
            <div>
              <div className="text-xs text-muted-foreground">GSTIN</div>
              <div className="font-mono">{request.gstNumber}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground">Submitted</div>
            <div>{formatDateTime(request.submittedAt)}</div>
          </div>
          {request.documentUrl && (
            <a
              href={request.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 self-end text-sm font-medium text-primary hover:underline"
            >
              View document <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Textarea
            placeholder="Note for the record (shown to the brand if rejected)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={1}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button variant="success" size="sm" onClick={() => resolve(true)} disabled={resolving}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => resolve(false)} disabled={resolving}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

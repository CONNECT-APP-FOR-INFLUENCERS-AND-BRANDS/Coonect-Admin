import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_BRAND_BY_ID_QUERY, DELETE_BRAND_MUTATION } from '@/lib/queries'
import type { Brand } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, ExternalLink } from 'lucide-react'

interface Data {
  getBrandById: Brand
}

export function BrandDetail({ asModal = false }: { asModal?: boolean }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useAdminQuery<Data>(ADMIN_BRAND_BY_ID_QUERY, { id }, [id])
  const [deleting, setDeleting] = useState(false)

  const close = () => navigate(-1)

  async function handleDelete() {
    if (!id || !data) return
    if (!confirm(`Permanently delete "${data.getBrandById.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await gqlRequest(DELETE_BRAND_MUTATION, { id })
      navigate('/brands', { replace: true })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete brand')
      setDeleting(false)
    }
  }

  const body = loading ? (
    <FullPageSpinner />
  ) : error || !data ? (
    <ErrorState message={error ?? 'Brand not found'} />
  ) : (
    <BrandCard brand={data.getBrandById} deleting={deleting} onDelete={handleDelete} onClose={close} />
  )

  if (asModal) {
    return (
      <Dialog open onClose={close} className="max-w-[560px] p-7">
        {body}
      </Dialog>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/brands"
        className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
      </Link>
      <div className="mx-auto w-full max-w-[560px]">{body}</div>
    </div>
  )
}

function BrandCard({ brand, deleting, onDelete, onClose }: { brand: Brand; deleting: boolean; onDelete: () => void; onClose: () => void }) {
  const initial = brand.name[0]?.toUpperCase() ?? '?'
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-accent text-lg font-bold text-accent-foreground">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[19px] font-bold">{brand.name}</span>
            {brand.isVerified && <Badge tone="success">Verified</Badge>}
          </div>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {[brand.tier, brand.industry, brand.email].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="grid grid-cols-4 gap-3">
        <Stat label="Collaborations" value={String(brand.totalCollaborations ?? 0)} />
        <Stat label="Avg ROI" value={`${(brand.avgROI ?? 0).toFixed(2)}x`} />
        <Stat label="Rating" value={brand.averageRating ? brand.averageRating.toFixed(1) : '—'} />
        <Stat label="Net worth" value={brand.netWorth ?? '—'} />
      </div>

      <div className="h-px bg-border" />

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">About</div>
        <p className="text-[13.5px] leading-relaxed">{brand.about ?? '—'}</p>
      </div>

      <div className="h-px bg-border" />

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Verification request</div>
        {brand.verificationRequest ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <span className="text-muted-foreground">Method</span>
            <span>{brand.verificationRequest.method.replaceAll('_', ' ')}</span>
            {brand.gstNumber && (
              <>
                <span className="text-muted-foreground">GST number</span>
                <span className="font-mono text-xs">{brand.gstNumber}</span>
              </>
            )}
            {brand.verificationRequest.documentUrl && (
              <>
                <span className="text-muted-foreground">Document</span>
                <a
                  href={brand.verificationRequest.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  View document <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
            <span className="text-muted-foreground">Status</span>
            <span>
              <Badge
                tone={
                  brand.verificationRequest.status === 'APPROVED'
                    ? 'success'
                    : brand.verificationRequest.status === 'REJECTED'
                      ? 'destructive'
                      : 'warning'
                }
              >
                {brand.verificationRequest.status}
              </Badge>
            </span>
            <span className="text-muted-foreground">Submitted</span>
            <span>{formatDateTime(brand.verificationRequest.submittedAt)}</span>
            {brand.verificationRequest.reviewedBy && (
              <>
                <span className="text-muted-foreground">Reviewed by</span>
                <span>{brand.verificationRequest.reviewedBy}</span>
              </>
            )}
            {brand.verificationRequest.adminNote && (
              <>
                <span className="text-muted-foreground">Note</span>
                <span>{brand.verificationRequest.adminNote}</span>
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No verification submitted yet.</p>
        )}
        {brand.verificationRequest?.status === 'PENDING' && (
          <Link to="/verification-requests" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            Review in Verification Requests →
          </Link>
        )}
      </div>

      <div className="mt-1 flex justify-end gap-2.5">
        <Button variant="outline" size="sm" onClick={onDelete} disabled={deleting}>
          Delete brand
        </Button>
        <Button size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-0.5 text-[11px] text-muted-foreground">{label}</div>
      <div className="text-[17px] font-bold">{value}</div>
    </div>
  )
}

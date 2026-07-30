import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAdminQuery } from '@/hooks/useAdminQuery'
import { ADMIN_BRAND_BY_ID_QUERY, DELETE_BRAND_MUTATION } from '@/lib/queries'
import type { Brand } from '@/lib/types'
import { gqlRequest } from '@/lib/graphql'
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, ExternalLink, Trash2 } from 'lucide-react'

interface Data {
  getBrandById: Brand
}

export function BrandDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, error } = useAdminQuery<Data>(ADMIN_BRAND_BY_ID_QUERY, { id }, [id])
  const [deleting, setDeleting] = useState(false)

  if (loading) return <FullPageSpinner />
  if (error || !data) return <ErrorState message={error ?? 'Brand not found'} />

  const brand = data.getBrandById

  async function handleDelete() {
    if (!id) return
    if (!confirm(`Permanently delete "${brand.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await gqlRequest(DELETE_BRAND_MUTATION, { id })
      navigate('/brands')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete brand')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/brands" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to brands
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {brand.name}
            {brand.isVerified && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </h1>
          <p className="text-sm text-muted-foreground">{brand.email}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" /> Delete brand
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Industry" value={brand.industry ?? '—'} />
            <Field label="Tier" value={brand.tier ?? '—'} />
            <Field label="Location" value={brand.location ?? '—'} />
            <Field label="Website" value={brand.profileUrl ?? '—'} />
            <Field label="Net worth" value={brand.netWorth ?? '—'} />
            <Field label="Average rating" value={brand.averageRating ? brand.averageRating.toFixed(1) : '—'} />
            <Field label="Total collaborations" value={String(brand.totalCollaborations ?? 0)} />
            <Field label="Avg ROI" value={`${(brand.avgROI ?? 0).toFixed(2)}x`} />
            <div className="col-span-2">
              <Field label="About" value={brand.about ?? '—'} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Badge status</span>
              <Badge tone={brand.isVerified ? 'success' : 'neutral'}>{brand.isVerified ? 'Verified' : 'Not verified'}</Badge>
            </div>
            {brand.gstNumber && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">GSTIN</span>
                <span className="font-mono text-xs">{brand.gstNumber}</span>
              </div>
            )}
            {brand.verificationRequest ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submission status</span>
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
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{brand.verificationRequest.method.replaceAll('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{formatDateTime(brand.verificationRequest.submittedAt)}</span>
                </div>
                {brand.verificationRequest.documentUrl && (
                  <a
                    href={brand.verificationRequest.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View document <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {brand.verificationRequest.adminNote && (
                  <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">Note: {brand.verificationRequest.adminNote}</p>
                )}
                {brand.verificationRequest.status === 'PENDING' && (
                  <Link to="/verification-requests" className="text-xs font-medium text-primary hover:underline">
                    Review in Verification Requests →
                  </Link>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No verification submitted yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}

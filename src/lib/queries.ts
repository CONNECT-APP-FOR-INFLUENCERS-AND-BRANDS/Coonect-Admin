export const OVERVIEW_STATS_QUERY = /* GraphQL */ `
  query OverviewStats {
    getAdminOverviewStats {
      totalInfluencers
      totalInfluencersChange
      totalBrands
      totalBrandsChange
      totalCollaborations
      totalCollaborationsChange
      totalRevenue
      totalRevenueChange
      activeInfluencers
      activeBrands
      avgEngagement
      platformGrowth
    }
    getAdminMonthlyTrend {
      month
      collaborations
      revenue
      newInfluencers
    }
    getInfluencerTierDistribution {
      tier
      count
    }
  }
`

export const TOP_BRANDS_QUERY = /* GraphQL */ `
  query TopBrands {
    getTopBrandsByROI {
      id
      name
      logoUrl
      isVerified
      avgROI
      totalCollaborations
      tier
    }
  }
`

const BRAND_FIELDS = /* GraphQL */ `
  id
  email
  name
  role
  profileCompleted
  updatedAt
  about
  profileUrl
  logoUrl
  location
  isVerified
  gstNumber
  netWorth
  averageRating
  tier
  industry
  avgROI
  totalCollaborations
  verificationRequest {
    method
    gstNumber
    documentUrl
    status
    submittedAt
    reviewedAt
    reviewedBy
    adminNote
  }
`

export const ADMIN_BRANDS_QUERY = /* GraphQL */ `
  query AdminBrands {
    getBrands {
      ${BRAND_FIELDS}
    }
  }
`

export const ADMIN_BRAND_BY_ID_QUERY = /* GraphQL */ `
  query AdminBrandById($id: ID!) {
    getBrandById(id: $id) {
      ${BRAND_FIELDS}
    }
  }
`

const INFLUENCER_FIELDS = /* GraphQL */ `
  id
  email
  name
  role
  bio
  location
  logoUrl
  isVerified
  averageRating
  totalFollowers
  engagementRate
  collaborationCount
  tier
`

export const ADMIN_INFLUENCERS_QUERY = /* GraphQL */ `
  query AdminInfluencers {
    getInfluencers {
      ${INFLUENCER_FIELDS}
    }
  }
`

const COLLABORATION_FIELDS = /* GraphQL */ `
  id
  campaignId
  brandId
  influencerId
  status
  message
  pricing { platform deliverable count price currency }
  initiatedBy
  createdAt
  updatedAt
  totalAmount
  paymentStatus
  rating
  brand { id name logoUrl isVerified }
  influencer { id name logoUrl isVerified }
  campaign { id title }
  cancellationRequest {
    requestedBy
    requestedByRole
    reason
    status
    requestedAt
    resolvedAt
    resolvedBy
    adminNote
  }
  paymentReleaseRequest {
    requestedBy
    status
    requestedAt
    resolvedAt
    resolvedBy
    adminNote
  }
`

export const ADMIN_COLLABORATIONS_QUERY = /* GraphQL */ `
  query AdminCollaborations {
    getAdminCollaborations {
      ${COLLABORATION_FIELDS}
    }
  }
`

export const ADMIN_CANCELLATION_REQUESTS_QUERY = /* GraphQL */ `
  query AdminCancellationRequests($status: CancellationRequestStatus) {
    getAdminCancellationRequests(status: $status) {
      ${COLLABORATION_FIELDS}
    }
  }
`

export const RESOLVE_CANCELLATION_REQUEST_MUTATION = /* GraphQL */ `
  mutation ResolveCancellationRequest($collaborationId: ID!, $approve: Boolean!, $adminNote: String) {
    resolveCancellationRequest(collaborationId: $collaborationId, approve: $approve, adminNote: $adminNote) {
      id
      status
      cancellationRequest { status }
    }
  }
`

export const ADMIN_PAYMENT_RELEASE_REQUESTS_QUERY = /* GraphQL */ `
  query AdminPaymentReleaseRequests($status: PaymentReleaseRequestStatus) {
    getAdminPaymentReleaseRequests(status: $status) {
      ${COLLABORATION_FIELDS}
    }
  }
`

export const RESOLVE_PAYMENT_RELEASE_REQUEST_MUTATION = /* GraphQL */ `
  mutation ResolvePaymentReleaseRequest($collaborationId: ID!, $approve: Boolean!, $adminNote: String) {
    resolvePaymentReleaseRequest(collaborationId: $collaborationId, approve: $approve, adminNote: $adminNote) {
      id
      status
      paymentReleaseRequest { status }
    }
  }
`

export const ADMIN_BRAND_VERIFICATION_REQUESTS_QUERY = /* GraphQL */ `
  query AdminBrandVerificationRequests($status: VerificationRequestStatus) {
    getAdminBrandVerificationRequests(status: $status) {
      ${BRAND_FIELDS}
    }
  }
`

export const REVIEW_BRAND_VERIFICATION_MUTATION = /* GraphQL */ `
  mutation ReviewBrandVerification($brandId: ID!, $approve: Boolean!, $adminNote: String) {
    reviewBrandVerification(brandId: $brandId, approve: $approve, adminNote: $adminNote) {
      id
      isVerified
      verificationRequest { status }
    }
  }
`

export const DELETE_BRAND_MUTATION = /* GraphQL */ `
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`

export const DELETE_INFLUENCER_MUTATION = /* GraphQL */ `
  mutation DeleteInfluencer($id: ID!) {
    deleteInfluencer(id: $id)
  }
`

export type Role = 'BRAND' | 'INFLUENCER' | 'ADMIN'

export type CollaborationStatus =
  | 'PENDING'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'BRIEF_SENT'
  | 'BRIEF_FINALIZED'
  | 'SCRIPT_SENT'
  | 'REJECTED'
  | 'REVOKED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_PAYMENT'
  | 'COMPLETED'
  | 'CANCELLED'

export type CancellationRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED'
export type PaymentReleaseRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED'
export type VerificationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type VerificationMethod = 'GST_DOCUMENT' | 'BUSINESS_REGISTRATION_DOCUMENT' | 'AADHAAR_EKYC'

export interface CancellationRequest {
  requestedBy: string
  requestedByRole: Role
  reason: string
  status: CancellationRequestStatus
  requestedAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
  adminNote?: string | null
}

export interface PaymentReleaseRequest {
  requestedBy: string
  status: PaymentReleaseRequestStatus
  requestedAt: string
  resolvedAt?: string | null
  resolvedBy?: string | null
  adminNote?: string | null
}

export interface BrandVerificationRequest {
  method: VerificationMethod
  gstNumber?: string | null
  documentUrl?: string | null
  status: VerificationRequestStatus
  submittedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  adminNote?: string | null
}

export interface Brand {
  id: string
  email: string
  name: string
  role: Role
  profileCompleted?: boolean | null
  updatedAt?: string | null
  about?: string | null
  profileUrl?: string | null
  logoUrl?: string | null
  location?: string | null
  isVerified?: boolean | null
  gstNumber?: string | null
  verificationRequest?: BrandVerificationRequest | null
  netWorth?: string | null
  averageRating?: number | null
  tier?: string | null
  industry?: string | null
  avgROI?: number | null
  totalCollaborations?: number | null
}

export interface Influencer {
  id: string
  email: string
  name: string
  role: Role
  bio?: string | null
  location?: string | null
  logoUrl?: string | null
  isVerified?: boolean | null
  averageRating?: number | null
  totalFollowers?: number | null
  engagementRate?: number | null
  collaborationCount?: number | null
  tier?: string | null
}

export interface Pricing {
  platform: string
  deliverable: string
  count?: number | null
  price: number
  currency: string
}

export interface Collaboration {
  id: string
  campaignId: string
  brandId: string
  influencerId: string
  status: CollaborationStatus
  message?: string | null
  pricing?: Pricing[] | null
  initiatedBy: Role
  createdAt: string
  updatedAt: string
  totalAmount?: number | null
  paymentStatus?: string | null
  brand?: Brand | null
  influencer?: Influencer | null
  campaign?: { id: string; title: string } | null
  cancellationRequest?: CancellationRequest | null
  paymentReleaseRequest?: PaymentReleaseRequest | null
  rating?: number | null
}

export interface OverviewStats {
  totalInfluencers: number
  totalInfluencersChange: number
  totalBrands: number
  totalBrandsChange: number
  totalCollaborations: number
  totalCollaborationsChange: number
  totalRevenue: number
  totalRevenueChange: number
  activeInfluencers: number
  activeBrands: number
  avgEngagement: number
  platformGrowth: number
}

export interface MonthlyTrend {
  month: string
  collaborations: number
  revenue: number
  newInfluencers: number
}

export interface TierCount {
  tier: string
  count: number
}

export interface InfluencerAnalytics {
  influencerId: string
  totalFollowers?: number | null
  totalEarnings?: number | null
  averageRating?: number | null
  collaborationCount?: number | null
  uniqueBrandsCollaborated?: number | null
  engagementRate?: number | null
  rankingScore?: number | null
  tier?: string | null
  growth?: number | null
}

export interface BrandAnalytics {
  brandId: string
  campaignCount?: number | null
  collaborationCount?: number | null
  uniqueInfluencersCollaborated?: number | null
  totalSpent?: number | null
  averageRating?: number | null
  totalEngagement?: number | null
  roi?: number | null
  rankingScore?: number | null
  tier?: string | null
  growth?: number | null
}

export interface InfluencerRank {
  influencer: Influencer
  metrics: InfluencerAnalytics
}

export interface BrandRank {
  brand: Brand
  metrics: BrandAnalytics
}

export interface InfluencerCategoryAnalytics {
  category: string
  topInfluencers: InfluencerRank[]
}

export interface BrandCategoryAnalytics {
  category: string
  topBrands: BrandRank[]
}

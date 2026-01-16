/**
 * Tipos relacionados con POAP (Proof of Attendance Protocol)
 */

export interface POAPClaim {
  id: string
  protocolId: string
  walletAddress: string
  email?: string
  score: number
  passed: boolean
  verificationMethod: 'self' | 'wallet' | null
  verificationId?: string
  poapEventId: number
  poapClaimCode?: string
  poapClaimUrl?: string
  claimed: boolean
  quizToken: string
  completedAt: Date
  claimedAt?: Date
}

export interface POAPClaimRequest {
  token: string
  walletAddress?: string
  email?: string
}

export interface POAPClaimResponse {
  success: boolean
  poapClaimUrl?: string
  poapClaimCode?: string
  message: string
  alreadyClaimed?: boolean
  poapEventId?: number
}

export interface POAPVerifyRequest {
  wallet: string
  protocol: string
}

export interface POAPVerifyResponse {
  claimed: boolean
  claimUrl?: string
  completedAt?: string
}

export interface POAPClientConfig {
  apiKey: string
  clientId: string
  clientSecret: string
}

export interface POAPReserveResult {
  claimCode: string
  claimUrl: string
  result?: any
}

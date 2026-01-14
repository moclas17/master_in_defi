/**
 * Tipos para Self Protocol
 * Mejora type safety eliminando 'any'
 */

export interface SelfApp {
  version: number
  appName: string
  scope: string
  endpoint: string
  userId: string
  userIdType: 'hex' | 'did'
  disclosures: SelfDisclosures
}

export interface SelfDisclosures {
  minimumAge?: number
  excludedCountries?: string[]
  ofac?: boolean
  date_of_birth?: boolean
  name?: boolean
  nationality?: boolean
}

export interface SelfVerificationData {
  verified: boolean
  verificationId?: string
  timestamp?: number
  method?: 'backend' | 'contract'
  date_of_birth?: string
  name?: string
  nationality?: string
  txHash?: string
}

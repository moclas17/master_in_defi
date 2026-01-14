/**
 * Tipos relacionados con verificación de usuarios
 */

export type VerificationMethod = 'self' | 'wallet' | null

export interface VerificationState {
  isVerified: boolean
  verificationMethod: VerificationMethod
  selfVerified: boolean
  walletVerified: boolean
  walletAddress: string | null
  verificationId?: string // ID de verificación Self
  signature?: string // Firma de wallet
  verifiedAt?: number // Timestamp de verificación
}

export interface SelfVerificationData {
  verificationId: string
  userId: string
  verifiedAt: number
  disclosures: {
    minimumAge?: number
    dateOfBirth?: boolean
    name?: boolean
    nationality?: boolean
  }
}

export interface WalletVerificationData {
  address: string
  signature: string
  message: string
  verifiedAt: number
}

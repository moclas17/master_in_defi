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

// SelfVerificationData está definido en ./self.ts para evitar duplicación

export interface WalletVerificationData {
  address: string
  signature: string
  message: string
  verifiedAt: number
}

'use client'

/**
 * Context unificado de verificación
 * Combina Self Protocol y Wallet Signature
 * Basado en ConnectHub pero adaptado para nuestro caso de uso
 */

import { createContext, useContext, ReactNode } from 'react'
import { useSelf } from './SelfContext'
import { useConnections } from 'wagmi'
import { VerificationMethod } from '@/types/verification'
import { STORAGE_KEYS } from '@/lib/constants'

interface VerificationContextType {
  isVerified: boolean
  verificationMethod: VerificationMethod | null
  verificationId?: string
  walletAddress?: string
  isLoading: boolean
}

const VerificationContext = createContext<VerificationContextType>({
  isVerified: false,
  verificationMethod: null,
  isLoading: false,
})

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { isVerified: isSelfVerified, verificationData, isLoading: selfLoading } = useSelf()
  const connections = useConnections()
  // En Wagmi v2, useConnections retorna conexiones activas
  const activeConnection = connections[0] // Primera conexión activa
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined
  const isConnected = connections.length > 0 && !!address
  
  // Verificar si hay wallet signature guardada
  const walletVerified = address 
    ? localStorage.getItem(STORAGE_KEYS.WALLET_VERIFIED(address)) === 'true'
    : false

  const isVerified = isSelfVerified || walletVerified
  const verificationMethod: VerificationMethod | null = 
    isSelfVerified ? 'self' : 
    walletVerified ? 'wallet' : 
    null

  return (
    <VerificationContext.Provider
      value={{
        isVerified,
        verificationMethod,
        verificationId: verificationData?.verificationId,
        walletAddress: walletVerified ? address : undefined,
        isLoading: selfLoading,
      }}
    >
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider')
  }
  return context
}

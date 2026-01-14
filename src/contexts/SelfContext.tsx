'use client'

/**
 * Context para Self Protocol
 * Basado en ConnectHub
 * Gestiona el estado de verificación con Self Protocol
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useConnections } from 'wagmi'

interface SelfVerificationData {
  verified: boolean
  verificationId?: string
  timestamp?: number
  method?: 'backend' | 'contract'
  date_of_birth?: string
  name?: string
  nationality?: string
  txHash?: string
}

interface SelfContextType {
  isVerified: boolean
  verificationData: SelfVerificationData | null
  isLoading: boolean
  isVerifying: boolean
  error: string | null
  universalLink: string | null
  selfApp: any | null
  showWidget: boolean
  setShowWidget: (show: boolean) => void
  verify: (verificationId: string, method: 'backend' | 'contract', data?: Partial<SelfVerificationData>) => void
  clearVerification: () => void
  initiateSelfVerification: () => Promise<void>
  checkVerificationStatus: (data?: any) => Promise<void>
}

const SelfContext = createContext<SelfContextType>({
  isVerified: false,
  verificationData: null,
  isLoading: false,
  isVerifying: false,
  error: null,
  universalLink: null,
  selfApp: null,
  showWidget: false,
  setShowWidget: () => {},
  verify: () => {},
  clearVerification: () => {},
  initiateSelfVerification: async () => {},
  checkVerificationStatus: async () => {},
})

export function SelfProvider({ children }: { children: ReactNode }) {
  const connections = useConnections()
  const activeConnection = connections[0]
  const address = activeConnection?.accounts?.[0] as `0x${string}` | undefined
  
  const [verificationData, setVerificationData] = useState<SelfVerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [universalLink, setUniversalLink] = useState<string | null>(null)
  const [selfApp, setSelfApp] = useState<any | null>(null)
  const [showWidget, setShowWidget] = useState(false)

  // Cargar verificación guardada al iniciar
  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('self_verification')
    if (saved) {
      try {
        const data = JSON.parse(saved) as SelfVerificationData
        if (data.verified && data.timestamp) {
          // Verificar que no haya expirado (opcional: 30 días)
          const thirtyDays = 30 * 24 * 60 * 60 * 1000
          if (Date.now() - data.timestamp < thirtyDays) {
            setVerificationData(data)
          } else {
            localStorage.removeItem('self_verification')
          }
        }
      } catch (err) {
        console.error('Error cargando verificación guardada:', err)
        localStorage.removeItem('self_verification')
      }
    }
  }, [])

  // Inicializar Self App
  useEffect(() => {
    if (!address) return

    const initSelfApp = async () => {
      try {
        const { SelfAppBuilder, getUniversalLink } = await import('@selfxyz/qrcode')

        const scope = process.env.NEXT_PUBLIC_SELF_SCOPE || 'defi-quiz-app'
        const appName = process.env.NEXT_PUBLIC_SELF_APP_NAME || 'DeFi Learning Quiz'
        const backendEndpoint = process.env.NEXT_PUBLIC_SELF_BACKEND_ENDPOINT
        const deeplinkCallback = typeof window !== 'undefined' ? window.location.href : ''

        const app = new SelfAppBuilder({
          version: 2,
          appName,
          scope,
          endpoint: backendEndpoint || '',
          deeplinkCallback,
          logoBase64: process.env.NEXT_PUBLIC_SELF_LOGO_URL || '',
          userId: address,
          // Para backend, no especificamos endpointType
          userIdType: 'hex',
          disclosures: {
            minimumAge: 18,
            excludedCountries: [],
            ofac: false,
            date_of_birth: true,
            name: false,
            nationality: false,
          }
        }).build()

        setSelfApp(app)
        setUniversalLink(getUniversalLink(app))
      } catch (err) {
        console.error('Error inicializando Self App:', err)
        setError('Error inicializando Self Protocol')
      }
    }

    initSelfApp()
  }, [address])

  const verify = useCallback((verificationId: string, method: 'backend' | 'contract', data?: Partial<SelfVerificationData>) => {
    const verification: SelfVerificationData = {
      verified: true,
      verificationId,
      timestamp: Date.now(),
      method,
      ...data,
    }
    
    setVerificationData(verification)
    setError(null)
    setIsVerifying(false)
    
    // Guardar en localStorage
    localStorage.setItem('self_verification', JSON.stringify(verification))
  }, [])

  const clearVerification = useCallback(() => {
    setVerificationData(null)
    setError(null)
    setIsVerifying(false)
    localStorage.removeItem('self_verification')
  }, [])

  const initiateSelfVerification = useCallback(async () => {
    if (!universalLink) {
      setError('Universal link no disponible')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Intentar abrir en Farcaster si está disponible
      try {
        // @ts-ignore - SDK puede no estar instalado
        const { sdk } = await import('@farcaster/frame-sdk')
        const isInMiniAppResult = await sdk.isInMiniApp()
        
        if (isInMiniAppResult) {
          await sdk.actions.openUrl(universalLink)
          return
        }
      } catch {
        // No está en Farcaster, continuar con window.open
      }

      // Abrir en nueva ventana/pestaña
      window.open(universalLink, '_blank')
    } catch (err) {
      console.error('Error abriendo Self app:', err)
      setError('Error al abrir Self Protocol')
      setIsVerifying(false)
    }
  }, [universalLink])

  const checkVerificationStatus = useCallback(async (data?: any) => {
    if (!address) return

    const backendEndpoint = process.env.NEXT_PUBLIC_SELF_BACKEND_ENDPOINT
    if (!backendEndpoint) {
      setError('Backend endpoint no configurado')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Polling para verificar estado en backend
      const maxAttempts = 60 // 5 minutos
      let attempts = 0

      const pollStatus = async (): Promise<void> => {
        attempts++
        
        try {
          const response = await fetch(`${backendEndpoint}?address=${address}`)
          
          if (response.ok) {
            const result = await response.json()
            
            if (result.verified) {
              verify(result.verificationId || `backend_${Date.now()}`, 'backend', {
                date_of_birth: result.date_of_birth,
                name: result.name,
                nationality: result.nationality,
              })
              setIsVerifying(false)
              return
            }
          }

          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 5000) // Poll cada 5 segundos
          } else {
            setError('Timeout: La verificación está tomando más tiempo del esperado')
            setIsVerifying(false)
          }
        } catch (err) {
          console.error('Error verificando estado:', err)
          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 5000)
          } else {
            setError('Error al verificar estado de verificación')
            setIsVerifying(false)
          }
        }
      }

      pollStatus()
    } catch (err) {
      console.error('Error en checkVerificationStatus:', err)
      setError('Error al verificar estado')
      setIsVerifying(false)
    }
  }, [address, verify])

  return (
    <SelfContext.Provider
      value={{
        isVerified: verificationData?.verified || false,
        verificationData,
        isLoading,
        isVerifying,
        error,
        universalLink,
        selfApp,
        showWidget,
        setShowWidget,
        verify,
        clearVerification,
        initiateSelfVerification,
        checkVerificationStatus,
      }}
    >
      {children}
    </SelfContext.Provider>
  )
}

export function useSelf() {
  const context = useContext(SelfContext)
  if (!context) {
    throw new Error('useSelf must be used within SelfProvider')
  }
  return context
}

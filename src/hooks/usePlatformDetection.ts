/**
 * Hook para detectar la plataforma (Web vs Farcaster)
 * Basado en ConnectHub
 */

import { useEffect, useState } from 'react'

export type Platform = 'web' | 'farcaster' | 'unknown'

export interface PlatformInfo {
  platform: Platform
  isFarcaster: boolean
  isMobile: boolean
  userAgent: string
}

export function usePlatformDetection(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    platform: 'unknown',
    isFarcaster: false,
    isMobile: false,
    userAgent: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent || ''
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)
    
    // Detectar Farcaster
    // Farcaster Mini Apps se ejecutan en un iframe con características específicas
    const isFarcaster = 
      window.location !== window.parent.location || // En iframe
      userAgent.includes('Farcaster') ||
      userAgent.includes('Warpcast') ||
      document.referrer.includes('farcaster') ||
      document.referrer.includes('warpcast')

    const platform: Platform = isFarcaster ? 'farcaster' : 'web'

    setPlatformInfo({
      platform,
      isFarcaster,
      isMobile,
      userAgent,
    })
  }, [])

  return platformInfo
}

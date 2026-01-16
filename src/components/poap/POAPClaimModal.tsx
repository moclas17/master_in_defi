'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface POAPClaimModalProps {
  claimUrl: string
  claimCode?: string
  protocolId: string
  walletAddress?: string
  onClose: () => void
}

export function POAPClaimModal({
  claimUrl,
  claimCode,
  protocolId,
  walletAddress,
  onClose
}: POAPClaimModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsAnimating(true), 10)
    setTimeout(() => setShowContent(true), 300)
  }, [])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 300)
  }

  const handleClaimNow = async () => {
    // Confirmar el reclamo en el backend antes de abrir POAP.xyz
    if (claimCode) {
      try {
        await fetch('/api/poap/confirm-claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claimCode,
            walletAddress
          })
        })
        console.log('[POAP Modal] ✅ Claim confirmed')
      } catch (error) {
        console.error('[POAP Modal] Error confirming claim:', error)
        // No bloqueamos la apertura de la ventana aunque falle
      }
    }

    // Abrir POAP.xyz
    window.open(claimUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-80' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal with scale and fade animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative max-w-lg w-full bg-zinc-900 border-2 border-purple-500/50 shadow-2xl overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-pulse" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Success animation - Trophy/Star */}
              <div
                className={`mb-6 flex justify-center transform transition-all duration-500 ${
                  showContent ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                }`}
              >
                <div className="relative">
                  {/* Rotating rings */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="w-32 h-32 rounded-full border-4 border-purple-500/30 border-t-purple-500" />
                  </div>
                  <div className="absolute inset-0 animate-spin-slow-reverse">
                    <div className="w-32 h-32 rounded-full border-4 border-pink-500/30 border-b-pink-500" />
                  </div>

                  {/* Center emoji with pulse */}
                  <div className="relative flex items-center justify-center w-32 h-32 animate-bounce-slow">
                    <span className="text-6xl">🎉</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div
                className={`mb-4 text-center transform transition-all duration-500 delay-100 ${
                  showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <h2 className="text-3xl font-bold text-white mb-2">
                  POAP Claimed!
                </h2>
                <p className="text-zinc-300">
                  Your {protocolId.toUpperCase()} Protocol POAP is ready
                </p>
              </div>

              {/* Action button */}
              <div
                className={`transform transition-all duration-500 delay-300 ${
                  showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <Button
                  onClick={handleClaimNow}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
                >
                  🚀 Claim on POAP.xyz
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 4s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { POAPClaimModal } from './POAPClaimModal'
import type { POAPClaimResponse } from '@/types/poap'

interface POAPClaimButtonProps {
  token: string
  protocolId: string
  walletAddress?: string
  onSuccess?: (claimUrl: string) => void
}

export function POAPClaimButton({
  token,
  protocolId,
  walletAddress,
  onSuccess
}: POAPClaimButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [claimData, setClaimData] = useState<POAPClaimResponse | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleClaim = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/poap/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          walletAddress,
        }),
      })

      const data: POAPClaimResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to claim POAP')
      }

      if (data.success && data.poapClaimUrl) {
        setClaimData(data)
        setShowModal(true)
        onSuccess?.(data.poapClaimUrl)
      } else {
        throw new Error(data.message || 'No claim URL received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error claiming POAP:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (claimData?.alreadyClaimed) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
        <p className="text-sm text-yellow-200">
          You have already claimed a POAP for this protocol
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-white">
            Congratulations! You passed the quiz
          </h3>
          <p className="mb-4 text-sm text-zinc-400">
            Claim your POAP (Proof of Attendance Protocol) NFT as a reward
          </p>
        </div>

        <Button
          onClick={handleClaim}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5" />
              Claiming POAP...
            </span>
          ) : (
            '🎉 Claim Your POAP'
          )}
        </Button>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>

      {showModal && claimData && (
        <POAPClaimModal
          claimUrl={claimData.poapClaimUrl!}
          claimCode={claimData.poapClaimCode}
          protocolId={protocolId}
          walletAddress={walletAddress}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

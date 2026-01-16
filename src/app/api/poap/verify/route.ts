import { NextRequest, NextResponse } from 'next/server'
import { getClaimsByWallet, initPOAPClaimsTable } from '@/lib/db/poap-claims'
import type { POAPVerifyResponse } from '@/types/poap'

// Initialize table on cold start
initPOAPClaimsTable().catch(console.error)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const wallet = searchParams.get('wallet')
    const protocol = searchParams.get('protocol')

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Si se proporciona protocolo, verificar claim específico
    if (protocol) {
      const claims = await getClaimsByWallet(wallet)
      const protocolClaim = claims.find(c => c.protocolId === protocol)

      if (!protocolClaim) {
        return NextResponse.json({
          claimed: false
        } as POAPVerifyResponse)
      }

      return NextResponse.json({
        claimed: true,
        claimUrl: protocolClaim.poapClaimUrl,
        completedAt: protocolClaim.completedAt.toISOString()
      } as POAPVerifyResponse)
    }

    // Si no se proporciona protocolo, retornar todos los claims
    const claims = await getClaimsByWallet(wallet)

    return NextResponse.json({
      claimed: claims.length > 0,
      claims: claims.map(claim => ({
        protocolId: claim.protocolId,
        claimUrl: claim.poapClaimUrl,
        completedAt: claim.completedAt.toISOString(),
        score: claim.score,
        poapEventId: claim.poapEventId
      }))
    })

  } catch (error) {
    console.error('Error in POAP verify endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

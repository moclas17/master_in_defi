import { NextRequest, NextResponse } from 'next/server'
import { getQuizToken } from '@/lib/quiz-tokens'
import { getProtocolById } from '@/lib/db/protocols'
import {
  createClaim,
  hasClaimedForProtocol,
  initPOAPClaimsTable
} from '@/lib/db/poap-claims'
import {
  getNextAvailableCode,
  markCodeAsClaimed,
  initPOAPCodesTable
} from '@/lib/db/poap-codes'
import type { POAPClaimRequest, POAPClaimResponse } from '@/types/poap'

// Initialize tables on cold start
initPOAPClaimsTable().catch(console.error)
initPOAPCodesTable().catch(console.error)

export async function POST(request: NextRequest) {
  try {
    const body: POAPClaimRequest = await request.json()
    const { token, walletAddress, email } = body

    // Validar que el token esté presente
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    // Obtener datos del token
    const quizData = await getQuizToken(token)
    if (!quizData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    // Verificar que el quiz fue pasado
    if (quizData.score < 3) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quiz not passed. You need at least 3 correct answers.'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    // Obtener wallet address (del body o del token)
    const userWallet = walletAddress || quizData.walletAddress
    if (!userWallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Wallet address is required'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    // Obtener protocolo (ahora desde BD)
    const protocol = await getProtocolById(quizData.protocolId)
    if (!protocol) {
      return NextResponse.json(
        {
          success: false,
          message: 'Protocol not found'
        } as POAPClaimResponse,
        { status: 404 }
      )
    }

    // Obtener POAP drop completo desde la base de datos
    const { getDropByProtocol } = await import('@/lib/db/poap-drops')
    const poapDrop = await getDropByProtocol(quizData.protocolId)

    if (!poapDrop || !poapDrop.active) {
      return NextResponse.json(
        {
          success: false,
          message: 'POAP event not configured for this protocol'
        } as POAPClaimResponse,
        { status: 500 }
      )
    }

    if (!poapDrop.secretCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'POAP secret code not configured'
        } as POAPClaimResponse,
        { status: 500 }
      )
    }

    const poapEventId = poapDrop.eventId

    // Verificar si ya reclamó POAP para este protocolo
    const alreadyClaimed = await hasClaimedForProtocol(userWallet, quizData.protocolId)
    if (alreadyClaimed) {
      return NextResponse.json(
        {
          success: false,
          alreadyClaimed: true,
          message: 'You have already claimed a POAP for this protocol'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    // Obtener siguiente código disponible desde la base de datos
    console.log('[POAP Claim] Getting next available code...')
    const availableCode = await getNextAvailableCode(poapDrop.id)

    if (!availableCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'No POAP codes available. All codes have been claimed.'
        } as POAPClaimResponse,
        { status: 400 }
      )
    }

    console.log('[POAP Claim] Found available code:', availableCode.qrHash)

    // Guardar claim en la base de datos
    let claimId: string | undefined
    try {
      const claim = await createClaim({
        protocolId: quizData.protocolId,
        walletAddress: userWallet,
        email: email || quizData.email,
        score: quizData.score,
        passed: true,
        verificationMethod: quizData.verificationMethod || null,
        verificationId: undefined,
        poapEventId,
        poapClaimCode: availableCode.qrHash,
        poapClaimUrl: `https://poap.xyz/claim/${availableCode.qrHash}`,
        claimed: true,
        quizToken: token,
        completedAt: new Date(),
        claimedAt: new Date()
      })
      claimId = claim.id
    } catch (dbError) {
      console.error('Error saving claim to database:', dbError)
      // Continuar de todos modos, el código ya fue asignado
    }

    // Marcar código como reclamado
    try {
      await markCodeAsClaimed(
        availableCode.id,
        userWallet,
        email || quizData.email,
        claimId
      )
      console.log('[POAP Claim] ✅ Code marked as claimed')
    } catch (codeError) {
      console.error('Error marking code as claimed:', codeError)
      // No es crítico, el claim ya fue guardado
    }

    // Retornar resultado exitoso
    return NextResponse.json({
      success: true,
      poapClaimUrl: `https://poap.xyz/claim/${availableCode.qrHash}`,
      poapClaimCode: availableCode.qrHash,
      poapEventId,
      message: 'POAP reserved successfully! Visit the claim URL to mint your POAP.'
    } as POAPClaimResponse)

  } catch (error) {
    console.error('Error in POAP claim endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error'
      } as POAPClaimResponse,
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getPoapClient } from '@/lib/poap/client'

export async function GET() {
  try {
    console.log('[Test POAP Auth] Testing POAP credentials...')

    // Step 1: Check env vars
    const hasApiKey = !!process.env.POAP_API_KEY
    const hasClientId = !!process.env.POAP_CLIENT_ID
    const hasClientSecret = !!process.env.POAP_CLIENT_SECRET

    console.log('[Test POAP Auth] Environment check:', {
      hasApiKey,
      hasClientId,
      hasClientSecret,
      apiKeyLength: process.env.POAP_API_KEY?.length || 0
    })

    if (!hasApiKey || !hasClientId || !hasClientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing POAP credentials in environment',
        details: { hasApiKey, hasClientId, hasClientSecret }
      }, { status: 500 })
    }

    // Step 2: Get POAP drop from database (includes secret code)
    console.log('[Test POAP Auth] Getting POAP drop from database...')
    const { getDropByProtocol } = await import('@/lib/db/poap-drops')
    const poapDrop = await getDropByProtocol('morpho')

    if (!poapDrop) {
      return NextResponse.json({
        success: false,
        error: 'POAP drop not found in database',
        message: 'Create a POAP drop for Morpho first'
      }, { status: 500 })
    }

    if (!poapDrop.secretCode) {
      return NextResponse.json({
        success: false,
        error: 'POAP secret code not configured in database',
        message: 'Secret code is missing from POAP drop configuration'
      }, { status: 500 })
    }

    const testEventId = poapDrop.eventId
    const testSecretCode = poapDrop.secretCode

    console.log('[Test POAP Auth] Testing QR codes fetch for event:', testEventId)
    console.log('[Test POAP Auth] Using secret code from DB:', testSecretCode.substring(0, 2) + '****')

    // Step 3: Initialize POAP client and get OAuth2 token
    console.log('[Test POAP Auth] Initializing POAP client...')
    const poapClient = getPoapClient()

    try {
      // Use the client's method which handles OAuth2 automatically
      console.log('[Test POAP Auth] Attempting to reserve POAP...')
      const testEmail = 'test@example.com'

      const result = await poapClient.reservePoapForEmail(
        testEventId,
        testEmail,
        testSecretCode
      )

      console.log('[Test POAP Auth] ✅ Successfully reserved POAP')

      return NextResponse.json({
        success: true,
        message: 'POAP credentials are valid and claim successful',
        claimInfo: {
          claimCode: result.claimCode,
          claimUrl: result.claimUrl
        }
      })
    } catch (clientError: any) {
      console.error('[Test POAP Auth] ❌ Client error:', clientError)

      // Try direct API call as fallback
      const response = await fetch(`https://api.poap.tech/event/${testEventId}/qr-codes`, {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.POAP_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_code: testSecretCode,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Test POAP Auth] ❌ Fallback API call also failed:', errorText)

        return NextResponse.json({
          success: false,
          error: 'POAP API authentication failed',
          clientError: clientError.message,
          apiError: errorText,
          status: response.status
        }, { status: response.status })
      }

      const qrCodes = await response.json()
      console.log('[Test POAP Auth] ⚠️ Fallback succeeded - Direct API worked')

      const availableCodes = qrCodes.filter((code: any) => !code.claimed)

      return NextResponse.json({
        success: true,
        message: 'Direct API works but client failed',
        clientError: clientError.message,
        qrCodeStats: {
          total: qrCodes.length,
          available: availableCodes.length,
          claimed: qrCodes.length - availableCodes.length
        }
      })
    }
  } catch (error) {
    console.error('[Test POAP Auth] ❌ Unexpected error:', error)

    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

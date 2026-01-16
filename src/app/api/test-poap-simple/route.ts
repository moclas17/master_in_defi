import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.POAP_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'POAP_API_KEY not configured'
      }, { status: 500 })
    }

    console.log('[POAP Simple Test] Testing basic API access...')
    console.log('[POAP Simple Test] API Key length:', apiKey.length)

    // Test 1: Try to get event info without secret code (should work if API key is valid)
    console.log('[POAP Simple Test] Test 1: Getting event 222973 info...')
    const eventResponse = await fetch('https://api.poap.tech/events/id/222973', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
      },
    })

    console.log('[POAP Simple Test] Event response status:', eventResponse.status)

    if (!eventResponse.ok) {
      const errorText = await eventResponse.text()
      console.error('[POAP Simple Test] Event API error:', errorText)

      return NextResponse.json({
        success: false,
        test: 'get_event_info',
        status: eventResponse.status,
        error: errorText,
        message: 'Failed to get event info - check if API key is valid and has access to this event'
      }, { status: eventResponse.status })
    }

    const eventData = await eventResponse.json()
    console.log('[POAP Simple Test] ✅ Event retrieved:', eventData.name)

    // Test 2: Try to fetch QR codes with secret code
    console.log('[POAP Simple Test] Test 2: Fetching QR codes...')
    const qrResponse = await fetch('https://api.poap.tech/event/222973/qr-codes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_code: '966248',
      }),
    })

    console.log('[POAP Simple Test] QR codes response status:', qrResponse.status)

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text()
      console.error('[POAP Simple Test] QR codes API error:', errorText)

      // Event info worked but QR codes failed - probably wrong secret or no access
      return NextResponse.json({
        success: false,
        test: 'get_qr_codes',
        status: qrResponse.status,
        error: errorText,
        eventInfo: {
          id: eventData.id,
          name: eventData.name,
        },
        message: 'Event found but cannot access QR codes - check if secret code is correct'
      }, { status: qrResponse.status })
    }

    const qrCodes = await qrResponse.json()
    console.log('[POAP Simple Test] ✅ QR codes retrieved:', qrCodes.length)

    const available = qrCodes.filter((code: any) => !code.claimed).length

    return NextResponse.json({
      success: true,
      message: 'All POAP API tests passed',
      eventInfo: {
        id: eventData.id,
        name: eventData.name,
        description: eventData.description?.substring(0, 100),
      },
      qrCodeStats: {
        total: qrCodes.length,
        available: available,
        claimed: qrCodes.length - available,
      },
    })
  } catch (error) {
    console.error('[POAP Simple Test] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

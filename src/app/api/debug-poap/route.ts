import { NextRequest, NextResponse } from 'next/server'
import { getQuizToken } from '@/lib/quiz-tokens'
import { getProtocolById } from '@/lib/db/protocols'
import { getEventIdForProtocol, getDropByProtocol } from '@/lib/db/poap-drops'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const protocolId = searchParams.get('protocolId') || 'morpho'

    const debug: any = {
      timestamp: new Date().toISOString(),
      steps: []
    }

    // Step 1: Check quiz token
    debug.steps.push({ step: 1, action: 'Checking quiz token', token })
    if (token) {
      const quizData = await getQuizToken(token)
      debug.steps.push({
        step: 1,
        result: quizData ? 'Token found' : 'Token not found or expired',
        data: quizData
      })
    } else {
      debug.steps.push({ step: 1, result: 'No token provided' })
    }

    // Step 2: Check protocol
    debug.steps.push({ step: 2, action: 'Checking protocol', protocolId })
    const protocol = await getProtocolById(protocolId)
    debug.steps.push({
      step: 2,
      result: protocol ? 'Protocol found' : 'Protocol not found',
      data: protocol ? { id: protocol.id, name: protocol.name } : null
    })

    // Step 3: Check POAP drop
    debug.steps.push({ step: 3, action: 'Checking POAP drop' })
    const drop = await getDropByProtocol(protocolId)
    debug.steps.push({
      step: 3,
      result: drop ? 'Drop found' : 'Drop not found',
      data: drop
    })

    // Step 4: Check event ID
    debug.steps.push({ step: 4, action: 'Getting event ID' })
    const eventId = await getEventIdForProtocol(protocolId)
    debug.steps.push({
      step: 4,
      result: eventId ? `Event ID: ${eventId}` : 'No event ID',
      data: { eventId, isNull: eventId === null, isZero: eventId === 0 }
    })

    // Step 5: Check POAP credentials
    debug.steps.push({ step: 5, action: 'Checking POAP credentials' })
    debug.steps.push({
      step: 5,
      result: 'Credentials check',
      data: {
        hasApiKey: !!process.env.POAP_API_KEY,
        hasClientId: !!process.env.POAP_CLIENT_ID,
        hasClientSecret: !!process.env.POAP_CLIENT_SECRET,
        apiKeyLength: process.env.POAP_API_KEY?.length || 0
      }
    })

    return NextResponse.json(debug)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

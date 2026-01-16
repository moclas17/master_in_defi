import { NextResponse } from 'next/server'
import { getAllProtocols, getProtocolById } from '@/lib/db/protocols'
import { getQuestionsByProtocol } from '@/lib/db/questions'

/**
 * Endpoint de diagnóstico para verificar la base de datos
 * GET /api/test-db
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
  }

  try {
    // Test 1: Get all protocols
    results.tests.push({ test: 'getAllProtocols', status: 'running' })
    const protocols = await getAllProtocols()
    results.tests[results.tests.length - 1] = {
      test: 'getAllProtocols',
      status: 'success',
      count: protocols.length,
      protocols: protocols.map(p => ({ id: p.id, name: p.name, active: p.active }))
    }

    // Test 2: Get specific protocols
    for (const protocolId of ['aave', 'morpho', 'sablier']) {
      results.tests.push({ test: `getProtocolById(${protocolId})`, status: 'running' })
      const protocol = await getProtocolById(protocolId)
      results.tests[results.tests.length - 1] = {
        test: `getProtocolById(${protocolId})`,
        status: protocol ? 'success' : 'not_found',
        found: !!protocol,
        data: protocol ? {
          id: protocol.id,
          name: protocol.name,
          title: protocol.title,
          active: protocol.active,
          secretWord: protocol.secretWord
        } : null
      }
    }

    // Test 3: Get questions for each protocol
    for (const protocolId of ['aave', 'morpho', 'sablier']) {
      results.tests.push({ test: `getQuestionsByProtocol(${protocolId})`, status: 'running' })
      const questions = await getQuestionsByProtocol(protocolId, false)
      results.tests[results.tests.length - 1] = {
        test: `getQuestionsByProtocol(${protocolId})`,
        status: 'success',
        count: questions.length,
        questions: questions.map((q, idx) => ({
          index: idx + 1,
          id: q.id,
          text: q.text.substring(0, 50) + (q.text.length > 50 ? '...' : ''),
          answersCount: q.answers.length
        }))
      }
    }

  } catch (error) {
    results.success = false
    results.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }
  }

  return NextResponse.json(results, {
    status: results.success ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

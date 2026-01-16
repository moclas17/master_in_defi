import { NextRequest, NextResponse } from 'next/server'
import { createAnswer } from '@/lib/db/questions'

/**
 * POST /api/answers
 * Create a new answer for a question (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { questionId, text, isCorrect, orderIndex = 0 } = body

    // Validate required fields
    if (!questionId || !text || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['questionId', 'text', 'isCorrect'],
        },
        { status: 400 }
      )
    }

    // Create answer
    const answer = await createAnswer({
      questionId,
      text,
      isCorrect,
      orderIndex,
    })

    return NextResponse.json(
      {
        success: true,
        answer,
        message: 'Answer created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

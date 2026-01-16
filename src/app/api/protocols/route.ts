import { NextRequest, NextResponse } from 'next/server'
import { getAllProtocols, createProtocol } from '@/lib/db/protocols'

/**
 * GET /api/protocols
 * Get all active protocols
 */
export async function GET() {
  try {
    const protocols = await getAllProtocols()

    return NextResponse.json({
      success: true,
      protocols,
      count: protocols.length,
    })
  } catch (error) {
    console.error('Error fetching protocols:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch protocols',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/protocols
 * Create a new protocol (admin only)
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
    const {
      id,
      name,
      title,
      description,
      logoUrl,
      category,
      difficulty,
      secretWord,
      active = true,
      orderIndex = 0,
    } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'name'],
        },
        { status: 400 }
      )
    }

    // Create protocol
    const protocol = await createProtocol({
      id: id.toLowerCase(),
      name,
      title: title || null,
      description: description || null,
      logoUrl: logoUrl || null,
      category: category || null,
      difficulty: difficulty || null,
      secretWord: secretWord || null,
      active,
      orderIndex,
    })

    return NextResponse.json(
      {
        success: true,
        protocol,
        message: `Protocol "${name}" created successfully`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating protocol:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create protocol',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

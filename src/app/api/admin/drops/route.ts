import { NextResponse } from 'next/server'
import { getAllDrops } from '@/lib/db/poap-drops'

/**
 * GET /api/admin/drops
 * Returns all POAP drops with their statistics
 */
export async function GET() {
  try {
    const drops = await getAllDrops()

    return NextResponse.json({
      success: true,
      drops
    })
  } catch (error) {
    console.error('Error fetching drops:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch drops',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

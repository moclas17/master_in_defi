import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { config } from '@/lib/config'
import { getCodeStats } from '@/lib/db/poap-codes'

const sql = neon(config.database.url)

/**
 * GET /api/admin/codes?dropId={id}
 * Returns all codes for a specific drop with their claim status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dropId = searchParams.get('dropId')

    if (!dropId) {
      return NextResponse.json(
        { error: 'Drop ID is required' },
        { status: 400 }
      )
    }

    // Get all codes for this drop
    const codes = await sql`
      SELECT
        id,
        drop_id as "dropId",
        qr_hash as "qrHash",
        claimed,
        claimed_by_wallet as "claimedByWallet",
        claimed_by_email as "claimedByEmail",
        claimed_at as "claimedAt",
        created_at as "createdAt"
      FROM poap_codes
      WHERE drop_id = ${dropId}
      ORDER BY created_at ASC, qr_hash ASC
    `

    // Get stats
    const stats = await getCodeStats(dropId)

    return NextResponse.json({
      success: true,
      dropId,
      codes,
      stats,
      count: codes.length
    })
  } catch (error) {
    console.error('Error fetching codes:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

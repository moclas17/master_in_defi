import { NextRequest, NextResponse } from 'next/server'
import {
  uploadCodes,
  getCodeStats,
  initPOAPCodesTable
} from '@/lib/db/poap-codes'

// Initialize table on cold start
initPOAPCodesTable().catch(console.error)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dropId = formData.get('dropId') as string
    const file = formData.get('file') as File

    if (!dropId) {
      return NextResponse.json(
        { error: 'Drop ID is required' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Split by newlines and clean
    // Extract QR hash from URLs like "http://POAP.xyz/mint/i742rm" or plain codes
    const codes = fileContent
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        // If it's a URL, extract the code after the last slash
        if (trimmed.includes('POAP.xyz/mint/') || trimmed.includes('poap.xyz/mint/')) {
          const parts = trimmed.split('/')
          return parts[parts.length - 1]
        }
        // Otherwise return as-is
        return trimmed
      })
      .filter(line => line.length > 0)

    console.log(`[Upload Codes] Processing ${codes.length} codes for drop ${dropId}`)
    console.log(`[Upload Codes] First few codes:`, codes.slice(0, 3))

    // Upload codes to database
    const insertedCount = await uploadCodes(dropId, codes)

    // Get updated stats
    const stats = await getCodeStats(dropId)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${insertedCount} codes`,
      inserted: insertedCount,
      total: codes.length,
      duplicates: codes.length - insertedCount,
      stats
    })
  } catch (error) {
    console.error('Error uploading codes:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload codes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check code stats
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

    const stats = await getCodeStats(dropId)

    return NextResponse.json({
      success: true,
      dropId,
      stats
    })
  } catch (error) {
    console.error('Error getting code stats:', error)
    return NextResponse.json(
      {
        error: 'Failed to get code stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

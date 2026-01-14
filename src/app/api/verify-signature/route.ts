import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'

/**
 * API Route para verificar firmas de wallet
 * Valida que la firma corresponde a la dirección y mensaje
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, message } = body

    if (!address || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: address, signature, message' },
        { status: 400 }
      )
    }

    // Verificar firma usando viem
    try {
      const isValid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      })

      if (isValid) {
        return NextResponse.json({
          verified: true,
          address,
          message: 'Signature verified successfully'
        })
      } else {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } catch (verifyError) {
      console.error('Error verifying signature:', verifyError)
      return NextResponse.json(
        { error: 'Failed to verify signature' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in verify-signature route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

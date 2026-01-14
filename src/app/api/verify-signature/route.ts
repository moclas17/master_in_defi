import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { validateRequired, validateEthereumAddress, validateEthereumSignature } from '@/lib/validation'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * API Route para verificar firmas de wallet
 * Valida que la firma corresponde a la dirección y mensaje
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, message } = body

    // Validar campos requeridos
    const requiredValidation = validateRequired(body, ['address', 'signature', 'message'])
    if (!requiredValidation.valid) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST, details: requiredValidation.errors },
        { status: 400 }
      )
    }

    // Validar formato de dirección
    if (!validateEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Formato de dirección inválido' },
        { status: 400 }
      )
    }

    // Validar formato de firma
    if (!validateEthereumSignature(signature)) {
      return NextResponse.json(
        { error: 'Formato de firma inválido' },
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

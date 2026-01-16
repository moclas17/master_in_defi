/**
 * Almacenamiento temporal de tokens de quiz
 * Ahora usa base de datos para persistir entre reinicios
 */

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export interface QuizTokenData {
  score: number
  total: number
  protocolId: string
  expiresAt: number
  verificationMethod?: 'self' | 'wallet' | null
  walletAddress?: string
  email?: string
}

/**
 * Guarda un token de quiz en la base de datos
 */
export async function setQuizToken(token: string, data: QuizTokenData): Promise<void> {
  await sql`
    INSERT INTO quiz_tokens (
      token,
      protocol_id,
      score,
      total,
      verification_method,
      wallet_address,
      email,
      expires_at
    )
    VALUES (
      ${token},
      ${data.protocolId},
      ${data.score},
      ${data.total},
      ${data.verificationMethod || null},
      ${data.walletAddress || null},
      ${data.email || null},
      to_timestamp(${data.expiresAt / 1000})
    )
    ON CONFLICT (token) DO UPDATE SET
      score = EXCLUDED.score,
      total = EXCLUDED.total,
      verification_method = EXCLUDED.verification_method,
      wallet_address = EXCLUDED.wallet_address,
      email = EXCLUDED.email,
      expires_at = EXCLUDED.expires_at
  `
}

/**
 * Obtiene un token de quiz desde la base de datos
 * Retorna undefined si no existe o ha expirado
 */
export async function getQuizToken(token: string): Promise<QuizTokenData | undefined> {
  const result = await sql`
    SELECT
      protocol_id as "protocolId",
      score,
      total,
      verification_method as "verificationMethod",
      wallet_address as "walletAddress",
      email,
      EXTRACT(EPOCH FROM expires_at) * 1000 as "expiresAt"
    FROM quiz_tokens
    WHERE token = ${token}
      AND expires_at > NOW()
  `

  if (result.length === 0) {
    return undefined
  }

  const row = result[0] as {
    protocolId: string
    score: number
    total: number
    verificationMethod: 'self' | 'wallet' | null
    walletAddress: string | null
    email: string | null
    expiresAt: number
  }

  return {
    protocolId: row.protocolId,
    score: row.score,
    total: row.total,
    expiresAt: row.expiresAt,
    verificationMethod: row.verificationMethod,
    walletAddress: row.walletAddress || undefined,
    email: row.email || undefined,
  }
}

/**
 * Elimina un token de la base de datos
 */
export async function deleteQuizToken(token: string): Promise<void> {
  await sql`
    DELETE FROM quiz_tokens
    WHERE token = ${token}
  `
}

/**
 * Limpia tokens expirados (puede llamarse periódicamente)
 */
export async function cleanExpiredTokens(): Promise<number> {
  const result = await sql`
    DELETE FROM quiz_tokens
    WHERE expires_at < NOW()
    RETURNING token
  `
  return result.length
}

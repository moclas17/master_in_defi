/**
 * Módulo de base de datos para POAP Claims
 * Usa Neon PostgreSQL serverless
 */

import { neon } from '@neondatabase/serverless'
import { config } from '@/lib/config'
import type { POAPClaim } from '@/types/poap'

// Initialize Neon client
const sql = neon(config.database.url)

/**
 * Crear tabla si no existe
 */
export async function initPOAPClaimsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS poap_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        protocol_id VARCHAR(50) NOT NULL,
        wallet_address VARCHAR(42) NOT NULL,
        email VARCHAR(255),
        score INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        verification_method VARCHAR(20),
        verification_id VARCHAR(255),
        poap_event_id INTEGER NOT NULL,
        poap_claim_code VARCHAR(255),
        poap_claim_url VARCHAR(512),
        claimed BOOLEAN DEFAULT FALSE,
        quiz_token VARCHAR(128) UNIQUE,
        completed_at TIMESTAMP NOT NULL,
        claimed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),

        CONSTRAINT unique_protocol_wallet UNIQUE(protocol_id, wallet_address)
      );

      CREATE INDEX IF NOT EXISTS idx_poap_claims_wallet ON poap_claims(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_poap_claims_protocol ON poap_claims(protocol_id);
      CREATE INDEX IF NOT EXISTS idx_poap_claims_token ON poap_claims(quiz_token);
    `
    console.log('POAP claims table initialized successfully')
  } catch (error) {
    console.error('Error initializing POAP claims table:', error)
    throw error
  }
}

/**
 * Crear un nuevo claim
 */
export async function createClaim(data: Omit<POAPClaim, 'id'>): Promise<POAPClaim> {
  try {
    const result = await sql`
      INSERT INTO poap_claims (
        protocol_id,
        wallet_address,
        email,
        score,
        passed,
        verification_method,
        verification_id,
        poap_event_id,
        poap_claim_code,
        poap_claim_url,
        claimed,
        quiz_token,
        completed_at,
        claimed_at
      ) VALUES (
        ${data.protocolId},
        ${data.walletAddress},
        ${data.email || null},
        ${data.score},
        ${data.passed},
        ${data.verificationMethod},
        ${data.verificationId || null},
        ${data.poapEventId},
        ${data.poapClaimCode || null},
        ${data.poapClaimUrl || null},
        ${data.claimed},
        ${data.quizToken},
        ${data.completedAt.toISOString()},
        ${data.claimedAt ? data.claimedAt.toISOString() : null}
      )
      RETURNING
        id,
        protocol_id as "protocolId",
        wallet_address as "walletAddress",
        email,
        score,
        passed,
        verification_method as "verificationMethod",
        verification_id as "verificationId",
        poap_event_id as "poapEventId",
        poap_claim_code as "poapClaimCode",
        poap_claim_url as "poapClaimUrl",
        claimed,
        quiz_token as "quizToken",
        completed_at as "completedAt",
        claimed_at as "claimedAt"
    `

    return {
      ...result[0],
      completedAt: new Date(result[0].completedAt),
      claimedAt: result[0].claimedAt ? new Date(result[0].claimedAt) : undefined
    } as POAPClaim
  } catch (error) {
    console.error('Error creating claim:', error)
    throw error
  }
}

/**
 * Obtener claim por token de quiz
 */
export async function getClaimByToken(token: string): Promise<POAPClaim | null> {
  try {
    const result = await sql`
      SELECT
        id,
        protocol_id as "protocolId",
        wallet_address as "walletAddress",
        email,
        score,
        passed,
        verification_method as "verificationMethod",
        verification_id as "verificationId",
        poap_event_id as "poapEventId",
        poap_claim_code as "poapClaimCode",
        poap_claim_url as "poapClaimUrl",
        claimed,
        quiz_token as "quizToken",
        completed_at as "completedAt",
        claimed_at as "claimedAt"
      FROM poap_claims
      WHERE quiz_token = ${token}
      LIMIT 1
    `

    if (result.length === 0) return null

    return {
      ...result[0],
      completedAt: new Date(result[0].completedAt),
      claimedAt: result[0].claimedAt ? new Date(result[0].claimedAt) : undefined
    } as POAPClaim
  } catch (error) {
    console.error('Error getting claim by token:', error)
    throw error
  }
}

/**
 * Obtener todos los claims de una wallet
 */
export async function getClaimsByWallet(walletAddress: string): Promise<POAPClaim[]> {
  try {
    const result = await sql`
      SELECT
        id,
        protocol_id as "protocolId",
        wallet_address as "walletAddress",
        email,
        score,
        passed,
        verification_method as "verificationMethod",
        verification_id as "verificationId",
        poap_event_id as "poapEventId",
        poap_claim_code as "poapClaimCode",
        poap_claim_url as "poapClaimUrl",
        claimed,
        quiz_token as "quizToken",
        completed_at as "completedAt",
        claimed_at as "claimedAt"
      FROM poap_claims
      WHERE wallet_address = ${walletAddress}
      ORDER BY completed_at DESC
    `

    return result.map(row => ({
      ...row,
      completedAt: new Date(row.completedAt),
      claimedAt: row.claimedAt ? new Date(row.claimedAt) : undefined
    })) as POAPClaim[]
  } catch (error) {
    console.error('Error getting claims by wallet:', error)
    throw error
  }
}

/**
 * Verificar si ya reclamó POAP para un protocolo
 */
export async function hasClaimedForProtocol(
  walletAddress: string,
  protocolId: string
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS(
        SELECT 1 FROM poap_claims
        WHERE wallet_address = ${walletAddress}
        AND protocol_id = ${protocolId}
      ) as exists
    `

    return result[0].exists
  } catch (error) {
    console.error('Error checking if claimed:', error)
    throw error
  }
}

/**
 * Actualizar estado de claim
 */
export async function updateClaimStatus(
  id: string,
  claimed: boolean,
  claimedAt?: Date
): Promise<void> {
  try {
    await sql`
      UPDATE poap_claims
      SET
        claimed = ${claimed},
        claimed_at = ${claimedAt ? claimedAt.toISOString() : null},
        updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating claim status:', error)
    throw error
  }
}

/**
 * Actualizar claim con información de POAP
 */
export async function updateClaimWithPOAP(
  id: string,
  poapClaimCode: string,
  poapClaimUrl: string
): Promise<void> {
  try {
    await sql`
      UPDATE poap_claims
      SET
        poap_claim_code = ${poapClaimCode},
        poap_claim_url = ${poapClaimUrl},
        updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating claim with POAP:', error)
    throw error
  }
}

/**
 * Obtener estadísticas de claims por protocolo
 */
export async function getProtocolStats(protocolId: string) {
  try {
    const result = await sql`
      SELECT
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN passed THEN 1 END) as passed_count,
        COUNT(CASE WHEN claimed THEN 1 END) as claimed_count,
        AVG(score) as average_score
      FROM poap_claims
      WHERE protocol_id = ${protocolId}
    `

    return {
      totalAttempts: parseInt(result[0].total_attempts),
      passedCount: parseInt(result[0].passed_count),
      claimedCount: parseInt(result[0].claimed_count),
      averageScore: parseFloat(result[0].average_score)
    }
  } catch (error) {
    console.error('Error getting protocol stats:', error)
    throw error
  }
}

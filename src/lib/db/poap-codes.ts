/**
 * Database functions for POAP Codes
 * Manages individual claim codes uploaded from text files
 */

import { neon } from '@neondatabase/serverless'
import { config } from '@/lib/config'

const sql = neon(config.database.url)

export interface POAPCode {
  id: string
  dropId: string
  qrHash: string
  claimed: boolean
  claimedByWallet?: string
  claimedByEmail?: string
  claimedAt?: Date
  claimId?: string
  createdAt: Date
}

/**
 * Initialize POAP codes table
 */
export async function initPOAPCodesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS poap_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        drop_id UUID NOT NULL,
        qr_hash VARCHAR(10) NOT NULL,
        claimed BOOLEAN DEFAULT FALSE,
        claimed_by_wallet VARCHAR(255),
        claimed_by_email VARCHAR(255),
        claimed_at TIMESTAMP,
        claim_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_qr_hash UNIQUE(qr_hash),
        CONSTRAINT unique_drop_qr UNIQUE(drop_id, qr_hash)
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_poap_codes_drop ON poap_codes(drop_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_poap_codes_claimed ON poap_codes(claimed)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_poap_codes_wallet ON poap_codes(claimed_by_wallet)
    `

    console.log('✅ POAP codes table initialized')
  } catch (error) {
    console.error('Error initializing POAP codes table:', error)
    throw error
  }
}

/**
 * Upload codes from text array (one code per line)
 */
export async function uploadCodes(dropId: string, codes: string[]): Promise<number> {
  try {
    // Clean codes (trim whitespace, remove empty lines)
    const cleanCodes = codes
      .map(code => code.trim())
      .filter(code => code.length > 0)

    if (cleanCodes.length === 0) {
      throw new Error('No valid codes found in file')
    }

    // Insert codes in batch
    let inserted = 0
    for (const qrHash of cleanCodes) {
      try {
        await sql`
          INSERT INTO poap_codes (drop_id, qr_hash)
          VALUES (${dropId}, ${qrHash})
          ON CONFLICT (qr_hash) DO NOTHING
        `
        inserted++
      } catch (error) {
        console.warn(`Failed to insert code ${qrHash}:`, error)
      }
    }

    return inserted
  } catch (error) {
    console.error('Error uploading codes:', error)
    throw error
  }
}

/**
 * Get next available code for a drop
 */
export async function getNextAvailableCode(dropId: string): Promise<POAPCode | null> {
  const result = await sql`
    SELECT
      id,
      drop_id as "dropId",
      qr_hash as "qrHash",
      claimed,
      claimed_by_wallet as "claimedByWallet",
      claimed_by_email as "claimedByEmail",
      claimed_at as "claimedAt",
      claim_id as "claimId",
      created_at as "createdAt"
    FROM poap_codes
    WHERE drop_id = ${dropId}
      AND claimed = FALSE
    ORDER BY created_at ASC
    LIMIT 1
  `

  return result.length > 0 ? (result[0] as POAPCode) : null
}

/**
 * Mark code as claimed
 */
export async function markCodeAsClaimed(
  codeId: string,
  walletAddress: string,
  email?: string,
  claimId?: string
): Promise<void> {
  await sql`
    UPDATE poap_codes
    SET
      claimed = TRUE,
      claimed_by_wallet = ${walletAddress},
      claimed_by_email = ${email || null},
      claimed_at = NOW(),
      claim_id = ${claimId || null}
    WHERE id = ${codeId}
  `
}

/**
 * Get code statistics for a drop
 */
export async function getCodeStats(dropId: string): Promise<{
  total: number
  claimed: number
  available: number
}> {
  const result = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE claimed = TRUE)::int as claimed,
      COUNT(*) FILTER (WHERE claimed = FALSE)::int as available
    FROM poap_codes
    WHERE drop_id = ${dropId}
  `

  return result[0] as { total: number; claimed: number; available: number }
}

/**
 * Get all codes for a drop (with pagination)
 */
export async function getCodesForDrop(
  dropId: string,
  limit: number = 100,
  offset: number = 0
): Promise<POAPCode[]> {
  const result = await sql`
    SELECT
      id,
      drop_id as "dropId",
      qr_hash as "qrHash",
      claimed,
      claimed_by_wallet as "claimedByWallet",
      claimed_by_email as "claimedByEmail",
      claimed_at as "claimedAt",
      claim_id as "claimId",
      created_at as "createdAt"
    FROM poap_codes
    WHERE drop_id = ${dropId}
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `

  return result as POAPCode[]
}

/**
 * Delete all codes for a drop
 */
export async function deleteCodesForDrop(dropId: string): Promise<number> {
  const result = await sql`
    DELETE FROM poap_codes
    WHERE drop_id = ${dropId}
    RETURNING id
  `

  return result.length
}

/**
 * Get code by QR hash
 */
export async function getCodeByQrHash(qrHash: string): Promise<POAPCode | null> {
  const result = await sql`
    SELECT
      id,
      drop_id as "dropId",
      qr_hash as "qrHash",
      claimed,
      claimed_by_wallet as "claimedByWallet",
      claimed_by_email as "claimedByEmail",
      claimed_at as "claimedAt",
      claim_id as "claimId",
      created_at as "createdAt"
    FROM poap_codes
    WHERE qr_hash = ${qrHash}
    LIMIT 1
  `

  return result.length > 0 ? (result[0] as POAPCode) : null
}

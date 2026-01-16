import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check if quiz_tokens table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'quiz_tokens'
      ) as table_exists
    `

    const tableExists = result[0].table_exists

    if (!tableExists) {
      return NextResponse.json({
        exists: false,
        message: '❌ La tabla quiz_tokens NO existe',
        sql: `
-- Ejecuta este SQL en Neon Console:

CREATE TABLE IF NOT EXISTS quiz_tokens (
  token VARCHAR(128) PRIMARY KEY,
  protocol_id VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  verification_method VARCHAR(20),
  wallet_address VARCHAR(255),
  email VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_tokens_expires ON quiz_tokens(expires_at);

COMMENT ON TABLE quiz_tokens IS 'Temporary storage for quiz result tokens';
COMMENT ON COLUMN quiz_tokens.token IS 'Unique token for accessing quiz results';
COMMENT ON COLUMN quiz_tokens.expires_at IS 'When this token expires';
        `
      })
    }

    // Count tokens
    const count = await sql`SELECT COUNT(*) as count FROM quiz_tokens`

    return NextResponse.json({
      exists: true,
      message: '✅ La tabla quiz_tokens existe',
      tokenCount: count[0].count
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

-- ============================================
-- TABLA DE CÓDIGOS POAP
-- ============================================
-- Esta tabla guarda todos los códigos QR de POAP que se pueden distribuir
-- Los códigos se suben desde un archivo .txt en el admin

CREATE TABLE IF NOT EXISTS poap_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES poap_drops(id) ON DELETE CASCADE,
  qr_hash VARCHAR(10) NOT NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_by_wallet VARCHAR(255),
  claimed_by_email VARCHAR(255),
  claimed_at TIMESTAMP,
  claim_id UUID REFERENCES poap_claims(id),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_qr_hash UNIQUE(qr_hash),
  CONSTRAINT unique_drop_qr UNIQUE(drop_id, qr_hash)
);

-- Indexes para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_poap_codes_drop ON poap_codes(drop_id);
CREATE INDEX IF NOT EXISTS idx_poap_codes_claimed ON poap_codes(claimed);
CREATE INDEX IF NOT EXISTS idx_poap_codes_wallet ON poap_codes(claimed_by_wallet);

-- Comments
COMMENT ON TABLE poap_codes IS 'Individual POAP claim codes uploaded from text file';
COMMENT ON COLUMN poap_codes.qr_hash IS '6-character QR code hash from POAP';
COMMENT ON COLUMN poap_codes.claimed IS 'Whether this code has been assigned to a user';
COMMENT ON COLUMN poap_codes.claimed_by_wallet IS 'Wallet address that claimed this code';
COMMENT ON COLUMN poap_codes.claim_id IS 'Reference to the claim record';

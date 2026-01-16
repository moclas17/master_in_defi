-- Seed Data: Poblar base de datos con protocolos y preguntas existentes
-- Este script migra los datos hardcodeados a la base de datos

-- ============================================
-- PROTOCOLOS
-- ============================================

INSERT INTO protocols (id, name, title, description, logo_url, category, difficulty, secret_word, active, order_index)
VALUES
  ('aave', 'Aave', 'Aave Protocol', 'Aave is a decentralized non-custodial liquidity protocol where users can participate as suppliers or borrowers.', '/logos/aave.svg', 'Lending', 'Intermediate', 'GHO_GHOST_VAULT', true, 1),
  ('morpho', 'Morpho', 'Morpho Protocol', 'Morpho is a lending pool optimizer that improves the capital efficiency of positions on lending pools like Compound or Aave.', '/logos/morpho.svg', 'Lending', 'Advanced', 'MORPHO_BLUE_OPTIMIZER', true, 2),
  ('sablier', 'Sablier', 'Sablier Protocol', 'Sablier is a protocol for streaming money where payments are made every second.', '/logos/sablier.svg', 'Payments', 'Beginner', 'STREAM_FLOW_TOKEN', true, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  secret_word = EXCLUDED.secret_word,
  active = EXCLUDED.active,
  order_index = EXCLUDED.order_index,
  updated_at = NOW();

-- ============================================
-- PREGUNTAS Y RESPUESTAS - AAVE
-- ============================================

-- Pregunta 1: ¿Qué es Aave?
WITH q1 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0000-000000000001', 'aave', '¿Qué es Aave?', 'Aave es un protocolo de liquidez descentralizado donde los usuarios pueden participar como proveedores o prestatarios.', 1, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  q1.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM q1, (VALUES
  ('Un protocolo de liquidez descentralizado', true, 1),
  ('Una plataforma de trading centralizada', false, 2),
  ('Un exchange descentralizado', false, 3),
  ('Una stablecoin', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 2: ¿Qué es GHO?
WITH q2 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0000-000000000002', 'aave', '¿Qué es GHO?', 'GHO es la stablecoin nativa de Aave, respaldada por colateral y sobre-colateralizada.', 2, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  q2.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM q2, (VALUES
  ('La stablecoin nativa de Aave', true, 1),
  ('Un token de gobernanza', false, 2),
  ('Un protocolo de préstamos', false, 3),
  ('Una criptomoneda volátil', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 3: ¿Cómo ganan intereses los proveedores en Aave?
WITH q3 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0000-000000000003', 'aave', '¿Cómo ganan intereses los proveedores en Aave?', 'Los proveedores depositan activos en pools de liquidez y ganan intereses de los prestatarios.', 3, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  q3.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM q3, (VALUES
  ('Depositando activos en pools de liquidez', true, 1),
  ('Comprando NFTs', false, 2),
  ('Haciendo staking de ETH', false, 3),
  ('Trading en el mercado', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 4: ¿Qué son los aTokens?
WITH q4 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0000-000000000004', 'aave', '¿Qué son los aTokens?', 'Los aTokens son tokens que representan depósitos en Aave y acumulan intereses automáticamente.', 4, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  q4.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM q4, (VALUES
  ('Tokens que representan depósitos y acumulan intereses', true, 1),
  ('Tokens de gobernanza', false, 2),
  ('NFTs coleccionables', false, 3),
  ('Tokens de recompensa', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 5: ¿Qué es el health factor en Aave?
WITH q5 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0000-000000000005', 'aave', '¿Qué es el health factor en Aave?', 'El health factor es un indicador de la seguridad de tu colateral. Si cae por debajo de 1, tu colateral puede ser liquidado.', 5, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  q5.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM q5, (VALUES
  ('Un indicador de la seguridad de tu colateral', true, 1),
  ('La tasa de interés del protocolo', false, 2),
  ('El precio de los tokens', false, 3),
  ('La cantidad de usuarios activos', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- ============================================
-- PREGUNTAS Y RESPUESTAS - MORPHO
-- ============================================

-- Pregunta 1: What is the core architectural innovation of Morpho Blue?
WITH qm1 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0001-000000000001', 'morpho', 'What is the core architectural innovation of Morpho Blue?', 'Morpho Blue is a base-layer lending primitive that enables isolated markets, each defined by loan asset, collateral asset, Oracle, and LLTV ratio.', 1, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qm1.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qm1, (VALUES
  ('A monolithic pool for all assets', false, 1),
  ('A trustless, immutable, and permissionless lending primitive', true, 2),
  ('A centralized risk management engine', false, 3),
  ('A cross-chain bridge for NFTs', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 2: How does Morpho Optimizer improve rates for users?
WITH qm2 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0001-000000000002', 'morpho', 'How does Morpho Optimizer improve rates for users?', 'Morpho Optimizer improves rates by matching lenders and borrowers peer-to-peer, bypassing the spread that traditional pools charge.', 2, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qm2.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qm2, (VALUES
  ('By charging higher fees to lenders', false, 1),
  ('By matching lenders and borrowers peer-to-peer on top of underlying pools', true, 2),
  ('By minting synthetic assets', false, 3),
  ('By liquidating undercollateralized positions faster', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 3: In the context of MetaMorpho, what is a 'Curator'?
WITH qm3 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0001-000000000003', 'morpho', 'In the context of MetaMorpho, what is a ''Curator''?', 'Curators are risk experts who manage MetaMorpho vaults, providing the risk management layer that Morpho Blue lacks at the protocol level.', 3, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qm3.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qm3, (VALUES
  ('An entity that designs the UI', false, 1),
  ('An automated bot that trades on DEXs', false, 2),
  ('A risk expert that manages vault allocations and risk parameters', true, 3),
  ('A user who only provides liquidity', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 4: Which of these is NOT a parameter of a Morpho Blue market?
WITH qm4 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0001-000000000004', 'morpho', 'Which of these is NOT a parameter of a Morpho Blue market?', 'Morpho Blue markets are defined by loan asset, collateral asset, Oracle, and LLTV ratio. Credit scores are not used, as the protocol is over-collateralized and trustless.', 4, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qm4.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qm4, (VALUES
  ('Loan Asset', false, 1),
  ('Collateral Asset', false, 2),
  ('LLTV (Liquidation Loan-to-Value)', false, 3),
  ('User''s Credit Score', true, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 5: What does 'LLTV' stand for in Morpho Blue?
WITH qm5 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0001-000000000005', 'morpho', 'What does ''LLTV'' stand for in Morpho Blue?', 'LLTV (Liquidation Loan-to-Value) is the maximum debt-to-collateral ratio before liquidation can occur, ensuring protocol solvency.', 5, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qm5.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qm5, (VALUES
  ('Long Live Total Value', false, 1),
  ('Liquidation Loan-To-Value', true, 2),
  ('Layered Lending Total Volume', false, 3),
  ('Leveraged Loan Trading Velocity', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- ============================================
-- PREGUNTAS Y RESPUESTAS - SABLIER
-- ============================================

-- Pregunta 1: How does Sablier distribute tokens over time?
WITH qs1 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0002-000000000001', 'sablier', 'How does Sablier distribute tokens over time?', 'Sablier distributes tokens continuously, second-by-second, making it ideal for payroll, vesting, and subscriptions where real-time payments are beneficial.', 1, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qs1.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qs1, (VALUES
  ('In lump sums every month', false, 1),
  ('Continuously, second-by-second', true, 2),
  ('Only when the sender triggers a release', false, 3),
  ('Based on the recipient''s performance', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 2: In Sablier V2, what technology is used to represent a stream?
WITH qs2 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0002-000000000002', 'sablier', 'In Sablier V2, what technology is used to represent a stream?', 'Sablier V2 represents streams as ERC-721 NFTs, making them transferable and allowing recipients to sell their future earnings on NFT marketplaces.', 2, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qs2.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qs2, (VALUES
  ('An ERC-20 token', false, 1),
  ('An ERC-721 NFT', true, 2),
  ('A Merkle Tree', false, 3),
  ('A central database', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 3: What happens when a sender 'cancels' a cancelable stream?
WITH qs3 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0002-000000000003', 'sablier', 'What happens when a sender ''cancels'' a cancelable stream?', 'When a cancelable stream is cancelled, accrued tokens remain with the recipient, and unstreamed tokens are returned to the sender.', 3, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qs3.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qs3, (VALUES
  ('All tokens are burned', false, 1),
  ('Remaining unstreamed tokens are returned to the sender', true, 2),
  ('All tokens are sent to the recipient immediately', false, 3),
  ('The stream is paused but tokens stay in the contract', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 4: What is a 'Linear Stream' in Sablier?
WITH qs4 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0002-000000000004', 'sablier', 'What is a ''Linear Stream'' in Sablier?', 'Linear streams release tokens at a constant rate, making them ideal for simple payroll or vesting schedules.', 4, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qs4.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qs4, (VALUES
  ('A stream that releases tokens based on a curve', false, 1),
  ('A stream that releases tokens at a constant rate over time', true, 2),
  ('A stream with a random release schedule', false, 3),
  ('A stream that never ends', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- Pregunta 5: Which of these can be a 'Recipient' of a Sablier stream?
WITH qs5 AS (
  INSERT INTO questions (id, protocol_id, text, explanation, order_index, active)
  VALUES ('00000000-0000-0000-0002-000000000005', 'sablier', 'Which of these can be a ''Recipient'' of a Sablier stream?', 'Sablier is permissionless - any valid Ethereum address (wallet or smart contract) can receive streams, making it flexible for various use cases.', 5, true)
  ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    explanation = EXCLUDED.explanation,
    order_index = EXCLUDED.order_index,
    updated_at = NOW()
  RETURNING id
)
INSERT INTO answers (question_id, text, is_correct, order_index)
SELECT
  qs5.id,
  answer.text,
  answer.is_correct,
  answer.order_index
FROM qs5, (VALUES
  ('Only a hardware wallet', false, 1),
  ('Any valid Ethereum address or smart contract', true, 2),
  ('Only addresses that have passed KYC', false, 3),
  ('Only multisig wallets', false, 4)
) AS answer(text, is_correct, order_index)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR SEED
-- ============================================
SELECT 'Protocols seeded:' as message, COUNT(*) as count FROM protocols;
SELECT 'Questions seeded:' as message, COUNT(*) as count FROM questions;
SELECT 'Answers seeded:' as message, COUNT(*) as count FROM answers;

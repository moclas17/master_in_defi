/**
 * Database functions for POAP Drops
 * Manages POAP events created for each protocol
 */

import { neon } from '@neondatabase/serverless'
import { config } from '@/lib/config'

const sql = neon(config.database.url)

export interface POAPDrop {
  id: string
  protocolId: string
  name: string
  description?: string
  imageUrl?: string
  eventId: number
  secretCode?: string
  expiryDate: Date
  active: boolean
  quizTitle?: string
  quizSubtitle?: string
  passingPercentage: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Crear un nuevo drop en la base de datos
 */
export async function createDrop(drop: Omit<POAPDrop, 'id' | 'createdAt' | 'updatedAt'>): Promise<POAPDrop> {
  const result = await sql`
    INSERT INTO poap_drops (
      protocol_id, name, description, image_url, event_id,
      secret_code, expiry_date, active, quiz_title, quiz_subtitle,
      passing_percentage
    ) VALUES (
      ${drop.protocolId},
      ${drop.name},
      ${drop.description || null},
      ${drop.imageUrl || null},
      ${drop.eventId},
      ${drop.secretCode || null},
      ${drop.expiryDate},
      ${drop.active},
      ${drop.quizTitle || null},
      ${drop.quizSubtitle || null},
      ${drop.passingPercentage}
    )
    RETURNING
      id,
      protocol_id as "protocolId",
      name,
      description,
      image_url as "imageUrl",
      event_id as "eventId",
      secret_code as "secretCode",
      expiry_date as "expiryDate",
      active,
      quiz_title as "quizTitle",
      quiz_subtitle as "quizSubtitle",
      passing_percentage as "passingPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `

  return result[0] as POAPDrop
}

/**
 * Obtener un drop por protocol ID
 */
export async function getDropByProtocol(protocolId: string): Promise<POAPDrop | null> {
  const result = await sql`
    SELECT
      id,
      protocol_id as "protocolId",
      name,
      description,
      image_url as "imageUrl",
      event_id as "eventId",
      secret_code as "secretCode",
      expiry_date as "expiryDate",
      active,
      quiz_title as "quizTitle",
      quiz_subtitle as "quizSubtitle",
      passing_percentage as "passingPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM poap_drops
    WHERE protocol_id = ${protocolId}
    LIMIT 1
  `

  return result.length > 0 ? (result[0] as POAPDrop) : null
}

/**
 * Obtener un drop por event ID
 */
export async function getDropByEventId(eventId: number): Promise<POAPDrop | null> {
  const result = await sql`
    SELECT
      id,
      protocol_id as "protocolId",
      name,
      description,
      image_url as "imageUrl",
      event_id as "eventId",
      secret_code as "secretCode",
      expiry_date as "expiryDate",
      active,
      quiz_title as "quizTitle",
      quiz_subtitle as "quizSubtitle",
      passing_percentage as "passingPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM poap_drops
    WHERE event_id = ${eventId}
    LIMIT 1
  `

  return result.length > 0 ? (result[0] as POAPDrop) : null
}

/**
 * Obtener todos los drops activos
 */
export async function getAllActiveDrops(): Promise<POAPDrop[]> {
  const result = await sql`
    SELECT
      id,
      protocol_id as "protocolId",
      name,
      description,
      image_url as "imageUrl",
      event_id as "eventId",
      secret_code as "secretCode",
      expiry_date as "expiryDate",
      active,
      quiz_title as "quizTitle",
      quiz_subtitle as "quizSubtitle",
      passing_percentage as "passingPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM poap_drops
    WHERE active = TRUE
    ORDER BY created_at DESC
  `

  return result as POAPDrop[]
}

/**
 * Obtener todos los drops (activos e inactivos)
 */
export async function getAllDrops(): Promise<POAPDrop[]> {
  const result = await sql`
    SELECT
      id,
      protocol_id as "protocolId",
      name,
      description,
      image_url as "imageUrl",
      event_id as "eventId",
      secret_code as "secretCode",
      expiry_date as "expiryDate",
      active,
      quiz_title as "quizTitle",
      quiz_subtitle as "quizSubtitle",
      passing_percentage as "passingPercentage",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM poap_drops
    ORDER BY created_at DESC
  `

  return result as POAPDrop[]
}

/**
 * Actualizar estado activo de un drop
 */
export async function updateDropStatus(protocolId: string, active: boolean): Promise<void> {
  await sql`
    UPDATE poap_drops
    SET active = ${active}, updated_at = NOW()
    WHERE protocol_id = ${protocolId}
  `
}

/**
 * Eliminar un drop
 */
export async function deleteDrop(protocolId: string): Promise<void> {
  await sql`
    DELETE FROM poap_drops
    WHERE protocol_id = ${protocolId}
  `
}

/**
 * Obtener event ID para un protocolo
 * Retorna null si no existe drop para ese protocolo
 */
export async function getEventIdForProtocol(protocolId: string): Promise<number | null> {
  const drop = await getDropByProtocol(protocolId)
  return drop?.active ? drop.eventId : null
}

import { NextRequest, NextResponse } from 'next/server'
import { getPoapClient } from '@/lib/poap/client'
import { createDrop } from '@/lib/db/poap-drops'

/**
 * API endpoint para crear drops de POAP
 * Protegido con admin secret
 * Guarda automáticamente en la base de datos
 */

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const adminSecret = request.headers.get('x-admin-secret')
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    // Extraer todos los campos
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const eventUrl = formData.get('eventUrl') as string
    const city = formData.get('city') as string
    const country = formData.get('country') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const expiryDate = formData.get('expiryDate') as string
    const secretCode = formData.get('secretCode') as string
    const email = formData.get('email') as string
    const requestedCodes = parseInt(formData.get('requestedCodes') as string)
    const virtualEvent = formData.get('virtualEvent') === 'true'
    const privateEvent = formData.get('privateEvent') === 'true'
    const imageFile = formData.get('image') as File

    // Protocol ID y configuración del quiz
    const protocolId = formData.get('protocolId') as string
    const quizTitle = formData.get('quizTitle') as string
    const quizSubtitle = formData.get('quizSubtitle') as string
    const passingPercentage = parseInt(formData.get('passingPercentage') as string) || 75

    // Validar campos requeridos
    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    if (!name || !description || !eventUrl || !email || !protocolId) {
      return NextResponse.json(
        { error: 'Missing required fields (name, description, eventUrl, email, protocolId)' },
        { status: 400 }
      )
    }

    // Convertir fechas a objetos Date
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)
    const expiryDateTime = new Date(expiryDate)

    // Preparar datos para POAP API
    const dropData = {
      name,
      description,
      eventUrl,
      city,
      country,
      startDate: startDateTime,
      endDate: endDateTime,
      expiryDate: expiryDateTime,
      secretCode,
      email,
      requestedCodes,
      virtualEvent,
      privateEvent,
      image: imageFile,
      filename: imageFile.name,
      contentType: imageFile.type,
    }

    console.log('Creating drop with POAP SDK:', {
      name,
      email,
      requestedCodes,
      virtualEvent,
      privateEvent,
      quizTitle,
      quizSubtitle,
      passingPercentage,
      imageSize: imageFile.size,
    })

    // Crear drop usando POAP SDK
    const poapClient = getPoapClient()
    const createdDrop = await poapClient.createDrop(dropData)

    console.log('Drop created successfully with POAP:', createdDrop)

    // Guardar drop en la base de datos
    const savedDrop = await createDrop({
      protocolId: protocolId.toLowerCase(),
      name,
      description,
      imageUrl: '', // POAP proveerá esto después
      eventId: createdDrop.id || 0,
      secretCode,
      expiryDate: expiryDateTime,
      active: true,
      quizTitle: quizTitle || undefined,
      quizSubtitle: quizSubtitle || undefined,
      passingPercentage,
    })

    console.log('Drop saved to database:', savedDrop)

    return NextResponse.json(
      {
        success: true,
        drop: savedDrop,
        eventId: createdDrop.id,
        message: `✓ Drop creado exitosamente y guardado en la base de datos`,
        info: `El drop para el protocolo "${protocolId}" está activo y listo para usar. Los usuarios que pasen el quiz podrán reclamar su POAP automáticamente.`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating drop:', error)
    return NextResponse.json(
      {
        error: 'Failed to create drop',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

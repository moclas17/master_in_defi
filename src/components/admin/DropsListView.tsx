'use client'

/**
 * Component to display and manage all POAP drops
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UploadCodesForm } from '@/components/admin/UploadCodesForm'

interface POAPDrop {
  id: string
  protocolId: string
  name: string
  description?: string
  imageUrl?: string
  eventId: number
  secretCode?: string
  expiryDate: string
  active: boolean
  quizTitle?: string
  quizSubtitle?: string
  passingPercentage: number
  createdAt: string
  updatedAt: string
}

export function DropsListView() {
  const [drops, setDrops] = useState<POAPDrop[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDropId, setExpandedDropId] = useState<string | null>(null)

  useEffect(() => {
    fetchDrops()
  }, [])

  const fetchDrops = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/drops')
      const data = await response.json()

      if (response.ok) {
        setDrops(data.drops)
      } else {
        console.error('Error fetching drops:', data.error)
      }
    } catch (error) {
      console.error('Error fetching drops:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Cargando drops...</div>
      </div>
    )
  }

  if (drops.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-zinc-400 mb-4">
          No hay drops creados aún
        </p>
        <p className="text-sm text-zinc-500">
          Usa el formulario "Crear Nuevo Drop" para comenzar
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {drops.map((drop) => (
        <Card key={drop.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">
                  {drop.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    drop.active
                      ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {drop.active ? 'Activo' : 'Inactivo'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/50 uppercase">
                  {drop.protocolId}
                </span>
              </div>

              {drop.description && (
                <p className="text-zinc-400 text-sm mb-3">
                  {drop.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Event ID</div>
                  <div className="text-white font-medium">{drop.eventId}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Porcentaje Mínimo</div>
                  <div className="text-white font-medium">{drop.passingPercentage}%</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Expira</div>
                  <div className="text-white font-medium text-sm">
                    {formatDate(drop.expiryDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Creado</div>
                  <div className="text-white font-medium text-sm">
                    {formatDate(drop.createdAt)}
                  </div>
                </div>
              </div>

              {drop.quizTitle && (
                <div className="mb-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <div className="text-xs text-zinc-500 mb-1">Quiz Title</div>
                  <div className="text-white text-sm">{drop.quizTitle}</div>
                  {drop.quizSubtitle && (
                    <div className="text-zinc-400 text-xs mt-1">{drop.quizSubtitle}</div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={() => setExpandedDropId(expandedDropId === drop.id ? null : drop.id)}
              variant="secondary"
              size="sm"
            >
              {expandedDropId === drop.id ? 'Ocultar Códigos' : 'Gestionar Códigos'}
            </Button>
          </div>

          {/* Expanded section for code management */}
          {expandedDropId === drop.id && (
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <UploadCodesForm
                dropId={drop.id}
                protocolName={drop.protocolId}
                onSuccess={() => {
                  // Could refresh stats here
                }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

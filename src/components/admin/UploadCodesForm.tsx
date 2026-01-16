'use client'

/**
 * Formulario para subir códigos POAP desde archivo .txt
 */

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface UploadCodesFormProps {
  dropId: string
  protocolName: string
  onSuccess?: () => void
}

interface CodeStats {
  total: number
  claimed: number
  available: number
}

export function UploadCodesForm({ dropId, protocolName, onSuccess }: UploadCodesFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<CodeStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch(`/api/admin/drops/upload-codes?dropId=${dropId}`)
      const data = await response.json()

      if (response.ok && data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage('✗ Por favor selecciona un archivo')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('dropId', dropId)
      formData.append('file', file)

      const response = await fetch('/api/admin/drops/upload-codes', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(
          `✓ ${data.message}\n` +
          `Total procesados: ${data.total}\n` +
          `Insertados: ${data.inserted}\n` +
          `Duplicados (ignorados): ${data.duplicates}`
        )
        setFile(null)
        setStats(data.stats)
        onSuccess?.()

        // Clear file input
        const fileInput = document.getElementById('codesFile') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setMessage(`✗ Error: ${data.error || data.message || 'Failed to upload codes'}`)
      }
    } catch (error) {
      setMessage('✗ Error al subir códigos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-zinc-300 mb-2"

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Subir Códigos POAP</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Protocolo: <span className="font-medium text-white">{protocolName}</span>
          </p>
        </div>

        <Button
          onClick={fetchStats}
          disabled={loadingStats}
          variant="secondary"
          size="sm"
        >
          {loadingStats ? 'Cargando...' : 'Ver Estadísticas'}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-zinc-400 uppercase">Total Códigos</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{stats.available}</div>
            <div className="text-xs text-zinc-400 uppercase">Disponibles</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{stats.claimed}</div>
            <div className="text-xs text-zinc-400 uppercase">Reclamados</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="codesFile" className={labelClass}>
            Archivo de Códigos (.txt) *
          </label>
          <input
            id="codesFile"
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
            required
          />
          <p className="mt-2 text-xs text-zinc-500">
            Sube un archivo .txt con un código por línea. Ejemplo:
          </p>
          <pre className="mt-2 p-3 bg-zinc-900 rounded-lg text-xs text-zinc-400 border border-zinc-700">
{`abc123
def456
ghi789`}
          </pre>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg whitespace-pre-line ${
              message.includes('✗')
                ? 'bg-red-900/20 border border-red-500/50 text-red-400'
                : 'bg-green-900/20 border border-green-500/50 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !file}
          className="w-full"
        >
          {loading ? 'Subiendo códigos...' : 'Subir Códigos'}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ Información Importante</h4>
        <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
          <li>Los códigos se asignan automáticamente cuando un usuario completa el quiz</li>
          <li>Cada código se puede usar una sola vez</li>
          <li>Los códigos duplicados se ignoran automáticamente</li>
          <li>Puedes subir más códigos en cualquier momento</li>
        </ul>
      </div>
    </Card>
  )
}
